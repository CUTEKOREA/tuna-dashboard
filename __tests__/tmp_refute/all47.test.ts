import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getTunaIndustryStages } from '@/lib/data/tuna-industry';
import TunaIndustryChart from '@/components/market-understanding/TunaIndustryChart';

describe('47개 위젯 전수 렌더', () => {
  for (const stage of getTunaIndustryStages()) {
    for (const w of stage.widgets) {
      it(`${stage.key}/${w.id} (${w.chartType})`, () => {
        const markup = renderToStaticMarkup(
          React.createElement(TunaIndustryChart, { widget: w }),
        );
        const hasShape = /<(path|rect|circle|polygon|line)\b/.test(markup);
        expect(hasShape, `${w.id}: SVG 도형 없음 (빈 차트)`).toBe(true);
      });
    }
  }
});
