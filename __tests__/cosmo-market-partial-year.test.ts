import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  benchYear, partialYear, competitors, periodLabelKo, tradeMeta,
  ledgerMonths, ledgerAlignedWindow, priceBasis, shareBasis, ANNUALIZE,
  pricePosition, ghanaShare, ghanaTrend, aggregateShare, lastCompleteMonth, provisionalCells,
} from '../lib/data/cosmo-market';
import MarketTab from '../components/cosmo/tabs/MarketTab';

/* 원자료: Eurostat COMEXT DS-045409 (EU 8개국) + HMRC OTS (영국), HS 160414.
 * scripts/sync_trade_stats.py --year 2026 --through 2026-07 --also-through 2026-05 --also-through 2026-06 와
 * --monthly 로 받은 값이다(2026-10-02 수집). 7월 EU 첫 발행분은 신고가 덜 모여 창에서 뺀다(아래 완결성 검사).
 * 부분 연도 수치를 연간과 나란히 놓으면서 지켜야 할 것 두 가지를 여기서 고정한다:
 *   ① 기간이 두 출처에서 같아야 하고
 *   ② 금액이 아니라 점유율로만 비교해야 한다. */

describe('부분 연도 무역통계 계약', () => {
  it('발행은 7월까지지만 완결된 달은 6월까지라 부분 연도는 1~6월이다', () => {
    expect(benchYear).toBe(2025);
    expect(partialYear).toEqual({ year: 2026, period: '2026-01..2026-06' });
    expect(periodLabelKo('2026-01..2026-06')).toBe('1~6월');
    expect(lastCompleteMonth).toBe('2026-06');
    expect(tradeMeta.coverage.eurostatLastPeriod).toBe('2026-07');
    expect(tradeMeta.coverage.hmrcLastPeriod).toBe('2026-07');
  });

  it('창은 여럿이어도 좋지만, 한 창 안에서는 모든 보고국의 기간이 같아야 한다', () => {
    // 창이 셋인 것은 의도다 - 원장과 맞춘 1~5월, 완결된 1~6월, 발행 끝까지 간 1~7월(잠정 달 포함이라 화면은 안 쓴다).
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
    expect(byPeriod.size).toBeGreaterThanOrEqual(3);
    for (const [, seen] of byPeriod) expect(seen.size).toBe(countries.size);
    // partialYear 는 끝 달이 완결된 창 중 가장 긴 것을 고른다 - 발행 끝(1~7월)이 아니다
    const complete = [...byPeriod.keys()].filter((p) => p.slice(-7) <= lastCompleteMonth!).sort();
    expect(partialYear!.period).toBe(complete.pop());
    expect([...byPeriod.keys()]).toContain('2026-01..2026-07');
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

  it('경쟁 공급국 카드가 부분 연도를 보고 직전 연간을 비교축으로 단다', () => {
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

  it('부분 연도 수입액이 같은 시장 연간의 일부 언저리다', () => {
    // 부분 연도를 연간으로 착각해 넣으면 이 비율이 1 근처로 튄다(1~5월 약 0.42, 1~7월 약 0.58).
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

  it('COSMO 대 가나 비율은 같은 달 수로만 잰다', () => {
    /* 2026-10-02 까지는 연환산 COSMO(×12/5)를 부분 연도 가나 금액에 나눠 146% 같은 불가능한 몫이 나왔다.
     * 원장 창(1~5월)의 가나發 수입과 원장 실적을 그대로 맞대면 100% 를 넘을 수 없어야 정상이다. */
    expect(aggregateShare.cosmoInGhana).not.toBeNull();
    expect(aggregateShare.cosmoInGhana!).toBeLessThan(1);
    expect(aggregateShare.cosmoInGhana!).toBeCloseTo(aggregateShare.cosmoLedgerUsd / aggregateShare.ghanaLedgerWindowUsd, 10);
  });

  it('공급국에 Extra-EU 같은 집계 코드가 섞이지 않는다', () => {
    const { suppliers } = tradeMeta.raw;
    const aggregates = suppliers.filter((s) =>
      /extra-|intra-|euro area|european union|^total$/i.test(s.partner));
    expect(aggregates).toHaveLength(0);
  });
});

describe('최신 달 완결성 검사', () => {
  it('7월 EU 첫 발행분은 공급국 수가 크게 줄어 잠정으로 잡힌다 - 영국(HMRC)은 아니다', () => {
    // 2026-10-02 수집: 독일 공급국 1~6월 중앙값 28 → 7월 10, 네덜란드 40 → 14, 슬로베니아 11 → 1. 영국 22 → 25.
    for (const c of ['Germany', 'Netherlands', 'Belgium', 'Denmark', 'Slovenia']) {
      expect(provisionalCells.has(`${c}|2026-07`)).toBe(true);
    }
    expect(provisionalCells.has('United Kingdom|2026-07')).toBe(false);
    expect(provisionalCells.has('Spain|2026-07')).toBe(false);
    // 1~6월에는 잠정 칸이 없다
    expect([...provisionalCells].filter((k) => k.slice(-7) < '2026-07')).toEqual([]);
  });
});

describe('시장 보드 화면', () => {
  it('네 지표가 모두 최신 구간을 쓴다', () => {
    // 단가는 원장과 같은 5개월, 점유율은 완결된 6개월. 둘 다 2025 를 비교축으로 단다.
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
    expect(markup).not.toContain('반기 대 연간');
    // 잠정 달을 왜 뺐는지 화면이 밝힌다
    expect(markup).toContain('잠정');
    expect(markup).toContain('2025년 연간');
    expect(markup).toContain('%p');
    // 경쟁 공급국은 한 줄에 두 장이다 - 네 장이 한 줄에 들어가면 표가 잘린다
    expect(markup).toContain('grid gpair');
  });
});
