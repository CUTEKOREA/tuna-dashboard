import rawBangkokWeeklyKpi from '../../public/data/bangkok_weekly_kpi.json';
import rawPayload from '../../public/data/bangkok_weekly_payload.json';

export type BangkokWeeklyKpi = {
  readonly period: string;
  readonly weeks: number;
  readonly latestPrice: number;
  readonly stockMt: number;
  readonly processDays: number;
  readonly cumUnloadMt: number;
  readonly highSaltUsd: number;
};

const PERIOD_PATTERN = /^\d{4}\.\d{2}~\d{4}\.\d{2}$/;

function recordAt(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('방콕 주간보고 KPI는 객체여야 합니다.');
  }
  return value as Record<string, unknown>;
}

function positiveIntegerAt(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) {
    throw new Error(`${field}는 0보다 큰 정수여야 합니다.`);
  }
  return value as number;
}

export function parseBangkokWeeklyKpi(value: unknown): BangkokWeeklyKpi {
  const record = recordAt(value);
  if (typeof record.period !== 'string' || !PERIOD_PATTERN.test(record.period)) {
    throw new Error('period는 YYYY.MM~YYYY.MM 형식이어야 합니다.');
  }

  return {
    period: record.period,
    weeks: positiveIntegerAt(record.weeks, 'weeks'),
    latestPrice: positiveIntegerAt(record.latestPrice, 'latestPrice'),
    stockMt: positiveIntegerAt(record.stockMt, 'stockMt'),
    processDays: positiveIntegerAt(record.processDays, 'processDays'),
    cumUnloadMt: positiveIntegerAt(record.cumUnloadMt, 'cumUnloadMt'),
    highSaltUsd: positiveIntegerAt(record.highSaltUsd, 'highSaltUsd'),
  };
}

export const bangkokWeeklyKpi = parseBangkokWeeklyKpi(rawBangkokWeeklyKpi);

/* ────────────────────────────────────────────────────────────────────────────
 * 주간보고 payload 인테이크 — 네이티브 탭 대시보드의 유일한 데이터 통로 (ADR 0005).
 * 원본: 방콕 주간보고 종합분석 HTML의 <script id="payload"> JSON
 * (scripts/sync_bangkok_report.py 가 추출·검증해 public/data/bangkok_weekly_payload.json 생성).
 * 구조 검증은 sync 스크립트가 fail-closed로 수행하므로 여기서는 형태 변환과
 * 핵심 불변식(주차 수·기간 일치)만 확인한다.
 * ──────────────────────────────────────────────────────────────────────────── */

/** 주간 시계열 1행 — null 은 해당 주 보고서에 값이 없던 것 (보간하지 않는다) */
export type BangkokWeek = {
  readonly date: string;
  readonly year: number;
  readonly month: number;
  /** 원어 시세 ($/MT) */
  readonly price: number | null;
  /** 시세 이상치 의심 플래그 (이웃 중앙값 대비 급변) */
  readonly suspect: boolean;
  readonly unloadVessels: number | null;
  readonly unloadMt: number | null;
  readonly bkkUtil: number | null;
  readonly bkkStockMt: number | null;
  readonly bkkDays: number | null;
  readonly sklUtil: number | null;
  readonly sklStockMt: number | null;
  readonly sklDays: number | null;
  readonly rejCases: number;
  readonly rejMt: number;
  readonly saltCases: number;
  readonly saltUsd: number;
};

export const bangkokWeeks: readonly BangkokWeek[] = rawPayload.series.map((r) => ({
  date: r.date,
  year: r.y,
  month: r.m,
  price: r.price,
  suspect: Boolean(r.suspect),
  unloadVessels: r.unload_v,
  unloadMt: r.unload_mt,
  bkkUtil: r.bkk_util,
  bkkStockMt: r.bkk_stock,
  bkkDays: r.bkk_days,
  sklUtil: r.skl_util,
  sklStockMt: r.skl_stock,
  sklDays: r.skl_days,
  rejCases: r.rej_cases ?? 0,
  rejMt: r.rej_mt ?? 0,
  saltCases: r.salt_cases ?? 0,
  saltUsd: r.salt_usd ?? 0,
}));

