import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import HomeTab from '../components/cosmo/tabs/HomeTab';
import { cosmoWeeklyReport as report } from '../lib/data/cosmo-weekly-report';

const raw = JSON.parse(readFileSync(
  join(process.cwd(), 'public/data/cosmo/cosmo_2026.json'),
  'utf8',
)) as {
  meta: { weekCount: number; weekRange: number[]; quoteCount: number };
  weeks: Array<Record<string, unknown>>;
  checks: Array<{ week: number; ok: boolean }>;
};

describe('COSMO 2026년 34주차 데이터 계약', () => {
  it('주간 엑셀의 핵심 수치와 검산 결과를 보존한다', () => {
    const latest = raw.weeks.at(-1) as {
      week: number;
      backlog_total_fcl: number;
      backlog_total_usd: number;
      new_orders_fcl: number;
      new_orders_usd: number;
      salesWeekUsd: number;
      salesCumUsd: number;
      production: { CBU: { weekRawMt: number; weekYield: number } };
      inventory: { totalEndUsd: number };
      cash: { endUsd: number };
    };

    expect(raw.meta).toMatchObject({ weekCount: 35, weekRange: [1, 35], quoteCount: 147 });
    expect(latest).toMatchObject({
      week: 35,
      backlog_total_fcl: 343,
      backlog_total_usd: 23_529_530,
      new_orders_fcl: 3,
      new_orders_usd: 229_828,
      salesWeekUsd: 115_185,
      salesCumUsd: 42_296_959.586,
    });
    expect(latest.production.CBU.weekRawMt).toBeCloseTo(425.5324, 4);
    expect(latest.production.CBU.weekYield).toBeCloseTo(0.3867919470, 8);
    expect(latest.inventory.totalEndUsd).toBeCloseTo(20_601_128.1016, 4);
    expect(latest.cash.endUsd).toBeCloseTo(5_314_086.47, 2);
    expect(raw.checks.filter((check) => check.week === 35)).toHaveLength(8);
    expect(raw.checks.filter((check) => check.week === 35).every((check) => check.ok)).toBe(true);
  });
});

describe('COSMO 35주차 Word 업무보고 계약', () => {
  it('원본 출처와 고유 업무 내용을 보존한다', () => {
    expect(report.source).toEqual({
      file: '2026.9.2_COSMO 주간보고 (35주차).docx',
      sha256: '49dddff739c221a5fb97f19ac292d8fec4da01f8b09e32d2a85a36507c6803a6',
      period: '2026-08-24~2026-08-30',
    });
    expect(report.litigation).toEqual({ case: '아프리카 스타', amountUsd: 540_000, status: '재심리 재판 진행 중' });
    expect(report.operations.audit).toMatchObject({ name: '식품안전 불시 심사(BRC/IFS)', start: '2026-08-24', end: '2026-08-28' });
    // 35주차는 P/MAS·P/DIS 하역이 둘 다 끝나 «차주 예정»이 없다 — next 가 null 인 주를 화면이 견뎌야 한다.
    expect(report.operations.unloading).toMatchObject({ active: 'P/DIS', activeSince: '2026-08-29', next: null, nextDate: null });
    expect(report.operations.unloading.completed.map((x) => [x.vessel, x.totalMt])).toEqual([['P/MAS', 581], ['P/DIS', 628]]);
    expect(report.operations.audit.result).toBe('A+ 등급 유지');
    expect(report.nextActions).toContain('8월 결산 업무 진행');
  });

  it('경영요약에 35주차 업무 브리핑을 렌더한다', () => {
    const markup = renderToStaticMarkup(React.createElement(HomeTab));
    expect(markup).toContain('35주차 업무 브리핑');
    expect(markup).toContain('아프리카 스타');
    expect(markup).toContain('식품안전 불시 심사');
    expect(markup).toContain('A+ 등급 유지');
    expect(markup).toContain('P/MAS');
    expect(markup).toContain('P/DIS');
    // 차주 예정이 없는 주에 «null 예정» 같은 문장이 새지 않아야 한다
    expect(markup).not.toContain('null');
  });
});
