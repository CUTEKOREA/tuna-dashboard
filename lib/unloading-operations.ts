export type VesselStatusKind = 'progress' | 'waiting' | 'completed';

type VesselChoice = {
  id: string;
  status: string;
};

type UnloadingTimelineInput = {
  date: string;
  dailyAmount: number;
  cumAmount: number;
};

export type ContinuousUnloadingChartPoint = {
  name: string;
  dailyAmount: number;
  cumulativeAmount: number;
  isNoWorkDay: boolean;
};

const DAY_MS = 86_400_000;

export function getVesselStatusKind(status: string): VesselStatusKind {
  const normalized = status.trim().toLowerCase();

  if (normalized.includes('하역대기') || normalized.includes('waiting')) {
    return 'waiting';
  }
  if (
    normalized.includes('하역중') ||
    normalized.includes('진행') ||
    normalized.includes('progress')
  ) {
    return 'progress';
  }
  return 'completed';
}

export function resolveSelectedVesselId(
  vessels: VesselChoice[],
  requestedId?: string,
): string | null {
  if (requestedId && vessels.some((vessel) => vessel.id === requestedId)) {
    return requestedId;
  }
  return vessels.find((vessel) => getVesselStatusKind(vessel.status) === 'progress')?.id
    ?? vessels.find((vessel) => getVesselStatusKind(vessel.status) === 'waiting')?.id
    ?? vessels[0]?.id
    ?? null;
}

function utcDay(year: number, month: number, day: number): number | null {
  const value = Date.UTC(year, month - 1, day);
  const date = new Date(value);
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
    ? value
    : null;
}

function monthDayLabel(utc: number): string {
  const date = new Date(utc);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}

function parseTimelineSpan(
  label: string,
  startYear: number,
  endYear: number,
  rangeStartMonth: number,
): { start: number; end: number } | null {
  const [rawStart, rawEnd] = label.split('~').map((part) => part.trim());
  const startMatch = rawStart.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!startMatch) return null;

  const startMonth = Number(startMatch[1]);
  const startDay = Number(startMatch[2]);
  const endMatch = rawEnd?.match(/^(\d{1,2})\/(\d{1,2})$/);
  const endDayOnly = rawEnd?.match(/^(\d{1,2})$/);
  const endMonth = endMatch ? Number(endMatch[1]) : startMonth;
  const endDay = endMatch ? Number(endMatch[2]) : endDayOnly ? Number(endDayOnly[1]) : startDay;
  const yearForMonth = (month: number) => endYear > startYear && month < rangeStartMonth
    ? endYear
    : startYear;
  const spanStartYear = yearForMonth(startMonth);
  const spanEndYear = endMonth < startMonth && endYear === startYear
    ? spanStartYear + 1
    : yearForMonth(endMonth);
  const start = utcDay(spanStartYear, startMonth, startDay);
  const end = utcDay(spanEndYear, endMonth, endDay);
  return start !== null && end !== null && end >= start ? { start, end } : null;
}

export function buildContinuousUnloadingChartData(
  timeline: UnloadingTimelineInput[],
  dateRange: string,
): ContinuousUnloadingChartPoint[] {
  const rangeDates = [...dateRange.matchAll(/(20\d{2})\.(\d{2})\.(\d{2})/g)];
  const firstRangeDate = rangeDates[0];
  if (!firstRangeDate) return [];

  const startYear = Number(firstRangeDate[1]);
  const endYear = rangeDates[1] ? Number(rangeDates[1][1]) : startYear;
  const rangeStartMonth = Number(firstRangeDate[2]);
  const workedEntries = timeline
    .map((entry, index) => ({
      entry,
      index,
      span: entry.dailyAmount > 0
        ? parseTimelineSpan(entry.date, startYear, endYear, rangeStartMonth)
        : null,
    }))
    .filter((item): item is {
      entry: UnloadingTimelineInput;
      index: number;
      span: { start: number; end: number };
    } => item.span !== null)
    .sort((a, b) => a.span.end - b.span.end || a.index - b.index);
  if (workedEntries.length === 0) return [];

  const coveredDays = new Set<number>();
  const entriesByEnd = new Map<number, typeof workedEntries>();
  for (const item of workedEntries) {
    for (let day = item.span.start; day <= item.span.end; day += DAY_MS) {
      coveredDays.add(day);
    }
    const sameDay = entriesByEnd.get(item.span.end) ?? [];
    sameDay.push(item);
    entriesByEnd.set(item.span.end, sameDay);
  }

  const firstDay = Math.min(...workedEntries.map((item) => item.span.start));
  const lastDay = Math.max(...workedEntries.map((item) => item.span.end));
  const result: ContinuousUnloadingChartPoint[] = [];
  let cumulativeAmount = 0;

  for (let day = firstDay; day <= lastDay; day += DAY_MS) {
    const entries = entriesByEnd.get(day) ?? [];
    if (entries.length > 0) {
      const dailyAmount = entries.reduce((sum, { entry }) => sum + entry.dailyAmount, 0);
      cumulativeAmount = Math.max(
        cumulativeAmount,
        ...entries.map(({ entry }) => entry.cumAmount),
      );
      result.push({
        name: entries.length === 1 ? entries[0].entry.date : monthDayLabel(day),
        dailyAmount,
        cumulativeAmount,
        isNoWorkDay: false,
      });
      continue;
    }
    if (coveredDays.has(day)) continue;

    result.push({
      name: monthDayLabel(day),
      dailyAmount: 0,
      cumulativeAmount,
      isNoWorkDay: true,
    });
  }

  return result;
}

export function getUnloadingEtaLabel(
  status: string,
  remaining: number,
  estimatedDays: number,
): string {
  if (getVesselStatusKind(status) === 'waiting') return '하역 실적 대기';
  return remaining > 0 ? `+${estimatedDays}일 필요` : '하역 완료';
}

/* ── 일평균 정의 (2026-08-17 SSOT) ─────────────────────────────────────────
   같은 «일평균»이 화면마다 다른 분모로 계산되던 것을 이름으로 갈라 고정한다.
   두 값은 서로 다른 질문에 답한다 — 통일 대상이 아니라 구분 대상.
   조정분(음수 보정)이 낀 항차는 누계÷횟수와 갈라질 수 있다 — 일일 보고값 합을 쓴다. */

type DailyReport = { dailyAmount: number };

/** 보고일 전체 기준 일평균 — 휴무 포함 «달력 진행 속도». 완료 예상일 산출용. */
export function avgPerReportDay(timeline: DailyReport[]): number | null {
  if (timeline.length === 0) return null;
  return timeline.reduce((sum, entry) => sum + entry.dailyAmount, 0) / timeline.length;
}

/** 양수 작업일 기준 일평균 — 휴무 제외 «하역 능력». 효율 비교용. */
export function avgPerWorkedDay(timeline: DailyReport[]): number | null {
  const worked = timeline.filter((entry) => entry.dailyAmount > 0);
  if (worked.length === 0) return null;
  return worked.reduce((sum, entry) => sum + entry.dailyAmount, 0) / worked.length;
}
