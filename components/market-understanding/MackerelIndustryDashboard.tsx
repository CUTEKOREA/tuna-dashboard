/**
 * 「시장 이해 > 고등어」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있고 여기는 이 품목만의 것 — 차트 배치와
 * 히어로 수치 — 만 정한다. 차트 제목은 서술이 낫표로 지목하는 이름이므로
 * 함부로 바꾸면 참조가 끊긴다(테스트가 잡는다).
 */
'use client';

import React from 'react';
import {
  TraderTable,
  CanneryCountryTable,
  BrandMarketTable,
} from './CompanyResearchTables';
import { getMackerelCompanyResearch } from '@/lib/data/valuechain-companies';

import { getMackerelIndustryData } from '@/lib/data/commodity-industry';
import { seriesRoles, seriesUnits, seriesWindows } from '@/lib/data/mackerel-country-series';
import {
  MACKEREL_BRIEFING_POINTS,
  MACKEREL_NARRATIVES,
  MACKEREL_SOURCE_NOTES,
} from '@/lib/mackerel-industry-content';
import { SeriesStats } from './CockpitExtra';
import styles from './TunaIndustryDashboard.module.css';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';
import {
  MackerelCatchChart,
  MackerelGradeChart,
  MackerelOriginChart,
  MackerelSeriesUnitChart,
  MackerelSeriesWindowsChart,
} from './CommodityCharts';

const DATA = getMackerelIndustryData();
const CATCH_SYNC = {
  status: 'STATIC' as const,
  syncDate: `${DATA.한국어획._meta.기준연도}년 확정`,
};
const WIPAN_SYNC = {
  status: 'STATIC' as const,
  syncDate: String(DATA.위판등급._meta.구간 ?? '위판 실적'),
};
const IMPORT_SYNC = {
  status: 'STATIC' as const,
  syncDate: String(DATA.수입원산지._meta.구간 ?? '통관 실적'),
};

const MACKEREL_RESEARCH = getMackerelCompanyResearch();

const SERIES_SYNC = { status: 'STATIC' as const, syncDate: '관세청 2026년 1~7월' };

function SeriesRolesTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>국가</th>
            <th>역할</th>
            <th>한국 창구</th>
            <th>근거</th>
          </tr>
        </thead>
        <tbody>
          {seriesRoles.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td>{r.role}</td>
              <td>{r.korea}</td>
              <td>{r.scope}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.factNote}>
        생산 톤은 FishStat 고등어속이고, 수입 창구는 관세청 제품중량이다. 둘을 빼지 않는다.
        030354 품명에 세 종이 들어 있다.
      </p>
    </div>
  );
}

