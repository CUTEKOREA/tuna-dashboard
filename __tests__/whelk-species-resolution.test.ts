import React from 'react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { WhelkV2Widgets, type WhelkV2Dataset } from '@/components/WhelkDashboard';

type SpeciesComposition = {
  alpha3: string;
  scientific_name: string;
  tonnes: number;
  share_pct: number;
};

type CaptureRow = {
  rank: number;
  country_code: string;
  country: string;
  tonnes_live_weight: number;
  species_composition?: SpeciesComposition[];
  dominant_species_scientific_name?: string;
  is_species_resolved?: boolean;
};

type BuccinumRank = {
  rank: number;
  country_code: string;
  country: string;
  tonnes_live_weight: number;
};

const dataset = JSON.parse(
  readFileSync(path.resolve(__dirname, '../public/data/whelk_v2.json'), 'utf8'),
) as WhelkV2Dataset;

function render(data: WhelkV2Dataset) {
  return renderToStaticMarkup(
    React.createElement(WhelkV2Widgets, { dataset: data, activePart: 'S1' }),
  );
}

function sliceWidget(markup: string, widgetId: string) {
  const start = markup.indexOf(`data-widget-id="${widgetId}"`);
  expect(start, `${widgetId} 가 렌더되지 않았습니다`).toBeGreaterThan(-1);
  const next = markup.indexOf('data-widget-id="', start + 1);
  return next === -1 ? markup.slice(start) : markup.slice(start, next);
}

function captureWidget(data: WhelkV2Dataset) {
  return data.widgets.S1_global_capture_top_countries as typeof data.widgets[string] & {
    data: CaptureRow[];
    buccinum_only_ranking?: BuccinumRank[];
  };
}

describe('S1 글로벌 어획 순위의 종 해상도', () => {
  it('순위와 같은 카드에 한국·영국·튀르키예의 종 차이를 고지한다', () => {
    const widget = sliceWidget(render(dataset), 'S1_global_capture_top_countries');

    expect(widget).toContain('data-whelk-species-resolution-notice="true"');
    expect(widget).toContain('한국 수치는 전량 종 미상');
    expect(widget).toContain('Gastropoda NEI');
    expect(widget).toContain('영국은');
    expect(widget).toContain('Buccinum undatum');
    expect(widget).toContain('튀르키예는');
    expect(widget).toContain('Rapana venosa');
    expect(widget).toContain('다른 종');
    expect(widget).toContain('Buccinum 속만 보면 한국은 순위 밖');
    expect(widget).toContain('0톤');
  });

  it('종 미상 국가를 데이터 속성·배지로 시각 구분한다', () => {
    const widget = sliceWidget(render(dataset), 'S1_global_capture_top_countries');

    expect(widget).toContain('data-species-resolved="false"');
    expect(widget).toContain('종 미상');
    expect(widget).toContain('data-species-resolved="true"');
    expect(widget).toContain('종 확인');
  });

  it('한국 종 구성이 빠지면 3위 단언을 단독 노출하지 않는다', () => {
    const missingComposition = structuredClone(dataset);
    const korea = captureWidget(missingComposition).data.find(
      (row) => row.country_code === '410',
    )!;
    delete korea.species_composition;

    const widget = sliceWidget(
      render(missingComposition),
      'S1_global_capture_top_countries',
    );
    expect(widget).toContain('종 구성 자료를 불러오지 못했습니다');
    expect(widget).not.toContain('한국 3위');
    expect(widget).not.toContain('세계 3위');
  });

  it('고지의 종별 톤수·비중은 계약 변경을 그대로 따른다', () => {
    const mutated = structuredClone(dataset);
    const korea = captureWidget(mutated).data.find(
      (row) => row.country_code === '410',
    )!;
    expect(korea.species_composition).toBeDefined();
    if (!korea.species_composition) return;
    korea.species_composition[0].tonnes = 8_765.432;
    korea.species_composition[0].share_pct = 99.5;
    korea.species_composition.push({
      alpha3: 'WHE',
      scientific_name: 'Buccinum undatum',
      tonnes: 48.125,
      share_pct: 0.5,
    });

    const widget = sliceWidget(render(mutated), 'S1_global_capture_top_countries');
    expect(widget).toContain('8,765.432톤');
    expect(widget).toContain('99.5%');
    expect(widget).toContain('48.125톤');
  });
});

describe('Buccinum 속 단독 순위', () => {
  it('상위 5개국을 원자료 톤수 순으로 산출하고 한국을 포함하지 않는다', () => {
    const ranking = captureWidget(dataset).buccinum_only_ranking;

    expect(ranking?.map((row) => row.country_code)).toEqual([
      '826',
      '250',
      '124',
      '372',
      '578',
    ]);
    expect(ranking?.map((row) => row.tonnes_live_weight)).toEqual([
      16_511.02,
      7_695.607,
      5_410.208,
      4_590.375,
      458,
    ]);
    expect(ranking?.some((row) => row.country_code === '410')).toBe(false);
  });
});
