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

  it('생산계획 변경이 원문과 일치한다 — 8월 2,730→2,310, 연간 29,000→26,118', () => {
    expect(r.productionPlan.augustPlanMt).toBe(2730);
    expect(r.productionPlan.augustRevisedMt).toBe(2310);
    expect(r.productionPlan.annualPlanMt).toBe(29000);
    expect(r.productionPlan.annualRevisedMt).toBe(26118);
    expect(r.productionPlan.annualRevisedMt - r.productionPlan.annualPlanMt).toBe(-2882);
    expect(r.productionPlan.september).toEqual({ days: 21, dailyMt: 110, totalMt: 2310 });
  });

  it('수주 단가 인상·어대금·원어재고가 원문과 일치한다', () => {
    expect(r.orderPrice).toEqual({ fromUsd: 46.0, toUsd: 49.5, basis: '$2kg 기준' });
    expect(r.panofiPayable).toEqual({ asOf: '7/31', usd10k: 1864 });
    expect(r.rawStock).toEqual({ asOf: '8/21', sjMt: 3396, yfMt: 26, mixMt: 620 });
    expect(r.rawStock.sjMt + r.rawStock.yfMt + r.rawStock.mixMt).toBe(4042);
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
  });
});