if (bangkokWeeks.length !== bangkokWeeklyKpi.weeks) {
  throw new Error(
    `payload 주차 수(${bangkokWeeks.length})와 KPI weeks(${bangkokWeeklyKpi.weeks})가 다릅니다 — 두 산출물의 원본 세대가 어긋났습니다.`,
  );
}

/** 연도별 집계 */
export type BangkokYear = {
  readonly year: number;
  readonly weeks: number;
  readonly priceAvg: number;
  readonly priceMin: number;
  readonly priceMax: number;
  readonly bkkUtilAvg: number;
  readonly bkkStockAvg: number;
  readonly bkkStockEnd: number;
  readonly bkkDaysAvg: number;
  readonly unloadTotalMt: number;
  readonly shipsTotal: number;
  readonly rejCases: number;
  readonly rejMt: number;
  readonly saltCases: number;
  readonly saltUsd: number;
};

export const bangkokYearly: readonly BangkokYear[] = Object.entries(rawPayload.yearly)
  .map(([year, y]) => ({
    year: Number(year),
    weeks: y.weeks,
    priceAvg: y.price_avg,
    priceMin: y.price_min,
    priceMax: y.price_max,
    bkkUtilAvg: y.bkk_util_avg,
    bkkStockAvg: y.bkk_stock_avg,
    bkkStockEnd: y.bkk_stock_end,
    bkkDaysAvg: y.bkk_days_avg,
    unloadTotalMt: y.unload_total,
    shipsTotal: y.ships_total,
    rejCases: y.rej_cases,
    rejMt: y.rej_mt,
    saltCases: y.salt_cases,
    saltUsd: y.salt_usd,
  }))
  .sort((a, b) => a.year - b.year);

/* ── 트레이더 ────────────────────────────────────────────────────────────── */

export const BANGKOK_TRADERS = ['FCF', 'ITOCHU', 'TRI MARINE', 'DIRECT', 'MALDIVES'] as const;
export type BangkokTrader = (typeof BANGKOK_TRADERS)[number];

/** 화면 노출용 한글 라벨 (L-01) */
export const TRADER_LABELS: Record<BangkokTrader, string> = {
  FCF: 'FCF',
  ITOCHU: '이토추',
  'TRI MARINE': '트라이마린',
  DIRECT: '직거래',
  MALDIVES: '몰디브',
};

export type BangkokTraderMonth = {
  readonly month: string;
  readonly volumes: Record<BangkokTrader, number>;
  readonly ships: Record<BangkokTrader, number>;
  readonly totalCalc: number;
  readonly totalReported: number | null;
};

export const bangkokTraderMonthly: readonly BangkokTraderMonth[] = Object.entries(
  rawPayload.traderMonthly as Record<string, Record<string, unknown>>,
)
  .map(([month, m]) => ({
    month,
    volumes: Object.fromEntries(
      BANGKOK_TRADERS.map((t) => [t, Number(m[t] ?? 0)]),
    ) as Record<BangkokTrader, number>,
    ships: Object.fromEntries(
      BANGKOK_TRADERS.map((t) => [t, Number((m.ships as Record<string, number> | undefined)?.[t] ?? 0)]),
    ) as Record<BangkokTrader, number>,
    totalCalc: Number(m.total_calc ?? 0),
    totalReported: typeof m.total_reported === 'number' ? m.total_reported : null,
  }))
  .sort((a, b) => a.month.localeCompare(b.month));

export type BangkokTraderYear = {
  readonly year: number;
  readonly volumes: Record<BangkokTrader, number>;
  readonly totalMt: number;
  readonly ships: number;
  readonly months: number;
};

export const bangkokTraderAnnual: readonly BangkokTraderYear[] = Object.entries(
  rawPayload.traderAnnual as Record<string, Record<string, number>>,
)
  .map(([year, y]) => ({
    year: Number(year),
    volumes: Object.fromEntries(
      BANGKOK_TRADERS.map((t) => [t, Number(y[t] ?? 0)]),
    ) as Record<BangkokTrader, number>,
    totalMt: y.total,
    ships: y.ships,
    months: y.months,
  }))
  .sort((a, b) => a.year - b.year);

/* ── 캐너리 ─────────────────────────────────────────────────────────────── */

