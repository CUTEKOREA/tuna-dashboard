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
      reportCount: 30,
      pageCount: 38,
      firstReportDate: '2026-01-21',
      coverageStart: '2026-01-21',
      coverageEnd: '2026-08-12',
      latestReportDate: '2026-08-12',
    });
    expect(data.latest.operationalAsOf).toBeNull();
    expect(data.weekly.every(({ operationalAsOf }) => operationalAsOf === null)).toBe(true);
  });

  it('keeps all 30 Wednesday reports in continuous chronological order', () => {
    const dates = getGmtsDashboard().weekly.map(({ reportDate }) => reportDate);

    expect(dates).toHaveLength(30);
    expect(dates[0]).toBe('2026-01-21');
    expect(dates.at(-1)).toBe('2026-08-12');
    expect(new Set(dates).size).toBe(30);
    for (let index = 1; index < dates.length; index += 1) {
      expect(Date.parse(dates[index]) - Date.parse(dates[index - 1])).toBe(ONE_WEEK_MS);
    }
  });

  it('keeps month series as 12-position arrays and annual rows from 2019 through 2026', () => {
    const data = getGmtsDashboard();

    expect(data.weekly.every(({ volume2026 }) => volume2026.months.length === 12)).toBe(true);
    expect(data.volumeHistory.snapshots).toHaveLength(30);
    expect(data.volumeHistory.snapshots.every(({ volume2026 }) => volume2026.months.length === 12)).toBe(true);
    expect(data.volumeHistory.annual.map(({ year }) => year)).toEqual([
      2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
    ]);
    expect(data.volumeHistory.annual.every(({ months }) => months.length === 12)).toBe(true);
  });

  it('preserves declared and observed vessel counts without turning a blank into zero', () => {
    const { port } = getGmtsDashboard().latest;

    expect(port.active).toMatchObject({ declaredCount: null, recordCount: 0, records: [] });
    expect(port.completed).toMatchObject({ declaredCount: 2, recordCount: 2 });
    expect(port.completed.records).toHaveLength(2);
    expect(port.incoming).toMatchObject({ declaredCount: 3, recordCount: 3 });
    expect(port.incoming.records).toHaveLength(3);
  });

  it('preserves the latest port, cannery, price, and volume numerical anchors', () => {
    const { latest, weekly } = getGmtsDashboard();
    const completed = latest.port.completed.records;
    const incoming = latest.port.incoming.records;

    expect(completed.reduce((sum, row) => sum + (row.cargo ?? 0), 0)).toBeCloseTo(2387.141, 3);
    expect(completed.reduce((sum, row) => sum + (row.discharged ?? 0), 0)).toBeCloseTo(2184.11, 3);
    expect(completed.reduce((sum, row) => sum + (row.short ?? 0), 0)).toBeCloseTo(203.031, 3);
    expect(incoming.reduce((sum, row) => sum + (row.cargo ?? 0), 0)).toBeCloseTo(9919.494, 3);
    expect(incoming.find(({ sourceIdentifier }) => sourceIdentifier === 'MV SEIN QUEEN'))
      .toMatchObject({ gensanAllocation: 2092.414, etaOrUnloadingDate: '2026/08/12-13' });
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

    expect(data.sources).toHaveLength(30);
    expect(data.sources.at(-1)).toEqual({
      reportDate: '2026-08-12',
      fileName: 'GMTS Weekly Report 20260812.pdf',
      sha256: 'e84ad3bb26ebe05e863467bff3f4507775a8cf4b04adefa8026eb3414e1e5243',
      pages: 1,
    });
    expect(data.latest.source).toEqual(data.sources.at(-1));
  });

  it('excludes the personal Other section from the dashboard contract', () => {
    expect(hasOtherKey(getGmtsDashboard())).toBe(false);
  });
});
