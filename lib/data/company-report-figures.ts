import albacoraRaw from '@/public/data/companies/albacora_figures_v1.json';
import boltonRaw from '@/public/data/companies/bolton_figures_v1.json';
import fcfRaw from '@/public/data/companies/fcf_figures_v1.json';
import frabelleRaw from '@/public/data/companies/frabelle_figures_v1.json';
import frinsaRaw from '@/public/data/companies/frinsa_figures_v1.json';
import itochuRaw from '@/public/data/companies/itochu_figures_v1.json';
import jaisRaw from '@/public/data/companies/jais_figures_v1.json';
import jealsaRaw from '@/public/data/companies/jealsa_figures_v1.json';
import thaiunionRaw from '@/public/data/companies/thaiunion_figures_v1.json';

/**
 * 조사보고서 그림 인테이크 — 팩샷·차트·문서 캡처.
 *
 * 표(`company-report-tables.ts`)·서술(`company-report-prose.ts`) 의 셋째 짝이다.
 * 보고서에는 아홉 편 합쳐 그림이 59장 있었는데 화면에는 한 장도 올라오지 않았다.
 *
 * **이미지 바이트는 여기 없다.** 팩샷 원본이 합쳐 6 MB 라 base64 로 담으면 번들에
 * 8 MB 가 붙는다. `public/data/companies/figures/` 아래 정적 파일로 두고 URL 만 담는다.
 * 인라인 SVG(차트)만 예외 — 합쳐 10 KB 도 안 되고, 색을 CSS 토큰에서 받아야
 * 인쇄와 다크 모드 양쪽에서 산다. 생성은 `python3 scripts/build_report_figures.py`.
 */

export interface ReportFigure {
  stage: string;
  sid: string;
  /** 절 본문 안의 문자 오프셋. 원문 자리에 되돌릴 때 쓴다. */
  ord: number;
  /** shot=제품 팩샷 · chart=인라인 SVG · doc=문서 캡처 */
  kind: 'shot' | 'chart' | 'doc';
  caption: string;
  alt: string;
  /** 정적 이미지 URL (shot·doc) */
  src?: string;
  /** 인라인 SVG 문자열 (chart) */
  svg?: string;
  /** 그 SVG 가 쓰는 클래스 규칙. 보고서 style 에만 있어 함께 실어야 한다 */
  css?: string;
}

interface Intake {
  _meta: { 출처: string; 생성: string; 설명: string };
  figures: ReportFigure[];
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
};

export const REPORT_FIGURE_COMPANIES = Object.keys(INTAKES);

/** 그 회사 보고서의 그림 전량. */
export function reportFigures(company: string): ReportFigure[] {
  return INTAKES[company]?.figures ?? [];
}

/** 한 단계에 붙는 그림. 보고서 절 순서를 그대로 지킨다. */
export function figuresForStage(company: string, stage: string): ReportFigure[] {
  return reportFigures(company).filter((f) => f.stage === stage);
}

/** 어느 단계에도 안 붙은 그림이 있으면 화면에서 사라진 것이다 — 테스트가 본다. */
export function figureStagesUsed(company: string): string[] {
  return [...new Set(reportFigures(company).map((f) => f.stage))].sort();
}
