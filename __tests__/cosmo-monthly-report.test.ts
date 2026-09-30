import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { cosmoMonthlyReport as r } from '../lib/data/cosmo-monthly-report';
import { monthly } from '../lib/data/cosmo';
import HomeTab from '../components/cosmo/tabs/HomeTab';
import ProductionTab from '../components/cosmo/tabs/ProductionTab';

/* 원자료: COSMO 월간보고 (9월).pptx — 「COSMO 8월 업무보고」 2026-09-29.
 * 아래 수치는 전부 pptx 원문 하드코딩이다. 계약이 원문에서 멀어지면 여기서 깨진다. */
const sum = (a: readonly number[]) => a.reduce((x, y) => x + y, 0);

describe('cosmo 8월 업무보고 데이터 계약', () => {
  it('출처 메타가 원본 파일을 가리킨다', () => {
    expect(r.source.file).toBe('COSMO 월간보고 (9월).pptx');
    expect(r.source.title).toBe('COSMO 8월 업무보고');
    expect(r.source.reportDate).toBe('2026-09-29');
    expect(r.source.sha256).toBe(
      '2bdf4ba2f5a01a37810e62eedf09b6bb9cd63096e324fcb29e64856bb1c2a0eb',
    );
  });

  it('유동성(1.1 → 8.31, 만불)이 원문과 일치한다', () => {
    expect(r.liquidity).toEqual({
      asOf: '8/31',
      cash: { begin: 337, end: 536 },
      ar: { begin: 207, end: 571 },
      ap: { begin: 1105, end: 2454 },
      shortfall: { begin: -562, end: -1346 },
    });
    // 현금부족은 인쇄값 — 행 계산과 연초·8/31 모두 1 어긋난다(원문 반올림)
    const calc = r.liquidity.cash.end + r.liquidity.ar.end - r.liquidity.ap.end;
    expect(calc).toBe(-1347);
    expect(Math.abs(calc - r.liquidity.shortfall.end)).toBeLessThanOrEqual(1);
  });

  it('재고자산(1.1 → 8.31, 만불)이 원문 합계와 맞아떨어진다', () => {
    const i = r.inventory;
    expect(i.raw.end + i.product.end + i.materials.end).toBe(i.total.end);
    expect(i.raw.begin + i.product.begin + i.materials.begin).toBe(i.total.begin);
    expect(i.total.end).toBe(2461);
  });

  it('영업실적(8월 누적)이 월별 손익 정본과 만불 반올림으로 맞는다', () => {
    const aug = monthly.find((m) => m.month === 8)!;
    expect(Math.round(aug.revenueYtd! / 1e4)).toBe(4241);
    expect(Math.round(aug.gpYtd! / 1e4)).toBe(107);
    expect(Math.round(aug.opYtd! / 1e4)).toBe(-44);
    expect(Math.round(aug.netYtd! / 1e4)).toBe(-189);
    // 원문 «CBU −28만불» 은 인쇄 당월값 기준 — 복원값은 −29 다
    expect(Math.round(aug.net_cbu! / 1e4)).toBe(-29);
    expect(Math.round(aug.correction!.printed['100:Net Income:CBU']! / 1e4)).toBe(-28);
  });

  it('생산지표(8월 누적)가 월별 표와 맞는다', () => {
    const t = r.rawThroughput;
    const p = r.productionYtd;
    expect(sum(t.days.slice(0, p.through))).toBe(p.days.y2026);
    expect(Math.abs(sum(t.revised.slice(0, p.through)) - p.rawMt.y2026)).toBeLessThanOrEqual(1);
    expect(Math.abs(sum(t.plan.slice(0, p.through)) - sum(t.revised.slice(0, p.through)) + p.vsPlan.rawMt))
      .toBeLessThanOrEqual(1);
  });

  it('수주 단가·어대금·원어재고가 원문과 일치한다', () => {
    expect(r.orderPrice).toEqual({ fromUsd: 49.5, toUsd: 51.5, basis: '$2kg 기준', fishPriceUsd: 1900 });
    expect(r.panofiPayable).toEqual({ asOf: '8/31', usd10k: 2085 });
    expect(r.rawStock).toEqual({ asOf: '9/25', sjMt: 2466, yfMt: null, mixMt: null });
  });

  it('인명이 계약에 들어가지 않는다', () => {
    expect(JSON.stringify(r)).not.toMatch(/[가-힣]{2,3}\s?(과장|부장|차장|대리|법인장)/);
  });
});

