/**
 * 「시장 이해 > 참치 해부」 — 보고서 「한국 참치 산업 해부」 15절을 단계로 옮긴 페이지.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있고 여기는 이 품목만의 것 — 차트 배치와
 * 히어로 수치 — 만 정한다. 차트 제목은 서술이 낫표로 지목하는 이름이므로
 * 함부로 바꾸면 참조가 끊긴다(테스트가 잡는다).
 *
 * 기존 「참치」(세계 밸류체인 7단계)와는 다른 렌즈다. 그 페이지는 세계를, 이 페이지는 한국을 본다.
 */
'use client';

import React from 'react';

import { getTunaAnatomyData } from '@/lib/data/commodity-industry';
import { TUNA_ANATOMY_ACCENT } from '@/lib/tuna-anatomy-chart-colors';
import {
  TUNA_ANATOMY_BRIEFING_POINTS,
  TUNA_ANATOMY_NARRATIVES,
  TUNA_ANATOMY_SOURCE_NOTES,
} from '@/lib/tuna-anatomy-content';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';
import {
  TunaAnatomyBangkokChart,
  TunaAnatomyCanBrandChart,
  TunaAnatomyCanSplitChart,
  TunaAnatomyCompanyChart,
  TunaAnatomyCountryChart,
  TunaAnatomyExportChainChart,
  TunaAnatomyFcfChart,
  TunaAnatomyFinanceChart,
  TunaAnatomyFleetAgeChart,
  TunaAnatomyImportChainChart,
  TunaAnatomyPartnerChart,
  TunaAnatomyProductionChart,
  TunaAnatomyTransshipChart,
  TunaAnatomyUnitPriceChart,
  TunaAnatomyWorldChart,
} from './CommodityCharts';

const DATA = getTunaAnatomyData();

const FAO_SYNC = { status: 'STATIC' as const, syncDate: `${DATA.세계어획._meta.기준연도}년 확정` };
const OFIS_SYNC = { status: 'STATIC' as const, syncDate: '2026년 6월 월보' };
const KOSFA_SYNC = { status: 'STATIC' as const, syncDate: '2024·2025년 실적' };
const FLEET_SYNC = { status: 'STATIC' as const, syncDate: '2024년 말 명부' };
const KCS_SYNC = { status: 'STATIC' as const, syncDate: '2026년 7월 누계' };
const PNA_SYNC = { status: 'STATIC' as const, syncDate: '2025년 12월호' };
const DART_SYNC = { status: 'STATIC' as const, syncDate: '2025년 반기보고서' };
const MFDS_SYNC = { status: 'STATIC' as const, syncDate: '2025년분' };
const PRICE_SYNC = { status: 'STATIC' as const, syncDate: '2025년 11월 (방콕) · 2026년 6월 (월보)' };

const meta = DATA.세계어획._meta as Record<string, number>;
const tradeMeta = DATA.교역._meta as Record<string, number | string>;
const canMeta = DATA.캔._meta as Record<string, number>;
const shares = (DATA.선사._meta as Record<string, Record<string, number>>).선망점유2024;

