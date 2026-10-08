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
  it('월별 손익 레코드는 핵심 필드가 전부 채워져 있어야 한다 - Drive 부분 읽기 회귀 차단', async () => {
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

describe('cosmo 8월 손익 (2026-09-30)', () => {
  it('월 계열이 1~8월이고 매월 전월 YTD + 당월 = 이번 YTD 다', async () => {
    const raw = await import('../public/data/cosmo/cosmo_2026.json');
    const monthly = (raw.default ?? raw).monthly as unknown as Record<string, number>[];
    expect(monthly.map((m) => m.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (let i = 1; i < monthly.length; i += 1) {
      for (const k of ['revenue', 'cos', 'gp', 'sga', 'op', 'nonop', 'interest', 'net']) {
        const gap = monthly[i - 1][`${k}Ytd`] + monthly[i][k] - monthly[i][`${k}Ytd`];
        expect(Math.abs(gap), `${monthly[i].month}월 ${k} YTD 연속성`).toBeLessThan(1);
      }
    }
  });

  it('8월은 원문 당월 열의 행 참조 오류를 YTD 차분으로 복원했다', async () => {
    const { latestMonth: m } = await import('../lib/data/cosmo');
    expect(m.month).toBe(8);
    expect(m.sha256).toBe('a2c9ff4d860390b9e8a29facb6b6ca32308460acddf9e5963454ce49c1d147c9');
    expect(m.revenue).toBeCloseTo(3_841_385.97, 2);
    expect(m.cos).toBeCloseTo(3_745_566.35, 2);
    expect(m.gp).toBeCloseTo(95_819.62, 2);
    expect(m.net).toBeCloseTo(-324_623.72, 2);
    expect(m.netYtd).toBeCloseTo(-1_892_714.56, 2);
    expect(m.costLines.Can).toBeCloseTo(322_181, 2);
    expect(m.costLines['Flat Pouch']).toBeCloseTo(19_508.33, 2);
    // 인쇄값 — 원장 PnL-Cannery 가 Media·Ingredients 를 2행씩 늘렸는데 당월 열만 1:1 참조로 남았다
    expect(m.correction?.printed['24:Can:Total']).toBe(708);
    expect(m.correction?.printed['100:Net Income:Total']).toBeCloseTo(-320_119.72, 2);
    expect(m.costLinesPrevYtd?.Electricity).toBeCloseTo(841_434.93, 2);
  });

  it('손익 탭 문장이 8월 계열에서 나온다', async () => {
    const { default: ProfitTab } = await import('../components/cosmo/tabs/ProfitTab');
    const html = renderToStaticMarkup(React.createElement(ProfitTab));
    expect(html).not.toContain('첫 하락 전환');
    expect(html).not.toContain('$0.73M');
    expect(html).toContain('보합');
    expect(html).toContain('+41%');
    expect(html).toContain('Can $708(→$322,181)');
    // 7월판에선 25%·$1.03M·$0.36M 이었다 — 8월 전년 매출이 갭에 더해져 비중이 준다
    expect(html).toContain('약 <b>17%</b>는 로인(Precooked Loin) 판매 소멸 $1.03M과 원어 판매 소멸 $0.48M');
  });
});
