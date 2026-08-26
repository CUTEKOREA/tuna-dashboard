// 부산 입출항선 동향 인테이크 모듈 (ADR-0005) - /port-intel 위젯의 유일한 데이터 통로.
// 원자료: 해양수산3팀 주간 통합본 -> scripts/sync_busan_port.py -> data/busan_port_calls.json
// 주의: 선장 실명은 파이프라인에서 제거된다 (개인정보 최소화). 교대는 건수·bool 만 유지.
import raw from '../../data/busan_port_calls.json';

export const BUSAN_VESSEL_TYPES = ['연승', '선망', '북양'] as const;
export type BusanVesselType = (typeof BUSAN_VESSEL_TYPES)[number];

export interface BusanPortRun {
  ship: string;
  co: string;
  type: string;
  arrive: string | null;
  depart: string | null;
  open: boolean;
  own: boolean;
  days: number | null;
  carry: boolean;
  note: string;
}

export interface BusanMonthlyRow {
  m: number;
  i: number;
  o: number;
  iBy: number[]; // TYPES 순서 (연승·선망·북양)
  oBy: number[];
}

export interface BusanStayStat {
  n: number;
  avg: number | null;
  avg90: number | null;
  med: number | null;
  min: number | null;
  max: number | null;
  long: number;
}

export interface BusanWeeklyIn {
  ship: string;
  co: string;
  type: string;
  arrive: string | null;
  own: boolean;
}

export interface BusanWeeklyOut {
  ship: string;
  co: string;
  type: string;
  depart: string | null;
  days: number | null;
  change: boolean;
  own: boolean;
}

export interface BusanPortData {
  asof: string;
  sourceNote: string;
  mailCount: number | null;
  years: number[];
  kpi: {
    runs: Record<string, number>;
    carry: Record<string, number>;
    byType: Record<string, Record<string, number>>;
    own: Record<string, number>;
    changes: Record<string, number>;
    openNow: number;
    waiting: Record<string, number>;
    forecast: { n: number; dec: number } | null;
  };
  weekly: {
    w0: string;
    w1: string;
    in: BusanWeeklyIn[];
    out: BusanWeeklyOut[];
    prev: { in: number; out: number; chg: number };
  };
  monthly: Record<string, BusanMonthlyRow[]>;
  stay: Record<string, Record<string, BusanStayStat>>;
  timeline: BusanPortRun[];
}

const data = raw as unknown as BusanPortData;

export function getBusanPortData(): BusanPortData {
  return data;
}

/** 최신 연도 (문서 기준 연도) */
export function getBusanLatestYear(): number {
  return data.years[0];
}

/** 월별 입출항 + 전년 동월 병기 (YoY 위젯용) */
export function getBusanMonthlySeries(): Array<{
  month: string;
  입항: number;
  출항: number;
  전년입항: number | null;
  전년출항: number | null;
}> {
  const latest = String(getBusanLatestYear());
  const prev = String(getBusanLatestYear() - 1);
  const cur = data.monthly[latest] ?? [];
  const before = data.monthly[prev] ?? [];
  return cur.map((row, index) => ({
    month: `${row.m}월`,
    입항: row.i,
    출항: row.o,
    전년입항: before[index]?.i ?? null,
    전년출항: before[index]?.o ?? null,
  }));
}

/** 업종별 체류 통계 (최신 연도 + 전년 비교) */
export function getBusanStayComparison(): Array<{
  type: string;
  avg: number | null;
  avg90: number | null;
  prevAvg90: number | null;
  n: number;
  long: number;
  med: number | null;
}> {
  const latest = String(getBusanLatestYear());
  const prev = String(getBusanLatestYear() - 1);
  return BUSAN_VESSEL_TYPES.map((type) => {
    const cur = data.stay[latest]?.[type];
    const before = data.stay[prev]?.[type];
    return {
      type,
      avg: cur?.avg ?? null,
      avg90: cur?.avg90 ?? null,
      prevAvg90: before?.avg90 ?? null,
      n: cur?.n ?? 0,
      long: cur?.long ?? 0,
      med: cur?.med ?? null,
    };
  });
}
