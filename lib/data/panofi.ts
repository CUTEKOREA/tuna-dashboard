import weeklyRaw from '@/public/data/panofi/panofi_weekly.json';
import profileRaw from '@/public/data/panofi/panofi_profile.json';

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
