import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import raw from '../lib/data/unloading-fleet-insights.json';
import {
  FleetInsightsSchema,
  unloadingFleetInsights as data,
} from '../lib/data/unloading-fleet-insights';
import {
  summarizeFleetInsights,
  UnloadingFleetInsightsView,
} from '../components/UnloadingFleetInsights';

describe('unloading fleet insights snapshot', () => {
  it('parses under the strict schema and stays SYNCED', () => {
    expect(FleetInsightsSchema.safeParse(raw).success).toBe(true);
    expect(data.snapshotStatus).toBe('SYNCED');
    expect(FleetInsightsSchema.safeParse({ ...raw, extra: 1 }).success).toBe(false);
  });

  it('keeps vessel variance consistent with reported and actual totals', () => {
    for (const v of data.vessels) {
      expect(v.transfers).toBeGreaterThanOrEqual(5);
      expect(v.variancePct).toBeCloseTo(((v.actualMt - v.reportedMt) / v.reportedMt) * 100, 1);
    }
  });

  it('keeps share and school percentages summing to 100', () => {
    const portShare = data.transferPorts.reduce((sum, p) => sum + p.sharePct, 0);
    expect(portShare).toBeGreaterThan(99.5);
    expect(portShare).toBeLessThan(100.5);
    for (const s of data.schools) {
      expect(s.sets).toBeGreaterThanOrEqual(100);
      expect(s.unassociatedPct + s.driftingFadPct + s.otherPct).toBeCloseTo(100, 0);
    }
  });

  it('only publishes sizing years backed by at least five matched voyages', () => {
    for (const row of data.sizing) expect(row.voyages).toBeGreaterThanOrEqual(5);
    expect(data.sizing.reduce((sum, row) => sum + row.voyages, 0)).toBeLessThanOrEqual(data.coverage.sizingVoyages);
  });
});

describe('UnloadingFleetInsightsView', () => {
  it('renders the four blocks, KPIs and the takeaway with source', () => {
    const markup = renderToStaticMarkup(React.createElement(UnloadingFleetInsightsView, { data }));
    const summary = summarizeFleetInsights(data);

    expect(markup).toContain('본선·조업 분석');
    for (const id of ['fleet-vessel-variance', 'fleet-transfer-ports', 'fleet-school-types', 'fleet-sizing']) {
      expect(markup).toContain(`data-testid="${id}"`);
    }
    expect(markup).toContain(summary.widest.vessel);
    expect(markup).toContain(summary.topPort.nameKo);
    expect(markup).toContain('SYNCED');
    expect(markup).toContain('출처:');
    expect(markup).not.toContain('LIVE');
  });

  it('orders vessels from widest to narrowest variance', () => {
    const summary = summarizeFleetInsights(data);
    expect(summary.widest.variancePct).toBeGreaterThanOrEqual(summary.narrowest.variancePct);
  });
});
