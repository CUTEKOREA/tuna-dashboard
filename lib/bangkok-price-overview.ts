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
  /** 계절 패턴 참고선 — 기준점(마지막 어튜나 월)과 목표월 두 점만 값이 있다 */
  계절패턴?: number | null;
  /** 계절 패턴 80% 밴드 [하단, 상단] — 목표월에만 */
  계절밴드?: [number, number] | null;
};

export type SeasonalOutlookInput = {
  asOf: string; anchorPrice: number; targetMonth: string; value: number; band80: readonly [number, number];
};

/**
 * 마지막 실측 주 뒤에 목표월까지 주 단위 빈 행을 붙이고, 기준점(asOf 월의 마지막 주)과 목표월(마지막 주)에만
 * 계절 패턴 값을 둔다. 중간 주에는 값을 만들지 않는다 — 선은 connectNulls로 두 점을 잇는다.
 */
export function appendSeasonalOutlook(rows: OverviewRow[], o: SeasonalOutlookInput): OverviewRow[] {
  if (!rows.length) return rows;
  const out = rows.map((r) => ({ ...r }));
  // 기준점: asOf 월에 속하는 마지막 행 (없으면 마지막 행)
  let anchor = -1;
  for (let i = out.length - 1; i >= 0; i -= 1) if (out[i].date.slice(0, 7) === o.asOf) { anchor = i; break; }
  if (anchor < 0) anchor = out.length - 1;
  out[anchor].계절패턴 = o.anchorPrice;
  out[anchor].계절밴드 = [o.anchorPrice, o.anchorPrice];
  const last = new Date(`${out[out.length - 1].date}T00:00:00Z`);
  const targetEnd = new Date(`${o.targetMonth}-01T00:00:00Z`);
  targetEnd.setUTCMonth(targetEnd.getUTCMonth() + 1); targetEnd.setUTCDate(0); // 목표월 말일
  for (let d = new Date(last.getTime() + 7 * MS_DAY); d <= targetEnd; d = new Date(d.getTime() + 7 * MS_DAY)) {
    const date = d.toISOString().slice(0, 10);
    out.push({ 주: date.slice(2, 7), date, 방콕사무소: null, 어튜나: null, MGO: null, 재고: null, 가동률: null });
  }
  const tail = out[out.length - 1];
  tail.계절패턴 = o.value;
  tail.계절밴드 = [o.band80[0], o.band80[1]];
  return out;
}

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
    // 의심 플래그 주(이웃 중앙값 대비 급변 — 예: 2024-01-10 원문 $2,000, 전후 주 $1,450)는 선을 끊는다. 원 기록은 payload 에 그대로 둔다.
    방콕사무소: w.suspect ? null : w.price,
    어튜나: atunaHistory.length ? atunaAt(atunaHistory, w.date) : null,
    MGO: mgoAt(w.date),
    재고: w.bkkStockMt,
    가동률: w.bkkUtil,
  }));
}
