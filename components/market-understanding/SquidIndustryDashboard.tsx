/**
 * 「시장 이해 > 오징어」 — 사슬 15단계(세계 01~08 + 국내 09~15) + 횡단 3축.
 *
 * 참치 페이지와 같은 골격이고 CSS 도 같은 모듈을 쓴다. 다른 것은 셋이다.
 *  · 원본 위젯이 차트뿐 아니라 표·원문 발췌라서 `SquidWidgetView` 가 세 형태를 다룬다
 *  · 위젯마다 측정 게이트(`basis`)를 함께 싣는다 — 이 수치를 무엇과 비교하면 안 되는지
 *  · 시그니처 색이 두족류(purple → pink)다
 *
 * 단계 렌더링은 `CommodityIndustryDashboard` 가 갖는다. 원래 이 파일과 참치가 각자 복사본을
 * 들고 있었고, 「세 번째 품목이 생기면 빼내라」는 메모가 붙어 있었다 — 새우·고등어·골뱅이가
 * 생겨 조건이 채워졌고, 탭 내비를 세 곳에 따로 넣게 되면서 값이 확실해졌다.
 *
 * 큐레이션 위젯은 새 개념으로 두지 않고 **차트 슬롯으로 변환**한다. 위젯 figure 가 슬롯
 * figure 와 다른 점은 끝에 붙는 출처 한 줄뿐이라 `ChartSlot.sourceLine` 으로 흡수했다.
 */
'use client';

import React from 'react';

import {
  getSquidCatchData,
  getSquidChainStages,
  getSquidCrossStages,
  getSquidFleetData,
  getSquidOceanFleet,
  getSquidTradeData,
  getSquidWidgetsMeta,
  type SquidStage,
} from '@/lib/data/squid-industry';
import { SQUID_ALL_NARRATIVES, SQUID_SOURCE_NOTES } from '@/lib/squid-industry-content';
import { proseBriefing, proseStages } from '@/lib/company-prose-stages';
import { dropEmptyLabel, industryInlineReport } from './IndustryReportFlow';
import {
  type ReportTable as IntakeReportTable,
} from '@/lib/data/company-report-tables';
import type { HeroKpi } from '../v2/HeroZone';
import { SQUID_ROLE } from '@/lib/squid-chart-colors';

const SQUID_ACCENT = SQUID_ROLE.volume;
import {
  FalklandCompanyChart,
  FalklandSeasonChart,
  FalklandVesselChart,
  SquidAreaChart,
  SquidGearProductionChart,
  SquidSizeBandChart,
} from './SquidCharts';
import {
  falklandMeta,
} from '@/lib/data/falkland-squid-vessels';
import { FalklandMonthProvider } from './FalklandMonthFilter';

import {
  deepseaMeta,
  latestYear,
} from '@/lib/data/deepsea-fishery';
import {
  AreaRankChart,
  BasketChart,
  CollapseChart,
  CoastalGearChart,
  CompanyFleetChart,
  OceanJiggerChart,
  CountryCompareChart,
  DistantGearChart,
  NationFleetChart,
  VesselAgeChart,
  CountryRankChart,
  ImportFormChart,
  ImportOriginChart,
  ImportTrendChart,
  KoreaSpeciesChart,
  KoreaTrendChart,
  SpeciesMixChart,
  SpeciesTimelineChart,
  StagePriceChart,
  SquidYearbookPriceChart,
  SquidMonthlyCatchChart,
  PeruImportChart,
} from './SquidCharts';
import SquidWidgetView from './SquidWidgetView';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
  type StageNarrative,
} from './CommodityIndustryDashboard';
import { BrandMarketTable, PeruPlantTable } from './CompanyResearchTables';
import { peruImports, peruLedger, peruMeta, peruPlants } from '@/lib/data/squid-peru-supply';
import {
  AuctionPriceChart,
  FreightTrendChart,
  TradeBalanceChart,
  auctionCaption,
  freightCaption,
  tradeCaption,
} from './MofLiveCharts';
import { auctionMeta, freightMeta, tradeMeta } from '@/lib/data/mof-live';
import { getSquidCompanyResearch, getKofaSeries } from '@/lib/data/valuechain-companies';
import styles from './TunaIndustryDashboard.module.css';

const CATCH = getSquidCatchData();
const TRADE = getSquidTradeData();
const FLEET = getSquidFleetData();
const OCEAN_FLEET = getSquidOceanFleet();
const CHAIN_STAGES = getSquidChainStages();
const CROSS_STAGES = getSquidCrossStages();
const ALL_STAGES: SquidStage[] = [...CHAIN_STAGES, ...CROSS_STAGES];
const WIDGETS_META = getSquidWidgetsMeta();

