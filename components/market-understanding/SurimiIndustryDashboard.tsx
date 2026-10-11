/**
 * 「시장 이해 > 연육」.
 *
 * 다른 품목과 달리 손으로 만든 위젯·차트가 없다. 서술·표·그림은 전부 해부보고서
 * 원문(`docs/evidence/industry-surimi-2026-10/보고서.html`)에서 추출한 것이고,
 * 여기서 손으로 정하는 것은 단계 제목·질문과 히어로 수치(원문 표지 리터럴)뿐이다.
 */
'use client';

import React from 'react';

import { proseBriefing, proseStages } from '@/lib/company-prose-stages';
import type { ReportTable as IntakeReportTable } from '@/lib/data/company-report-tables';
import type { HeroKpi } from '../v2/HeroZone';
import { dropEmptyLabel, industryInlineReport } from './IndustryReportFlow';
import styles from './TunaIndustryDashboard.module.css';
import CommodityIndustryDashboard, { type CommoditySpec } from './CommodityIndustryDashboard';

export const SURIMI_ACCENT = '#0e7490';

const REPORT_SYNC = { status: 'STATIC' as const, syncDate: '보고서 2026년 10월판' };

/**
 * 히어로 수치는 해부보고서 표지 값이다(01·03·05·08절과 같다). 렌더 테스트가
 * 원문 HTML 텍스트에 그대로 있는지 대조한다.
 */
export const SURIMI_HERO_KPIS: HeroKpi[] = [
  { label: '2025 연육 수입', value: 136001, unit: '(톤)', accent: SURIMI_ACCENT },
  { label: '수입 단가', value: 1.81, unit: '(달러/kg)', decimals: 2 },
  { label: '국내 연육 생산', value: 2304, unit: '(톤)' },
  { label: '2025 어묵 생산', value: 230280, unit: '(톤)' },
];

/**
 * 단계 순서·제목·질문(손 작성). 서술은 전부 원문에서 온다.
 * 절 → 단계 매핑은 `scripts/build_report_tables.py` SPECS.surimi 에 있다.
 */
export const SURIMI_STAGES: Array<{ key: string; title: string; question: string }> = [
  { key: 's01', title: '공급 - 수입이 98.3%를 채운다', question: '어묵 원료인 연육은 왜 수입으로 채워지고, 국내에서는 얼마나 만드는가' },
  { key: 's02', title: '수입 - 미국·러시아의 명태, 베트남·중국의 기타 연육', question: '한국은 연육을 어디서 얼마에 들여오는가' },
  { key: 's03', title: '명의 - 126개 명의, 신고 6,421건', question: '누가 어느 나라의 어떤 어종으로 만든 연육을 신고해 들여오는가' },
  { key: 's04', title: '어묵 - 한 해 23만 톤, 부산이 절반 가까이', question: '연육은 어묵이 되어 어디서 얼마나 나오는가' },
  { key: 's05', title: '명부 - 상위 10곳이 58.2%', question: '어묵 상위는 누구이고, 연육 수입 명의와 어디서 겹치는가' },
  { key: 's06', title: '재무 - 공시가 가르지 않는 어묵 매출', question: '어묵으로 돈은 어디에 남고, 공시는 어디까지 보이는가' },
  { key: 's07', title: '값 - 통관가에서 어묵 물가까지', question: '연육 1킬로그램의 값은 어묵 물가로 어떻게 이어지는가' },
  { key: 'x01', title: '제도 - 네 장부가 연육과 어묵을 다르게 센다', question: '관세청·식약처·해수부는 연육과 어묵을 어떻게 세고, 무엇을 남기는가' },
];

/** 발행본 표를 그대로 그린다. 숫자는 문자열 그대로이고 재계산하지 않는다. */
function ReportTable({ table }: { table: IntakeReportTable }) {
  return (
    <div className={styles.dataTableWrap} tabIndex={0} role="region" aria-label="표 (가로 스크롤)">
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {table.head.map((h, i) => (
              <th key={i} style={table.num[i] ? { textAlign: 'right' } : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} style={table.num[j] ? { textAlign: 'right' } : undefined}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const REPORT_STAGES = new Map(proseStages('surimi').map((stage) => [stage.key, stage]));

export const SURIMI_REPORT_NARRATIVES = SURIMI_STAGES.map(({ key, title, question }, index) => {
  const stage = REPORT_STAGES.get(key);
  if (!stage) throw new Error(`연육 보고서에 ${key} 단계 서술이 없다`);
  return industryInlineReport('surimi', {
    ...stage,
    numeral: String(index + 1).padStart(2, '0'),
    title,
    question,
    paragraphs: stage.paragraphs.map(dropEmptyLabel),
    flow: stage.flow?.map((item) => item.kind === 'head' ? { ...item, text: dropEmptyLabel(item.text) } : item),
  }, {
    telemetry: REPORT_SYNC,
    source: '한국 연육 산업 해부',
    renderTable: (table) => <ReportTable table={table} />,
  });
});

export const SURIMI_REPORT_BRIEFING = proseBriefing('surimi');

const SPEC: CommoditySpec = {
  continuous: true,
  key: 'surimi',
  reportHref: '/reports/industry/surimi-2026-10.html',
  title: '연육',
  subtitle:
    '연육 산업 해부 · 수입 원료에서 어묵 공장까지 - 공급·수입·명의·어묵·명부·재무·값, 네 장부의 문제',
  accent: SURIMI_ACCENT,
  primaryKpi: SURIMI_HERO_KPIS[0],
  secondaryKpis: SURIMI_HERO_KPIS.slice(1),
  stripItems: [
    // 히어로 띠도 원문 표지 값이다.
    { now: true, eyebrow: '기준', title: '명태 연육 비중', body: '24.4% (연육 수입 물량 중 · 2025)' },
    { eyebrow: '명의', title: '연육 수입 명의', body: '126 (신고 6,421건)' },
    { eyebrow: '어묵', title: '어묵 상위 10곳', body: '58.2%' },
    { eyebrow: '자료', title: '본문·표', body: '해부보고서 2026년 10월판' },
  ],
  briefing: SURIMI_REPORT_BRIEFING,
  narratives: SURIMI_REPORT_NARRATIVES,
  chartSlots: {},
  sourceNotes: [],
  sourceMeta: '본문·표·그림 · 한국 연육 산업 해부 2026년 10월판',
};

export interface SurimiIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function SurimiIndustryDashboard({ heroOnly = false }: SurimiIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
