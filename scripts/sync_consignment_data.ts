#!/usr/bin/env node

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  addConsignmentRows,
  buildConsignmentDashboardFromState,
  createConsignmentAccumulator,
  createConsignmentSyncState,
  parseConsignmentLivePage,
  replaceConsignmentLiveAccumulator,
  replaceConsignmentOfficialAccumulator,
  type ConsignmentSourceRow,
  type ConsignmentLiveResponse,
  type ConsignmentSyncState,
} from '../lib/consignment-data.ts';
import { createRoundRobinThrottle } from '../lib/request-throttle.ts';
import { requireEnv } from '../app/api/_shared/env';

const PRIMARY_SERVICE_KEY = () => requireEnv('FISHERY_API_KEY');
const SECONDARY_SERVICE_KEY = () => requireEnv('DATA_GO_KR_NEW_KEY');
const LIVE_SERVICE_KEYS = [...new Set([PRIMARY_SERVICE_KEY(), SECONDARY_SERVICE_KEY()])];
const MONTHLY_OAS_URL = 'https://infuser.odcloud.kr/oas/docs?namespace=15102794/v1';
const ODCLOUD_BASE_URL = 'https://api.odcloud.kr/api';
const LIVE_API_URL = 'https://apis.data.go.kr/1192000/select0040List/getselect0040List';
const FIRST_MONTH = '2024-01';
const ODCLOUD_PAGE_SIZE = 5_000;
const LIVE_PAGE_SIZE = 100;
const ROOT = process.cwd();
const STATE_PATH = join(ROOT, 'public', 'data', 'consignment_sync_state.json');
const OUTPUT_PATH = join(ROOT, 'public', 'data', 'consignment_3year.json');
const liveRequestThrottle = createRoundRobinThrottle(LIVE_SERVICE_KEYS, 250);

type MonthlyEndpoint = { month: string; snapshotDate: string; path: string };

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const dateInKorea = (date = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const timestampInKorea = (date = new Date()): string => {
  const shifted = new Date(date.getTime() + 9 * 60 * 60 * 1_000);
  return shifted.toISOString().replace('Z', '+09:00');
};

const compactDate = (date: string) => date.replace(/-/g, '');

const addDays = (date: string, amount: number): string => {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + amount);
  return parsed.toISOString().slice(0, 10);
};

const monthAfter = (month: string): string => {
  const parsed = new Date(`${month}-01T00:00:00Z`);
  parsed.setUTCMonth(parsed.getUTCMonth() + 1);
  return parsed.toISOString().slice(0, 7);
};

const datesBetween = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  for (let cursor = startDate; cursor <= endDate; cursor = addDays(cursor, 1)) dates.push(cursor);
  return dates;
};

const atomicJsonWrite = async (path: string, value: unknown) => {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, path);
};

const readState = async (): Promise<ConsignmentSyncState> => {
  try {
    const parsed = JSON.parse(await readFile(STATE_PATH, 'utf8')) as ConsignmentSyncState;
    if (parsed.schemaVersion !== 1 || !parsed.officialMonths || !parsed.liveDays) {
      throw new Error('unsupported state schema');
    }
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return createConsignmentSyncState();
    throw error;
  }
};

const fetchJson = async <T>(url: URL | string, label: string): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) {
        const responseError = new Error(`HTTP ${response.status}`) as Error & { status?: number };
        responseError.status = response.status;
        throw responseError;
      }
      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt < 4) {
        const status = (error as { status?: number }).status;
        await delay(status === 429 ? 3_000 * attempt : 500 * 2 ** (attempt - 1));
      }
    }
  }
  throw new Error(`${label} failed after retries: ${String(lastError)}`);
};

const inBatches = async <T>(
  values: number[],
  concurrency: number,
  task: (value: number) => Promise<T>,
): Promise<T[]> => {
  const results: T[] = [];
  for (let index = 0; index < values.length; index += concurrency) {
    results.push(...(await Promise.all(values.slice(index, index + concurrency).map(task))));
  }
  return results;
};

const discoverMonthlyEndpoints = async (today: string): Promise<MonthlyEndpoint[]> => {
  const specification = await fetchJson<{ paths?: Record<string, { get?: { summary?: string } }> }>(
    MONTHLY_OAS_URL,
    'monthly endpoint discovery',
  );
  const endpoints: MonthlyEndpoint[] = [];
  for (const [path, definition] of Object.entries(specification.paths ?? {})) {
    const match = definition.get?.summary?.match(/_(\d{8})$/);
    if (!match) continue;
    const snapshotDate = `${match[1].slice(0, 4)}-${match[1].slice(4, 6)}-${match[1].slice(6, 8)}`;
    const month = snapshotDate.slice(0, 7);
    if (month >= FIRST_MONTH && snapshotDate <= today) endpoints.push({ month, snapshotDate, path });
  }
  return endpoints.sort((left, right) => left.month.localeCompare(right.month));
};

