import weeklyRaw from '@/public/data/panofi/panofi_weekly.json';
import profileRaw from '@/public/data/panofi/panofi_profile.json';
import tradeRaw from '@/public/data/panofi/ghana_tuna_trade.json';

/**
 * 파노피(가나 참치 선망) 데이터 인테이크.
 *
 * 위젯이 JSON 을 보는 유일한 통로다 (ADR 0005 · 아키텍처 가드). 화면 컴포넌트는
 * 이 모듈이 내보내는 파생 시리즈만 쓰고 원본 JSON 을 직접 import 하지 않는다.
 *
 * 원자료 2종:
 *  - panofi_weekly.json  : 주간동향 docx 31주 기계 추출 (scripts/extract_panofi.py)
 *  - panofi_profile.json : 전략보고·3개사 보고·외부 조사 수작업 정리 (근거등급 포함)
 */

/* ------------------------------------------------------------------ types */

export type FleetStatus = 'detailed' | 'nominal' | 'missing';

export type PanofiWeek = (typeof weeklyRaw.weeks)[number];
export type PanofiProfile = typeof profileRaw;

export type Point = { label: string; date: string } & Record<string, number | string | null>;

/* ------------------------------------------------------------------- base */

export const weeks = weeklyRaw.weeks as PanofiWeek[];
export const meta = weeklyRaw.meta;
export const profile = profileRaw;

export const latest = weeks[weeks.length - 1];
export const previous = weeks.length > 1 ? weeks[weeks.length - 2] : undefined;