export type BangkokCannery = {
  readonly name: string;
  readonly region: string;
  /** 주간 가동 (톤/일) */
  readonly current: number | null;
  readonly max: number | null;
  readonly utilPct: number | null;
  readonly capacityMt: number | null;
  readonly stockMt: number | null;
  readonly days: number | null;
};

export const bangkokCanneries: readonly BangkokCannery[] = rawPayload.snapshot.map((s) => ({
  name: s.name,
  region: s.region,
  current: s.current,
  max: s.max,
  utilPct: s.util,
  capacityMt: s.capa,
  stockMt: s.stock,
  days: s.days,
}));

/** 재고 점유율 (%) — snapshot 시점 총재고 대비 비중 (합계 ≈ 100) */
export const bangkokStockShare: readonly { name: string; sharePct: number }[] = Object.entries(
  rawPayload.stockShare as Record<string, number>,
).map(([name, sharePct]) => ({ name, sharePct }));

export type BangkokCanneryTrendYear = { cur: number | null; util: number | null; stock: number | null };

/** 캐너리별 연도 추이 (연평균 가동·가동률·재고) */
export const bangkokCanneryTrend: readonly {
  name: string;
  years: Record<string, BangkokCanneryTrendYear>;
}[] = Object.entries(rawPayload.canneryTrend as Record<string, Record<string, BangkokCanneryTrendYear>>).map(
  ([name, years]) => ({ name, years }),
);

/* ── 상관·계절성 ────────────────────────────────────────────────────────── */

export const CORR_METRIC_LABELS: Record<string, string> = {
  bkk_stock: '방콕 재고',
  bkk_util: '방콕 가동률',
  bkk_days: '가공가능일수',
  unload_mt: '하역 물량',
};

export type BangkokCorrLag = { lagWeeks: number; r: number | null; n: number };

/** 지표별 시세 선행 상관 (lag 0·4·8·13·26주) */
export const bangkokCorr: readonly { metric: string; label: string; lags: BangkokCorrLag[] }[] =
  Object.entries(rawPayload.corr as unknown as Record<string, Record<string, [number | null, number]>>).map(
    ([metric, lags]) => ({
      metric,
      label: CORR_METRIC_LABELS[metric] ?? metric,
      lags: Object.entries(lags)
        .map(([lag, [r, n]]) => ({ lagWeeks: Number(lag), r, n }))
        .sort((a, b) => a.lagWeeks - b.lagWeeks),
    }),
  );

/** 월별 평균 하역 물량 (MT) — 계절성 */
export const bangkokSeasonality: readonly { month: number; unloadMt: number }[] = Object.entries(
  rawPayload.seasonality as Record<string, number>,
)
  .map(([month, unloadMt]) => ({ month: Number(month), unloadMt }))
  .sort((a, b) => a.month - b.month);

/* ── 품질 클레임 (High Salt / Rejection) ────────────────────────────────── */

export type BangkokClaimsYear = {
  readonly year: number;
  readonly saltPublished: number;
  readonly saltUnique: number;
  readonly saltUsdPublished: number;
  readonly saltUsdUnique: number;
  readonly rejPublished: number;
  readonly rejUnique: number;
  readonly rejMtUnique: number;
  readonly weeksWithSalt: number;
  readonly weeksWithRej: number;
  readonly weeks: number;
};

export const bangkokClaimsYear: readonly BangkokClaimsYear[] = Object.entries(
  rawPayload.claimsYear as Record<string, Record<string, number>>,
)
  .map(([year, c]) => ({
    year: Number(year),
    saltPublished: c.salt_published,
    saltUnique: c.salt_unique,
    saltUsdPublished: c.salt_usd_published,
    saltUsdUnique: c.salt_usd_unique,
    rejPublished: c.rej_published,
    rejUnique: c.rej_unique,
    rejMtUnique: c.rej_mt_unique,
    weeksWithSalt: c.weeks_with_salt,
    weeksWithRej: c.weeks_with_rej,
    weeks: c.weeks,
  }))
  .sort((a, b) => a.year - b.year);

export type BangkokSaltAgg = {
  readonly key: string;
  readonly rows: number;
  readonly issueT: number;
  readonly rejectRows: number;
  readonly rejectT: number;
  readonly claimUsd: number;
  readonly finalUsd: number;
};

