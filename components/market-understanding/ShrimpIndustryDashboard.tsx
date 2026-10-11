/**
 * 「시장 이해 > 새우」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있다. 여기는 차트 배치와 히어로 수치만 정한다.
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { BrandMarketTable } from './CompanyResearchTables';
import { getShrimpCompanyResearch } from '@/lib/data/valuechain-companies';

import { getShrimpIndustryData } from '@/lib/data/commodity-industry';
import { SHRIMP_ACCENT } from '@/lib/shrimp-chart-colors';
import {
  argentinaMeta,
  argentinaRoutes,
  PROCESSOR_TAB_MATCH,
} from '@/lib/data/shrimp-argentina';
import { seriesRoles } from '@/lib/data/shrimp-country-series';
import { SHRIMP_NARRATIVES, SHRIMP_SOURCE_NOTES } from '@/lib/shrimp-industry-content';
import { proseBriefing, proseStages } from '@/lib/company-prose-stages';
import { dropEmptyLabel, industryInlineReport } from './IndustryReportFlow';
import {
  type ReportTable as IntakeReportTable,
} from '@/lib/data/company-report-tables';
import type { HeroKpi } from '../v2/HeroZone';
import styles from './TunaIndustryDashboard.module.css';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
  type StageNarrative,
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
import {
  AuctionPriceChart,
  TradeBalanceChart,
  auctionCaption,
  tradeCaption,
} from './MofLiveCharts';
import { auctionMeta, tradeMeta } from '@/lib/data/mof-live';

const DATA = getShrimpIndustryData();
const SYNC = { status: 'STATIC' as const, syncDate: `${DATA.요약.기준연도}년 확정` };

const SHRIMP_RESEARCH = getShrimpCompanyResearch();

const ARG_SYNC = { status: 'STATIC' as const, syncDate: '2026-08-12 조사' };

/**
 * 차트는 해부보고서 표가 아니라 화면용 집계를 그린다. 캡션 끝에 출처·기준을 붙여
 * 보고서 본문 수치와 다른 집계임을 밝힌다(2026-10-11 사용자 결정 7).
 * 세계 생산 차트는 담수 갑각류를 포함한 FAO 자체 집계라 원문(담수 갑각류 제외)과 값이 다르다.
 */
const chartSource = (source: string, asOf: string) =>
  ` 출처 ${source} · 기준 ${asOf}. 보고서 표와 별도 집계다.`;
const FAO_SOURCE = `${DATA._meta.출처} (담수 갑각류 포함 화면 집계)`;
const FAO_AS_OF = `${DATA.요약.기준연도}년 확정`;

/**
 * 히어로 수치는 해부보고서 원문 값이다(02절 세계 1,195만 톤·양식 73.8%·흰다리 64.1%, 05절 한국
 * 양식 22.7%). 옛 히어로는 화면용 FAO 집계(12,768,242톤·74.4%·60.01%)를 냈다. 렌더 테스트가
 * 원문 HTML 텍스트에 그대로 있는지 대조한다.
 */
export const SHRIMP_HERO_KPIS: HeroKpi[] = [
  { label: '세계 새우 생산량 2024', value: 1195, unit: '(만 톤)', accent: SHRIMP_ACCENT },
  { label: '양식 비중', value: 73.8, unit: '(%)', decimals: 1 },
  { label: '흰다리새우 비중', value: 64.1, unit: '(%)', decimals: 1 },
  { label: '한국 양식 비중', value: 22.7, unit: '(%)', decimals: 1 },
];

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
const NEW_REPORT_SYNC = { status: 'STATIC' as const, syncDate: '보고서 2026년 10월판' };

