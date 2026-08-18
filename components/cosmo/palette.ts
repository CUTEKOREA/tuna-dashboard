import { CHART_RANK, HUB_ID, PANOFI_ID, shareColor } from '@/lib/chart-palette';

/** 코스모 차트 색. 시리즈는 hex 를 넘긴다 — Chart.readTokens 는 격자·축만 푼다. */
export const C = {
  s1: HUB_ID.bkk,
  s2: HUB_ID.abj,
  s3: HUB_ID.sey,
  s4: HUB_ID.mnt,
  s5: HUB_ID.vig,
  rank: CHART_RANK,
  mix: [shareColor(0), shareColor(1), shareColor(2), shareColor(3)] as const,
  sign: ['#ef4444', '#3b82f6'] as [string, string],
  danger: '#ef4444',
  cosmo: PANOFI_ID.cosmo,
};

export const SERIES = [C.s1, C.s2, C.s3, C.s4, C.s5] as const;
