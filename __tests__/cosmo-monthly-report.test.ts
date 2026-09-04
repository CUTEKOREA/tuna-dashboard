import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { cosmoMonthlyReport as r } from '../lib/data/cosmo-monthly-report';
import HomeTab from '../components/cosmo/tabs/HomeTab';

/* 원자료: COSMO 월간보고 (8월).pptx — 「COSMO 7월 업무보고」 2026-08-25.
 * 아래 수치는 전부 pptx 원문 하드코딩이다. 계약이 원문에서 멀어지면 여기서 깨진다. */

describe('cosmo 7월 업무보고 데이터 계약', () => {
  it('출처 메타가 원본 파일을 가리킨다', () => {
    expect(r.source.file).toBe('COSMO 월간보고 (8월).pptx');
    expect(r.source.reportDate).toBe('2026-08-25');
    expect(r.source.sha256).toBe(
      '107b9ccac5e2e554d7c741af3fe21fe8dbe7d665b7a28664e69a437b1097c78d',
    );
  });

  it('유동성(1.1 → 7.31, 만불)이 원문과 일치한다', () => {
    expect(r.liquidity).toEqual({
      asOf: '7/31',
      cash: { begin: 337, end: 493 },
      ar: { begin: 207, end: 883 },
      ap: { begin: 1105, end: 1942 },
      shortfall: { begin: -562, end: -566 },
    });
    // 원문 인쇄값 검증: 현금 + 매출채권 − 매입채무 = 현금부족 (7/31 정확, 연초는 원문 반올림 −1)
    expect(r.liquidity.cash.end + r.liquidity.ar.end - r.liquidity.ap.end)
      .toBe(r.liquidity.shortfall.end);
  });

  it('재고자산(1.1 → 7.31, 만불)이 원문 합계와 맞아떨어진다', () => {
    expect(r.inventory).toEqual({
      asOf: '7/31',
      raw: { begin: 366, end: 130 },
      product: { begin: 1189, end: 1283 },
      materials: { begin: 416, end: 371 },
      total: { begin: 1971, end: 1784 },
    });
    expect(r.inventory.raw.end + r.inventory.product.end + r.inventory.materials.end)
      .toBe(r.inventory.total.end);
    expect(r.inventory.raw.begin + r.inventory.product.begin + r.inventory.materials.begin)
      .toBe(r.inventory.total.begin);
  });

  it('생산계획 변경이 원문과 일치한다 - 8월 2,730→2,310, 연간 29,000→26,118', () => {
    expect(r.productionPlan.augustPlanMt).toBe(2730);
    expect(r.productionPlan.augustRevisedMt).toBe(2310);
    expect(r.productionPlan.annualPlanMt).toBe(29000);
    expect(r.productionPlan.annualRevisedMt).toBe(26118);
    expect(r.productionPlan.annualRevisedMt - r.productionPlan.annualPlanMt).toBe(-2882);
    // 9월은 월별 표가 정본이다(docx = pptx 3쪽 표). pptx 5쪽 슬라이드의 21일×110톤은
    // 같은 문서의 3쪽 표와도, 연간 26,118 과도 맞지 않는다
    expect(r.productionPlan.september).toEqual({ days: 21, dailyMt: 120, totalMt: 2520 });
    expect(r.productionPlan.september.days * r.productionPlan.september.dailyMt)
      .toBe(r.productionPlan.september.totalMt);
    // 5쪽 슬라이드 값을 그대로 쓰면 12개월 합이 연간 개정치와 어긋난다는 것을 고정한다
    const pptxSum = r.rawThroughput.revised.reduce((a, b) => a + b, 0)
      - r.productionPlan.september.totalMt + r.productionPlan.septemberPptxRaw.totalMt;
    expect(pptxSum).not.toBe(r.productionPlan.annualRevisedMt);
  });

  it('수주 단가 인상·어대금·원어재고가 원문과 일치한다', () => {
    expect(r.orderPrice).toEqual({ fromUsd: 46.0, toUsd: 49.5, basis: '$2kg 기준' });
    expect(r.panofiPayable).toEqual({ asOf: '7/31', usd10k: 1864 });
    expect(r.rawStock).toEqual({ asOf: '8/21', sjMt: 3396, yfMt: 26, mixMt: 620 });
    expect(r.rawStock.sjMt + r.rawStock.yfMt + r.rawStock.mixMt).toBe(4042);
  });
});

