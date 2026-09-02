/**
 * 「시장 이해 > 기업 해부 > Frabelle」 서술.
 *
 * 앞선 일곱 편과 달리 **손으로 쓰지 않는다.** 조사보고서 9절을 그대로 읽어 단계로 옮긴다
 * (`public/data/companies/frabelle_prose_v1.json`, 생성은 `scripts/build_report_prose.py`).
 *
 * 손으로 쓰던 방식은 보고서 본문의 18%만 화면에 올렸고 보고서가 개정될 때마다 같은 일을
 * 두 번 하게 했다. 여기서는 보고서를 고치면 스크립트 한 번으로 화면이 따라온다.
 */
import type {
  BriefingPoint,
  StageNarrative,
} from '@/components/market-understanding/CommodityIndustryDashboard';
import { frabelleMeta } from '@/lib/data/company-frabelle';
import {
  type ProseBlock,
  type ProseSection,
  reportProse,
} from '@/lib/data/company-report-prose';

/** 보고서 절을 화면 단계로 옮긴다. 문장은 손대지 않는다. */
function toNarrative(sec: ProseSection): StageNarrative {
  const lead = sec.blocks.find((b) => b.kind === 'lead');

  // 소제목은 뒤따르는 본문을 이끄는 말이라 문단 앞에 붙여 둔다.
  // 콜아웃은 보고서가 강조한 대목이므로 본문과 같은 흐름에 놓되 제목을 살린다.
  const paragraphs = sec.blocks
    .filter((b) => b !== lead && b.kind !== 'h3')
    .map((b) => (b.kind === 'call' && b.title ? `**${b.title}** ${b.text}` : b.text));

  const headings = sec.blocks.filter((b) => b.kind === 'h3');

  return {
    key: `c${sec.numeral.padStart(2, '0')}`,
    numeral: sec.numeral,
    title: `${sec.label}: ${sec.subtitle}`,
    question: headings[0]?.title ?? sec.subtitle,
    lede: lead?.text ?? '',
    paragraphs,
    // 근거는 보고서 표가 담는다. 여기서는 중복해 싣지 않는다.
    facts: [],
    terms: [],
  };
}

export const FRABELLE_STAGES: StageNarrative[] = reportProse('frabelle').map(toNarrative);

/** 근거 칩을 절 단위로 모은다. 화면 하단 근거 표시에 쓴다. */
export function frabelleChips(stageKey: string): string[] {
  const sec = reportProse('frabelle').find((s) => s.stage === stageKey);
  if (!sec) return [];
  const seen = new Set<string>();
  for (const b of sec.blocks as ProseBlock[]) {
    for (const c of b.chips ?? []) seen.add(c);
  }
  return [...seen];
}

/**
 * 30초 브리핑. 절마다 리드 문장을 그대로 쓴다.
 *
 * 손으로 고른 요약이 아니라 보고서가 각 절 첫머리에 세운 문장이다. 보고서를 고치면
 * 브리핑도 따라 바뀐다.
 */
export const FRABELLE_BRIEFING: BriefingPoint[] = reportProse('frabelle')
  .flatMap((sec): BriefingPoint[] => {
    const lead = sec.blocks.find((b) => b.kind === 'lead');
    return lead ? [{ stage: sec.stage, headline: sec.subtitle, text: lead.text }] : [];
  });

/** 자료 출처와 한계. 조사 아카이브 메타를 그대로 옮긴다. */
export const FRABELLE_SOURCE_NOTES: string[] = [
  frabelleMeta.출처,
  frabelleMeta.출처한계,
  frabelleMeta.측정경계,
];
