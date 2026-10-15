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

describe('COSMO 2026년 39주차 데이터 계약', () => {
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

    expect(raw.meta).toMatchObject({ weekCount: 41, weekRange: [1, 41], quoteCount: 168 });
    expect(latest).toMatchObject({
      week: 41,
      backlog_total_fcl: 293,
      backlog_total_usd: 20_309_260,
      new_orders_fcl: 23,
      new_orders_usd: 1_573_643,
    });
    // 부동소수 꼬리까지 못박으면 재동기화마다 깨진다 - 허용 오차로 본다
    expect(latest.salesWeekUsd).toBeCloseTo(355_815.18, 2);
    expect(latest.salesCumUsd).toBeCloseTo(52_955_703.766, 2);
    expect(latest.production.CBU.weekRawMt).toBeCloseTo(481.79448, 4);
    expect(latest.production.CBU.weekYield).toBeCloseTo(0.3918238893, 8);
    expect(latest.inventory.totalEndUsd).toBeCloseTo(13_376_329.47, 1);   // docx 「1,337만불」
    expect(latest.cash.endUsd).toBeCloseTo(7_909_632.06, 2);
    // 2026-09-14: 「원어 입고·구매 물량」 검산 추가로 주차당 9건
    expect(raw.checks.filter((check) => check.week === 40)).toHaveLength(9);

    /* 41주차는 «판매 누적 브릿지» 한 건이 원문 단계에서 어긋난다(+$29,046.80). 냉동로인(FBU) 한 행이다 -
     * 금주 판매는 1 FCL $124,358.80 인데 누적은 $4,003,603.74 → $4,157,009.34 로 $153,405.60 늘었다.
     * 다른 품목은 전부 누적 증가 = 금주 판매다. 원문에 경위가 없어 값은 고치지 않는다. */
    expect(raw.checks.filter((c) => c.week === 41 && !c.ok).map((c) => [c.name, c.residual])).toEqual([['판매 누적 브릿지', 29_046.8]]);
    /* 40주차는 «재고 이월» 한 건이 원문 단계에서 어긋난다(-$701,138.36). 원어 YF/BE 한 행이다 -
     * 수량은 171.439 MT 로 39주 잔량과 같은데 금액이 $1,013,157 → $312,019 로 내려갔다.
     * 37주차에 YF/BE 수량이 675.011 → 205.563 MT 로 469 MT 줄었는데 금액 $1,056,019 는 그대로 넘어와
     * 단가가 톤당 $5,137~9,394 로 부풀어 있었고, 40주 기초에서 톤당 약 $1,820 으로 금액이 정리됐다. 값은 고치지 않는다. */
    expect(raw.checks.filter((c) => c.week === 40 && !c.ok).map((c) => [c.name, c.residual])).toEqual([['재고 이월', -701_138.36]]);
    // 38주차는 9건 전부 통과했다 - 37주차의 이월 잔차가 원문에서 정리됐다
    expect(raw.checks.filter((check) => check.week === 38).every((check) => check.ok)).toBe(true);

    /* 39주차는 두 건이 원문 단계에서 어긋난다. 값은 고치지 않는다.
     * ① 판매 피쉬헤드 행의 주간값(7.765 MT · $2,329.5)이 38주차와 같은데 누계(623.557 MT)는
     *    움직이지 않았다 - 판매 누적 브릿지 잔차가 정확히 그 행 금액이다.
     * ② 원어구매 시트는 이번 주 구매 0(누계도 전주 그대로)인데 재고현황 YF/BE 입고 30.225 MT가 적혔다. */
    expect(raw.checks.filter((c) => c.week === 39 && !c.ok).map((c) => [c.name, c.residual])).toEqual([
      ['판매 누적 브릿지', -2_329.5],
      ['원어 입고·구매 물량', 30.23],
    ]);

    /* 36주차에 재고 항등식이 «처음» 깨졌다. 공관·ENDS·주입액 세 자재가 입고·출고 0 인데
     * 잔액만 움직여 잔차 $31,063.75 가 남는다(1~35주는 전부 0.00). 원문 docx 도 그 두 칸이
     * 비어 있어 전사 오류가 아니다 - 지우지 않고 데이터 품질 보드에 그대로 싣는다. */
    const inv = raw.checks.find((c) => c.week === 36 && c.name === '재고 항등식')!;
    expect(inv.ok).toBe(false);
    expect(inv.residual).toBeCloseTo(31_063.75, 2);
    expect(raw.checks.filter((c) => c.week <= 35 && c.name === '재고 항등식').every((c) => c.ok)).toBe(true);

    /* 37주차는 그 36주차 표기의 뒷정리다. 공관 CATERING(+$140,340.59)·ENDS RETAIL(-$4,208.84)
     * 두 행의 기초가 36주차 잔액과 달라 «재고 이월» 잔차 $136,131.74 가 남는다 - 두 행 차이의 합과 같다.
     * 37주차 표는 두 행의 입고·출고를 채워 적었으므로 원문이 고쳐지는 중이라고 본다. */
    const carry = raw.checks.find((c) => c.week === 37 && c.name === '재고 이월')!;
    expect(carry.ok).toBe(false);
    expect(carry.residual).toBeCloseTo(136_131.74, 2);
    // 항등식 잔차 -0.14 는 주입액 EVOO 한 행의 반올림이다 - 0 으로 맞추지 않는다.
    expect(raw.checks.find((c) => c.week === 37 && c.name === '재고 항등식')!.residual).toBeCloseTo(-0.14, 2);
  });
});

