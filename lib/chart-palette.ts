/**
 * 선단 DB에서 뽑은 차트 4겹 (2026-08-18 기획).
 * 연결: 시장 동향 · 선단 운영 · 하역 현황 · 오징어 · 물류·가공 · 파노피 · 코스모 · 방콕사무소. 그 밖은 아직 import 하지 말 것.
 * 오징어 종·바스켓은 lib/squid-chart-colors 가 정체성 집을 유지한다.
 *
 * A 셸 — 흰 카드·잉크 숫자는 CSS 토큰(--dsc-*)이 담당
 * B 구성 — 파이·트리맵·점유 (파스텔 면색)
 * C 정체성 — 이름 고정 (항구·분류 칩·VDS 항목). RFMO 색상환과 같되 기구 이름이 아니다
 * D 순위 — 단일 시리즈 막대
 */

export const CHART_SHARE = [
  '#f4b4c4',
  '#b7e0cf',
  '#b7d4f0',
  '#f6e08a',
  '#f3c4a8',
  '#d4c4f0',
  '#c5e4a8',
  '#e8d4c0',
] as const;

export const CHART_RANK = '#e879a8';

export const RFMO_ID = {
  WCPFC: '#3b82f6',
  IOTC: '#10b981',
  IATTC: '#f59e0b',
  ICCAT: '#ef4444',
  CCSBT: '#8b5cf6',
} as const;

/** 항구 정체성 — 가다랑어·황다랑어가 같은 항구면 같은 색. */
export const HUB_ID = {
  bkk: '#3b82f6',
  mnt: '#10b981',
  sey: '#f59e0b',
  abj: '#8b5cf6',
  vig: '#e879a8',
} as const;

/** 어창·홀 선 — 흰 지면에서 읽히는 정체성 채도. 파스텔 세선은 쓰지 않는다. */
export const HOLD_ID = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#e879a8',
  '#06b6d4',
  '#84cc16',
  '#a78bfa',
  '#f97316',
  '#0ea5e9',
  '#64748b',
  '#14b8a6',
] as const;

export function colorForHold(index: number): string {
  return HOLD_ID[((index % HOLD_ID.length) + HOLD_ID.length) % HOLD_ID.length];
}

/** 파노피 정체성 — 채널·항구. 허브 겹을 쓰되 기구 이름이 아니다. */
export const PANOFI_ID = {
  cosmo: HUB_ID.bkk,
  pfc: HUB_ID.vig,
  scodi: HUB_ID.mnt,
  scasa: HUB_ID.sey,
  abidjan: HUB_ID.abj,
  tema: '#06b6d4',
  dakar: '#14b8a6',
  tanker: '#f97316',
} as const;

/** 트레이더 정체성 — 물류·방콕이 같은 이름에 같은 색. */
export const TRADER_ID = {
  FCF: HUB_ID.bkk,
  ITOCHU: HUB_ID.abj,
  'TRI MARINE': HUB_ID.vig,
  DIRECT: HUB_ID.mnt,
  MALDIVES: HUB_ID.sey,
} as const;

/** 태국 항구 쌍 — 방콕은 허브 bkk, 송클라는 같은 차트에서 구분. */
export const THAI_PORT_ID = {
  bangkok: HUB_ID.bkk,
  songkhla: '#06b6d4',
} as const;

/** VDS 요약 칸 — 배정·소진·잔여·주간. */
export const VDS_ID = {
  allocated: '#3b82f6',
  consumed: '#8b5cf6',
  remaining: '#10b981',
  weekly: '#f59e0b',
} as const;

export const NEWS_CATEGORY_ID = {
  시장: HUB_ID.bkk,
  규제: HUB_ID.abj,
  원료가: HUB_ID.sey,
  무역: HUB_ID.mnt,
  조업: HUB_ID.vig,
  뉴스: '#8d93a5',
} as const;

export function shareColor(index: number): string {
  return CHART_SHARE[((index % CHART_SHARE.length) + CHART_SHARE.length) % CHART_SHARE.length];
}

export function colorForAtunaHub(key: string): string {
  if (key.includes('bkk')) return HUB_ID.bkk;
  if (key.includes('mnt')) return HUB_ID.mnt;
  if (key.includes('sey')) return HUB_ID.sey;
  if (key.includes('abj')) return HUB_ID.abj;
  if (key.includes('vig')) return HUB_ID.vig;
  return HUB_ID.bkk;
}
