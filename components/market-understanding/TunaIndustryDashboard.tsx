/**
 * 「시장 이해 > 참치」 — 참치 산업 해부
 *
 * 「실시간 운영」이 지금 얼마인지를 감시한다면, 이 페이지는 **왜 이런 구조인지**를 설명한다.
 * 그래서 본체가 차트가 아니라 서술이고, 차트는 서술의 근거로 붙는다.
 *
 * 구성
 *  - 히어로: 산업의 크기 세 숫자
 *  - 30초 브리핑: 스크롤하지 않을 사람을 위한 출구
 *  - 분기도: 어법에서 갈린 두 경로가 소비까지 이어지는 그림
 *  - 사슬 7단계 + 횡단 3축: 각 단계는 서술 → 검증 수치 → 차트 순
 *  - 출처와 한계: 무엇을 확인했고 무엇을 확인 못 했는지
 *
 * 모든 수치의 근거는 `docs/2026-08-16_tuna_valuechain_sources.md`.
 */
'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { ArrowRight, BookOpen, Fish } from 'lucide-react';

import {
  getChainStages,
  getCrossStages,
  getSkjPriceTimeline,
  getTunaCatchData,
  getTunaIndustryWidgetsMeta,
  getTunaFleetData,
  getTunaGlossary,
  getTunaTradeData,
  SKJ_HUBS,
  type IndustryStage,
} from '@/lib/data/tuna-industry';
import {
  getTunaCompanyData,
  getTunaOceanOperators,
  getTunaCarrierFleet,
  getTunaCompanyResearch,
  getKofaFleetAge,
  getKofaInsights,
  getKofaSeries,
} from '@/lib/data/valuechain-companies';
import {
  BRIEFING_POINTS,
  getNarrative,
  SOURCE_NOTES,
  type FactRow,
  type StageNarrative,
} from '@/lib/tuna-industry-content';
import { TelemetryBadge } from '../TelemetryBadge';
import TermTooltip from '../TermTooltip';
import HeroZone from '../v2/HeroZone';
import { HeroNowStrip } from '../v2/HeroNowStrip';
import PillTabs, { type PillTab } from '../v2/PillTabs';
import { useStageKey } from './useStageKey';
import {
  AreaRankChart,
  BluefinSourceChart,
  FlagFleetChart,
  KoreaTunaGearChart,
  ExportRankChart,
  OceanFleetChart,
  OceanOperatorChart,
  OceanTopOwnerChart,
  RetailShareChart,
  CertificationTable,
  FoodSafetyTable,
  SpeciesProfileCards,
  StockStatusTable,
  OperatorFleetChart,
  CarrierFlagChart,
  CarrierOwnerChart,
  KoreaFleetAgeChart,
  SeinerProductivityChart,
  ExportByCompanyChart,
  MonthlyCatchChart,
  LonglinePriceChart,
  AccessFeeChart,
  CrewCompositionChart,
  CountryRankChart,
  KoreaExportPriceChart,
  KoreaSpeciesChart,
  KoreaTradeBalanceChart,
  KoreaTrendChart,
  RfmoShareChart,
  SkjPriceByHubChart,
  SpeciesShareChart,
  SpeciesTimelineChart,
  ThailandTradeChart,
  TradeExportRankChart,
  TradeImportRankChart,
  TradeStagePriceChart,
} from './TunaCatchCharts';
import {
  TraderTable,
  CarrierProfileTable,
  CanneryCountryTable,
  BrandMarketTable,
} from './CompanyResearchTables';
import TunaIndustryChart from './TunaIndustryChart';
import ValueChainSpine from './ValueChainSpine';
import styles from './TunaIndustryDashboard.module.css';

const CATCH = getTunaCatchData();
const PRICES = getSkjPriceTimeline();
const TRADE = getTunaTradeData();
const FLEET = getTunaFleetData();
const COMPANIES = getTunaCompanyData();
const GLOSSARY = getTunaGlossary();
const OCEAN_OPS = getTunaOceanOperators();
const CARRIER_FLEET = getTunaCarrierFleet();
const COMPANY_RESEARCH = getTunaCompanyResearch();
const KOFA_AGE = getKofaFleetAge();
const KOFA_INSIGHTS = getKofaInsights();
const KOFA_SERIES = getKofaSeries();
const CREW_ROWS = (() => {
  const crew = KOFA_INSIGHTS.선원 as Record<string, Record<string, number>> & Record<string, unknown>;
  const foreign = crew['외국인_원양어선'] as Record<string, number>;
  const korean = crew['한국인_원양어선'] as Record<string, number>;
  return [
    { 구분: '인도네시아', 인원: foreign['인도네시아'] },
    { 구분: '한국인 해기사', 인원: korean['해기사'] },
    { 구분: '필리핀', 인원: foreign['필리핀'] },
    { 구분: '베트남', 인원: foreign['베트남'] },
    { 구분: '한국인 부원', 인원: korean['부원'] },
    { 구분: '미얀마', 인원: foreign['미얀마'] },
    { 구분: '그 밖 외국인', 인원: (foreign['중국'] ?? 0) + (foreign['기타'] ?? 0) },
  ];
})();
const CHAIN_STAGES = getChainStages();
const CROSS_STAGES = getCrossStages();
const ALL_STAGES: IndustryStage[] = [...CHAIN_STAGES, ...CROSS_STAGES];
const WIDGETS_META = getTunaIndustryWidgetsMeta();

