/**
 * 오징어 차트 시리즈 색 — 화면이 여러 장이어도 같은 종은 같은 색.
 *
 * 색값은 lib/chart-palette 의 SERIES·CHART_ROLE(전 메뉴 공통, 2026-09-11)이다. 페이지 보라는 차트 밖 액센트로만 남는다.
 * 갈래: 오징어 = 파랑, 갑오징어 = 주황(오징어와 합산하면 안 되는 것이 보이게), 두족류 미분류 = 회색, 그 밖의 종 = 노랑.
 */

import { CHART_ROLE, SERIES, SERIES_OTHER } from '@/lib/chart-palette';

/** 물량·세계 / 한국·단가·수출 / 가공 단계. 종이 아닌 역할용. */
export const SQUID_ROLE = {
  volume: CHART_ROLE.volume,
  highlight: CHART_ROLE.highlight,
  processed: SERIES[3],
} as const;

// 선으로 함께 그리는 두 묶음 — 어종 시계열(갑오징어류·대왕·아르헨티나·오징어류 미분류)과
// 주요 4종(살·아르헨티나·대왕·파타고니아) — 이 둘 다 validate_palette.js 인접 검사를 통과하는 배치(2026-09-11).
// 시계열은 두족류 미분류(회색)가 가운데 끼므로 회색 옆 아르헨티나는 자홍을 피했다.
// 선으로 따로 그리지 않는 종은 제 갈래 색을 쓴다.
const SPECIES_COLOR: Record<string, string> = {
  살오징어: SQUID_ROLE.volume,
  아르헨티나오징어: SERIES[5],
  대왕오징어: SERIES[6],
  파타고니아오징어: SERIES[2],
  '오징어류 미분류': SERIES[4],
  북방대왕오징어: SQUID_ROLE.volume,
  캘리포니아오징어: SQUID_ROLE.volume,
  유럽오징어류: SQUID_ROLE.volume,
  유럽오징어: SQUID_ROLE.volume,
  오징어속: SQUID_ROLE.volume,
  짧은지느러미오징어: SQUID_ROLE.volume,
  빨강오징어: SQUID_ROLE.volume,
  갑오징어: SQUID_ROLE.highlight,
  '갑오징어류 미분류': SQUID_ROLE.highlight,
  '두족류 미분류': SERIES_OTHER,
  '그 밖의 종': SQUID_ROLE.processed,
  혼합: SQUID_ROLE.processed,
};

const BASKET_COLOR: Record<string, string> = {
  오징어: SQUID_ROLE.volume,
  갑오징어: SQUID_ROLE.highlight,
  '두족류 미분류': SERIES_OTHER,
};

const FALLBACK = SERIES;

/** 어종을 막대로 늘어놓는 차트는 종마다 색을 주지 않고 갈래(오징어·갑오징어·미분류·그 밖의 종) 색으로 칠한다 — 이름은 축 라벨이 말한다. */
export function colorForSpeciesGroup(name: string): string {
  if (name.startsWith('갑오징어')) return BASKET_COLOR.갑오징어;
  if (name === '두족류 미분류') return BASKET_COLOR['두족류 미분류'];
  if (name === '그 밖의 종' || name === '혼합') return SQUID_ROLE.processed;
  return BASKET_COLOR.오징어;
}

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
