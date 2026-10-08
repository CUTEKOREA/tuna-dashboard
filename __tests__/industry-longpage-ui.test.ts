import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import CommodityIndustryDashboard, { type CommoditySpec } from '../components/market-understanding/CommodityIndustryDashboard';

function makeSpec(continuous: boolean | undefined): CommoditySpec {
  const narratives = Array.from({ length: 19 }, (_, index) => {
    const key = `s${String(index + 1).padStart(2, '0')}`;
    return {
      key,
      numeral: String(index + 1).padStart(2, '0'),
      title: `제목 ${index + 1}`,
      question: '질문은 무엇인가',
      lede: '리드 문장은 충분히 길어야 하며 테스트를 위한 문장이다.',
      paragraphs: [
        '첫 번째 문단 테스트 내용이다.',
        '두 번째 문단 테스트 내용이다.',
        '세 번째 문단 테스트 내용이다.',
      ],
      facts: [
        { label: '사실 항목', value: '100 톤', asOf: '2024년', source: '출처', grade: 'A' as const },
        { label: '사실 둘', value: '200 톤', asOf: '2024년', source: '출처', grade: 'A' as const },
        { label: '사실 셋', value: '300 톤', asOf: '2024년', source: '출처', grade: 'A' as const },
      ],
      terms: [],
    };
  });

  return {
    key: 'test-long',
    title: '테스트 품목',
    subtitle: '부제 테스트',
    accent: '#6d28d9',
    primaryKpi: { label: '라벨', value: 100, unit: '(톤)' },
    secondaryKpis: [],
    stripItems: [],
    briefing: [{ stage: 's01', text: '한글 요약 문장 테스트' }],
    narratives,
    chartSlots: {},
    sourceNotes: ['출처 노트 한글 테스트'],
    sourceMeta: '메타 한글',
    continuous,
  };
}

describe('긴 연속 페이지 보조 UI', () => {
  it('continuous 모드에는 맨 위로 버튼과 진행 텍스트가 있다', () => {
    const spec = makeSpec(true);
    const html = renderToStaticMarkup(React.createElement(CommodityIndustryDashboard, { spec }));
    expect(html).toContain('aria-label="맨 위로"');
    expect(html).toContain('/ 19');
    expect(html).toContain('01 / 19');
    expect(html).toContain('longpageProgress');
    expect(html).toContain('backToTop');
    // 진행 막대는 3px 높이로 렌더된다 (CSS 클래스 존재로 확인)
    expect(html).toContain('longpageProgressTrack');
    expect(html).toContain('longpageProgressFill');
  });

  it('페이저 모드(continuous 없음)에는 보조 UI가 없다', () => {
    const spec = makeSpec(undefined);
    const html = renderToStaticMarkup(React.createElement(CommodityIndustryDashboard, { spec }));
    expect(html).not.toContain('aria-label="맨 위로"');
    expect(html).not.toContain('longpageProgress');
    expect(html).not.toContain('backToTop');
    // 페이저에서는 진행 텍스트도 없다
    expect(html).not.toContain('/ 19');
  });

  it('continuous false 로 바꾼 임시 spec 에도 보조 UI가 없다', () => {
    const spec = { ...makeSpec(true), continuous: false as const };
    const html = renderToStaticMarkup(React.createElement(CommodityIndustryDashboard, { spec }));
    expect(html).not.toContain('aria-label="맨 위로"');
    expect(html).not.toContain('longpageProgress');
  });

  it('SSR 에서 window/document 없이도 오류 없이 렌더된다', () => {
    const spec = makeSpec(true);
    expect(() => renderToStaticMarkup(React.createElement(CommodityIndustryDashboard, { spec }))).not.toThrow();
    const pager = makeSpec(undefined);
    expect(() => renderToStaticMarkup(React.createElement(CommodityIndustryDashboard, { spec: pager }))).not.toThrow();
  });
});
