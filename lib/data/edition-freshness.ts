/**
 * 보고서 연월(「2026년 10월」)의 신선도 — 왼쪽 메뉴 품목 줄의 상태 점이 쓴다.
 *
 * 기준일은 그 달 말일. 말일부터 90일 이내 fresh(초록), 365일 이내 aging(노랑),
 * 그보다 오래됐거나 연월을 읽지 못하면 stale(회색).
 * 순수 함수다 — 오늘 날짜는 호출부가 넘긴다(렌더 중 Date.now() 를 부르지 않기 위해).
 */
export type EditionFreshness = 'fresh' | 'aging' | 'stale';

const DAY_MS = 86_400_000;

/** 「YYYY년 M월」의 말일(UTC 자정, ms). 읽지 못하면 null. */
export function editionMonthEnd(edition: string | null | undefined): number | null {
  const m = /^\s*(\d{4})년\s*(\d{1,2})월\s*$/.exec(edition ?? '');
  if (!m) return null;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  // Date.UTC 의 일(day) 0 = 앞달 말일 → 월(1-base)을 그대로 넣으면 그 달 말일
  return Date.UTC(Number(m[1]), month, 0);
}

export function editionFreshness(edition: string | null | undefined, nowMs: number): EditionFreshness {
  const end = editionMonthEnd(edition);
  if (end === null) return 'stale';
  const days = Math.floor((nowMs - end) / DAY_MS);
  if (days <= 90) return 'fresh';
  if (days <= 365) return 'aging';
  return 'stale';
}