const odcloudUrl = (path: string, page: number): URL => {
  const url = new URL(`${ODCLOUD_BASE_URL}${path}`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('perPage', String(ODCLOUD_PAGE_SIZE));
  url.searchParams.set('serviceKey', PRIMARY_SERVICE_KEY());
  return url;
};

const fetchOfficialMonth = async (endpoint: MonthlyEndpoint) => {
  type Response = { data?: ConsignmentSourceRow[]; totalCount?: number };
  const first = await fetchJson<Response>(odcloudUrl(endpoint.path, 1), `official month ${endpoint.month} page 1`);
  const totalCount = Number(first.totalCount ?? 0);
  if (totalCount <= 0 || !Array.isArray(first.data)) throw new Error(`Official month ${endpoint.month} returned no data`);

  const accumulator = createConsignmentAccumulator();
  addConsignmentRows(accumulator, first.data);
  const pages = Math.ceil(totalCount / ODCLOUD_PAGE_SIZE);
  const pageNumbers = Array.from({ length: Math.max(0, pages - 1) }, (_, index) => index + 2);
  const responses = await inBatches(pageNumbers, 6, (page) =>
    fetchJson<Response>(odcloudUrl(endpoint.path, page), `official month ${endpoint.month} page ${page}`),
  );
  let returnedCount = first.data.length;
  for (const response of responses) {
    if (!Array.isArray(response.data)) throw new Error(`Official month ${endpoint.month} returned malformed page`);
    returnedCount += response.data.length;
    addConsignmentRows(accumulator, response.data);
  }
  if (returnedCount !== totalCount) {
    throw new Error(`Official month ${endpoint.month} incomplete: ${returnedCount}/${totalCount}`);
  }
  return accumulator;
};

const liveUrl = (date: string, page: number, serviceKey: string): URL => {
  const url = new URL(LIVE_API_URL);
  url.searchParams.set('serviceKey', serviceKey);
  url.searchParams.set('pageNo', String(page));
  url.searchParams.set('numOfRows', String(LIVE_PAGE_SIZE));
  url.searchParams.set('type', 'json');
  url.searchParams.set('baseDt', compactDate(date));
  return url;
};

const fetchLiveJson = async <T>(date: string, page: number, label: string): Promise<T> => {
  const serviceKey = await liveRequestThrottle.acquire();
  return fetchJson<T>(liveUrl(date, page, serviceKey), label);
};

const fetchLiveDayOnce = async (date: string) => {
  const firstResponse = await fetchLiveJson<ConsignmentLiveResponse>(date, 1, `live day ${date} page 1`);
  const { rows: firstRows, totalCount } = parseConsignmentLivePage(firstResponse);
  const accumulator = createConsignmentAccumulator();
  addConsignmentRows(accumulator, firstRows);
  const pages = Math.ceil(totalCount / LIVE_PAGE_SIZE);
  const pageNumbers = Array.from({ length: Math.max(0, pages - 1) }, (_, index) => index + 2);
  let returnedCount = firstRows.length;

  for (let index = 0; index < pageNumbers.length; index += 20) {
    const batch = pageNumbers.slice(index, index + 20);
    const responses = await Promise.all(
      batch.map((page) => fetchLiveJson<ConsignmentLiveResponse>(date, page, `live day ${date} page ${page}`)),
    );
    for (const response of responses) {
      const { rows } = parseConsignmentLivePage(response);
      returnedCount += rows.length;
      addConsignmentRows(accumulator, rows);
    }
  }
  return { accumulator, totalCount, returnedCount };
};

const fetchLiveDay = async (date: string) => {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const result = await fetchLiveDayOnce(date);
    if (result.returnedCount === result.totalCount) return result.accumulator;
    if (attempt < 2) await delay(1_000);
  }
  throw new Error(`Live day ${date} changed while paging; retry on the next sync`);
};

const main = async () => {
  const today = process.env.CONSIGNMENT_TODAY || dateInKorea();
  const state = await readState();
  const endpoints = await discoverMonthlyEndpoints(today);

  for (const endpoint of endpoints) {
    const existing = state.officialMonths[endpoint.month];
    const sourceId = endpoint.path.replace(/^\//, '');
    if (existing?.sourceId === sourceId) continue;
    process.stdout.write(`Official ${endpoint.month}: fetching ${sourceId}\n`);
    const accumulator = await fetchOfficialMonth(endpoint);
    replaceConsignmentOfficialAccumulator(state, endpoint.month, accumulator, sourceId);
    await atomicJsonWrite(STATE_PATH, state);
  }

  const officialMonths = Object.keys(state.officialMonths).sort();
  if (officialMonths.length === 0) throw new Error('No official monthly snapshots are available');
  const firstLiveDate = `${monthAfter(officialMonths.at(-1)!)}-01`;
  const expectedLiveDates = firstLiveDate <= today ? datesBetween(firstLiveDate, today) : [];
  const earliestMissing = expectedLiveDates.find((date) => !state.liveDays[date]);
  const latestLiveDate = Object.keys(state.liveDays).sort().at(-1);
  const refreshStart = earliestMissing ?? (latestLiveDate ? addDays(latestLiveDate, -2) : firstLiveDate);

  for (const date of expectedLiveDates.filter((candidate) => candidate >= refreshStart)) {
    process.stdout.write(`Live ${date}: fetching all published transactions\n`);
    const accumulator = await fetchLiveDay(date);
    replaceConsignmentLiveAccumulator(state, date, date, accumulator);
    await atomicJsonWrite(STATE_PATH, state);
  }

  const dashboard = buildConsignmentDashboardFromState(state, timestampInKorea());
  await atomicJsonWrite(OUTPUT_PATH, dashboard);
  process.stdout.write(
    `Saved ${dashboard._meta.months[0]}..${dashboard._meta.latestAuctionDate}, ` +
      `${dashboard._meta.totalRecords.toLocaleString()} month-species rows, ` +
      `${dashboard._meta.totalSpecies.toLocaleString()} species\n`,
  );
};

await main();