describe('COSMO 41주차 Word 업무보고 계약', () => {
  it('원본 출처와 고유 업무 내용을 보존한다', () => {
    expect(report.source).toEqual({
      file: '2026.10.14_COSMO 주간보고 (41주차).docx',
      sha256: 'fcbfe5d62a16563649fcdb7b28124d8960f2a7a3c6d8e3fba16a1a6073a6ba17',
      period: '2026-10-05~2026-10-11',
    });
    expect(report.litigation).toEqual({ case: '아프리카 스타', amountUsd: 540_000, status: '재심리 재판 진행 중' });

    /* 41주차는 36주차 이후 처음으로 하역 보고가 있다(P/FORE · P/QUEEN 하역 종료). 심사는 없어 null 이다.
     * 원문이 SJ·YF·GG 를 따로 적어 YF 를 함께 들고, 세 값의 합이 원문 합계와 맞아야 한다. */
    expect(report.operations.audit).toBeNull();
    expect(report.operations.unloading?.completed).toEqual([
      { vessel: 'P/FORE', skjMt: 603, yfMt: 73, ggMt: 19, totalMt: 695 },
      { vessel: 'P/QUEEN', skjMt: 334, yfMt: 44, ggMt: 29, totalMt: 407 },
    ]);
    for (const v of report.operations.unloading?.completed ?? []) expect(v.skjMt + (v.yfMt ?? 0) + v.ggMt).toBe(v.totalMt);
    expect(report.operations.logistics.headline).toBe('2025년 GRA 세무조사');
    expect(report.market.productionSecuredThrough).toBe('2026년 생산분');
    expect(report.nextActions[0]).toContain('파리 SIAL');
  });

  it('원문 인명을 저장소에 남기지 않는다', () => {
    // 차주 계획의 출장자는 원문에 실명으로 적혀 있다 - 직급으로만 옮긴다.
    const text = JSON.stringify(report);
    expect(text).not.toMatch(/[가-힣]{2,3}\s*(과장|부장|차장|대리|사장|이사)/);
  });

  it('경영요약에 41주차 업무 브리핑을 렌더한다', () => {
    const markup = renderToStaticMarkup(React.createElement(HomeTab));
    expect(markup).toContain('41주차 업무 브리핑');
    expect(markup).toContain('P/FORE · P/QUEEN 하역 완료');
    expect(markup).toContain('P/FORE 695톤 · P/QUEEN 407톤');
    expect(markup).toContain('아프리카 스타');
    // 심사가 없는 주라 그 자리에 이번 주 기타 현황이 온다
    expect(markup).toContain('GRA 세무조사');
    expect(markup).toContain('파리 SIAL');
    expect(markup).toContain('2027년 1분기 생산 물량 오퍼');
    // 지난주 문장이 남으면 여기서 걸린다
    expect(markup).not.toContain('출고 18컨');
    expect(markup).not.toContain('3분기 결산');
    expect(markup).not.toContain('$2,350');
    // 원문 CBU 재고 내역(공장 321만 + CY 243만)은 40주 값 그대로라 싣지 않는다
    expect(markup).not.toContain('공장 321만');
    expect(markup).not.toContain('식품안전 불시 심사');
    expect(markup).not.toContain('null');
  });
});
