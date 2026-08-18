/**
 * 골뱅이 차트 시리즈 색 — 과(科)·창구가 같은 역할을 같은 색으로 그린다.
 *
 * 항구·기구 이름을 골뱅이 국가에 칠하지 않는다. 오징어 보라·고등어 남색도 쓰지 않는다.
 * 참골뱅이·영국·캐나다 강조는 대비 3:1 장미. 양식은 선단 DB 호박.
 */

import { HUB_ID } from '@/lib/chart-palette';

export const WHELK_ROLE = {
  volume: '#92400e',
  highlight: '#be123c',
  second: HUB_ID.sey,
} as const;

export const WHELK_ACCENT = WHELK_ROLE.volume;
