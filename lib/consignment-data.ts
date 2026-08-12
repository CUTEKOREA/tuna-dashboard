export type ConsignmentSourceRow = Record<string, unknown>;

export type ConsignmentLiveResponse = {
  responseJson?: {
    header?: { resultCode?: string; totalCount?: number };
    body?: { item?: ConsignmentSourceRow[] };
  };
};

export type ConsignmentTotals = {
  saleAmount: number;
  saleQty: number;
};

export type ConsignmentAccumulator = {
  months: Record<string, Record<string, ConsignmentTotals>>;
  days: Record<string, Record<string, ConsignmentTotals>>;
  sourceRecordCountsByDay: Record<string, number>;
  sourceRecordCount: number;
  latestAuctionDate: string | null;
};

type ConsignmentStateSlice = {
  sourceRecordCount: number;
  species: Record<string, ConsignmentTotals>;
};

type ConsignmentOfficialMonthState = ConsignmentStateSlice & {
  sourceId: string;
  latestAuctionDate: string;
};

export type ConsignmentSyncState = {
  schemaVersion: 1;
  officialMonths: Record<string, ConsignmentOfficialMonthState>;
  liveDays: Record<string, ConsignmentStateSlice>;
};

type ConsignmentRankedRow = ConsignmentTotals & {
  rank: number;
  seafoodName: string;
  avgUnitPrice: number;
};

type ConsignmentFlatRow = ConsignmentTotals & {
  month: string;
  year: string;
  seafoodName: string;
  avgUnitPrice: number;
};

export type ConsignmentDashboardData = {
  yearlyTop: Record<string, ConsignmentRankedRow[]>;
  monthlyDetail: Record<string, ConsignmentRankedRow[]>;
  items: ConsignmentFlatRow[];
  _meta: {
    years: string[];
    months: string[];
    totalSpecies: number;
    totalRecords: number;
    sourceRowCount: number;
    aggregatedRows: number;
    generatedAt: string;
    samplingBasis: string;
    latestAuctionDate: string;
    checkedThrough: string;
    includedPartialMonth?: string;
    coverageNote: string;
    officialThrough?: string;
    liveFrom?: string;
    liveThrough?: string;
    monthSourceRecordCounts: Record<string, number>;
  };
};

type DashboardBuildOptions = {
  generatedAt: string;
  includedPartialMonth?: string;
  latestAuctionDate?: string;
  monthSourceRecordCounts?: Record<string, number>;
};

const numberValue = (value: unknown): number => {
  const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizedDate = (value: unknown): string | null => {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 8);
  if (!/^\d{8}$/.test(digits)) return null;
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
};

const addTotals = (
  target: Record<string, ConsignmentTotals>,
  seafoodName: string,
  saleAmount: number,
  saleQty: number,
) => {
  const current = target[seafoodName] ?? { saleAmount: 0, saleQty: 0 };
  current.saleAmount += saleAmount;
  current.saleQty += saleQty;
  target[seafoodName] = current;
};

export function createConsignmentAccumulator(): ConsignmentAccumulator {
  return {
    months: {},
    days: {},
    sourceRecordCountsByDay: {},
    sourceRecordCount: 0,
    latestAuctionDate: null,
  };
}

export function parseConsignmentLivePage(
  response: ConsignmentLiveResponse,
): { rows: ConsignmentSourceRow[]; totalCount: number } {
  const header = response.responseJson?.header;
  if (header?.resultCode === '03') return { rows: [], totalCount: 0 };
  if (header?.resultCode !== '00') {
    throw new Error(`Live consignment API returned code ${header?.resultCode ?? 'unknown'}`);
  }

  return {
    rows: Array.isArray(response.responseJson?.body?.item) ? response.responseJson.body.item : [],
    totalCount: Number(header.totalCount ?? 0),
  };
}

export function addConsignmentRows(
  accumulator: ConsignmentAccumulator,
  rows: ConsignmentSourceRow[],
) {
  for (const row of rows) {
    const auctionDate = normalizedDate(row.csmtDe ?? row['위판일자']);
    const seafoodName = String(row.mprcStdCodeNm ?? row['수산물표준코드명'] ?? '').trim();
    if (!auctionDate || !seafoodName) continue;

    const saleAmount = numberValue(row.csmtAmount ?? row['위판금액'] ?? row['총 판매액']);
    const saleQty = numberValue(row.csmtWt ?? row['위판중량'] ?? row['물량(킬로그램)']);
    const month = auctionDate.slice(0, 7);
    accumulator.months[month] ??= {};
    accumulator.days[auctionDate] ??= {};
    addTotals(accumulator.months[month], seafoodName, saleAmount, saleQty);
    addTotals(accumulator.days[auctionDate], seafoodName, saleAmount, saleQty);
    accumulator.sourceRecordCountsByDay[auctionDate] =
      (accumulator.sourceRecordCountsByDay[auctionDate] ?? 0) + 1;
    accumulator.sourceRecordCount += 1;
    if (!accumulator.latestAuctionDate || auctionDate > accumulator.latestAuctionDate) {
      accumulator.latestAuctionDate = auctionDate;
    }
  }
}