export const TUNA_ANATOMY_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s02: [
    {
      title: '한국 참치 어획 1970~2024와 세계 점유 (톤·%)',
      caption: '막대가 한국 어획, 선이 세계 점유다. 1990년 선망이 자리 잡으며 20만 톤대로 올라섰고 2019년 370,208톤이 정점이다. 점유는 2010년 7.03%에서 2024년 5.63%로 내려왔다.',
      telemetry: FAO_SYNC,
      span: 'full',
      render: () => <TunaAnatomyWorldChart data={DATA} />,
    },
  ],
  s03: [
    {
      title: '2024년 세계 참치 어획 상위 12개국 (톤)',
      caption: '산호색이 한국이다. 인도네시아·에콰도르·일본·대만 다음 5위이고 일본과는 16,176톤 차이다. 연안국과 원양국이 섞여 있다.',
      telemetry: FAO_SYNC,
      span: 'full',
      render: () => <TunaAnatomyCountryChart data={DATA} />,
    },
  ],
  s04: [
    {
      title: '선망·연승 생산 2019~2025 (톤)',
      caption: '2025년 막대는 원양어업 생산동향 12월호 누계(예비치)다. 선망이 2019년 335,465톤에서 2025년 211,367톤으로 내려오는 동안 연승은 4만 톤 안팎이다.',
      telemetry: OFIS_SYNC,
      render: () => <TunaAnatomyProductionChart data={DATA} />,
    },
    {
      title: '선망 회사별 생산 2024·2025 (톤)',
      caption: '남청이 2024년, 산호가 2025년이다. 동원산업 50.0%·신라교역 26.7%·사조산업 16.9%(2024). 2025년에는 다섯 회사 모두 줄었고 사조산업이 32.7%로 가장 크게 줄었다.',
      telemetry: KOSFA_SYNC,
      render: () => <TunaAnatomyCompanyChart data={DATA} />,
    },
    {
      title: '선단 선령 분포 (척)',
      caption: '2026년 기준 선령. 선망 27척은 고르게 퍼져 있지만 연승 105척은 31~40년 구간에 몰려 있다. 2020년 이후 새로 지은 배는 없다.',
      telemetry: FLEET_SYNC,
      render: () => <TunaAnatomyFleetAgeChart data={DATA} />,
    },
  ],
  s06: [
    {
      title: 'PNA 수역 선망 환적 월별 2024~2025 (톤)',
      caption: '전 기국 합계다. 한국 기국만의 칸은 없다. 2024년 월 6만~9만 톤에서 2025년 5만~7만 톤으로 내려온 흐름이 한국 선망 어획이 29.9% 줄어든 해와 겹친다.',
      telemetry: PNA_SYNC,
      render: () => <TunaAnatomyTransshipChart data={DATA} />,
    },
    {
      title: '냉동 참치·필레·캔 수출 2019~2026 (톤)',
      caption: '냉동 통마리(남청)가 척추다. 2024년 199,711톤에서 2025년 135,754톤으로 32% 줄었다. 2026년은 1~7월 누계라 막대가 짧다.',
      telemetry: KCS_SYNC,
      render: () => <TunaAnatomyExportChainChart data={DATA} />,
    },
  ],
  s07: [
    {
      title: '냉동 참치 수출 상대국 2024·2025 (톤)',
      caption: '태국이 절반 넘게 가져간다. 2025년에 총량이 줄면서 태국 비중은 63.7%로 올랐다. 대만은 두 해 모두 0톤이다 — FCF 매입분은 방콕 인도로 태국행이 된다.',
      telemetry: KCS_SYNC,
      render: () => <TunaAnatomyPartnerChart data={DATA} />,
    },
    {
      title: '신라교역 FCF 매출과 비중 2019~2025 (억원·%)',
      caption: '옅은 막대가 연결 매출, 짙은 막대가 FCF(고객 A) 매출, 선이 비중이다. 2024년 46.3%가 가장 높고 2025년은 39.8%다.',
      telemetry: DART_SYNC,
      render: () => <TunaAnatomyFcfChart data={DATA} />,
    },
  ],
  s09: [
    {
      title: '참치 캔 브랜드별 생산 2022~2025 (톤)',
      caption: '식약처 생산실적을 품목명으로 브랜드에 귀속했다. 동원 막대에는 삼진물산·신진물산 위탁분이 들어 있다. 오뚜기의 2024년 급증은 원문 그대로이고 사유는 공개되지 않았다.',
      telemetry: MFDS_SYNC,
      span: 'full',
      render: () => <TunaAnatomyCanBrandChart data={DATA} />,
    },
  ],
  s10: [
    {
      title: '참치 수입 사슬별 2019~2026 (톤)',
      caption: '세 사슬을 합치지 않는다. 냉동 통마리는 2025년 10,083톤으로 두 배가 됐고, 캔·조제품은 2019년 1,366톤에서 2024년 6,831톤이 됐다. 2026년은 1~7월 누계.',
      telemetry: KCS_SYNC,
      render: () => <TunaAnatomyImportChainChart data={DATA} />,
    },
    {
      title: '캔·조제품 세번 분해 2022~2025 (톤)',
      caption: '1604.14를 10자리로 가르면 밀폐용기 캔보다 밀폐용기에 들지 않은 조제품(-9000)이 더 크다. 2024년 4,352톤 가운데 베트남산이 4,111톤 — 자숙 로인이다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2025년 연간 (10자리 스냅샷)' },
      render: () => <TunaAnatomyCanSplitChart data={DATA} />,
    },
  ],
  s12: [
    {
      title: '공시 10사 매출·영업이익 2024 (억원)',
      caption: '동원산업·동원F&B·오뚜기·사조대림은 연결 매출이 커서 축이 깨지므로 뺐다. 사조산업은 2024년 영업손실 94억원, 신라교역은 영업이익 164억원이다.',
      telemetry: DART_SYNC,
      span: 'full',
      render: () => <TunaAnatomyFinanceChart data={DATA} />,
    },
  ],
  s13: [
    {
      title: '방콕 가다랑어 월별 2024~2025 (달러/톤)',
      caption: 'Thai Union이 공시하는 방콕 양륙 원료가다. 2024년 8월 1,250달러가 저점, 2025년 3월 1,740달러가 고점이다. 2025년 12월 이후 월별 단일값은 공시되지 않는다.',
      telemetry: PRICE_SYNC,
      render: () => <TunaAnatomyBangkokChart data={DATA} />,
    },
    {
      title: '한국 선단 어종별 생산단가 2025~2026 (원/kg)',
      caption: '월보의 단가는 선사가 보고한 생산금액을 생산량으로 나눈 값이다. 가다랑어는 1,910~1,965원에 평평하고 눈다랑어는 5,356원에서 7,069원까지 움직인다.',
      telemetry: PRICE_SYNC,
      render: () => <TunaAnatomyUnitPriceChart data={DATA} />,
    },
  ],
};

