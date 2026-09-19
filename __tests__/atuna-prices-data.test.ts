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

    // 2026-09-20: Atuna 가격 CSV 8종(skjbkk·skjmnt·skjabj·skjvig·skjsey·yfvig·yfabj·yfsey)과 대조해 빠진 행을 채웠다
    expect(latestForKey(rows, 'skj_bkk')).toEqual({ date: '2026-09-15', price: 2200 });
    expect(latestForKey(rows, 'skj_mnt')).toEqual({ date: '2026-09-16', price: 2300 });
    expect(latestForKey(rows, 'skj_sey')).toEqual({ date: '2026-09-18', price: 1645 });
    expect(latestForKey(rows, 'yf_sey')).toEqual({ date: '2026-09-18', price: 2100 });
    expect(latestForKey(rows, 'skj_abj')).toEqual({ date: '2026-08-31', price: 1550 });
    expect(latestForKey(rows, 'skj_vig')).toEqual({ date: '2026-08-31', price: 1900 });
    expect(latestForKey(rows, 'yf_abj')).toEqual({ date: '2026-08-31', price: 2700 });
    expect(latestForKey(rows, 'yf_vig')).toEqual({ date: '2026-08-31', price: 2700 });
    // 방콕은 8/20 $2,000 → 9/9 $2,100 → 9/15 $2,200 로 두 번 올랐다 - 중간 행이 빠지면 상승 폭이 한 번에 뛴 것처럼 보인다
    expect(rows.find((row) => row.date === '2026-09-09')?.skj_bkk).toBe(2100);
    // 만타 8/25 $2,220 은 CSV 가 아니라 8/25 브리핑 기사 값이다 - 남겨 둔다
    expect(rows.find((row) => row.date === '2026-08-25')?.skj_mnt).toBe(2220);
  });
});