export function createConsignmentSyncState(): ConsignmentSyncState {
  return { schemaVersion: 1, officialMonths: {}, liveDays: {} };
}

export function replaceConsignmentOfficialMonth(
  state: ConsignmentSyncState,
  month: string,
  rows: ConsignmentSourceRow[],
  sourceId: string,
) {
  const accumulator = createConsignmentAccumulator();
  addConsignmentRows(accumulator, rows);
  replaceConsignmentOfficialAccumulator(state, month, accumulator, sourceId);
}

export function replaceConsignmentOfficialAccumulator(
  state: ConsignmentSyncState,
  month: string,
  accumulator: ConsignmentAccumulator,
  sourceId: string,
) {
  const matchingDates = Object.keys(accumulator.days).filter((date) => date.startsWith(`${month}-`));
  const sourceRecordCount = matchingDates.reduce(
    (sum, date) => sum + (accumulator.sourceRecordCountsByDay[date] ?? 0),
    0,
  );
  const latestAuctionDate = matchingDates.sort().at(-1) ?? `${month}-01`;

  state.officialMonths[month] = {
    sourceId,
    sourceRecordCount,
    latestAuctionDate,
    species: accumulator.months[month] ?? {},
  };

  for (const date of Object.keys(state.liveDays)) {
    if (date.startsWith(`${month}-`)) delete state.liveDays[date];
  }
}

const dateRange = (startDate: string, endDate: string): string[] => {
  const start = normalizedDate(startDate);
  const end = normalizedDate(endDate);
  if (!start || !end || start > end) throw new Error(`Invalid date range: ${startDate}..${endDate}`);

  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const final = new Date(`${end}T00:00:00Z`);
  while (cursor <= final) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
};

export function replaceConsignmentLiveRange(
  state: ConsignmentSyncState,
  startDate: string,
  endDate: string,
  rows: ConsignmentSourceRow[],
) {
  const accumulator = createConsignmentAccumulator();
  addConsignmentRows(accumulator, rows);
  replaceConsignmentLiveAccumulator(state, startDate, endDate, accumulator);
}

export function replaceConsignmentLiveAccumulator(
  state: ConsignmentSyncState,
  startDate: string,
  endDate: string,
  accumulator: ConsignmentAccumulator,
) {
  const dates = dateRange(startDate, endDate);
  const dateSet = new Set(dates);
  for (const date of dates) {
    state.liveDays[date] = {
      sourceRecordCount: 0,
      species: {},
    };
  }

  for (const [date, species] of Object.entries(accumulator.days)) {
    if (!dateSet.has(date)) continue;
    state.liveDays[date] = {
      sourceRecordCount: accumulator.sourceRecordCountsByDay[date] ?? 0,
      species,
    };
  }
}

export function buildConsignmentDashboardFromState(
  state: ConsignmentSyncState,
  generatedAt: string,
): ConsignmentDashboardData {
  const accumulator = createConsignmentAccumulator();
  const monthSourceRecordCounts: Record<string, number> = {};
  let latestAuctionDate = '';

  for (const [month, snapshot] of Object.entries(state.officialMonths)) {
    accumulator.months[month] = structuredClone(snapshot.species);
    monthSourceRecordCounts[month] = snapshot.sourceRecordCount;
    if (snapshot.latestAuctionDate > latestAuctionDate) latestAuctionDate = snapshot.latestAuctionDate;
  }

  const liveDates = Object.keys(state.liveDays).sort();
  const activeLiveDates: string[] = [];
  for (const date of liveDates) {
    const day = state.liveDays[date];
    if (day.sourceRecordCount === 0 && Object.keys(day.species).length === 0) continue;

    activeLiveDates.push(date);
    const month = date.slice(0, 7);
    accumulator.months[month] ??= {};
    for (const [seafoodName, totals] of Object.entries(day.species)) {
      addTotals(accumulator.months[month], seafoodName, totals.saleAmount, totals.saleQty);
    }
    monthSourceRecordCounts[month] = (monthSourceRecordCounts[month] ?? 0) + day.sourceRecordCount;
    if (date > latestAuctionDate) latestAuctionDate = date;
  }

  const dashboard = buildConsignmentDashboardData(accumulator, {
    generatedAt,
    latestAuctionDate,
    ...(activeLiveDates.length > 0
      ? { includedPartialMonth: activeLiveDates.at(-1)!.slice(0, 7) }
      : {}),
    monthSourceRecordCounts,
  });
  dashboard._meta.checkedThrough = liveDates.at(-1) ?? latestAuctionDate;
  const officialThrough = Object.keys(state.officialMonths).sort().at(-1);
  if (officialThrough) dashboard._meta.officialThrough = officialThrough;
  if (activeLiveDates.length > 0) {
    dashboard._meta.liveFrom = activeLiveDates[0];
    dashboard._meta.liveThrough = activeLiveDates.at(-1);
  }
  return dashboard;
}

