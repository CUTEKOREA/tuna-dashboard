import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { AtunaPriceRow } from '../lib/data/atuna-price-summary';

function latestForKey(rows: AtunaPriceRow[], key: string): { date: string; price: number } | null {
  const row = rows
    .filter((candidate) => typeof candidate.date === 'string' && typeof candidate[key] === 'number')
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  if (!row || typeof row[key] !== 'number') return null;
  return { date: row.date, price: row[key] };
}

describe('Atuna price data freshness', () => {
  it('includes the latest manually synced SKJ and YF hub observations', () => {
    const rows = JSON.parse(
      readFileSync(join(process.cwd(), 'data/atuna_prices.json'), 'utf8'),
    ) as AtunaPriceRow[];

    expect(latestForKey(rows, 'skj_bkk')).toEqual({ date: '2026-08-06', price: 1900 });
    expect(latestForKey(rows, 'skj_mnt')).toEqual({ date: '2026-07-28', price: 2150 });
    expect(latestForKey(rows, 'skj_sey')).toEqual({ date: '2026-06-19', price: 1500 });
    expect(latestForKey(rows, 'yf_sey')).toEqual({ date: '2026-06-19', price: 2100 });
    expect(latestForKey(rows, 'yf_abj')).toEqual({ date: '2026-05-30', price: 2500 });
    expect(latestForKey(rows, 'yf_vig')).toEqual({ date: '2026-05-30', price: 2500 });
  });
});