const CATCH_SYNC = { status: 'STATIC' as const, syncDate: `${CATCH.요약.기준연도}년 확정` };
const TRADE_SYNC = { status: 'STATIC' as const, syncDate: `${TRADE.요약.기준연도}년 확정` };
const FLEET_SYNC = { status: 'STATIC' as const, syncDate: '2024년 말 기준' };

/**
 * 차트·위젯은 해부보고서 표가 아니라 화면용 집계를 그린다. 캡션 끝에 출처·기준을 붙여
 * 보고서 본문 수치와 다른 집계임을 밝힌다(2026-10-11 사용자 결정 7).
 */
const chartSource = (source: string, asOf: string) =>
  ` 출처 ${source} · 기준 ${asOf}. 보고서 표와 별도 집계다.`;
const FAO_SOURCE = `${CATCH._meta.출처} (오징어·갑오징어 바스켓 화면 집계)`;
const FAO_AS_OF = `${CATCH.요약.기준연도}년 확정`;
const TRADE_SOURCE = `${TRADE._meta.출처} (HS 소호 바스켓, 갑오징어 포함)`;
const TRADE_AS_OF = `${TRADE.요약.기준연도}년 확정`;

/**
 * 히어로 수치는 해부보고서 원문 값이다(01·03절 2025 수입 164,676톤·단가 4.08 USD/kg, 01·02절
 * 2024 한국 기국 어획 96,084톤 중 남서대서양 76.4%). 옛 히어로는 화면용 FAO·통관 바스켓 집계
 * (세계 어획량·살오징어 정점 대비·한국 어획량·수입량 172,449톤)를 냈다. 한국 어획량 96,084톤은
 * FAO 집계와 원문이 같은 값이라 남서대서양 몫과 함께 원문 문장으로 옮겼다. 렌더 테스트가 원문 HTML
 * 텍스트에 그대로 있는지 대조한다.
 */
export const SQUID_HERO_KPIS: HeroKpi[] = [
  { label: '한국 오징어 수입량 2025', value: 164676, unit: '(톤)', accent: SQUID_ACCENT },
  { label: '수입 단가 2025', value: 4.08, unit: '(USD/kg)', decimals: 2 },
  { label: '한국 기국 어획 2024', value: 96084, unit: '(톤)' },
  { label: '그중 남서대서양 몫', value: 76.4, unit: '(%)', decimals: 1 },
];

/**
 * 단계마다 이 페이지가 직접 그리는 차트. 선별 위젯과 달리 집계 JSON 을 원본으로 쓴다.
 * 제목은 서술이 「」로 지목하는 이름이므로 함부로 바꾸면 참조가 끊긴다(테스트가 잡는다).
 */
const SQUID_RESEARCH = getSquidCompanyResearch();
const KOFA_SERIES = getKofaSeries();
const SQUID_MONTHLY = KOFA_SERIES.월별생산2024.find((row) => row.어종 === '오징어류');

/**
 * 큐레이션 위젯을 차트 슬롯으로 옮긴다.
 *
 * 위젯은 차트·표·원문 발췌 세 형태이고 `SquidWidgetView` 가 그것을 가른다. 여기서는
 * 껍데기만 슬롯 규약에 맞춘다 — 제목·설명·텔레메트리·출처 줄.
 */
/**
 * 원문 표와 주제가 겹쳐 내린 큐레이션 위젯(2026-10-11 사용자 결정 7). 같은 표가 옛판(9월 큐레이션)과
 * 원문판(10월판) 두 벌로 보이지 않게 한다. 위젯 JSON 은 그대로 두고 화면에서만 뺀다.
 */
export const SQUID_DROPPED_WIDGETS = new Set([
  'C_import_concentration', // 04절 원산지 집중도
  'F_auction_annual', // 05절 연도·건수·위판중량
  'F_vessel_gear_2025', // 05절 어업별 척수·위판
  'F_vessel_top20_2025', // 05절 위판 상위 어선
  'F_vessel_top50_3yr', // 05절 위판 상위 어선 3개년
  'F_import_unit_annual', // 03절 연도별 추이
  'F_deepsea_catch', // 07절 원양 오징어류 어획량
  'F_deepsea_financials', // 07절 신용조사 원양 법인 11곳
  'F_processing_scale', // 08절 6년 추이
  'F_processing_region', // 09절 시도별 생산량
  'F_processing_top100', // 10절 생산량 순위
  'F_processing_financials', // 12절 가공 상위 100개사 재무
  'F_overlap_by_type', // 11절 수입 유형별 명부 일치
  'F_direct_importers', // 17절 수입과 가공이 겹치는 회사
  'F_kamis_region_2025', // 13절 지역별 값
  'F_kamis_daily_monthly', // 18절 월별 경락
  'F_kamis_origin_premium', // 13절 연근해·원양 프리미엄
  'F_kamis_wholesale', // 13절 2023~2026 시계열
  'F_kamis_retail', // 13절 2023~2026 시계열
  'E_monitoring_calendar', // 19절 최신 모니터링 신호
]);

