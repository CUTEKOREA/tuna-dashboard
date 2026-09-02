/**
 * 조사보고서 절 → 대시보드 단계 변환. 여덟 편이 함께 쓴다.
 *
 * 손으로 쓰던 `company-*-content.ts` 는 보고서 본문의 21%만 화면에 올렸다
 * (49,365 / 235,048자). 나머지는 보고서에만 있었고 보고서를 고칠 때마다 같은 일을
 * 두 번 했다. 여기서는 문장을 옮겨 적지 않는다 — 절 → 단계 매핑은
 * `build_report_tables.py` 가 이미 갖고 있고 그것을 그대로 재사용한다.
 *
 * 한 단계에 절이 여럿 붙는 편이 있다(FCF 는 03·07절이 함께 c03 이다). 그럴 때는
 * 절을 잇되 **뒤 절의 부제를 소제목으로 남겨** 어디서 넘어왔는지 보이게 한다.
 */
import type {
  BriefingPoint,
  StageNarrative,
} from '@/components/market-understanding/CommodityIndustryDashboard';
import {
  type ProseSection,
  reportProse,
} from '@/lib/data/company-report-prose';

function blocksToParagraphs(sec: ProseSection, withHeading: boolean): string[] {
  const out: string[] = [];
  if (withHeading && sec.subtitle) out.push(`**${sec.label}: ${sec.subtitle}**`);
  for (const b of sec.blocks) {
    if (b.kind === 'lead' && !withHeading) continue;  // 리드는 lede 로 따로 나간다
    if (b.kind === 'h3') continue;                    // 소제목은 표가 이어받는다
    out.push(b.kind === 'call' && b.title ? `**${b.title}** ${b.text}` : b.text);
  }
  return out.filter(Boolean);
}

/** 그 회사의 단계 서술 전량. 단계 하나에 절이 여럿이면 이어 붙인다. */
export function proseStages(company: string): StageNarrative[] {
  const byStage = new Map<string, ProseSection[]>();
  for (const sec of reportProse(company)) {
    const list = byStage.get(sec.stage) ?? [];
    list.push(sec);
    byStage.set(sec.stage, list);
  }

  return [...byStage.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([stage, secs]) => {
      const head = secs[0];
      const lead = head.blocks.find((b) => b.kind === 'lead');
      const paragraphs = [
        ...blocksToParagraphs(head, false),
        ...secs.slice(1).flatMap((s) => blocksToParagraphs(s, true)),
      ];
      return {
        key: stage,
        numeral: head.numeral,
        title: `${head.label}: ${head.subtitle}`,
        question: head.blocks.find((b) => b.kind === 'h3')?.title ?? head.subtitle,
        lede: lead?.text ?? '',
        paragraphs,
        // 근거는 보고서 표가 담는다. 여기서 중복해 싣지 않는다.
        facts: [],
        terms: [],
      };
    });
}

/** 30초 브리핑. 절마다 리드 문장을 그대로 쓴다. */
export function proseBriefing(company: string): BriefingPoint[] {
  return reportProse(company).flatMap((sec): BriefingPoint[] => {
    const lead = sec.blocks.find((b) => b.kind === 'lead');
    return lead ? [{ stage: sec.stage, headline: sec.subtitle, text: lead.text }] : [];
  });
}
