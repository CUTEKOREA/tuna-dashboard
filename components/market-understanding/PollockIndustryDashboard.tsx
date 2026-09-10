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
import { getPollockCompanyResearch } from '@/lib/data/pollock-company-research';
import { POLLOCK_ACCENT } from '@/lib/pollock-chart-colors';
import {
  POLLOCK_BRIEFING_POINTS,
  POLLOCK_NARRATIVES,
  POLLOCK_SOURCE_NOTES,
} from '@/lib/pollock-industry-content';
import styles from './TunaIndustryDashboard.module.css';
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

const RESEARCH = getPollockCompanyResearch();

function RosterTable({
  caption,
  rows,
  sizeLabel,
}: {
  caption: string;
  rows: Array<{ 회사: string; 위치: string; 규모: string; 내용: string; 성격: string; 출처: string }>;
  sizeLabel: string;
}) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>{caption}</caption>
        <thead>
          <tr>
            <th>회사</th>
            <th>위치</th>
            <th>{sizeLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.회사}>
              <td>
                {r.회사}
                <span className={styles.factNote}>{r.내용}</span>
              </td>
              <td>{r.위치}</td>
              <td>
                {r.규모}
                <span className={styles.factNote}>
                  {r.성격} · {r.출처}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProcessorTable({
  caption,
  rows,
}: {
  caption: string;
  rows: Array<{ 국가: string; 공장: string; 기업: string; 출처: string; 등급: string }>;
}) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>{caption}</caption>
        <thead>
          <tr>
            <th>국가</th>
            <th>공장 (기준)</th>
            <th>기업</th>
            <th>등급</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.국가}>
              <td>{r.국가}</td>
              <td>
                {r.공장}
                <span className={styles.factNote}>{r.출처}</span>
              </td>
              <td>{r.기업}</td>
              <td>{r.등급}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BrandTable({
  caption,
  rows,
}: {
  caption: string;
  rows: Array<{
    시장: string;
    브랜드: string;
    소유: string;
    실적: string;
    점유율: string;
    성격: string;
  }>;
}) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>{caption}</caption>
        <thead>
          <tr>
            <th>시장</th>
            <th>브랜드 (소유)</th>
            <th>공표 실적</th>
            <th>점유율 (성격)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.시장}-${r.브랜드}`}>
              <td>{r.시장}</td>
              <td>
                {r.브랜드}
                <span className={styles.factNote}>{r.소유}</span>
              </td>
              <td>{r.실적}</td>
              <td>
                {r.점유율}
                <span className={styles.factNote}>{r.성격}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DATA = getPollockIndustryData();

const FAO_SYNC = { status: 'STATIC' as const, syncDate: `${DATA.세계어획._meta.기준연도}년 확정` };
const QUOTA_SYNC = { status: 'STATIC' as const, syncDate: '2026년 1월 제35차' };
const IMPORT_SYNC = { status: 'STATIC' as const, syncDate: String(DATA.수입세번._meta.구간 ?? '통관 실적') };
const MFDS_SYNC = { status: 'STATIC' as const, syncDate: `${DATA.가공품목._meta.기준연도}년분` };
const STOCK_SYNC = { status: 'STATIC' as const, syncDate: String(DATA.재고._meta.구간 ?? '월보') };
const REPORT_SYNC = { status: 'STATIC' as const, syncDate: '보고서 2026-08-23' };
const MFDS_NAME_SYNC = { status: 'STATIC' as const, syncDate: '식약처 2025년 단년' };

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
    {
      title: '공급 기업 - 누가 잡고 누가 파는가',
      caption: RESEARCH.공급.요지,
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="국적선·수입상·해외 매입처. 신고 건수는 물량이 아니다. 러시아 선사 법인명은 공표 없음이다."
          rows={RESEARCH.공급.rows}
          sizeLabel="규모 (성격)"
        />
      ),
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
  s06: [
    {
      title: '수입 신고 명의 상위',
      caption: RESEARCH.수입명의.요지,
      telemetry: MFDS_NAME_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="식약처 수입식품정보마루 2025년 처리일자. 건수는 물량이 아니다. 3개년 비율을 내지 않는다."
          rows={RESEARCH.수입명의.rows}
          sizeLabel="신고 건 (성격)"
        />
      ),
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
    {
      title: '국가별 가공 거점과 기업',
      caption: RESEARCH.가공.요지,
      telemetry: MFDS_SYNC,
      span: 'full',
      render: () => (
        <ProcessorTable
          caption="식품안전나라 I0300 사업장 단위와 해외 가공 줄. 등급 A는 기관, B는 집계·매체, C는 공시 사명 추정이다."
          rows={RESEARCH.가공.rows}
        />
      ),
    },
  ],
  s07: [
    {
      title: '2025 가공 생산 상위',
      caption: RESEARCH.국내가공상위.요지,
      telemetry: MFDS_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="식품안전나라 생산실적 I0300 2025년분. 사업장 단위. 삼양씨푸드 2공장은 합산하지 않는다."
          rows={RESEARCH.국내가공상위.rows}
          sizeLabel="생산량 (성격)"
        />
      ),
    },
    {
      title: '수입과 가공이 겹치는 42곳',
      caption: RESEARCH.연결42.요지,
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="2025년 수입 신고 상호 × 가공 생산실적 상호. 경대물산·금호통상은 가공 0톤이다."
          rows={RESEARCH.연결42.rows}
          sizeLabel="건수·톤"
        />
      ),
    },
  ],
  s08: [
    {
      title: '상장사 여섯의 전사 매출',
      caption: RESEARCH.상장사.요지,
      telemetry: { status: 'STATIC' as const, syncDate: 'DART 2025년' },
      span: 'full',
      render: () => (
        <RosterTable
          caption="연결 우선, 한성기업·사조오양 별도. 명태 부문 분리 공시는 없다."
          rows={RESEARCH.상장사.rows}
          sizeLabel="매출·영업이익"
        />
      ),
    },
    {
      title: '브랜드와 점유율 (성격 구분)',
      caption: RESEARCH.브랜드.요지,
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <BrandTable
          caption="점유율의 기관 공표가 없으면 공표 없음이다. 상장사 매출은 명태 매출이 아니다."
          rows={RESEARCH.브랜드.rows}
        />
      ),
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
  // 2026-09-10 사용자 지시: 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다(기업 해부와 동일).
  continuous: true,
  key: 'pollock',
  title: '명태',
  subtitle:
    '명태 산업 해부 · 잡지 않고 먹는 생선 - 자원·원양·수입·명의·가공·명부·재무·값과 재고, 세 장부의 문제',
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
    { eyebrow: '원양', title: '2026 한·러 할당', body: `${Number(quota2026?.할당 ?? 0).toLocaleString('ko-KR')} (톤)` },
    { eyebrow: '가공', title: '2025 생산', body: `${Number((DATA.가공품목._meta.합계 as Record<string, number>)['2025'] ?? 0).toLocaleString('ko-KR')} (톤)` },
    { eyebrow: '자료', title: '관세청', body: 'API 2026-06까지 · 웹 통계 2026-07까지 · 2026-08분 이후 이 화면 미반영' },
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
    '명의·가공 명부 · 식약처 수입식품정보마루·생산실적 I0300 2025',
    '재무 · DART 2025 사업보고서',
    'GLOBEFISH Groundfish 2026-05호 (쿼터 범위는 연방관보와 별도)',
    `갱신 ${DATA._meta.생성일} · 화면 2026-09-10`,
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
