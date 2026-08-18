import weeklyRaw from '@/public/data/panofi/panofi_weekly.json';
import profileRaw from '@/public/data/panofi/panofi_profile.json';
import tradeRaw from '@/public/data/panofi/ghana_tuna_trade.json';
import actualsRaw from '@/public/data/panofi/panofi_actuals.json';
import liquidityRaw from '@/public/data/panofi/panofi_liquidity.json';
import mirrorRaw from '@/public/data/panofi/ghana_tuna_mirror.json';

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

const VESSEL_LABEL: Record<string, string> = {
  'P/MAS': '마스터', 'P/DIS': '디스커버러', 'P/FORE': '포러너', 'P/PATH': '패스파인더',
  'P/COMM': '커맨더', 'P/QUE': '퀸', 'P/GRA': '그레이스',
};

/* ------------------------------------------------------------------ 선단 */

/** 척당 H1 직접마진(백만불) — 벌어주는 배와 까먹는 배를 가른다. */
export const fleetMargins = profile.fleet.purseSeiners
  .map((v) => ({
    code: v.code,
    // 원장(actuals)은 '마스터'로, 제원(profile)은 '파노피 마스터'로 적는다. 접두를 여기서 떼어
    // 두 출처의 이름을 맞추고 차트 라벨 낭비도 없앤다.
    name: v.name.replace(/^파노피\s*/, ''),
    gt: v.gt,
    productionT: v.h1ProductionT,
    marginMusd: v.h1DirectMarginMusd,
  }))
  .sort((a, b) => b.marginMusd - a.marginMusd);

export const fleetTotals = {
  activeCount: profile.fleet.activeCount,
  totalGt: profile.fleet.purseSeiners.reduce((s, v) => s + v.gt, 0),
  totalMarginMusd: Number(
    profile.fleet.purseSeiners.reduce((s, v) => s + v.h1DirectMarginMusd, 0).toFixed(2),
  ),
  sharedCostMusd: profile.fleet.sharedCostMusd,
};

/* -------------------------------------------------------------- 실적·시나리오 */

/** 전략보고 연도 실적. 2026 H1 은 빈티지로만 남기고 화면 축은 원장 YTD 를 쓴다. */
const strategyAnnual = profile.performance.annual.filter((a) => a.year !== 2026);

/** 전략보고 2026 상반기 빈티지. 히어로·개관 KPI 에 쓰지 않는다. */
export const h1 = profile.performance.h1_2026;
/** 전략보고 H1 손익분기. 원장 누계 BEP 와 병기한다. */
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

