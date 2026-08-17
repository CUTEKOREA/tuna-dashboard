/**
 * 「시장 이해 > 골뱅이」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있다. 여기는 차트 배치와 히어로 수치만 정한다.
 *
 * ⚠ 히어로의 주 수치를 「세계 골뱅이 생산량」이라 부르지 않는다. 네 개 과(科)를 더한 값이고,
 *   아카이브 원본이 그 이름으로 부르는 것을 금지했다. 라벨은 「다섯 과(科) 합계」로 둔다.
 */
'use client';

import React from 'react';
import {
  TraderTable,
  CanneryCountryTable,
  BrandMarketTable,
} from './CompanyResearchTables';
import { getWhelkCompanyResearch } from '@/lib/data/valuechain-companies';

import { getWhelkIndustryData } from '@/lib/data/commodity-industry';
import {
  WHELK_BRIEFING_POINTS,
  WHELK_NARRATIVES,
  WHELK_SOURCE_NOTES,
} from '@/lib/whelk-industry-content';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';
import {
  WhelkBuccinumChart,
  WhelkGroupChart,
  WhelkImportChart,
  WhelkKoreaSeriesChart,
} from './CommodityCharts';

const DATA = getWhelkIndustryData();
const FAO_SYNC = { status: 'STATIC' as const, syncDate: `${DATA.요약.기준연도}년 확정` };
const KCS_SYNC = {
  status: 'STATIC' as const,
  syncDate: `${DATA.한국수입._meta.기준연도}년 확정`,
};
const KOSIS_SYNC = { status: 'STATIC' as const, syncDate: '2025년까지' };

const WHELK_RESEARCH = getWhelkCompanyResearch();

export const WHELK_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s01: [
    {
      title: '과(科)별 생산량 (톤)',
      caption:
        '호박색이 양식, 나머지가 어획이다. 노란 막대가 참골뱅이류 — 한국이 통조림으로 먹는 그 종이고, 양식이 0이라 막대 전체가 자연산이다.',
      telemetry: FAO_SYNC,
      render: () => <WhelkGroupChart data={DATA} />,
    },
  ],
  s02: [
    {
      title: '공급 기업 — 누가 잡고 누가 파는가',
      caption: WHELK_RESEARCH.공급.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      render: () => <TraderTable rows={WHELK_RESEARCH.공급.rows} />,
    },
    {
      title: '참골뱅이 어획 상위국 (톤)',
      caption: '열 나라를 다 세워도 한국은 나오지 않는다. 어획량이 0이기 때문이다.',
      telemetry: FAO_SYNC,
      render: () => <WhelkBuccinumChart data={DATA} />,
    },
  ],
  s03: [
    {
      title: '국내 생산 통계 — 코드가 바뀐 자리 (톤)',
      caption:
        '두 선이 2009년과 2010년 사이에서 끊긴다. 통계 코드가 바뀐 자리라 잇지 않았다. 점선인 소라는 다른 종이므로 합산 대상이 아니다.',
      telemetry: KOSIS_SYNC,
      render: () => <WhelkKoreaSeriesChart data={DATA} />,
    },
  ],
  s04: [
    {
      title: '국가별 가공 거점과 기업',
      caption: WHELK_RESEARCH.가공.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      render: () => <CanneryCountryTable rows={WHELK_RESEARCH.가공.rows} />,
    },
    {
      title: '브랜드와 점유율 (성격 구분)',
      caption: WHELK_RESEARCH.브랜드.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      render: () => <BrandMarketTable rows={WHELK_RESEARCH.브랜드.rows} />,
    },
    {
      title: '한국 수입 상대국별 규모와 단가 (백만 달러·달러/톤)',
      caption:
        '막대는 수입액, 선은 톤당 단가다. 단가가 3~5배 벌어지는 것은 같은 코드 안에 다른 종이 들어 있다는 신호다.',
      telemetry: KCS_SYNC,
      render: () => <WhelkImportChart data={DATA} />,
    },
  ],
};

const UK_IMPORT = DATA.한국수입.rows.find((row) => row.국가 === '영국');
const IMPORT_TOTAL = DATA.한국수입.rows.reduce((sum, row) => sum + row.수입액, 0);

const SPEC: CommoditySpec = {
  key: 'whelk',
  title: '골뱅이',
  subtitle:
    '골뱅이 산업 해부 · 한 이름에 네 개 과(科)가 섞인 품목 — 종·원물·국내 생산·교역 4단계와 이름 자체의 문제',
  accent: '#b45309',
  primaryKpi: {
    label: '다섯 과(科) 합계 생산량',
    value: DATA.요약.세계생산합계,
    unit: '(톤)',
    accent: '#b45309',
  },
  secondaryKpis: [
    { label: '피뿔고둥류 비중', value: DATA.요약.최대그룹비중, unit: '(%)', decimals: 2 },
    { label: '참골뱅이류 비중', value: DATA.요약.참골뱅이비중, unit: '(%)', decimals: 2 },
    { label: '한국 참골뱅이 어획', value: DATA.요약.한국참골뱅이어획, unit: '(톤)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '기준',
      title: '다섯 과 합계',
      body: `${DATA.요약.세계생산합계.toLocaleString('ko-KR')} (톤)`,
    },
    {
      eyebrow: '종',
      title: '참골뱅이 몫',
      body: `${DATA.요약.참골뱅이비중} (%)`,
    },
    {
      eyebrow: '수입',
      title: '영국 비중',
      body: `${(((UK_IMPORT?.수입액 ?? 0) / (IMPORT_TOTAL || 1)) * 100).toFixed(1)} (%)`,
    },
  ],
  briefing: WHELK_BRIEFING_POINTS,
  narratives: WHELK_NARRATIVES,
  chartSlots: WHELK_CHART_SLOTS,
  sourceNotes: WHELK_SOURCE_NOTES,
  sourceMeta: [
    `생산 집계 · ${DATA._meta.출처} · 기준 ${DATA._meta.기준연도}년`,
    `통관 집계 · ${DATA.한국수입._meta.출처}`,
    `국내 생산 · ${DATA.한국생산._meta.출처}`,
    `갱신 ${DATA._meta.생성일}`,
  ].join(' · '),
};

export interface WhelkIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function WhelkIndustryDashboard({
  heroOnly = false,
}: WhelkIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
