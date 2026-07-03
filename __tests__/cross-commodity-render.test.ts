import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CrossCommodityIntelligence from '../components/CrossCommodityIntelligence';

describe('cross commodity intelligence render', () => {
  it('renders the anomaly alert queue and hides non-breached alerts', () => {
    const markup = renderToStaticMarkup(React.createElement(CrossCommodityIntelligence));

    expect(markup).toContain('이상 탐지·알림 큐');
    expect(markup).toContain('오징어 대체 압력 급등');
    expect(markup).toContain('/api/squid/squid-forecast');
    expect(markup).not.toContain('마늘 작황 리스크 관찰');
  });
});
