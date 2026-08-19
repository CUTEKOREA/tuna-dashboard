import { describe, expect, it } from 'vitest';
import { getGmtsDashboard } from '../lib/data/gmts';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1_000;

function hasOtherKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasOtherKey);
  if (value === null || typeof value !== 'object') return false;

  return Object.entries(value).some(([key, child]) => (
    key.toLowerCase() === 'other' || hasOtherKey(child)
  ));
}

describe('GMTS dashboard data intake', () => {
  it('preserves the static archive metadata and report-date boundary', () => {
    const data = getGmtsDashboard();

    expect(data.schemaVersion).toBe(1);
    expect(data.metadata).toEqual({
      status: 'STATIC',
      reportCount: 31,
      pageCount: 39,
      firstReportDate: '2026-01-21',
      coverageStart: '2026-01-21',
      coverageEnd: '2026-08-19',
      latestReportDate: '2026-08-19',
    });
    expect(data.latest.operationalAsOf).toBeNull();
    expect(data.weekly.every(({ operationalAsOf }) => operationalAsOf === null)).toBe(true);
  });

  it('keeps all 31 Wednesday reports in continuous chronological order', () => {
    const dates = getGmtsDashboard().weekly.map(({ reportDate }) => reportDate);

    expect(dates).toHaveLength(31);
    expect(dates[0]).toBe('2026-01-21');
    expect(dates.at(-1)).toBe('2026-08-19');
    expect(new Set(dates).size).toBe(31);
    for (let index = 1; index < dates.length; index += 1) {
      expect(Date.parse(dates[index]) - Date.parse(dates[index - 1])).toBe(ONE_WEEK_MS);
    }
  });

  it('keeps month series as 12-position arrays and annual rows from 2019 through 2026', () => {
    const data = getGmtsDashboard();

    expect(data.weekly.every(({ volume2026 }) => volume2026.months.length === 12)).toBe(true);
    expect(data.volumeHistory.snapshots).toHaveLength(31);
    expect(data.volumeHistory.snapshots.every(({ volume2026 }) => volume2026.months.length === 12)).toBe(true);
    expect(data.volumeHistory.annual.map(({ year }) => year)).toEqual([
      2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
    ]);
    expect(data.volumeHistory.annual.every(({ months }) => months.length === 12)).toBe(true);
  });

  it('preserves declared and observed vessel counts without turning a blank into zero', () => {
    const { port } = getGmtsDashboard().latest;

    expect(port.active).toMatchObject({ declaredCount: 2, recordCount: 2 });
    expect(port.active.records).toHaveLength(2);
    expect(port.completed).toMatchObject({ declaredCount: null, recordCount: 0, records: [] });
    expect(port.incoming).toMatchObject({ declaredCount: 2, recordCount: 2 });
    expect(port.incoming.records).toHaveLength(2);
  });

  it('preserves the latest port, cannery, price, and volume numerical anchors', () => {
    const { latest, weekly } = getGmtsDashboard();
    const active = latest.port.active.records;
    const incoming = latest.port.incoming.records;

    expect(active.reduce((sum, row) => sum + (row.cargo ?? 0), 0)).toBeCloseTo(4925.08, 3);
    expect(active.reduce((sum, row) => sum + (row.discharged ?? 0), 0)).toBeCloseTo(2252.63, 3);
    // F/V QUEEN ELLICE 는 총화물 580.000 대비 631.300 양하(초과 51.300) — short 는 원문 공란 유지
    expect(active.find(({ sourceIdentifier }) => sourceIdentifier === 'F/V QUEEN ELLICE'))
      .toMatchObject({ cargo: 580, discharged: 631.3, short: null });
    expect(incoming.reduce((sum, row) => sum + (row.cargo ?? 0), 0)).toBeCloseTo(4994.414, 3);
    expect(incoming.find(({ sourceIdentifier }) => sourceIdentifier === 'MV SEIN QUEEN'))
      .toMatchObject({ gensanAllocation: 2092.414, etaOrUnloadingDate: '2026/08/17(AMEND)' });
    expect(latest.canneryTotal).toEqual({
      maxDailyProductionMt: 1095,
      currentDailyProductionMt: 895,
      productionUtilizationPct: 82,
      storageCapacityMt: 40600,
      currentStockMt: 17550,
      storageUtilizationPct: 43,
      reportedProcessingDays: 20,
    });
    expect(latest.prices.nonGspNonMsc).toMatchObject({ amount: 1900, basisUnit: null });
    expect(latest.prices.gspNonMsc).toMatchObject({ amount: 2025, basisUnit: null });
    expect(weekly.at(-1)?.volume2026).toMatchObject({ year: 2026, total: 63736 });
  });

  it('retains the February revision and both source snapshots', () => {
    const { volumeHistory } = getGmtsDashboard();

    expect(volumeHistory.revisions).toEqual([{
      month: '2026-02',
      previousReportDate: '2026-03-04',
      previousValue: 6220,
      reportDate: '2026-03-11',
      value: 11968,
    }]);
    expect(volumeHistory.snapshots.find(({ reportDate }) => reportDate === '2026-03-04')
      ?.volume2026.months[1]).toBe(6220);
    expect(volumeHistory.snapshots.find(({ reportDate }) => reportDate === '2026-03-11')
      ?.volume2026.months[1]).toBe(11968);
  });

  it('keeps missing price and volume units explicit in data and quality flags', () => {
    const data = getGmtsDashboard();

    expect(data.volumeHistory.unit).toBeNull();
    expect(data.weekly.every(({ prices }) => (
      prices.nonGspNonMsc.basisUnit === null && prices.gspNonMsc.basisUnit === null
    ))).toBe(true);
    expect(data.qualityFlags).toEqual(expect.arrayContaining([
      { code: 'price_basis_unit_missing', field: 'price_basis_unit_missing' },
      { code: 'volume_unit_missing', field: 'volume_unit_missing' },
    ]));
  });

  it('preserves the latest source manifest anchor', () => {
    const data = getGmtsDashboard();

    expect(data.sources).toHaveLength(31);
    expect(data.sources.at(-1)).toEqual({
      reportDate: '2026-08-19',
      fileName: 'GMTS Weekly Report 20260819.pdf',
      sha256: '7d52ec98dc203c0bb6f12b25b3748de4599b6579ec6275d281350562a6afbc23',
      pages: 1,
    });
    expect(data.latest.source).toEqual(data.sources.at(-1));
  });

  it('excludes the personal Other section from the dashboard contract', () => {
    expect(hasOtherKey(getGmtsDashboard())).toBe(false);
  });
});
