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

describe('cosmo monthly data integrity (2026-08-18 회귀 가드)', () => {
  it('월별 손익 레코드는 핵심 필드가 전부 채워져 있어야 한다 — Drive 부분 읽기 회귀 차단', async () => {
    const raw = await import('../public/data/cosmo/cosmo_2026.json');
    const monthly = (raw.default ?? raw).monthly as Record<string, unknown>[];
    expect(monthly.length).toBeGreaterThanOrEqual(7);
    for (const m of monthly) {
      for (const key of ['revenue', 'gp', 'op', 'net', 'sga', 'fishPriceSJ', 'forex']) {
        expect(m[key], `month ${m.month} ${key}`).toBeTypeOf('number');
      }
      expect(Object.keys((m.costLines as object) ?? {}).length, `month ${m.month} costLines`).toBeGreaterThan(0);
    }
    // 부문 영업손익 합 = 전체 (캐너리+피시밀+FBU, CBU는 캐너리+피시밀 소계라 제외)
    for (const m of monthly) {
      const parts = ['op_cannery', 'op_fishmeal', 'op_fbu'].map((k) => m[k] as number | null);
      if (parts.every((v) => typeof v === 'number')) {
        const sum = (parts as number[]).reduce((a, b) => a + b, 0);
        expect(Math.abs(sum - (m.op as number)), `month ${m.month} 부문 합 검산`).toBeLessThan(1);
      }
    }
  });
});
