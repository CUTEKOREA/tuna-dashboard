/**
 * 「시장 이해 > 새우」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있다. 여기는 차트 배치와 히어로 수치만 정한다.
 */
'use client';

import React from 'react';
import Link from 'next/link';
import {
  TraderTable,
  CanneryCountryTable,
  BrandMarketTable,
} from './CompanyResearchTables';
import { getShrimpCompanyResearch } from '@/lib/data/valuechain-companies';

import { getShrimpIndustryData } from '@/lib/data/commodity-industry';
import { SHRIMP_ACCENT } from '@/lib/shrimp-chart-colors';
import {
  argentinaMeta,
  argentinaRoutes,
  PROCESSOR_TAB_MATCH,
} from '@/lib/data/shrimp-argentina';
import { seriesRoles } from '@/lib/data/shrimp-country-series';
import {
  SHRIMP_BRIEFING_POINTS,
  SHRIMP_NARRATIVES,
  SHRIMP_SOURCE_NOTES,
} from '@/lib/shrimp-industry-content';
import styles from './TunaIndustryDashboard.module.css';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';
import {
  ShrimpArgentinaCatchChart,
  ShrimpArgentinaKoreaChart,
  ShrimpArgentinaRouteChart,
  ShrimpSeriesUnitChart,
  ShrimpSeriesWindowsChart,
  ShrimpCountryChart,
  ShrimpEnvChart,
  ShrimpKoreaChart,
  ShrimpSpeciesChart,
  ShrimpTrendChart,
} from './CommodityCharts';

const DATA = getShrimpIndustryData();
const SYNC = { status: 'STATIC' as const, syncDate: `${DATA.요약.기준연도}년 확정` };

const SHRIMP_RESEARCH = getShrimpCompanyResearch();

const ARG_SYNC = { status: 'STATIC' as const, syncDate: '2026-08-12 조사' };

/**
 * 가공경로 표. 태국 공장 넷은 방콕사무소 「가공사 조사」 탭에 프로파일이 있다 —
 * 등기·캐파·인증·재무를 거기서 본다. 탭은 URL 주소가 없어 페이지까지만 링크하고
 * 어느 탭인지는 글로 밝힌다.
 */
function ArgentinaRouteTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>가공국</th>
            <th>공개 조회행</th>
            <th>확인된 해외제조업소</th>
            <th>이번 전략에서의 역할</th>
          </tr>
        </thead>
        <tbody>
          {argentinaRoutes.map((r) => (
            <tr key={r.국가}>
              <td>{r.국가}</td>
              <td>
                {r.건수.toLocaleString('ko-KR')}건
                {r.검증 === '미입증' && (
                  <span style={{ marginLeft: 6, opacity: 0.7 }}>- 이 자료에서 확인 없음</span>
                )}
              </td>
              <td>
                {r.공장.length === 0
                  ? '–'
                  : r.공장.map((f, i) => (
                      <span key={f}>
                        {i > 0 && ' · '}
                        {f}
                        {r.공장건수[i] !== undefined && ` ${r.공장건수[i]}건`}
                        {PROCESSOR_TAB_MATCH[f] && <sup title="방콕사무소 가공사 조사에 프로파일 있음">▪</sup>}
                      </span>
                    ))}
              </td>
              <td>{r.역할}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.factNote}>
        {argentinaMeta.recordCaveat} ▪ 표시한 공장은 방콕사무소 「가공사 조사」 탭에 등기·캐파·인증·재무
        프로파일이 있다 - <Link href="/bangkok-office">방콕사무소로 이동</Link>.
      </p>
    </div>
  );
}

const SERIES_SYNC = { status: 'STATIC' as const, syncDate: '관세청 2026년 1~6월' };

/** 시리즈 6개국 역할. 차트 없이 표로 그린다 — 서버 렌더에서 수치가 그대로 나와야 한다. */
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
        생산 톤은 FishStat 새우 필터 후 값이고, 수입 창구는 관세청 제품중량이다. 둘을 빼지 않는다.
        한–에콰도르 SECA 발효·양허는 미확인이다.
      </p>
    </div>
  );
}

