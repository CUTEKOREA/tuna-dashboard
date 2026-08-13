import React from 'react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { WhelkV2Widgets, type WhelkV2Dataset } from '@/components/WhelkDashboard';

// 3차 정정 회귀 방어. 검증 대상은 세 가지다.
//  1) G-006 — N1 이 HSK8 바구니 축을 버리고 HS6 단일 분모로 되돌아가는 것
//  2) N10 — 냉동 축 위젯의 조제 대비 배수가 TSX 에 박히는 것
//  3) 가설 10종이 SYNCED·LIVE 로 승격되는 것
const SOURCE_PATH = path.resolve(__dirname, '../components/WhelkDashboard.tsx');
const source = readFileSync(SOURCE_PATH, 'utf8');

const dataset = JSON.parse(
  readFileSync(path.resolve(__dirname, '../public/data/whelk_v2.json'), 'utf8'),
) as WhelkV2Dataset;

function render(data: WhelkV2Dataset, activePart: 'S1' | 'S3') {
  return renderToStaticMarkup(React.createElement(WhelkV2Widgets, { dataset: data, activePart }));
}

// WidgetCard 는 data-widget-id 를 그대로 내보낸다. 한 위젯의 마크업만 잘라내야
// 옆 위젯이 우연히 같은 숫자를 그렸을 때 오탐이 나지 않는다.
function sliceWidget(markup: string, widgetId: string) {
  const start = markup.indexOf(`data-widget-id="${widgetId}"`);
  expect(start, `${widgetId} 가 렌더되지 않았습니다`).toBeGreaterThan(-1);
  const next = markup.indexOf('data-widget-id="', start + 1);
  return next === -1 ? markup.slice(start) : markup.slice(start, next);
}

function widgetIds(markup: string) {
  return Array.from(markup.matchAll(/data-widget-id="([^"]+)"/g)).map((match) => match[1]);
}

