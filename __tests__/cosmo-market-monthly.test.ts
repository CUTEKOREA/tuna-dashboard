import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ghanaMonthly, ghanaShare, tradeMeta } from '../lib/data/cosmo-market';
import MarketTab from '../components/cosmo/tabs/MarketTab';

/* 원자료: scripts/sync_trade_stats.py --year 2026 --through 2026-07 --also-through 2026-05 --also-through 2026-06
 * 가 창과 함께 받은 보고국 × 달 행이다(발행 끝 1~7월). 달을 다 더하면 창 합계와 원통화·물량이 그대로 같아야 한다 -
 * 어긋나면 수집 기준(파트너 필터·흐름 합산)이 창과 다르다는 뜻이다. */

const WIN = '2026-01..2026-07';  // 월별 행은 발행 끝까지 받으므로 같은 길이의 창과 대조한다

type Raw = { country: string; hs: string; year: number; period?: string; valueNative?: number; qtyKg: number; partner?: string; valueUsd: number; fxToUsd?: number }

describe('가나發 수입 월별 계약', () => {
  it('달 목록은 발행 끝(7월)까지, 완결 표시는 6월까지다', () => {
    expect(ghanaMonthly.months).toEqual(['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07']);
    expect(ghanaMonthly.total.map((t) => t.complete)).toEqual([true, true, true, true, true, true, false]);
    const de = ghanaMonthly.rows.find((r) => r.market === '독일')!;
    const uk = ghanaMonthly.rows.find((r) => r.market === '영국')!;
    expect(de.months[6]!.provisional).toBe(true);
    expect(uk.months[6]!.provisional).toBe(false);
  });

  it('월별 행의 끝 달이 가장 긴 창의 끝 달과 같다 - 따로 낡지 않는다', () => {
    const windows = tradeMeta.coverage['2026Windows'] as string[];
    expect(ghanaMonthly.months.at(-1)).toBe(windows.at(-1)!.slice(-7));
    expect(tradeMeta.coverage['2026Monthly']).toBe(windows.at(-1));
  });

  it('시장마다 달을 더하면 창 합계(원통화·물량)와 같다', () => {
    const imports = tradeMeta.raw.imports as unknown as Raw[];
    const suppliers = tradeMeta.raw.suppliers as unknown as Raw[];
    const monthly = (tradeMeta.raw as unknown as { monthly: { country: string; valueNative: number; qtyKg: number; ghanaValueNative: number; ghanaQtyKg: number }[] }).monthly;
    for (const g of ghanaShare) {
      const win = imports.find((r) => r.hs === '160414' && r.country === g.country && r.period === WIN)!;
      const gh = suppliers.find((r) => r.hs === '160414' && r.country === g.country && r.period === WIN && /ghana/i.test(r.partner ?? ''))!;
      const rows = monthly.filter((r) => r.country === g.country);
      expect(rows).toHaveLength(7);
      expect(rows.reduce((a, r) => a + r.valueNative, 0)).toBeCloseTo(win.valueNative!, 1);
      expect(rows.reduce((a, r) => a + r.qtyKg, 0)).toBeCloseTo(win.qtyKg, 0);
      expect(rows.reduce((a, r) => a + r.ghanaValueNative, 0)).toBeCloseTo(gh.valueUsd / win.fxToUsd!, 0);
      expect(rows.reduce((a, r) => a + r.ghanaQtyKg, 0)).toBeCloseTo(gh.qtyKg, 0);
    }
  });

  it('월별 점유는 0~1 이고 가나 순위가 붙는다', () => {
    expect(ghanaMonthly.rows.map((r) => r.market)).toEqual(ghanaShare.map((g) => g.market));
    for (const row of ghanaMonthly.rows) {
      for (const cell of row.months) {
        expect(cell).not.toBeNull();
        expect(cell!.shareValue).toBeGreaterThanOrEqual(0);
        expect(cell!.shareValue).toBeLessThan(1);
        if (cell!.ghanaValueUsd > 0) expect(cell!.ghanaRank).toBeGreaterThanOrEqual(1);
      }
    }
    // 합계 행의 점유는 시장 합 대비 가나 합이다
    for (const t of ghanaMonthly.total) expect(t.shareValue).toBeCloseTo(t.ghanaValueUsd / t.marketValueUsd, 10);
  });
});

describe('시장·바이어 탭의 월별 추이', () => {
  it('월별 차트와 표를 렌더한다', () => {
    const markup = renderToStaticMarkup(React.createElement(MarketTab));
    expect(markup).toContain('가나發 수입 월별');
    expect(markup).toContain('가나 점유율 월별');
    for (const m of ['1월', '7월']) expect(markup).toContain(m);
  });
});
