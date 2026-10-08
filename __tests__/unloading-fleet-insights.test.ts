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
import {
  catchBreaks,
  formatPosition,
  GROUND_RAMP,
  rampColor,
} from '../lib/unloading-history/fishing-grounds';

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

describe('fishing grounds and set efficiency', () => {
  it('keeps grid cells on 1° centres inside the Pacific purse-seine box, without vessel names', () => {
    for (const g of data.grounds) {
      for (const [lat, lon, sets, catchMt] of g.cells) {
        expect(Math.abs((lat % 1) + (lat < 0 ? 1 : 0) - 0.5)).toBeLessThan(1e-9);
        expect(Math.abs((lon % 1) - 0.5)).toBeLessThan(1e-9);
        expect(sets).toBeGreaterThan(0);
        expect(catchMt).toBeGreaterThan(0);
      }
      expect(JSON.stringify(g)).not.toMatch(/SHILLA|NAOERO|MOA/);
    }
  });

  it('never maps more sets than the logsheet year total', () => {
    for (const g of data.grounds) {
      const year = data.schools.find((s) => s.year === g.year);
      expect(year).toBeDefined();
      expect(g.cells.reduce((sum, c) => sum + c[2], 0)).toBeLessThanOrEqual(year!.sets);
    }
  });

  it('only publishes efficiency rows backed by enough sets', () => {
    for (const e of data.efficiency) expect(e.sets).toBeGreaterThanOrEqual(40);
    for (const e of data.schoolEfficiency) expect(e.sets).toBeGreaterThanOrEqual(50);
  });

  it('colours cells by quantile breaks and formats positions across the date line', () => {
    const cells: [number, number, number, number][] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 1000].map((c, i) => [0.5, 150.5 + i, 1, c]);
    const breaks = catchBreaks(cells);
    expect(breaks).toHaveLength(4);
    expect(rampColor(10, breaks)).toBe(GROUND_RAMP[0]);
    expect(rampColor(5000, breaks)).toBe(GROUND_RAMP[GROUND_RAMP.length - 1]);
    expect(formatPosition(-4.5, 152.5)).toBe('4.5°S · 152.5°E');
    expect(formatPosition(1.5, 202.5)).toBe('1.5°N · 157.5°W');
  });
});

describe('UnloadingFleetInsightsView', () => {
  it('renders the map shell, efficiency tables and headline efficiency on complete years', () => {
    const markup = renderToStaticMarkup(React.createElement(UnloadingFleetInsightsView, { data }));
    const summary = summarizeFleetInsights(data);
    const syncYear = Number(data.syncDate.slice(0, 4));
    for (const id of ['fleet-fishing-grounds', 'fleet-vessel-efficiency', 'fleet-school-efficiency']) {
      expect(markup).toContain(`data-testid="${id}"`);
    }
    expect(summary.effYear).toBeLessThan(syncYear);
    expect(summary.groundYear).toBeLessThan(syncYear);
    expect(markup).toContain(`aria-pressed="true" data-testid="ground-year-${summary.groundYear}"`);
    expect(markup).toContain(summary.effVessels[0].vessel);
    expect(markup).toContain('본선명·일자는 넣지 않았습니다');
  });

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

  it('headlines the latest complete year and marks the sync year as in progress', () => {
    const syncYear = Number(data.syncDate.slice(0, 4));
    const summary = summarizeFleetInsights(data);
    expect(summary.lastLead.year).toBeLessThan(syncYear);
    expect(summary.lastSchool.year).toBeLessThan(syncYear);
    const markup = renderToStaticMarkup(React.createElement(UnloadingFleetInsightsView, { data }));
    expect(markup).toContain(`(${summary.lastLead.year})`);
    if (data.schools.some((s) => s.year >= syncYear)) expect(markup).toContain('진행 중');
  });

  it('orders vessels from widest to narrowest variance', () => {
    const summary = summarizeFleetInsights(data);
    expect(summary.widest.variancePct).toBeGreaterThanOrEqual(summary.narrowest.variancePct);
  });
});