const WIDGET_AS_OF = `큐레이션 ${String(WIDGETS_META.생성일)}`;

function widgetSlots(stageKey: string): ChartSlot[] {
  const stage = ALL_STAGES.find((entry) => entry.key === stageKey);
  return (stage?.widgets ?? []).filter((widget) => !SQUID_DROPPED_WIDGETS.has(widget.id)).map((widget) => ({
    title: widget.title,
    caption:
      (widget.thesis ?? widget.cardDesc ?? '') +
      chartSource(
        widget.source || '오징어 큐레이션 위젯 원장',
        widget.dataYear ? `${widget.dataYear}년 자료 · ${WIDGET_AS_OF}` : WIDGET_AS_OF,
      ),
    telemetry: {
      status: 'STATIC' as const,
      syncDate: widget.dataYear ? `${widget.dataYear}년 자료` : undefined,
    },
    render: () => <SquidWidgetView widget={widget} />,
    sourceLine: `출처: ${widget.source ?? '출처 미표기'}`,
  }));
}

const DW_YEAR = latestYear();
const DW_SYNC = { status: 'SYNCED' as const, syncDate: `${DW_YEAR}년 확정 · KOSIS` };

const FK_SYNC = { status: 'STATIC' as const, syncDate: `${falklandMeta.기간} 실적` };

const PERU_SYNC = { status: 'STATIC' as const, syncDate: `${peruMeta.조회일} 조사` };

const REPORT_SYNC = { status: 'STATIC' as const, syncDate: '보고서 2026년 10월판' };

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
 * 최종 해부보고서 표를 설명 문장 옆의 원래 자리로 되돌린다(명태·새우와 같다).
 *
 * 한 단계에 절이 여럿 붙으므로 절별 오프셋 구간을 따로 둔다. 그렇지 않으면 뒤 절의
 * 표가 첫 절 문장 사이에 섞인다. 손으로 만든 차트·위젯은 chartSlots 에 남아
 * 각 단계 끝 「근거」에서 그대로 렌더된다.
 */
function inlineReport(n: StageNarrative): StageNarrative {
  return industryInlineReport('squid', n, {
    telemetry: REPORT_SYNC,
    source: '한국 오징어 산업 해부',
    renderTable: (table) => <ReportTable table={table} />,
  });
}

const REPORT_STAGES = new Map(proseStages('squid').map((stage) => [stage.key, stage]));

/**
 * 해부보고서 원문에 대응 절이 없는 단계. s03(어법)·s04(쿼터와 규칙)·s05(가공과 제품)·
 * x02(지속가능성·불법어업·노동)·x04(인수 이후의 플레이 — 사내 검토)는 객관 시점의 최종
 * 보고서에 같은 주제의 절이 없어 기존 손 작성 서술을 그대로 두고, 단계 머리에
 * 「보고서 밖 사내 분석」을 단다(2026-10-11 사용자 결정 6).
 */
export const SQUID_HANDWRITTEN_STAGES = new Set(['s03', 's04', 's05', 'x02', 'x04']);

/**
 * 단계 순서·번호·제목·질문은 기존 화면 값을 쓰고(발주서 허용), 서술은 원문에서 온다.
 */
export const SQUID_REPORT_NARRATIVES: StageNarrative[] = SQUID_ALL_NARRATIVES.map((hand) => {
  if (SQUID_HANDWRITTEN_STAGES.has(hand.key)) return { ...hand, badge: '보고서 밖 사내 분석' };
  const stage = REPORT_STAGES.get(hand.key);
  if (!stage) throw new Error(`오징어 보고서에 ${hand.key} 단계 서술이 없다`);
  return inlineReport({
    ...stage,
    // 횡단축(A~D)이 사슬 단계와 따로 번호를 가져 순번 대신 기존 화면 번호를 쓴다.
    numeral: hand.numeral,
    title: hand.title,
    question: hand.question,
    paragraphs: stage.paragraphs.map(dropEmptyLabel),
    flow: stage.flow?.map((item) => item.kind === 'head' ? { ...item, text: dropEmptyLabel(item.text) } : item),
  });
});

export const SQUID_REPORT_BRIEFING = proseBriefing('squid');

