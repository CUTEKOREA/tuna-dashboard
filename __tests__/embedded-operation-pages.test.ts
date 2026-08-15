import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  BangkokOfficeDashboard,
} from '../components/EmbeddedDashboardFrame';

describe('embedded operation pages', () => {
  it('renders the Bangkok KPI hero from the intake contract above the unsandboxed report iframe', async () => {
    const intakeModule = await import('../lib/data/bangkok-weekly').catch(() => null);

    expect(intakeModule).not.toBeNull();
    if (!intakeModule) return;
    expect(intakeModule.bangkokWeeklyKpi).toEqual({
      period: '2020.05~2026.08',
      weeks: 287,
      latestPrice: 1960,
      stockMt: 117400,
      processDays: 44,
      cumUnloadMt: 326005,
      highSaltUsd: 142000,
    });

    const markup = renderToStaticMarkup(React.createElement(BangkokOfficeDashboard));

    expect(markup).toContain('방콕사무소 주간보고');
    expect(markup).toContain('분석 기간 2020.05~2026.08 · 고유 287주');
    expect(markup).toContain('최신 시세');
    expect(markup).toContain('방콕 재고');
    expect(markup).toContain('2026 누적 하역');
    expect(markup).toContain('가공가능일수');
    for (const value of [1960, 117400, 326005, 44]) {
      expect(markup).toContain(`data-kpi-value="${value}"`);
    }
    expect(markup).toContain('src="/reports/bangkok_weekly_2020_2026.html"');
    expect(markup).toContain('title="방콕사무소 주간보고"');
    expect(markup).toContain('width:100%');
    expect(markup).toContain('height:100%');
    expect(markup).toContain('border:0');
    expect(markup).toContain('방콕사무소 주간보고 불러오는 중...');
    expect(markup).not.toContain('sandbox=');
  });

});
