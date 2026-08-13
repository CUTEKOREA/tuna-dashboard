import React from 'react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  WhelkRetiredHs6WidgetGate,
  WhelkV2Widgets,
  type WhelkV2Dataset,
} from '@/components/WhelkDashboard';
import WhelkFTAQuarterly from '@/components/WhelkFTAQuarterly';

// 빌더 산출물을 그대로 먹여 렌더한다. 위젯이 하드코딩 없이 계약만 보고 그리는지,
// G-006(바구니 분해)·표본 주석·공백 고지가 실제 마크업에 남는지 확인하는 것이 목적.
const dataset = JSON.parse(
  readFileSync(path.resolve(__dirname, '../public/data/whelk_v2.json'), 'utf8'),
) as WhelkV2Dataset;

const markup = renderToStaticMarkup(
  React.createElement(WhelkV2Widgets, { dataset, activePart: 'S3' }),
);

describe('whelk v2 S3 widgets', () => {
  it('splits origin share into HSK8 baskets instead of one HS6 denominator', () => {
    expect(markup).toContain(dataset.widgets.S3_origin_portfolio_shift.title);
    expect(markup).toContain('data-whelk-basket="16055910"');
    expect(markup).toContain('data-whelk-basket="16055990"');
    // 바구니 내부 점유율을 남겨 HS6 단일 분모로 회귀하면 실패하게 한다.
    expect(markup).toContain('97.3%');
    expect(markup).toContain('75.8%');
    expect(markup).toContain('19.9%');
    expect(markup).toContain('두 바구니를 합친 분모로는 원산지 점유율을 서술하지 않습니다');
  });

  it('qualifies the lower UK-Ireland share with the two-month Canada observation', () => {
    expect(markup).toContain('캐나다 2개월 관측을 포함할 때만 성립');
    expect(markup).toContain('캐나다를 제외하면 94.7%');
    expect(markup).not.toContain('75.8%로 분산됐');
  });

  it('never states the HS6-denominator origin share that caused the illusion', () => {
    // 합산 분모로 계산한 영국 점유율(2026년 1~5월 47.2%)이 화면에 점유율로 남으면 착시 재유입.
    expect(markup).not.toContain('47.2%');
    expect(markup).not.toContain('34.6%');
  });

  it('annotates thin-evidence origins with shipment counts', () => {
    expect(markup).toContain('data-whelk-thin-evidence="true"');
    expect(markup).toContain('선적 2건(2026.02·2026.04) — 안정 파이프라인 아님');
    expect(markup).toContain('해당 관측 창 통관 실적 없음');
  });

  it('discloses the dashboard archive gap and the window bias', () => {
    expect(markup).toContain('data-whelk-coverage-gap="true"');
    expect(markup).toContain('대시보드 아카이브 공백 — 2025년 원자료 미반영');
    expect(markup).not.toContain('2025년 원자료 없음');
    expect(markup).toContain('data-whelk-window-bias="true"');
    expect(markup).toContain('1~5월 창 49.5% · 연간 창 68.5%');
    expect(markup).toContain('1~5월 창 47.6% · 연간 창 30.3%');
  });

  it('renders the frozen 0307.92 axis with an explicitly unproven hypothesis', () => {
    expect(markup).toContain('냉동 바다고둥 수입 구성');
    expect(markup).toContain('2.65배');
    expect(markup).toContain('조개관자 제외');
    expect(markup).toContain('$29,800,158');
    expect(markup).toContain('2.38배');
    expect(markup).toContain('data-whelk-hypothesis-block="true"');
    expect(markup).toContain('🔬 미검증 가설');
    expect(markup).toContain('확정할 수 없는 이유');
    expect(markup).toContain('가능성이 있다');
  });

  it('shows the HSK10 scallop share and the scallop-excluded scale ratio', () => {
    expect(markup).toContain('0307921000 · 조개관자');
    expect(markup).toContain('10.3%');
    expect(markup).toContain('조개관자 제외');
    expect(markup).toContain('2.38배');
  });

  it('keeps unit prices inside their own basket', () => {
    // 같은 중국이 바구니별로 갈리는 두 단가가 모두 보여야 혼합 단가로 되돌아가지 않는다.
    expect(markup).toContain('$4.58/kg');
    expect(markup).toContain('$7.68/kg');
  });

  it('renders observed HSK8 baskets in the classification guide', () => {
    expect(markup).toContain('관측 HSK8 바구니');
    expect(markup).toContain('16055910');
    expect(markup).toContain('16055990');
    expect(markup).toContain('16055920');
    expect(markup).toContain('1605591010');
  });

  it('does not overstate a zero-row observation as a supply shutdown', () => {
    expect(markup).toContain('해당 관측 창 통관 실적 없음');
    expect(markup).not.toContain('사실상 공급 중단');
  });

  it('fails closed when the required frozen-axis widget is missing', () => {
    const missingFrozen = structuredClone(dataset);
    delete missingFrozen.widgets.S3_frozen_origin_mix;
    const missingMarkup = renderToStaticMarkup(
      React.createElement(WhelkV2Widgets, { dataset: missingFrozen, activePart: 'S3' }),
    );
    expect(missingMarkup).toContain('신규 골뱅이 데이터 계약을 불러오지 못했습니다.');
  });
});

describe('whelk retired HS6 widgets', () => {
  it('keeps retired widgets in source for rollback but returns no runtime DOM', () => {
    const retiredMarkup = renderToStaticMarkup(
      React.createElement(
        WhelkRetiredHs6WidgetGate,
        null,
        React.createElement('span', null, '폐기 대상 레거시'),
      ),
    );
    expect(retiredMarkup).toBe('');

    const source = readFileSync(
      path.resolve(__dirname, '../components/WhelkDashboard.tsx'),
      'utf8',
    );
    expect(source).toMatch(/<WhelkRetiredHs6WidgetGate>\s*<WidgetCard title="국내 수입산 골뱅이 국가별 점유율"/);
    expect(source).toMatch(/<WhelkRetiredHs6WidgetGate>\s*<WidgetCard title="원산지별 CIF 단가 격차 — 대체재 탄력성"/);
  });

  it('replaces the unverified seasonality fixture with archived UK HSK8 rows', () => {
    const source = readFileSync(
      path.resolve(__dirname, '../components/WhelkDashboard.tsx'),
      'utf8',
    );
    expect(source).toContain('<ComposedChart data={ukMonthly2024Data}>');
    expect(source).not.toContain('<ComposedChart data={seasonalityData}>');
    expect(source).not.toContain('국내 골뱅이 소비는 여름철 비빔면과 야식 수요');
  });
});

describe('whelk KMI classification boundary', () => {
  it('states that the KMI series is not the HSK8-split KCS series', () => {
    const ftaMarkup = renderToStaticMarkup(
      React.createElement(WhelkFTAQuarterly, {
        widget: dataset.widgets.S3_fta_import_quarterly,
      }),
    );
    expect(ftaMarkup).toContain('KMI 분류 기준이며 HSK8 분해와 상이');
  });
});
