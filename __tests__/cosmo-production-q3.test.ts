import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { cbuAggregate, q3_2026, weeks } from '../lib/data/cosmo';
import Production from '../components/cosmo/tabs/ProductionTab';

/* 2026년 3분기(7~9월) - 주차 말일이 속한 달로 묶는다(영업보고 월별 수주 대조와 같은 기준).
 * 27주차(6/29~7/5)는 3분기, 9/28~9/30 은 40주차 보고에 들어간다. */

describe('생산 탭 2026년 3분기 열', () => {
  it('3분기는 27~39주차(7/5~9/27 말일)다', () => {
    expect(q3_2026.firstWeek).toBe(27);
    expect(q3_2026.lastWeek).toBe(39);
    expect(q3_2026.from).toBe('6/29');
    expect(q3_2026.to).toBe('9/27');
    const inQ = weeks.filter((w) => w.week >= 27 && w.week <= 39);
    expect(q3_2026.rawMt).toBeCloseTo(cbuAggregate(inQ).rawMt, 6);
    expect(q3_2026.daily).toBeCloseTo(cbuAggregate(inQ).daily, 6);
  });

  it('3분기 판매액은 39주차 누적 − 26주차 누적이다', () => {
    const w26 = weeks.find((w) => w.week === 26)!.salesCumUsd!;
    const w39 = weeks.find((w) => w.week === 39)!.salesCumUsd!;
    expect(q3_2026.salesUsd).toBeCloseTo(w39 - w26, 2);
    expect(q3_2026.salesUsd).toBeCloseTo(18_964_477.44, 0);
  });

  it('비교표에 3분기 열이 붙고, 「차이」는 「전년대비」이며 ** 가 글자로 새지 않는다', () => {
    const markup = renderToStaticMarkup(React.createElement(Production));
    expect(markup).toContain('2026 3분기 (27~39주)');
    expect(markup).toContain('전년대비');
    expect(markup).not.toContain('>차이<');
    expect(markup).not.toContain('**');
    expect(markup).toContain('<b>같은 주차 구간(1~40주)</b>');
  });
});
