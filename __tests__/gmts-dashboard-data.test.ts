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
      reportCount: 35,
      pageCount: 43,
      firstReportDate: '2026-01-21',
      coverageStart: '2026-01-21',
      coverageEnd: '2026-09-16',
      latestReportDate: '2026-09-16',
    });
    expect(data.latest.operationalAsOf).toBeNull();
    expect(data.weekly.every(({ operationalAsOf }) => operationalAsOf === null)).toBe(true);
  });

  it('keeps all 35 Wednesday reports in continuous chronological order', () => {
    const dates = getGmtsDashboard().weekly.map(({ reportDate }) => reportDate);

    expect(dates).toHaveLength(35);
    expect(dates[0]).toBe('2026-01-21');
    expect(dates.at(-1)).toBe('2026-09-16');
    expect(new Set(dates).size).toBe(35);
    for (let index = 1; index < dates.length; index += 1) {
      expect(Date.parse(dates[index]) - Date.parse(dates[index - 1])).toBe(ONE_WEEK_MS);
    }
  });

  it('keeps month series as 12-position arrays and annual rows from 2019 through 2026', () => {
    const data = getGmtsDashboard();

    expect(data.weekly.every(({ volume2026 }) => volume2026.months.length === 12)).toBe(true);
    expect(data.volumeHistory.snapshots).toHaveLength(35);
    expect(data.volumeHistory.snapshots.every(({ volume2026 }) => volume2026.months.length === 12)).toBe(true);
    expect(data.volumeHistory.annual.map(({ year }) => year)).toEqual([
      2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
    ]);
    expect(data.volumeHistory.annual.every(({ months }) => months.length === 12)).toBe(true);
  });

  it('preserves declared and observed vessel counts without turning a blank into zero', () => {
    const { port } = getGmtsDashboard().latest;

    expect(port.active).toMatchObject({ declaredCount: 1, recordCount: 1 });
    expect(port.active.records).toHaveLength(1);
    expect(port.completed).toMatchObject({ declaredCount: 1, recordCount: 1 });
    expect(port.completed.records).toHaveLength(1);
    expect(port.incoming).toMatchObject({ declaredCount: 5, recordCount: 5 });
    expect(port.incoming.records).toHaveLength(5);
  });

  it('preserves the latest port, cannery, price, and volume numerical anchors', () => {
    const { latest, weekly } = getGmtsDashboard();
    const active = latest.port.active.records;
    const incoming = latest.port.incoming.records;

    // 9/16 판은 하역 중 1척뿐이다. 부족분이 원문에 적혀 있어 short 가 채워진다.
    expect(active.reduce((sum, row) => sum + (row.cargo ?? 0), 0)).toBeCloseTo(1572.905, 3);
    expect(active.reduce((sum, row) => sum + (row.discharged ?? 0), 0)).toBeCloseTo(1362.36, 3);
    expect(active.find(({ sourceIdentifier }) => sourceIdentifier === 'MV FRANSESCA LT'))
      .toMatchObject({ cargo: 1572.905, discharged: 1362.36, short: 210.545 });
    // MV SEIN GALAXY 는 총화물 1,597.268 대비 1,446.220 양하, 부족분 151.048 로 9/9 에 종료됐다
    expect(latest.port.completed.records[0])
      .toMatchObject({ sourceIdentifier: 'MV SEIN GALAXY', cargo: 1597.268, discharged: 1446.22, short: 151.048 });
    // 입항 예정 5척은 전부 TBA — 화물량을 0으로 만들지 않고 공란 유지
    expect(incoming.every(({ cargo }) => cargo === null)).toBe(true);
    expect(latest.canneryTotal).toEqual({
      maxDailyProductionMt: 1095,
      currentDailyProductionMt: 895,
      productionUtilizationPct: 82,
      storageCapacityMt: 40600,
      currentStockMt: 17550,
      storageUtilizationPct: 43,
      reportedProcessingDays: 20,
    });
    expect(latest.prices.nonGspNonMsc).toMatchObject({ amount: 2025, basisUnit: null });
    expect(latest.prices.gspNonMsc).toMatchObject({ amount: 2140, basisUnit: null });
    expect(weekly.at(-1)?.volume2026).toMatchObject({ year: 2026, total: 79312 });
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

    expect(data.sources).toHaveLength(35);
    expect(data.sources.at(-1)).toEqual({
      reportDate: '2026-09-16',
      fileName: 'GMTS Weekly Report 20260916.pdf',
      sha256: '5622b4dbc10b20d7e5c0b74651f9bf71dd6188890b5e755cc560dd49a32ddd93',
      pages: 1,
    });
    expect(data.latest.source).toEqual(data.sources.at(-1));
  });

  it('excludes the personal Other section from the dashboard contract', () => {
    expect(hasOtherKey(getGmtsDashboard())).toBe(false);
  });
});
