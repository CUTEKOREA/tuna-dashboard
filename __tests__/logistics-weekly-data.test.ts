import { describe, expect, it } from 'vitest';

import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';

function sum<T>(items: readonly T[], select: (item: T) => number) {
  return items.reduce((total, item) => total + select(item), 0);
}

describe('2026-09-23 Bangkok Office weekly logistics report', () => {
  it('정정본 원문을 출처로 못박고 무엇을 고쳤는지 함께 들고 있다', () => {
    expect(logisticsWeeklyReport.source).toMatchObject({
      file: '20260923 Bangkok Office Weekly Report.docx',
      reportDate: '2026-09-23',
      sha256: 'eab43fa3777620eaab20289138d83b3fc04cadcadbdd7e7fffa7279ea0ce8e43',
    });
    // 원문을 고쳐서 반영했다 - 무엇을 고쳤는지 계약이 들고 있지 않으면 다음 주에 되돌아간다
    expect(logisticsWeeklyReport.source.corrections).toHaveLength(4);
    expect(logisticsWeeklyReport.source.corrections[1]).toContain('9월 행');
  });

  it('월별·트레이더 누계가 원문 합계행과 맞는다', () => {
    const monthlyTotal = sum(logisticsWeeklyReport.traderReceipts.monthly, (month) => month.total);
    const traderTotal = sum(logisticsWeeklyReport.traderReceipts.traders, (trader) => trader.total);

    // 9월 행은 전주 값(3척 12,693 · 2척 8,457)으로 남아 있던 것을 정정한 값이다
    expect(logisticsWeeklyReport.traderReceipts.latestMonth).toEqual({
      month: '9월',
      FCF: 14539,
      ITOCHU: 0,
      'TRI MARINE': 0,
      direct: 11947,
      Maldives: 0,
      total: 26486,
    });
    expect(monthlyTotal).toBe(359984);
    expect(traderTotal).toBe(359984);

    // 트레이더별 세로합도 원문 합계행과 같아야 한다
    const fcf = sum(logisticsWeeklyReport.traderReceipts.monthly, (month) => month.FCF);
    const direct = sum(logisticsWeeklyReport.traderReceipts.monthly, (month) => month.direct);
    expect(fcf).toBe(147141);
    expect(direct).toBe(119649);
  });

  it('캐너리 생산·재고 합계가 원문 SUM 행과 맞는다', () => {
    const { bangkok, songkhla } = logisticsWeeklyReport.canneries;
    expect(sum(bangkok, (cannery) => cannery.currentProduction)).toBe(2170);
    expect(sum(bangkok, (cannery) => cannery.currentStock)).toBe(91250);
    expect(sum(songkhla, (cannery) => cannery.currentProduction)).toBe(330);
    expect(sum(songkhla, (cannery) => cannery.currentStock)).toBe(5600);

    // SPA 는 재고가 보관능력과 같다 - 만재를 평균에 묻지 않는다
    const spa = bangkok.find((cannery) => cannery.name === 'SPA')!;
    expect(spa.currentStock).toBe(spa.storageCapacity);
  });

  it('9월 반입 운반선 7척이 합계와 맞는다', () => {
    const { vessels, currentTotal, monthToDate, unloadingNow } = logisticsWeeklyReport.unloading;

    expect(vessels).toHaveLength(7);
    expect(sum(vessels, (vessel) => vessel.amount)).toBe(26486);
    expect(currentTotal).toEqual({ vessels: 7, amount: 26486 });
    expect(monthToDate).toEqual({ vessels: 7, amount: 26486 });
    // 원문에서 빠져 있던 두 척 - 지우면 9월 누계가 다시 어긋난다
    expect(vessels.map((vessel) => vessel.name)).toContain('SEIN QUEEN');
    expect(vessels.map((vessel) => vessel.name)).toContain('ZHONG YU MARINE');

    const fcf = vessels.filter((vessel) => vessel.trader === 'FCF');
    expect(fcf).toHaveLength(4);
    expect(sum(fcf, (vessel) => vessel.amount)).toBe(14539);
    expect(sum(vessels.filter((vessel) => vessel.trader === 'DIRECT'), (vessel) => vessel.amount)).toBe(11947);
    // 하역 중 척수는 누계 척수와 다른 값이다
    expect(unloadingNow).toEqual({ port: '방콕', vessels: 5 });
  });

  it('고반려는 원문 인쇄값을 남기고 잔량 차이를 덮지 않는다', () => {
    const rows = logisticsWeeklyReport.highRejections;
    expect(rows).toHaveLength(5);
    expect(logisticsWeeklyReport.market).toMatchObject({
      rawMaterialPriceUsdPerMt: 2300,
      reportDate: '2026-09-23',
    });

    const gap = (row: (typeof rows)[number]) =>
      Number((row.quantityMt - sum(row.items, (item) => item.mt) - row.balanceMt).toFixed(3));

    // 2행은 맞고 3행은 어긋난다 - 계산으로 덮으면 원문 대조가 불가능해진다
    expect(gap(rows[1])).toBe(0);
    expect(gap(rows[3])).toBe(0);
    expect(gap(rows[0])).toBe(-76.182);
    expect(gap(rows[2])).toBe(1.031);
    expect(gap(rows[4])).toBe(-0.45);
  });
});
