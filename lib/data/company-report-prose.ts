import albacoraRaw from '@/public/data/companies/albacora_prose_v1.json';
import boltonRaw from '@/public/data/companies/bolton_prose_v1.json';
import fcfRaw from '@/public/data/companies/fcf_prose_v1.json';
import frabelleRaw from '@/public/data/companies/frabelle_prose_v1.json';
import frinsaRaw from '@/public/data/companies/frinsa_prose_v1.json';
import itochuRaw from '@/public/data/companies/itochu_prose_v1.json';
import jaisRaw from '@/public/data/companies/jais_prose_v1.json';
import thaiunionRaw from '@/public/data/companies/thaiunion_prose_v1.json';

/**
 * 조사보고서 서술 전량 인테이크.
 *
 * 손으로 쓴 `lib/company-*-content.ts` 는 보고서 본문의 **18%**만 담았다(49,365 / 269,034자).
 * 나머지는 보고서에만 있었고, 보고서를 고칠 때마다 같은 일을 두 번 했다. 표를 원문에서
 * 그대로 읽는 방식(`company-report-tables.ts`)을 서술에도 적용한다 — 사람이 정하는 것은
 * 절 → 단계 매핑뿐이고 문장은 옮겨 적지 않는다. 생성은 `python3 scripts/build_report_prose.py`.
 */

/** 서술 한 덩어리. `kind` 가 화면 렌더를 가른다. */
export interface ProseBlock {
  kind: 'lead' | 'para' | 'call' | 'h3';
  text: string;
  /** 근거 등급 칩. 보고서가 문장 끝에 달아 둔 것을 그대로 옮긴다. */
  chips?: string[];
  /** 콜아웃 제목, 또는 소제목 본문 */
  title?: string;
  /** 콜아웃 색 — warn(주의) · hot(강조) */
  tone?: 'warn' | 'hot';
}

export interface ProseSection {
  sid: string;
  numeral: string;
  label: string;
  subtitle: string;
  blocks: ProseBlock[];
  /** 대시보드 단계 (c01 …) */
  stage: string;
}

interface Intake {
  _meta: { 출처: string; 생성: string; 설명: string };
  sections: ProseSection[];
}

const INTAKES: Record<string, Intake> = {
  albacora: albacoraRaw as unknown as Intake,
  bolton: boltonRaw as unknown as Intake,
  fcf: fcfRaw as unknown as Intake,
  frabelle: frabelleRaw as unknown as Intake,
  frinsa: frinsaRaw as unknown as Intake,
  itochu: itochuRaw as unknown as Intake,
  jais: jaisRaw as unknown as Intake,
  thaiunion: thaiunionRaw as unknown as Intake,
};

export const REPORT_PROSE_COMPANIES = Object.keys(INTAKES);

/** 그 회사 보고서에서 옮겨 온 서술 전량. */
export function reportProse(company: string): ProseSection[] {
  return INTAKES[company]?.sections ?? [];
}

/** 한 단계에 붙는 절. 보고서 절 순서를 그대로 지킨다. */
export function proseForStage(company: string, stage: string): ProseSection[] {
  return reportProse(company).filter((s) => s.stage === stage);
}

/** 어느 단계에도 안 붙은 절이 있으면 화면에서 사라진 것이다 — 테스트가 본다. */
export function proseStagesUsed(company: string): string[] {
  return [...new Set(reportProse(company).map((s) => s.stage))].sort();
}