export const SHRIMP_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s01: [
    {
      title: '양식과 자연산 75년 (톤·%)',
      caption:
        '호박색이 양식, 청록색이 자연산이다. 선은 양식 비중으로 2010년에 50%를 넘는다. 자연산 막대가 줄어든 것이 아니라 양식이 그 위에 쌓였다.',
      telemetry: SYNC,
      span: 'full',
      render: () => <ShrimpTrendChart data={DATA} />,
    },
    {
      title: '생산 방식별 규모 (톤)',
      caption:
        '「양식」 한 낱말을 갈랐다. 장미색이 담수 양식 - 강·논에서 기르는 민물새우다. 해산 새우 시장을 말할 때는 이 막대를 빼야 한다.',
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
      title: '공급 기업 - 누가 잡고 누가 파는가',
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
      // 차트는 상위 12개국만 그린다. 몇 나라가 잘렸는지는 그래프만 봐서는 알 수 없다.
    },
  ],
  s05: [
    {
      title: '한국 HS 030617 공급국 (톤·$/kg)',
      caption:
        '막대가 수입량, 선이 평균 신고단가다. 장미색이 아르헨티나 - 물량은 6위인데 단가는 가장 높은 축이다. 통관 신고 기준이라 위 생산 통계와 더할 수 없다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2026년 1~5월 관세청' },
      span: 'full',
      render: () => <ShrimpArgentinaKoreaChart />,
    },
    {
      title: '아르헨티나 어획·양륙 (톤)',
      caption:
        '회색 막대는 출처가 다르다 - 2018~2024는 FAO 어획, 2025는 아르헨티나 정부 양륙 집계다. 두 계열을 한 선으로 잇지 않은 이유다.',
      telemetry: ARG_SYNC,
      render: () => <ShrimpArgentinaCatchChart />,
    },
    {
      title: '가공경로 3국 공개기록 (건)',
      caption:
        '식약처 화면에 나타난 조회행 빈도이지 수입량이 아니다. 회색인 베트남 0건은 「없다」가 아니라 「이 자료에서 확인되지 않았다」이다.',
      telemetry: ARG_SYNC,
      render: () => <ShrimpArgentinaRouteChart />,
    },
    {
      title: '가공경로와 공장',
      caption:
        '태국은 공장을 고를 수 있고, 인도네시아는 한 공장에 몰려 있으며, 베트남은 이번 원료·목적국 조합이 아직 입증되지 않았다.',
      telemetry: ARG_SYNC,
      span: 'full',
      render: () => <ArgentinaRouteTable />,
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
        '장미색이 젓새우다. 세계에서 2.69%뿐인 종이 한국에서는 절반이다 - 새우젓이라는 소비 형태가 통계에 그대로 찍혔다.',
      telemetry: SYNC,
      render: () => <ShrimpKoreaChart data={DATA} />,
    },
  ],
  s06: [
    {
      title: '시리즈 6개국 역할',
      caption:
        '생산 순위와 수입 창구를 한 칸에 섞지 않았다. 같은 원산지라도 세번이 갈리면 창구가 다르다.',
      telemetry: { status: 'STATIC' as const, syncDate: 'FishStat 2024 · 관세청 2026년 1~6월' },
      span: 'full',
      render: () => <SeriesRolesTable />,
    },
    {
      title: '수입 창구 물량 (톤)',
      caption:
        '막대 둘은 세번이 다르다 - 청록이 030617 원물, 호박색이 160521 조제품이다. 베트남만 강조한 이유는 두 창구가 비슷한 무게이기 때문이다. 2026년 1~6월 제품중량이라 위 생산 통계·05단계 1~5월 표와 더할 수 없다.',
      telemetry: SERIES_SYNC,
      span: 'full',
      render: () => <ShrimpSeriesWindowsChart />,
    },
    {
      title: '수입 창구 단가 (달러/kg)',
      caption:
        'HS 030617 신고액÷중량만 그린다. 에콰도르 5.11이 가장 낮고 태국 12.12가 가장 높다. 조제품 단가와 섞지 않는다.',
      telemetry: SERIES_SYNC,
      render: () => <ShrimpSeriesUnitChart />,
    },
  ],
};

const SPEC: CommoditySpec = {
  key: 'shrimp',
  title: '새우',
  subtitle:
    '새우 산업 해부 · 양식이 이긴 유일한 주요 수산 품목 - 역전·종·산지·한국·수입 창구와 바스켓의 문제',
  accent: SHRIMP_ACCENT,
  primaryKpi: {
    label: '세계 새우 생산량',
    value: DATA.요약.세계생산,
    unit: '(톤)',
    accent: SHRIMP_ACCENT,
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
