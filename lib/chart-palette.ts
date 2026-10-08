/**
 * 차트 색 한 벌 (2026-09-11 전면 개편 — 데이터 색은 전 메뉴 공통, 메뉴 톤은 차트 밖 액센트로만).
 *
 * SERIES 8색이 모든 데이터 색의 정본이다. 값은 dataviz 참조 팔레트의 다크 단계로,
 * 흰 카드(#ffffff)와 다크 표면(≈#151517) 두 곳에서 모두 validate_palette.js 를 통과한다
 * (명도대 · 채도 ≥ 0.1 · 인접 CVD ΔE ≥ 8 · 정상시각 ΔE ≥ 15 · 대비 ≥ 3:1).
 * 한 hex 로 두 테마를 쓰므로 canvas·투명도 이어붙이기(`${c}33`) 코드에서도 그대로 쓴다.
 *
 * 순서가 색각 안전 장치다. 한 차트·한 정체성 집 안에서는 SERIES[0] 부터 표시 순서대로 차례로 쓴다.
 * 다른 순서로 섞으면(예: 주황·노랑 이웃) 인접 검사가 깨진다 — 새 집을 만들면 표시 순서로 검증기를 돌린다.
 * 8개를 넘으면 새 색을 만들지 말고 「기타」로 접거나 나눠 그린다.
 *
 * A 셸 — 흰 카드·잉크 숫자는 CSS 토큰(--dsc-*)이 담당
 * B 구성 — 파이·트리맵·점유 (SERIES 순서, 옛 파스텔은 모든 검사 탈락이라 폐기)
 * C 정체성 — 이름 고정 (항구·RFMO·트레이더·VDS 항목). 집마다 SERIES 를 제 표시 순서로 쓴다
 * D 순위 — 단일 시리즈 막대
 * 품목 파일(lib/*-chart-colors)은 대응표만 두고 색은 여기서 가져온다. 메뉴 액센트(*_ACCENT)는 차트 밖에만 쓴다.
 */

export const SERIES = [
  '#3987e5', // 1 파랑
  '#d95926', // 2 주황
  '#199e70', // 3 청록
  '#c98500', // 4 노랑
  '#d55181', // 5 자홍
  '#008300', // 6 초록
  '#9085e9', // 7 보라
  '#e66767', // 8 빨강
] as const;

/** 「기타」·미분류 — 범주 색이 아니다(채도 없음). */
export const SERIES_OTHER = '#71717a';

/** 품목 공통 역할 — 주 물량·강조·보조. SERIES 앞 세 칸은 모든 쌍 검사(--pairs all)까지 통과한다. */
export const CHART_ROLE = {
  volume: SERIES[0],
  highlight: SERIES[1],
  second: SERIES[2],
} as const;

export const CHART_SHARE = SERIES;

export const RFMO_ID = {
  WCPFC: SERIES[0],
  IOTC: SERIES[1],
  IATTC: SERIES[2],
  ICCAT: SERIES[3],
  CCSBT: SERIES[4],
} as const;

/** 항구 정체성 — 가다랑어·황다랑어가 같은 항구면 같은 색. 시장 동향 선 순서(방콕·만타·아비장·세이셸·비고)대로. */
export const HUB_ID = {
  bkk: SERIES[0],
  mnt: SERIES[1],
  abj: SERIES[2],
  sey: SERIES[3],
  vig: SERIES[4],
} as const;

/** 순위 막대 단색. 한 시리즈라 이웃이 없다 — 자홍(흰 카드 대비 3:1 통과). */
export const CHART_RANK = HUB_ID.vig;

/** 어창·홀·캐너리 선 — 8칸을 넘는 유일한 집. 9번째부터는 검증 밖이라 범례·툴팁 이름으로 구분한다. */
export const HOLD_ID = [
  ...SERIES,
  '#0ea5e9',
  '#64748b',
  '#14b8a6',
  '#84cc16',
] as const;

export function colorForHold(index: number): string {
  return HOLD_ID[((index % HOLD_ID.length) + HOLD_ID.length) % HOLD_ID.length];
}

/** 파노피 정체성 — 채널·항구. 파노피 차트 세 곳의 계열 순서(채널별 어가 · 가공사별 처리량 · 트럭·탱커 유가)가
 * 모두 인접 검사를 통과하도록 전수 탐색으로 고른 배치다(2026-09-11). 순서를 바꾸면 다시 검증한다. */
export const PANOFI_ID = {
  cosmo: SERIES[0],
  pfc: SERIES[1],
  scodi: SERIES[2],
  scasa: SERIES[3],
  abidjan: SERIES[6],
  tema: SERIES[4],
  dakar: SERIES[5],
  tanker: SERIES[7],
} as const;

/** 원산·수입 상대국 정체성 — 사이드바 밖 공개 페이지(/squid · /ffa-report)가 같은 나라를 같은 색으로 그린다.
 * 슬롯은 오징어 한국 수입 상위 6개국의 누적 순서(중국·페루·베트남·칠레·에쿠아도르·아르헨티나)로 잡았고,
 * 미국 로인 수입 스택(태국·베트남·피지·중국)도 이 배치로 인접 검사를 통과한다(2026-09-12). */
export const COUNTRY_ID = {
  중국: SERIES[0],
  페루: SERIES[1],
  베트남: SERIES[2],
  칠레: SERIES[3],
  에쿠아도르: SERIES[4],
  아르헨티나: SERIES[5],
  태국: SERIES[6],
  피지: SERIES[7],
  기타: SERIES_OTHER,
} as const;

/** 트레이더 정체성 — 물류·방콕이 같은 이름에 같은 색. */
export const TRADER_ID = {
  FCF: SERIES[0],
  ITOCHU: SERIES[1],
  'TRI MARINE': SERIES[2],
  DIRECT: SERIES[3],
  MALDIVES: SERIES[4],
} as const;

/** 태국 항구 쌍 — 방콕·송클라. */
export const THAI_PORT_ID = {
  bangkok: SERIES[0],
  songkhla: SERIES[1],
} as const;

/** VDS 요약 칸 — 배정·소진·잔여·주간. */
export const VDS_ID = {
  allocated: SERIES[0],
  consumed: SERIES[1],
  remaining: SERIES[2],
  weekly: SERIES[3],
} as const;

export const NEWS_CATEGORY_ID = {
  시장: SERIES[0],
  규제: SERIES[1],
  원료가: SERIES[2],
  무역: SERIES[3],
  조업: SERIES[4],
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
