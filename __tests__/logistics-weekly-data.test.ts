import { describe, expect, it } from 'vitest';

import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';

function sum<T>(items: readonly T[], select: (item: T) => number) {
  return items.reduce((total, item) => total + select(item), 0);
}

describe('2026-08-05 Bangkok Office weekly logistics report', () => {
  it('identifies the canonical source and report date without inferring a period', () => {
    expect(logisticsWeeklyReport.source).toEqual({
      file: '20260805 Bangkok Office Weekly Report.docx',
      reportDate: '2026-08-05',
      sha256: '2ddb233def797ab6b0cd04dd3180b33e55ef88223a658039e0413acd47e249b1',
    });
  });

  it('keeps monthly and trader year-to-date receipts reconciled', () => {
    const monthlyTotal = sum(logisticsWeeklyReport.traderReceipts.monthly, (month) => month.total);
    const traderTotal = sum(logisticsWeeklyReport.traderReceipts.traders, (trader) => trader.total);

    expect(logisticsWeeklyReport.traderReceipts.august).toEqual({
      month: '8월',
      FCF: 3951,
      ITOCHU: 4940,
      'TRI MARINE': 0,
      direct: 0,
      Maldives: 0,
      total: 8891,
    });
    expect(monthlyTotal).toBe(317175);
    expect(traderTotal).toBe(317175);
    expect(logisticsWeeklyReport.traderReceipts.reconciliationNote).toContain('원문 TRI MARINE 누계 46,463MT');
    expect(logisticsWeeklyReport.traderReceipts.reconciliationNote).toContain('월별 검산값 56,463MT');
  });

  it('matches cannery production and inventory totals', () => {
    expect(sum(logisticsWeeklyReport.canneries.bangkok, (cannery) => cannery.currentProduction)).toBe(2650);
    expect(sum(logisticsWeeklyReport.canneries.bangkok, (cannery) => cannery.currentStock)).toBe(122300);
    expect(sum(logisticsWeeklyReport.canneries.songkhla, (cannery) => cannery.currentProduction)).toBe(330);
    expect(sum(logisticsWeeklyReport.canneries.songkhla, (cannery) => cannery.currentStock)).toBe(4500);
  });

  it('matches the three unloading carriers and report total', () => {
    expect(logisticsWeeklyReport.unloading.vessels).toHaveLength(3);
    expect(sum(logisticsWeeklyReport.unloading.vessels, (vessel) => vessel.amount)).toBe(13764);
    expect(logisticsWeeklyReport.unloading.currentTotal).toEqual({ vessels: 3, amount: 13764 });
    expect(logisticsWeeklyReport.unloading.monthToDate).toEqual({ vessels: 2, amount: 8891 });
  });

  it('retains market and quality signals without presenting them as live data', () => {
    expect(logisticsWeeklyReport.market).toMatchObject({
      rawMaterialPriceUsdPerMt: 1930,
      reportDate: '2026-08-05',
    });
    expect(logisticsWeeklyReport.qualityIssues).toEqual([
      expect.objectContaining({ cannery: 'TUG', category: '고반려', remainingAmount: 923.092 }),
      expect.objectContaining({ cannery: 'CMC', category: '고반려', remainingAmount: 109.767 }),
      expect.objectContaining({ cannery: 'UC', category: '고반려', remainingAmount: 218.277 }),
      expect.objectContaining({ cannery: 'TUM', category: '고염도', affectedAmount: 217.103, claimUsd: 6493.44 }),
    ]);
  });
});
