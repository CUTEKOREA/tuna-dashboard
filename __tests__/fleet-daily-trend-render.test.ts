import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FleetChartSection } from '@/components/FleetAnalysisPanels';
import { fleetDailyPublicSeries } from '@/lib/data/fleet-daily-public';

describe('fleet daily catch trend', () => {
  it('covers every report date with an aligned value per region', () => {
    const days = fleetDailyPublicSeries.dates.length;

    expect(days).toBeGreaterThan(100);
    expect(fleetDailyPublicSeries.dates[0]).toBe('2026-01-16');
    for (const region of ['pacific', 'atlantic'] as const) {
      expect(fleetDailyPublicSeries[region].totalMt).toHaveLength(days);
      for (const values of Object.values(fleetDailyPublicSeries[region].vessels)) {
        expect(values).toHaveLength(days);
      }
    }
    expect(Object.keys(fleetDailyPublicSeries.pacific.vessels)).toContain('S/EXP');
    expect(Object.keys(fleetDailyPublicSeries.atlantic.vessels)).toContain('P/MAS');
  });

  it('offers the daily tab with a per-vessel option and no protected detail', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetChartSection));

    expect(markup).toContain('일간 추이');
    expect(markup).toContain('주간 어획');
    for (const leaked of ['보고 당시 비고', 'data-carrier-entity=']) {
      expect(markup).not.toContain(leaked);
    }
    expect(markup).not.toMatch(/[NS]\d{4}\s+[EW]\d{5}/);
  });
});
