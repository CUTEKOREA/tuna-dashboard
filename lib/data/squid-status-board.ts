/** 오징어 현황판 정적 값 - 해부보고서 2026년 10월판 표를 옮긴 것(components/market-understanding/SquidStatusBoard). */
import raw from '../../data/squid_status_board.json';

export type Kpi = { key: string; label: string; value: number; unit: string; note: string; basis: string };
export type Supply = { year: number; import_t: number; distant_t: number; coastal_t: number };
export type Imp = { period: string; value_musd: number; volume_t: number; unit_usd_kg: number; partial: boolean };
export type Decomp = { step: string; kind: 'base' | 'delta' | 'total'; value_musd: number };
export type Origin = { country: string; s2020: number | null; s2025: number; s2026: number | null };
export type Hhi = { period: string; hhi: number };
export type Chain = { stage: string; add_krw: number; price_krw: number; margin_krw: number | null };
export type Region = { region: string; prod_t: number; firms: number; per_firm: number };
export type Overlap = { type: string; matched: number; total: number; rate: number };
export type Closed = { stage: string; system: string; how: string; basis: string };
export type Watch = { branch: string; indicator: string; now: string; where: string };

export const SQUID_STATUS_BOARD = raw as unknown as {
  _meta: { as_of: string };
  kpi: Kpi[]; supply: Supply[]; imports: Imp[]; decomp: Decomp[]; origins: Origin[]; hhi: Hhi[];
  chain: Chain[]; regions: Region[]; overlap: Overlap[]; closed: Closed[]; watch: Watch[];
};
