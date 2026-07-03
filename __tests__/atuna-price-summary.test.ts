import { describe, expect, it } from 'vitest';
import {
  SKJ_ATUNA_HUBS,
  YF_ATUNA_HUBS,
  buildAtunaSpreadSummary,
} from '../lib/data/atuna-price-summary';

describe('Atuna regional price summaries', () => {
  it('uses the freshest SKJ hub observation and preserves the full regional spread', () => {
    const summary = buildAtunaSpreadSummary([
      { date: '2026-06-10', skj_bkk: 1800, skj_mnt: 1900, skj_abj: 1450 },
      { date: '2026-06-20', skj_mnt: 1750 },
      { date: '2026-06-24', skj_bkk: 1775 },
    ], SKJ_ATUNA_HUBS);

    expect(summary.latest).toMatchObject({ key: 'skj_bkk', label: '방콕', price: 1775, date: '2026-06-24' });
    expect(summary.previousForLatestHub).toMatchObject({ key: 'skj_bkk', price: 1800, date: '2026-06-10' });
    expect(summary.deltaPct).toBeCloseTo(-1.3889, 4);
    expect(summary.spread).toEqual({
      minPrice: 1450,
      maxPrice: 1775,
      minLabel: '아비장',
      maxLabel: '방콕',
      count: 3,
    });
  });

  it('summarizes YF from the same hub set used by the market chart', () => {
    const summary = buildAtunaSpreadSummary([
      { date: '2026-05-20', yf_sey: 2000, yf_abj: 2500, yf_vig: 2450 },
      { date: '2026-06-19', yf_sey: 2100 },
    ], YF_ATUNA_HUBS);

    expect(summary.latest).toMatchObject({ key: 'yf_sey', label: '세이셸', price: 2100, date: '2026-06-19' });
    expect(summary.deltaPct).toBeCloseTo(5, 4);
    expect(summary.spread).toEqual({
      minPrice: 2100,
      maxPrice: 2500,
      minLabel: '세이셸',
      maxLabel: '아비장',
      count: 3,
    });
  });
});