/**
 * 자료의 한계. 손 작성 시절의 「09~15단계는 8월 보고서에서 옮겼다」 한 줄은 10월판 원문으로
 * 바뀐 지금 사실이 아니라 빼고, 무엇이 원문이고 무엇이 화면 집계인지를 맨 앞에 밝힌다.
 */
export const SQUID_REPORT_SOURCE_NOTES: string[] = [
  '원문 대응 단계의 본문과 표는 해부보고서 「한국 오징어 산업 해부」 2026년 10월판(제51판, 2026-10-09)에서 그대로 옮겼다. 각 단계 끝 「근거」의 차트·위젯은 화면용 집계라 캡션에 출처와 기준을 따로 적었다. 「보고서 밖 사내 분석」 단계는 원문에 대응 절이 없는 손 작성 서술이다.',
  ...SQUID_SOURCE_NOTES.filter((note) => !note.startsWith('09~15단계는')),
];

const SQUID_BASE_SLOTS: Record<string, ChartSlot[]> = {
  // 아래 셋은 공공 API 스냅숏이다. 정적 집계가 아니라 스크립트가 받아 온 값이라 SYNCED 로 적는다.
  s09: [
    {
      title: '국내 위판 일별 단가 (원/kg)',
      caption: auctionCaption('오징어') +
        chartSource(auctionMeta.출처, String(auctionMeta.기간)),
      telemetry: { status: 'SYNCED' as const, syncDate: String(auctionMeta.기간) },
      render: () => <AuctionPriceChart keyword="오징어" />,
      sourceLine: `출처: ${auctionMeta.출처} · 조회 ${auctionMeta.조회일} · scripts/sync_mof_auction.py`,
    },
  ],
  s10: [
    {
      title: '항로별 해상 운송비용과 환율 (천원/2TEU · 원/달러)',
      caption: freightCaption() +
        chartSource(freightMeta.출처, String(freightMeta.기간)),
      telemetry: { status: 'SYNCED' as const, syncDate: String(freightMeta.기간) },
      render: () => <FreightTrendChart />,
      sourceLine: `출처: ${freightMeta.출처} · 조회 ${freightMeta.조회일} · scripts/sync_landed_cost_trend.py`,
    },
    {
      title: '페루산 오징어 수입 — 냉동 원물과 조제품 (톤·달러/kg)',
      caption:
        '파랑이 냉동 원물, 노랑이 조제품(자숙 포함)이다. 2024년에 절반 아래로 꺾였다가 2025년에 42,517톤으로 돌아왔고 kg당 단가는 5년 새 두 배가 됐다. 금액으로는 조제품이 해마다 55~65%다.' +
        chartSource('관세청 수출입무역통계 HSK 10자리', `${peruMeta.조회일} 조회`),
      telemetry: PERU_SYNC,
      render: () => <PeruImportChart rows={peruImports} />,
      sourceLine: `출처: 관세청 수출입무역통계 HSK 10자리 (조회 ${peruMeta.조회일}) · ${peruMeta.보고서}`,
    },
    {
      title: '페루 제조소 — 한국행 수입신고가 많은 14곳',
      caption:
        `14곳이 신고 ${peruLedger.전체_신고건수.toLocaleString()}건 가운데 ${peruLedger.상위14사_신고건수.toLocaleString()}건이다. 등기상 한국계 경영 7곳이 ${peruLedger.한국계7사_신고건수.toLocaleString()}건이고, 사내 미팅으로 한국계임을 확인한 KSL 을 더하면 8곳 ${peruLedger.한국계_미팅포함8사_신고건수.toLocaleString()}건이다. 14곳 중 여덟 곳이 북부 파이타에 공장을 둔다. 건수는 수량이 아니다.` +
        chartSource('식약처 수입식품정보마루 수입신고 원장·페루 공장등록부', `${peruMeta.조회일} 조회`),
      telemetry: PERU_SYNC,
      span: 'full' as const,
      render: () => <PeruPlantTable rows={peruPlants} total={peruLedger.전체_신고건수} />,
      sourceLine: '출처: 식품의약품안전처 수입식품정보마루 수입신고 원장 · 페루 세무당국(SUNAT)·생산부 공장등록부·위생당국(SANIPES) 승인명부 · PROMPERÚ 2024 수출 순위',
    },
  ],
  s08: [
    {
      title: '선박별 누계 물량 (판)',
      caption:
        '30척이 한 어기에 올린 물량이다. 주황이 선민수산·현원수산 소속이다. 1위 601다가호 51,074판과 최하위 실적선 사이가 두 배다.' +
        chartSource(falklandMeta.출처, falklandMeta.기간),
      telemetry: FK_SYNC,
      span: 'full' as const,
      render: () => <FalklandVesselChart />,
      sourceLine: `출처: ${falklandMeta.출처}`,
    },
    {
      title: '회사별 선단 규모와 물량',
      caption:
        '막대가 물량, 선이 보유 척수다. 주황이 선민수산·현원수산이다. 현원수산은 0판이라 막대가 없어도 칩과 축에 남아 있다.' +
        chartSource(falklandMeta.출처, falklandMeta.기간),
      telemetry: FK_SYNC,
      render: () => <FalklandCompanyChart />,
      sourceLine: `출처: ${falklandMeta.출처}`,
    },
    {
      title: '어기 월별 선단 합계 (판)',
      caption:
        '12월에 시작해 이듬해 5월에 끝난다 - 달력 순이 아니다. 3~4월이 정점이고 5월에 급락하는 것은 어기 막바지에 배들이 빠지기 때문이다.' +
        chartSource(falklandMeta.출처, falklandMeta.기간),
      telemetry: FK_SYNC,
      render: () => <FalklandSeasonChart />,
      sourceLine: `출처: ${falklandMeta.출처}`,
    },
  ],

  s01: [
    {
      title: '어종별 어획량 구성 (톤)',
      caption:
        '갈래마다 한 색이다. 오징어는 파랑, 갑오징어는 주황, 두족류 미분류는 회색, 그 밖의 종은 노랑이다. 이 셋을 더하지 않는다.' +
        chartSource(FAO_SOURCE, FAO_AS_OF),
      telemetry: CATCH_SYNC,
      render: () => <SpeciesMixChart data={CATCH} />,
    },
    {
      title: '무엇을 오징어라 부르는가 (톤)',
      caption:
        '어획 통계의 「오징어」에는 갑오징어와 미분류가 섞여 있다. 이 셋을 자동으로 더하지 않는 것이 이 품목 자료의 첫 규칙이다.' +
        chartSource(FAO_SOURCE, FAO_AS_OF),
      telemetry: CATCH_SYNC,
      render: () => <BasketChart data={CATCH} />,
    },
  ],
  s02: [
    {
      title: '해역별 어획량 (톤)',
      caption: '다섯 해역이 세계의 89.5%를 낸다. 그중 셋이 남미 앞바다다.' +
        chartSource(FAO_SOURCE, FAO_AS_OF),
      telemetry: CATCH_SYNC,
      render: () => <AreaRankChart data={CATCH} />,
    },
  ],
  s03: [
    {
      title: '연근해 업종별 선박 수와 척당 배분량 (척·톤)',
      caption:
        '막대는 선박 수, 선은 척당 배분량이다. 가장 작은 근해자망 18.6톤과 대형트롤 368.1톤이 20배 벌어진다 - 이 배들을 더해 「오징어 어선」이라 부를 수 없다.' +
        chartSource('한국수산자원공단 총허용어획량 소진표', '2025/26 어기'),
      telemetry: { status: 'STATIC' as const, syncDate: '2025/26 어기' },
      render: () => <CoastalGearChart data={FLEET} />,
    },
    {
      title: '원양 업종별 선박 수와 선령 (척)',
      caption:
        '주황이 선령 31년 이상이다. 한국 원양어선 198척 중 157척이 31년을 넘었고, 오징어채낚기는 20척 중 18척이다.' +
        chartSource('한국원양산업협회 2025 원양산업 통계연보', '2024년 말'),
      telemetry: FLEET_SYNC,
      render: () => <DistantGearChart data={FLEET} />,
    },
    {
      title: '선사별 채낚기 선단 (척·톤)',
      caption:
        '막대는 보유 척수, 선은 선단 합계 톤수다. 열 개 회사가 스무 척을 나눠 갖는데 여섯 척을 가진 곳과 한 척뿐인 곳이 섞여 있다 - 「오징어 선사」를 한 덩어리로 부르면 이 차이가 사라진다.' +
        chartSource('한국원양산업협회 2025 원양산업 통계연보', '2024년 말'),
      telemetry: FLEET_SYNC,
      render: () => <CompanyFleetChart data={FLEET} />,
    },
    {
      title: '남태평양 공해 채낚기 선단 (척·톤)',
      caption:
        '막대는 척수, 선은 척당 평균 톤수다. 페루 1,013척은 평균 25톤짜리 소형선이고 중국 609척은 평균 948톤이다 - 같은 「채낚기」라도 배가 40배 다르다. 주황이 한국(30척·평균 917톤)이다. ⚠ 이 등록부는 소유사를 공개하지 않아 선사 단위로는 갈 수 없다.' +
        chartSource(String(OCEAN_FLEET._meta.출처), '2026년 8월 등록부'),
      telemetry: { status: 'STATIC' as const, syncDate: '2026년 8월 등록부' },
      render: () => <OceanJiggerChart data={OCEAN_FLEET} />,
    },
    {
      title: '어획 상위 12개국 (톤)',
      caption: '1위 중국은 자국 연안이 아니라 원양에서 대부분을 잡는다. 주황이 한국이다.' +
        chartSource(FAO_SOURCE, FAO_AS_OF),
      telemetry: CATCH_SYNC,
      render: () => <CountryRankChart data={CATCH} />,
      // 차트는 상위 12개국까지다. 15개 중 3개가 잘렸다는 사실은 그래프에 안 나온다.
    },
    {
      title: '오징어채낚기 업종 생산량 (톤)',
      caption:
        '해양수산부 원양어업통계조사 - 원양어업 허가 어선 전수조사다. 2021년 50,947톤에서 2023년 17,112톤까지 내려갔다가 2024년 39,942톤으로 돌아왔다. 원양만 담으므로 이 페이지의 FAO 기준 수치와 더할 수 없다.' +
        chartSource(deepseaMeta.출처, `${DW_YEAR}년 확정`),
      telemetry: DW_SYNC,
      render: () => <SquidGearProductionChart />,
      sourceLine: `출처: ${deepseaMeta.출처}`,
    },
    {
      title: '해역별 오징어류 생산량 (톤)',
      caption:
        '주황이 태평양 동남부 - SPRFMO 관할 수역이다. 해역이 계층이라 「대서양」 안에 「서남부」가 들어 있으므로 막대를 더하면 이중계상이 된다.' +
        chartSource(deepseaMeta.출처, `${DW_YEAR}년 확정`),
      telemetry: DW_SYNC,
      render: () => <SquidAreaChart year={DW_YEAR} />,
      sourceLine: `출처: ${deepseaMeta.출처}`,
    },
    {
      title: '보유 척수 구간별 오징어류 생산량 (톤)',
      caption:
        '회사명은 공표되지 않지만 회사를 보유 척수로 묶은 축이라, 회사별 명부와 맞대면 어느 구간에 어느 회사가 들어가는지는 안다. 구간 안에서 회사별로 쪼개지지는 않는다 - 그건 추정이지 실적이 아니다.' +
        chartSource(deepseaMeta.출처, `${DW_YEAR}년 확정`),
      telemetry: DW_SYNC,
      render: () => <SquidSizeBandChart year={DW_YEAR} />,
      sourceLine: `출처: ${deepseaMeta.출처}`,
    },
  ],
  s05: [
    {
      title: '한국 수입의 형태 구성 (톤)',
      caption:
        '한국이 사 오는 것의 4분의 3이 원물이다. 완제품 비중이 그 다음이고, 건조·염장은 물량으로는 작다 - 단가는 그 반대다.' +
        chartSource(TRADE_SOURCE, TRADE_AS_OF),
      telemetry: TRADE_SYNC,
      render: () => <ImportFormChart data={TRADE} />,
    },
  ],
  s06: [
    {
      title: '오징어 월별 수출입과 무역수지 (백만 달러)',
      caption: tradeCaption('오징어') +
        chartSource(tradeMeta.출처, String(tradeMeta.기간)),
      telemetry: { status: 'SYNCED' as const, syncDate: String(tradeMeta.기간) },
      render: () => <TradeBalanceChart keyword="오징어" />,
      sourceLine: `출처: ${tradeMeta.출처} · 조회 ${tradeMeta.조회일} · scripts/sync_mof_trade.py`,
    },
    {
      title: '한국 수입량과 수입단가 (톤·달러/톤)',
      caption: '막대는 수입량, 선은 톤당 단가다. 적게 사면서 비싸게 사는 흐름이 보인다.' +
        chartSource(TRADE_SOURCE, TRADE_AS_OF),
      telemetry: TRADE_SYNC,
      render: () => <ImportTrendChart data={TRADE} />,
    },
    {
      title: '수입 상대국별 규모와 단가 (백만 달러·달러/톤)',
      caption:
        '1위 중국은 가공·재수출국이라 그 물량 안에 남미산 원물이 섞여 있다. 상대국을 원산지로 읽으면 틀린다.' +
        chartSource(TRADE_SOURCE, TRADE_AS_OF),
      telemetry: TRADE_SYNC,
      render: () => <ImportOriginChart data={TRADE} />,
    },
  ],
  s07: [
    {
      title: '한국 원양 오징어 어가 - 수역별 연평균 (원/kg)',
      caption:
        '원양산업 통계연보 어가표의 연평균 열(2015~2024). 남서대서양 어가가 2015년 1,555원에서 2024년 6,637원으로 4.3배 뛰었다 - 국내 연근해 흉어와 세계 공급 수축이 원양 원료가에 그대로 얹힌 궤적이다. 결측 연도(조업 없음)는 선이 끊긴다.' +
        chartSource('한국원양산업협회 원양산업 통계연보 어가표', '연보 2015~2024'),
      telemetry: { status: 'STATIC' as const, syncDate: '연보 2015~2024' },
      render: () => <SquidYearbookPriceChart rows={KOFA_SERIES.어가.오징어원kg} />,
    },
    {
      title: '브랜드와 점유율 (성격 구분)',
      caption: SQUID_RESEARCH.브랜드.요지 +
        chartSource('공개 자료 기업조사', '2026-08-17 조사'),
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <BrandMarketTable rows={SQUID_RESEARCH.브랜드.rows} />,
    },
    {
      title: '품목 단계별 수입액과 단가 (달러/톤)',
      caption:
        '건조·염장이 원물의 일곱 배로 보이는 것은 가공 부가가치가 아니라 수분을 뺀 농축 때문이다. 무엇이 그 1톤에 담겼는지를 먼저 봐야 한다.' +
        chartSource(TRADE_SOURCE, TRADE_AS_OF),
      telemetry: TRADE_SYNC,
      render: () => <StagePriceChart data={TRADE} />,
    },
  ],
  x01: [
    {
      title: '살오징어 어획량 - 세계와 한국 (톤)',
      caption:
        '세계는 1968년, 한국은 1996년이 정점이다. 두 선이 함께 내려앉는 동안 오징어 전체 어획량은 유지됐다.' +
        chartSource(FAO_SOURCE, FAO_AS_OF),
      telemetry: CATCH_SYNC,
      render: () => <CollapseChart data={CATCH} />,
    },
    {
      title: '주요 어종 어획량 추이 (톤)',
      caption: '2024년 규모 상위 5종의 자리바꿈이다. 살오징어 붕괴는 위 「살오징어 어획량 - 세계와 한국 (톤)」에 따로 있다.' +
        chartSource(FAO_SOURCE, FAO_AS_OF),
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <SpeciesTimelineChart data={CATCH} />,
    },
  ],
  x03: [
    {
      title: '한국 원양 오징어류 월별 생산 - 2024년 (톤)',
      caption:
        '연보 월별 실적 전사(계 63,156톤, 검산 일치). 상반기(1~5월)에 물량이 두껍다 - 남서대서양 어기가 상반기에 걸리는 구조라, 국내 재고·가격 판단은 이 리듬 위에서 읽어야 한다.' +
        chartSource('한국원양산업협회 원양산업 통계연보 월별 실적', '연보 2024'),
      telemetry: { status: 'STATIC' as const, syncDate: '연보 2024' },
      render: () => (SQUID_MONTHLY ? <SquidMonthlyCatchChart months={SQUID_MONTHLY.월별} /> : null),
    },
    {
      title: '오징어채낚기 선박별 선령 (년)',
      caption:
        '주황이 31년 이상이다. 20척 평균 선령 36.5년, 최고 51년이다. 2020년 건조 2척을 빼면 대부분 1970~80년대 배다.' +
        chartSource('한국원양산업협회 2025 원양산업 통계연보', '2024년 말'),
      telemetry: FLEET_SYNC,
      render: () => <VesselAgeChart data={FLEET} />,
    },
    {
      title: '한·일·대만 채낚기 선단 (척·톤)',
      caption:
        '막대는 척수, 선은 평균 톤수다. 한국은 큰 배로 원양에, 일본은 작은 배로 근해에 나간다. 대만은 톤수가 공개되지 않는다.' +
        chartSource('한국원양산업협회 통계연보·일본 수산청 허가선 명부·대만 농업부 개방데이터', '2024~2026년'),
      telemetry: { status: 'STATIC' as const, syncDate: '2024~2026년' },
      render: () => <NationFleetChart data={FLEET} />,
    },
    {
      title: '한국 어획량과 세계 점유율 (톤·%)',
      caption: '막대는 어획량, 선은 세계에서 차지하는 몫이다.' +
        chartSource(FAO_SOURCE, FAO_AS_OF),
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <KoreaTrendChart data={CATCH} />,
    },
    {
      title: '주요국 오징어 수출입 (백만 달러)',
      caption:
        '한국은 사는 쪽이다. 아르헨티나·칠레·페루는 파는 쪽이고, 스페인은 사서 되판다. 페루는 2025년 보고가 없어 2024년 값이다.' +
        chartSource('국제연합 상품무역통계', `${TRADE.요약.기준연도}년 보고분`),
      telemetry: TRADE_SYNC,
      render: () => <CountryCompareChart data={TRADE} />,
    },
    {
      title: '한국 어종별 어획량 (톤)',
      caption:
        '파랑이 살오징어다(나머지는 회색). 연근해 자원이 한국 오징어 어획에서 차지하는 몫이 이만큼으로 줄었다.' +
        chartSource(FAO_SOURCE, FAO_AS_OF),
      telemetry: CATCH_SYNC,
      render: () => <KoreaSpeciesChart data={CATCH} />,
    },
  ],
};

