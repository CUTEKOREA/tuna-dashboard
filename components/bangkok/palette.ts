import { CHART_RANK, colorForHold, SERIES, THAI_PORT_ID, TRADER_ID } from '@/lib/chart-palette';
import type { BangkokTrader } from '@/lib/data/bangkok-weekly';

/** 방콕 차트 색. 시리즈는 hex 를 넘긴다 — Chart.readTokens 는 격자·축만 푼다. */
export const C = {
  bangkok: THAI_PORT_ID.bangkok,
  songkhla: THAI_PORT_ID.songkhla,
  rank: CHART_RANK,
  // 계열 1~3은 SERIES 앞 세 칸 — 모든 쌍 검사까지 통과하는 조합이다(2026-09-11).
  s1: SERIES[0],
  s2: SERIES[1],
  s3: SERIES[2],
  danger: '#ef4444',
};

export const TRADER_COLOR: Record<BangkokTrader, string> = {
  FCF: TRADER_ID.FCF,
  ITOCHU: TRADER_ID.ITOCHU,
  'TRI MARINE': TRADER_ID['TRI MARINE'],
  DIRECT: TRADER_ID.DIRECT,
  MALDIVES: TRADER_ID.MALDIVES,
};

export function canneryColor(index: number): string {
  return colorForHold(index);
}
