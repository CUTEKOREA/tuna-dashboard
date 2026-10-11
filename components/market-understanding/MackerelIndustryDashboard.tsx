/**
 * 「시장 이해 > 고등어」.
 *
 * 서술·표는 전부 해부보고서 원문(`docs/evidence/industry-mackerel-2026-10/보고서.html`)에서
 * 추출한다(연육·명태와 같은 파이프라인). 여기서 손으로 정하는 것은 단계 제목·질문과 히어로
 * 수치(원문 표지 리터럴)뿐이다. 손으로 만든 차트·명부 표는 단계 끝 「근거」에 남긴다.
 */
'use client';

import React from 'react';
import {
  TraderTable,
  CanneryCountryTable,
  BrandMarketTable,
} from './CompanyResearchTables';
import { getMackerelRoster } from '@/lib/data/mackerel-roster';
import { getMackerelCompanyResearch } from '@/lib/data/valuechain-companies';

import { getMackerelIndustryData } from '@/lib/data/commodity-industry';
import { seriesRoles } from '@/lib/data/mackerel-country-series';
import { MACKEREL_ACCENT } from '@/lib/mackerel-chart-colors';
import { MACKEREL_SOURCE_NOTES } from '@/lib/mackerel-industry-content';
import { proseBriefing, proseStages } from '@/lib/company-prose-stages';
import type { HeroKpi } from '../v2/HeroZone';
import { dropEmptyLabel, industryInlineReport, ReportTableView } from './IndustryReportFlow';
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
import {
  AuctionPriceChart,
  TradeBalanceChart,
  auctionCaption,
  tradeCaption,
} from './MofLiveCharts';
import { auctionMeta, tradeMeta } from '@/lib/data/mof-live';

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

const REPORT_SYNC = { status: 'STATIC' as const, syncDate: '보고서 2026년 10월판' };

const MACKEREL_RESEARCH = getMackerelCompanyResearch();
const ROSTER = getMackerelRoster();

