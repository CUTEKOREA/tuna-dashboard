import type { BangkokWeek } from '@/lib/data/bangkok-weekly';

/** 어튜나 `/api/atuna-prices` history 행 — 페이월 자료라 클라이언트가 로그인 세션으로 받아 온다. */
export type AtunaHistoryRow = { date: string; skj_bkk?: number | null };

export type OverviewRow = {
  주: string;
  date: string;
  방콕사무소: number | null;
  어튜나: number | null;
  MGO: number | null;
  재고: number | null;
  가동률: number | null;
};

const MS_DAY = 86_400_000;

/**
 * 방콕 주간보고 보고일(수요일)에 어튜나 SKJ 방콕 관측을 맞춘다 — 보고일 이전 `maxBackDays` 안의
 * 마지막 관측. 어튜나는 초기엔 월 1회, 최근엔 주 1회라 없는 주는 null 로 두어 선을 끊는다.
 */
export function atunaAt(history: readonly AtunaHistoryRow[], date: string, maxBackDays = 13): number | null {
  const t = Date.parse(`${date}T00:00:00Z`);
  let best: { dt: number; v: number } | null = null;
  for (const row of history) {
    if (typeof row.skj_bkk !== 'number') continue;
    const dt = Date.parse(`${row.date}T00:00:00Z`);
    if (dt > t || t - dt > maxBackDays * MS_DAY) continue;
    if (!best || dt > best.dt) best = { dt, v: row.skj_bkk };
  }
  return best ? best.v : null;
}

export function buildOverviewRows(
  weeks: readonly BangkokWeek[],
  mgoAt: (date: string) => number | null,
  atunaHistory: readonly AtunaHistoryRow[],
): OverviewRow[] {
  return weeks.map((w) => ({
    주: w.date.slice(2, 7),
    date: w.date,
    방콕사무소: w.price,
    어튜나: atunaHistory.length ? atunaAt(atunaHistory, w.date) : null,
    MGO: mgoAt(w.date),
    재고: w.bkkStockMt,
    가동률: w.bkkUtil,
  }));
}
