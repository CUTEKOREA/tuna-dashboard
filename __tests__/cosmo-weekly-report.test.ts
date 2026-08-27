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

    expect(raw.meta).toMatchObject({ weekCount: 34, weekRange: [1, 34], quoteCount: 145 });
    expect(latest).toMatchObject({
      week: 34,
      backlog_total_fcl: 356,
      backlog_total_usd: 23_988_150,
      new_orders_fcl: 26,
      new_orders_usd: 2_022_949,
      salesWeekUsd: 166_713.08,
      salesCumUsd: 42_181_774.586,
    });
    expect(latest.production.CBU.weekRawMt).toBeCloseTo(380.0661, 4);
    expect(latest.production.CBU.weekYield).toBeCloseTo(0.3773908775, 8);
    expect(latest.inventory.totalEndUsd).toBeCloseTo(19_031_927.5205, 4);
    expect(latest.cash.endUsd).toBeCloseTo(3_162_345.7351, 4);
    expect(raw.checks.filter((check) => check.week === 34)).toHaveLength(8);
    expect(raw.checks.filter((check) => check.week === 34).every((check) => check.ok)).toBe(true);
  });
});

describe('COSMO 34주차 Word 업무보고 계약', () => {
  it('원본 출처와 고유 업무 내용을 보존한다', () => {
    expect(report.source).toEqual({
      file: '2026.8.27_COSMO 주간보고 (34주차).docx',
      sha256: '6a0d61f15f28732766e926d2e19e1469f314a8a98f71272fe2caece8b7f0a5eb',
      period: '2026-08-17~2026-08-23',
    });
    expect(report.litigation).toEqual({ case: '아프리카 스타', amountUsd: 540_000, status: '재심리 재판 진행 중' });
    expect(report.operations.audit).toEqual({ name: '식품안전 불시 심사(BRC/IFS)', start: '2026-08-24', end: '2026-08-28' });
    expect(report.operations.unloading).toEqual({ active: 'P/MAS', activeSince: '2026-08-23', next: 'P/DIS', nextDate: '2026-08-29' });
    expect(report.nextActions).toContain('8월 결산 업무 진행');
  });

  it('경영요약에 34주차 업무 브리핑을 렌더한다', () => {
    const markup = renderToStaticMarkup(React.createElement(HomeTab));
    expect(markup).toContain('34주차 업무 브리핑');
    expect(markup).toContain('아프리카 스타');
    expect(markup).toContain('식품안전 불시 심사');
    expect(markup).toContain('P/MAS');
    expect(markup).toContain('P/DIS');
  });
});
