import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

// 2026-08-15: 방콕사무소가 iframe 표시본에서 네이티브 탭 대시보드로 이전 —
// 이 파일은 그 계약(히어로 + PillTabs + iframe 부재)을 지킨다.
describe('bangkok native dashboard', () => {
  it('KPI 인테이크 계약과 payload 불변식을 지킨다', async () => {
    const intake = await import('../lib/data/bangkok-weekly');

    expect(intake.bangkokWeeklyKpi).toEqual({
      period: '2020.05~2026.08',
      weeks: 287,
      latestPrice: 1960,
      stockMt: 117400,
      processDays: 44,
      cumUnloadMt: 326005,
      highSaltUsd: 142000,
    });

    // 관계 불변식 — 산출물 세대가 어긋나면 여기서 끊긴다
    expect(intake.bangkokWeeks.length).toBe(intake.bangkokWeeklyKpi.weeks);
    expect(intake.bangkokMeta.reports).toBe(intake.bangkokWeeks.length);
    expect(intake.bangkokYearly.reduce((acc, y) => acc + y.weeks, 0)).toBe(
      intake.bangkokWeeks.length,
    );
    // 트레이더 월합계는 트레이더별 물량 합과 일치해야 한다
    for (const m of intake.bangkokTraderMonthly) {
      const sum = Object.values(m.volumes).reduce((a, b) => a + b, 0);
      expect(Math.abs(sum - m.totalCalc)).toBeLessThan(1);
    }
  });

  it('네이티브 히어로 + 탭을 렌더하고 iframe은 남기지 않는다', async () => {
    const { default: BangkokDashboard } = await import('../components/bangkok/BangkokDashboard');
    const markup = renderToStaticMarkup(React.createElement(BangkokDashboard));

    expect(markup).toContain('방콕사무소 주간보고');
    expect(markup).toContain('분석 기간 2020.05~2026.08 · 고유 287주');
    for (const value of [1960, 117400, 326005, 44]) {
      expect(markup).toContain(`data-kpi-value="${value}"`);
    }
    for (const label of [
      '개관',
      '원어 시세',
      '하역·트레이더',
      '캐너리·재고',
      '품질 클레임',
      '선행지표',
      '데이터 품질',
    ]) {
      expect(markup).toContain(label);
    }
    expect(markup).not.toContain('<iframe');
  });

  it('heroOnly 티저는 히어로만 남기고 탭·본문을 감춘다', async () => {
    const { default: BangkokDashboard } = await import('../components/bangkok/BangkokDashboard');
    const markup = renderToStaticMarkup(
      React.createElement(
        BangkokDashboard as React.ComponentType<{ heroOnly?: boolean }>,
        { heroOnly: true },
      ),
    );

    expect(markup).toContain('방콕사무소 주간보고');
    expect(markup).not.toContain('role="tablist"');
    expect(markup).not.toContain('role="tabpanel"');
  });
});
