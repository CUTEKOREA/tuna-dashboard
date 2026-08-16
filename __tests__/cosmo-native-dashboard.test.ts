import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import CosmoDashboard, { COSMO_TABS } from '../components/cosmo/CosmoDashboard';
import {
  latest,
  meta,
  weeklySeries,
} from '../lib/data/cosmo';

const raw = JSON.parse(readFileSync(
  join(process.cwd(), 'public/data/cosmo/cosmo_2026.json'),
  'utf8',
)) as {
  meta: { weekCount: number; weekRange: number[] };
  weeks: Array<{ week: number }>;
};

describe('COSMO native data intake', () => {
  it('parses the source JSON through the intake module', () => {
    expect(meta.weekCount).toBe(raw.meta.weekCount);
    expect(meta.weekRange).toEqual(raw.meta.weekRange);
    expect(latest.week).toBe(raw.weeks.at(-1)?.week);
    expect(weeklySeries).toHaveLength(raw.weeks.length);
    expect(weeklySeries.at(-1)?.label).toBe(`${latest.week}주`);
  });
});

describe('COSMO native dashboard', () => {
  it('renders the executive hero, representative KPI, and all nine tabs without an iframe', () => {
    const markup = renderToStaticMarkup(React.createElement(CosmoDashboard));

    expect(markup).toContain('코스모');
    expect(markup).toContain('data-now="true"');
    expect(markup).toContain('data-hero-now-strip="true"');
    expect(markup).toContain('주간 판매');
    expect(COSMO_TABS).toHaveLength(9);
    for (const tab of COSMO_TABS) expect(markup).toContain(tab.label);
    expect(markup).not.toContain('<iframe');
  });

  it('wires the registry panel to the native entry component', () => {
    const appSource = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
    const nativeSource = readFileSync(
      join(process.cwd(), 'components/cosmo/CosmoDashboard.tsx'),
      'utf8',
    );

    expect(appSource).toContain("import('../components/cosmo/CosmoDashboard')");
    expect(appSource).not.toContain("EmbeddedDashboardFrame').then((module) => module.CosmoDashboard");
    expect(nativeSource).toContain('<HeroZone');
    expect(nativeSource).toContain('<PillTabs');
  });

  it('keeps Recharts visible inside the host global max-width rule', () => {
    const css = readFileSync(
      join(process.cwd(), 'components/cosmo/cosmo.css'),
      'utf8',
    );

    expect(css).toMatch(
      /\.cosmo-root \.recharts-wrapper,\s*\.cosmo-root \.recharts-surface \{ max-width: none !important; \}/,
    );
  });
});
