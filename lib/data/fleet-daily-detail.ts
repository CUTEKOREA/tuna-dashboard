import 'server-only';

import { createHash } from 'node:crypto';
import { validateFleetDailyDetailPayload, type FleetDailyDetailPayload } from '@/lib/contracts/fleet-daily-api';
import {
  fleetDailyPublicDetailSha256,
  fleetDailyPublicDetailSha256Compat,
  fleetDailyPublicLatest,
} from '@/lib/data/fleet-daily-public';

const MAX_DETAIL_BYTES = 64 * 1024;
let cachedSource: string | null = null;
let cachedDetail: FleetDailyDetailPayload | null = null;

type PublicBinding = {
  latest: typeof fleetDailyPublicLatest;
  detailSha256: string;
  detailSha256Compat?: readonly string[];
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  return value;
}

export function fleetDailyDetailSha256(detail: FleetDailyDetailPayload) {
  return createHash('sha256').update(JSON.stringify(canonicalize(detail)), 'utf8').digest('hex');
}

function assertCurrentPublicAggregate(detail: FleetDailyDetailPayload, current: typeof fleetDailyPublicLatest) {
  const fields: Array<[number | null | string, number | null | string]> = [
    [detail.reportDate, current.reportDate],
    [detail.asOf, current.asOf],
    [detail.pacific.asOf, current.pacific.asOf],
    [detail.pacific.dailyMt, current.pacific.dailyMt],
    [detail.pacific.monthlyMt, current.pacific.monthlyMt],
    [detail.pacific.annualMt, current.pacific.annualMt],
    [detail.atlantic.asOf, current.atlantic.asOf],
    [detail.atlantic.dailyMt, current.atlantic.dailyMt],
    [detail.atlantic.monthlyMt, current.atlantic.monthlyMt],
    [detail.atlantic.annualMt, current.atlantic.annualMt],
    [detail.carrier.loadedTotalMt, current.carrier.loadedTotalMt],
    [detail.carrier.expectedRemainingMt, current.carrier.expectedRemainingMt],
  ];
  if (fields.some(([actual, expected]) => actual !== expected)) {
    throw new Error('fleet detail does not match public aggregate');
  }
}

export function parseFleetDailyDetailSource(source: string, binding: PublicBinding): FleetDailyDetailPayload {
  if (/[\u0000]/.test(source) || Buffer.byteLength(source, 'utf8') > MAX_DETAIL_BYTES) {
    throw new Error('fleet detail is unavailable');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new Error('fleet detail is invalid');
  }
  const detail = validateFleetDailyDetailPayload(parsed);
  assertCurrentPublicAggregate(detail, binding.latest);
  const digest = fleetDailyDetailSha256(detail);
  if (digest !== binding.detailSha256 && !binding.detailSha256Compat?.includes(digest)) {
    throw new Error('fleet detail digest does not match public aggregate');
  }
  return detail;
}

export function getFleetDailyDetail(): FleetDailyDetailPayload {
  const source = process.env.FLEET_DAILY_DETAIL_JSON;
  if (!source) throw new Error('fleet detail is unavailable');
  if (cachedSource === source && cachedDetail) return cachedDetail;
  const detail = parseFleetDailyDetailSource(source, {
    latest: fleetDailyPublicLatest,
    detailSha256: fleetDailyPublicDetailSha256,
    detailSha256Compat: fleetDailyPublicDetailSha256Compat,
  });
  cachedSource = source;
  cachedDetail = detail;
  return detail;
}
