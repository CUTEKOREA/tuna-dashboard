import { CHART_RANK, PANOFI_ID, SERIES as PALETTE, shareColor } from '@/lib/chart-palette';

/** 코스모 차트 색. 시리즈는 hex 를 넘긴다 — Chart.readTokens 는 격자·축만 푼다. */
export const C = {
  // 계열 1~5는 SERIES 앞 다섯 칸을 순서대로 — 이 순서가 인접 색각 검사를 통과한다(2026-09-11).
  s1: PALETTE[0],
  s2: PALETTE[1],
  s3: PALETTE[2],
  s4: PALETTE[3],
  s5: PALETTE[4],
  rank: CHART_RANK,
  mix: [shareColor(0), shareColor(1), shareColor(2), shareColor(3)] as const,
  sign: ['#ef4444', '#3b82f6'] as [string, string], // 손익 부호 — 상태색이라 팔레트 밖
  danger: '#ef4444',
  cosmo: PANOFI_ID.cosmo,
};

export const SERIES = [C.s1, C.s2, C.s3, C.s4, C.s5] as const;