function saltAggFrom(source: Record<string, Record<string, unknown>>): readonly BangkokSaltAgg[] {
  return Object.entries(source).map(([key, v]) => ({
    key,
    rows: Number(v.rows ?? v.issue_rows ?? 0),
    issueT: Number(v.t ?? v.issue_t ?? 0),
    rejectRows: Number(v.reject_rows ?? 0),
    rejectT: Number(v.reject_t ?? 0),
    claimUsd: Number(v.claim ?? 0),
    finalUsd: Number(v.final ?? 0),
  }));
}

/** 하이솔트 원장 (수정본 xlsx 기반 — 주간보고 발표치와 별도 원천) */
export const bangkokSalt = {
  source: rawPayload.salt.source as string,
  rows: rawPayload.salt.rows as number,
  latest: rawPayload.salt.latest as string,
  yearly: Object.entries(rawPayload.salt.yearly as Record<string, Record<string, number>>)
    .map(([year, y]) => ({
      year: Number(year),
      issueRows: y.issue_rows,
      issueT: y.issue_t,
      rejectRows: y.reject_rows,
      rejectT: y.reject_t,
      claimUsd: y.claim,
      finalUsd: y.final,
      reefers: y.reefers,
      canneries: y.canneries,
    }))
    .sort((a, b) => a.year - b.year),
  byFv: saltAggFrom(rawPayload.salt.by_fv as Record<string, Record<string, unknown>>),
  byCannery: saltAggFrom(rawPayload.salt.by_cannery as Record<string, Record<string, unknown>>),
  byReefer: saltAggFrom(rawPayload.salt.by_reefer as Record<string, Record<string, unknown>>),
  /** 연도 → 염도 밴드 → { rows, t } */
  bands: rawPayload.salt.bands as Record<string, Record<string, { rows: number; t: number }>>,
  settlement: Object.entries(rawPayload.salt.settlement as Record<string, number>).map(
    ([status, rows]) => ({ status, rows }),
  ),
} as const;

/* ── 데이터 품질 ────────────────────────────────────────────────────────── */

export const bangkokMeta = {
  files: rawPayload.meta.files as number,
  reports: rawPayload.meta.reports as number,
  first: rawPayload.meta.first as string,
  last: rawPayload.meta.last as string,
  priceWeeks: rawPayload.meta.price_weeks as number,
  unloadWeeks: rawPayload.meta.unload_weeks as number,
  canneryWeeks: rawPayload.meta.cannery_weeks as number,
  traderWeeks: rawPayload.meta.trader_weeks as number,
  claimWeeks: rawPayload.meta.claim_weeks as number,
} as const;

if (bangkokMeta.reports !== bangkokWeeks.length) {
  throw new Error(
    `meta.reports(${bangkokMeta.reports})와 series 행 수(${bangkokWeeks.length})가 다릅니다.`,
  );
}

export const bangkokMismatch: readonly {
  where: string;
  calc: number;
  reported: number;
  diff: number;
  sourceFile: string;
}[] = rawPayload.mismatch.map((m) => ({
  where: m.where,
  calc: m.calc,
  reported: m.reported,
  diff: m.diff,
  sourceFile: m.source_file,
}));

/** 원문 표기 정정 내역 — 유형별 건수 요약 */
export const bangkokCorrectionSummary: readonly { type: string; count: number }[] = Object.entries(
  (rawPayload.corrections as { type: string }[]).reduce<Record<string, number>>((acc, c) => {
    acc[c.type] = (acc[c.type] ?? 0) + 1;
    return acc;
  }, {}),
).map(([type, count]) => ({ type, count }));

export const bangkokDupes: readonly { date: string; kept: string; dropped: string }[] =
  rawPayload.dupes;

export const bangkokPriceFlags: readonly {
  date: string;
  value: number;
  neighborsMedian: number;
}[] = Object.entries(
  rawPayload.priceFlags as Record<string, { value: number; neighbors_median: number }>,
).map(([date, f]) => ({ date, value: f.value, neighborsMedian: f.neighbors_median }));

/** 원본 보고서 (다크 표시본) — 탭에서 «원본 열기» 링크로만 쓴다 */
export const BANGKOK_REPORT_URL = '/reports/bangkok_weekly_2020_2026.html';