function ReportTable({
  headers,
  rows,
  note,
}: {
  headers: string[];
  rows: string[][];
  note: string;
}) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row[0]}-${i}`}>
              {row.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.factNote}>{note}</p>
    </div>
  );
}

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

/** 발행본 표를 그대로 그린다. 숫자는 문자열 그대로이고 재계산하지 않는다. */
function ExtractedReportTable({ table }: { table: IntakeReportTable }) {
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
 * 최종 해부보고서 표를 설명 문장 옆의 원래 자리로 되돌린다(명태·문어와 같다).
 *
 * 한 단계에 절이 여럿 붙으므로 절별 오프셋 구간을 따로 둔다. 그렇지 않으면 뒤 절의
 * 표가 첫 절 문장 사이에 섞인다. 손으로 만든 차트·표는 chartSlots에 남아
 * 각 단계 끝 「근거」에서 그대로 렌더된다.
 */
function inlineReport(n: StageNarrative): StageNarrative {
  return industryInlineReport('shrimp', n, {
    telemetry: NEW_REPORT_SYNC,
    source: '한국 새우 산업 해부',
    renderTable: (table) => <ExtractedReportTable table={table} />,
  });
}

const REPORT_STAGES = new Map(proseStages('shrimp').map((stage) => [stage.key, stage]));

/**
 * 해부보고서 원문에 대응 절이 없는 단계. x01(바스켓 — FAO 통계 경계), s05(아르헨티나 조달
 * 경로), s06(시리즈 6개국 수입 창구)은 객관 시점의 최종 보고서에 같은 주제의 절이 없어
 * 기존 손 작성 서술을 그대로 두고, 단계 머리에 「보고서 밖 사내 분석」을 단다(2026-10-11 사용자 결정 6).
 */
export const SHRIMP_HANDWRITTEN_STAGES = new Set(['x01', 's05', 's06']);

/**
 * 단계 순서·번호·제목·질문은 기존 화면 값을 쓰고(발주서 허용), 서술은 원문에서 온다.
 */
export const SHRIMP_REPORT_NARRATIVES: StageNarrative[] = SHRIMP_NARRATIVES.map((hand) => {
  if (SHRIMP_HANDWRITTEN_STAGES.has(hand.key)) return { ...hand, badge: '보고서 밖 사내 분석' };
  const stage = REPORT_STAGES.get(hand.key);
  if (!stage) throw new Error(`새우 보고서에 ${hand.key} 단계 서술이 없다`);
  return inlineReport({
    ...stage,
    // 손 작성 단계(x01 = 'A')가 사이에 끼어 있어 순번 대신 기존 화면 번호를 쓴다.
    numeral: hand.numeral,
    title: hand.title,
    question: hand.question,
    paragraphs: stage.paragraphs.map(dropEmptyLabel),
    flow: stage.flow?.map((item) => item.kind === 'head' ? { ...item, text: dropEmptyLabel(item.text) } : item),
  });
});

export const SHRIMP_REPORT_BRIEFING = proseBriefing('shrimp');

export const SHRIMP_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s01: [
    {
      title: '양식과 자연산 75년 (톤·%)',
      caption:
        '청록이 양식, 파랑이 자연산이다. 선은 양식 비중으로 2010년에 50%를 넘는다. 자연산 막대가 줄어든 것이 아니라 양식이 그 위에 쌓였다.' +
        chartSource(FAO_SOURCE, FAO_AS_OF),
      telemetry: SYNC,
      span: 'full', // 75년 추이 — 기존 전폭 예외(commodity-industry-render 테스트가 고정)
      render: () => <ShrimpTrendChart data={DATA} />,
    },
    {
      title: '생산 방식별 규모 (톤)',
      caption:
        '「양식」 한 낱말을 갈랐다. 주황이 담수 양식 - 강·논에서 기르는 민물새우다. 해산 새우 시장을 말할 때는 이 막대를 빼야 한다.' +
        chartSource(FAO_SOURCE, FAO_AS_OF),
      telemetry: SYNC,
      render: () => <ShrimpEnvChart data={DATA} />,
    },
  ],
  s02: [
    {
      title: '종별 생산량 (톤)',
      caption:
        '주황이 흰다리새우다. 1위 하나가 나머지 여덟을 합친 것보다 크다.' + chartSource(FAO_SOURCE, FAO_AS_OF),
      telemetry: SYNC,
      render: () => <ShrimpSpeciesChart data={DATA} />,
    },
  ],
  s03: [
    {
      title: '국가별 생산과 양식 비중 (톤·%)',
      caption:
        '막대 높이는 규모, 색 구성은 양식과 자연산의 비율, 선은 양식 비중이다. 선이 바닥에 붙은 나라와 천장에 붙은 나라는 사는 물건이 다르다.' +
        chartSource(FAO_SOURCE, FAO_AS_OF),
      telemetry: SYNC,
      render: () => <ShrimpCountryChart data={DATA} />,
      // 차트는 상위 12개국만 그린다. 몇 나라가 잘렸는지는 그래프만 봐서는 알 수 없다.
    },
  ],
  s05: [
    {
      title: '새우 월별 수출입과 무역수지 (백만 달러)',
      caption: tradeCaption('새우') + chartSource(tradeMeta.출처, String(tradeMeta.기간)),
      telemetry: { status: 'SYNCED' as const, syncDate: String(tradeMeta.기간) },
      render: () => <TradeBalanceChart keyword="새우" />,
      sourceLine: `출처: ${tradeMeta.출처} · 조회 ${tradeMeta.조회일} · scripts/sync_mof_trade.py`,
    },
    {
      title: '한국 HS 030617 공급국 (톤·$/kg)',
      caption:
        '막대가 수입량, 선이 평균 신고단가다. 주황이 아르헨티나 - 물량은 6위인데 단가는 가장 높은 축이다. 통관 신고 기준이라 위 생산 통계와 더할 수 없다.' +
        chartSource('관세청 수출입무역통계 HS 030617', '2026년 1~5월'),
      telemetry: { status: 'STATIC' as const, syncDate: '2026년 1~5월 관세청' },
      render: () => <ShrimpArgentinaKoreaChart />,
    },
    {
      title: '아르헨티나 어획·양륙 (톤)',
      caption:
        '회색 막대는 출처가 다르다 - 2018~2024는 FAO 어획, 2025는 아르헨티나 정부 양륙 집계다. 두 계열을 한 선으로 잇지 않은 이유다.' +
        chartSource('FAO FishStat·아르헨티나 농축수산부 양륙 집계', '2026-08-12 조사'),
      telemetry: ARG_SYNC,
      render: () => <ShrimpArgentinaCatchChart />,
    },
    {
      title: '가공경로 3국 공개기록 (건)',
      caption:
        '식약처 화면에 나타난 조회행 빈도이지 수입량이 아니다. 회색인 베트남 0건은 「없다」가 아니라 「이 자료에서 확인되지 않았다」이다.' +
        chartSource('식약처 수입식품정보마루 공개 조회', '2026-08-12 조사'),
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
        '주황이 젓새우다. 세계에서 2.69%뿐인 종이 한국에서는 절반이다 - 새우젓이라는 소비 형태가 통계에 그대로 찍혔다.' +
        chartSource(FAO_SOURCE, FAO_AS_OF),
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
        '막대 둘은 세번이 다르다 - 파랑이 030617 원물(강조한 베트남은 주황), 청록이 160521 조제품이다. 베트남만 강조한 이유는 두 창구가 비슷한 무게이기 때문이다. 2026년 1~6월 제품중량이라 위 생산 통계·05단계 1~5월 표와 더할 수 없다.' +
        chartSource('관세청 수출입무역통계 HS 030617·160521', '2026년 1~6월'),
      telemetry: SERIES_SYNC,
      render: () => <ShrimpSeriesWindowsChart />,
    },
    {
      title: '수입 창구 단가 (달러/kg)',
      caption:
        'HS 030617 신고액÷중량만 그린다. 에콰도르 5.11이 가장 낮고 태국 12.12가 가장 높다. 조제품 단가와 섞지 않는다.' +
        chartSource('관세청 수출입무역통계 HS 030617', '2026년 1~6월'),
      telemetry: SERIES_SYNC,
      render: () => <ShrimpSeriesUnitChart />,
    },
  ],
  s08: [
    {
      title: '국내 위판 일별 단가 (원/kg)',
      caption: auctionCaption('새우') + chartSource(auctionMeta.출처, String(auctionMeta.기간)),
      telemetry: { status: 'SYNCED' as const, syncDate: String(auctionMeta.기간) },
      render: () => <AuctionPriceChart keyword="새우" />,
      sourceLine: `출처: ${auctionMeta.출처} · 조회 ${auctionMeta.조회일} · scripts/sync_mof_auction.py`,
    },
  ],
  s13: [
    {
      title: '2026년 9월 조달 창',
      caption:
        '아카이브 1차 출처를 우선한다. 거부·통보 건수는 분모가 없어 불합격률이 아니다. 해부보고서 10월판보다 앞선 2026-09-10 스냅숏이라 14절의 날짜·개정과 다를 수 있다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2026-09-10' },
      span: 'full',
      render: () => (
        <ReportTable
          headers={['신호', '값', '등급']}
          rows={[
            ['에콰도르 BCE 1~6월', 'USD 4,698.1M (+10.4%)', 'A'],
            ['아르헨 양륙 1/1~9/8', '174,868.939 t', 'A'],
            ['국가수역 최종 출항', '2026-09-09 23:59', 'B'],
            ['FDA 16-35 개정', '09/04/2026 DWPE', 'A'],
            ['대중국 공장', '8곳 복권 · 6곳 정지', 'B'],
            ['인도 반덤핑 20차', '7.01 / 4.04 / 5.53%', 'B'],
            ['베트남 새우 1~8월', 'USD 3.3 billion (+12.3%)', 'B'],
          ]}
          note="C절 아카이브 + 채택 Grok D-4·D-5·D-6·D-7(일정만)·D-8. D-1·D-2·D-3 미채택."
        />
      ),
    },
  ],
};

const SPEC: CommoditySpec = {
  // 2026-09-10 사용자 지시: 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다(기업 해부와 동일).
  continuous: true,
  key: 'shrimp',
  reportHref: '/reports/industry/shrimp-2026-10.html',
  title: '새우',
  subtitle:
    '새우 산업 해부 · 양식이 이긴 유일한 주요 수산 품목 - 조달선·가공 명부·값 사슬·검역 창까지',
  accent: SHRIMP_ACCENT,
  primaryKpi: SHRIMP_HERO_KPIS[0],
  secondaryKpis: SHRIMP_HERO_KPIS.slice(1),
  // 히어로 띠도 원문 01·13·14절 값이다(옛 띠의 최종 출항 시각·에콰도르 BCE·DWPE 표기는 원문에 없다).
  stripItems: [
    {
      now: true,
      eyebrow: '지금',
      title: '아르헨티나 국가수역 폐쇄',
      body: '2026-09-13 00시 전면 폐쇄 · 양륙 174,868.939 t (9월 8일까지)',
    },
    {
      eyebrow: '검역',
      title: 'FDA 16-35',
      body: '인도산 생·자숙 새우 검사 없이 억류 · 2026-10-01 개정',
    },
    {
      eyebrow: '수입',
      title: '2025 수입',
      body: '109,020 t · 7억 7,140만 달러 · 7.08 달러/kg',
    },
    {
      eyebrow: '도매',
      title: 'KAMIS 서울 도매',
      body: '12,050원/kg (2026년 6~8월 관측일 전부)',
    },
  ],
  briefing: SHRIMP_REPORT_BRIEFING,
  narratives: SHRIMP_REPORT_NARRATIVES,
  chartSlots: SHRIMP_CHART_SLOTS,
  sourceNotes: SHRIMP_SOURCE_NOTES,
  sourceMeta: [
    '본문·표 해부보고서 2026년 10월판',
    `차트 생산 집계 · ${DATA._meta.출처} · 기준 ${DATA._meta.기준연도}년`,
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
