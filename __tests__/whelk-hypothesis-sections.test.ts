import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  WhelkHypothesisCard,
  WhelkHypothesisSection,
} from '../components/WhelkDashboard';

function count(markup: string, pattern: RegExp) {
  return Array.from(markup.matchAll(pattern)).length;
}

describe('whelk hypothesis isolation', () => {
  it('keeps unsupported widgets in a native collapsed section with honest labels', () => {
    // createElement의 자식 인자 형태를 쓰되, 테스트용 별칭에서는 children을 선택값으로 둔다.
    // 실제 컴포넌트 계약은 그대로 유지하면서 react/no-children-prop도 지킨다.
    const HypothesisSection = WhelkHypothesisSection as React.ComponentType<{
      count: number;
      children?: React.ReactNode;
    }>;
    const HypothesisCard = WhelkHypothesisCard as React.ComponentType<{
      reason: string;
      children?: React.ReactNode;
    }>;
    const markup = renderToStaticMarkup(
      React.createElement(
        HypothesisSection,
        { count: 2 },
        React.createElement(
          HypothesisCard,
          {
            key: 'brand',
            reason: '브랜드 점유율 1차 출처 미보유',
          },
          React.createElement('article', { 'data-widget-id': 'brand-map' }),
        ),
        React.createElement(
          HypothesisCard,
          {
            key: 'channel',
            reason: '채널 매출 통계 미보유',
          },
          React.createElement('article', { 'data-widget-id': 'channel-mix' }),
        ),
      ),
    );

    expect(markup).toContain('<details data-whelk-hypothesis-section="true"');
    expect(markup).not.toContain('<details open=""');
    expect(markup).toContain('가설·시나리오 (실측 데이터 없음) · 2개');
    expect(count(markup, /data-whelk-hypothesis-card="true"/g)).toBe(2);
    expect(count(markup, /실측 데이터 없음 — 가설/g)).toBe(2);
    expect(markup).toContain('공백 사유: 브랜드 점유율 1차 출처 미보유');
    expect(markup).toContain('공백 사유: 채널 매출 통계 미보유');
  });
});
