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
import { proseBriefing, proseStages } from '@/lib/company-prose-stages';
import { dropEmptyLabel, industryInlineReport } from './IndustryReportFlow';
import {
  type ReportTable as IntakeReportTable,
} from '@/lib/data/company-report-tables';
import { POLLOCK_NARRATIVES, POLLOCK_SOURCE_NOTES } from '@/lib/pollock-industry-content';
import type { HeroKpi } from '../v2/HeroZone';
import styles from './TunaIndustryDashboard.module.css';
import MarketRegimeBand from './MarketRegimeBand';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
  type StageNarrative,
} from './CommodityIndustryDashboard';
import {
  PollockImportMixChart,
  PollockOriginChart,
  PollockProcessingChart,
  PollockQuotaChart,
  PollockStockChart,
  PollockWorldChart,
} from './CommodityCharts';
import {
  AuctionPriceChart,
  TradeBalanceChart,
  auctionCaption,
  tradeCaption,
} from './MofLiveCharts';
import { auctionMeta, tradeMeta } from '@/lib/data/mof-live';

const RESEARCH = getPollockCompanyResearch();

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
const REPORT_SYNC = { status: 'STATIC' as const, syncDate: '보고서 2026년 10월판' };

/**
 * 차트는 해부보고서 표가 아니라 화면용 집계를 그린다. 캡션 끝에 출처·기준을 붙여
 * 보고서 본문 수치와 다른 집계임을 밝힌다(2026-10-11 사용자 결정 7).
 */
const chartSource = (source: unknown, asOf: string) =>
  ` 출처 ${String(source)} · 기준 ${asOf}. 보고서 표와 별도 집계다.`;

/**
 * 히어로 수치는 해부보고서 원문 값이다(01절 요약 · 13절 재고). 렌더 테스트가
 * 원문 HTML 텍스트에 그대로 있는지 대조한다. 화면용 집계 JSON 에서 계산하지 않는다.
 */
