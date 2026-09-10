/**
 * 문어 차트 시리즈 색. 같은 역할을 같은 색으로 그린다.
 *
 * 골뱅이 갈색·명태 청록·오징어 보라와 겹치지 않게 기본은 자주. 강조(냉동 문어·중국·위판 단가)는
 * 선단 DB 호박, 둘째 계열(조제 문어류·모로코)은 파랑.
 */

import { HUB_ID } from '@/lib/chart-palette';

export const OCTOPUS_ROLE = {
  volume: '#86198f',
  highlight: HUB_ID.sey,
  second: HUB_ID.bkk,
} as const;

export const OCTOPUS_ACCENT = OCTOPUS_ROLE.volume;
