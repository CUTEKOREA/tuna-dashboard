import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Production from '../components/cosmo/tabs/ProductionTab';
import { cosmoFbuReport as r, fbuLedgerComparison } from '../lib/data/cosmo-fbu-report';

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);

describe('FBU 9월 월간 현황 계약', () => {
  it('출처를 보존하고 작성자 실명을 남기지 않는다', () => {
    expect(r.source.sha256).toBe('159c0d7ae71b8e1c22c1d0e4bbb55391be82af682a483d370b83a058220a3ca1');
    expect(r.source.reportDate).toBe('2026-09-30');
    expect(JSON.stringify(r)).not.toMatch(/[가-힣]{2,3}\s*(과장|부장|차장|대리)/);
  });

  it('원문 표 합계가 행 합과 맞는다', () => {
    expect(sum(r.staff.groups.map((g) => g.count)) + r.staff.hod).toBe(r.staff.total);
    for (const k of ['raw', 'loin', 'belly', 'euMeat'] as const) {
      expect(sum(r.inventory.rows.map((x) => x[k]))).toBeCloseTo(r.inventory.total[k], 4);
    }
    const { janAug, sep, total } = r.intake;
    expect(janAug.unloadedMt - janAug.returnMt).toBeCloseTo(janAug.finalMt, 3);
    expect(janAug.unloadedMt + sep.unloadedMt).toBeCloseTo(total.unloadedMt, 3);
    expect(sum(r.exports.rows.map((x) => x.mt))).toBeCloseTo(r.exports.total.mt, 4);
    expect(sum(r.exports.rows.map((x) => x.usd))).toBeCloseTo(r.exports.total.usd, 2);
    expect(r.exports.rows).toHaveLength(r.exports.total.containers);
    expect((r.processing.sep.loinMt / r.processing.sep.rawMt) * 100).toBeCloseTo(r.processing.sep.yieldPct, 2);
  });

  it('「월평균 207톤」은 1~8월 평균이다 (누계 − 9월) ÷ 8', () => {
    expect((r.processing.ytd.rawMt - r.processing.sep.rawMt) / 8).toBeCloseTo(207, 0);
  });

  it('주간 원장 누계와는 기준이 달라 차이가 난다 - 화면이 둘 다 밝힌다', () => {
    const c = fbuLedgerComparison();
    expect(c.ledgerWeek).toBe(39);
    expect(c.ledgerRawMt).toBeCloseTo(1739.179, 2);
    expect(c.gapMt).toBeCloseTo(112.435, 2);
    expect(c.gapDays).toBe(7);
  });
});

describe('생산 탭 FBU 월간 현황 섹션', () => {
  it('재고·가공·수출·현안을 렌더하고 EUCC 항목은 싣지 않는다', () => {
    const markup = renderToStaticMarkup(React.createElement(Production));
    for (const s of ['FBU 월간 현황', '352.99', '43.23%', '$436,859', '36 CONT', '가공 중단', '$44,000', '10/5', '1,739']) {
      expect(markup).toContain(s);
    }
    expect(markup).not.toContain('EUCC');
  });
});
