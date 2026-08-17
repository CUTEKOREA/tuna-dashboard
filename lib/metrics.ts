/**
 * 지표 계산 SSOT (P3-8, 2026-08-17 실측 감사 후 신설 — docs/2026-08-17_metric_ssot_audit.md).
 *
 * 같은 식이 저장소에 흩어져 정책이 갈라져 있던 두 계산을 한 곳에 고정한다:
 * - 증감률: 인라인 재구현 38곳, 0분모 가드가 제각각 (prev>0 / !==0 / abs / 없음)
 * - 진행률: 7파일 17라인, 클램프 4종 — 같은 선박이 간트 106% vs 상태판 100%로 표시되던 원인
 *
 * 정책 (여기 말고 다른 곳에서 다시 정하지 말 것):
 * - 0분모·비유한값은 null — 0%로 뭉개면 «보합»이라는 없는 주장이 생긴다 (SOUL ④).
 * - 진행률 기본은 클램프 없음 — 하역 초과(surplus)는 사실이므로 106%는 106%로 보인다.
 *   시각 게이지처럼 100 넘게 그릴 수 없는 곳만 clampMax를 명시적으로 켠다.
 */

/** 전기 대비 증감률(%). prev가 0·비유한값이면 null. */
export function pctChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/** 진행률(%) = actual/reported*100. 분모 0·비유한값이면 null. clampMax를 주면 상한 클램프. */
export function progressPct(
  actual: number,
  reported: number,
  options?: { clampMax?: number },
): number | null {
  if (!Number.isFinite(actual) || !Number.isFinite(reported) || reported === 0) return null;
  const raw = (actual / reported) * 100;
  return options?.clampMax !== undefined ? Math.min(raw, options.clampMax) : raw;
}
