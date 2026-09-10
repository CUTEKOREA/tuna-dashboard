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
  checks: Array<{ week: number; name: string; residual: number; ok: boolean }>;
};

describe('COSMO 2026년 36주차 데이터 계약', () => {
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

    expect(raw.meta).toMatchObject({ weekCount: 36, weekRange: [1, 36], quoteCount: 150 });
    expect(latest).toMatchObject({
      week: 36,
      backlog_total_fcl: 340,
      backlog_total_usd: 23_315_830,
      new_orders_fcl: 11,
      new_orders_usd: 764_769,
    });
    // 부동소수 꼬리까지 못박으면 재동기화마다 깨진다 - 허용 오차로 본다
    expect(latest.salesWeekUsd).toBeCloseTo(2_743_809.64, 2);
    expect(latest.salesCumUsd).toBeCloseTo(45_040_769.226, 2);
    expect(latest.production.CBU.weekRawMt).toBeCloseTo(430.9902, 4);
    expect(latest.production.CBU.weekYield).toBeCloseTo(0.3878999151, 8);
    expect(latest.inventory.totalEndUsd).toBeCloseTo(19_226_602.1, 1);
    expect(latest.cash.endUsd).toBeCloseTo(7_113_546.14, 2);   // docx 「711만불」
    expect(raw.checks.filter((check) => check.week === 36)).toHaveLength(8);

    /* 36주차에 재고 항등식이 «처음» 깨졌다. 공관·ENDS·주입액 세 자재가 입고·출고 0 인데
     * 잔액만 움직여 잔차 $31,063.75 가 남는다(1~35주는 전부 0.00). 원문 docx 도 그 두 칸이
     * 비어 있어 전사 오류가 아니다 - 지우지 않고 데이터 품질 보드에 그대로 싣는다. */
    const inv = raw.checks.find((c) => c.week === 36 && c.name === '재고 항등식')!;
    expect(inv.ok).toBe(false);
    expect(inv.residual).toBeCloseTo(31_063.75, 2);
    expect(raw.checks.filter((c) => c.week <= 35 && c.name === '재고 항등식').every((c) => c.ok)).toBe(true);
  });
});

describe('COSMO 36주차 Word 업무보고 계약', () => {
  it('원본 출처와 고유 업무 내용을 보존한다', () => {
    expect(report.source).toEqual({
      file: '2026.9.9_COSMO 주간보고 (36주차).docx',
      sha256: 'fd917193bb2b3716a37ba470f735a8d6c2e4bed6550ab58ea255ed3c416602c1',
      period: '2026-08-31~2026-09-06',
    });
    expect(report.litigation).toEqual({ case: '아프리카 스타', amountUsd: 540_000, status: '재심리 재판 진행 중' });

    /* 36주차 보고에는 품질 심사도 하역도 없다. 35주차 값을 그대로 두면 화면이 지난주
     * 사건을 «36주차 업무 브리핑» 으로 내보낸다 - 그래서 두 항목은 null 이고,
     * 그 자리에 그 주가 실제 보고한 물류·차주 계획이 들어간다. */
    expect(report.operations.audit).toBeNull();
    expect(report.operations.unloading).toBeNull();
    expect(report.operations.logistics.headline).toBe('MPS 항만 혼잡');
    expect(report.nextActions).toContain('8월 결산 업무 진행');
  });

  it('원문 인명을 저장소에 남기지 않는다', () => {
    // 차주 계획의 출장자는 원문에 실명으로 적혀 있다 - 직급으로만 옮긴다.
    const text = JSON.stringify(report);
    expect(text).not.toMatch(/[가-힣]{2,3}\s*(과장|부장|차장|대리|사장|이사)/);
    expect(report.nextActions.some((a) => a.includes('과장급'))).toBe(true);
  });

  it('경영요약에 36주차 업무 브리핑을 렌더한다', () => {
    const markup = renderToStaticMarkup(React.createElement(HomeTab));
    expect(markup).toContain('36주차 업무 브리핑');
    expect(markup).toContain('아프리카 스타');
    // 심사·하역이 없는 주라 그 자리에 이번 주 물류·차주 계획이 온다
    expect(markup).toContain('MPS 항만 혼잡');
    expect(markup).toContain('과장급 유럽 출장');
    // 지난주 사건이 이번 주 브리핑으로 새지 않는다
    expect(markup).not.toContain('식품안전 불시 심사');
    expect(markup).not.toContain('P/MAS');
    expect(markup).not.toContain('null');
  });
});
