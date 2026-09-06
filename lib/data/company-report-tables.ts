import albacoraRaw from '@/public/data/companies/albacora_tables_v1.json';
import boltonRaw from '@/public/data/companies/bolton_tables_v1.json';
import fcfRaw from '@/public/data/companies/fcf_tables_v1.json';
import frabelleRaw from '@/public/data/companies/frabelle_tables_v1.json';
import frinsaRaw from '@/public/data/companies/frinsa_tables_v1.json';
import itochuRaw from '@/public/data/companies/itochu_tables_v1.json';
import jaisRaw from '@/public/data/companies/jais_tables_v1.json';
import jealsaRaw from '@/public/data/companies/jealsa_tables_v1.json';
import thaiunionRaw from '@/public/data/companies/thaiunion_tables_v1.json';
import nauterraRaw from '@/public/data/companies/nauterra_tables_v1.json';
import starkistRaw from '@/public/data/companies/starkist_tables_v1.json';
import dongwonRaw from '@/public/data/companies/dongwon_tables_v1.json';

/**
 * 조사보고서 표 전량 인테이크.
 *
 * 손으로 만든 슬롯은 「이 표에서 무엇을 보라」를 쓴 것이고, 여기 실린 표는
 * **보고서에 있는데 그 슬롯이 못 담은 나머지**다. 값을 옮겨 적지 않고 원문에서
 * 그대로 읽으므로 자릿수가 틀릴 자리가 없다 — 생성은
 * `python3 scripts/build_report_tables.py` 가 한다.
 *
 * `num` 은 원문이 우측정렬로 표시한 열이다. 그 표시를 그대로 옮겨야 숫자 열이
 * 화면에서도 자릿수로 맞는다.
 */

export interface ReportTable {
  /** 절 본문 안의 문자 오프셋. 원문 자리에 되돌릴 때 쓴다. */
  ord: number;
  /** 표 바로 앞 소제목. 없으면 헤더 서명으로 대신한다. */
  title: string;
  head: string[];
  /** 열별 우측정렬 여부 — 원문 표기 그대로다. */
  num: boolean[];
  rows: string[][];
  /** 보고서 절 번호 (s1 …) */
  sid: string;
  /** 절 제목 */
  section: string;
  /** 표 바로 뒤 설명 문단. 보고서가 이미 쓴 것을 다시 쓰지 않는다. */
  note?: string;
  caption?: string;
  /** 대시보드 단계 (c01 …) */
  stage: string;
}

interface Intake {
  _meta: { 출처: string; 생성: string; 설명: string };
  sections: Record<string, number>;
  tables: ReportTable[];
}

const INTAKES: Record<string, Intake> = {
  frinsa: frinsaRaw as unknown as Intake,
  thaiunion: thaiunionRaw as unknown as Intake,
  albacora: albacoraRaw as unknown as Intake,
  fcf: fcfRaw as unknown as Intake,
  itochu: itochuRaw as unknown as Intake,
  bolton: boltonRaw as unknown as Intake,
  jais: jaisRaw as unknown as Intake,
  frabelle: frabelleRaw as unknown as Intake,
  jealsa: jealsaRaw as unknown as Intake,
  nauterra: nauterraRaw as unknown as Intake,
  starkist: starkistRaw as unknown as Intake,
  dongwon: dongwonRaw as unknown as Intake,
};

export const REPORT_TABLE_COMPANIES = Object.keys(INTAKES);

/** 그 회사 보고서에서 옮겨 온 표 전량. */
export function reportTables(company: string): ReportTable[] {
  return INTAKES[company]?.tables ?? [];
}

/** 한 단계에 붙는 표. 보고서 절 순서를 그대로 지킨다. */
export function tablesForStage(company: string, stage: string): ReportTable[] {
  return reportTables(company).filter((t) => t.stage === stage);
}

/** 어느 단계에도 안 붙은 표가 있으면 화면에서 사라진 것이다 — 테스트가 본다. */
export function stagesUsed(company: string): string[] {
  return [...new Set(reportTables(company).map((t) => t.stage))].sort();
}

/** 표 하나가 담은 칸 수. 인테이크가 비어 가는지 재는 데 쓴다. */
export function cellCount(company: string): number {
  return reportTables(company).reduce((a, t) => a + t.rows.length * t.head.length, 0);
}