const SPEC: CommoditySpec = {
  key: 'tuna-anatomy',
  title: '참치 해부',
  subtitle:
    '한국 참치 산업 해부 · 잡아서 남에게 파는 생선 — 원양 선단·환적·판매 상대·해외 가공·국내 캔·수입·값·제도 15단계',
  accent: TUNA_ANATOMY_ACCENT,
  primaryKpi: {
    label: '한국 참치 어획 (FAO 7종)',
    value: Number(meta.한국 ?? 0),
    unit: '(톤, 2024)',
    accent: TUNA_ANATOMY_ACCENT,
  },
  secondaryKpis: [
    { label: '세계 점유', value: Number(meta.한국비중 ?? 0), unit: '(%, 5위)', decimals: 2 },
    { label: '냉동 참치 수출', value: Number(tradeMeta.원어수출2024 ?? 0), unit: '(톤, 2024)' },
    { label: '국내 캔·조리 생산', value: Number(canMeta.캔2024 ?? 0), unit: '(톤, 2024)' },
  ],
  stripItems: [
    { now: true, eyebrow: '선단', title: '2024년 말', body: '132 척 (선망 27 · 연승 105)' },
    { eyebrow: '선망 점유', title: '2024 동원산업', body: `${shares?.동원산업 ?? 0}% (신라교역 ${shares?.신라교역 ?? 0}%)` },
    { eyebrow: '태국행', title: '냉동 참치 수출 중', body: `${String(tradeMeta.태국비중2024 ?? '')} · 대만 ${Number(tradeMeta.대만수출2024 ?? 0)} 톤` },
  ],
  briefing: TUNA_ANATOMY_BRIEFING_POINTS,
  narratives: TUNA_ANATOMY_NARRATIVES,
  chartSlots: TUNA_ANATOMY_CHART_SLOTS,
  sourceNotes: TUNA_ANATOMY_SOURCE_NOTES,
  sourceMeta: [
    `어획 · ${DATA.세계어획._meta.출처}`,
    `생산·선사 · ${DATA.한국생산._meta.출처} · ${DATA.선사._meta.출처}`,
    `통관 · ${DATA.교역._meta.출처}`,
    `캔 · ${DATA.캔._meta.출처}`,
    `값 · ${DATA.가격._meta.출처}`,
    `재무 · ${DATA.재무._meta.출처}`,
    `갱신 ${DATA._meta.생성일}`,
  ].join(' · '),
};

export interface TunaAnatomyDashboardProps {
  heroOnly?: boolean;
}

export default function TunaAnatomyDashboard({ heroOnly = false }: TunaAnatomyDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
