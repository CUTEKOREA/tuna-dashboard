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
      reportCount: 39,
      pageCount: 47,
      firstReportDate: '2026-01-21',
      coverageStart: '2026-01-21',
      coverageEnd: '2026-10-14',
      latestReportDate: '2026-10-14',
    });
    expect(data.latest.operationalAsOf).toBeNull();
    expect(data.weekly.every(({ operationalAsOf }) => operationalAsOf === null)).toBe(true);
  });

  it('keeps all 39 Wednesday reports in continuous chronological order', () => {
    const dates = getGmtsDashboard().weekly.map(({ reportDate }) => reportDate);

    expect(dates).toHaveLength(39);
    expect(dates[0]).toBe('2026-01-21');
    expect(dates.at(-1)).toBe('2026-10-14');
    expect(new Set(dates).size).toBe(39);
    for (let index = 1; index < dates.length; index += 1) {
      expect(Date.parse(dates[index]) - Date.parse(dates[index - 1])).toBe(ONE_WEEK_MS);
    }
  });

  it('keeps month series as 12-position arrays and annual rows from 2019 through 2026', () => {
    const data = getGmtsDashboard();

    expect(data.weekly.every(({ volume2026 }) => volume2026.months.length === 12)).toBe(true);
    expect(data.volumeHistory.snapshots).toHaveLength(39);
    expect(data.volumeHistory.snapshots.every(({ volume2026 }) => volume2026.months.length === 12)).toBe(true);
    expect(data.volumeHistory.annual.map(({ year }) => year)).toEqual([
      2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
    ]);
    expect(data.volumeHistory.annual.every(({ months }) => months.length === 12)).toBe(true);
  });

  it('preserves declared and observed vessel counts without turning a blank into zero', () => {
    const { port } = getGmtsDashboard().latest;

    // 10/14 판은 SHIN FUJI·IZAR ARGIA 2척 하역 중, VOLTA VICTORY 1척 하역 완료, 입항 예정 4척(3척 TBA)
    expect(port.active).toMatchObject({ declaredCount: 2, recordCount: 2 });
    expect(port.active.records).toHaveLength(2);
    expect(port.completed).toMatchObject({ declaredCount: 1, recordCount: 1 });
    expect(port.completed.records).toHaveLength(1);
    expect(port.incoming).toMatchObject({ declaredCount: 4, recordCount: 4 });
    expect(port.incoming.records).toHaveLength(4);
  });

  it('preserves the latest port, cannery, price, and volume numerical anchors', () => {
    const { latest, weekly } = getGmtsDashboard();
    const active = latest.port.active.records;
    const incoming = latest.port.incoming.records;

    // SHIN FUJI 는 10/7 판만 2,252.708 MT 로 인쇄됐고 9/30·10/14 판은 3,252.708 MT 다
    expect(active.map(({ displayName, cargo, discharged }) => [displayName, cargo, discharged]))
      .toEqual([['SHIN FUJI', 3252.708, 2377.15], ['IZAR ARGIA', 4191.09, 1618.72]]);
    // VOLTA VICTORY 는 원문이 소수 4자리(1,298.9875)로 적었고 SHORT 는 총화물 − 양하와 맞는다
    expect(latest.port.completed.records[0]).toMatchObject({ displayName: 'VOLTA VICTORY', cargo: 1298.9875, discharged: 1099.45, short: 199.5375 });
    // TBA 3척은 화물량을 0으로 만들지 않고 공란 유지
    expect(incoming.map(({ displayName, cargo }) => [displayName, cargo]))
      .toEqual([['WEBO 307', 6174], ['BAO LUCKY', null], ['AMAGI', null], ['KATAH', null]]);
    expect(latest.canneryTotal).toEqual({
      maxDailyProductionMt: 1095,
      currentDailyProductionMt: 895,
      productionUtilizationPct: 82,
      storageCapacityMt: 40600,
      currentStockMt: 17550,
      storageUtilizationPct: 43,
      reportedProcessingDays: 20,
    });
    expect(latest.prices.nonGspNonMsc).toMatchObject({ amount: 2200, basisUnit: null });
    expect(latest.prices.gspNonMsc).toMatchObject({ amount: 2300, basisUnit: null });
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

    expect(data.sources).toHaveLength(39);
    expect(data.sources.at(-1)).toEqual({
      reportDate: '2026-10-14',
      fileName: 'GMTS Weekly Report 20261014.pdf',
      sha256: '9f78b621da993b8fdc59bbd12aef83a259b7462e100f36acdd9d2ab89b987548',
      pages: 1,
    });
    expect(data.latest.source).toEqual(data.sources.at(-1));
  });

  it('excludes the personal Other section from the dashboard contract', () => {
    expect(hasOtherKey(getGmtsDashboard())).toBe(false);
  });
});
