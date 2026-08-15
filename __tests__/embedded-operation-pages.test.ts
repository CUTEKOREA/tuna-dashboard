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

  // 2026-08-15: 과제 C — 입도 집계·캐너리 주간 시계열 인테이크 추가에 따른 계약.
  it('입도 집계는 0 채움 없이 원본 합과 일치한다', async () => {
    const intake = await import('../lib/data/bangkok-weekly');

    const weeklyTotal = intake.bangkokWeeks.reduce((acc, w) => acc + (w.unloadMt ?? 0), 0);
    for (const g of ['monthly', 'quarterly', 'yearly'] as const) {
      const rows = intake.aggregateUnload(g);
      expect(rows.reduce((acc, r) => acc + r.unloadMt, 0)).toBeCloseTo(weeklyTotal, 6);
      // 0 채움 금지 — 기록 없는 기간의 행 자체가 없어야 한다
      for (const r of rows) expect(r.weeks).toBeGreaterThan(0);
    }

    const monthlyTotal = intake.bangkokTraderMonthly.reduce((acc, m) => acc + m.totalCalc, 0);
    for (const g of ['quarterly', 'yearly'] as const) {
      const rows = intake.aggregateTraderVolumes(g);
      expect(rows.reduce((acc, r) => acc + r.totalMt, 0)).toBeCloseTo(monthlyTotal, 6);
      for (const r of rows) expect(r.months).toBeGreaterThan(0);
    }

    // 캐너리 주간 시계열 — 날짜 형식과 비어 있지 않음만 확인 (구조 검증은 sync 스크립트 몫)
    expect(intake.bangkokCanneryPanel.length).toBeGreaterThan(0);
    for (const p of intake.bangkokCanneryPanel.slice(0, 3)) {
      expect(p.weeks.length).toBeGreaterThan(0);
      for (const w of p.weeks) expect(w.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('하역·캐너리·선행지표 탭이 신규 컨트롤·해설과 함께 렌더된다', async () => {
    const { UnloadTab } = await import('../components/bangkok/tabs/UnloadTab');
    const { CanneryTab } = await import('../components/bangkok/tabs/CanneryTab');
    const { LeadingTab } = await import('../components/bangkok/tabs/LeadingTab');

    const unload = renderToStaticMarkup(React.createElement(UnloadTab));
    for (const label of ['주간', '월간', '분기별', '연도별', '실량 (MT)', '비중 (%)']) {
      expect(unload).toContain(label);
    }

    const cannery = renderToStaticMarkup(React.createElement(CanneryTab));
    expect(cannery).toContain('캐너리별 가동률 추이');
    expect(cannery).toContain('캐너리별 원어재고 추이');

    const leading = renderToStaticMarkup(React.createElement(LeadingTab));
    expect(leading).toContain('이 표를 읽는 법');
    expect(leading).toContain('상관계수');
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