export const POLLOCK_HERO_KPIS: HeroKpi[] = [
  { label: '2025 명태 전용 세번 수입액', value: 426.9, unit: '(백만 달러)', decimals: 1, accent: POLLOCK_ACCENT },
  { label: '2025 러시아 비중', value: 79.8, unit: '(%)', decimals: 1 },
  { label: '2026년 한·러 1차 배정', value: 26200, unit: '(톤)' },
  { label: '2026년 7월 말 냉동 재고', value: 46393, unit: '(톤)' },
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

/**
 * 최종 해부보고서 표를 설명 문장 옆의 원래 자리로 되돌린다.
 *
 * 한 단계에 절이 여럿 붙으므로 절별 오프셋 구간을 따로 둔다. 그렇지 않으면 뒤 절의
 * 표가 첫 절 문장 사이에 섞인다. 손으로 만든 인터랙티브 차트는 chartSlots에 남아
 * 각 단계 끝 「근거」에서 그대로 렌더된다.
 */
function inlineReport(narratives: StageNarrative[]): StageNarrative[] {
  return narratives.map((n) => industryInlineReport('pollock', n, {
    telemetry: REPORT_SYNC,
    source: '한국 명태 산업 해부',
    renderTable: (table) => <ReportTable table={table} />,
  }));
}

const REPORT_STAGES = new Map(proseStages('pollock').map((stage) => [stage.key, stage]));

/**
 * 단계 순서·제목·질문은 기존 화면 값을 쓰고(발주서 허용), 서술은 전부 원문에서 온다.
 */
export const POLLOCK_REPORT_NARRATIVES = inlineReport(
  POLLOCK_NARRATIVES.map(({ key, title, question }, index) => {
    const stage = REPORT_STAGES.get(key);
    if (!stage) throw new Error(`명태 보고서에 ${key} 단계 서술이 없다`);
    return {
      ...stage,
      numeral: String(index + 1).padStart(2, '0'),
      title,
      question,
      paragraphs: stage.paragraphs.map(dropEmptyLabel),
      flow: stage.flow?.map((item) => item.kind === 'head' ? { ...item, text: dropEmptyLabel(item.text) } : item),
    };
  }),
);

export const POLLOCK_REPORT_BRIEFING = proseBriefing('pollock');

export const POLLOCK_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s01: [
    {
      title: '세계 명태 어획 1986~2024 (톤)',
      caption:
        '1986년 6,758,944톤이 정점이고 2000년 2,929,654톤이 바닥이다. 러시아와 미국 두 줄이 세계의 93.8%이고 한국 선은 바닥에 붙어 있다.' +
        chartSource(DATA.세계어획._meta.출처, `${DATA.세계어획._meta.기준연도}년 확정`),
      telemetry: FAO_SYNC,
      span: 'full',
      render: () => <PollockWorldChart data={DATA} />,
    },
  ],
  s02: [
    {
      title: '한·러 명태 할당과 어획 2020~2026 (톤·달러/톤)',
      caption:
        '옅은 막대가 할당, 짙은 막대가 어획이다. 2022년을 빼면 붙어 있다. 2026년 막대는 1~6월 누계라 짧다. 선은 입어료다.' +
        chartSource('한·러 어업위원회 결과·러시아 연방수산청 이행명령·원양어업통계', '2026년 1월 제35차'),
      telemetry: QUOTA_SYNC,
      render: () => <PollockQuotaChart data={DATA} />,
    },
  ],
  s03: [
    {
      title: '명태 월별 수출입과 무역수지 (백만 달러)',
      caption: tradeCaption('명태') + chartSource(tradeMeta.출처, String(tradeMeta.기간)),
      telemetry: { status: 'SYNCED' as const, syncDate: String(tradeMeta.기간) },
      render: () => <TradeBalanceChart keyword="명태" />,
      sourceLine: `출처: ${tradeMeta.출처} · 조회 ${tradeMeta.조회일} · scripts/sync_mof_trade.py`,
    },
    {
      title: '전용 세번별 수입 물량 2023~2026 (톤)',
      caption:
        '동태(주황)가 줄고 연육(청록)이 는다. 2026년은 1~7월 누계라 막대가 짧다.' +
        chartSource(DATA.수입세번._meta.출처, String(DATA.수입세번._meta.구간)),
      telemetry: IMPORT_SYNC,
      render: () => <PollockImportMixChart data={DATA} />,
    },
    {
      title: '수입 원산지 구성 2025 (%)',
      caption:
        '주황이 러시아다. 미국을 더하면 95.1%이고 나머지를 다 합쳐도 5%가 안 된다.' +
        chartSource(DATA.수입원산지._meta.출처, '2025년 통관'),
      telemetry: { status: 'STATIC' as const, syncDate: '2025년 통관' },
      render: () => <PollockOriginChart data={DATA} />,
    },
  ],
  s04: [
    {
      title: '가공 품목별 생산량 2023~2025 (톤)',
      caption:
        '명란젓 2024년 막대가 튀는 것은 한 업체의 8,869톤 신고다. 연육 막대가 작은 것은 국내 생산이 아니라 수입이 공급의 97.4%라서다.' +
        chartSource(DATA.가공품목._meta.출처, `${DATA.가공품목._meta.기준연도}년분`),
      telemetry: MFDS_SYNC,
      render: () => <PollockProcessingChart data={DATA} />,
    },
  ],
  s08: [
    {
      title: '브랜드와 점유율 (성격 구분)',
      caption:
        RESEARCH.브랜드.요지 + chartSource('명태 산업 해부 2판 §12·전자공시 큐레이션', '2026-09-10 정리'),
      // 원문(10월판)에 브랜드 표가 없어 옛 2판 조사 표를 남긴다. 기준일을 원문 표와 구분한다.
      telemetry: { status: 'STATIC' as const, syncDate: '보고서 2판 2026-08-23' },
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
        '선이 월말 재고, 막대가 월 수입이다. 2026년 6~7월에 둘이 함께 꺼진다. 재고와 도매가의 동시 상관은 0.12다.' +
        chartSource(DATA.재고._meta.출처, String(DATA.재고._meta.구간)),
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
  reportHref: '/reports/industry/pollock-2026-10.html',
  title: '명태',
  subtitle:
    '명태 산업 해부 · 잡지 않고 먹는 생선 - 자원·원양·수입·명의·가공·명부·재무·값과 재고, 세 장부의 문제',
  accent: POLLOCK_ACCENT,
  primaryKpi: POLLOCK_HERO_KPIS[0],
  secondaryKpis: POLLOCK_HERO_KPIS.slice(1),
  stripItems: [
    // 히어로 띠도 원문 01절 값이다.
    { now: true, eyebrow: '기준', title: '2025 수입 물량', body: '195,963 (톤)' },
    { eyebrow: '원양', title: '2026 한·러 1차 배정', body: '26,200 (톤)' },
    { eyebrow: '가공', title: '2025 생산', body: '30,879 (톤)' },
    { eyebrow: '자료', title: '차트', body: '관세청 API 2026-06까지 · 웹 통계 2026-07까지 · 본문·표는 해부보고서 2026년 10월판' },
  ],
  briefing: POLLOCK_REPORT_BRIEFING,
  narratives: POLLOCK_REPORT_NARRATIVES,
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
  insets: {
    AfterHero: () => <MarketRegimeBand commodityKey="pollock" />,
  },
};

export interface PollockIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function PollockIndustryDashboard({
  heroOnly = false,
}: PollockIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
