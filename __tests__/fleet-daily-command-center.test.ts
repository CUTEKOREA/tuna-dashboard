import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { fleetDailyPublicReconciliation } from '@/lib/data/fleet-daily-public';
import { monthBoundaryDay } from '@/lib/fleet-operations-2026-08-23';
import FleetCommandCenter from '@/components/FleetCommandCenter';
import FleetDailyOperations from '@/components/FleetDailyOperations';

describe('FleetCommandCenter daily operations', () => {
  it('renders the latest daily report as the hero KPI source', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));

    expect(markup).toContain('2026-09-08 보고 · 2026-09-07 조업 기준');
    // 9월 첫 보고라 일간과 월간 누계가 같은 295 MT다.
    expect(markup).toContain('data-kpi-value="75"');
    expect(markup).toContain('data-kpi-value="83555.8"');
    expect(markup).toContain('data-kpi-value="7684.1"');
  });

  it('renders public deltas and fail-closed quality coverage without private schedules', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));

    for (const value of [
      // 9/2 기준: 태평양 전일 대비 0(175→175), 대서양 +75, 합계 +75
      '-100 (MT)', 'SYNCED',
      '전체 보고 151건', '전기간 검산 604회', '완전 검산 604회', '미보고 포함 0회 / 0문서',
      // 20/18 이었다가 14/12 로 줄었다 - 운반선 머리글의 0.03 반올림 잔차 6건이
      // 불일치로 잡히던 것을 인쇄 자릿수 허용 폭으로 걸러냈다 (2026-09-07)
      '부분합 차이 전체 14건 / 12문서', '확정 불일치 14건 / 12문서', '미보고 포함 차이 0건 / 0문서',
      '중복 선박 행 4건', '좌표 형식 이슈 6건', '연승 구역 미기재 13건',
      '최신 상세 행 검산 일치',
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

    expect(markup).toContain('26.08.31~09.06');
    expect(markup).toContain('data-kpi-value="885"');
    expect(markup).toContain('data-kpi-value="790"');
    expect(markup).toContain('data-kpi-value="49031"');
    // 문장은 계약에서 파생한다 - 차트만 갈리고 문장이 지난주에 남는 사고를 막는다
    expect(markup).toContain('N/SUN(김형주) 260t');
    expect(markup).toContain('주간 총 어획량은 885t(국적 325t, 합작 560t)');
    expect(markup).not.toContain('645t');
    // 월별 카드 라벨은 계열에서 파생한다 - 계열이 한 달 늘어도 «8월»이 남지 않는다
    expect(markup).toContain('월별 계열은 2026-08-30 보고 기준');
    expect(markup).toContain('추세선은 1~8월');
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

  it('실적 분석 문장에 수치를 손으로 박지 않는다', () => {
    /* 이 파일의 SIT/TAK 는 계약에서 파생해야 한다. 손으로 적으면 차트만 갈리고
     * 문장이 지난주에 남는다 - 2026-09-07 에 두 군데가 동시에 그 상태였다
     * (주간 탭 「645t · 145t 1위」, 선장 실적표 「338일 · 27.1t · 평균 19.1t」). */
    const panels = readFileSync(join(process.cwd(), 'components/FleetAnalysisPanels.tsx'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')   // 주석 안 예시 숫자는 대상이 아니다
      .replace(/\/\/.*$/gm, '');
    const hardcoded = panels.match(/(?<![\w.])\d[\d,.]*\s*(?:t입니다|t으로|t 누적|일·)/g) ?? [];
    expect(hardcoded).toEqual([]);
  });

  it('검산 배지가 반올림 잔차로 빨갛게 뜨지 않는다', () => {
    /* 머리글은 소수 1자리(6,854.1), 상세 행은 2자리(합 6,854.13)로 찍힌다.
     * 그 0.03 하나로 「최신 상세 행 확인 필요」가 상시 점등돼 있었다(2026-09-07).
     * 허용 폭은 인쇄된 마지막 자리의 절반이고, 실제 어긋남은 그대로 잡힌다. */
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));
    expect(fleetDailyPublicReconciliation.valid).toBe(true);
    expect(fleetDailyPublicReconciliation.issueCount).toBe(0);
    expect(markup).toContain('최신 상세 행 검산 일치');
    expect(markup).not.toContain('최신 상세 행 확인 필요');

    const carrier = fleetDailyPublicReconciliation.carrierLoaded;
    expect(carrier.matches).toBe(true);
    // 잔차가 0 이라서 통과한 게 아니라, 인쇄 자릿수 안이라서 통과한 것이다
    expect(carrier.reportedMt).not.toBe(carrier.rowsMt);
    expect(Math.abs(Number(carrier.reportedMt) - Number(carrier.rowsMt))).toBeLessThanOrEqual(0.05);
  });

  it('주간과 월간의 차이가 8월 31일 하루치로 설명된다', () => {
    // 885 주간 옆에 790 월간이 놓이면 «왜 다르지» 가 먼저 나온다. 주간은 8/31 을
    // 포함하고 월간은 9월분이라 차이가 그 하루치다 - 화면이 그걸 말해야 한다.
    expect(monthBoundaryDay).toEqual({ date: '2026-08-31', nationalMt: 10, jointMt: 85, totalMt: 95 });
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));
    expect(markup).toContain('8/31을 포함하고 월간은 9월분이라, 차이 95t(국적 10t, 합작 85t)');
  });
});
