import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import MarketTab from '../components/cosmo/tabs/MarketTab';
import { cosmoSalesReport as r, ordersVsLedger } from '../lib/data/cosmo-sales-report';

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);

describe('COSMO 2026년 3분기 영업보고 계약', () => {
  it('원본 출처를 보존한다', () => {
    expect(r.source).toEqual({
      file: '2026.09.30_분기별 보고 (9월).docx',
      sha256: 'e9628150d02a8d1f59750f0c8b35d90fccb07f173ed09398ad39e53c9232f005',
      reportDate: '2026-09-30',
      period: '2026년 3분기(7~9월)',
    });
  });

  it('4분기 수주 계획은 품목별 행 합과 월별 열 합이 인쇄된 합계와 맞는다', () => {
    const { months, rows, total } = r.q4Plan;
    expect(months).toEqual(['10월', '11월', '12월']);
    for (const row of rows) {
      expect(sum(row.fcl)).toBe(row.fclTotal);
      expect(sum(row.usd)).toBe(row.usdTotal);
    }
    expect(total.fcl).toEqual([120, 110, 80]);
    expect(total.fclTotal).toBe(310);
    expect(total.usdTotal).toBe(26_415_470);
    months.forEach((_, i) => {
      expect(sum(rows.map((row) => row.fcl[i]))).toBe(total.fcl[i]);
      expect(sum(rows.map((row) => row.usd[i]))).toBe(total.usd[i]);
    });
    // 원문 「제품별 예상 매출액(FCL 기준)」은 10월 금액 ÷ 10월 FCL 과 같다
    expect(rows.map((row) => Math.round(row.usd[0] / row.fcl[0]))).toEqual(rows.map((row) => row.usdPerFcl));
  });

  it('1~9월 누적 수주는 월별 합이 743.5 FCL · $53,629,897 이고 1~6월은 474.5 FCL 이다', () => {
    expect(sum(r.ordersYtd.map((m) => m.fcl))).toBe(743.5);
    expect(sum(r.ordersYtd.map((m) => m.usd))).toBe(53_629_897);
    expect(sum(r.ordersYtd.slice(0, 6).map((m) => m.fcl))).toBe(474.5);   // 2분기 영업보고 값과 같다
  });

  it('주간 원장의 신규수주와 나란히 놓으면 차이는 주차가 월 경계를 걸친 몫뿐이다', () => {
    const cmp = ordersVsLedger();
    expect(cmp).toHaveLength(9);
    // 9월은 영업보고와 주간 원장이 35 FCL 로 같다
    expect(cmp[8]).toMatchObject({ month: 9, reportFcl: 35, ledgerFcl: 35 });
    expect(sum(cmp.map((c) => c.ledgerFcl))).toBeCloseTo(749.5, 1);
    expect(sum(cmp.map((c) => c.ledgerFcl - c.reportFcl))).toBeCloseTo(6, 1);
  });

  it('주요 바이어 3곳의 9월까지 수주량을 원문 그대로 싣는다', () => {
    expect(r.buyers.map((b) => [b.name, b.country, b.ordersFcl])).toEqual([
      ['Otto Franck', '독일', 176],
      ['Kingfisher', '영국', 117.5],
      ['Gloe', '네덜란드', 44],
    ]);
  });

  it('원문 인명을 저장소에 남기지 않는다', () => {
    const text = JSON.stringify(r);
    expect(text).not.toMatch(/[가-힣]{2,3}\s*(과장|부장|차장|대리|사장|이사)/);
    // 원문의 바이어 측 담당자 이름(영문 이름)도 직함으로만 옮긴다
    for (const name of ['John', 'Jared', 'Pieter', 'Ed ', '(Ed']) expect(text).not.toContain(name);
  });
});

describe('시장·바이어 탭의 3분기 영업보고 섹션', () => {
  it('4분기 계획·바이어·시장 오퍼가·애로사항을 렌더한다', () => {
    const markup = renderToStaticMarkup(React.createElement(MarketTab));
    for (const s of ['3분기 영업보고', '4분기 수주 계획', '310 FCL', '$26.42M', 'Otto Franck', '117.5', '시장 오퍼가', '$51.00', '애로사항', '743.5']) {
      expect(markup).toContain(s);
    }
  });
});
