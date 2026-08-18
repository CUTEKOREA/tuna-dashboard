/**
 * 「시장 이해 > 오징어」 — 밸류체인 7단계 + 횡단 3축.
 *
 * 참치 페이지와 같은 골격이고 CSS 도 같은 모듈을 쓴다. 다른 것은 셋이다.
 *  · 원본 위젯이 차트뿐 아니라 표·원문 발췌라서 `SquidWidgetView` 가 세 형태를 다룬다
 *  · 위젯마다 측정 게이트(`basis`)를 함께 싣는다 — 이 수치를 무엇과 비교하면 안 되는지
 *  · 시그니처 색이 두족류(purple → pink)다
 *
 * 단계 렌더링은 `CommodityIndustryDashboard` 가 갖는다. 원래 이 파일과 참치가 각자 복사본을
 * 들고 있었고, 「세 번째 품목이 생기면 빼내라」는 메모가 붙어 있었다 — 새우·고등어·골뱅이가
 * 생겨 조건이 채워졌고, 탭 내비와 조종석 보조 지표를 세 곳에 따로 넣게 되면서 값이 확실해졌다.
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
import {
  SQUID_ALL_NARRATIVES,
  SQUID_BRIEFING_POINTS,
  SQUID_SOURCE_NOTES,
} from '@/lib/squid-industry-content';
import { SQUID_ROLE } from '@/lib/squid-chart-colors';

const SQUID_ACCENT = SQUID_ROLE.volume;
import { SeriesStats } from './CockpitExtra';
import {
  FalklandCompanyChart,
  FalklandSeasonChart,
  FalklandVesselChart,
  SquidAreaChart,
  SquidGearProductionChart,
  SquidSizeBandChart,
} from './SquidCharts';
import {
  companiesByMonth,
  falklandMeta,
  panFor,
  seasonTotals,
  vesselsByMonth,
} from '@/lib/data/falkland-squid-vessels';
import { FalklandMonthProvider, useFalklandMonth } from './FalklandMonthFilter';

function FalklandVesselStats() {
  const { month } = useFalklandMonth();
  const rows = vesselsByMonth(month).map((vessel) => ({
    name: vessel.name,
    pan: panFor(vessel, month),
  }));
  return <SeriesStats rows={rows} labelKey="name" valueKey="pan" unit="(판)" sum />;
}

function FalklandCompanyStats() {
  const { month } = useFalklandMonth();
  return (
    <SeriesStats
      rows={companiesByMonth(month)}
      labelKey="name"
      valueKey="totalPan"
      unit="(판)"
      sum
    />
  );
}
import {
  deepseaMeta,
  latestYear,
  squidByArea,
  squidBySizeBand,
  squidGearSeries,
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
} from './SquidCharts';
import SquidWidgetView from './SquidWidgetView';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';
import {
  TraderTable,
  CanneryCountryTable,
  BrandMarketTable,
} from './CompanyResearchTables';
import { getSquidCompanyResearch, getKofaSeries } from '@/lib/data/valuechain-companies';

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
const FLYING_SQUID_VS_PEAK_PCT = Number(
  ((CATCH.요약.살오징어세계최신 / CATCH.요약.살오징어세계정점) * 100).toFixed(1),
);


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
function widgetSlots(stageKey: string): ChartSlot[] {
  const stage = ALL_STAGES.find((entry) => entry.key === stageKey);
  return (stage?.widgets ?? []).map((widget) => ({
    title: widget.title,
    caption: widget.thesis ?? widget.cardDesc ?? '',
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

const SQUID_BASE_SLOTS: Record<string, ChartSlot[]> = {
  s08: [
    {
      title: '선박별 누계 물량 (판)',
      caption:
        '30척이 한 어기에 올린 물량이다. 진한 장미색이 선민수산·현원수산 소속이다. 1위 601다가호 51,074판과 최하위 실적선 사이가 두 배다.',
      telemetry: FK_SYNC,
      span: 'full' as const,
      render: () => <FalklandVesselChart />,
      cockpitExtra: () => <FalklandVesselStats />,
      sourceLine: `출처: ${falklandMeta.출처}`,
    },
    {
      title: '회사별 선단 규모와 물량',
      caption:
        '막대가 물량, 선이 보유 척수다. 진한 장미색이 선민수산·현원수산이다. 현원수산은 0판이라 막대가 없어도 칩과 축에 남아 있다.',
      telemetry: FK_SYNC,
      render: () => <FalklandCompanyChart />,
      cockpitExtra: () => <FalklandCompanyStats />,
      sourceLine: `출처: ${falklandMeta.출처}`,
    },
    {
      title: '어기 월별 선단 합계 (판)',
      caption:
        '12월에 시작해 이듬해 5월에 끝난다 — 달력 순이 아니다. 3~4월이 정점이고 5월에 급락하는 것은 어기 막바지에 배들이 빠지기 때문이다.',
      telemetry: FK_SYNC,
      render: () => <FalklandSeasonChart />,
      cockpitExtra: () => (
        <SeriesStats rows={seasonTotals()} labelKey="월" valueKey="물량" unit="(판)" sum />
      ),
      sourceLine: `출처: ${falklandMeta.출처}`,
    },
  ],

  s01: [
    {
      title: '어종별 어획량 구성 (톤)',
      caption:
        '같은 갈래는 비슷한 색이다. 오징어는 보라·남색, 갑오징어는 장미, 두족류 미분류는 회색, 그 밖의 종은 호박이다. 이 셋을 더하지 않는다.',
      telemetry: CATCH_SYNC,
      render: () => <SpeciesMixChart data={CATCH} />,
      cockpitExtra: () => (
        <SeriesStats rows={CATCH.어종구성} labelKey="어종" valueKey="어획량" unit="(톤)" sum />
      ),
    },
    {
      title: '무엇을 오징어라 부르는가 (톤)',
      caption:
        '어획 통계의 「오징어」에는 갑오징어와 미분류가 섞여 있다. 이 셋을 자동으로 더하지 않는 것이 이 품목 자료의 첫 규칙이다.',
      telemetry: CATCH_SYNC,
      render: () => <BasketChart data={CATCH} />,
    },
  ],
  s02: [
    {
      title: '공급 기업 — 누가 잡고 누가 파는가',
      caption: SQUID_RESEARCH.공급.요지,
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <TraderTable rows={SQUID_RESEARCH.공급.rows} />,
    },
    {
      title: '해역별 어획량 (톤)',
      caption: '다섯 해역이 세계의 89.5%를 낸다. 그중 셋이 남미 앞바다다.',
      telemetry: CATCH_SYNC,
      render: () => <AreaRankChart data={CATCH} />,
    },
  ],
  s03: [
    {
      title: '연근해 업종별 선박 수와 척당 배분량 (척·톤)',
      caption:
        '막대는 선박 수, 선은 척당 배분량이다. 가장 작은 근해자망 18.6톤과 대형트롤 368.1톤이 20배 벌어진다 — 이 배들을 더해 「오징어 어선」이라 부를 수 없다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2025/26 어기' },
      render: () => <CoastalGearChart data={FLEET} />,
    },
    {
      title: '원양 업종별 선박 수와 선령 (척)',
      caption:
        '분홍이 선령 31년 이상이다. 한국 원양어선 198척 중 157척이 31년을 넘었고, 오징어채낚기는 20척 중 18척이다.',
      telemetry: FLEET_SYNC,
      render: () => <DistantGearChart data={FLEET} />,
    },
    {
      title: '선사별 채낚기 선단 (척·톤)',
      caption:
        '막대는 보유 척수, 선은 선단 합계 톤수다. 열 개 회사가 스무 척을 나눠 갖는데 여섯 척을 가진 곳과 한 척뿐인 곳이 섞여 있다 — 「오징어 선사」를 한 덩어리로 부르면 이 차이가 사라진다.',
      telemetry: FLEET_SYNC,
      render: () => <CompanyFleetChart data={FLEET} />,
    },
    {
      title: '남태평양 공해 채낚기 선단 (척·톤)',
      caption:
        '막대는 척수, 선은 척당 평균 톤수다. 페루 1,013척은 평균 25톤짜리 소형선이고 중국 609척은 평균 948톤이다 — 같은 「채낚기」라도 배가 40배 다르다. 장미색이 한국(30척·평균 917톤)이다. ⚠ 이 등록부는 소유사를 공개하지 않아 선사 단위로는 갈 수 없다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2026년 8월 등록부' },
      render: () => <OceanJiggerChart data={OCEAN_FLEET} />,
    },
    {
      title: '어획 상위 12개국 (톤)',
      caption: '1위 중국은 자국 연안이 아니라 원양에서 대부분을 잡는다. 장미색이 한국이다.',
      telemetry: CATCH_SYNC,
      render: () => <CountryRankChart data={CATCH} />,
      // 차트는 상위 12개국까지다. 15개 중 3개가 잘렸다는 사실은 그래프에 안 나온다.
      cockpitExtra: () => (
        <SeriesStats
          rows={CATCH.국가순위}
          labelKey="국가"
          valueKey="어획량"
          unit="(톤)"
          shown={12}
          sum
        />
      ),
    },
    {
      title: '오징어채낚기 업종 생산량 (톤)',
      caption:
        '해양수산부 원양어업통계조사 — 원양어업 허가 어선 전수조사다. 2021년 50,947톤에서 2023년 17,112톤까지 내려갔다가 2024년 39,942톤으로 돌아왔다. 원양만 담으므로 이 페이지의 FAO 기준 수치와 더할 수 없다.',
      telemetry: DW_SYNC,
      render: () => <SquidGearProductionChart />,
      cockpitExtra: () => (
        <SeriesStats rows={squidGearSeries()} labelKey="연도" valueKey="생산량" unit="(톤)" />
      ),
      sourceLine: `출처: ${deepseaMeta.출처}`,
    },
    {
      title: '해역별 오징어류 생산량 (톤)',
      caption:
        '분홍이 태평양 동남부 — SPRFMO 관할 수역이다. 해역이 계층이라 「대서양」 안에 「서남부」가 들어 있으므로 막대를 더하면 이중계상이 된다.',
      telemetry: DW_SYNC,
      render: () => <SquidAreaChart year={DW_YEAR} />,
      cockpitExtra: () => (
        <SeriesStats rows={squidByArea(DW_YEAR)} labelKey="해역" valueKey="생산량" unit="(톤)" />
      ),
      sourceLine: `출처: ${deepseaMeta.출처}`,
    },
    {
      title: '보유 척수 구간별 오징어류 생산량 (톤)',
      caption:
        '회사명은 공표되지 않지만 회사를 보유 척수로 묶은 축이라, 회사별 명부와 맞대면 어느 구간에 어느 회사가 들어가는지는 안다. 구간 안에서 회사별로 쪼개지지는 않는다 — 그건 추정이지 실적이 아니다.',
      telemetry: DW_SYNC,
      render: () => <SquidSizeBandChart year={DW_YEAR} />,
      cockpitExtra: () => (
        <SeriesStats rows={squidBySizeBand(DW_YEAR)} labelKey="구간" valueKey="생산량" unit="(톤)" sum />
      ),
      sourceLine: `출처: ${deepseaMeta.출처}`,
    },
  ],
  s05: [
    {
      title: '국가별 가공 거점과 기업',
      caption: SQUID_RESEARCH.가공.요지,
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <CanneryCountryTable rows={SQUID_RESEARCH.가공.rows} />,
    },
    {
      title: '한국 수입의 형태 구성 (톤)',
      caption:
        '한국이 사 오는 것의 4분의 3이 원물이다. 완제품 비중이 그 다음이고, 건조·염장은 물량으로는 작다 — 단가는 그 반대다.',
      telemetry: TRADE_SYNC,
      render: () => <ImportFormChart data={TRADE} />,
    },
  ],
  s06: [
    {
      title: '한국 수입량과 수입단가 (톤·달러/톤)',
      caption: '막대는 수입량, 선은 톤당 단가다. 적게 사면서 비싸게 사는 흐름이 보인다.',
      telemetry: TRADE_SYNC,
      span: 'full',
      render: () => <ImportTrendChart data={TRADE} />,
    },
    {
      title: '수입 상대국별 규모와 단가 (백만 달러·달러/톤)',
      caption:
        '1위 중국은 가공·재수출국이라 그 물량 안에 남미산 원물이 섞여 있다. 상대국을 원산지로 읽으면 틀린다.',
      telemetry: TRADE_SYNC,
      render: () => <ImportOriginChart data={TRADE} />,
    },
  ],
  s07: [
    {
      title: '한국 원양 오징어 어가 — 수역별 연평균 (원/kg)',
      caption:
        '원양산업 통계연보 어가표의 연평균 열(2015~2024). 남서대서양 어가가 2015년 1,555원에서 2024년 6,637원으로 4.3배 뛰었다 — 국내 연근해 흉어와 세계 공급 수축이 원양 원료가에 그대로 얹힌 궤적이다. 결측 연도(조업 없음)는 선이 끊긴다.',
      telemetry: { status: 'STATIC' as const, syncDate: '연보 2015~2024' },
      render: () => <SquidYearbookPriceChart rows={KOFA_SERIES.어가.오징어원kg} />,
    },
    {
      title: '브랜드와 점유율 (성격 구분)',
      caption: SQUID_RESEARCH.브랜드.요지,
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <BrandMarketTable rows={SQUID_RESEARCH.브랜드.rows} />,
    },
    {
      title: '품목 단계별 수입액과 단가 (달러/톤)',
      caption:
        '건조·염장이 원물의 일곱 배로 보이는 것은 가공 부가가치가 아니라 수분을 뺀 농축 때문이다. 무엇이 그 1톤에 담겼는지를 먼저 봐야 한다.',
      telemetry: TRADE_SYNC,
      render: () => <StagePriceChart data={TRADE} />,
    },
  ],
  x01: [
    {
      title: '살오징어 어획량 — 세계와 한국 (톤)',
      caption:
        '세계는 1968년, 한국은 1996년이 정점이다. 두 선이 함께 내려앉는 동안 오징어 전체 어획량은 유지됐다.',
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <CollapseChart data={CATCH} />,
    },
    {
      title: '주요 어종 어획량 추이 (톤)',
      caption: '2024년 규모 상위 5종의 자리바꿈이다. 살오징어 붕괴는 위 「살오징어 어획량 — 세계와 한국 (톤)」에 따로 있다.',
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <SpeciesTimelineChart data={CATCH} />,
    },
  ],
  x03: [
    {
      title: '한국 원양 오징어류 월별 생산 — 2024년 (톤)',
      caption:
        '연보 월별 실적 전사(계 63,156톤, 검산 일치). 상반기(1~5월)에 물량이 두껍다 — 남서대서양 어기가 상반기에 걸리는 구조라, 국내 재고·가격 판단은 이 리듬 위에서 읽어야 한다.',
      telemetry: { status: 'STATIC' as const, syncDate: '연보 2024' },
      render: () => (SQUID_MONTHLY ? <SquidMonthlyCatchChart months={SQUID_MONTHLY.월별} /> : null),
    },
    {
      title: '오징어채낚기 선박별 선령 (년)',
      caption:
        '분홍이 31년 이상이다. 20척 평균 선령 36.5년, 최고 51년이다. 2020년 건조 2척을 빼면 대부분 1970~80년대 배다.',
      telemetry: FLEET_SYNC,
      span: 'full',
      render: () => <VesselAgeChart data={FLEET} />,
    },
    {
      title: '한·일·대만 채낚기 선단 (척·톤)',
      caption:
        '막대는 척수, 선은 평균 톤수다. 한국은 큰 배로 원양에, 일본은 작은 배로 근해에 나간다. 대만은 톤수가 공개되지 않는다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2024~2026년' },
      render: () => <NationFleetChart data={FLEET} />,
    },
    {
      title: '한국 어획량과 세계 점유율 (톤·%)',
      caption: '막대는 어획량, 선은 세계에서 차지하는 몫이다.',
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <KoreaTrendChart data={CATCH} />,
    },
    {
      title: '주요국 오징어 수출입 (백만 달러)',
      caption:
        '한국은 사는 쪽이다. 아르헨티나·칠레·페루는 파는 쪽이고, 스페인은 사서 되판다. 페루는 2025년 보고가 없어 2024년 값이다.',
      telemetry: TRADE_SYNC,
      render: () => <CountryCompareChart data={TRADE} />,
    },
    {
      title: '한국 어종별 어획량 (톤)',
      caption:
        '보라는 살오징어다. 연근해 자원이 한국 오징어 어획에서 차지하는 몫이 이만큼으로 줄었다.',
      telemetry: CATCH_SYNC,
      render: () => <KoreaSpeciesChart data={CATCH} />,
    },
  ],
};

/** 차트 슬롯 + 위젯 슬롯. 위젯이 있는 단계는 차트 뒤에 이어 붙는다(기존 배치 유지). */
export const SQUID_CHART_SLOTS: Record<string, ChartSlot[]> = Object.fromEntries(
  // 단계 목록과 같은 정본을 쓴다. `ALL_STAGES`(위젯 JSON)로 돌면 위젯이 없는 단계의
  // 차트가 통째로 빠진다 — 08 선박별이 그렇게 조용히 비었다.
  [...new Set([...Object.keys(SQUID_BASE_SLOTS), ...ALL_STAGES.map((s) => s.key)])].map((key) => [
    key,
    [...(SQUID_BASE_SLOTS[key] ?? []), ...widgetSlots(key)],
  ]),
);


