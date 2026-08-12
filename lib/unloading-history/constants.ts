export const HISTORY_YEARS = [2021, 2022, 2023, 2024, 2025] as const;

export type HistoryYear = (typeof HISTORY_YEARS)[number];

export const CANONICAL_PORTS = {
  BKK: '방콕',
  SKL: '송클라',
  HCM: '호찌민',
  GES: '제너럴산토스',
  CLO: '꾸아로',
  CRH: '깜란',
  JKT: '자카르타',
} as const;

export const CANONICAL_PORT_CODES = Object.keys(CANONICAL_PORTS) as [
  keyof typeof CANONICAL_PORTS,
  ...(keyof typeof CANONICAL_PORTS)[],
];

export type CanonicalPortCode = keyof typeof CANONICAL_PORTS;

export type HistoryNavigationKey =
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Home'
  | 'End';
