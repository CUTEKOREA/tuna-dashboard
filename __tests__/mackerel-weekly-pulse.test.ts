import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MackerelIndustryDashboard from '@/components/market-understanding/MackerelIndustryDashboard';
import {
  MACKEREL_NARRATIVES,
  MACKEREL_SOURCE_NOTES,
} from '@/lib/mackerel-industry-content';

function narrativeText(): string {
  return MACKEREL_NARRATIVES.flatMap((stage) => [
    stage.lede,
    ...stage.paragraphs,
    ...stage.facts.flatMap((fact) => [
      fact.label,
      fact.value,
      fact.asOf,
      fact.source,
      fact.note ?? '',
    ]),
  ]).join('\n');
}

describe('고등어 최신 주간 수급 신호', () => {
  it('NSC 34주 누계 물량·단가와 전년 대비를 표시한다', () => {
    const text = narrativeText();

    expect(text).toContain('2026년 34주');
    expect(text).toContain('41,108 톤');
    expect(text).toContain('48.35 NOK/kg');
    expect(text).toContain('물량 -46.2%');
    expect(text).toContain('단가 +61.3%');
    expect(text).not.toContain('32주 누계');
  });

  it('KMI Vol.257 국내 도매·소매 가격과 미형성을 구분한다', () => {
    const text = narrativeText();

    expect(text).toContain('KMI Vol.257');
    expect(text).toContain('냉장 도매 6,172');
    expect(text).toContain('냉동 도매 4,204 원/kg');
    expect(text).toContain('냉장 소매 12,317원/kg');
    expect(text).toContain('냉동 소매는 미형성');
  });

  it('상단 스트립과 출처 메타에서도 최신 기준을 노출한다', () => {
    const html = renderToStaticMarkup(
      React.createElement(MackerelIndustryDashboard),
    );
    const notes = MACKEREL_SOURCE_NOTES.join('\n');

    expect(html).toContain('노르웨이 34주 누계');
    expect(html).toContain('41,108톤 · 48.35 NOK/kg');
    expect(html).toContain('NSC 2026-W34');
    expect(html).toContain('KMI Vol.257');
    expect(notes).toContain('600g 미만');
    expect(notes).toContain('냉동 소매 미형성');
  });
});