function percent(value: number) {
  return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}%`;
}

function sourceConstant(name: string) {
  const match = source.match(new RegExp(`const ${name} = (\\d+);`));
  expect(match, `${name} 상수를 찾지 못했습니다`).not.toBeNull();
  return Number(match![1]);
}

const s3Markup = render(dataset, 'S3');
const portfolio = dataset.widgets.S3_origin_portfolio_shift;
const frozen = dataset.widgets.S3_frozen_origin_mix;

describe('G-006 — N1 원산지 위젯은 HSK8 바구니 축을 유지한다', () => {
  const n1 = sliceWidget(s3Markup, 'S3_origin_portfolio_shift');
  const baskets = portfolio.baskets ?? [];
  const charted = baskets.filter((basket) => basket.charted);

  it('차트 대상 바구니를 하나로 합치지 않는다', () => {
    expect(charted.length).toBeGreaterThanOrEqual(2);
    const panels = Array.from(n1.matchAll(/data-whelk-basket="(\d+)"/g)).map((match) => match[1]);
    expect(panels).toEqual(charted.map((basket) => basket.hsk8));
  });

  it('점유율 분모가 바구니 총액이다 — 바구니 내 합이 100%가 된다', () => {
    for (const basket of charted) {
      const sum = portfolio.data
        .filter((row) => row.hsk8 === basket.hsk8 && !row.combined)
        .reduce((total, row) => total + Number(row.share_within_basket_2026_pct || 0), 0);
      expect(sum).toBeGreaterThan(99);
      expect(sum).toBeLessThan(101);
    }
  });

  it('HS6 합산 분모로 계산한 원산지 점유율은 화면에 없다', () => {
    const hs6Total2024 = baskets.reduce((sum, b) => sum + Number(b.import_usd_2024_jan_may || 0), 0);
    const hs6Total2026 = baskets.reduce((sum, b) => sum + Number(b.import_usd_2026_jan_may || 0), 0);
    // 바구니 내 점유율과 우연히 겹치는 값은 제외한다. 착시를 만드는 것은 유의미한 크기의 점유율이다.
    const legitimate = new Set(
      portfolio.data.flatMap((row) => [
        percent(Number(row.share_within_basket_2024_pct)),
        percent(Number(row.share_within_basket_2026_pct)),
      ]),
    );
    const illusions = portfolio.data
      .flatMap((row) => [
        (Number(row.import_usd_2024_jan_may) / hs6Total2024) * 100,
        (Number(row.import_usd_2026_jan_may) / hs6Total2026) * 100,
      ])
      .filter((value) => value >= 5)
      .map(percent)
      .filter((label) => !legitimate.has(label));

    expect(illusions.length).toBeGreaterThan(0);
    for (const label of illusions) {
      expect(n1, `HS6 분모 점유율 ${label} 이 N1 에 남아 있습니다`).not.toContain(label);
    }
  });

  it('차트 축이 바구니 내 점유율 필드에만 묶여 있다', () => {
    expect(source).toMatch(/dataKey="share_within_basket_2024_pct"/);
    expect(source).toMatch(/dataKey="share_within_basket_2026_pct"/);
    expect(source).not.toMatch(/dataKey="share_of_hs6[^"]*"/);
  });

  it('점유율 수치를 계약에서 읽는다 — 데이터가 바뀌면 화면도 바뀐다', () => {
    const mutated = structuredClone(dataset);
    const target = mutated.widgets.S3_origin_portfolio_shift.data.find((row) => row.combined)!;
    const original = percent(Number(target.share_within_basket_2026_pct));
    target.share_within_basket_2026_pct = 41.7;
    const mutatedN1 = sliceWidget(render(mutated, 'S3'), 'S3_origin_portfolio_shift');
    expect(mutatedN1).toContain('41.7%');
    expect(mutatedN1).not.toContain(original);
  });
});

describe('N10 — 냉동 0307.92 축 위젯', () => {
  const n10 = sliceWidget(s3Markup, 'S3_frozen_origin_mix');
  const scale = frozen.scale_context!;
  const scallop = (frozen.hsk10_breakdown ?? []).find((row) => row.excluded_from_whelk_scope)!;

  it('렌더되고 HSK10 분해를 모두 노출한다', () => {
    expect(widgetIds(s3Markup)).toContain('S3_frozen_origin_mix');
    for (const row of frozen.hsk10_breakdown ?? []) {
      expect(n10).toContain(row.hsk10);
      expect(n10).toContain(row.item_name);
    }
  });

  it('조제 대비 배수가 원자료 나눗셈과 일치한다', () => {
    const ratio = Number(scale.frozen_030792_import_usd) / Number(scale.prepared_160559_import_usd);
    expect(ratio).toBeCloseTo(Number(scale.frozen_to_prepared_ratio), 2);
    expect(n10).toContain(`${Number(scale.frozen_to_prepared_ratio).toFixed(2)}배`);
  });

  it('조개관자 제외 배수도 원자료 나눗셈과 일치한다', () => {
    const excluded = Number(scale.frozen_030792_import_usd) - Number(scallop.import_usd);
    expect(excluded).toBe(Number(scale.frozen_excluding_scallop_import_usd));
    const ratio = excluded / Number(scale.prepared_160559_import_usd);
    expect(ratio).toBeCloseTo(Number(scale.frozen_excluding_scallop_to_prepared_ratio), 2);
    expect(n10).toContain(`${Number(scale.frozen_excluding_scallop_to_prepared_ratio).toFixed(2)}배`);
    expect(n10).toContain('조개관자 제외');
  });

  it('배수를 계약에서 읽는다 — 하드코딩이면 실패한다', () => {
    const mutated = structuredClone(dataset);
    const mutatedScale = mutated.widgets.S3_frozen_origin_mix.scale_context!;
    mutatedScale.frozen_to_prepared_ratio = 9.99;
    mutatedScale.frozen_excluding_scallop_to_prepared_ratio = 8.88;
    const mutatedN10 = sliceWidget(render(mutated, 'S3'), 'S3_frozen_origin_mix');
    expect(mutatedN10).toContain('9.99배');
    expect(mutatedN10).toContain('8.88배');
    expect(mutatedN10).not.toContain(`${Number(scale.frozen_to_prepared_ratio).toFixed(2)}배`);
  });

  it('2024 기준선이 없다는 사실을 배수와 같은 카드에 남긴다', () => {
    expect(scale.baseline_2024_available).toBe(false);
    expect(n10).toContain('기준선 공백 고지');
    expect(n10).toContain('data-whelk-hypothesis-block="true"');
  });
});

describe('가설 위젯은 실측 telemetry 로 승격되지 않는다', () => {
  const blocks = source
    .split('<WhelkHypothesisCard')
    .slice(1)
    .map((chunk) => chunk.slice(0, chunk.indexOf('</WhelkHypothesisCard>')));

  it('가설 카드가 선언된 개수만큼 존재한다', () => {
    expect(blocks).toHaveLength(sourceConstant('HYPOTHESIS_WIDGET_COUNT'));
    const declared = Array.from(source.matchAll(/<WhelkHypothesisSection count=\{(\d+)\}>/g))
      .reduce((sum, match) => sum + Number(match[1]), 0);
    expect(declared).toBe(blocks.length);
  });

  it('SYNCED·LIVE 를 쓰지 않고 STATIC 으로만 표기한다', () => {
    for (const block of blocks) {
      const statuses = Array.from(block.matchAll(/status:\s*'([A-Z]+)'/g)).map((match) => match[1]);
      expect(statuses.length).toBeGreaterThan(0);
      expect(statuses.every((status) => status === 'STATIC')).toBe(true);
      // metaStatus 는 라우트가 LIVE 를 선언하면 LIVE 로 격상된다. 가설 카드에는 연결하지 않는다.
      expect(block).not.toContain('status: metaStatus');
    }
  });

  it('공백 사유를 반드시 단다', () => {
    for (const block of blocks) {
      expect(block).toMatch(/^\s+reason="[^"]+"/);
    }
  });
});

describe('기본 화면 위젯 수', () => {
  const inline = sourceConstant('INLINE_WIDGET_COUNT');
  const retired = sourceConstant('RETIRED_HS6_WIDGET_COUNT');
  const hypothesis = sourceConstant('HYPOTHESIS_WIDGET_COUNT');

  it('선언한 상수와 실제 WidgetCard 수가 맞는다', () => {
    const inWhelk = source.match(/<WidgetCard\b/g)?.length ?? 0;
    const fta = readFileSync(path.resolve(__dirname, '../components/WhelkFTAQuarterly.tsx'), 'utf8')
      .match(/<WidgetCard\b/g)?.length ?? 0;
    expect(inWhelk + fta).toBe(inline);
  });

  it('폐기 HS6 위젯 2개는 런타임 게이트 뒤에만 있다', () => {
    const gated = source.match(/<WhelkRetiredHs6WidgetGate>/g)?.length ?? 0;
    expect(gated).toBe(retired);
    expect(source).toContain('const RETIRED_HS6_WIDGETS_ENABLED = false;');
  });

  it('기본 화면에 보이는 위젯은 26개 — 폐기 2개·가설 10개 제외', () => {
    expect(inline - retired - hypothesis).toBe(26);
  });

  it('S1·S3 계약 위젯이 각각 5개씩 렌더된다', () => {
    expect(widgetIds(render(dataset, 'S1'))).toHaveLength(5);
    expect(widgetIds(s3Markup)).toHaveLength(5);
  });
});