/** 차트 슬롯 + 위젯 슬롯. 위젯이 있는 단계는 차트 뒤에 이어 붙는다(기존 배치 유지). */
export const SQUID_CHART_SLOTS: Record<string, ChartSlot[]> = Object.fromEntries(
  // 단계 목록과 같은 정본을 쓴다. `ALL_STAGES`(위젯 JSON)로 돌면 위젯이 없는 단계의
  // 차트가 통째로 빠진다 — 08 선박별이 그렇게 조용히 비었다.
  [
    ...new Set([
      ...Object.keys(SQUID_BASE_SLOTS),
      ...ALL_STAGES.map((s) => s.key),
    ]),
  ].map((key) => [key, [...(SQUID_BASE_SLOTS[key] ?? []), ...widgetSlots(key)]]),
);

const SPEC: CommoditySpec = {
  // 2026-09-10 사용자 지시: 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다(기업 해부와 동일).
  continuous: true,
  key: 'squid',
  title: '오징어',
  subtitle:
    '오징어 산업 해부 · 한 해살이 자원이 만드는 시장 · 사슬 15단계와 그것을 관통하는 3개 축',
  accent: SQUID_ACCENT,
  primaryKpi: SQUID_HERO_KPIS[0],
  secondaryKpis: SQUID_HERO_KPIS.slice(1),
  // 히어로 띠도 원문 04·19절 값이다(옛 띠의 9/8 소비자가·9/10 도매·9/1 칠레·8/30 페루는
  // 10월판 원문에 없다). 19절 표 51 주석이 기준일 뒤 갱신값으로 적은 것을 쓴다.
  stripItems: [
    {
      now: true,
      eyebrow: '소비자가',
      title: '한국 소비자가',
      body: '5,348원/마리 (10월 1일 확정)',
    },
    {
      eyebrow: '서울 도매',
      title: '연근해·원양 냉동',
      body: '13,700 · 10,400원/kg (10월 5일)',
    },
    {
      eyebrow: '칠레 쿼터',
      title: '소진율',
      body: '72.6734% (9월 29일 기준)',
    },
    {
      eyebrow: '페루',
      title: '연간 한도',
      body: '98.48% 양륙 (10월 5일 진도 공지)',
    },
  ],
  // 30초 브리핑은 원문 절마다의 리드 문장이다.
  briefing: SQUID_REPORT_BRIEFING,
  // 서술 정본은 손 작성 단계 목록(SQUID_ALL_NARRATIVES)의 순서·번호·제목이고, 원문 대응 단계의
  // 본문은 해부보고서에서 온다. JSON 에만 있고 서술이 없는 단계는 제목만이라도 남긴다.
  narratives: [
    ...SQUID_REPORT_NARRATIVES,
    ...ALL_STAGES.filter((stage) => !SQUID_REPORT_NARRATIVES.some((n) => n.key === stage.key)).map(
      (stage) => ({
        key: stage.key,
        numeral: '',
        title: stage.title,
        question: '',
        lede: '',
        paragraphs: [],
        facts: [],
        terms: [],
      }),
    ),
  ],
  chartSlots: SQUID_CHART_SLOTS,
  sourceNotes: SQUID_REPORT_SOURCE_NOTES,
  sourceMeta: [
    '본문·표 해부보고서 2026년 10월판',
    `어획 집계 · ${CATCH._meta.출처} · 기준 ${CATCH._meta.기준연도}년 · 갱신 ${CATCH._meta.생성일}`,
    `통관 집계 · ${TRADE._meta.출처}`,
    `위젯 ${String(WIDGETS_META.선별)}개 (${String(WIDGETS_META.원본)})`,
  ].join(' · '),
};

export interface SquidIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function SquidIndustryDashboard({
  heroOnly = false,
}: SquidIndustryDashboardProps) {
  return (
    <FalklandMonthProvider>
      <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />
    </FalklandMonthProvider>
  );
}