const SPEC: CommoditySpec = {
  key: 'squid',
  title: '오징어',
  subtitle:
    '오징어 산업 해부 · 한 해살이 자원이 만드는 시장 — 밸류체인 7단계와 그것을 관통하는 3개 축',
  accent: SQUID_ACCENT,
  primaryKpi: {
    label: '세계 오징어·갑오징어 어획량',
    value: CATCH.요약.세계어획량,
    unit: '(톤)',
    accent: SQUID_ACCENT,
  },
  secondaryKpis: [
    { label: '살오징어 정점 대비', value: FLYING_SQUID_VS_PEAK_PCT, unit: '(%)', decimals: 1 },
    { label: '한국 어획량', value: CATCH.요약.한국어획량, unit: '(톤)' },
    { label: '한국 수입량', value: TRADE.요약.수입량, unit: '(톤)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '기준',
      title: '세계 어획량',
      body: `${CATCH.요약.세계어획량.toLocaleString('ko-KR')} (톤)`,
    },
    {
      eyebrow: '살오징어',
      title: '정점 대비',
      body: `${FLYING_SQUID_VS_PEAK_PCT.toLocaleString('ko-KR', { maximumFractionDigits: 1 })} (%)`,
    },
    {
      eyebrow: '한국',
      title: '국내 어획량',
      body: `${CATCH.요약.한국어획량.toLocaleString('ko-KR')} (톤)`,
    },
  ],
  // 오징어 브리핑은 원래 단계 귀속 없이 문장만 있었다. 공용 골격은 귀속이 있을 때만
  // 「N단계에서 보기」 버튼을 내므로, 빈 stage 를 주면 기존 화면 그대로다.
  briefing: SQUID_BRIEFING_POINTS.map((text) => ({ stage: '', text })),
  // 위젯 JSON(ALL_STAGES)이 아니라 **서술**이 단계 목록을 정한다.
  //
  // 원래는 JSON 을 기준으로 삼았는데, 그러면 큐레이션 위젯이 없는 단계는 서술을 써도
  // 화면에 안 나온다. 08(선박별)이 그런 경우다 — 위젯 없이 사내 자료 차트만 붙는다.
  // JSON 에만 있고 서술이 없는 단계는 제목만이라도 남기므로 양쪽을 합친다.
  narratives: [
    ...SQUID_ALL_NARRATIVES,
    ...ALL_STAGES.filter((stage) => !SQUID_ALL_NARRATIVES.some((n) => n.key === stage.key)).map(
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
  sourceNotes: SQUID_SOURCE_NOTES,
  sourceMeta: [
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
