/**
 * 「시장 이해 > 참치 양식」.
 *
 * 원문은 해부보고서 「한국 시장의 양식 참다랑어」(2026-10,
 * `docs/evidence/industry-tunafarm-2026-10/보고서.html`)다. 표준 틀(section id sNN·h2n) 15절을
 * 1절=1단계로 붙이고 부록 sA 는 뺀다(`scripts/build_report_tables.py` SPECS.tunafarm).
 *
 * 손 작성은 0이다. 공통 품목 라우트(/industry/[key])와 같은 규칙을 따른다.
 *  - 단계 제목: 원문 h2 부제. 질문은 없다.
 *  - 히어로: 원문 표지 cover-facts 타일 글자 그대로(`hub_v1.json`, 앞 넷은 수치·뒤 넷은 띠).
 *
 * 옛 세계 참치 양식 조사 제1보(2026-09)는 `docs/evidence/industry-tunafarm-world-2026-09/` 에 보존하고
 * 화면에서는 「참고」 링크 한 줄로만 잇는다.
 */
'use client';

import React from 'react';

import { proseBriefing, proseStages } from '@/lib/company-prose-stages';
import { proseForStage } from '@/lib/data/company-report-prose';
import { industryItem } from '@/lib/data/industry-registry';
import type { HeroKpi } from '../v2/HeroZone';
import { dropEmptyLabel, industryInlineReport, ReportTableView } from './IndustryReportFlow';
import CommodityIndustryDashboard, { type CommoditySpec } from './CommodityIndustryDashboard';
import { industryHero } from './IndustryItemDashboard';
import MarketRegimeBand from './MarketRegimeBand';

/** 축양 페이지 강조색. 지중해 가두리의 남색 계열. */
const TUNAFARM_ACCENT = '#2f6f8f';

const ITEM = industryItem('tunafarm');
if (!ITEM) throw new Error('참치 양식이 시장 이해 레지스트리에 없다');

/** 옛 제1보 원문 보기 사본(`scripts/sync_industry_report_html.py` ARCHIVED). */
export const TUNAFARM_WORLD_REPORT_HREF = '/reports/industry/tunafarm-world-2026-09.html';

const HERO = industryHero(ITEM);

/** 히어로 수치는 원문 표지 타일 앞 넷 그대로다(`text` 가 화면 글자). 테스트가 원문 텍스트와 대조한다. */
export const TUNAFARM_HERO_KPIS: HeroKpi[] = [{ ...HERO.primaryKpi, accent: TUNAFARM_ACCENT }, ...HERO.secondaryKpis];

const REPORT_SYNC = { status: 'STATIC' as const, syncDate: `보고서 ${ITEM.edition}` };

export const TUNAFARM_REPORT_NARRATIVES = proseStages('tunafarm').map((stage) =>
  industryInlineReport('tunafarm', {
    ...stage,
    title: proseForStage('tunafarm', stage.key)[0]?.subtitle ?? stage.title,
    question: '',
    paragraphs: stage.paragraphs.map(dropEmptyLabel),
    flow: stage.flow?.map((item) => (item.kind === 'head' ? { ...item, text: dropEmptyLabel(item.text) } : item)),
  }, {
    telemetry: REPORT_SYNC,
    source: ITEM.title,
    renderTable: (table) => <ReportTableView table={table} />,
  }),
);

export const TUNAFARM_REPORT_BRIEFING = proseBriefing('tunafarm', { firstBlock: true });

const SPEC: CommoditySpec = {
  // 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다(2026-09-10 사용자 지시).
  continuous: true,
  key: 'tunafarm',
  reportHref: ITEM.report,
  relatedReports: [{ label: '참고: 세계 참치 양식 조사 제1보 원문 보기', href: TUNAFARM_WORLD_REPORT_HREF }],
  title: ITEM.name,
  subtitle: `${ITEM.title} · ${ITEM.edition}`,
  accent: TUNAFARM_ACCENT,
  primaryKpi: TUNAFARM_HERO_KPIS[0],
  secondaryKpis: TUNAFARM_HERO_KPIS.slice(1),
  stripItems: HERO.stripItems,
  briefing: TUNAFARM_REPORT_BRIEFING,
  narratives: TUNAFARM_REPORT_NARRATIVES,
  chartSlots: {},
  sourceNotes: [],
  sourceMeta: `본문·표 · ${ITEM.title} ${ITEM.edition}`,
  insets: {
    AfterHero: () => <MarketRegimeBand commodityKey="tunafarm" />,
  },
};

export interface TunafarmIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function TunafarmIndustryDashboard({ heroOnly = false }: TunafarmIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