describe('cosmo 7월 업무보고 docx 판본 (월별 표)', () => {
  it('docx 출처 메타가 원본 파일을 가리킨다', () => {
    expect(r.docSource.file).toBe('COSMO 2026 07 업무보고.docx');
    expect(r.docSource.sha256).toBe(
      'f89ee979f7389ff7cd3ff4bfcda0a51c29813be2405c35e09536a5a61802ac5b',
    );
  });

  it('월별 원어 처리량 표가 12개월치이고 연간 합계와 맞아떨어진다', () => {
    const t = r.rawThroughput;
    for (const row of [t.plan, t.revised, t.days, t.dailyMt]) expect(row).toHaveLength(12);
    expect(t.plan).toEqual([2375, 2500, 2570, 1875, 1750, 2860, 2860, 2730, 2520, 2640, 2520, 1800]);
    expect(t.revised).toEqual([1540, 2191, 2126, 2128, 1640, 2364, 2414, 2310, 2520, 2640, 2520, 1725]);
    const sum = (a: readonly number[]) => a.reduce((x, y) => x + y, 0);
    expect(sum(t.plan)).toBe(t.annual.planMt);
    expect(sum(t.revised)).toBe(t.annual.revisedMt);
    expect(sum(t.days)).toBe(t.annual.days);
    // 일 처리량은 원문 인쇄값(정수 반올림)이다 - 처리량/일수와 1톤 안에서 맞는지만 본다
    t.revised.forEach((mt, i) => {
      expect(Math.abs(mt / t.days[i] - t.dailyMt[i])).toBeLessThan(1);
    });
    expect(Math.abs(t.annual.revisedMt / t.annual.days - t.annual.dailyMt)).toBeLessThan(1);
    // 생산계획 개정 요약은 같은 표에서 나온 값이라 어긋나면 안 된다
    expect(t.revised[7]).toBe(r.productionPlan.augustRevisedMt);
    expect(t.plan[7]).toBe(r.productionPlan.augustPlanMt);
    expect(t.annual.revisedMt).toBe(r.productionPlan.annualRevisedMt);
    expect(t.revised[8]).toBe(r.productionPlan.september.totalMt);
    expect(t.days[8]).toBe(r.productionPlan.september.days);
  });

  it('컨테이너 출고 표가 원문 합계와 맞아떨어진다', () => {
    const c = r.containers;
    for (const row of [c.cbuPlan, c.cbuOnBoard, c.fbu]) expect(row).toHaveLength(12);
    const sum = (a: readonly number[]) => a.reduce((x, y) => x + y, 0);
    expect(sum(c.cbuPlan)).toBe(1036);
    expect(sum(c.cbuOnBoard)).toBe(934);
    expect(sum(c.fbu)).toBe(48);
    expect(c.annual.cbuGap).toBe(934 - 1036);
    expect(c.cbuOnBoard[6]).toBe(93);   // 7월 실적
    expect(c.cbuPlan[6]).toBe(102);
  });

  it('감사 결과가 예정이 아니라 완료로 바뀌었다', () => {
    expect(r.agenda.join(' ')).toContain('A+');
    expect(r.agenda.join(' ')).not.toContain('예정');
  });
});

describe('경영요약 화면 노출', () => {
  it('7월 업무보고 카드가 핵심 수치와 함께 렌더된다', () => {
    const markup = renderToStaticMarkup(React.createElement(HomeTab));
    expect(markup).toContain('7월 업무보고');
    expect(markup).toContain('1,942');   // 매입채무 7/31
    expect(markup).toContain('2,310');   // 8월 변경계획 MT
    expect(markup).toContain('26,118');  // 연간 변경계획 MT
    expect(markup).toContain('49.5');    // 인상 단가
    expect(markup).toContain('1,864');   // PANOFI 어대금
    expect(markup).toContain('OTTO FRANCK');  // 독일 주요 고객사 품질 클레임
  });
});
