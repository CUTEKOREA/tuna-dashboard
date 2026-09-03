import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import FleetCommandCenter from '@/components/FleetCommandCenter';
import FleetDailyOperations from '@/components/FleetDailyOperations';

describe('FleetCommandCenter daily operations', () => {
  it('renders the latest daily report as the hero KPI source', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));

    expect(markup).toContain('2026-09-03 보고 · 2026-09-02 조업 기준');
    // 9월 첫 보고라 일간과 월간 누계가 같은 295 MT다.
    expect(markup).toContain('data-kpi-value="370"');
    expect(markup).toContain('data-kpi-value="82365.8"');
    expect(markup).toContain('data-kpi-value="5834.1"');
  });

  it('renders public deltas and fail-closed quality coverage without private schedules', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));

    for (const value of [
      // 9/2 기준: 태평양 전일 대비 0(175→175), 대서양 +75, 합계 +75
      '+75 (MT)', 'SYNCED',
      '전체 보고 148건', '전기간 검산 592회', '완전 검산 592회', '미보고 포함 0회 / 0문서',
      '부분합 차이 전체 18건 / 16문서', '확정 불일치 18건 / 16문서', '미보고 포함 차이 0건 / 0문서',
      '중복 선박 행 4건', '좌표 형식 이슈 6건', '연승 구역 미기재 13건',
      '최신 상세 행 확인 필요',
    ]) {
      expect(markup).toContain(value);
    }
    // 증감 색: 늘면 빨강, 줄면 파랑 (국내 시세 관례).
    // 어느 날은 세 부호가 다 나오지 않으므로(9/2는 0·+75·+75) 그날의 부호 조합을 고정하지 않는다.
    // 대신 «모든 증감에 data-delta 가 붙고 값은 up/down/flat 뿐»과 «CSS 가 셋 다 정의»를 본다.
    const deltas = [...markup.matchAll(/data-delta="([a-z]+)"/g)].map((m) => m[1]);
    expect(deltas.length).toBeGreaterThanOrEqual(3);
    expect(new Set(deltas).size).toBeGreaterThan(0);
    for (const d of deltas) expect(['up', 'down', 'flat']).toContain(d);
    const css = readFileSync(join(process.cwd(), 'components/FleetCommandCenter.module.css'), 'utf8');
    for (const [state, colour] of [['up', '#ef4444'], ['down', '#3b82f6']] as const) {
      expect(css).toContain(`em[data-delta='${state}'] { color:${colour}; }`);
    }
    expect(css).toContain("em[data-delta='flat']");
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
