export const HISTORY_YEARS = [2021, 2022, 2023, 2024, 2025] as const;

export type HistoryYear = (typeof HISTORY_YEARS)[number];

export const HISTORY_METHOD = '결정론적 Excel 추출·최종보고 우선·일보 교차검증·보고량은 최종보고 AI 추출 또는 본선별 하역결과 xlsx 합계 중 실측 일치 항차만';

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