const rankedRows = (species: Record<string, ConsignmentTotals>): ConsignmentRankedRow[] =>
  Object.entries(species)
    .sort((left, right) => right[1].saleAmount - left[1].saleAmount || left[0].localeCompare(right[0], 'ko'))
    .map(([seafoodName, totals], index) => ({
      rank: index + 1,
      seafoodName,
      saleAmount: Math.round(totals.saleAmount),
      saleQty: Math.round(totals.saleQty * 1000) / 1000,
      avgUnitPrice: totals.saleQty > 0 ? Math.round(totals.saleAmount / totals.saleQty) : 0,
    }));

export function buildConsignmentDashboardData(
  accumulator: ConsignmentAccumulator,
  options: DashboardBuildOptions,
): ConsignmentDashboardData {
  const months = Object.keys(accumulator.months).sort();
  const yearlySpecies: Record<string, Record<string, ConsignmentTotals>> = {};
  const monthlyDetail: Record<string, ConsignmentRankedRow[]> = {};
  const items: ConsignmentFlatRow[] = [];
  const allSpecies = new Set<string>();

  for (const month of months) {
    const year = month.slice(0, 4);
    yearlySpecies[year] ??= {};
    const ranked = rankedRows(accumulator.months[month]);
    monthlyDetail[month] = ranked.slice(0, 30);

    for (const row of ranked) {
      allSpecies.add(row.seafoodName);
      addTotals(yearlySpecies[year], row.seafoodName, row.saleAmount, row.saleQty);
      items.push({
        month,
        year,
        seafoodName: row.seafoodName,
        saleAmount: row.saleAmount,
        saleQty: row.saleQty,
        avgUnitPrice: row.avgUnitPrice,
      });
    }
  }

  const yearlyTop = Object.fromEntries(
    Object.entries(yearlySpecies)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([year, species]) => [year, rankedRows(species).slice(0, 30)]),
  );
  const monthSourceRecordCounts = options.monthSourceRecordCounts ?? {};
  const countedRecords = Object.values(monthSourceRecordCounts).reduce((sum, count) => sum + count, 0);
  const latestAuctionDate = options.latestAuctionDate ?? accumulator.latestAuctionDate ?? '';

  return {
    yearlyTop,
    monthlyDetail,
    items,
    _meta: {
      years: Object.keys(yearlyTop).sort(),
      months,
      totalSpecies: allSpecies.size,
      totalRecords: items.length,
      sourceRowCount: countedRecords || accumulator.sourceRecordCount,
      aggregatedRows: items.length,
      generatedAt: options.generatedAt,
      samplingBasis: '해양수산부 위탁판매 일자별 전체 거래 월별 누적',
      latestAuctionDate,
      checkedThrough: latestAuctionDate,
      ...(options.includedPartialMonth ? { includedPartialMonth: options.includedPartialMonth } : {}),
      coverageNote: latestAuctionDate
        ? `${latestAuctionDate} 위판일자까지 공개된 전체 거래 반영`
        : '공개 위판일자 없음',
      monthSourceRecordCounts,
    },
  };
}

type FreshnessMeta = {
  latestAuctionDate?: string;
  checkedThrough?: string;
  generatedAt?: string;
};

const koreaCalendarDay = (date: Date): number => {
  const shifted = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return Math.floor(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) / 86_400_000);
};

export function getConsignmentFreshness(
  meta: FreshnessMeta,
  now = new Date(),
): { status: 'synced' | 'stale' | 'offline'; ageDays: number | null } {
  const freshnessDate = normalizedDate(meta.checkedThrough ?? meta.latestAuctionDate);
  if (!freshnessDate) return { status: 'offline', ageDays: null };

  const [year, month, day] = freshnessDate.split('-').map(Number);
  const freshnessCalendarDay = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  const ageDays = Math.max(0, koreaCalendarDay(now) - freshnessCalendarDay);
  return { status: ageDays <= 2 ? 'synced' : 'stale', ageDays };
}

export function getConsignmentNetworkPresentation(status: string): {
  label: 'LIVE' | 'SYNCED' | 'STALE' | 'STANDBY' | 'OFFLINE';
  tone: 'success' | 'warning' | 'danger';
} {
  if (status === 'online') return { label: 'LIVE', tone: 'success' };
  if (status === 'synced') return { label: 'SYNCED', tone: 'success' };
  if (status === 'stale') return { label: 'STALE', tone: 'warning' };
  if (status === 'standby') return { label: 'STANDBY', tone: 'warning' };
  return { label: 'OFFLINE', tone: 'danger' };
}
