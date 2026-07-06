import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { GET } from '../app/api/bni-global/route';
import sitemap from '../app/sitemap';
import { getBniGlobalDashboard } from '../lib/data/bni-global';
import { StaticSnapshotResponse } from '../lib/contracts/static-snapshot';
import { PUBLIC_DASHBOARD_ROUTES, SIDEBAR_SECTIONS, VALID_MENUS } from '../lib/dashboard-registry';

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

  it('builds a dense API-backed insight proposal queue', () => {
    const data = getBniGlobalDashboard();
    const connectedSources = data.apiConnections.map((connection) => connection.source);
    const insightSources = new Set(data.insightProposals.flatMap((insight) => insight.apiStack));

    expect(data.apiConnections.length).toBeGreaterThanOrEqual(10);
    expect(data.insightProposals.length).toBeGreaterThanOrEqual(15);
    expect(connectedSources).toEqual(expect.arrayContaining(['FRED', 'KCS', 'UN Comtrade', 'WITS', 'ECOS·환율']));
    expect(data.apiConnections.find((connection) => connection.source === 'WITS')?.endpoint).toBe('/api/wits');
    expect(data.apiConnections.find((connection) => connection.source === 'ECOS·환율')?.endpoint).toBe('/api/exchange');

    for (const insight of data.insightProposals) {
      expect(insight.title).toMatch(/[가-힣]/);
      expect(insight.thesis).toMatch(/[가-힣]/);
      expect(insight.action).toMatch(/[가-힣]/);
      expect(insight.customerQuestion).toMatch(/[가-힣]/);
      expect(insight.apiStack.length).toBeGreaterThanOrEqual(3);
    }

    expect(Array.from(insightSources)).toEqual(expect.arrayContaining(['FRED', 'KCS', 'UN Comtrade', 'WITS', 'KAMIS']));
  });

  it('serves the dashboard through a static API contract', async () => {
    const response = await GET();
    const parsed = StaticSnapshotResponse.parse(await response.json());

    expect(parsed.isLive).toBe(false);
    expect(parsed._metadata.source).toBe('data/bni_global_dashboard.json');
    expect(parsed._metadata.syncDate).toBe('2026-07-06');
    expect(parsed._metadata.apiHealth?.ok).toBe(true);
  });

  it('keeps BNI Global as a standalone public page outside the Tuna Kingdom dashboard menu', () => {
    const sitemapRoutes = sitemap().map((entry) => new URL(entry.url).pathname.replace(/^\//, ''));
    const sidebarKeys = SIDEBAR_SECTIONS.flatMap((section) => section.items.map((item) => item.key));

    expect(sitemapRoutes).toContain('bni-global');
    expect(VALID_MENUS).not.toContain('bni-global');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('bni-global');
    expect(sidebarKeys).not.toContain('bni-global');
  });

  it('keeps global Tuna Kingdom widgets route-scoped away from the standalone page', () => {
    const root = process.cwd();
    const layoutSource = readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');
    const routeScopedSource = readFileSync(path.join(root, 'components/RouteScopedGlobalWidgets.tsx'), 'utf8');

    expect(layoutSource).toContain('RouteScopedGlobalWidgets');
    expect(layoutSource).not.toContain('<HermesAgent');
    expect(layoutSource).not.toContain('<DeepOceanCreatures');
    expect(routeScopedSource).toContain('/bni-global');
    expect(routeScopedSource).toContain('isStandaloneRoute');
  });
});
