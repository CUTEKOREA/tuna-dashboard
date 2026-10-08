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
  FlowItem,
  StageNarrative,
} from '@/components/market-understanding/CommodityIndustryDashboard';
import {
  type ProseSection,
  reportProse,
} from '@/lib/data/company-report-prose';

function blocksToParagraphs(
  sec: ProseSection,
  withHeading: boolean,
  skip?: ProseSection['blocks'][number],
): string[] {
  const out: string[] = [];
  if (withHeading && sec.subtitle) out.push(`**${sec.label}: ${sec.subtitle}**`);
  for (const b of sec.blocks) {
    if (b === skip) continue;                          // lede 로 올라간 블록
    if (b.kind === 'h3') continue;                    // 소제목은 표가 이어받는다
    out.push(b.kind === 'call' && b.title ? `**${b.title}** ${b.text}` : b.text);
  }
  return out.filter(Boolean);
}

/**
 * 원문 순서의 글 조각. 소제목도 버리지 않는다 —
 * 표를 절 끝으로 몰던 시절에는 소제목을 표 제목이 이어받았지만,
 * 표가 제자리로 돌아오면 소제목은 소제목으로 서야 한다.
 *
 * `ord` 는 절 본문 안의 문자 오프셋이다. 절이 여럿 합쳐진 단계에서는 뒤 절의 오프셋이
 * 앞 절과 겹치므로 절 순번에 큰 수를 곱해 밀어 둔다.
 */
function blocksToFlow(sec: ProseSection, secIndex: number, withHeading: boolean,
                      skip?: ProseSection['blocks'][number]): FlowItem[] {
  const shift = secIndex * 1_000_000;
  const out: FlowItem[] = [];
  if (withHeading && sec.subtitle) {
    out.push({ kind: 'head', ord: shift - 1, text: `${sec.label}: ${sec.subtitle}` });
  }
  for (const b of sec.blocks) {
    if (b === skip) continue;                          // lede 로 올라간 블록
    const ord = shift + (b.ord ?? 0);
    if (b.kind === 'h3') {
      if (b.title) out.push({ kind: 'head', ord, text: b.title });
      continue;
    }
    const text = b.kind === 'call' && b.title ? `**${b.title}** ${b.text}` : b.text;
    if (text) out.push({ kind: 'text', ord, text });
  }
  return out;
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
    .map(([stage, secs], stageIndex) => {
      const head = secs[0];
      // 리드 없이 소제목으로 여는 절이 있다(Frinsa 06절). 그럴 때는 첫 서술 블록을
      // 리드 자리에 놓는다 — 비워 두면 단계 머리가 통째로 빈다.
      const lead = head.blocks.find((b) => b.kind === 'lead')
        ?? head.blocks.find((b) => b.kind === 'para' || b.kind === 'call');
      const paragraphs = [
        ...blocksToParagraphs(head, false, lead),
        ...secs.slice(1).flatMap((s) => blocksToParagraphs(s, true)),
      ];
      const flow = [
        ...blocksToFlow(head, 0, false, lead),
        ...secs.slice(1).flatMap((s, i) => blocksToFlow(s, i + 1, true)),
      ];
      return {
        key: stage,
        // 절 번호가 아니라 **화면 단계 순번**이다. 한 단계에 절이 여럿 합쳐지거나
        // 절 하나가 빠지면 둘이 어긋난다 — Thai Union 은 05 자리에 08절이 온다.
        numeral: String(stageIndex + 1).padStart(2, '0'),
        title: `${head.label}: ${head.subtitle}`,
        question: head.blocks.find((b) => b.kind === 'h3')?.title ?? head.subtitle,
        lede: lead?.text ?? '',
        paragraphs,
        flow,
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
