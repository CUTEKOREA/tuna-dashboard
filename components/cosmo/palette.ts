import { CHART_RANK, PANOFI_ID, SERIES as PALETTE, shareColor } from '@/lib/chart-palette';

/**
 * 코스모 차트 색. 시리즈는 hex 를 넘긴다 — Chart.readTokens 는 격자·축만 푼다.
 *
 * 슬롯은 순위가 아니라 **대상**이 정한다 — 같은 대상은 어느 탭에서든 같은 칸을 쓴다(2026-09-12).
 *   s1 파랑  매출 · 실적(누적·주간) · CBU · 통조림 · 원어가 SJ · 외부 순현금흐름
 *   s2 주황  계획 · 순손익(순이익률) · 어분 · MT당 노무비 · 환율
 *   s3 청록  FBU · 수주잔량 금액 · 에너지 · 전년 동월 · 주간 수율 · GHC 보유
 *   s4 노랑  매출총이익(률) · 현금잔액 · 제품재고 · YF/BE · CBU 소계 · 시장 평균
 *   s5 자홍  총재고 · 원어재고 · 주간 일처리량
 *   rank(=s5) 이웃 없는 연간 순위 막대 전용
 * 예외 하나 — ProfitTab 「CBU 소계」는 같은 차트의 통조림(s1)과 겹쳐서 s1 을 못 쓴다.
 * 남은 칸 중 s4 만 인접 ΔE 검사를 통과해 s4 로 둔다(s5·s7 배치는 정상시각 ΔE 15 미만으로 탈락).
 */
export const C = {
  // 계열 1~5는 SERIES 앞 다섯 칸을 순서대로 — 이 순서가 인접 색각 검사를 통과한다(2026-09-11).
  s1: PALETTE[0],
  s2: PALETTE[1],
  s3: PALETTE[2],
  s4: PALETTE[3],
  s5: PALETTE[4],
  rank: CHART_RANK,
  mix: [shareColor(0), shareColor(1), shareColor(2), shareColor(3)] as const,
  sign: ['#ef4444', '#3b82f6'] as [string, string], // 손익 부호 — 상태색이라 팔레트 밖
  danger: '#ef4444',
  cosmo: PANOFI_ID.cosmo,
};

export const SERIES = [C.s1, C.s2, C.s3, C.s4, C.s5] as const;
