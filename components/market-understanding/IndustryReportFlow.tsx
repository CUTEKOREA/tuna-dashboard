/**
 * 품목 해부보고서(명태·문어·새우·오징어·참치 해부)의 원문 흐름 — 다섯 화면이 함께 쓴다.
 *
 * 서술(`proseStages`)에 표·그림을 **원문에 있던 자리**로 끼우고, 단계에 붙은 절마다
 * 장 제목(h2 의 라벨 + 부제)을 소제목으로 세운다. 공용 `proseStages` 는 한 단계의 첫 절
 * 제목을 단계 머리로 쓰는데 품목 화면은 단계 제목을 손 작성 값으로 바꾸므로 그 첫 절
 * 제목이 화면에서 사라졌다. 여기서 되살린다.
 *
 * 한 단계에 절이 여럿 붙으므로 절별 오프셋 구간을 따로 둔다(절 순번 × 1,000,000).
 * 그렇지 않으면 뒤 절의 표가 첫 절 문장 사이에 섞인다.
 */
import type React from 'react';

import type { FlowItem, StageNarrative } from './CommodityIndustryDashboard';
import { figuresForStage, type ReportFigure } from '@/lib/data/company-report-figures';
import { proseForStage, type ProseSection } from '@/lib/data/company-report-prose';
import { tablesForStage, type ReportTable } from '@/lib/data/company-report-tables';
import styles from './TunaIndustryDashboard.module.css';

const SHIFT = 1_000_000;

/** 절 번호(kicker)가 비면 공용 proseStages 가 「: 부제」 머리를 만든다. 그 「: 」를 걷는다. */
export const dropEmptyLabel = (text: string) => text.replace(/^(\*\*)?: /, '$1');

/** 원문 장 제목을 화면 소제목으로. 라벨이 없는 절은 부제만 남는다. */
export const chapterHead = (sec: ProseSection) => dropEmptyLabel(`${sec.label}: ${sec.subtitle}`);

/** 그림 캡션의 첫 조각(「그림 N. …」)이 제목, 나머지(자료·주)가 설명이다. */
function splitCaption(caption: string): [string, string] {
  const [title, ...rest] = caption.split(' · ');
  return [title ?? '', rest.join(' · ')];
}

/**
 * 원문 마크업 조각(지표 타일·막대·도판 격자·SVG).
 *
 * 쓰는 클래스는 보고서 자체 style 에만 있어 추출기가 그 규칙을 함께 뽑아 두었다. 여기서
 * 그림 하나에만 걸리도록 범위를 좁혀 붙인다 — 전역에 새면 대시보드 다른 곳이 깨진다.
 * 회사 해부의 RepChart 와 같은 방식이다(회사 편 화면을 건드리지 않으려 따로 둔다).
 */
export function ReportFigureView({ f, id }: { f: ReportFigure; id: string }) {
  const scoped = (f.css ?? '')
    .replace(/:scope\{/g, `[data-fig="${id}"]{`)
    .replace(/(^|\})\s*(\.[^{}]+)\{/g,
      (_m: string, close: string, sel: string) => `${close}[data-fig="${id}"] ${sel}{`);
  return (
    <div className={styles.figChart} data-fig={id}>
      {scoped ? <style dangerouslySetInnerHTML={{ __html: scoped }} /> : null}
      <div className={styles.figPlate} dangerouslySetInnerHTML={{ __html: f.html ?? f.svg ?? '' }} />
    </div>
  );
}

export interface InlineOptions {
  telemetry: { status: 'STATIC' | 'SYNCED' | 'LIVE'; syncDate?: string };
  /** 출처 줄 머리. 예: 「한국 오징어 산업 해부」 */
  source: string;
  renderTable: (table: ReportTable) => React.ReactNode;
}

export function industryInlineReport(key: string, n: StageNarrative, opts: InlineOptions): StageNarrative {
  if (!n.flow) return n;

  const secs = proseForStage(key, n.key);
  const index = new Map(secs.map((sec, i) => [sec.sid, i]));
  const at = (sid: string, ord: number) => (index.get(sid) ?? 0) * SHIFT + ord;
  const label = (sid: string) => {
    const sec = secs.find((s) => s.sid === sid);
    return sec ? [sec.numeral, sec.label].filter(Boolean).join(' / ') : sid;
  };

  const extras: FlowItem[] = [
    ...tablesForStage(key, n.key).map((table): FlowItem => ({
      kind: 'slot',
      ord: at(table.sid, table.ord),
      slot: {
        title: table.title,
        caption: table.note ?? table.caption ?? '',
        telemetry: opts.telemetry,
        render: () => opts.renderTable(table),
        span: 'full',
        sourceLine: `${opts.source} ${table.section}`,
      },
    })),
    ...figuresForStage(key, n.key).map((f): FlowItem => {
      const [title, caption] = splitCaption(f.caption);
      const id = `${key}-${f.sid}-${f.ord}`;
      return {
        kind: 'slot',
        ord: at(f.sid, f.ord),
        slot: {
          title,
          caption,
          telemetry: opts.telemetry,
          render: () => <ReportFigureView f={f} id={id} />,
          span: 'full',
          sourceLine: `${opts.source} ${label(f.sid)}`,
        },
      };
    }),
  ];

  // 장 제목은 아래서 절마다 다시 세운다. 공용 proseStages 가 둘째 절부터 넣어 둔 머리(절 순번 × SHIFT − 1)는 뺀다.
  const isChapter = (item: FlowItem) => item.kind === 'head' && (item.ord + 1) % SHIFT === 0;
  const merged = [...n.flow.filter((item) => !isChapter(item)), ...extras].sort((a, b) => a.ord - b.ord);

  // 소제목이 바로 뒤 표의 제목과 같으면 지운다. 추출기가 표 제목을 그 소제목에서 가져온다.
  const deduped = merged.filter((item, i) => {
    if (item.kind !== 'head') return true;
    const next = merged[i + 1];
    return !(next?.kind === 'slot' && next.slot.title === item.text);
  });
  if (deduped[0]?.kind === 'head' && deduped[0].text === n.question) deduped.shift();

  // 단계 제목이 곧 그 장 제목이면 한 번만 보인다.
  const chapters: FlowItem[] = secs
    .map((sec, i): FlowItem => ({ kind: 'head', ord: i * SHIFT - 1, text: chapterHead(sec) }))
    .filter((head) => head.kind === 'head' && head.text !== n.title);
  return { ...n, flow: [...chapters, ...deduped].sort((a, b) => a.ord - b.ord) };
}
