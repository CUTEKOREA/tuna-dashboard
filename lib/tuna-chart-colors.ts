/**
 * 참치 차트 시리즈 색 — 집계 차트와 위젯이 같은 종·같은 나라를 같은 색으로 그린다.
 *
 * 항구·기구는 lib/chart-palette 정체성 집을 쓴다. 오징어 보라(#7c3aed)는 쓰지 않는다.
 */

import { HUB_ID, RFMO_ID } from '@/lib/chart-palette';

export const TUNA_ROLE = {
  volume: HUB_ID.bkk,
  highlight: '#be123c',
  processed: '#c2410c',
  muted: '#94a3b8',
} as const;

const SPECIES_COLOR: Record<string, string> = {
  가다랑어: TUNA_ROLE.volume,
  황다랑어: '#059669',
  눈다랑어: TUNA_ROLE.processed,
  날개다랑어: '#0369a1',
  대서양참다랑어: RFMO_ID.ICCAT,
  남방참다랑어: RFMO_ID.CCSBT,
  태평양참다랑어: TUNA_ROLE.highlight,
  참다랑어: TUNA_ROLE.highlight,
};

const RFMO_COLOR: Record<string, string> = {
  WCPFC: RFMO_ID.WCPFC,
  IOTC: RFMO_ID.IOTC,
  IATTC: RFMO_ID.IATTC,
  ICCAT: RFMO_ID.ICCAT,
  CCSBT: RFMO_ID.CCSBT,
  CCAMLR: '#64748b',
  미분류: TUNA_ROLE.muted,
};

const HUB_COLOR: Record<string, string> = {
  방콕: HUB_ID.bkk,
  만타: HUB_ID.mnt,
  세이셸: HUB_ID.sey,
  아비장: HUB_ID.abj,
  비고: HUB_ID.vig,
};

const FALLBACK = [
  TUNA_ROLE.volume,
  SPECIES_COLOR.황다랑어,
  TUNA_ROLE.processed,
  SPECIES_COLOR.날개다랑어,
  TUNA_ROLE.highlight,
  HUB_ID.abj,
  '#64748b',
  '#c2410c',
] as const;

const NAMED: Record<string, string> = {
  ...SPECIES_COLOR,
  ...RFMO_COLOR,
  ...HUB_COLOR,
  대한민국: TUNA_ROLE.highlight,
  한국: TUNA_ROLE.highlight,
};

/** 라벨에 종·나라 이름이 섞여 있어도 같은 집에 붙인다. */
function resolveName(name: string): string | undefined {
  if (NAMED[name]) return NAMED[name];
  if (/대서양참다랑어/.test(name)) return SPECIES_COLOR.대서양참다랑어;
  if (/남방참다랑어/.test(name)) return SPECIES_COLOR.남방참다랑어;
  if (/태평양참다랑어/.test(name)) return SPECIES_COLOR.태평양참다랑어;
  if (/참다랑어|bluefin/i.test(name)) return SPECIES_COLOR.참다랑어;
  if (/가다랑어|가랑어|skipjack/i.test(name)) return SPECIES_COLOR.가다랑어;
  if (/황다랑어|yellowfin/i.test(name)) return SPECIES_COLOR.황다랑어;
  if (/눈다랑어|bigeye/i.test(name)) return SPECIES_COLOR.눈다랑어;
  if (/날개다랑어|albacore/i.test(name)) return SPECIES_COLOR.날개다랑어;
  if (name === '한국' || name.startsWith('한국 ') || name.startsWith('한국(') || name.includes('대한민국')) {
    return TUNA_ROLE.highlight;
  }
  return undefined;
}

export function colorForSpecies(name: string): string {
  return resolveName(name) ?? FALLBACK[0];
}

export function colorForRfmo(name: string): string {
  return RFMO_COLOR[name] ?? FALLBACK[6];
}

export function colorForHub(name: string): string {
  return HUB_COLOR[name] ?? FALLBACK[0];
}

export function colorForCountry(name: string): string {
  return resolveName(name) === TUNA_ROLE.highlight ? TUNA_ROLE.highlight : TUNA_ROLE.volume;
}

export function colorForSeries(name: string, index = 0): string {
  return resolveName(name) ?? FALLBACK[index % FALLBACK.length];
}

export const TUNA_SPECIES_COLORS = SPECIES_COLOR;
export const TUNA_FALLBACK_COLORS = FALLBACK;