/** 주간 라벨은 '8/11' 처럼 월/일로 쓴다. 31주가 한 축에 들어가야 하므로 짧아야 한다. */
function shortLabel(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${Number(m)}/${Number(d)}`;
}

/** null 안전 델타. 어느 한쪽이라도 없으면 비교하지 않는다(0 으로 뭉개면 거짓 신호가 된다). */
export function delta(now: number | null | undefined, before: number | null | undefined): number | null {
  if (now === null || now === undefined || before === null || before === undefined) return null;
  return now - before;
}

/* --------------------------------------------------------------- 파생 시리즈 */

/** 어가 4채널 시계열($/톤). 로컬 마켓은 CEDI·CFA 원값을 달러 환산한 값이 원문에 함께 온다. */
export const priceSeries: Point[] = weeks.map((w) => ({
  date: w.reportDate,
  label: shortLabel(w.reportDate),
  코스모: w.prices.cosmoTema,
  PFC: w.prices.pfcTema,
  SCODI: w.prices.scodiAbidjan,
  아비장로컬: w.prices.marketAbidjanUsd,
  테마로컬: w.prices.marketTemaUsd,
}));

/** 유가 시계열($/KL). 2026-03-17 부터 4지점 표로 바뀌기 전 9주는 단일값만 있다. */
export const fuelSeries: Point[] = weeks.map((w) => ({
  date: w.reportDate,
  label: shortLabel(w.reportDate),
  아비장: w.fuel.abidjan ?? w.fuel.single,
  테마: w.fuel.tema,
  다카르: w.fuel.dakar,
  탱커: w.fuel.tanker,
}));

/** 아비장 미수금 시계열(천불). 회수 성과를 한 줄로 보여주는 축이다. */
export const receivableSeries: Point[] = weeks.map((w) => ({
  date: w.reportDate,
  label: shortLabel(w.reportDate),
  미수금: w.receivables.totalUsd === null ? null : Math.round(w.receivables.totalUsd / 1000),
}));

/** 가공사별 일일 처리량(톤). 파노피 어획을 실제로 받아주는 하류 용량이다. */
export const processingSeries: Point[] = weeks.map((w) => ({
  date: w.reportDate,
  label: shortLabel(w.reportDate),
  코스모: w.dailyProcessing.COSMO,
  PFC: w.dailyProcessing.PFC,
  SCODI: w.dailyProcessing.SCODI,
  SCASA: w.dailyProcessing.SCASA,
}));

/** 어장 수온(℃). 연안·대양 상단값. 어황 선행지표로 읽는다. */
export const seaTempSeries: Point[] = weeks.map((w) => ({
  date: w.reportDate,
  label: shortLabel(w.reportDate),
  연안: w.fishingGround.coastalMax,
  대양: w.fishingGround.oceanMax,
}));

/** 환율. CEDI 는 가나, CFA 는 코트디부아르 로컬 판매대금의 달러 환산에 쓰인다. */
export const fxSeries: Point[] = weeks.map((w) => ({
  date: w.reportDate,
  label: shortLabel(w.reportDate),
  세디: w.fx.cediPerUsd,
  CFA: w.fx.cfaPerUsd,
}));

/** 세네갈·EU 선단 주간 입항 물량(톤). 파노피 자사선이 아니라 지역 공급 압력 지표다. */
export const regionalLandingSeries: Point[] = weeks.map((w) => ({
  date: w.reportDate,
  label: shortLabel(w.reportDate),
  입항톤수: w.senegalFleet.reduce((sum, v) => sum + (v.tons ?? 0), 0) || null,
  척수: w.senegalFleet.length || null,
}));

/* ------------------------------------------------------------------ 선단 */

/** 척당 H1 직접마진(백만불) — 벌어주는 배와 까먹는 배를 가른다. */
export const fleetMargins = profile.fleet.purseSeiners
  .map((v) => ({
    code: v.code,
    name: v.name,
    gt: v.gt,
    productionT: v.h1ProductionT,
    marginMusd: v.h1DirectMarginMusd,
  }))
  .sort((a, b) => b.marginMusd - a.marginMusd);

export const fleetTotals = {
  activeCount: profile.fleet.activeCount,
  totalGt: profile.fleet.purseSeiners.reduce((s, v) => s + v.gt, 0),
  totalProductionT: profile.fleet.purseSeiners.reduce((s, v) => s + v.h1ProductionT, 0),
  totalMarginMusd: Number(
    profile.fleet.purseSeiners.reduce((s, v) => s + v.h1DirectMarginMusd, 0).toFixed(2),
  ),
  sharedCostMusd: profile.fleet.sharedCostMusd,
};

/* -------------------------------------------------------------- 실적·시나리오 */

/** 연도별 실적(백만불). 2026 은 상반기 누계다 — 축 라벨에 반드시 표기한다. */
export const annualSeries = profile.performance.annual.map((a) => ({
  label: a.half ? `${a.year} 상반기` : String(a.year),
  year: a.year,
  매출: a.revenueMusd,
  영업이익: a.operatingMusd,
  순이익: a.netMusd,
  isPartial: Boolean(a.half),
}));

export const h1 = profile.performance.h1_2026;
export const bep = profile.performance.bep;
export const scenarios = profile.h2Scenarios;
export const sensitivity = profile.sensitivity;
export const costStructure = profile.costStructure;
export const channels = profile.channels;
export const receivables = profile.receivables;
export const industry = profile.industry;
export const priorities = profile.h2Priorities;
export const kpiSignals = profile.kpiSignals;
export const company = profile.company;
export const pfc = profile.pfcDominance;
export const stopCondition = profile.stopCondition;

/** 밸류 사다리(EUR/톤). 파노피는 맨 아래 칸(냉동 원어)에서 판다. */
export const valueLadder = industry.valueLadder.steps.map((s) => ({
  label: s.product,
  단가: s.eurPerT,
  stage: s.stage,
}));

/** 수출 상위 시장(백만불, 2024 가공어류 기준). */
export const exportMarkets = industry.exports.topMarkets.map((m) => ({
  label: m.market,
  금액: Math.round(m.usd2024 / 1_000_000),
  annualT: 'annualT' in m ? m.annualT : null,
}));

/** 비용 구조 상위 항목(매출 대비 %). 유류가 39.6%로 지배적이다. */
export const costBars = costStructure.items.map((c) => ({
  label: c.item,
  비중: c.revenuePct,
  금액: c.kusd,
  nature: c.nature,
  control: c.control,
}));

/** 손익 민감도(만불). 통제권 내 변수와 시황 변수를 색으로 가른다. */
export const sensitivityBars = sensitivity.items.map((s) => ({
  label: s.driver,
  영향: s.impactMusd,
  controllable: s.type === '통제권 내',
}));

/** 방콕 스킵잭 기준가 대비 파노피 실현 어가. 서아프리카 디스카운트를 읽는 축이다. */
export const bangkokSeries = industry.skipjackBangkok.series.map((s) => ({
  label: `${Number(s.month.split('-')[1])}월`,
  month: s.month,
  방콕: s.usdPerT,
}));

/* ------------------------------------------------------------------ 요약 */

/** 화면 최상단 KPI. 값이 없을 때 0 으로 채우지 않는다 — null 이면 '자료 없음'으로 보여야 한다. */
export const headline = {
  reportDate: latest.reportDate,
  weekCount: meta.weekCount,
  rangeStart: meta.rangeStart,
  rangeEnd: meta.rangeEnd,
  activeVessels: fleetTotals.activeCount,
  h1ProductionT: h1.productionT,
  h1NetKusd: h1.netKusd,
  bepPriceUsdPerT: bep.priceUsdPerT,
  latestCosmoPrice: latest.prices.cosmoTema,
  latestScodiPrice: latest.prices.scodiAbidjan,
  latestReceivableKusd:
    latest.receivables.totalUsd === null ? null : Math.round(latest.receivables.totalUsd / 1000),
  receivableDeltaKusd:
    delta(latest.receivables.totalUsd, previous?.receivables.totalUsd) === null
      ? null
      : Math.round(delta(latest.receivables.totalUsd, previous?.receivables.totalUsd)! / 1000),
  h2BaseTargetT: scenarios.rows[0].base,
};

/* --------------------------------------------------- 가나 참치 무역 (Comtrade) */

export const trade = tradeRaw;
type TradeRow = (typeof tradeRaw.rows)[number];

const tradeRows = tradeRaw.rows as TradeRow[];

/** 전세계(상대국 0) 행만 총계로 쓴다. 국가별 행을 더하면 이중계상이 된다. */
const worldRows = tradeRows.filter((r) => r.partnerCode === 0);
const partnerRows = tradeRows.filter((r) => r.partnerCode !== 0);

const LATEST_TRADE_YEAR = Math.max(...tradeRows.map((r) => r.year));
export const tradeYear = LATEST_TRADE_YEAR;

/** 연도별 수출입과 무역수지(백만 달러). */
export const tradeBalanceSeries = trade.meta.years
  .filter((y) => worldRows.some((r) => r.year === y))
  .map((y) => {
    const sum = (flow: string) =>
      worldRows.filter((r) => r.year === y && r.flow === flow)
        .reduce((s, r) => s + (r.valueUsd ?? 0), 0);
    const x = sum('수출');
    const m = sum('수입');
    return {
      label: `${y}년`,
      year: y,
      수출: Math.round(x / 1e6),
      수입: Math.round(m / 1e6),
      무역수지: Math.round((x - m) / 1e6),
    };
  });

function aggregate(rows: TradeRow[], keyOf: (r: TradeRow) => string) {
  const map = new Map<string, { value: number; weight: number }>();
  for (const r of rows) {
    const k = keyOf(r);
    const cur = map.get(k) ?? { value: 0, weight: 0 };
    cur.value += r.valueUsd ?? 0;
    cur.weight += r.netWgtT ?? 0;
    map.set(k, cur);
  }
  return [...map.entries()]
    .map(([label, v]) => ({
      label,
      금액: Math.round(v.value / 1e6),
      물량: Math.round(v.weight),
      valueUsd: v.value,
      단가: v.weight > 0 ? Math.round(v.value / v.weight) : null,
    }))
    .sort((a, b) => b.valueUsd - a.valueUsd);
}

/** 최신 연도 품목별 수출. 통조림 한 칸이 금액의 대부분을 가져간다. */
export const exportByCommodity = aggregate(
  worldRows.filter((r) => r.year === LATEST_TRADE_YEAR && r.flow === '수출'),
  (r) => r.commodity,
);

/** 가공 형태별 단가 사다리. 같은 참치가 칸을 올라갈 때마다 몇 배가 되는지 본다. */
export const exportByForm = aggregate(
  worldRows.filter((r) => r.year === LATEST_TRADE_YEAR && r.flow === '수출'),
  (r) => r.form,
);

/** 어종별 수출(냉동·신선 원어만 — 필레·통조림은 어종이 합쳐져 나온다). */
export const exportBySpecies = aggregate(
  worldRows.filter(
    (r) => r.year === LATEST_TRADE_YEAR && r.flow === '수출' && r.species !== '합산',
  ),
  (r) => r.species,
);

/** 상대국별 수출 상위. 국가별 행은 합계를 내지 않고 순위 비교에만 쓴다. */
export const exportByPartner = aggregate(
  partnerRows.filter((r) => r.year === LATEST_TRADE_YEAR && r.flow === '수출'),
  (r) => r.partner,
).slice(0, 12);

/** 상대국별 수입 상위 — 가나가 원어를 어디서 채워 오는지. */
export const importByPartner = aggregate(
  partnerRows.filter((r) => r.year === LATEST_TRADE_YEAR && r.flow === '수입'),
  (r) => r.partner,
).slice(0, 10);

/** 원어와 통조림의 단가 격차. 파노피가 선 칸과 가나 수출이 나가는 칸의 거리다. */
export const tradeLadderGap = (() => {
  const raw = exportByForm.find((f) => f.label === '냉동 원어');
  const canned = exportByForm.find((f) => f.label === '조제·통조림');
  if (!raw?.단가 || !canned?.단가) return null;
  return {
    rawUsdPerT: raw.단가,
    cannedUsdPerT: canned.단가,
    multiple: Number((canned.단가 / raw.단가).toFixed(1)),
    cannedSharePct: Math.round(
      (canned.valueUsd / exportByForm.reduce((s, f) => s + f.valueUsd, 0)) * 100,
    ),
  };
})();

/** 원자료 품질 플래그. 화면 하단 '데이터 품질'에 그대로 노출해 신뢰도를 스스로 밝힌다. */
export const dataQuality = {
  weekCount: meta.weekCount,
  coverage: meta.coverage,
  nominalWeeks: weeks.filter((w) => w.fleetStatus === 'nominal').length,
  missingWeeks: weeks.filter((w) => w.fleetStatus === 'missing').length,
  statedYearMismatch: weeks.filter((w) => w.statedYearMismatch).map((w) => w.reportDate),
  sources: profile.meta.sources,
  grades: profile.meta.grades,
};