export const MACKEREL_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s01: [
    {
      title: '한국 고등어 어획량 30년 (톤)',
      caption:
        '1996년 415,003톤이 정점, 2020년 77,605톤이 바닥이다. 망치고등어 선이 2017년에 0으로 떨어지는 것은 어획이 멈춰서가 아니라 보고가 합쳐져서다.',
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <MackerelCatchChart data={DATA} />,
    },
  ],
  s03: [
    {
      title: '국가별 가공 거점과 기업',
      caption: MACKEREL_RESEARCH.가공.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <CanneryCountryTable rows={MACKEREL_RESEARCH.가공.rows} />,
    },
    {
      title: '브랜드와 점유율 (성격 구분)',
      caption: MACKEREL_RESEARCH.브랜드.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <BrandMarketTable rows={MACKEREL_RESEARCH.브랜드.rows} />,
    },
    {
      title: '위판 등급별 물량과 단가 (kg·원/kg)',
      caption:
        '막대는 물량, 선은 물량가중 평균단가다. 단가가 가장 높은 등급의 막대가 가장 낮다는 것이 이 그림의 요지다.',
      telemetry: WIPAN_SYNC,
      render: () => <MackerelGradeChart data={DATA} />,
      cockpitExtra: () => (
        <SeriesStats rows={DATA.위판등급.rows} labelKey="등급" valueKey="물량" unit="(톤)" sum />
      ),
    },
  ],
  s04: [
    {
      title: '공급 기업 — 누가 잡고 누가 파는가',
      caption: MACKEREL_RESEARCH.공급.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <TraderTable rows={MACKEREL_RESEARCH.공급.rows} />,
    },
    {
      title: '수입 원산지 구성 (%)',
      caption:
        '장미색이 노르웨이다. 나머지를 다 합쳐도 노르웨이 하나에 못 미친다.',
      telemetry: IMPORT_SYNC,
      render: () => <MackerelOriginChart data={DATA} />,
      // 단가는 합계가 뜻이 없다. 물량만 더한다.
      cockpitExtra: () => (
        <SeriesStats rows={DATA.수입원산지.rows} labelKey="원산지" valueKey="수입량" unit="(톤)" sum />
      ),
    },
  ],
  s05: [
    {
      title: '시리즈 6개국 역할',
      caption:
        '생산 순위와 수입 창구를 한 칸에 섞지 않았다. 어획 1위 중국과 창구 1위 노르웨이는 종이 다르다.',
      telemetry: { status: 'STATIC' as const, syncDate: 'FishStat 2024 · 관세청 2026년 1~7월' },
      span: 'full',
      render: () => <SeriesRolesTable />,
    },
    {
      title: '수입 창구 물량 (톤)',
      caption:
        '청록이 030354 냉동, 호박색이 0304895000 필렛이다. 노르웨이만 강조한 이유는 두 창구가 같이 크기 때문이다. 아이슬란드 0은 어획이 없다는 뜻이 아니라 이 세번 추출에 이름이 없다는 뜻이다. 2026년 1~7월 제품중량이라 위 생산 통계·04단계 1~5월 표와 더할 수 없다.',
      telemetry: SERIES_SYNC,
      render: () => <MackerelSeriesWindowsChart />,
      cockpitExtra: () => (
        <SeriesStats rows={seriesWindows} labelKey="국가" valueKey="냉동" unit="(톤)" sum />
      ),
    },
    {
      title: '수입 창구 단가 (달러/톤)',
      caption:
        'HS 030354 신고액÷중량만 그린다. 영국 5,375이 가장 높고 일본 662이 가장 낮다. 아이슬란드 단가를 0으로 만들지 않는다. 필렛 단가와 섞지 않는다.',
      telemetry: SERIES_SYNC,
      render: () => <MackerelSeriesUnitChart />,
      cockpitExtra: () => (
        <SeriesStats rows={seriesUnits} labelKey="국가" valueKey="단가" unit="(달러/톤)" />
      ),
    },
  ],
  x01: [
    {
      title: '종별 보고량 추이 — 망치고등어가 사라진 자리 (톤)',
      caption:
        '01단계와 같은 자료를 종에 초점을 두고 다시 본다. 2016년 22,244톤이던 망치고등어가 이듬해 0이 되고 그대로 유지된다 — 부산 위판장에는 계속 올라오는데도 그렇다.',
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <MackerelCatchChart data={DATA} />,
    },
  ],
};

const SPEC: CommoditySpec = {
  key: 'mackerel',
  title: '고등어',
  subtitle:
    '고등어 산업 해부 · 어법이 축이 아닌 품목 — 크기 등급·원산지·수입 창구 5단계와 그것을 관통하는 종의 문제',
  accent: '#0e7490',
  primaryKpi: {
    label: '한국 고등어속 어획량',
    value: Number(DATA.한국어획._meta.합계 ?? 0),
    unit: '(톤)',
    accent: '#0e7490',
  },
  secondaryKpis: [
    {
      label: '연근해 비중',
      value: 100 - Number(DATA.한국어획._meta.원양비중 ?? 0),
      unit: '(%)',
      decimals: 2,
    },
    {
      label: '최하 등급 물량 비중',
      value: DATA.위판등급.rows[0]?.비중 ?? 0,
      unit: '(%)',
      decimals: 2,
    },
    {
      label: '노르웨이 수입 비중',
      value: DATA.수입원산지.rows[0]?.비중 ?? 0,
      unit: '(%)',
      decimals: 2,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '기준',
      title: '한국 어획량',
      body: `${Number(DATA.한국어획._meta.합계 ?? 0).toLocaleString('ko-KR')} (톤)`,
    },
    {
      eyebrow: '위판',
      title: '상·하 단가차',
      body: `${(
        (DATA.위판등급.rows.find((r) => r.등급.includes('상'))?.가중평균단가 ?? 0) /
        (DATA.위판등급.rows.find((r) => r.등급.includes('하'))?.가중평균단가 ?? 1)
      ).toFixed(1)} 배`,
    },
    {
      eyebrow: '수입',
      title: '노르웨이 비중',
      body: `${DATA.수입원산지.rows[0]?.비중 ?? 0} (%)`,
    },
  ],
  briefing: MACKEREL_BRIEFING_POINTS,
  narratives: MACKEREL_NARRATIVES,
  chartSlots: MACKEREL_CHART_SLOTS,
  sourceNotes: MACKEREL_SOURCE_NOTES,
  sourceMeta: [
    `어획 집계 · ${DATA.한국어획._meta.출처}`,
    `위판 집계 · ${DATA.위판등급._meta.출처}`,
    `통관 집계 · ${DATA.수입원산지._meta.출처} · ${DATA.수입원산지._meta.구간}`,
    `갱신 ${DATA._meta.생성일}`,
  ].join(' · '),
};

export interface MackerelIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function MackerelIndustryDashboard({
  heroOnly = false,
}: MackerelIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
