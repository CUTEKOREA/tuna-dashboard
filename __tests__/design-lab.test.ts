import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DesignLabPage from '../app/design-lab/page';
import { DESIGN_VARIANTS } from '../components/design-lab/variants';

describe('design lab 시안 랭킹 갤러리', () => {
  it('시안 레지스트리는 3건 이상이고 id가 유일하다', () => {
    expect(DESIGN_VARIANTS.length).toBeGreaterThanOrEqual(3);
    expect(new Set(DESIGN_VARIANTS.map((variant) => variant.id)).size).toBe(DESIGN_VARIANTS.length);
  });

  it('페이지가 시안 제목·별점·코멘트 입력을 렌더한다', () => {
    const markup = renderToStaticMarkup(React.createElement(DesignLabPage));

    for (const variant of DESIGN_VARIANTS) {
      expect(markup).toContain(variant.title);
    }
    expect(markup).toContain('aria-label="5점"');
    expect(markup).toContain('<textarea');
    // 시안 렌더 영역은 라이트 스코프 안에서만 평가한다
    expect(markup).toContain('data-v3="light"');
  });
});
