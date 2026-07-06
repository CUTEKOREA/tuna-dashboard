import { describe, expect, it } from 'vitest';
import { GET } from '../app/api/bni-global/route';
import { getBniGlobalDashboard } from '../lib/data/bni-global';
import { StaticSnapshotResponse } from '../lib/contracts/static-snapshot';

describe('BNI Global dashboard data', () => {
  it('loads the latest BNI report archive and structured commodity coverage', () => {
    const data = getBniGlobalDashboard();

    expect(data.meta.title).toBe('BNI Global Market Intelligence');
    expect(data.meta.audience).toContain('거래처');
    expect(data.latestReport.date).toBe('2026-07-06');
    expect(data.latestReport.file).toBe('BNI Report 260706.pdf');
    expect(data.coverage.reportCount).toBe(9);
    expect(data.coverage.structuredCommodityCount).toBe(5);
    expect(data.coverage.commodityCount).toBe(7);
    expect(data.reportArchive).toHaveLength(9);
  });

  it('binds BNI commodity notes to price, customs, and trade evidence', () => {
    const data = getBniGlobalDashboard();

    for (const commodity of data.commodities) {
      expect(commodity.bniReview).toMatch(/[가-힣]/);
      expect(commodity.bniOutlook).toMatch(/[가-힣]/);
      expect(commodity.customerMessage).toMatch(/[가-힣]/);
      expect(commodity.price.seriesId).toMatch(/^[A-Z0-9]+$/);
      expect(commodity.price.latestDate).toMatch(/^20\d{2}-\d{2}-\d{2}$/);
      expect(commodity.customs.latestPeriod).toMatch(/^20\d{4}$/);
      expect(commodity.comtrade.latestYear).toMatch(/^20\d{2}$/);
      expect(commodity.hsCodes.length).toBeGreaterThan(0);
    }
  });

  it('serves the dashboard through a static API contract', async () => {
    const response = await GET();
    const parsed = StaticSnapshotResponse.parse(await response.json());

    expect(parsed.isLive).toBe(false);
    expect(parsed._metadata.source).toBe('data/bni_global_dashboard.json');
    expect(parsed._metadata.syncDate).toBe('2026-07-06');
    expect(parsed._metadata.apiHealth?.ok).toBe(true);
  });
});
