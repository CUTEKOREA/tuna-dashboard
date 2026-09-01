import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import FleetCommandCenter from '@/components/FleetCommandCenter';
import FleetDailyOperations from '@/components/FleetDailyOperations';

describe('FleetCommandCenter daily operations', () => {
  it('renders the latest daily report as the hero KPI source', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));

    expect(markup).toContain('2026-09-01 보고 · 2026-08-31 조업 기준');
    expect(markup).toContain('data-kpi-value="280"');
    expect(markup).toContain('data-kpi-value="10143"');
    expect(markup).toContain('data-kpi-value="81700.8"');
    expect(markup).toContain('data-kpi-value="5834.1"');
  });

  it('renders public deltas and fail-closed quality coverage without private schedules', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));

    for (const value of [
      '+35 (MT)', '-215 (MT)', '-180 (MT)', 'SYNCED',
      '전체 보고 146건', '전기간 검산 584회', '완전 검산 584회', '미보고 포함 0회 / 0문서',
      '부분합 차이 전체 16건 / 14문서', '확정 불일치 16건 / 14문서', '미보고 포함 차이 0건 / 0문서',
      '중복 선박 행 4건', '좌표 형식 이슈 6건', '연승 구역 미기재 13건',
      '최신 상세 행 확인 필요',
    ]) {
      expect(markup).toContain(value);
    }
    // 증감 색: 늘면 빨강, 줄면 파랑 (국내 시세 관례)
    expect(markup).toContain('data-delta="up"');
    expect(markup).toContain('data-delta="down"');
    expect(markup).toContain('선박 상세 보호');
    for (const protectedValue of ['보고 당시 상태·예정', 'data-carrier-entity=', '보고 당시 비고:']) {
      expect(markup).not.toContain(protectedValue);
    }
  });

  it('keeps the weekly performance and VDS contracts while withholding the latest roster', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));

    expect(markup).toContain('26.08.24~08.30');
    expect(markup).toContain('data-kpi-value="645"');
    expect(markup).toContain('data-kpi-value="3313"');
    expect(markup).toContain('data-kpi-value="48146"');
    expect(markup).toContain('N/SUN(김형주) 145t 주간 1위');
    expect(markup).toContain('김효원(S/SPR)');
    expect(markup).toContain('-0.00');
    expect(markup).not.toContain('26.08.17~08.23');
    expect(markup).not.toContain('929t');
    expect(markup).toContain('VDS');
    expect(markup).not.toContain('data-carrier-entity=');
    expect(markup).not.toContain('보고 당시 비고:');
  });

  it('does not render an authentication-code form for a legacy MFA response', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetDailyOperations, {
      detailState: { status: 'denied', code: 'mfa_required' },
    }));

    expect(markup).not.toContain('인증 앱 코드');
    expect(markup).not.toContain('2단계 인증');
    expect(markup).toContain('로그인 세션을 다시 확인해주세요.');
  });
});
