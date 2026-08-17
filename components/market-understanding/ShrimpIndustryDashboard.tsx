/**
 * 「시장 이해 > 새우」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있다. 여기는 차트 배치와 히어로 수치만 정한다.
 */
'use client';

import React from 'react';
import {
  TraderTable,
  CanneryCountryTable,
  BrandMarketTable,
} from './CompanyResearchTables';
import { getShrimpCompanyResearch } from '@/lib/data/valuechain-companies';

import { getShrimpIndustryData } from '@/lib/data/commodity-industry';
import {
  SHRIMP_BRIEFING_POINTS,
  SHRIMP_NARRATIVES,
  SHRIMP_SOURCE_NOTES,
} from '@/lib/shrimp-industry-content';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';
import {
  ShrimpCountryChart,
  ShrimpEnvChart,
  ShrimpKoreaChart,
  ShrimpSpeciesChart,
  ShrimpTrendChart,
} from './CommodityCharts';

const DATA = getShrimpIndustryData();
const SYNC = { status: 'STATIC' as const, syncDate: `${DATA.요약.기준연도}년 확정` };

const SHRIMP_RESEARCH = getShrimpCompanyResearch();

export const SHRIMP_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s01: [
    {
      title: '양식과 자연산 75년 (톤·%)',
      caption:
        '연두색이 양식, 청록색이 자연산이다. 선은 양식 비중으로 2010년에 50%를 넘는다. 자연산 막대가 줄어든 것이 아니라 양식이 그 위에 쌓였다.',
      telemetry: SYNC,
      span: 'full',
      render: () => <ShrimpTrendChart data={DATA} />,
    },
    {
      title: '생산 방식별 규모 (톤)',
      caption:
        '「양식」 한 낱말을 갈랐다. 장미색이 담수 양식 — 강·논에서 기르는 민물새우다. 해산 새우 시장을 말할 때는 이 막대를 빼야 한다.',
      telemetry: SYNC,
      render: () => <ShrimpEnvChart data={DATA} />,
    },
  ],
  s02: [
    {
      title: '종별 생산량 (톤)',
      caption: '장미색이 흰다리새우다. 1위 하나가 나머지 여덟을 합친 것보다 크다.',
      telemetry: SYNC,
      render: () => <ShrimpSpeciesChart data={DATA} />,
    },
  ],
  s03: [
    {
      title: '공급 기업 — 누가 잡고 누가 파는가',
      caption: SHRIMP_RESEARCH.공급.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <TraderTable rows={SHRIMP_RESEARCH.공급.rows} />,
    },
    {
      title: '국가별 가공 거점과 기업',
      caption: SHRIMP_RESEARCH.가공.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <CanneryCountryTable rows={SHRIMP_RESEARCH.가공.rows} />,
    },
    {
      title: '국가별 생산과 양식 비중 (톤·%)',
      caption:
        '막대 높이는 규모, 색 구성은 양식과 자연산의 비율, 선은 양식 비중이다. 선이 바닥에 붙은 나라와 천장에 붙은 나라는 사는 물건이 다르다.',
      telemetry: SYNC,
      render: () => <ShrimpCountryChart data={DATA} />,
    },
  ],
  s04: [
    {
      title: '브랜드와 점유율 (성격 구분)',
      caption: SHRIMP_RESEARCH.브랜드.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <BrandMarketTable rows={SHRIMP_RESEARCH.브랜드.rows} />,
    },
    {
      title: '한국 종별 생산량 (톤)',
      caption:
        '장미색이 젓새우다. 세계에서 2.69%뿐인 종이 한국에서는 절반이다 — 새우젓이라는 소비 형태가 통계에 그대로 찍혔다.',
      telemetry: SYNC,
      render: () => <ShrimpKoreaChart data={DATA} />,
    },
  ],
};

const SPEC: CommoditySpec = {
  key: 'shrimp',
  title: '새우',
  subtitle:
    '새우 산업 해부 · 양식이 이긴 유일한 주요 수산 품목 — 역전·종·산지·한국 4단계와 「새우」라는 바스켓의 문제',
  accent: '#0d9488',
  primaryKpi: {
    label: '세계 새우 생산량',
    value: DATA.요약.세계생산,
    unit: '(톤)',
    accent: '#0d9488',
  },
  secondaryKpis: [
    { label: '양식 비중', value: DATA.요약.양식비중, unit: '(%)', decimals: 1 },
    { label: '흰다리새우 비중', value: DATA.요약.최대종비중, unit: '(%)', decimals: 2 },
    { label: '한국 양식 비중', value: DATA.요약.한국양식비중 ?? 0, unit: '(%)', decimals: 1 },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '기준',
      title: '세계 생산량',
      body: `${DATA.요약.세계생산.toLocaleString('ko-KR')} (톤)`,
    },
    {
      eyebrow: '역전',
      title: '양식 비중',
      body: `${DATA.요약.양식비중} (%)`,
    },
    {
      eyebrow: '한국',
      title: '양식 비중',
      body: `${DATA.요약.한국양식비중 ?? 0} (%)`,
    },
  ],
  briefing: SHRIMP_BRIEFING_POINTS,
  narratives: SHRIMP_NARRATIVES,
  chartSlots: SHRIMP_CHART_SLOTS,
  sourceNotes: SHRIMP_SOURCE_NOTES,
  sourceMeta: [
    `생산 집계 · ${DATA._meta.출처} · 기준 ${DATA._meta.기준연도}년`,
    `단위 ${DATA._meta.단위}`,
    `갱신 ${DATA._meta.생성일}`,
  ].join(' · '),
};

export interface ShrimpIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function ShrimpIndustryDashboard({
  heroOnly = false,
}: ShrimpIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
