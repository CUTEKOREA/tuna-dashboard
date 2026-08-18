/**
 * 오징어 차트 시리즈 색 — 화면이 여러 장이어도 같은 종은 같은 색.
 *
 * 갈래를 먼저 가른다.
 *   오징어     = 보라·남색 (페이지 액센트와 같은 집)
 *   갑오징어   = 장미색 (오징어와 합산하면 안 되는 것이 눈에 보이게)
 *   잔여       = 슬레이트 vs 호박 — 미분류와 「그 밖의 종」을 같은 회색으로 두지 않는다
 *
 * 갈래 안에서는 종마다 hex 를 고정한다. 막대·선이 인덱스로 돌면 아래 45년 차트와
 * 위 구성 차트가 다른 팔레트를 쓰게 된다.
 */

/** 물량·세계 / 한국·단가·수출 / 가공 단계. 종이 아닌 역할용. */
export const SQUID_ROLE = {
  volume: '#6d28d9',
  highlight: '#be185d',
  processed: '#b45309',
} as const;

const SPECIES_COLOR: Record<string, string> = {
  살오징어: '#6d28d9',
  아르헨티나오징어: '#3730a3',
  대왕오징어: '#a21caf',
  북방대왕오징어: '#c026d3',
  파타고니아오징어: '#5b21b6',
  캘리포니아오징어: '#4f46e5',
  유럽오징어류: '#4338ca',
  유럽오징어: '#4338ca',
  오징어속: '#4338ca',
  짧은지느러미오징어: '#3730a3',
  '오징어류 미분류': '#7c3aed',
  빨강오징어: '#7e22ce',
  갑오징어: '#9f1239',
  '갑오징어류 미분류': '#be185d',
  '두족류 미분류': '#64748b',
  '그 밖의 종': '#b45309',
  혼합: '#b45309',
};

const BASKET_COLOR: Record<string, string> = {
  오징어: SQUID_ROLE.volume,
  갑오징어: SQUID_ROLE.highlight,
  '두족류 미분류': '#64748b',
};

/** 이름이 사전에 없을 때. 분홍·하늘 순환을 쓰지 않고 같은 집에서 고른다. */
const FALLBACK = [
  SQUID_ROLE.volume,
  SQUID_ROLE.highlight,
  '#3730a3',
  SQUID_ROLE.processed,
  '#7c3aed',
  '#5b21b6',
  '#64748b',
  '#9f1239',
] as const;

export function colorForSpecies(name: string): string {
  return SPECIES_COLOR[name] ?? FALLBACK[0];
}

export function colorForBasket(kind: string): string {
  return BASKET_COLOR[kind] ?? FALLBACK[6];
}

/** 종 이름이면 고정색, 아니면 역할·순환. */
export function colorForSeries(name: string, index = 0): string {
  return SPECIES_COLOR[name] ?? BASKET_COLOR[name] ?? FALLBACK[index % FALLBACK.length];
}

/** 같은 갈래에서 겹치는 선은 점선으로 한 번 더 가른다. */
export function dashForSeries(name: string): string | undefined {
  if (name === '파타고니아오징어' || name === '오징어류 미분류') return '6 3';
  if (name === '두족류 미분류') return '3 3';
  if (name === '그 밖의 종' || name === '혼합') return '8 3 2 3';
  return undefined;
}

export const SQUID_SPECIES_COLORS = SPECIES_COLOR;
export const SQUID_BASKET_COLORS = BASKET_COLOR;
export const SQUID_FALLBACK_COLORS = FALLBACK;
