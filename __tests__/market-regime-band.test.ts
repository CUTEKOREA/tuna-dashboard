import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import MarketRegimeBand, {
  MarketRegimeIndicatorCard,
} from '@/components/market-understanding/MarketRegimeBand';
import PollockIndustryDashboard from '@/components/market-understanding/PollockIndustryDashboard';
import { marketRegimeFor } from '@/lib/data/market-regime';

describe('MarketRegimeBand', () => {
  it('옥수수·마늘·명태 렌더 시 JSON 수치가 마크업에 포함된다', () => {
    const corn = renderToStaticMarkup(React.createElement(MarketRegimeBand, { commodityKey: 'corn' }));
    expect(corn).toContain('23.0%');

    const garlic = renderToStaticMarkup(React.createElement(MarketRegimeBand, { commodityKey: 'garlic' }));
    expect(garlic).toContain('10,682');

    const pollockPage = renderToStaticMarkup(
      React.createElement(PollockIndustryDashboard, { heroOnly: false }),
    );
    expect(pollockPage).toContain('509,567');
  });

  it('데이터 없는 품목은 띠를 그리지 않는다', () => {
    const html = renderToStaticMarkup(React.createElement(MarketRegimeBand, { commodityKey: 'almonds' }));
    expect(html).toBe('');
    expect(html).not.toContain('market-regime-band');
  });

  it('status 가 ok 가 아닌 지표는 갱신 대기를 표시한다', () => {
    const pending = marketRegimeFor('pollock').find((row) => row.status !== 'ok');
    expect(pending).toBeDefined();
    const html = renderToStaticMarkup(
      React.createElement(MarketRegimeIndicatorCard, { indicator: pending! }),
    );
    expect(html).toContain('갱신 대기');
  });
});