describe('cosmo 8월 업무보고 월별 표', () => {
  it('월별 원어 처리량 표가 12개월치이고 연간 합계와 맞아떨어진다', () => {
    const t = r.rawThroughput;
    for (const row of [t.plan, t.revised, t.days, t.dailyMt]) expect(row).toHaveLength(12);
    expect(t.revised).toEqual([1540, 2191, 2126, 2128, 1640, 2364, 2414, 1690, 2034, 2420, 2310, 1650]);
    expect(sum(t.plan)).toBe(t.annual.planMt);
    expect(sum(t.revised)).toBe(t.annual.revisedMt);
    expect(t.annual.revisedMt).toBe(24507);
    expect(sum(t.days)).toBe(t.annual.days);
    t.revised.forEach((mt, i) => {
      expect(Math.abs(mt / t.days[i] - t.dailyMt[i])).toBeLessThan(1);
    });
    expect(Math.abs(t.annual.revisedMt / t.annual.days - t.annual.dailyMt)).toBeLessThan(1);
    // 5쪽 「참고) 10월 생산 계획」은 3쪽 표의 10월과 같은 값이다
    const nm = r.nextMonthPlan;
    expect(nm.days * nm.dailyMt).toBe(nm.totalMt);
    expect(t.revised[nm.month - 1]).toBe(nm.totalMt);
    expect(t.days[nm.month - 1]).toBe(nm.days);
  });

  it('컨테이너 원문 합계 열은 8월 수정 전 값이 남아 있다 — 행 합계를 정본으로 쓴다', () => {
    const c = r.containers;
    for (const row of [c.cbuPlan, c.cbuOnBoard, c.fbu]) expect(row).toHaveLength(12);
    expect(sum(c.cbuPlan)).toBe(c.printedAnnual.cbuPlan);
    expect(sum(c.cbuOnBoard)).toBe(889);
    expect(sum(c.fbu)).toBe(46);
    expect(c.printedAnnual).toEqual({ cbuPlan: 1036, cbuOnBoard: 934, cbuGap: -102, fbu: 48 });
    // 7월 업무보고 값(8월 On Board 95, FBU 5)을 넣으면 인쇄 합계와 맞는다 — 합계만 안 고친 것
    expect(sum(c.cbuOnBoard) - c.cbuOnBoard[7] + 95).toBe(c.printedAnnual.cbuOnBoard);
    expect(sum(c.fbu) - c.fbu[7] + 5).toBe(c.printedAnnual.fbu);
  });
});

describe('화면 노출', () => {
  it('경영요약 업무보고 카드가 8월 업무보고 수치로 렌더된다', () => {
    const markup = renderToStaticMarkup(React.createElement(HomeTab));
    expect(markup).toContain('8월 업무보고 (2026-09-29)');
    expect(markup).not.toContain('7월 업무보고 (2026-08-25)');
    expect(markup).toContain('2,454');   // 매입채무 8/31
    expect(markup).toContain('1,690');   // 8월 실적 MT
    expect(markup).toContain('24,507');  // 연간 변경계획 MT
    expect(markup).toContain('51.5');    // 인상 단가
    expect(markup).toContain('2,085');   // PANOFI 어대금
    expect(markup).toContain('YF·믹스는 원문 미기재');
    expect(markup).not.toContain('Tender');
    expect(markup).not.toContain('송인혁');
    expect(markup).toContain('OTTO FRANCK');
  });

  it('생산 탭 서술이 표에서 나온다', () => {
    const markup = renderToStaticMarkup(React.createElement(ProductionTab));
    expect(markup).not.toContain('상반기 실적 일 처리량보다 높게');
    expect(markup).not.toContain('MSC 선박');
    expect(markup).toContain('889 FCL');
    expect(markup).toContain('Gate-in');
    expect(markup).toContain('5월에만 계획을 넘겼는데');
  });
});
