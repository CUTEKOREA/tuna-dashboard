import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  benchYear, partialYear, competitors, periodLabelKo, tradeMeta,
  ledgerMonths, ledgerAlignedWindow, priceBasis, shareBasis, ANNUALIZE,
  pricePosition, ghanaShare, ghanaTrend,
} from '../lib/data/cosmo-market';
import MarketTab from '../components/cosmo/tabs/MarketTab';

/* 원자료: Eurostat COMEXT DS-045409 (EU 8개국) + HMRC OTS (영국), HS 160414.
 * scripts/sync_trade_stats.py --year 2026 --through 2026-06 로 받은 값이다.
 * 반기 수치를 연간과 나란히 놓으면서 지켜야 할 것 두 가지를 여기서 고정한다:
 *   ① 기간이 두 출처에서 같아야 하고
 *   ② 금액이 아니라 점유율로만 비교해야 한다. */

describe('부분 연도(반기) 무역통계 계약', () => {
  it('2026년은 1~6월 부분 연도로 잡히고 기준 연간은 2025년이다', () => {
    expect(benchYear).toBe(2025);
    expect(partialYear).toEqual({ year: 2026, period: '2026-01..2026-06' });
    expect(periodLabelKo('2026-01..2026-06')).toBe('1~6월');
    expect(tradeMeta.coverage.eurostatLastPeriod).toBe('2026-06');
    expect(tradeMeta.coverage.hmrcLastPeriod).toBe('2026-06');
  });

  it('창은 여럿이어도 좋지만, 한 창 안에서는 모든 보고국의 기간이 같아야 한다', () => {
    // 창이 둘인 것은 의도다 - 원장과 맞춘 1~5월, 발행 끝까지 간 1~6월.
    // 막아야 할 것은 «한 창 안에 EU 4개월과 영국 6개월이 섞이는» 상태다.
    const { imports } = tradeMeta.raw;
    const rows = imports.filter((r) => r.hs === '160414' && r.year === partialYear!.year && r.period);
    const countries = new Set(rows.map((r) => r.country));
    const byPeriod = new Map<string, Set<string>>();
    for (const row of rows) {
      const seen = byPeriod.get(row.period!) ?? new Set<string>();
      seen.add(row.country);
      byPeriod.set(row.period!, seen);
    }
    expect(byPeriod.size).toBeGreaterThanOrEqual(2);
    for (const [, seen] of byPeriod) expect(seen.size).toBe(countries.size);
    // partialYear 는 그중 가장 긴 창을 고른다
    expect(partialYear!.period).toBe([...byPeriod.keys()].sort().pop());
  });

  it('단가 비교는 원장과 달 수가 같은 창을 쓴다', () => {
    // 원장이 1~5월인데 시장 통계를 1~6월로 대면 그 한 달 차이가 곧 가짜 격차가 된다.
    expect(ledgerMonths).toBe(5);
    expect(ledgerAlignedWindow).toEqual({ year: 2026, period: '2026-01..2026-05' });
    expect(priceBasis).toEqual(ledgerAlignedWindow);
    // 점유율은 기간에 무관하므로 더 긴 창을 쓴다 - 둘이 달라야 정상이다
    expect(shareBasis.period).toBe('2026-01..2026-06');
    expect(priceBasis.period).not.toBe(shareBasis.period);
    expect(ANNUALIZE).toBeCloseTo(12 / 5, 10);
  });

  it('경쟁 공급국 카드가 반기를 보고 직전 연간을 비교축으로 단다', () => {
    expect(competitors.length).toBeGreaterThan(0);
    for (const card of competitors) {
      expect(card.year).toBe(2026);
      expect(card.period).toBe('2026-01..2026-06');
      expect(card.periodLabel).toBe('1~6월');
      expect(card.priorYear).toBe(2025);
      // 점유율은 합이 1 근처여야 한다 - 집계 코드가 섞이면 크게 넘는다
      const total = card.rows.reduce((sum, r) => sum + (r.share ?? 0), 0);
      expect(total).toBeLessThan(1.05);
      for (const row of card.rows) {
        if (row.share != null && row.priorShare != null) {
          expect(row.shareDelta).toBeCloseTo(row.share - row.priorShare, 10);
        }
      }
    }
  });

  it('반기 수입액이 같은 시장 연간의 절반 언저리다', () => {
    // 반기를 연간으로 착각해 넣으면 이 비율이 1 근처로 튄다.
    const { imports } = tradeMeta.raw;
    const annual = new Map(
      imports.filter((r) => r.hs === '160414' && r.year === 2025 && !r.period)
        .map((r) => [r.country, r.valueUsd]),
    );
    const half = imports.filter((r) => r.hs === '160414' && r.year === 2026 && r.period);
    expect(half.length).toBeGreaterThanOrEqual(9);
    for (const row of half) {
      const full = annual.get(row.country);
      if (!full) continue;
      const ratio = row.valueUsd / full;
      expect(ratio).toBeGreaterThan(0.25);
      expect(ratio).toBeLessThan(0.75);
    }
  });

  it('공급국에 Extra-EU 같은 집계 코드가 섞이지 않는다', () => {
    const { suppliers } = tradeMeta.raw;
    const aggregates = suppliers.filter((s) =>
      /extra-|intra-|euro area|european union|^total$/i.test(s.partner));
    expect(aggregates).toHaveLength(0);
  });
});

describe('시장 보드 화면', () => {
  it('네 지표가 모두 최신 구간을 쓴다', () => {
    // 단가는 원장과 같은 5개월, 점유율은 6개월. 둘 다 2025 를 비교축으로 단다.
    for (const row of pricePosition) expect(row.priorMarketUsdKg).not.toBeNull();
    for (const row of ghanaShare) {
      expect(row.priorShareValue).not.toBeNull();
      expect(row.shareValueDelta).toBeCloseTo(row.shareValue - row.priorShareValue!, 10);
    }
    // 추이는 연간 점들 뒤에 부분 구간 점 하나가 붙는다
    const partials = ghanaTrend.filter((r) => r.partial);
    expect(partials).toHaveLength(1);
    expect(ghanaTrend[ghanaTrend.length - 1].partial).toBe(true);
    expect(ghanaTrend.filter((r) => !r.partial).length).toBeGreaterThanOrEqual(3);
  });

  it('기간과 전년 대비 증감이 화면에 드러난다', () => {
    const markup = renderToStaticMarkup(React.createElement(MarketTab));
    expect(markup).toContain('1~6월');
    expect(markup).toContain('2025년 연간');
    expect(markup).toContain('%p');
    // 경쟁 공급국은 한 줄에 두 장이다 - 네 장이 한 줄에 들어가면 표가 잘린다
    expect(markup).toContain('grid gpair');
  });
});
