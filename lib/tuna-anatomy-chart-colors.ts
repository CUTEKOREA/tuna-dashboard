/**
 * 참치 해부 차트 시리즈 색 — 선망·수출·캔이 같은 역할을 같은 색으로 그린다.
 *
 * 참치 시장이해(남색 계열)와 겹치지 않게 기본은 깊은 바다의 남청(#1e3a8a 계열 대신 #0c4a6e),
 * 강조는 대비 3:1 산호(#c2410c), 둘째는 선단 DB 호박.
 */

import { HUB_ID } from '@/lib/chart-palette';

export const TUNA_ANATOMY_ROLE = {
  volume: '#0c4a6e',
  highlight: '#c2410c',
  second: HUB_ID.sey,
} as const;

export const TUNA_ANATOMY_ACCENT = TUNA_ANATOMY_ROLE.volume;
