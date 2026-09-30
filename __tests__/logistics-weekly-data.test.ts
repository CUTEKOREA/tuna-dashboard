import { describe, expect, it } from 'vitest';

import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';

function sum<T>(items: readonly T[], select: (item: T) => number) {
  return items.reduce((total, item) => total + select(item), 0);
}

describe('2026-09-30 Bangkok Office weekly logistics report', () => {
  it('정정본 원문을 출처로 못박고 무엇을 고쳤는지 함께 들고 있다', () => {
    expect(logisticsWeeklyReport.source).toMatchObject({
      file: '20260930 Bangkok Office Weekly Report .docx',
      reportDate: '2026-09-30',
      sha256: '4c68e365c346e874acc60dbc63a8dbf416a976d44ee2c2bcc3f7126a6eeb30a7',
    });
    // 이번 주 원문은 9/23 수정 전 서식으로 작성돼 지난주 정정분이 되돌아가 있었다
    expect(logisticsWeeklyReport.source.corrections).toHaveLength(4);
    expect(logisticsWeeklyReport.source.corrections[0]).toContain('수정 전 서식');
    expect(logisticsWeeklyReport.source.corrections[1]).toContain('RYOMA');
  });

  it('월별·트레이더 누계가 원문 합계행과 맞는다', () => {
    const monthlyTotal = sum(logisticsWeeklyReport.traderReceipts.monthly, (month) => month.total);
    const traderTotal = sum(logisticsWeeklyReport.traderReceipts.traders, (trader) => trader.total);

    // 9월: CHERRY STAR(ITOCHU 3,415)가 새로 들어오고 RYOMA 는 3,290MT 를 유지한다
    expect(logisticsWeeklyReport.traderReceipts.latestMonth).toEqual({
      month: '9월',
      FCF: 14539,
      ITOCHU: 3415,
      'TRI MARINE': 0,
      direct: 11747,
      Maldives: 0,
      total: 29701,
    });
    expect(monthlyTotal).toBe(363199);
    expect(traderTotal).toBe(363199);

    const itochu = sum(logisticsWeeklyReport.traderReceipts.monthly, (month) => month.ITOCHU);
    const direct = sum(logisticsWeeklyReport.traderReceipts.monthly, (month) => month.direct);
    expect(itochu).toBe(40146);
    expect(direct).toBe(119449);
  });

  it('캐너리 생산·재고 합계가 원문 SUM 행과 맞는다', () => {
    const { bangkok, songkhla } = logisticsWeeklyReport.canneries;
    expect(sum(bangkok, (cannery) => cannery.currentProduction)).toBe(2150);
    // 원문 SUM 86,600 은 행 합계와 700 어긋나 정정본에서 87,300 으로 고쳤다
    expect(sum(bangkok, (cannery) => cannery.currentStock)).toBe(87300);
    expect(sum(songkhla, (cannery) => cannery.currentProduction)).toBe(330);
    expect(sum(songkhla, (cannery) => cannery.currentStock)).toBe(5000);

    const spa = bangkok.find((cannery) => cannery.name === 'SPA')!;
    expect(spa.currentStock).toBe(spa.storageCapacity);
  });

  it('하역 중 운반선 표와 9월 누계를 따로 든다', () => {
    const { vessels, currentTotal, monthToDate, unloadingNow } = logisticsWeeklyReport.unloading;

    expect(vessels.map((vessel) => vessel.name)).toEqual(['FONG KUO 818', 'CHERRY STAR', 'RYOMA']);
    expect(sum(vessels, (vessel) => vessel.amount)).toBe(11585);
    expect(currentTotal).toEqual({ vessels: 3, amount: 11585 });
    // 누계는 월별표 9월 행과 같아야 한다
    expect(monthToDate).toEqual({ vessels: 8, amount: logisticsWeeklyReport.traderReceipts.latestMonth.total });
    expect(unloadingNow).toEqual({ port: '방콕', vessels: 3 });
    expect(vessels.find((vessel) => vessel.name === 'RYOMA')?.amount).toBe(3290);
  });

  it('고반려는 원문 인쇄값을 남기고 잔량 차이를 덮지 않는다', () => {
    const rows = logisticsWeeklyReport.highRejections;
    expect(rows).toHaveLength(5);
    expect(logisticsWeeklyReport.market).toMatchObject({
      rawMaterialPriceUsdPerMt: 2300,
      reportDate: '2026-09-30',
    });

    const gap = (row: (typeof rows)[number]) =>
      Number((row.quantityMt - sum(row.items, (item) => item.mt) - row.balanceMt).toFixed(3));

    // SHIN FUJI 는 정정본에서 84.511MT 로 고쳐 맞고, 두 행은 원문 그대로 어긋난다
    expect(rows.map(gap)).toEqual([-76.182, 0, 0, 0, -0.45]);
    expect(rows[3].items.map((item) => item.species)).toEqual(['SKJ', 'YF']);
  });
});
