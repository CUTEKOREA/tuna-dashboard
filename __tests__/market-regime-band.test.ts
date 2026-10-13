import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import MarketRegimeBand, {
  formatMarketRegimeValue,
  MarketRegimeIndicatorCard,
} from '@/components/market-understanding/MarketRegimeBand';
import PollockIndustryDashboard from '@/components/market-understanding/PollockIndustryDashboard';
import { marketRegimeCommodityKeys, marketRegimeFor } from '@/lib/data/market-regime';

describe('MarketRegimeBand', () => {
  it('JSON에 ok 지표가 있는 품목은 띠가 렌더되고 첫 ok 수치가 마크업에 있다', () => {
    for (const key of marketRegimeCommodityKeys()) {
      const indicators = marketRegimeFor(key);
      const firstOk = indicators.find((row) => row.status === 'ok');
      if (!firstOk) continue;

      const expected = formatMarketRegimeValue(firstOk.value, firstOk.unit);
      const html = renderToStaticMarkup(
        React.createElement(MarketRegimeBand, { commodityKey: key }),
      );

      expect(html).toContain('market-regime-band');
      expect(html).toContain(expected);
    }
  });

  it('명태 전용 페이지에도 시장 국면 띠가 붙는다', () => {
    const pollockPage = renderToStaticMarkup(
      React.createElement(PollockIndustryDashboard, { heroOnly: false }),
    );
    expect(pollockPage).toContain('market-regime-band');
    expect(pollockPage).toContain('509,567');
  });

  it('ok 지표가 없는 품목(olive)은 띠를 그리지 않는다', () => {
    const html = renderToStaticMarkup(React.createElement(MarketRegimeBand, { commodityKey: 'olive' }));
    expect(html).toBe('');
    expect(html).not.toContain('market-regime-band');
  });

  it('데이터 키가 없는 품목은 띠를 그리지 않는다', () => {
    const html = renderToStaticMarkup(
      React.createElement(MarketRegimeBand, { commodityKey: 'tuna' }),
    );
    expect(html).toBe('');
  });

  it('status 가 ok 가 아닌 지표는 갱신 대기를 표시한다', () => {
    const pending = marketRegimeFor('pollock').find((row) => row.status !== 'ok');
    expect(pending).toBeDefined();
    const html = renderToStaticMarkup(
      React.createElement(MarketRegimeIndicatorCard, { indicator: pending! }),
    );
    expect(html).toContain('갱신 대기');
  });

  it('asof 가 null 이면 기준일 없음을 표시한다', () => {
    const base = marketRegimeFor('corn')[0];
    const indicator = { ...base, asof: null };
    const html = renderToStaticMarkup(
      React.createElement(MarketRegimeIndicatorCard, { indicator }),
    );
    expect(html).toContain('기준일 없음');
  });
});
