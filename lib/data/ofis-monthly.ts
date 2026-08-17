import raw from '@/public/data/ofis_monthly_v1.json';

/**
 * OFIS 원양어업 생산동향 — 최신호(2026.6)만 읽는다.
 *
 * ⚠ 측정 경계
 *   · 잠정. 이후 호가 전월을 고친다. 초판 18권을 이어 붙이지 않는다.
 *   · 2026년 1~6월을 연환산하지 않는다.
 *   · 2025년 회사표(383,130 M/T)·2024년 통계조사(479,398톤)와 빼거나 잇지 않는다.
 *   · 회사·선박 칸은 없다. 신라 점유율을 여기서 만들지 않는다.
 *   · 생산 없는 어종(6월 꽁치)의 단가 행을 0으로 만들지 않는다.
 */

export type VolumePoint = {
  avg5yrMonth: number;
  priorMonth: number;
  priorYtd: number;
  month: number;
  ytd: number;
  monthYoyPct: number;
};

export type SpeciesRow = VolumePoint & { id: string; label: string };
export type OceanRow = VolumePoint & { id: string; label: string };
export type PriceRow = {
  id: string;
  label: string;
  prior: number;
  current: number;
  delta: number;
  yoyPct: number;
};

type OfisFile = {
  _meta: {
    title: string;
    issuer: string;
    period: string;
    periodLabel: string;
    ytdLabel: string;
    file: string;
    published: string;
    status: 'STATIC';
    provisional: boolean;
    unitVolume: string;
    unitPrice: string;
    sha256_16: string;
    measurementBoundary: string;
  };
  headline: VolumePoint;
  tuna: {
    total: VolumePoint;
    purseSeine: VolumePoint;
    longline: VolumePoint;
  };
  species: SpeciesRow[];
  oceans: OceanRow[];
  prices: PriceRow[];
};

const data = raw as OfisFile;

function assertFinite(label: string, value: number) {
  if (!Number.isFinite(value)) throw new Error(`ofis-monthly: ${label}가 숫자가 아니다`);
}

function assertPoint(label: string, point: VolumePoint) {
  (['avg5yrMonth', 'priorMonth', 'priorYtd', 'month', 'ytd', 'monthYoyPct'] as const).forEach((key) => {
    assertFinite(`${label}.${key}`, point[key]);
  });
}

assertPoint('headline', data.headline);
assertPoint('tuna.total', data.tuna.total);
assertPoint('tuna.purseSeine', data.tuna.purseSeine);
assertPoint('tuna.longline', data.tuna.longline);
data.species.forEach((row) => assertPoint(row.id, row));
data.oceans.forEach((row) => assertPoint(row.id, row));
data.prices.forEach((row) => {
  assertFinite(`${row.id}.current`, row.current);
  assertFinite(`${row.id}.prior`, row.prior);
});

if (data.headline.month !== 33_045) {
  throw new Error('ofis-monthly: 6월 합계는 33,045톤이어야 한다');
}
if (data.headline.ytd !== 191_540) {
  throw new Error('ofis-monthly: 1~6월 누계는 191,540톤이어야 한다');
}
if (data.headline.priorYtd !== 214_623) {
  throw new Error('ofis-monthly: 같은 호가 다시 쓴 2025 상반기는 214,623톤이어야 한다');
}
if (data.tuna.purseSeine.month !== 13_176) {
  throw new Error('ofis-monthly: 6월 선망은 13,176톤이어야 한다');
}
if (data.tuna.longline.month !== 3_760) {
  throw new Error('ofis-monthly: 6월 연승은 3,760톤이어야 한다');
}

const bigeye = data.prices.find((row) => row.id === 'bigeye');
if (!bigeye || bigeye.current !== 7_068.6) {
  throw new Error('ofis-monthly: 눈다랑어 단가는 7,068.6원/kg이어야 한다');
}

if (data.prices.some((row) => row.id === 'saury' || row.label === '꽁치')) {
  throw new Error('ofis-monthly: 꽁치 단가 행을 만들지 않는다');
}

const saury = data.species.find((row) => row.id === 'saury');
if (!saury || saury.month !== 0 || saury.ytd !== 0) {
  throw new Error('ofis-monthly: 6월 꽁치는 실적 없음(0)이어야 한다');
}

const speciesMonthSum = data.tuna.total.month + data.species.reduce((sum, row) => sum + row.month, 0);
if (speciesMonthSum !== data.headline.month) {
  throw new Error(`ofis-monthly: 어종 당월 합 ${speciesMonthSum} ≠ 합계 ${data.headline.month}`);
}

const oceanMonthSum = data.oceans.reduce((sum, row) => sum + row.month, 0);
if (oceanMonthSum !== 33_046) {
  throw new Error(`ofis-monthly: 해역 당월 합은 원문대로 33,046(합계 33,045과 1톤 차이)이어야 한다`);
}

const oceanYtdSum = data.oceans.reduce((sum, row) => sum + row.ytd, 0);
if (oceanYtdSum !== data.headline.ytd) {
  throw new Error(`ofis-monthly: 해역 누계 합 ${oceanYtdSum} ≠ 합계 ${data.headline.ytd}`);
}

export const ofisMeta = data._meta;
export const ofisHeadline = data.headline;
export const ofisTuna = data.tuna;
export const ofisSpecies = data.species;
export const ofisOceans = data.oceans;
export const ofisPrices = data.prices;

export const OFIS_MONTH_TOTAL_T = data.headline.month;
export const OFIS_YTD_TOTAL_T = data.headline.ytd;
export const OFIS_PRIOR_YTD_T = data.headline.priorYtd;
export const OFIS_PS_MONTH_T = data.tuna.purseSeine.month;
export const OFIS_LL_MONTH_T = data.tuna.longline.month;
export const OFIS_BET_KRW = bigeye.current;

/** 상반기 누계 증감(%). 연간이 아니다. */
export const ofisYtdYoyPct = Number(
  (((data.headline.ytd - data.headline.priorYtd) / data.headline.priorYtd) * 100).toFixed(1),
);

export const tunaPriceRows = data.prices.filter((row) => (
  row.id === 'skipjack' || row.id === 'bigeye' || row.id === 'yellowfin'
));

export const volumeCompareRows = [
  { 구분: '합계', 평년: data.headline.avg5yrMonth, 전년: data.headline.priorMonth, 올해: data.headline.month },
  { 구분: '선망', 평년: data.tuna.purseSeine.avg5yrMonth, 전년: data.tuna.purseSeine.priorMonth, 올해: data.tuna.purseSeine.month },
  { 구분: '연승', 평년: data.tuna.longline.avg5yrMonth, 전년: data.tuna.longline.priorMonth, 올해: data.tuna.longline.month },
];

export const oceanCompareRows = data.oceans.map((row) => ({
  해역: row.label,
  전년: row.priorMonth,
  올해: row.month,
}));

export const tunaPriceCompareRows = tunaPriceRows.map((row) => ({
  어종: row.label,
  전년: row.prior,
  올해: row.current,
}));
