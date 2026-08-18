/**
 * 새우 차트 시리즈 색 — 양식·종·창구가 같은 역할을 같은 색으로 그린다.
 *
 * 항구·기구 이름을 새우 국가에 칠하지 않는다. 오징어 보라·고등어 남색·골뱅이 갈색도 쓰지 않는다.
 * 흰다리·젓새우·베트남 강조는 대비 3:1 장미. 양식·조제품은 선단 DB 호박.
 */

import { HUB_ID } from '@/lib/chart-palette';

export const SHRIMP_ROLE = {
  volume: '#0f766e',
  highlight: '#be123c',
  second: HUB_ID.sey,
} as const;

export const SHRIMP_ACCENT = SHRIMP_ROLE.volume;