/** 단계에 직접 붙는 자체 집계 도표. 큐레이션 위젯과 달리 원본을 직접 집계한 값이다. */
interface ChartSlot {
  title: string;
  caption: string;
  /** 텔레메트리 표기 — 자료마다 기준 시점이 다르므로 슬롯이 직접 들고 있는다 (L-09) */
  telemetry: { status: 'STATIC' | 'SYNCED'; syncDate: string };
  render: () => React.ReactNode;
  /** 표·장시계열은 full(1열 1개). 없으면 그래프 기본 — 1열 2개. */
  span?: 'full' | 'half';
}

const CATCH_SYNC = { status: 'STATIC' as const, syncDate: `${CATCH._meta.기준연도}년 확정` };
const TRADE_SYNC = { status: 'STATIC' as const, syncDate: `${TRADE.요약.기준연도}년 확정` };
const FLEET_SYNC = { status: 'STATIC' as const, syncDate: '2025년 6월 기준' };
const OPERATOR_SYNC = { status: 'STATIC' as const, syncDate: '2026년 6월 공시 (신라교역은 2024년 12월)' };
const EXPORT_SYNC = { status: 'STATIC' as const, syncDate: '2024년 실적' };
const REGISTRY_SYNC = { status: 'STATIC' as const, syncDate: '2026년 8월 등록부' };
const RETAIL_SYNC = { status: 'STATIC' as const, syncDate: '2026년 6월 공시' };
const STOCK_SYNC = { status: 'STATIC' as const, syncDate: '2022년 평가' };
const REF_SYNC = { status: 'STATIC' as const, syncDate: '2026년 8월 수집' };
const PRICE_SYNC = {
  status: 'SYNCED' as const,
  syncDate: PRICES.points.length > 0 ? String(PRICES.points[PRICES.points.length - 1].월) : '',
};

