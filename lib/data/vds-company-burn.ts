// 수역별 회사별 조업일수(VDS) 소진현황 인테이크 (ADR-0005).
// 원자료: 미경실 조업일수 대장 xlsx -> scripts/sync_vds_burn.py -> data/vds_company_burn.json
// VdsStrategyMatrix 히트맵의 유일한 데이터 통로 - 컴포넌트 하드코딩 금지.
import raw from '../../data/vds_company_burn.json';

export interface VdsBurnCell {
  available: number | null;
  consumed: number | null;
  remaining: number | null;
  ratePct: number | null;
}

export interface VdsBurnZone {
  companies: Record<string, VdsBurnCell>;
  total: VdsBurnCell;
}

export interface VdsBurnYear {
  companies: string[];
  zones: Record<string, VdsBurnZone>;
}

export interface VdsCompanyBurnData {
  asOf: string;
  /** 최신 어기 원장에서 뽑은 최근 조업일수 이벤트 (추가 구매·전배, 최신순 5건) */
  recentEvents: { date: string; msg: string }[];
  source: { file: string; sha256: string; note: string };
  years: Record<string, VdsBurnYear>;
}

const data = raw as unknown as VdsCompanyBurnData;

export function getVdsCompanyBurn(): VdsCompanyBurnData {
  return data;
}

/** 히트맵 셀 - 연도/회사/수역. 없으면 null */
export function getVdsBurnCell(year: string, company: string, zone: string): VdsBurnCell | null {
  return data.years[year]?.zones[zone]?.companies[company] ?? null;
}

/** 데이터가 있는 연도 목록 (오름차순) */
export function getVdsBurnYears(): string[] {
  return Object.keys(data.years).sort();
}
