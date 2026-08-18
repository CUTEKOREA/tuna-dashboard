/**
 * 고등어 차트 시리즈 색 — 어획·위판·창구가 같은 역할을 같은 색으로 그린다.
 *
 * 항구·기구 이름을 고등어 국가에 칠하지 않는다. 오징어 보라도 쓰지 않는다.
 * 노르웨이·영국 강조는 대비 3:1 장미. 필렛은 선단 DB 호박.
 */

import { HUB_ID } from '@/lib/chart-palette';

export const MACKEREL_ROLE = {
  volume: '#0369a1',
  highlight: '#be123c',
  second: HUB_ID.sey,
} as const;

export const MACKEREL_ACCENT = MACKEREL_ROLE.volume;
