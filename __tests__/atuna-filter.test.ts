import { describe, expect, it } from 'vitest';
import { filterAtunaHistory, type AtunaPriceRow } from '../lib/data/atuna-price-summary';

const rows: AtunaPriceRow[] = [
  { date: '2026-01-07', skj_bkk: 1500, yf_abj: 2400 },
  { date: '2026-01-21', skj_bkk: 1550 },
  { date: '2026-04-08', skj_bkk: 1700, yf_abj: 2500 },
  { date: '2026-07-15', skj_bkk: 1900, yf_abj: 2600 },
];

describe('filterAtunaHistory (V3 기간·입도 필터)', () => {
  it('전체 기간 + 주간 입도는 원본을 그대로 돌려준다', () => {
    expect(filterAtunaHistory(rows, 'all', 'week')).toEqual(rows);
  });

  it('기간 절단은 최신 관측일 기준이다 (오늘 날짜 아님)', () => {
    const sliced = filterAtunaHistory(rows, '6m', 'week');
    // 최신 2026-07-15 기준 6개월 → 2026-01-15 이후
    expect(sliced.map((r) => r.date)).toEqual(['2026-01-21', '2026-04-08', '2026-07-15']);
  });

  it('월간 입도는 시리즈별 관측치 평균이며 결측 시리즈를 0으로 채우지 않는다', () => {
    const monthly = filterAtunaHistory(rows, 'all', 'month');
    expect(monthly.map((r) => r.date)).toEqual(['2026-01', '2026-04', '2026-07']);
    expect(monthly[0].skj_bkk).toBe(1525); // (1500+1550)/2
    expect(monthly[0].yf_abj).toBe(2400);  // 관측 1회 — 평균은 그 값, 0 혼입 금지
    expect(monthly[1].skj_bkk).toBe(1700);
  });

  it('빈 입력은 빈 배열', () => {
    expect(filterAtunaHistory([], '3m', 'month')).toEqual([]);
  });
});
