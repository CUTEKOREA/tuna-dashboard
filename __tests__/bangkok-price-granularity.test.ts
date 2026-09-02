import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PriceTab } from '@/components/bangkok/tabs/PriceTab';
import * as bangkokData from '@/lib/data/bangkok-weekly';

type PriceRow = {
  readonly year: number;
  readonly month: number;
  readonly price: number | null;
  readonly suspect: boolean;
};

type PriceAggregate = {
  readonly period: string;
  readonly priceAvg: number;
  readonly priceMin: number;
  readonly priceMax: number;
  readonly weeks: number;
};

type AggregatePriceRows = (
  rows: readonly PriceRow[],
  granularity: bangkokData.BangkokGranularity,
) => readonly PriceAggregate[];

type AggregatePrices = (
  granularity: bangkokData.BangkokGranularity,
) => readonly PriceAggregate[];

const priceAggregators = bangkokData as unknown as {
  aggregateBangkokPriceRows?: AggregatePriceRows;
  aggregateBangkokPrices?: AggregatePrices;
};

describe('방콕 원어 시세 입도 전환', () => {
  it('결측치와 의심치를 제외하고 월·분기·연 시세 범위를 집계한다', () => {
    expect(priceAggregators.aggregateBangkokPriceRows).toBeTypeOf('function');
    if (!priceAggregators.aggregateBangkokPriceRows) return;

    const rows: PriceRow[] = [
      { year: 2025, month: 1, price: 1000, suspect: false },
      { year: 2025, month: 1, price: 1400, suspect: false },
      { year: 2025, month: 1, price: 9000, suspect: true },
      { year: 2025, month: 2, price: null, suspect: false },
      { year: 2025, month: 3, price: 1600, suspect: false },
      { year: 2025, month: 4, price: 2000, suspect: false },
      { year: 2026, month: 1, price: 1800, suspect: false },
    ];

    expect(priceAggregators.aggregateBangkokPriceRows(rows, 'monthly')).toEqual([
      { period: '2025-01', priceAvg: 1200, priceMin: 1000, priceMax: 1400, weeks: 2 },
      { period: '2025-03', priceAvg: 1600, priceMin: 1600, priceMax: 1600, weeks: 1 },
      { period: '2025-04', priceAvg: 2000, priceMin: 2000, priceMax: 2000, weeks: 1 },
      { period: '2026-01', priceAvg: 1800, priceMin: 1800, priceMax: 1800, weeks: 1 },
    ]);
    expect(priceAggregators.aggregateBangkokPriceRows(rows, 'quarterly')).toEqual([
      { period: '2025-Q1', priceAvg: 1333, priceMin: 1000, priceMax: 1600, weeks: 3 },
      { period: '2025-Q2', priceAvg: 2000, priceMin: 2000, priceMax: 2000, weeks: 1 },
      { period: '2026-Q1', priceAvg: 1800, priceMin: 1800, priceMax: 1800, weeks: 1 },
    ]);
    expect(priceAggregators.aggregateBangkokPriceRows(rows, 'yearly')).toEqual([
      { period: '2025', priceAvg: 1500, priceMin: 1000, priceMax: 2000, weeks: 4 },
      { period: '2026', priceAvg: 1800, priceMin: 1800, priceMax: 1800, weeks: 1 },
    ]);
  });

  it('연도 집계가 기존 주간보고의 확정 연도별 시세 계약을 보존한다', () => {
    expect(priceAggregators.aggregateBangkokPrices).toBeTypeOf('function');
    if (!priceAggregators.aggregateBangkokPrices) return;

    expect(
      priceAggregators.aggregateBangkokPrices('yearly').map(
        ({ period, priceAvg, priceMin, priceMax }) => ({ period, priceAvg, priceMin, priceMax }),
      ),
    ).toEqual([
      { period: '2020', priceAvg: 1397, priceMin: 1270, priceMax: 1525 },
      { period: '2021', priceAvg: 1412, priceMin: 1250, priceMax: 1775 },
      { period: '2022', priceAvg: 1664, priceMin: 1420, priceMax: 1950 },
      { period: '2023', priceAvg: 1821, priceMin: 1450, priceMax: 2025 },
      { period: '2024', priceAvg: 1425, priceMin: 1250, priceMax: 1600 },
      { period: '2025', priceAvg: 1598, priceMin: 1480, priceMax: 1770 },
      // 2026-08-19 주간보고 반영으로 30주 평균 1796→1801 (진행 연도는 매주 갱신됨)
      { period: '2026', priceAvg: 1815, priceMin: 1500, priceMax: 2050 },
    ]);
  });

  it('추이와 범위 차트에 독립 입도 옵션을 렌더링하고 기존 기본값을 유지한다', () => {
    const markup = renderToStaticMarkup(React.createElement(PriceTab));

    expect(markup).toContain('aria-label="원어 시세 추이 집계 입도"');
    expect(markup).toContain('aria-label="시세 범위 집계 입도"');
    expect(markup).toContain('aria-pressed="true">주간</button>');
    expect(markup).toContain('aria-pressed="true">연도별</button>');
    expect(markup.match(/>월별<\/button>/g)).toHaveLength(2);
    expect(markup.match(/>분기별<\/button>/g)).toHaveLength(2);
    expect(markup).toContain('원어 시세 주간 추이');
    expect(markup).toContain('연도별 시세 범위');
  });
});