export const CATCH_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s01: [
    {
      title: '어종 카드 — 무엇이 어떻게 쓰이는가',
      caption:
        '크기·성숙·어법·제품 형태를 한자리에 놓았다. 어획 비중과 물량은 이 저장소의 FAO 집계이고, 나머지 서술은 참조 자료에서 가져왔다. 가다랑어가 통조림으로, 눈다랑어가 사시미로 가는 이유가 크기와 성숙 나이에 이미 들어 있다.',
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => (
        <SpeciesProfileCards
          profiles={GLOSSARY.어종프로필}
          shares={CATCH.어종구성}
        />
      ),
    },
    {
      title: '어종별 계군 상태 (기구 평가)',
      caption:
        '어획량은 얼마나 잡았는지를 말할 뿐 자원이 버티는지를 말하지 않는다. 그 판단은 해역을 관리하는 기구가 따로 한다. ⚠ 평가에는 시점이 있다 — 원문 수록은 2022년 평가이고, 오늘 상태가 아니라 그 해의 판정이다.',
      telemetry: STOCK_SYNC,
      span: 'full',
      render: () => <StockStatusTable rows={GLOSSARY.자원상태} />,
    },
    {
      title: '관할 기구별 어획량 (톤)',
      caption:
        'FAO 주요어업해역을 관할 RFMO로 묶어 집계했다. 남방참다랑어를 어종 단위로 관리하는 CCSBT는 해역이 겹치므로 별도 항목이 없다.',
      telemetry: CATCH_SYNC,
      render: () => <RfmoShareChart data={CATCH} />,
    },
    {
      title: '해역별 어획량 상위 8곳 (톤)',
      caption: '색은 관할 기구를 나타낸다. 서·중부태평양 한 곳이 전체의 47.40%다.',
      telemetry: CATCH_SYNC,
      render: () => <AreaRankChart data={CATCH} />,
    },
  ],
  s02: [
    {
      title: '월별 어종별 생산 — 2024년 계절성 (톤)',
      caption:
        '연보 월별 실적 전사(계 열 검산 일치). 가다랑어는 연중 고른 편이나 황다랑어는 하반기(7~10월)에 몰리고, 오징어류는 상반기가 두껍다 — 조달 타이밍과 선복 배치의 근거가 되는 리듬이다.',
      telemetry: { status: 'SYNCED' as const, syncDate: '연보 2024' },
      render: () => <MonthlyCatchChart rows={KOFA_SERIES.월별생산2024} />,
    },
    {
      title: '어종별 어획량 (톤)',
      caption: '가다랑어 한 종이 전체의 60.52%다. 참다랑어 3종을 합쳐도 1.20%에 그친다.',
      telemetry: CATCH_SYNC,
      render: () => <SpeciesShareChart data={CATCH} />,
    },
    {
      title: '어종별 어획량 20년 추이 (톤)',
      caption: '총량은 늘었지만 어종 구성비는 거의 변하지 않았다. 어법 구조가 고정돼 있다는 뜻이다.',
      telemetry: CATCH_SYNC,
      render: () => <SpeciesTimelineChart data={CATCH} />,
    },
    {
      title: '국가별 어획량 상위 12 (톤)',
      caption: '붉은 막대가 대한민국이다. 주요 상업어종 7종 기준 5위다.',
      telemetry: CATCH_SYNC,
      render: () => <CountryRankChart data={CATCH} />,
    },
    {
      title: '해역별 허가 선망선과 실제 조업 (척)',
      caption:
        '등록부는 「조업해도 된다」는 목록이지 「지금 조업 중」이 아니다. 해역별 허가를 더하면 758척이지만 중복을 빼면 675척이다.',
      telemetry: FLEET_SYNC,
      render: () => <OceanFleetChart data={FLEET} />,
    },
    {
      title: '선사별 참치 선단 (척)',
      caption:
        '보라가 선망, 주황이 연승이다. 사조는 연승에, 동원은 선망에 무게가 실려 있고 신라교역은 둘을 비슷하게 갖는다. ⚠ 기준시점이 달라 같은 날의 사진이 아니다 — 동원·사조는 2026년 6월, 신라교역은 2024년 12월이다.',
      telemetry: OPERATOR_SYNC,
      render: () => <OperatorFleetChart rows={COMPANIES.조업.rows} />,
    },
    {
      title: '한국 선사의 해역별 인가 선박 (척)',
      caption:
        '지역수산관리기구 인가 등록부에서 소유사 이름으로 센 것이다. ⚠ 높이를 그 회사의 총 선단으로 읽지 마라 — 한 배가 두 기구에 인가될 수 있고, 서·중부태평양과 동부태평양 두 기구가 빠져 있다. 이 그림은 규모가 아니라 어느 바다에 있느냐를 말한다.',
      telemetry: REGISTRY_SYNC,
      render: () => (
        <OceanOperatorChart
          rows={OCEAN_OPS.한국선사해역.rows}
          areas={OCEAN_OPS.한국선사해역._meta.해역목록}
        />
      ),
    },
    {
      title: '서·중부태평양 인가 선박 상위 선사 (척)',
      caption:
        '장미색이 한국 선사다. 3,023척의 소유사를 세어 상위 10곳을 뽑았다. 1위 필리핀 회사가 59척으로 2%가 안 된다 — 이 바다에는 지배적 선주가 없다. 「개인 소유」는 회사가 아니라 순위에서 뺐고, 이 수역에서 15.61%를 차지한다.',
      telemetry: REGISTRY_SYNC,
      render: () => (
        <OceanTopOwnerChart rows={OCEAN_OPS.해역['서·중부태평양'].상위선사} area="서·중부태평양" />
      ),
    },
    {
      title: '동부태평양 인가 선박 상위 선사 (척)',
      caption:
        '장미색이 한국 선사다. **사조산업이 27척으로 1위**다 — 이 등록부에서 가장 많은 배를 가진 선주가 한국 회사다. 다만 2,230척 가운데 1.21%라 지배력이라 부를 규모는 아니다.',
      telemetry: REGISTRY_SYNC,
      render: () => (
        <OceanTopOwnerChart rows={OCEAN_OPS.해역['동부태평양'].상위선사} area="동부태평양" />
      ),
    },
    {
      title: '인도양 인가 선박 상위 선사 (척)',
      caption:
        '4,202척의 소유사를 세어 상위 10곳을 뽑았다. 인도네시아 회사들이 상위를 채운다. 한국 선사는 8척뿐이라 이 표에 들지 못한다. 개인 소유가 6.45%다.',
      telemetry: REGISTRY_SYNC,
      render: () => <OceanTopOwnerChart rows={OCEAN_OPS.해역['인도양'].상위선사} area="인도양" />,
    },
    {
      title: '대서양 인가 선박 상위 선사 (척)',
      caption:
        '7,110척 중 소유사 이름이 적힌 행만 세었다(48.4%). 1위가 25척으로 1%도 안 될 만큼 흩어져 있다 — 다섯 해역 가운데 가장 파편화됐다.',
      telemetry: REGISTRY_SYNC,
      render: () => <OceanTopOwnerChart rows={OCEAN_OPS.해역['대서양'].상위선사} area="대서양" />,
    },
    {
      title: '남방참다랑어 인가 선박 상위 선사 (척)',
      caption:
        '862척으로 다섯 해역 중 가장 작지만 **집중도는 가장 높다** — 상위 5곳이 17.52%다. 어종 하나를 관리하는 좁은 승인 목록이라 참여자가 적다.',
      telemetry: REGISTRY_SYNC,
      render: () => (
        <OceanTopOwnerChart rows={OCEAN_OPS.해역['남방참다랑어'].상위선사} area="남방참다랑어" />
      ),
    },
    {
      title: '선적국별 선망선과 어창용적 (척·㎥)',
      caption:
        '막대는 척수, 선은 어창용적이다. 분홍이 한국 — 척수는 5위인데 용적은 3위다. 배가 크다는 뜻이고, 척수만 세면 과소평가된다.',
      telemetry: FLEET_SYNC,
      render: () => <FlagFleetChart data={FLEET} />,
    },
    {
      title: '참다랑어 자연산과 축양 (톤)',
      caption:
        '축양은 어린 개체를 잡아 가두리에서 살찌우는 방식이라 통계상 양식으로 잡히지만 종자를 자연에서 가져온다. 두 값이 거의 같아 참다랑어 공급의 절반가량이 축양에서 나온다.',
      telemetry: CATCH_SYNC,
      render: () => <BluefinSourceChart data={CATCH} />,
    },
  ],
  x01: [
    {
      title: '참치연승 어가 장기 — 연평균 (달러/톤)',
      caption:
        '연보 어가표의 연평균 열(2008~2024, 눈다랑어 40kg·황다랑어 25kg 기준). 2008년 눈다랑어 7,600달러가 2024년 6,036달러다 — 17년째 명목가가 옛 고점을 회복하지 못했다. 선망 가다랑어도 같은 기간 1,564→1,441달러로 정체다(연보의 선망 어가는 이 페이지 시세와 같은 Atuna CFR 계열).',
      telemetry: { status: 'SYNCED' as const, syncDate: '연보 2008~2024' },
      render: () => <LonglinePriceChart rows={KOFA_SERIES.어가.연승달러톤} />,
    },
    {
      title: `항구별 가다랑어 고시가 추이 (달러/톤, ${PRICES.meta.span})`,
      span: 'full',
      caption: PRICES.latestSpread
        ? `같은 어종인데 다섯 항구가 따로 움직인다. 다섯 곳이 모두 고시된 마지막 달인 ${PRICES.latestSpread.month}에 ` +
          `${PRICES.latestSpread.maxLabel} ${PRICES.latestSpread.maxPrice.toLocaleString('ko-KR')}달러와 ` +
          `${PRICES.latestSpread.minLabel} ${PRICES.latestSpread.minPrice.toLocaleString('ko-KR')}달러의 격차가 ` +
          `톤당 ${PRICES.latestSpread.gap.toLocaleString('ko-KR')}달러(${PRICES.latestSpread.gapPct}%)였다. ` +
          '선이 끊긴 구간은 그 항구 고시가 멈춘 것이라 값을 메우지 않았다. 방콕이 굵은 선이다.'
        : '같은 어종인데 다섯 항구가 따로 움직인다. 선이 끊긴 구간은 값을 메우지 않았다.',
      telemetry: PRICE_SYNC,
      render: () => <SkjPriceByHubChart timeline={PRICES} />,
    },
    {
      title: '항구가 다르면 무엇이 다른가',
      telemetry: PRICE_SYNC,
      span: 'full',
      caption:
        '항구는 지리가 아니라 수요처를 뜻한다. 어느 캐너리로 가는 원료인지가 다르므로 가격도 따로 움직인다.',
      render: () => (
        <div className={styles.factWrap}>
          <table className={styles.factTable}>
            <thead>
              <tr>
                <th scope="col">항구</th>
                <th scope="col">이 가격이 대표하는 수요</th>
              </tr>
            </thead>
            <tbody>
              {SKJ_HUBS.map((hub) => (
                <tr key={hub.key}>
                  <th scope="row">{hub.label}</th>
                  <td>{hub.serves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
  ],
  s03: [
    {
      title: '서·중부태평양 운반선 국적별 (척)',
      caption:
        '인가 등록부의 운반선 354척을 깃발국으로 센 실측이다. 파나마·바하마는 소유국이 아니라 편의치적 깃발국이다 — 동태평양 기구는 운반선을 별도 목록으로 관리해 여기 없다.',
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08 등록부' },
      render: () => <CarrierFlagChart rows={CARRIER_FLEET.국적별} />,
    },
    {
      title: '운반선 소유사 상위 (척)',
      caption:
        '상위권은 필리핀·인도네시아 어업 그룹의 집단 선망 부속 운반선이다. 국제 환적을 움직이는 대형 리퍼 선사는 선박을 개별 명의로 분산 등록해 이 집계에 이름이 안 보인다 — 아래 보강 표가 그 실세를 담는다. 개인 소유 7척은 익명 처리했다.',
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08 등록부' },
      render: () => <CarrierOwnerChart rows={CARRIER_FLEET.소유사상위} />,
    },
    {
      title: '국제 리퍼·환적 실세 (등록부 밖 보강)',
      caption: COMPANY_RESEARCH.운반선사보강.요지,
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <CarrierProfileTable rows={COMPANY_RESEARCH.운반선사보강.rows} />,
    },
    {
      title: '캐닝용 원어 트레이더 (빅3와 한국의 자리)',
      caption: COMPANY_RESEARCH.트레이더.구조,
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <TraderTable rows={COMPANY_RESEARCH.트레이더.rows} />,
    },
  ],
  s04: [
    {
      title: '국가별 캔참치 공장과 주요 기업',
      caption: COMPANY_RESEARCH.캔공장.요지,
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <CanneryCountryTable rows={COMPANY_RESEARCH.캔공장.rows} />,
    },
  ],
  s06: [
    {
      title: '품목군별 교역 규모와 단가 (달러/톤)',
      caption:
        '막대는 교역액, 선은 톤당 단가다. 「가공할수록 비싸진다」는 직관이 여기서 깨진다 — 로인·필렛이 톤당 가장 비싼 이유는 순수 가식부이기 때문이고, 통조림은 액체와 용기 무게가 섞여 톤당으로는 싸 보인다.',
      telemetry: TRADE_SYNC,
      render: () => <TradeStagePriceChart data={TRADE} />,
    },
    {
      title: '참치류 수출액 상위 10개국 (백만 달러)',
      caption: '잡는 나라와 파는 나라가 다르다. 1위 태국은 참치를 거의 잡지 않는다.',
      telemetry: TRADE_SYNC,
      render: () => <TradeExportRankChart data={TRADE} />,
    },
    {
      title: '참치류 수입액 상위 10개국 (백만 달러)',
      caption:
        '소비 시장과 가공 허브가 섞여 있다. 미국·일본·이탈리아는 먹으려고 사고, 태국·스페인은 가공하려고 산다.',
      telemetry: TRADE_SYNC,
      render: () => <TradeImportRankChart data={TRADE} />,
    },
    {
      title: '태국 원료 수입과 완제품 수출 (백만 달러)',
      caption: '원어를 사서 완제품으로 되파는 구조가 그대로 보인다. 그 차액이 가공국이 가져가는 몫이다.',
      telemetry: TRADE_SYNC,
      render: () => <ThailandTradeChart data={TRADE} />,
    },
  ],
  s07: [
    {
      title: '국가별 참치캔 브랜드와 점유율 (성격 구분)',
      caption: COMPANY_RESEARCH.브랜드.요지,
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <BrandMarketTable rows={COMPANY_RESEARCH.브랜드.rows} />,
    },
    {
      title: '식품안전 기준과 실제 함량',
      caption:
        '소비 단계에서 반복해 나오는 질문이다. ⚠ 규제 기준과 관측값을 「구분」 열로 갈라 두었다 — 평균 함량을 허용 상한으로 오해하면 판단이 통째로 뒤집힌다.',
      telemetry: REF_SYNC,
      span: 'full',
      render: () => <FoodSafetyTable rows={GLOSSARY.식품안전.rows} />,
    },
    {
      title: '국내 참치캔 시장 점유율 (%)',
      caption:
        '사슬 끝에서는 한 회사가 시장을 거의 다 갖는다. 2023년 81.7%에서 조금씩 내려와 2026년 상반기 79.2%다. 나머지 20%대를 누가 나누는지는 이 공시로 알 수 없다.',
      telemetry: RETAIL_SYNC,
      render: () => <RetailShareChart rows={COMPANIES.소매.rows} />,
    },
  ],
  x02: [
    {
      title: '참치선망 입어료 — 2024년 국가별 (달러)',
      caption:
        '협회 집계 지불액 실측. 2024년 선망 입어료 5,711만 달러 중 파푸아뉴기니·키리바시 두 나라가 73.8%다 — 생산 1톤당 197.8달러로, 입어료는 어가의 한 자릿수 후반~10%대를 차지하는 고정 규제 원가다.',
      telemetry: { status: 'SYNCED' as const, syncDate: '연보 2024' },
      render: () => <AccessFeeChart rows={KOFA_INSIGHTS.입어료.국가별2024} />,
    },
    {
      title: '원양어선 승선원 구성 — 국적과 직급 (명)',
      caption:
        '2024년말 원양어선 승선원의 80.0%가 외국인이다(외국인 4,352명 vs 한국인 1,089명). 한국인은 해기사(사관) 968명이 중심이고 부원은 121명뿐 — 갑판 노동은 사실상 전부 외국인(인도네시아 3,469명)이 맡는 구조다. 노동 리스크 논의는 이 구조 위에서 읽어야 한다.',
      telemetry: { status: 'SYNCED' as const, syncDate: '연보 2024년말' },
      render: () => <CrewCompositionChart rows={CREW_ROWS} />,
    },
    {
      title: '가공장이 통과해야 하는 인증 (제도 분류)',
      caption:
        '규제가 원가로 번역되는 통로 가운데 하나다. 위생 절차가 바닥이고 그 위에 공정 예방체계, 국제 규격, 유통사 요구, 사회적 책임이 얹힌다. 조문이 아니라 「무엇을 보는 제도인가」를 정리한 것이다.',
      telemetry: REF_SYNC,
      span: 'full',
      render: () => (
        <CertificationTable
          rows={GLOSSARY.인증.rows}
          social={GLOSSARY.인증.사회책임항목}
        />
      ),
    },
  ],
  x03: [
    {
      title: '회사별 수출실적 — 2024년 (톤)',
      caption:
        '연보 회사별 수출(행합·열합 검산 전부 일치). 물량 1위 동원(85,512톤)에 이어 신라교역이 73,966톤으로 2위 — 전량 가공용(선망) 참치다. 금액까지 보면 동원 1.48억 달러·신라 0.88억 달러. 원양어업 전체 수출은 20.2만 톤·3.87억 달러이고, 경영체는 38개사(1~5척 영세가 28개사) — 최근 10년 부도·도산은 10개사다.',
      telemetry: { status: 'SYNCED' as const, syncDate: '연보 2024' },
      render: () => <ExportByCompanyChart rows={KOFA_SERIES.수출회사별.rows} />,
    },
    {
      title: '한국 원양선단 업종별 평균 선령 (년)',
      caption:
        '연보 명부 198척의 진수년월로 계산했다(연보 자체 선령 도표와 정합 — 전체의 68%가 31~40년). 참치연승 105척은 평균 34.5년에 15년 이하 신조가 1척뿐이고, 참치선망만 평균 18.0년·신조 16척으로 세대교체가 됐다. 투자가 선망 한 어법에 몰렸고 나머지는 신조 절벽이다.',
      telemetry: { status: 'SYNCED' as const, syncDate: '연보 2024년말' },
      render: () => <KoreaFleetAgeChart rows={KOFA_AGE.업종별} />,
    },
    {
      title: '참치선망 척당 생산성 — 회사별 (톤/척)',
      caption:
        '2024년 선망 생산(연보 회사별 실적)을 2024년말 명부 척수로 나눴다. 신라교역이 6척으로 76,979톤 — 척당 12,830톤으로 1위다(동원 10,319 · 선망 전체 평균 10,694). 신라 선단의 상대적 젊음(평균 17.2년·신조 4척)과 대형 선형이 만든 차이다. 연중 매각·전배가 있으면 척당 값이 흔들릴 수 있다.',
      telemetry: { status: 'SYNCED' as const, syncDate: '연보 2024' },
      render: () => <SeinerProductivityChart rows={KOFA_INSIGHTS.선망생산성.rows} />,
    },
    {
      title: '한국 원양업계 회사별 수출실적 (천달러)',
      caption:
        '장미색이 신라교역이다. 2024년 3억 8,700만 달러 가운데 22.73%로 2위다. 한 출처·한 통화·한 해라서 이 단계에서 나란히 세울 수 있는 유일한 값이다.',
      telemetry: EXPORT_SYNC,
      render: () => <ExportRankChart rows={COMPANIES.수출순위.rows} />,
    },
    {
      title: '한국 참치 업종별 척수와 선령 (척)',
      caption:
        '분홍이 선령 31년 이상이다. 연승은 105척 중 99척(94%)이 31년을 넘었고 선망은 27척 중 6척(22%)이다 — 같은 참치라도 선단 갱신 속도가 다르다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2024년 말 기준' },
      render: () => <KoreaTunaGearChart data={FLEET} />,
    },
    {
      title: '한국 어획량과 세계 점유율 20년',
      caption: '막대는 어획량(톤), 선은 세계 점유율(%)이다. 물량이 늘어도 점유율은 5%대에서 움직인다.',
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <KoreaTrendChart data={CATCH} />,
    },
    {
      title: '한국 어종별 어획량 (톤)',
      caption:
        '가다랑어가 74.9%다. 통조림 원료 공급이 한국 원양의 본체라는 사실이 이 한 장에 들어 있다.',
      telemetry: CATCH_SYNC,
      render: () => <KoreaSpeciesChart data={CATCH} />,
    },
    {
      title: '한국 참치류 수출입과 무역수지 (백만 달러)',
      caption:
        '한국은 참치류 교역에서 꾸준한 흑자국이다. 다만 그 흑자는 원어를 많이 팔아서 나오는 것이지 비싸게 팔아서 나오는 것이 아니다 — 아래 단가 그림과 함께 봐야 한다.',
      telemetry: TRADE_SYNC,
      render: () => <KoreaTradeBalanceChart data={TRADE} />,
    },
    {
      title: '한국 수출단가와 세계 평균 (달러/톤)',
      caption:
        '막대는 톤당 단가, 선은 세계 평균 대비 격차다. 한국은 9년 내내 세계 평균을 밑돌았고 그 폭이 좁혀지지 않았다.',
      telemetry: TRADE_SYNC,
      render: () => <KoreaExportPriceChart data={TRADE} />,
    },
  ],
};

/**
 * 서술 본문의 `**강조**` 구간만 굵게 만든다.
 * 마크다운 전체를 파싱하지 않는다 — 이 페이지가 쓰는 표기는 강조 하나뿐이고,
 * 파서를 들이면 콘텐츠에 HTML 을 흘려 넣을 수 있는 통로가 생긴다.
 */
function renderEmphasis(text: string): React.ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((chunk, index) =>
    index % 2 === 1 ? <strong key={index}>{chunk}</strong> : <React.Fragment key={index}>{chunk}</React.Fragment>,
  );
}

function FactTable({ rows }: { rows: FactRow[] }) {
  return (
    <>
      <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>
          본문에 인용한 수치와 출처. 등급 A는 기관 1차문서 원문 확인, B는 기관 2차 인용, C는 업계 매체다.
        </caption>
        <thead>
          <tr>
            <th scope="col">항목</th>
            <th scope="col">값</th>
            <th scope="col">기준</th>
            <th scope="col">출처</th>
            <th scope="col">등급</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.label}-${index}`}>
              <th scope="row">
                {row.label}
                {row.note ? <span className={styles.factNote}>{row.note}</span> : null}
              </th>
              <td className={styles.factValue}>{row.value}</td>
              <td>{row.asOf}</td>
              <td>{row.source}</td>
              <td>
                <span className={styles.grade} data-grade={row.grade}>
                  {row.grade}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* 좁은 화면용 — 같은 데이터를 목록으로 낸다.
          표를 CSS 로 접으면 일부 브라우저에서 표 의미가 깨지므로 마크업을 따로 둔다. */}
      <ul className={styles.factList}>
        {rows.map((row, index) => (
          <li key={`m-${row.label}-${index}`}>
            <div className={styles.factHead}>
              <span className={styles.factLabel}>{row.label}</span>
              <span className={styles.grade} data-grade={row.grade}>
                신뢰 {row.grade}
              </span>
            </div>
            <p className={styles.factListValue}>{row.value}</p>
            <p className={styles.factMeta}>
              {row.asOf} · {row.source}
            </p>
            {row.note ? <p className={styles.factListNote}>{row.note}</p> : null}
          </li>
        ))}
      </ul>
    </>
  );
}

function StageSection({
  stage,
  narrative,
  next,
  onGo,
  headingRef,
}: {
  stage: IndustryStage;
  narrative: StageNarrative;
  next?: IndustryStage;
  onGo: (key: string) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const catchCharts = CATCH_CHART_SLOTS[stage.key] ?? [];
  // 2026-08-17 사용자 지시: 차트는 전부 사실표 아래로 — 본문 위 근거 레일 폐지
  const rest = catchCharts;

  return (
    <section className={styles.stage} aria-labelledby={`stage-${stage.key}`}>
      <header className={styles.stageHeader}>
        <span className={styles.stageNumeral}>{narrative.numeral}</span>
        <div>
          <h2
            id={`stage-${stage.key}`}
            className={styles.stageTitle}
            ref={headingRef}
            tabIndex={-1}
          >
            {narrative.title}
          </h2>
          <p className={styles.stageQuestion}>{narrative.question}</p>
        </div>
      </header>

      <p className={styles.lede}>{renderEmphasis(narrative.lede)}</p>

      {narrative.facts[0] && (
        <p className={styles.keyFact}>
          <span className={styles.keyFactValue}>{narrative.facts[0].value}</span>
          <span className={styles.keyFactLabel}>{narrative.facts[0].label}</span>
        </p>
      )}

      <div className={styles.prose}>
        {narrative.paragraphs.map((paragraph, index) => (
          <p key={index}>{renderEmphasis(paragraph)}</p>
        ))}
      </div>

      {narrative.terms.length > 0 && (
        <div className={styles.termRow}>
          <span className={styles.termRowLabel}>용어</span>
          {narrative.terms.map((term) => (
            <span key={term.term} className={styles.termChip}>
              <TermTooltip term={term.term} description={term.description} />
            </span>
          ))}
        </div>
      )}

      <FactTable rows={narrative.facts} />

      {(rest.length > 0 || stage.widgets.length > 0) && (
        <div className={styles.stageMore}>
          <h3 className={styles.stageMoreHeading}>근거</h3>
          {/* 차트 슬롯과 승격 위젯을 한 격자에 둔다. 나누면 마지막 반폭 그래프가
              혼자 남고 다음 위젯이 아래로 떨어진다. */}
          <div
            className={
              rest.length + stage.widgets.length >= 2 ? styles.catchGrid : styles.catchStack
            }
          >
            {rest.map((slot) => (
              <figure
                key={slot.title}
                className={styles.catchFigure}
                data-span={slot.span === 'full' ? 'full' : 'half'}
              >
                <figcaption className={styles.catchCaption}>
                  <div className={styles.catchTitleRow}>
                    <strong>{slot.title}</strong>
                    <TelemetryBadge
                    variant="caption"
                    status={slot.telemetry.status}
                    syncDate={slot.telemetry.syncDate}
                  />
                  </div>
                  <span>{slot.caption}</span>
                </figcaption>
                <div className={styles.chartFrame}>{slot.render()}</div>
              </figure>
            ))}
            {stage.widgets.map((widget) => (
              <figure
                key={widget.id}
                className={styles.catchFigure}
                data-span="half"
              >
                <figcaption className={styles.catchCaption}>
                  <div className={styles.catchTitleRow}>
                    <strong>{widget.title}</strong>
                    <TelemetryBadge
                      variant="caption"
                      status={widget.telemetry}
                      syncDate={widget.dataYear ? `${widget.dataYear}년 자료` : (widget.syncDate ?? undefined)}
                    />
                  </div>
                  <span>{widget.thesis ?? widget.methodology ?? ''}</span>
                </figcaption>
                <div className={styles.chartFrame}>
                  <TunaIndustryChart widget={widget} />
                </div>
                <figcaption className={styles.catchSourceLine}>
                  출처: {widget.source ?? '출처 미표기'}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {next && (
        <button type="button" className={styles.stageNext} onClick={() => onGo(next.key)}>
          <span className={styles.stageNextLabel}>다음</span>
          <span className={styles.stageNextTitle}>
            {getNarrative(next.key)?.numeral ?? ''} {next.label}
          </span>
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}

export interface TunaIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function TunaIndustryDashboard({ heroOnly = false }: TunaIndustryDashboardProps) {
  const stageKeys = useMemo(() => ALL_STAGES.map((stage) => stage.key), []);
  const [activeKey, setStage] = useStageKey(stageKeys, CHAIN_STAGES[0]?.key ?? 's01');
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const go = useCallback((key: string) => {
    setStage(key);
    requestAnimationFrame(() => {
      const heading = headingRef.current;
      if (!heading) return;
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      heading.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      heading.focus({ preventScroll: true });
    });
  }, [setStage]);

  const tabs: PillTab[] = useMemo(
    () =>
      ALL_STAGES.map((stage) => {
        const narrative = getNarrative(stage.key);
        return {
          key: stage.key,
          // 탭에는 단계 이름만 싣고 부제(「— …」)는 뺀다. 열 개가 한 줄에 안 들어가고,
          // 부제를 단 단계 수가 품목마다 달라 탭 폭이 들쭉날쭉해진다. 부제는 바로 아래
          // 단계 머리글이 전문으로 보여주므로 여기서 빼도 잃는 정보가 없다.
          label: `${narrative?.numeral ?? ''} ${(narrative?.title ?? stage.label).split(' — ')[0]}`.trim(),
        };
      }),
    [],
  );

  const activeStage = ALL_STAGES.find((stage) => stage.key === activeKey) ?? ALL_STAGES[0];
  const activeNarrative = getNarrative(activeStage.key);
  const nextStage = ALL_STAGES[ALL_STAGES.indexOf(activeStage) + 1];

  const hero = (
    <HeroZone
      variant="kpi"
      title="참치"
      subtitle="참치 산업 해부 · 바다에서 식탁까지 — 밸류체인 7단계와 그것을 관통하는 3개 축"
      primaryKpi={{
        label: '세계 주요 상업 참치 어획량',
        value: CATCH.요약.세계어획량,
        unit: '(톤)',
        accent: '#0e7490',
      }}
      secondaryKpis={[
        {
          label: '서·중부태평양 비중',
          value: CATCH.요약.최대해역비중 ?? 0,
          unit: '(%)',
          decimals: 2,
        },
        {
          label: '한국 어획량',
          value: CATCH.요약.한국어획량 ?? 0,
          unit: '(톤)',
        },
        {
          label: '주요 상업어종',
          value: CATCH.요약.어종수,
          unit: '(종)',
        },
      ]}
      minHeight={360}
      strip={(
        <HeroNowStrip
          items={[
            {
              now: true,
              eyebrow: '기준',
              title: '세계 어획량',
              body: `${CATCH.요약.세계어획량.toLocaleString('ko-KR')} (톤)`,
            },
            {
              eyebrow: '해역',
              title: '서·중부태평양',
              body: `${(CATCH.요약.최대해역비중 ?? 0).toLocaleString('ko-KR', { maximumFractionDigits: 2 })} (%)`,
            },
            {
              eyebrow: '한국',
              title: '국내 어획량',
              body: `${(CATCH.요약.한국어획량 ?? 0).toLocaleString('ko-KR')} (톤)`,
            },
          ]}
        />
      )}
    />
  );

  if (heroOnly) return hero;

  return (
    <div className={styles.page} data-testid="tuna-industry-dashboard" data-commodity="tuna">
      {hero}

      <section className={styles.briefing} aria-labelledby="briefing-heading">
        <h2 id="briefing-heading" className={styles.briefingHeading}>
          <BookOpen size={16} aria-hidden="true" />
          30초 브리핑
        </h2>
        <p className={styles.briefingIntro}>
          아래로 내려가지 않아도 되는 사람을 위한 요약이다. 각 항목은 사슬의 한 단계에서 나온다.
        </p>
        <ol className={styles.briefingList}>
          {BRIEFING_POINTS.map((point) => (
            <li key={point.headline}>
              <strong>{point.headline}</strong>
              <span>{point.detail}</span>
            </li>
          ))}
        </ol>
      </section>

      <nav className={styles.tabNav} aria-label="밸류체인 단계 이동">
        <PillTabs
          tabs={tabs}
          activeKey={activeKey}
          onChange={go}
          ariaLabel="밸류체인 단계"
          tabIdPrefix="tuna-industry-tab"
          panelIdPrefix="tuna-industry-panel"
          wrap
        />
      </nav>

      <ValueChainSpine activeKey={activeKey} onSelect={go} />

      {activeNarrative ? (
        <StageSection
          stage={activeStage}
          narrative={activeNarrative}
          next={nextStage}
          onGo={go}
          headingRef={headingRef}
        />
      ) : (
        <p className={styles.missing}>이 단계의 서술이 아직 준비되지 않았습니다.</p>
      )}

      {/* 용어 사전 — 이 페이지의 약어를 한자리에 모은다.
          위젯 라벨의 용어가 표류하지 않게 하는 것이 이 절의 목적이다. */}
      <section className={styles.glossary} aria-labelledby="glossary-heading">
        <h2 id="glossary-heading" className={styles.glossaryHeading}>
          <BookOpen size={16} aria-hidden="true" />
          용어 사전
        </h2>
        <p className={styles.glossaryIntro}>
          참치 업계에서 쓰는 약어 {GLOSSARY.약어.length}개다. 한글이 있는 것은 이 페이지가 쓰는 표기이고,
          없는 것은 아직 옮기지 않아 영문 그대로 둔 것이다.
        </p>
        <ul className={styles.glossaryList}>
          {GLOSSARY.약어.map((row) => (
            <li key={row.약어} className={styles.glossaryItem}>
              <span className={styles.glossaryAbbr}>{row.약어}</span>
              <span>
                {row.한글 ? <span className={styles.glossaryKo}>{row.한글} </span> : null}
                <span className={styles.glossaryEn}>{row.영문}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.sources} aria-labelledby="sources-heading">
        <h2 id="sources-heading" className={styles.sourcesHeading}>
          <Fish size={16} aria-hidden="true" />
          출처와 한계
        </h2>
        <ul className={styles.sourceList}>
          {SOURCE_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className={styles.sourceMeta}>
          어획 집계 · {CATCH._meta.출처} · 기준 {CATCH._meta.기준연도}년 · 갱신 {CATCH._meta.생성일}
          {' · '}
          위젯 {WIDGETS_META.선별} ({WIDGETS_META.원본})
        </p>
      </section>
    </div>
  );
}
