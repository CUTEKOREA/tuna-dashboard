import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import FleetCommandCenter from '@/components/FleetCommandCenter';

describe('FleetCommandCenter daily operations', () => {
  it('renders the latest daily report as the hero KPI source', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));

    expect(markup).toContain('2026-08-24 보고 · 2026-08-23 조업 기준');
    expect(markup).toContain('data-kpi-value="316"');
    expect(markup).toContain('data-kpi-value="7173"');
    expect(markup).toContain('data-kpi-value="78730.8"');
    expect(markup).toContain('data-kpi-value="8763.3"');
  });

  it('renders public deltas and fail-closed quality coverage without private schedules', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));

    for (const value of [
      '+3 (MT)', '-40 (MT)', '-37 (MT)', 'SYNCED',
      '전체 보고 139건', '전기간 검산 556회', '완전 검산 556회', '미보고 포함 0회 / 0문서',
      '부분합 차이 전체 14건 / 12문서', '확정 불일치 14건 / 12문서', '미보고 포함 차이 0건 / 0문서',
      '중복 선박 행 4건', '좌표 형식 이슈 6건', '연승 구역 미기재 13건',
      '최신 상세 행 검산 일치',
    ]) {
      expect(markup).toContain(value);
    }
    expect(markup).toContain('선박 상세 보호');
    for (const protectedValue of ['보고 당시 상태·예정', 'data-carrier-entity=', '보고 당시 비고:']) {
      expect(markup).not.toContain(protectedValue);
    }
  });

  it('keeps the weekly performance and VDS contracts while withholding the latest roster', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));

    expect(markup).toContain('929');
    expect(markup).toContain('VDS');
    expect(markup).not.toContain('data-carrier-entity=');
    expect(markup).not.toContain('보고 당시 비고:');
  });
});