function RosterTable({ block }: { block: (typeof ROSTER)['수입명의'] }) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>{block.기준}</caption>
        <thead>
          <tr>
            <th>법인명</th>
            <th>핵심 값</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map((r) => (
            <tr key={`${r.구분}-${r.법인명}`}>
              <td>
                {r.법인명}
                <span className={styles.factNote}>
                  {r.성격} · {r.출처}
                </span>
              </td>
              <td>{r.핵심값}</td>
              <td>{r.비고 || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SERIES_SYNC = { status: 'STATIC' as const, syncDate: '관세청 2026년 1~7월' };
const ROSTER_SYNC = { status: 'STATIC' as const, syncDate: '2026-08-27 조회' };

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

/**
 * 히어로 수치는 해부보고서 표지 값이다(표지 지표 8개 중 넷). 렌더 테스트가 원문 HTML 텍스트에
 * 그대로 있는지 대조한다. 화면용 집계 JSON 에서 계산하지 않는다.
 */
export const MACKEREL_HERO_KPIS: HeroKpi[] = [
  { label: '2027 ICES 권고', value: 352938, unit: '(톤)', accent: MACKEREL_ACCENT },
  { label: '노르웨이 의존 (2026.1~8)', value: 68.1, unit: '(%)', decimals: 1 },
  { label: '2026 수출 (1~8월)', value: 121297, unit: '(톤)' },
  { label: '수입 신고명의', value: 117, unit: '(곳)' },
];

/**
 * 단계 순서·제목·질문(손 작성). 서술·표는 전부 원문에서 온다.
 * 절 → 단계 매핑은 `scripts/build_report_tables.py` SPECS.mackerel 에 있다.
 */
export const MACKEREL_STAGES: Array<{ key: string; title: string; question: string }> = [
  { key: 's01', title: '요약 - 세 통계가 공급 축소로 모인다', question: '2026년 고등어 공급에서 무엇이 달라졌고 언제 무엇을 보면 되는가' },
  { key: 's02', title: '제도 - 권고가 아니라 협상이 공급을 정한다', question: '대서양·태평양·국내 고등어의 양은 누가 얼마로 정하는가' },
  { key: 's03', title: '값 - 물량과 단가가 갈라진다', question: '수입이 줄 때 단가와 자급률은 어떻게 움직이는가' },
  { key: 's04', title: '수입 - 한 나라에 묶인 조달선', question: '왜 노르웨이 쏠림이 깊어졌고 2025년에 무엇이 꺾였는가' },
  { key: 's05', title: '국내 - 집 앞바다에서 나는 물고기', question: '한국 고등어는 언제 얼마나 잡히고 어떤 크기로 위판되는가' },
  { key: 's06', title: '수출 - 나가는 쪽이 더 크다', question: '수입국인 한국이 왜 수입량보다 많이 내보내는가' },
  { key: 's07', title: '명의 - 누구 명의로 들어오고 어디서 손질되나', question: '수입 명의 117곳과 집계표 밖의 가공은 어디까지 보이는가' },
  { key: 's08', title: '유통 - 산지에서 소비자까지', question: '어가 4,835원은 어떻게 소비자가 11,830원이 되는가' },
  { key: 's09', title: '기업 - 명의는 크고 사업은 작다', question: '고등어를 다루는 회사는 누구이고 기관 리포트는 무엇을 말하는가' },
  { key: 'x01', title: '빈칸 - 어디서 칸이 비고 무엇이 남았나', question: '제도와 통계는 어디서 끊기고 어떤 물음이 아직 열려 있는가' },
];

const REPORT_STAGES = new Map(proseStages('mackerel').map((stage) => [stage.key, stage]));

export const MACKEREL_REPORT_NARRATIVES = MACKEREL_STAGES.map(({ key, title, question }, index) => {
  const stage = REPORT_STAGES.get(key);
  if (!stage) throw new Error(`고등어 보고서에 ${key} 단계 서술이 없다`);
  return industryInlineReport('mackerel', {
    ...stage,
    numeral: String(index + 1).padStart(2, '0'),
    title,
    question,
    paragraphs: stage.paragraphs.map(dropEmptyLabel),
    flow: stage.flow?.map((item) => item.kind === 'head' ? { ...item, text: dropEmptyLabel(item.text) } : item),
  }, {
    telemetry: REPORT_SYNC,
    source: '한국 고등어 산업 해부',
    renderTable: (table) => <ReportTableView table={table} />,
  });
});

/** 원문이 p.lead 를 쓰지 않아 절마다 첫 문단을 리드로 쓴다. */
export const MACKEREL_REPORT_BRIEFING = proseBriefing('mackerel', { firstBlock: true });

/**
 * 손으로 만든 차트·명부 표. 서술이 원문으로 바뀌면서 단계가 새로 묶였으므로 각 차트를 그
 * 주제의 원문 절이 붙은 단계 끝 「근거」로 옮겼다(어획·위판 → 05 국내, 수입 창구 → 04 수입,
 * 가공 거점·브랜드 → 09 기업, 명부 → 07 명의, 무역수지 → 06 수출).
 * 옛 발행본(2026-08-27) 표 슬롯은 원문 표가 서술 흐름에 들어오므로 뺐다.
 */
export const MACKEREL_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s04: [
    {
      title: '공급 기업 - 누가 잡고 누가 파는가',
      caption: MACKEREL_RESEARCH.공급.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <TraderTable rows={MACKEREL_RESEARCH.공급.rows} />,
    },
    {
      title: '수입 원산지 구성 (%)',
      caption:
        '주황이 노르웨이다. 나머지를 다 합쳐도 노르웨이 하나에 못 미친다.',
      telemetry: IMPORT_SYNC,
      render: () => <MackerelOriginChart data={DATA} />,
      // 단가는 합계가 뜻이 없다. 물량만 더한다.
    },
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
        '파랑이 030354 냉동(강조한 노르웨이는 주황), 청록이 0304895000 필렛이다. 노르웨이만 강조한 이유는 두 창구가 같이 크기 때문이다. 아이슬란드 0은 어획이 없다는 뜻이 아니라 이 세번 추출에 이름이 없다는 뜻이다. 2026년 1~7월 제품중량이라 위 생산 통계·04단계 1~5월 표와 더할 수 없다.',
      telemetry: SERIES_SYNC,
      render: () => <MackerelSeriesWindowsChart />,
    },
    {
      title: '수입 창구 단가 (달러/톤)',
      caption:
        'HS 030354 신고액÷중량만 그린다. 영국 5,375이 가장 높고 일본 662이 가장 낮다. 아이슬란드 단가를 0으로 만들지 않는다. 필렛 단가와 섞지 않는다.',
      telemetry: SERIES_SYNC,
      render: () => <MackerelSeriesUnitChart />,
    },
  ],
  s05: [
    {
      title: '국내 위판 일별 단가 (원/kg)',
      caption: auctionCaption('고등어'),
      telemetry: { status: 'SYNCED' as const, syncDate: String(auctionMeta.기간) },
      render: () => <AuctionPriceChart keyword="고등어" />,
      sourceLine: `출처: ${auctionMeta.출처} · 조회 ${auctionMeta.조회일} · scripts/sync_mof_auction.py`,
    },
    {
      title: '한국 고등어 어획량 30년 (톤)',
      caption:
        '1996년 415,003톤이 정점, 2020년 77,605톤이 바닥이다. 망치고등어 선이 2017년에 0으로 떨어지는 것은 어획이 멈춰서가 아니라 보고가 합쳐져서다.',
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <MackerelCatchChart data={DATA} />,
    },
    {
      title: '위판 등급별 물량과 단가 (kg·원/kg)',
      caption:
        '막대는 물량, 선은 물량가중 평균단가다. 단가가 가장 높은 등급의 막대가 가장 낮다는 것이 이 그림의 요지다.',
      telemetry: WIPAN_SYNC,
      render: () => <MackerelGradeChart data={DATA} />,
    },
  ],
  s06: [
    {
      title: '고등어 월별 수출입과 무역수지 (백만 달러)',
      caption: tradeCaption('고등어'),
      telemetry: { status: 'SYNCED' as const, syncDate: String(tradeMeta.기간) },
      render: () => <TradeBalanceChart keyword="고등어" />,
      sourceLine: `출처: ${tradeMeta.출처} · 조회 ${tradeMeta.조회일} · scripts/sync_mof_trade.py`,
    },
  ],
  s07: [
    {
      title: '수입 명의 상위 20 (신고 레코드)',
      caption: ROSTER.수입명의.기준,
      telemetry: ROSTER_SYNC,
      span: 'full',
      render: () => <RosterTable block={ROSTER.수입명의} />,
    },
    {
      title: '국내 가공 업소 상위 20 (2025년 생산량 kg)',
      caption: ROSTER.국내가공.기준,
      telemetry: ROSTER_SYNC,
      span: 'full',
      render: () => <RosterTable block={ROSTER.국내가공} />,
    },
  ],
  s09: [
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
  ],
  x01: [
    {
      title: '종별 보고량 추이 - 망치고등어가 사라진 자리 (톤)',
      caption:
        '05단계와 같은 자료를 종에 초점을 두고 다시 본다. 2016년 22,244톤이던 망치고등어가 이듬해 0이 되고 그대로 유지된다 - 부산 위판장에는 계속 올라오는데도 그렇다.',
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <MackerelCatchChart data={DATA} />,
    },
  ],
};

const SPEC: CommoditySpec = {
  // 2026-09-10 사용자 지시: 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다(기업 해부와 동일).
  continuous: true,
  key: 'mackerel',
  reportHref: '/reports/industry/mackerel-2026-10.html',
  title: '고등어',
  subtitle:
    '고등어 산업 해부 · 수입량의 두 배를 수출하는 품목 - 제도·값·수입·국내·수출·명의·유통·기업, 그리고 비는 칸',
  accent: MACKEREL_ACCENT,
  primaryKpi: MACKEREL_HERO_KPIS[0],
  secondaryKpis: MACKEREL_HERO_KPIS.slice(1),
  stripItems: [
    // 히어로 띠도 원문 표지 값이다.
    { now: true, eyebrow: '기준', title: '생산자 수취율', body: '40.9% (소비자가 11,830원/kg)' },
    { eyebrow: '유통', title: '소매 단계 마진', body: '36.2% (산지 9.6 · 도매 13.3)' },
    { eyebrow: '통계', title: '통계 잔차', body: '9,158톤 (FAO 대 통계청 7.3%)' },
    { eyebrow: '자료', title: '본문·표', body: '해부보고서 2026년 10월판 · 차트는 별도 집계' },
  ],
  briefing: MACKEREL_REPORT_BRIEFING,
  narratives: MACKEREL_REPORT_NARRATIVES,
  chartSlots: MACKEREL_CHART_SLOTS,
  sourceNotes: MACKEREL_SOURCE_NOTES,
  sourceMeta: [
    '본문·표 · 한국 고등어 산업 해부 2026년 10월판',
    `어획 집계 · ${DATA.한국어획._meta.출처}`,
    `위판 집계 · ${DATA.위판등급._meta.출처}`,
    `통관 집계 · ${DATA.수입원산지._meta.출처} · ${DATA.수입원산지._meta.구간}`,
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
