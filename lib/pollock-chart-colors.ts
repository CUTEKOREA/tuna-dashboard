/**
 * 명태 차트 시리즈 색 — 원양·수입·가공·재고가 같은 역할을 같은 색으로 그린다.
 *
 * 고등어 남색·골뱅이 갈색·오징어 보라를 쓰지 않는다. 기본은 한류의 짙은 청록,
 * 러시아·동태 강조는 대비 3:1 장미, 미국·연육은 선단 DB 호박.
 */

import { HUB_ID } from '@/lib/chart-palette';

export const POLLOCK_ROLE = {
  volume: '#0f766e',
  highlight: '#be123c',
  second: HUB_ID.sey,
} as const;

export const POLLOCK_ACCENT = POLLOCK_ROLE.volume;
