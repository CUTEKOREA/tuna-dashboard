import { describe, expect, it } from 'vitest';

import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';

function sum<T>(items: readonly T[], select: (item: T) => number) {
  return items.reduce((total, item) => total + select(item), 0);
}

describe('2026-10-07 Bangkok Office weekly logistics report', () => {
  it('정정본 원문을 출처로 못박고 무엇을 고쳤는지 함께 들고 있다', () => {
    expect(logisticsWeeklyReport.source).toMatchObject({
      file: '20261007 Bangkok Office Weekly Report.docx',
      reportDate: '2026-10-07',
      sha256: 'd83616a537eb08be465a6f0c762bfba205e85de2a57d9c3d086dafa325f319a2',
    });
    // 이번 주 원문도 수정 전 서식 위에 작성돼 지난주 정정분(2023·2025 합계, RYOMA, SHIN FUJI, 절 번호)이 되돌아가 있었다
    expect(logisticsWeeklyReport.source.corrections).toHaveLength(4);
    expect(logisticsWeeklyReport.source.corrections[0]).toContain('수정 전 서식');
    expect(logisticsWeeklyReport.source.corrections[1]).toContain('RYOMA');
  });

  it('월별·트레이더 누계가 원문 합계행과 맞는다', () => {
    const monthlyTotal = sum(logisticsWeeklyReport.traderReceipts.monthly, (month) => month.total);
    const traderTotal = sum(logisticsWeeklyReport.traderReceipts.traders, (trader) => trader.total);

    expect(logisticsWeeklyReport.traderReceipts.latestMonth).toEqual({
      month: '10월', FCF: 4840, ITOCHU: 0, 'TRI MARINE': 0, direct: 0, Maldives: 0, total: 4840,
    });
    // 9월 행은 RYOMA 3,290MT 기준을 유지한다(원문 11,947 · 29,901 은 3,490MT 로 되돌아간 값)
    expect(logisticsWeeklyReport.traderReceipts.monthly[8]).toMatchObject({ month: '9월', direct: 11747, total: 29701 });
    expect(monthlyTotal).toBe(368039);
    expect(traderTotal).toBe(368039);
    expect(sum(logisticsWeeklyReport.traderReceipts.monthly, (month) => month.FCF)).toBe(151981);
    expect(sum(logisticsWeeklyReport.traderReceipts.monthly, (month) => month.direct)).toBe(119449);
  });

  it('캐너리 생산·재고 합계가 정정본 SUM 행과 맞는다', () => {
    const { bangkok, songkhla } = logisticsWeeklyReport.canneries;
    // 원문 SUM 1,840 · 81,200 은 행 합계와 달라 정정본에서 1,900 · 81,700 으로 고쳤다
    expect(sum(bangkok, (cannery) => cannery.currentProduction)).toBe(1900);
    expect(sum(bangkok, (cannery) => cannery.currentStock)).toBe(81700);
    expect(sum(songkhla, (cannery) => cannery.currentProduction)).toBe(270);
    expect(sum(songkhla, (cannery) => cannery.currentStock)).toBe(4000);
    // 처리일수는 재고 ÷ 일 생산을 반올림한 값이다(원문이 지난주 값으로 남던 칸)
    for (const c of [...bangkok, ...songkhla]) expect(c.processingDays).toBe(Math.round(c.currentStock / c.currentProduction));
  });

  it('하역 중 운반선 표와 10월 누계를 따로 든다', () => {
    const { vessels, currentTotal, monthToDate, unloadingNow } = logisticsWeeklyReport.unloading;
    expect(vessels.map((vessel) => vessel.name)).toEqual(['HUA FU 107', 'CHERRY STAR', 'RYOMA']);
    expect(sum(vessels, (vessel) => vessel.amount)).toBe(11545);
    expect(currentTotal).toEqual({ vessels: 3, amount: 11545 });
    expect(monthToDate).toEqual({ vessels: 1, amount: logisticsWeeklyReport.traderReceipts.latestMonth.total });
    expect(unloadingNow).toEqual({ port: '방콕', vessels: 3 });
    expect(vessels.find((vessel) => vessel.name === 'RYOMA')?.amount).toBe(3290);
  });

  it('고반려는 원문 인쇄값을 남기고 잔량 차이를 덮지 않는다', () => {
    const rows = logisticsWeeklyReport.highRejections;
    expect(rows).toHaveLength(4);
    expect(logisticsWeeklyReport.market).toMatchObject({ rawMaterialPriceUsdPerMt: 2360, reportDate: '2026-10-07' });

    const gap = (row: (typeof rows)[number]) =>
      Number((row.quantityMt - sum(row.items, (item) => item.mt) - row.balanceMt).toFixed(3));
    // 넷째 행은 어종별 처리량 없이 「All rejection 1.99 by negotiation」만 적혀 잔량이 지난주 값으로 남았다
    expect(rows.map((row) => gap(row) || 0)).toEqual([0, 0, 0, 10.682]);
    expect(rows[3].items).toEqual([]);
    expect(rows[3].note).toContain('1.99');
  });
});
