/**
 * 문어 차트 역할 색 — 어획·위판·창구가 같은 역할을 같은 색으로 그린다.
 * 색값은 lib/chart-palette 의 CHART_ROLE(전 메뉴 공통)이다. 이 파일은 메뉴 액센트만 따로 둔다.
 */

import { CHART_ROLE } from '@/lib/chart-palette';

/** 데이터 색은 전 메뉴 공통 역할(주 물량·강조·보조)을 쓴다 — 2026-09-11 팔레트 일원화. */
export const OCTOPUS_ROLE = CHART_ROLE;

/** 메뉴 톤 — 히어로·섹션 머리 같은 차트 밖에만 쓴다. 데이터 마크에 쓰지 않는다. */
export const OCTOPUS_ACCENT = '#86198f';
