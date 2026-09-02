import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

// 2026-08-15: 방콕사무소가 iframe 표시본에서 네이티브 탭 대시보드로 이전 —
// 이 파일은 그 계약(히어로 + PillTabs + iframe 부재)을 지킨다.
describe('bangkok native dashboard', () => {
  it('KPI 인테이크 계약과 payload 불변식을 지킨다', async () => {
    const intake = await import('../lib/data/bangkok-weekly');

    expect(intake.bangkokWeeklyKpi).toEqual({
      period: '2020.05~2026.09',
      // 2026-09-02 주간보고 반영 (매주 sync로 갱신되는 확정 KPI)
      weeks: 290,
      latestPrice: 2030,
      stockMt: 100500,
      processDays: 47,
      cumUnloadMt: 341810,
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

    // 2026-08-15: 과제 D 추가 — 스톡 지표(재고·가공일수)는 합산이 아니라 «기간 평균».
    // null 주는 평균에서 빠지고(0 채움 금지), 관측 주가 없는 기간은 행이 없어야 한다.
    for (const pickKey of ['bkkStockMt', 'bkkDays'] as const) {
      const observedWeeks = intake.bangkokWeeks.filter((w) => w[pickKey] !== null).length;
      const rawSum = intake.bangkokWeeks.reduce((acc, w) => acc + (w[pickKey] ?? 0), 0);
      for (const g of ['monthly', 'quarterly', 'yearly'] as const) {
        const rows = intake.aggregateWeeklyAvg((w) => w[pickKey], g);
        for (const r of rows) expect(r.weeks).toBeGreaterThan(0);
        expect(rows.reduce((acc, r) => acc + r.weeks, 0)).toBe(observedWeeks);
        // 평균×관측주수를 되합치면 원본 관측치 합과 일치해야 한다 (평균 산식 검증)
        expect(rows.reduce((acc, r) => acc + r.value * r.weeks, 0)).toBeCloseTo(rawSum, 6);
      }
    }

    // 캐너리 주간 시계열 — 날짜 형식과 비어 있지 않음만 확인 (구조 검증은 sync 스크립트 몫)
    expect(intake.bangkokCanneryPanel.length).toBeGreaterThan(0);
    for (const p of intake.bangkokCanneryPanel.slice(0, 3)) {
      expect(p.weeks.length).toBeGreaterThan(0);
      for (const w of p.weeks) expect(w.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  // 2026-08-15: 캐너리별 추이가 전 캐너리 선택 + 입도 전환으로 확장 — 그 집계 계약.
  it('캐너리 입도 집계도 0 채움 없이 원본 관측치와 재합성된다', async () => {
    const intake = await import('../lib/data/bangkok-weekly');

    for (const panel of intake.bangkokCanneryPanel) {
      for (const pick of [
        (w: (typeof panel.weeks)[number]) => w.utilPct,
        (w: (typeof panel.weeks)[number]) => w.stockMt,
      ]) {
        const observed = panel.weeks.filter((w) => pick(w) !== null);
        const rawSum = observed.reduce((acc, w) => acc + (pick(w) ?? 0), 0);
        for (const g of ['monthly', 'quarterly', 'yearly'] as const) {
          const rows = intake.aggregateCanneryAvg(panel.weeks, pick, g);
          for (const r of rows) expect(r.weeks).toBeGreaterThan(0);
          expect(rows.reduce((acc, r) => acc + r.weeks, 0)).toBe(observed.length);
          // 평균×관측주수 되합침 = 원본 관측치 합 (평균 산식 검증)
          expect(rows.reduce((acc, r) => acc + r.value * r.weeks, 0)).toBeCloseTo(rawSum, 6);
        }
        // 입도가 굵어질수록 행 수는 줄기만 한다
        const counts = (['monthly', 'quarterly', 'yearly'] as const).map(
          (g) => intake.aggregateCanneryAvg(panel.weeks, pick, g).length,
        );
        expect(counts[0]).toBeGreaterThanOrEqual(counts[1]);
        expect(counts[1]).toBeGreaterThanOrEqual(counts[2]);
      }
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
    // 2026-08-15: 과제 D — 재고·가공가능일수 입도 pill
    expect(cannery).toContain('방콕 재고 집계 입도');
    expect(cannery).toContain('가공가능일수 집계 입도');

    // 2026-08-15: 캐너리별 추이 = 전 캐너리 복수 선택 + 입도 전환.
    // 후보는 주간 시계열이 있는 전 캐너리, 기본 선택은 재고 점유 상위 4개.
    const intake = await import('../lib/data/bangkok-weekly');
    expect(cannery).toContain('캐너리 선택');
    expect(cannery).toContain('캐너리별 추이 집계 입도');
    for (const p of intake.bangkokCanneryPanel) expect(cannery).toContain(`>${p.name}</button>`);
    expect(cannery).toContain(`선택 4개 / 전체 ${intake.bangkokCanneryPanel.length}개`);
    // 기본 선택 4개 + 입도 pill 3벌(재고·가공가능일수·캐너리 추이)의 «주간» 만 켜져 있다.
    // «전체» 버튼은 기본에서 꺼진 상태.
    expect(cannery.match(/aria-pressed="true"/g)?.length).toBe(4 + 3);

    const leading = renderToStaticMarkup(React.createElement(LeadingTab));
    expect(leading).toContain('이 표를 읽는 법');
    expect(leading).toContain('상관계수');
    // 2026-08-15: 과제 D — 하역 계절성 월별/분기별 pill
    expect(leading).toContain('하역 계절성 집계 입도');
  });

  it('네이티브 히어로 + 탭을 렌더하고 iframe은 남기지 않는다', async () => {
    const { default: BangkokDashboard } = await import('../components/bangkok/BangkokDashboard');
    const markup = renderToStaticMarkup(React.createElement(BangkokDashboard));

    expect(markup).toContain('방콕사무소');
    expect(markup).toContain('data-now="true"');
    expect(markup).toContain('분석 기간 2020.05~2026.09 · 고유 290주');
    // 2026-09-02 사용자 지시: 하이솔트 확정액 타일은 히어로에서 뺀다 (KPI 계약의 highSaltUsd는 유지).
    expect(markup).not.toContain('하이솔트 확정액');
    // 2026-09-02: 개관 시세 차트가 어튜나·방콕사무소·싱가포르 MGO 3종(같은 $/t 축) + 재고·가동률 소패널로 확장
    for (const text of ['방콕사무소 원어 시세', '어튜나 SKJ 방콕', '싱가포르 MGO', '방콕 캐너리 보유 원어 합', '방콕 캐너리 평균 가동률']) {
      expect(markup).toContain(text);
    }
    expect(markup).not.toContain('yAxisId="right"'); // 이중 축 금지 — 단위가 다르면 패널을 나눈다
    // 2026-09-02 Fable 5.1 검증 조건: 계절 패턴은 «예측» 라벨로 그리지 않는다
    expect(markup).toContain('과거 같은 달 평균 변화');
    expect(markup).toContain('최근 10년은');
    expect(markup).not.toContain('예측치:');
    // 2026-09-02 사용자 지시: 계절 패턴 선·밴드는 어튜나 주황(#d95926)이 아니라 중립 회색이어야 한다
    expect(markup).toContain('#64748b');

    for (const value of [2030, 100500, 341810, 47]) {
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

    // 2026-08-15: 히어로 타이틀 영문 전환 (소유자 지시 — L-01 히어로 한정 예외)
    expect(markup).toContain('방콕사무소');
    expect(markup).toContain('data-now="true"');
    expect(markup).not.toContain('role="tablist"');
    expect(markup).not.toContain('role="tabpanel"');
  });
});
