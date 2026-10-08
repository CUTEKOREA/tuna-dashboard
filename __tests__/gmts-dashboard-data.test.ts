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
      reportCount: 38,
      pageCount: 46,
      firstReportDate: '2026-01-21',
      coverageStart: '2026-01-21',
      coverageEnd: '2026-10-07',
      latestReportDate: '2026-10-07',
    });
    expect(data.latest.operationalAsOf).toBeNull();
    expect(data.weekly.every(({ operationalAsOf }) => operationalAsOf === null)).toBe(true);
  });

  it('keeps all 38 Wednesday reports in continuous chronological order', () => {
    const dates = getGmtsDashboard().weekly.map(({ reportDate }) => reportDate);

    expect(dates).toHaveLength(38);
    expect(dates[0]).toBe('2026-01-21');
    expect(dates.at(-1)).toBe('2026-10-07');
    expect(new Set(dates).size).toBe(38);
    for (let index = 1; index < dates.length; index += 1) {
      expect(Date.parse(dates[index]) - Date.parse(dates[index - 1])).toBe(ONE_WEEK_MS);
    }
  });

  it('keeps month series as 12-position arrays and annual rows from 2019 through 2026', () => {
    const data = getGmtsDashboard();

    expect(data.weekly.every(({ volume2026 }) => volume2026.months.length === 12)).toBe(true);
    expect(data.volumeHistory.snapshots).toHaveLength(38);
    expect(data.volumeHistory.snapshots.every(({ volume2026 }) => volume2026.months.length === 12)).toBe(true);
    expect(data.volumeHistory.annual.map(({ year }) => year)).toEqual([
      2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
    ]);
    expect(data.volumeHistory.annual.every(({ months }) => months.length === 12)).toBe(true);
  });

  it('preserves declared and observed vessel counts without turning a blank into zero', () => {
    const { port } = getGmtsDashboard().latest;

    // 10/7 판은 VOLTA VICTORY 1척이 하역 중이고 종료 레인은 비었다 - 0을 «미보고»로 바꾸지 않는다
    expect(port.active).toMatchObject({ declaredCount: 1, recordCount: 1 });
    expect(port.active.records).toHaveLength(1);
    expect(port.completed).toMatchObject({ declaredCount: 0, recordCount: 0 });
    expect(port.completed.records).toHaveLength(0);
    expect(port.incoming).toMatchObject({ declaredCount: 3, recordCount: 3 });
    expect(port.incoming.records).toHaveLength(3);
  });

  it('preserves the latest port, cannery, price, and volume numerical anchors', () => {
    const { latest, weekly } = getGmtsDashboard();
    const active = latest.port.active.records;
    const incoming = latest.port.incoming.records;

    // VOLTA VICTORY: 원문 잔량 625.820 MT 는 총화물 − 양하(1,156.368)와 맞지 않는다 - 인쇄값을 그대로 둔다
    expect(active[0]).toMatchObject({ sourceIdentifier: 'MV VOLTA VICTORY', cargo: 1253.728, discharged: 97.36 });
    expect(active[0].rawText).toContain('Balance | 625.820 MT');
    // WEBO 307 은 TBA 라 화물량을 0으로 만들지 않고 공란 유지. SHIN FUJI 는 9/30 3,252.708 → 10/7 2,252.708 MT 로 인쇄됐다
    expect(incoming.map(({ displayName, cargo }) => [displayName, cargo]))
      .toEqual([['WEBO 307', null], ['IZAR ARGIA', 4191.09], ['SHIN FUJI', 2252.708]]);
    expect(latest.canneryTotal).toEqual({
      maxDailyProductionMt: 1095,
      currentDailyProductionMt: 895,
      productionUtilizationPct: 82,
      storageCapacityMt: 40600,
      currentStockMt: 17550,
      storageUtilizationPct: 43,
      reportedProcessingDays: 20,
    });
    expect(latest.prices.nonGspNonMsc).toMatchObject({ amount: 2300, basisUnit: null });
    expect(latest.prices.gspNonMsc).toMatchObject({ amount: 2400, basisUnit: null });
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

    expect(data.sources).toHaveLength(38);
    expect(data.sources.at(-1)).toEqual({
      reportDate: '2026-10-07',
      fileName: 'GMTS Weekly Report 20261007.pdf',
      sha256: '576982fd6425066a2a76680a5ac1d7593e82b1ab5bfa3738b569e1be9684d4ff',
      pages: 1,
    });
    expect(data.latest.source).toEqual(data.sources.at(-1));
  });

  it('excludes the personal Other section from the dashboard contract', () => {
    expect(hasOtherKey(getGmtsDashboard())).toBe(false);
  });
});