/** 수출 상위 시장(백만불). 외부 2차자료가 아니라 Comtrade 상대국별 실측이다. */
export const exportMarkets = industry.exports.topMarkets.map((m) => ({
  label: m.market,
  금액: Math.round(m.usd2025 / 1_000_000),
  물량: m.t2025,
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

/* --------------------------------------------------- 추정실적 xlsx (월별·척별) */

export const actuals = actualsRaw;

function yoyPct(now: number | null | undefined, prior: number | null | undefined): number | null {
  if (now == null || prior == null || prior === 0) return null;
  return Math.round(((now - prior) / Math.abs(prior)) * 1000) / 10;
}

/**
 * 원장 좌측 누계 블록. 히어로·개관·손익 탭의 단일 시계.
 * 전략보고 h1_2026(-6.99백만, 22,526톤)과 섞지 않는다.
 */
export const ytd = (() => {
  const s = actuals.summary.sales;
  const prior = actuals.summary.prior;
  const months = actuals.summary.months ?? actuals.monthly.length;
  const pretaxProfit = actuals.byVessel.vessels.filter((v) => (v.세전이익 ?? 0) > 0);
  return {
    label: `2026년 1~${months}월`,
    months,
    periodLabel: actuals.summary.periodLabel,
    priorPeriodLabel: actuals.summary.priorPeriodLabel,
    productionT: Math.round(s.생산수량MT ?? 0),
    productionTRaw: s.생산수량MT,
    salesT: Math.round(s.수량MT ?? 0),
    salesTRaw: s.수량MT,
    priceUsdPerT: Math.round(s.평균단가 ?? 0),
    revenueKusd: Math.round((s.매출액 ?? 0) / 1000),
    grossProfitKusd: Math.round((s.매출총이익 ?? 0) / 1000),
    operatingKusd: Math.round((s.영업이익 ?? 0) / 1000),
    netKusd: Math.round((s.당기순이익 ?? 0) / 1000),
    taxKusd: Math.round((s.법인세비용 ?? 0) / 1000),
    financeKusd: Math.round((s.금융비용 ?? 0) / 1000),
    costRatioPct: s.원가율 == null ? null : Math.round(s.원가율 * 1000) / 10,
    costRatioPrevPct: prior.원가율 == null ? null : Math.round(prior.원가율 * 1000) / 10,
    inventoryT: Math.round(s.기말재고MT ?? 0),
    inventoryKusd: Math.round((s.기말재고액 ?? 0) / 1000),
    ledgerBepUsdPerT: Math.round(s.bep어가 ?? 0),
    strategyBepUsdPerT: bep.priceUsdPerT,
    salesYoyPct: yoyPct(s.수량MT, prior.수량MT),
    productionYoyPct: yoyPct(s.생산수량MT, prior.생산수량MT),
    revenueYoyPct: yoyPct(s.매출액, prior.매출액),
    grossProfitYoyPct: yoyPct(s.매출총이익, prior.매출총이익),
    lastMonth: actuals.monthly[actuals.monthly.length - 1] ?? null,
    pretaxProfitNames: pretaxProfit.map((v) => v.name),
    catchMixGapT: Math.round((s.생산수량MT ?? 0) - actuals.meta.catchMixTotalMT),
  };
})();

/** 연도별 실적(백만불). 2026 은 원장 누계이며 축 라벨에 기간을 박는다. */
export const annualSeries = [
  ...strategyAnnual.map((a) => ({
    label: a.half ? `${a.year} 상반기` : String(a.year),
    year: a.year,
    매출: a.revenueMusd,
    영업이익: a.operatingMusd,
    순이익: a.netMusd,
    isPartial: Boolean(a.half),
  })),
  {
    label: `2026 1~${ytd.months}월`,
    year: 2026,
    매출: Math.round((actuals.summary.sales.매출액 ?? 0) / 1e6),
    영업이익: Math.round(((actuals.summary.sales.영업이익 ?? 0) / 1e6) * 100) / 100,
    순이익: Math.round(((actuals.summary.sales.당기순이익 ?? 0) / 1e6) * 100) / 100,
    isPartial: true,
  },
];

/** 월별 손익(천 달러). 원가 배분 변동성이 커서 추세로만 읽고 판단은 누계로 한다. */
export const monthlySeries = actuals.monthly.map((m) => ({
  label: m.month ?? `${m.monthIndex}월`,
  판매량: m.수량MT,
  평균단가: m.평균단가,
  매출액: m.매출액 === null ? null : Math.round(m.매출액 / 1000),
  영업이익: m.영업이익 === null ? null : Math.round(m.영업이익 / 1000),
  당기순이익: m.당기순이익 === null ? null : Math.round(m.당기순이익 / 1000),
}));

/** 연도별 판매량·평균단가. 실적 시트 원본이라 전략보고 요약보다 한 단계 정밀하다. */
export const annualVolumeSeries = actuals.annual.map((a) => ({
  label: `${a.year}년`,
  판매량: a.수량MT,
  평균단가: a.평균단가,
  원가율: a.원가율 === null ? null : Math.round(a.원가율 * 1000) / 10,
}));

/**
 * 척별 완전손익(공통비·판관비·금융비용 배부 후).
 * 전략보고의 «직접마진»과 순위가 뒤집히는 배가 있다 — 어느 배가 버는지는 지표가 정한다.
 */
export const vesselFullPnl = actuals.byVessel.vessels
  .map((v) => ({
    code: v.code,
    name: v.name,
    productionT: v.생산량MT,
    unitUsdPerT: v.생산량MT && v.생산매출액 ? Math.round(v.생산매출액 / v.생산량MT) : null,
    제조원가: v.제조원가,
    생산총이익: v.생산총이익,
    영업이익: v.영업이익,
    세전이익: v.세전이익,
  }))
  .sort((a, b) => (b.세전이익 ?? 0) - (a.세전이익 ?? 0));

/** 직접마진 순위와 완전손익 순위의 차이. 클수록 공통비 배부에 민감한 배다. */
export const marginRankShift = (() => {
  const direct = [...fleetMargins].map((v, i) => ({ code: v.code, gt: v.gt, rank: i + 1 }));
  return vesselFullPnl.map((v, i) => {
    // 총톤수는 제원(profile), 생산량은 원장(actuals)에서 온다. 이름은 출처마다 표기가
    // 흔들리므로 반드시 선박코드로 잇는다 — 이름 매칭은 접두 하나에 조용히 깨진다.
    const d = direct.find((x) => x.code === v.code);
    return {
      name: v.name,
      gt: d?.gt ?? null,
      productionT: v.productionT,
      직접마진순위: d?.rank ?? null,
      완전손익순위: i + 1,
      shift: d ? d.rank - (i + 1) : null,
      세전이익: v.세전이익,
    };
  });
})();

/** 어종별 생산 구성(톤). 가다랑어가 통조림 원료의 주력이다. */
export const catchBySpecies = (() => {
  const map = new Map<string, number>();
  for (const r of actuals.catchMix) {
    map.set(r.species, (map.get(r.species) ?? 0) + r.totalMT);
  }
  const total = [...map.values()].reduce((s, v) => s + v, 0);
  return [...map.entries()]
    .map(([label, t]) => ({ label, 생산량: Math.round(t), 비중: Math.round((t / total) * 1000) / 10 }))
    .sort((a, b) => b.생산량 - a.생산량);
})();

/** 척별 원가 3분류(재료비·노무비·경비) 합계. */
export const vesselCostGroups = actuals.byVessel.vessels.map((v) => {
  const g = { label: VESSEL_LABEL[v.code] ?? v.code, 재료비: 0, 노무비: 0, 경비: 0 };
  for (const c of v.costs) {
    if (c.group === '재료비') g.재료비 += c.usd;
    else if (c.group === '노무비') g.노무비 += c.usd;
    else g.경비 += c.usd;
  }
  g.재료비 = Math.round(g.재료비 / 1000);
  g.노무비 = Math.round(g.노무비 / 1000);
  g.경비 = Math.round(g.경비 / 1000);
  return g;
});

/* ------------------------------------------------- 자금유동성 (월간보고 pptx) */

export const liquidity = liquidityRaw;

/** 월말 현금·매출채권·매입채무와 과부족(천 달러). 2026년만 그린다. */
export const liquiditySeries = liquidity.series
  .filter((r) => r.asOf >= '2025-12-31')
  .map((r) => ({
    label: r.asOf.slice(2).replace(/-/g, '/'),
    asOf: r.asOf,
    현금: r.현금,
    매출채권: r.매출채권,
    매입채무: r.매입채무,
    과부족: r.과부족,
  }));

/**
 * 과부족 악화의 분해. 매출채권은 줄었는데(회수 성공) 매입채무가 더 크게 늘어
 * 과부족이 벌어졌다 — «회수했는데 왜 더 나빠졌나»에 답하는 축이다.
 */
export const liquidityBridge = (() => {
  const rows = liquidity.series.filter((r) => r.asOf >= '2025-12-31');
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) return null;
  const d = (k: '현금' | '매출채권' | '매입채무' | '과부족') =>
    first[k] === null || last[k] === null ? null : Math.round(last[k]! - first[k]!);
  return {
    from: first.asOf,
    to: last.asOf,
    현금: d('현금'),
    매출채권: d('매출채권'),
    매입채무: d('매입채무'),
    과부족: d('과부족'),
    startShortfall: first.과부족,
    endShortfall: last.과부족,
  };
})();

/** 익월 추정손익(천 달러) — 전년 동월 대비. 월간보고에만 있는 선행 수치다. */
export const monthlyEstimates = liquidity.estimates
  .slice()
  .sort((a, b) => a.forMonth - b.forMonth)
  .map((e) => ({
    label: `${e.forMonth}월`,
    당년추정: e.net ?? null,
    전년실적: e.netPrevYear ?? null,
    매출추정: e.revenue ?? null,
  }));

/* ------------------------------------------------------- 거울통계 (교차검증) */

export const mirror = mirrorRaw;

/**
 * 가나가 «수출했다»고 보고한 값 vs 상대국이 «가나에서 수입했다»고 보고한 값.
 * 양쪽이 다 보고한 쌍만, 금액 큰 순으로.
 */
export const mirrorPairs = mirror.pairs
  .filter((p) => p.ghanaExportUsd && p.partnerImportUsd)
  .map((p) => ({
    label: `${p.partner} ${p.hs}`,
    partner: p.partner,
    hs: p.hs,
    가나수출: Math.round((p.ghanaExportUsd ?? 0) / 1e6),
    상대국수입: Math.round((p.partnerImportUsd ?? 0) / 1e6),
    ratio: p.importOverExport,
    gapUsd: (p.partnerImportUsd ?? 0) - (p.ghanaExportUsd ?? 0),
  }))
  .sort((a, b) => b.가나수출 - a.가나수출);

/** 가나만 보고하고 상대국 기록이 없는 건. 받은 쪽 장부에 없다는 뜻이다. */
export const mirrorUnmatched = mirror.pairs
  .filter((p) => p.ghanaExportUsd && !p.partnerImportUsd)
  .map((p) => ({
    partner: p.partner,
    hs: p.hs,
    가나수출: Math.round((p.ghanaExportUsd ?? 0) / 1e6),
    valueUsd: p.ghanaExportUsd ?? 0,
  }))
  .sort((a, b) => b.valueUsd - a.valueUsd);

/** 절대 금액이 가장 크게 벌어진 쌍. 비율만 보면 소액 건이 위로 올라와 오독한다. */
export const mirrorTopGap = [...mirrorPairs].sort((a, b) => b.gapUsd - a.gapUsd)[0] ?? null;

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
