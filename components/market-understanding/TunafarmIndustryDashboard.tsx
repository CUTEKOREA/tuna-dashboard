/**
 * 「시장 이해 > 참치 양식」.
 *
 * 연육처럼 손으로 만든 위젯·차트가 없다. 서술·표는 전부 세계 참치 양식 조사 제1보 원문
 * (`docs/evidence/industry-tunafarm-2026-10/보고서.html`)에서 추출한 것이고, 여기서 손으로
 * 정하는 것은 단계 제목·질문과 히어로 수치(원문 표지 리터럴)뿐이다.
 *
 * ⚠ 히어로 주수치는 **FAO 2024 세계 양식 생산량**이다. 세계 전수가 아니라 **보고한 나라들의 합**이다.
 * ⚠ 인가 입식 상한(75,199.84 t)과 동부 총허용어획량(48,403 t)은 **층이 다르다**.
 */
'use client';

import React from 'react';

import { proseBriefing, proseStages } from '@/lib/company-prose-stages';
import type { HeroKpi } from '../v2/HeroZone';
import { dropEmptyLabel, industryInlineReport, ReportTableView } from './IndustryReportFlow';
import CommodityIndustryDashboard, { type CommoditySpec } from './CommodityIndustryDashboard';

/** 축양 페이지 강조색. 지중해 가두리의 남색 계열. */
const TUNAFARM_ACCENT = '#2f6f8f';

const REPORT_SYNC = { status: 'STATIC' as const, syncDate: '세계 참치 양식 조사 제1보 2026-09-13' };

/** 히어로 수치는 원문 표지 타일 네 개 그대로다. 렌더 테스트가 원문 텍스트와 대조한다. */
export const TUNAFARM_HERO_KPIS: HeroKpi[] = [
  { label: '2024 세계 양식 생산 (보고한 나라 합)', value: 68443, unit: '(톤)', accent: TUNAFARM_ACCENT },
  { label: '2024 산지 출하 단가', value: 13.52, unit: '(달러/kg)', decimals: 2 },
  { label: '일본 인공종묘 유래 출하 2024', value: 405, unit: '(톤)' },
  { label: '모로코 축양 증육률', value: 69, unit: '(%)' },
];

/**
 * 단계 순서·제목·질문(손 작성). 서술·표는 전부 원문에서 온다.
 * 절 → 단계 매핑은 `scripts/build_report_tables.py` SPECS.tunafarm 에 있다(요지는 Ⅰ장과 한 단계).
 */
export const TUNAFARM_STAGES: Array<{ key: string; title: string; question: string }> = [
  { key: 's01', title: '경계 - 「참치 양식」에 네 가지가 들어 있다', question: '기른 것인가, 잡아서 살찌운 것인가' },
  { key: 's02', title: '층 - 네 숫자가 서로 다른 것을 센다', question: '어느 숫자를 생산량이라 부를 수 있는가' },
  { key: 's03', title: '명부 - 인가된 가두리는 어디에 있나', question: '누가 기를 수 있도록 허가받았는가' },
  { key: 's04', title: '통계 - 0이 아니라 결측이다', question: '왜 어떤 나라는 생산량이 0으로 보이는가' },
  { key: 's05', title: '값 - 물량은 버티는데 단가가 무너졌다', question: '2022년 이후 산지 단가는 왜 떨어졌는가' },
  { key: 's06', title: '원가 - 사료가 아니라 종묘다', question: '축양의 돈은 어디로 가는가' },
  { key: 's07', title: '기업 - 기르는 회사와 사는 회사', question: '누가 소유하고 누가 사 가는가' },
  { key: 's08', title: '한국 - 지중해를 일본을 지나 산다', question: '한국은 무엇을 어디서 사는가' },
  { key: 's09', title: '축양사 - 누가 기르고 한국은 누구에게서 사나', question: '어느 농장이 어느 한국 회사에 파는가' },
];

const REPORT_STAGES = new Map(proseStages('tunafarm').map((stage) => [stage.key, stage]));

export const TUNAFARM_REPORT_NARRATIVES = TUNAFARM_STAGES.map(({ key, title, question }, index) => {
  const stage = REPORT_STAGES.get(key);
  if (!stage) throw new Error(`참치 양식 보고서에 ${key} 단계 서술이 없다`);
  return industryInlineReport('tunafarm', {
    ...stage,
    numeral: String(index + 1).padStart(2, '0'),
    title,
    question,
    paragraphs: stage.paragraphs.map(dropEmptyLabel),
    flow: stage.flow?.map((item) => item.kind === 'head' ? { ...item, text: dropEmptyLabel(item.text) } : item),
  }, {
    telemetry: REPORT_SYNC,
    source: '세계 참치 양식 조사',
    renderTable: (table) => <ReportTableView table={table} />,
  });
});

/** 리드(p.lead)가 없는 장(요지·Ⅲ·Ⅴ·Ⅷ)은 첫 문단·목록 줄을 리드로 쓴다. */
export const TUNAFARM_REPORT_BRIEFING = proseBriefing('tunafarm', { firstBlock: true });

const SPEC: CommoditySpec = {
  // 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다(2026-09-10 사용자 지시).
  continuous: true,
  key: 'tunafarm',
  reportHref: '/reports/industry/tunafarm-2026-10.html',
  title: '참치 양식',
  subtitle:
    '세계 참치 축양 해부 · 넣은 무게와 판 무게를 다른 기관이 센다 - 경계·층·명부·통계·값·원가·기업·한국·축양사',
  accent: TUNAFARM_ACCENT,
  primaryKpi: TUNAFARM_HERO_KPIS[0],
  secondaryKpis: TUNAFARM_HERO_KPIS.slice(1),
  stripItems: [
    // 히어로 띠도 원문 표지 값이다.
    { now: true, eyebrow: '상한', title: '입식 상한', body: '75,199.84 t (인가 명부 74곳 합계)' },
    { eyebrow: '쿼터', title: '동부 TAC', body: '48,403 t (2026~2028년)' },
    { eyebrow: '원가', title: '종묘 대 사료', body: '1.85 배 (2022년 EU 축양)' },
    { eyebrow: '자료', title: '본문·표', body: '세계 참치 양식 조사 제1보 2026-09-13' },
  ],
  briefing: TUNAFARM_REPORT_BRIEFING,
  narratives: TUNAFARM_REPORT_NARRATIVES,
  chartSlots: {},
  sourceNotes: [],
  sourceMeta: '본문·표 · 세계 참치 양식 조사 제1보 2026-09-13',
};

export interface TunafarmIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function TunafarmIndustryDashboard({ heroOnly = false }: TunafarmIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
