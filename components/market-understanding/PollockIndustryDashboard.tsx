/**
 * 「시장 이해 > 명태」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있고 여기는 이 품목만의 것 — 차트 배치와
 * 히어로 수치 — 만 정한다. 차트 제목은 서술이 낫표로 지목하는 이름이므로
 * 함부로 바꾸면 참조가 끊긴다(테스트가 잡는다).
 */
'use client';

import React from 'react';

import { getPollockIndustryData } from '@/lib/data/commodity-industry';
import { POLLOCK_ACCENT } from '@/lib/pollock-chart-colors';
import {
  POLLOCK_BRIEFING_POINTS,
  POLLOCK_NARRATIVES,
  POLLOCK_SOURCE_NOTES,
} from '@/lib/pollock-industry-content';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';
import {
  PollockImportMixChart,
  PollockOriginChart,
  PollockProcessingChart,
  PollockQuotaChart,
  PollockStockChart,
  PollockWorldChart,
} from './CommodityCharts';

const DATA = getPollockIndustryData();

const FAO_SYNC = { status: 'STATIC' as const, syncDate: `${DATA.세계어획._meta.기준연도}년 확정` };
const QUOTA_SYNC = { status: 'STATIC' as const, syncDate: '2026년 1월 제35차' };
const IMPORT_SYNC = { status: 'STATIC' as const, syncDate: String(DATA.수입세번._meta.구간 ?? '통관 실적') };
const MFDS_SYNC = { status: 'STATIC' as const, syncDate: `${DATA.가공품목._meta.기준연도}년분` };
const STOCK_SYNC = { status: 'STATIC' as const, syncDate: String(DATA.재고._meta.구간 ?? '월보') };

const latestImport = DATA.수입세번.rows.find((r) => r.연도 === 2025) ?? DATA.수입세번.rows[0];
const russia = DATA.수입원산지.rows[0];
const quota2026 = DATA.원양할당.rows.find((r) => r.연도 === 2026);
const lastStock = DATA.재고.rows[DATA.재고.rows.length - 1];

export const POLLOCK_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s01: [
    {
      title: '세계 명태 어획 1986~2024 (톤)',
      caption:
        '1986년 6,758,944톤이 정점이고 2000년 2,929,654톤이 바닥이다. 러시아와 미국 두 줄이 세계의 93.8%이고 한국 선은 바닥에 붙어 있다.',
      telemetry: FAO_SYNC,
      span: 'full',
      render: () => <PollockWorldChart data={DATA} />,
    },
  ],
  s02: [
    {
      title: '한·러 명태 할당과 어획 2020~2026 (톤·달러/톤)',
      caption:
        '옅은 막대가 할당, 짙은 막대가 어획이다. 2022년을 빼면 붙어 있다. 2026년 막대는 1~6월 누계라 짧다. 선은 입어료다.',
      telemetry: QUOTA_SYNC,
      span: 'full',
      render: () => <PollockQuotaChart data={DATA} />,
    },
  ],
  s03: [
    {
      title: '전용 세번별 수입 물량 2023~2026 (톤)',
      caption:
        '동태(장미)가 줄고 연육(호박)이 는다. 2026년은 1~7월 누계라 막대가 짧다.',
      telemetry: IMPORT_SYNC,
      render: () => <PollockImportMixChart data={DATA} />,
    },
    {
      title: '수입 원산지 구성 2025 (%)',
      caption: '장미색이 러시아다. 미국을 더하면 95.1%이고 나머지를 다 합쳐도 5%가 안 된다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2025년 통관' },
      render: () => <PollockOriginChart data={DATA} />,
    },
  ],
  s04: [
    {
      title: '가공 품목별 생산량 2023~2025 (톤)',
      caption:
        '명란젓 2024년 막대가 튀는 것은 한 업체의 8,869톤 신고다. 연육 막대가 작은 것은 국내 생산이 아니라 수입이 공급의 97.4%라서다.',
      telemetry: MFDS_SYNC,
      span: 'full',
      render: () => <PollockProcessingChart data={DATA} />,
    },
  ],
  s05: [
    {
      title: '월말 재고와 월 수입 2022-12~2026-07 (톤)',
      caption:
        '선이 월말 재고, 막대가 월 수입이다. 2026년 6~7월에 둘이 함께 꺼진다. 재고와 도매가의 동시 상관은 0.12다.',
      telemetry: STOCK_SYNC,
      span: 'full',
      render: () => <PollockStockChart data={DATA} />,
    },
  ],
};

const SPEC: CommoditySpec = {
  key: 'pollock',
  title: '명태',
  subtitle:
    '명태 산업 해부 · 잡지 않고 먹는 생선 - 자원·원양 할당·수입 구성·가공·값과 재고 5단계와 그것을 관통하는 세 장부의 문제',
  accent: POLLOCK_ACCENT,
  primaryKpi: {
    label: '명태 전용 세번 수입액',
    value: Number(latestImport?.합계금액 ?? 0),
    unit: '(백만 달러)',
    decimals: 1,
    accent: POLLOCK_ACCENT,
  },
  secondaryKpis: [
    { label: '러시아 비중', value: Number(russia?.비중 ?? 0), unit: '(%)', decimals: 1 },
    { label: '2026년 한·러 할당', value: Number(quota2026?.할당 ?? 0), unit: '(톤)' },
    { label: '7월 말 재고', value: Number(lastStock?.재고 ?? 0), unit: '(톤)' },
  ],
  stripItems: [
    { now: true, eyebrow: '기준', title: '2025 수입 물량', body: `${Number(latestImport?.합계물량 ?? 0).toLocaleString('ko-KR')} (톤)` },
    { eyebrow: '원양', title: '북양트롤', body: `${DATA.원양할당._meta.북양트롤} 척` },
    { eyebrow: '가공', title: '2025 생산', body: `${Number((DATA.가공품목._meta.합계 as Record<string, number>)['2025'] ?? 0).toLocaleString('ko-KR')} (톤)` },
  ],
  briefing: POLLOCK_BRIEFING_POINTS,
  narratives: POLLOCK_NARRATIVES,
  chartSlots: POLLOCK_CHART_SLOTS,
  sourceNotes: POLLOCK_SOURCE_NOTES,
  sourceMeta: [
    `어획 · ${DATA.세계어획._meta.출처}`,
    `할당 · ${DATA.원양할당._meta.출처}`,
    `통관 · ${DATA.수입세번._meta.출처} · ${DATA.수입세번._meta.구간}`,
    `가공 · ${DATA.가공품목._meta.출처}`,
    `재고 · ${DATA.재고._meta.출처}`,
    `갱신 ${DATA._meta.생성일}`,
  ].join(' · '),
};

export interface PollockIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function PollockIndustryDashboard({
  heroOnly = false,
}: PollockIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
