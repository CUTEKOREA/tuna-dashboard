/**
 * 「시장 이해 > 기업 해부」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있다. 여기는 회사 선택과 차트 배치만 정한다.
 *
 * 실린 회사는 Frinsa·Thai Union·Albacora 셋이다. 진입은 갤러리(타로카드)가 맡고,
 * 회사가 늘면 `COMPANY_CARDS` 와 `SPECS` 에 한 짝씩 추가한다.
 */
'use client';

import React, { useState } from 'react';

import {
  FRINSA_SOURCE_NOTES,
} from '@/lib/company-frinsa-content';
import {
  frinsaBrands,
  frinsaCerts,
  frinsaMeta,
  frinsaProfile,
  frinsaTariff,
  latestFinancial,
  tunaPurchasedMt,
} from '@/lib/data/company-frinsa';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
  type FlowItem,
  type StageNarrative,
} from './CommodityIndustryDashboard';
import {
  FrinsaBaiChart,
  FrinsaCogenChart,
  FrinsaFinancialChart,
  FrinsaGaliciaChart,
  FrinsaKoreaExportChart,
  FrinsaPriceLadderChart,
  FrinsaRegionalChart,
  FrinsaSourcingChart,
  FrinsaSustainabilityChart,
} from './FrinsaCharts';
import {
  THAIUNION_SOURCE_NOTES,
} from '@/lib/company-thaiunion-content';
import {
  latestKoreaExport,
  latestTuFinancial,
  thaiUnionBalance,
  thaiUnionBrands,
  thaiUnionFactories,
  thaiUnionHistory,
  thaiUnionKoreaImport,
  thaiUnionMeta,
  thaiUnionProfile,
  thaiUnionRedLobster,
  thaiUnionRetailPrices,
  thaiUnionSeachange,
  thaiUnionShareholders,
  thaiUnionUsTariff,
  totalBrandSku,
  tunaCapacityMt,
} from '@/lib/data/company-thaiunion';
import {
  TuBrandShareChart,
  TuCapacityChart,
  TuConVsSepChart,
  TuFinancialChart,
  TuGhgChart,
  TuJwLadderChart,
  TuKoreaExportChart,
  TuMfdsChart,
  TuMscTrendChart,
  TuRegionChart,
  TuSegmentChart,
  TuTc25Chart,
} from './ThaiUnionCharts';
import {
  ALBACORA_SOURCE_NOTES,
} from '@/lib/company-albacora-content';
import {
  ALBACORA_CLAIMED_VESSELS,
  albacoraAffiliates,
  albacoraBrands,
  albacoraCerts,
  albacoraCompare,
  albacoraFinancials,
  albacoraFleet,
  albacoraHistory,
  albacoraLimits,
  albacoraMeta,
  albacoraMonitoring,
  albacoraMscUnits,
  albacoraOpenQuestions,
  albacoraOverlap,
  albacoraPlants,
  albacoraProfile,
  albacoraRisks,
  albacoraSuccession,
  albacoraSustain,
  albacoraTradeThreat,
  ecuadorRevenueShare,
  fleetGtTotal,
  latestCatch,
  plantRevenueTotal,
} from '@/lib/data/company-albacora';

import {
  FCF_SOURCE_NOTES,
} from '@/lib/company-fcf-content';
import {
  fcfCompare,
  fcfGear,
  fcfGroup,
  fcfMeta,
  fcfOwnership,
  fcfProfile,
  fcfSillaDependency,
  fcfSpecies,
  fcfStats,
  kwangyangShare,
  sillaLatest,
  sillaPeak,
} from '@/lib/data/company-fcf';
import {
  ITOCHU_SOURCE_NOTES,
} from '@/lib/company-itochu-content';
import {
  fleetTotal,
  itochuAti,
  itochuCompare,
  itochuFleet,
  itochuFoodDivisions,
  itochuKorea,
  itochuMeta,
  itochuProfile,
  itochuSegments,
  itochuSiVessels,
  itochuStats,
  sajoShare,
  sajoVessels,
  siGtTotal,
} from '@/lib/data/company-itochu';
import {
  BOLTON_SOURCE_NOTES,
} from '@/lib/company-bolton-content';
import {
  activeOwnVessels,
  boltonCategories,
  boltonCompare,
  boltonFinancials,
  boltonGear,
  boltonKorea,
  boltonMeta,
  boltonOwnFleet,
  boltonProfile,
  boltonRegions,
  boltonSourcing,
  boltonSpecies,
  boltonStats,
  boltonVesselList,
  koreaSharePeak,
  latestVesselList,
  nonTunaShare,
} from '@/lib/data/company-bolton';
import {
  JAIS_SOURCE_NOTES,
} from '@/lib/company-jais-content';
import {
  jaisAxes,
  jaisCompare,
  jaisFinancials,
  jaisFos,
  jaisKorea,
  jaisMeta,
  jaisPanofi,
  jaisProfile,
  jaisRegistries,
  jaisStats,
  lossStreak,
  marginBand,
  ownedAssets,
  revenuePeak,
} from '@/lib/data/company-jais';
import {
  AlbCamposPriceChart,
  AlbCatchChart,
  AlbFlagChart,
  AlbFleetGtChart,
  AlbPlantChart,
  AlbSacYieldChart,
  AlbSafetyChart,
  AlbSalesDestChart,
  AlbSiaTonnageChart,
} from './AlbacoraCharts';
import CompanyGallery, { type CompanyCard } from './CompanyGallery';
import galleryStyles from './CompanyGallery.module.css';
import {
  byGrade,
  fillRate,
  pricesOf,
  skusOf,
  skuTotal,
  speciesMix,
  tuBrands,
  tuPrices,
  tuSkuMeta,
  tunaSkus,
} from '@/lib/data/company-thaiunion-skus';
import {
  type ReportTable,
  tablesForStage,
} from '@/lib/data/company-report-tables';
import {
  type ReportFigure,
  figuresForStage,
} from '@/lib/data/company-report-figures';
import styles from './TunaIndustryDashboard.module.css';
import { FRABELLE_SOURCE_NOTES } from '@/lib/company-frabelle-content';
import { proseBriefing, proseStages } from '@/lib/company-prose-stages';
import { frabelleMeta, frabelleStats, laeOutputRange, registeredVessels } from '@/lib/data/company-frabelle';
import { jealsaMeta, jealsaStats, jealsaSourceNotes, mercadonaShare } from '@/lib/data/company-jealsa';
import { nauterraMeta, nauterraStats, nauterraSourceNotes, nonSpanishFlagShare, fleetEntitySubsidyShare, subsidyGapVs } from '@/lib/data/company-nauterra';
import { starkistMeta, starkistStats, starkistSourceNotes, revenueTrendPct, totalClaimsUsdM, provisionVsCapPct, pouchShareChangePct, strategyGapCount, pbPremiumMultiple } from '@/lib/data/company-starkist';
import { dongwonMeta, dongwonStats, dongwonSourceNotes, catchSharePct, exportLeadGapPct, starkistGuaranteeSharePct, strategyGapAxes, dongwonStrategyAxes, peerNonTunaBillionKrw } from '@/lib/data/company-dongwon';
import { sajoMeta, sajoStats, sajoSourceNotes, sajoExportSharePct, lossMakingSegments, segmentsBeatingLossMaker, cartelFineBillionKrw, fineVsPurchaseGapBillionKrw, millFineSharePct, strategyGapAxesSajo, sajoStrategyAxes } from '@/lib/data/company-sajo';
import { bumblebeeMeta, bumblebeeStats, bumblebeeSourceNotes, cashSharePct, bidFunnel, albacoreMultiple, outstandingFine, strategyGapAxesBB, bumblebeeStrategyAxes } from '@/lib/data/company-bumblebee';
import { umiosMeta, umiosStats, umiosSourceNotes, umiosSeedShareOfNational, nationalSeedCollapsePct, fullCycleSharePct } from '@/lib/data/company-umios';
import { kyokuyoMeta, kyokuyoStats, kyokuyoSourceNotes, oldSegmentLeverage, freshProfitTrough } from '@/lib/data/company-kyokuyo';
import { seavalueMeta, seavalueStats, seavalueSourceNotes, ownBrandTunaShare, canadaVsBumbleBee, denominatorGap } from '@/lib/data/company-seavalue';
import { nissuiMeta, nissuiStats, nissuiSourceNotes, marineProfitMultiple, logisticsMarginGap } from '@/lib/data/company-nissui';
import {
  centurypacificMeta, centurypacificStats, centurypacificSourceNotes,
  marineSharePct, advanceSharePct, koreaShareShrinkFactor,
} from '@/lib/data/company-centurypacific';
import {
  boltonfoodMeta, boltonfoodStats, boltonfoodSourceNotes,
  groupToEntityMultiple, vesselListGrowthMultiple, italyShareGapPp,
} from '@/lib/data/company-boltonfood';
import {
  trimarineMeta, trimarineStats, trimarineSourceNotes,
  purchaseVesselDropPct, solomonHeadcountDropPct, competitorShipmentSharePct,
} from '@/lib/data/company-trimarine';
import {
  princesMeta, princesStats, princesSourceNotes,
  ipoOffsetSharePct, fishRevenueSharePct, fishEbitdaSharePct, dpoMultiple, mauritiusRevenueSharePct,
} from '@/lib/data/company-princes';
import {
  iotMeta, iotStats, iotSourceNotes,
  cannedShareOfExportsPct, euShareOfCannedPct, landingShareOfPortPct, impossibleYieldPct, landedSharePct, domesticFlagShareSafe,
} from '@/lib/data/company-iot';
import {
  atiMeta, atiStats, atiSourceNotes,
  monthlyYieldPct, japanImportShareIdnPct, equityIncomeChangePct, koreaSkjShareToIdnPct, mscShiftPp,
} from '@/lib/data/company-ati';
import {
  nirsaMeta, nirsaStats, nirsaSourceNotes,
  salesVsSecondX, salesGrowthPct, shrimpShare2019Pct, ecuadorToUsSharePct,
} from '@/lib/data/company-nirsa';
import {
  eurofishMeta, eurofishStats, eurofishSourceNotes,
  linkedFleetSharePct, relatedPurchaseSharePct, salesGrowthPct as eurofishSalesGrowthPct, transferredShareOfLinkedPct,
} from '@/lib/data/company-eurofish';
import {
  tecopescaMeta, tecopescaStats, tecopescaSourceNotes,
  seriesSupplierSharePct, relatedPurchaseShare2018Pct, salesGrowth2024Pct, skipjackShare2018Pct,
} from '@/lib/data/company-tecopesca';


const ACCENT = '#c2410c';
/** 정적 조사 아카이브라 갱신일이 곧 조사일이다. LIVE 로 표기하지 않는다(L-09). */
const SYNC = { status: 'STATIC' as const, syncDate: '2026-08-20 조사 아카이브' };
const FIN = latestFinancial();

/** 회사 개요 표. 도형으로 그릴 것이 없는 항목이라 표로 둔다. */
function ProfileTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>항목</th>
            <th>내용</th>
          </tr>
        </thead>
        <tbody>
          {frinsaProfile.map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** EU 수입관세. 세율이 용도별로 갈리는 것이 요지라 표로 둔다. */
function TariffTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>품목</th>
            <th>세번</th>
            <th>기본세율</th>
            <th>조건</th>
          </tr>
        </thead>
        <tbody>
          {frinsaTariff.map((r) => (
            <tr key={r.코드}>
              <td>{r.품목}</td>
              <td>{r.코드}</td>
              <td>{r.mfn}</td>
              <td>{r.조건}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 브랜드 포트폴리오. 포지션·채널이 요지라 표로 둔다. */
function BrandTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>브랜드</th>
            <th>시장</th>
            <th>포지션</th>
            <th>채널</th>
          </tr>
        </thead>
        <tbody>
          {frinsaBrands.map((r) => (
            <tr key={r.브랜드}>
              <td>{r.브랜드}</td>
              <td>{r.시장}</td>
              <td>{r.포지션}</td>
              <td>{r.채널}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 인증 현황. 원본 인증서로 확정된 것만 싣고, 만료는 만료라고 적는다. */
function CertTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>인증</th>
            <th>번호</th>
            <th>상태</th>
            <th>유효</th>
          </tr>
        </thead>
        <tbody>
          {frinsaCerts.map((r) => (
            <tr key={r.인증}>
              <td>{r.인증}</td>
              <td>{r.번호}</td>
              <td>{r.상태}</td>
              <td>{r.유효}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CHART_SLOTS: Record<string, ChartSlot[]> = {
  c01: [
    {
      title: '회사 개요',
      caption: '법인 정체성과 지배구조. 등기·EINF로 확정된 항목만 싣는다.',
      telemetry: SYNC,
      render: () => <ProfileTable />,
      span: 'full',
      sourceLine: '스페인 상업등기 (CIF A15010564) · 회사 EINF · 조사 아카이브 §1',
    },
  ],
  c02: [
    {
      title: 'FY2024 국가별 세전이익 (M€)',
      caption: '상위 6개국. 주황 막대가 싱가포르 구매본부다. 판매법인이 아닌데 그룹 2위권이다.',
      telemetry: SYNC,
      render: () => <FrinsaBaiChart />,
      sourceLine: '회사 EINF ‘국가별 세전이익’ (국가 합계와 산술 일치 검증)',
    },
  ],
  c03: [
    {
      title: '가격 사다리 (€/kg)',
      caption: '자사몰·전문점·대형마트 진열가를 kg 단가로 환산했다. 주황 막대가 100 €/kg 초과 층이다.',
      telemetry: SYNC,
      render: () => <FrinsaPriceLadderChart />,
      sourceLine: '자사몰 WooCommerce API 실측 (제품 69종, 2026-08-20) · Alcampo·Carrefour·DIA 진열가',
    },
    {
      title: '브랜드 포트폴리오',
      caption: '스페인 5 + 포르투갈 계열 + PL. 브랜드마다 배정 채널이 다르다.',
      telemetry: SYNC,
      render: () => <BrandTable />,
      span: 'full',
      sourceLine: '자사몰·apoveira.pt·Alimarket·Merca2 교차 (조사 아카이브 §5·§14)',
    },
  ],
  c04: [
    {
      title: '열병합 발전량 (MWh)',
      caption: '2023년부터 사실상 정지(−99.8%). 0이 아니라 254·117 MWh 다.',
      telemetry: SYNC,
      render: () => <FrinsaCogenChart />,
      sourceLine: '회사 EINF 에너지 표 (2022~2024)',
    },
  ],
  c05: [
    {
      title: '참치 원어 구매량 (톤)',
      caption: '법인별 구매량. 「그룹 합계」는 두 법인의 합이라 이중계상을 피해 뺐다.',
      telemetry: SYNC,
      render: () => <FrinsaSourcingChart />,
      sourceLine: '회사 EINF · SAP 구매등록 (2024)',
    },
    {
      title: '2025년 참치 구매 출처 (%)',
      caption: '어업 기준. MSC 인증이 68%다.',
      telemetry: SYNC,
      render: () => <FrinsaSustainabilityChart axis="어업 출처" />,
      sourceLine: 'Frinsa Marine Sustainability Policy 2026 (2025년 실적, 자사 공시, 원문 전 항목 대조 일치)',
    },
    {
      title: '2025년 공급사 참여 (%)',
      caption: '공급사 기준. 주황 막대가 「어디에도 해당 없음」으로, 앞 차트와 같은 것을 재지 않는다.',
      telemetry: SYNC,
      render: () => <FrinsaSustainabilityChart axis="공급사 출처" />,
      sourceLine: 'Frinsa Marine Sustainability Policy 2026 (2025년 실적, 자사 공시)',
    },
    {
      title: '인증 현황',
      caption: '원본 인증서로 확정된 것만 싣는다. IFS Broker는 만료본까지만 확인됐다.',
      telemetry: SYNC,
      render: () => <CertTable />,
      sourceLine: '인증서 원본 4종 (NSF·Bureau Veritas) · MSC 등록부 · EII 명부 CSV · ISSF 준수보고서',
    },
  ],
  c06: [
    {
      title: '매출과 순이익률 (M€·%)',
      caption: '2019~2024 그룹 연결. 단위가 달라 축을 나눴다. 2025년은 미공표라 없다.',
      telemetry: SYNC,
      render: () => <FrinsaFinancialChart />,
      sourceLine: '갈리시아 언론 교차 (O Barbanza 2024-08 · Costa Oeste · economiadigital 2025-07)',
    },
    {
      title: 'FY2024 지역별 매출 (M€)',
      caption: '이베리아 밖(주황 막대)이 57.6%다. 합 740.4가 보도치 741 과 정합한다.',
      telemetry: SYNC,
      render: () => <FrinsaRegionalChart />,
      sourceLine: '조사 아카이브 §3 · 지역분해 3표 검증 (합계·보도치 산술 정합)',
    },
  ],
  c07: [
    {
      title: '갈리시아 3강 매출 (M€)',
      caption: '2025년 Frinsa는 미공표라 막대가 없다. 0이 아니다.',
      telemetry: SYNC,
      render: () => <FrinsaGaliciaChart />,
      sourceLine: '각 사 공시·언론 (economiadigital 2025-07 / 2026-05 · Europa Azul)',
    },
  ],
  c08: [
    {
      title: '한국 → 스페인 냉동참치 수출 (톤·백만$)',
      caption: 'UN Comtrade 스페인 신고 기준. 2025년은 미완연도다. 물량과 금액이 함께 튀었다가 함께 내려왔다.',
      telemetry: SYNC,
      render: () => <FrinsaKoreaExportChart />,
      sourceLine: 'UN Comtrade (스페인 신고·총계행). 2025년은 미완연도',
    },
    {
      title: 'EU 수입관세 (%)',
      caption: '가공도가 세율을 정한다. 캔가공용 냉동 통마리만 end-use 면세다.',
      telemetry: SYNC,
      render: () => <TariffTable />,
      sourceLine: 'EU TARIC 원문 (2026-08-19 기준) · EUR-Lex CELEX:32023R2720',
    },
  ],
};

const SPEC: CommoditySpec = {
  key: 'company-anatomy',
  title: '기업 해부: Frinsa del Noroeste',
  subtitle: '스페인 갈리시아 캔참치 가공사. 선단 0척으로 한 해 참치 원어 135,289톤(회사 EINF SAP 집계)을 사들인다.',
  accent: ACCENT,
  primaryKpi: {
    label: `${FIN.연도}년 그룹 매출`,
    value: FIN.매출,
    unit: '(M€)',
    accent: ACCENT,
  },
  secondaryKpis: [
    { label: `${FIN.연도}년 순이익`, value: FIN.순이익, unit: '(M€)', decimals: 1 },
    { label: '연간 참치 구매', value: tunaPurchasedMt(), unit: '(톤)' },
    { label: '보유 선단', value: 0, unit: '(척)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '규모',
      title: `${FIN.연도}년 매출`,
      body: `${FIN.매출.toLocaleString('ko-KR')} (M€)`,
    },
    { eyebrow: '조달', title: '참치 원어 구매', body: `${tunaPurchasedMt().toLocaleString('ko-KR')} (톤)` },
    { eyebrow: '창구', title: '싱가포르 구매본부 BAI', body: '5.0 (M€)' },
    { eyebrow: '관세', title: '캔가공용 냉동 통마리', body: '0 (%)' },
  ],
  briefing: proseBriefing('frinsa'),
  narratives: inlineReport('frinsa', proseStages('frinsa')),
  // 보고서 표·그림은 flow 가 원문 자리에 낸다. 여기는 손으로 고른 슬롯만 남는다.
  chartSlots: CHART_SLOTS,
  // 조사보고서는 절을 하나씩 넘기며 읽는 문서가 아니다. 문서 순서 그대로 이어서 낸다.
  continuous: true,
  sourceNotes: FRINSA_SOURCE_NOTES,
  sourceMeta: [
    `${frinsaMeta.회사} · ${frinsaMeta.국가} · ${frinsaMeta.업종}`,
    `출처 ${frinsaMeta.출처}`,
    `갱신 ${frinsaMeta.갱신방법}`,
  ].join(' · '),
};

const TU_ACCENT = '#1e40af';
const TU_FIN = latestTuFinancial();
const TU_KE = latestKoreaExport();

/** Thai Union 회사 개요 표. */
function TuProfileTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>항목</th>
            <th>내용</th>
          </tr>
        </thead>
        <tbody>
          {thaiUnionProfile.map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 참치조제품 대한 수입 — 관세가 지도를 그린다는 것이 요지라 표로 둔다. */
function TuKoreaImportTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>원산지</th>
            <th>2024 수입액</th>
            <th>비중</th>
            <th>관세</th>
          </tr>
        </thead>
        <tbody>
          {thaiUnionKoreaImport.map((r) => (
            <tr key={r.원산지}>
              <td>{r.원산지}</td>
              <td>{`$${r.usd.toLocaleString('ko-KR')}`}</td>
              <td>{`${r.비중}%`}</td>
              <td>{r.관세}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 미국 실효 관세 — 품목별 부담이 요지라 표로 둔다. */
function TuUsTariffTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>품목</th>
            <th>실효 부담</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {thaiUnionUsTariff.map((r) => (
            <tr key={r.품목}>
              <td>{r.품목}</td>
              <td>{r.부담}</td>
              <td>{r.비고}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 2열 단순 표 공용 렌더러 — Thai Union 확장 표 7종이 공유한다. */
/**
 * 좁은 화면용 목록. `.factWrap` 은 720px 이하에서 숨으므로 이 짝이 없으면
 * 휴대폰에서 표가 통째로 사라진다. 표를 CSS 로 접으면 일부 브라우저에서 표 의미가
 * 깨지므로(기존 주석 참조) 같은 데이터를 마크업 둘로 낸다.
 */
function NarrowList({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <ul className={styles.factList}>
      {rows.map((r, i) => (
        <li key={i}>
          <div className={styles.factHead}>
            <span className={styles.factLabel}>{r[0]}</span>
          </div>
          {r.slice(1).map((c, j) => (
            c === '' || c === undefined ? null : (
              <p key={j} className={styles.factMeta}>
                {head[j + 1] ? `${head[j + 1]} · ` : ''}{c}
              </p>
            )
          ))}
        </li>
      ))}
    </ul>
  );
}

function TuRows({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <>
      <div className={styles.factWrap}>
        <table className={styles.factTable}>
          <thead>
            <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <NarrowList head={head} rows={rows} />
    </>
  );
}

/**
 * 조사보고서 표를 원문 그대로 그린다.
 *
 * 값을 옮겨 적지 않으므로 여기서 할 일은 두 가지뿐이다 — 원문이 우측정렬로 표시한
 * 열을 그대로 우측정렬하고, 빈 칸(병합됐던 자리)을 「」가 아니라 「—」로 채우지 않는 것.
 * 원문이 비워 둔 칸을 채우면 없는 값을 만들어 내는 셈이다.
 */
/** 보고서 팩샷 묶음. 격자로 놓고 캡션을 살린다. */
function RepShots({ figs }: { figs: ReportFigure[] }) {
  return (
    <div className={styles.figGrid}>
      {figs.map((f, i) => (
        <figure key={i} className={styles.figCard}>
          <div className={styles.figShot}>
            {/* 보고서에서 뽑은 정적 파일이다. 크기가 제각각이라 next/image 로 감싸지 않는다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.src} alt={f.alt || f.caption} loading="lazy" />
          </div>
          {f.alt || f.caption ? (
            <figcaption className={styles.figCap}>{f.alt || f.caption}</figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

/**
 * 인라인 SVG 차트.
 *
 * 차트가 쓰는 클래스는 **보고서 자체 style 에만** 있다. 그대로 심으면 선이 안 보이고
 * 글자가 기본 크기로 나온다 — FCF 차트가 실제로 그랬다. 추출기가 그 규칙을 함께 뽑아 두었고
 * 여기서 그림 하나에만 걸리도록 범위를 좁혀 붙인다. 전역에 새면 대시보드 다른 곳이 깨진다.
 *
 * 색 변수는 보고서의 밝은 팔레트다. 그래서 판을 흰색으로 고정한다 — 팩샷도 흰 배경이라
 * 그림끼리 톤이 어긋나지 않는다.
 */
function RepChart({ f, id }: { f: ReportFigure; id: string }) {
  const scoped = (f.css ?? '')
    .replace(/:scope\{/g, `[data-fig="${id}"]{`)
    .replace(/(^|\})\s*(\.[^{}]+)\{/g,
      (_m: string, close: string, sel: string) => `${close}[data-fig="${id}"] ${sel}{`);
  return (
    <figure className={styles.figChart} data-fig={id}>
      {scoped ? <style dangerouslySetInnerHTML={{ __html: scoped }} /> : null}
      <div className={styles.figPlate} dangerouslySetInnerHTML={{ __html: f.svg ?? '' }} />
      {f.caption ? <figcaption className={styles.figCap}>{f.caption}</figcaption> : null}
    </figure>
  );
}

/** 문서 캡처. 읽혀야 하므로 폭을 다 쓴다. */
function RepDoc({ f }: { f: ReportFigure }) {
  return (
    <figure className={`${styles.figChart} ${styles.figDoc}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={f.src} alt={f.alt || f.caption} loading="lazy" />
      {f.caption ? <figcaption className={styles.figCap}>{f.caption}</figcaption> : null}
    </figure>
  );
}

function RepTable({ t }: { t: ReportTable }) {
  return (
    <>
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        {t.caption ? <caption className={styles.factCaption}>{t.caption}</caption> : null}
        <thead>
          <tr>
            {t.head.map((h, i) => (
              <th key={i} className={t.num[i] ? styles.factNum : undefined}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={t.num[j] ? styles.factNum : undefined}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <NarrowList head={t.head} rows={t.rows} />
    </>
  );
}

/**
 * 보고서 표·그림을 **원문에 있던 자리**로 되돌린 서술 흐름.
 *
 * 표를 절 끝에 몰아 두면 그 표를 설명하는 문장과 멀어져 둘 다 안 읽힌다. 추출기가 남긴
 * 문자 오프셋(`ord`)으로 글·표·그림을 한 줄로 세운다. 손으로 고른 인터랙티브 차트는
 * 원문에 자리가 없으므로 절 끝 「근거」에 그대로 남는다.
 */
function inlineReport(company: string, narratives: StageNarrative[]): StageNarrative[] {
  return narratives.map((n) => {
    if (!n.flow) return n;
    const figs = figuresForStage(company, n.key);
    const tabs = tablesForStage(company, n.key);
    const extras: FlowItem[] = [];

    // 팩샷은 한 묶음이다. 첫 팩샷 자리에 통째로 놓는다.
    const shots = figs.filter((f) => f.kind === 'shot');
    if (shots.length) {
      extras.push({
        kind: 'slot',
        ord: Math.min(...shots.map((f) => f.ord ?? 0)),
        slot: {
          title: shots.length > 1 ? `제품 이미지 ${shots.length}점` : '제품 이미지',
          caption: shots.find((f) => f.caption)?.caption ?? '',
          telemetry: SYNC,
          render: () => <RepShots figs={shots} />,
          span: 'full' as const,
          sourceLine: '사내 조사보고서 · 브랜드 공식 이미지',
        },
      });
    }
    for (const [i, f] of figs.filter((x) => x.kind === 'chart').entries()) {
      extras.push({
        kind: 'slot',
        ord: f.ord ?? 0,
        slot: {
          title: f.caption.slice(0, 40) || '차트',
          caption: f.caption,
          telemetry: SYNC,
          render: () => <RepChart f={f} id={`${company}-${f.sid}-${i}`} />,
          span: 'full' as const,
          sourceLine: `사내 조사보고서 ${f.sid}`,
        },
      });
    }
    for (const f of figs.filter((x) => x.kind === 'doc')) {
      extras.push({
        kind: 'slot',
        ord: f.ord ?? 0,
        slot: {
          title: f.alt.slice(0, 40) || '문서 캡처',
          caption: f.caption,
          telemetry: SYNC,
          render: () => <RepDoc f={f} />,
          span: 'full' as const,
          sourceLine: '사내 조사보고서 · 원본 캡처',
        },
      });
    }
    for (const t of tabs) {
      extras.push({
        kind: 'slot',
        ord: t.ord ?? 0,
        slot: {
          title: t.title,
          caption: t.note ?? '',
          telemetry: SYNC,
          render: () => <RepTable t={t} />,
          span: 'full' as const,
          sourceLine: `사내 조사보고서 ${t.section}`,
        },
      });
    }
    if (!extras.length) return n;
    const merged = [...n.flow, ...extras].sort((a, b) => a.ord - b.ord);

    // 소제목이 바로 뒤 표의 제목과 같으면 지운다. 추출기가 표 제목을 그 소제목에서
    // 가져오므로 그대로 두면 같은 말이 두 줄 연속으로 선다.
    const deduped = merged.filter((item, i) => {
      if (item.kind !== 'head') return true;
      const next = merged[i + 1];
      return !(next && next.kind === 'slot' && next.slot.title === item.text);
    });
    // 절 머리의 부제와 첫 소제목이 같은 경우도 마찬가지다.
    const first = deduped[0];
    if (first && first.kind === 'head' && first.text === n.question) deduped.shift();
    return { ...n, flow: deduped };
  });
}

const TU_CHART_SLOTS: Record<string, ChartSlot[]> = {
  c01: [
    {
      title: '회사 개요',
      caption: '설립·상장·지배구조 등 조사보고서 01장 요약.',
      telemetry: SYNC,
      render: () => <TuProfileTable />,
      sourceLine: '사내 조사보고서 (2026-08) · 56-1 One Report FY2025',
    },
    {
      title: '주주 구성 (%)',
      caption: '2대 주주가 자기주식 13.47%다. 미쓰비시UFJ모건스탠리(5.36%)는 지분 확대를 시도한 미쓰비시상사와 별개 주체다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['순위', '주주', '지분 (%)']}
          rows={thaiUnionShareholders.map((r) => [r.순위, r.주주, r.지분.toFixed(2)])} />
      ),
      sourceLine: '사내 조사보고서 (2026-08) · One Report p.75',
    },
    {
      title: '연혁: 두 번의 도약',
      caption: '1997년 미국, 2010년 유럽. 브랜드를 사 모은 궤적과 Red Lobster·미쓰비시까지.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['연도', '사건']}
          rows={thaiUnionHistory.map((r) => [r.연도, r.사건])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) · One Report pp.6-8',
    },
  ],
  c02: [
    {
      title: '카테고리별 매출과 마진 (십억 밧·%)',
      caption: 'FY2025 연결. 유일하게 성장한 PetCare가 마진도 가장 높다.',
      telemetry: SYNC,
      render: () => <TuSegmentChart />,
      sourceLine: '사내 조사보고서 (2026-08) · One Report MD&A',
    },
    {
      title: '자사 브랜드 매출 비중 (%)',
      caption: '주황 막대가 PetCare 다. 98.8%가 고객 브랜드·PL 이다. 한 회사 안의 두 모델.',
      telemetry: SYNC,
      render: () => <TuBrandShareChart />,
      sourceLine: '사내 조사보고서 (2026-08) · One Report p.33·37',
    },
    {
      title: '카테고리별 지역 구성 (%)',
      caption: '주황 구간이 미국·북미. Frozen 51.2%·PetCare 58.9%. 관세 직격 구간의 크기다.',
      telemetry: SYNC,
      render: () => <TuRegionChart />,
      sourceLine: '사내 조사보고서 (2026-08) · One Report pp.33-37',
    },
  ],
  c03: [
    {
      title: '브랜드 포트폴리오: 실측 SKU',
      caption: '공식몰 API·사이트맵 전수(2026-08-20). 라인업이 서로 겹치지 않는다. 산 것은 상표가 아니라 시장별 소비 문법이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['브랜드', '국가', 'SKU', '라인업 축']}
          rows={thaiUnionBrands.map((r) => [r.브랜드, r.국가, r.sku ?? '-', r.축])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 04장 (2026-08) · WP REST·Shopify GraphQL·사이트맵·OFF 실측',
    },
    {
      title: 'John West 형태 사다리 (£/kg)',
      caption: '같은 참치가 형태만으로 2.6배가 된다. 주황 막대가 £18 초과 층이다. Frinsa의 부위 사다리와 대구를 이룬다.',
      telemetry: SYNC,
      render: () => <TuJwLadderChart />,
      sourceLine: 'Morrisons 실측 46건 (사내 조사보고서 인용) · 2026-08-20',
    },
    {
      title: '소매 실판매가 표본',
      caption: '4개국 376건 실측 중 대표 6건. 차단된 소매(Tesco·Carrefour)는 미수집으로 남겼다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['브랜드', '제품', '가격', '단가', '소매처']}
          rows={thaiUnionRetailPrices.map((r) => [r.브랜드, r.제품, r.가격, r.단가, r.소매처])} />
      ),
      sourceLine: 'Morrisons·Open Prices·Safeway·Walmart (사내 조사보고서 인용)',
    },
    {
      title: '브랜드별 SKU 수와 자료 등급',
      caption: '아홉 브랜드 467개. 여섯 곳은 회사 공개 카탈로그이고 셋은 전용 사이트가 없거나 막혀 Open Food Facts 로 받았다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['브랜드', '국가', 'SKU', '등급', '자료']}
          rows={tuBrands.map((b) => [b.브랜드, b.국가, b.수, b.등급, b.출처])} />
      ),
      span: 'full',
      sourceLine: tuSkuMeta.출처,
    },
    {
      title: '어종 구성 (SKU)',
      caption: '참치가 절반이 안 된다. 연어·정어리·고등어가 나머지를 채운다 - 브랜드를 사 모은 결과다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['어종', 'SKU']}
          rows={speciesMix().map((r) => [r.어종, r.수])} />
      ),
      sourceLine: '어종이 적힌 442건 기준. 나머지 25건은 원자료에 어종 표기가 없다',
    },
    {
      title: '자료가 채우지 못한 칸',
      caption: '없는 값을 만들어 넣지 않았다. 「-」는 곧 출처에 없다는 뜻이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', '채워진 SKU', '비율 (%)']}
          rows={[
            ['어종', `${Math.round(fillRate('어종') * skuTotal() / 100)} / ${skuTotal()}`, fillRate('어종').toFixed(1)],
            ['규격', `${Math.round(fillRate('규격') * skuTotal() / 100)} / ${skuTotal()}`, fillRate('규격').toFixed(1)],
            ['인증', `${Math.round(fillRate('인증') * skuTotal() / 100)} / ${skuTotal()}`, fillRate('인증').toFixed(1)],
          ]} />
      ),
      sourceLine: tuSkuMeta.한계,
    },
    {
      title: 'John West',
      caption: '영국 국민 브랜드. 87개 중 참치가 48개다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['제품명', '어종', '규격', '인증']}
          rows={skusOf('John West').map((s) => [s.제품명, s.어종, s.규격, s.인증])} />
      ),
      span: 'full',
      sourceLine: '공식 브랜드 카탈로그 · WP API 분류',
    },
    {
      title: 'Chicken of the Sea',
      caption: '미국. 참치 22개에 게·연어·정어리가 붙는다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['제품명', '어종', '규격', '인증']}
          rows={skusOf('Chicken of the Sea').map((s) => [s.제품명, s.어종, s.규격, s.인증])} />
      ),
      span: 'full',
      sourceLine: '공식 브랜드 카탈로그',
    },
    {
      title: 'Petit Navire',
      caption: '프랑스 1위. 참치 38개로 이 그룹에서 참치 비중이 가장 높다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['제품명', '어종', '규격', '인증']}
          rows={skusOf('Petit Navire').map((s) => [s.제품명, s.어종, s.규격, s.인증])} />
      ),
      span: 'full',
      sourceLine: '공식 제품 카탈로그',
    },
    {
      title: 'Rügen Fisch',
      caption: '독일. 참치가 0이고 청어·고등어다. 학명까지 표기한다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['제품명', '어종', '규격', '인증']}
          rows={skusOf('Rügen Fisch').map((s) => [s.제품명, s.어종, s.규격, s.인증])} />
      ),
      span: 'full',
      sourceLine: '공식 제품 카탈로그',
    },
    {
      title: 'Hawesta',
      caption: '독일에서 참치를 맡은 쪽. 12개가 참치다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['제품명', '어종', '규격', '인증']}
          rows={skusOf('Hawesta').map((s) => [s.제품명, s.어종, s.규격, s.인증])} />
      ),
      span: 'full',
      sourceLine: '공식 제품 카탈로그',
    },
    {
      title: 'King Oscar',
      caption: '노르웨이. 브리슬링 정어리가 중심이고 GTIN 이 붙는다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['제품명', '어종', '규격', '인증']}
          rows={skusOf('King Oscar').map((s) => [s.제품명, s.어종, s.규격, s.인증])} />
      ),
      span: 'full',
      sourceLine: '공식 제품 카탈로그(Shopify Storefront)',
    },
    {
      title: 'Mareblu',
      caption: '이탈리아. 전용 사이트가 403 이라 Open Food Facts 로 받았다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['제품명', '어종', '규격', '인증']}
          rows={skusOf('Mareblu').map((s) => [s.제품명, s.어종, s.규격, s.인증])} />
      ),
      span: 'full',
      sourceLine: 'Open Food Facts - 등급 B',
    },
    {
      title: 'Parmentier',
      caption: 'Petit Navire 의 모태 공장. 정어리 전용 라인이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['제품명', '어종', '규격', '인증']}
          rows={skusOf('Parmentier').map((s) => [s.제품명, s.어종, s.규격, s.인증])} />
      ),
      span: 'full',
      sourceLine: 'Open Food Facts - 등급 B',
    },
    {
      title: 'Sealect',
      caption: '태국 내수 브랜드. 사이트가 구 사명에 멈춰 있다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['제품명', '어종', '규격', '인증']}
          rows={skusOf('Sealect').map((s) => [s.제품명, s.어종, s.규격, s.인증])} />
      ),
      span: 'full',
      sourceLine: 'Open Food Facts - 등급 B',
    },
    {
      title: '소매 실판매가 (186건)',
      caption: '전부 소매처와 기준일이 붙어 있다. 영국은 Morrisons 만 서버사이드로 가격을 내보내 그쪽에서만 뚫렸다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['브랜드', '제품 · 규격', '가격', '소매처', '국가', '기준일']}
          rows={tuPrices.map((p) => [p.브랜드, `${p.제품명} · ${p.규격}`, p.가격, p.소매처, p.국가, p.기준일])} />
      ),
      span: 'full',
      sourceLine: 'Open Prices 123건 + Morrisons JSON-LD 실측 63건',
    },
  ],
  c04: [
    {
      title: '그룹 생산능력 (톤/년)',
      caption: '주황 막대가 참치 57만 톤. PetCare는 공시 내 모순(221k vs 195k)이 있어 서술값이다.',
      telemetry: SYNC,
      render: () => <TuCapacityChart />,
      sourceLine: '사내 조사보고서 (2026-08) · One Report p.46',
    },
    {
      title: '가공 거점',
      caption: '공장 보유 26개 법인의 대표 소재지. 사뭇사콘은 캔·라벨까지 수직계열화돼 있다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['지역', '거점 · 법인', '품목']}
          rows={thaiUnionFactories.map((r) => [r.지역, r.거점, r.품목])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) · One Report pp.53-79 (BOI 등록 포함)',
    },
    {
      title: '참치 조달 어장 구성 추이 (%)',
      caption: 'MSC 인증이 2년 만에 31→71.4%. FIP 물량이 인증으로 ‘졸업’하며 옮겨 갔다.',
      telemetry: SYNC,
      render: () => <TuMscTrendChart />,
      sourceLine: '사내 조사보고서 (2026-08) · SeaChange 2024 Table 1',
    },
    {
      title: 'TC25 6대 약속 이행률 (%)',
      caption: '목표는 전부 2025년 100%. 주황 막대가 미달 구간이다. 공급자 감사가 87.6%로 가장 남았다.',
      telemetry: SYNC,
      render: () => <TuTc25Chart />,
      sourceLine: '사내 조사보고서 (2026-08) · SeaChange 2024 (Key Traceability 독립검증)',
    },
  ],
  c05: [
    {
      title: 'GHG Scope 별 배출 (천 tCO2e)',
      caption: '2023년에 Scope 3가 없는 것은 미보고라서다. 0이 아니다. 이 공백이 ‘6배 폭증’ 오독을 만든다.',
      telemetry: SYNC,
      render: () => <TuGhgChart />,
      sourceLine: '사내 조사보고서 (2026-08) · One Report p.131 (검증 LRQA)',
    },
    {
      title: 'SeaChange 2030 대시보드 (%)',
      caption: '2030년 100% 목표 대비 FY2024 실적. 참치는 다 왔고 새우사료·대두·닭고기·GDST는 초입이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['목표', '실적 (%)', '판정']}
          rows={thaiUnionSeachange.map((r) => [r.목표, r.실적.toFixed(1), r.상태])} />
      ),
      sourceLine: '사내 조사보고서 (2026-08) · SeaChange 2024 pp.12-14',
    },
  ],
  c06: [
    {
      title: '매출과 마진 (십억 밧·%)',
      caption: '2023년 매출은 원본 표에 없어 비어 있다. 0이 아니다. GPM은 3년 연속 개선.',
      telemetry: SYNC,
      render: () => <TuFinancialChart />,
      sourceLine: '사내 조사보고서 (2026-08) · 감사 재무제표 OCR',
    },
    {
      title: '연결 vs 개별: 순이익 역전 (십억 밧)',
      caption: '청록(개별)이 파랑(연결)보다 긴 줄이 이 회사의 함정이다. 모회사 배당수익 125.1억 밧.',
      telemetry: SYNC,
      render: () => <TuConVsSepChart />,
      sourceLine: '사내 조사보고서 (2026-08) · 감사 재무제표 p.357 (OCR)',
    },
    {
      title: '재무상태 (백만 밧)',
      caption: '부채는 늘고 자본은 줄었다. 자기주식 취득 43.1억 밧이 자본 감소의 주범이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', '2025', '2024']}
          rows={thaiUnionBalance.map((r) => [r.항목,
            r.y2025.toLocaleString('ko-KR'), r.y2024.toLocaleString('ko-KR')])} />
      ),
      sourceLine: '사내 조사보고서 (2026-08) · MD&A',
    },
    {
      title: 'Red Lobster: 4겹',
      caption: '손상 → 지위 전환 → 잔여 지분 → 소송. 2023년에 끝난 일이 아니다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['층', '시점', '내용']}
          rows={thaiUnionRedLobster.map((r) => [r.층, r.시점, r.내용])} />
      ),
      sourceLine: '사내 조사보고서 (2026-08) · One Report pp.6·181-182',
    },
  ],
  c07: [
    {
      title: '한국 → 태국 냉동참치 수출 (톤·백만$)',
      caption: '한국 냉동참치 수출의 54.1%(중량)가 태국행이다. 2025년 감소는 관세 관망의 흔적.',
      telemetry: SYNC,
      render: () => <TuKoreaExportChart />,
      sourceLine: 'UN Comtrade 한국 신고 (사내 조사보고서 인용)',
    },
    {
      title: '참치조제품 대한 수입 (2024)',
      caption: '베트남 74.3% vs 태국 12.8%. 관세(0% vs 20%)가 그린 지도다.',
      telemetry: SYNC,
      render: () => <TuKoreaImportTable />,
      sourceLine: 'Comtrade + 관세청 FTA포털 (사내 조사보고서 인용)',
    },
    {
      title: '식약처 수입신고 구성 (건)',
      caption: '한국에 들어오는 실체는 참치(주황)가 아니라 새우다. 등록 제조업소 14개소 · 173건.',
      telemetry: SYNC,
      render: () => <TuMfdsChart />,
      sourceLine: '식약처 수입식품 DB 실측 (사내 조사보고서 인용) · 2024-01~2026-08',
    },
    {
      title: '미국 실효 관세 (%)',
      caption: '미국이 그룹 매출의 38%다. 회사는 대미 물량의 가나·세이셸 전환을 공시했다.',
      telemetry: SYNC,
      render: () => <TuUsTariffTable />,
      sourceLine: 'One Report pp.97-98 (사내 조사보고서 인용) · 2025-08-01 확정',
    },
  ],
};

const TU_SPEC: CommoditySpec = {
  key: 'company-anatomy-thaiunion',
  title: '기업 해부: Thai Union Group',
  subtitle: '세계 최대 참치 가공사. 한국 냉동참치 수출의 절반이 이 회사의 앞마당으로 간다.',
  accent: TU_ACCENT,
  primaryKpi: {
    label: `${TU_FIN.연도}년 연결 매출`,
    value: TU_FIN.매출 ?? 0,
    unit: '(백만 밧)',
    accent: TU_ACCENT,
  },
  secondaryKpis: [
    { label: `${TU_FIN.연도}년 매출총이익률`, value: TU_FIN.gpm, unit: '(%)', decimals: 1 },
    { label: '참치 캐파', value: tunaCapacityMt(), unit: '(톤/년)' },
    { label: '브랜드 실측 SKU', value: totalBrandSku(), unit: '(개)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '규모',
      title: `${TU_FIN.연도}년 연결 매출`,
      body: `${(TU_FIN.매출 ?? 0).toLocaleString('ko-KR')} (백만 밧)`,
    },
    { eyebrow: '한국 접점', title: `한국→태국 수출 (${TU_KE.연도})`, body: `${Math.round(TU_KE.톤).toLocaleString('ko-KR')} (톤)` },
    { eyebrow: '관세', title: '수침 캔참치 대미 부담', body: '31.5 (%)' },
  ],
  briefing: proseBriefing('thaiunion'),
  narratives: inlineReport('thaiunion', proseStages('thaiunion')),
  // 보고서 표·그림은 flow 가 원문 자리에 낸다. 여기는 손으로 고른 슬롯만 남는다.
  chartSlots: TU_CHART_SLOTS,
  // 조사보고서는 절을 하나씩 넘기며 읽는 문서가 아니다. 문서 순서 그대로 이어서 낸다.
  continuous: true,
  sourceNotes: THAIUNION_SOURCE_NOTES,
  sourceMeta: [
    `${thaiUnionMeta.회사} · ${thaiUnionMeta.국가} · ${thaiUnionMeta.업종}`,
    `출처 ${thaiUnionMeta.출처}`,
    `갱신 ${thaiUnionMeta.갱신방법}`,
  ].join(' · '),
};

const ALB_ACCENT = '#1f5d4c';
const ALB_CATCH = latestCatch();

const ALB_CHART_SLOTS: Record<string, ChartSlot[]> = {
  c01: [
    {
      title: '회사 개요',
      caption: '설립·본사·자본금 등 조사보고서 01절 요약. 비상장 가족기업이라 등기·EINF가 1차 출처다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', '내용']} rows={albacoraProfile.map(([k, v]) => [k, v])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) · 스페인 상업등기 · EINF 2025',
    },
    {
      title: '3사 좌표: 사는 회사와 잡는 회사',
      caption: '선단 0척 둘과 선망 18척 하나. 규모를 재는 축부터 다르고, 한국 선단에게의 자리도 갈린다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', 'Frinsa', 'Thai Union', 'Albacora']}
          rows={albacoraCompare.map((r) => [r.항목, r.frinsa, r.thaiunion, r.albacora])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 3건 대조 (Frinsa 2026-08 · Thai Union 2026-08 · Albacora 2026-08)',
    },
    {
      title: '연혁: 배 네 척에서 시작했다',
      caption: '1962년 선상 냉동 신조선 4척이 출발점이다. 잡은 자리에서 얼려 자기 공장으로 보내는 구조가 여기서 나왔다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['연도', '사건']} rows={albacoraHistory.map((r) => [r.연도, r.사건])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) · BORME · 회사 dossier',
    },
    {
      title: '연간 어획량 (톤)',
      caption: '2024년 207천 톤 → 2025년 약 200천 톤. 프린사가 한 해 사들이는 원어(13.5만 톤)보다 많다.',
      telemetry: SYNC,
      render: () => <AlbCatchChart />,
      sourceLine: 'EINF 2025 (사내 조사보고서 인용)',
    },
  ],
  c02: [
    {
      title: '승계: 3년 사이의 네 번',
      caption: '별세 → 딸 회장 → 손자 CEO. 2026년 7월 집행이사 직위 종료는 8월 17일 재등기의 앞단이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['시점', '변동']} rows={albacoraSuccession.map((r) => [r.시점, r.변동])} />
      ),
      span: 'full',
      sourceLine: '스페인 상업등기 관보(BORME) · EINF 2025 서명',
    },
    {
      title: '계열 · 관계 법인',
      caption: '부회장 자리의 ALONSO ESCURIS SL이 Jealsa 창업 가문이다. 프린사 최대 경쟁사와의 접점.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['법인', '내용']} rows={albacoraAffiliates.map((r) => [r.법인, r.내용])} />
      ),
      span: 'full',
      sourceLine: '스페인 상업등기 · 신용정보 · 회사 dossier',
    },
  ],
  c03: [
    {
      title: '선박별 총톤수 (GT)',
      caption: '등록부 확인 12척. 상위 3척이 4,400 GT 대로 세계 최대급이고 나머지와 층이 갈린다.',
      telemetry: SYNC,
      render: () => <AlbFleetGtChart />,
      sourceLine: 'WCPFC·IOTC·ICCAT·IATTC 선박등록부 (2026-08-17 수집)',
    },
    {
      title: '기국별 척수와 합계 GT',
      caption: '스페인 8 · 파나마 2 · 모리셔스 2. 비스페인 4척은 전부 Integral Fishing Services 소유다.',
      telemetry: SYNC,
      render: () => <AlbFlagChart />,
      sourceLine: 'RFMO 4개 선박등록부 (2026-08-17 수집)',
    },
    {
      title: '어획물 판매처 (%)',
      caption: '인도양 25% 축이 모리셔스 기국 2척과 맞물린다. 스페인 본토는 10%뿐이다.',
      telemetry: SYNC,
      render: () => <AlbSalesDestChart />,
      sourceLine: 'EINF 2025 (회사 자료)',
    },
    {
      title: '선단 명세: 12척 · 36,404 GT',
      caption: '회사 공표 18척 중 공적 등록부로 확인되는 분이다. 나머지 6척은 추정하지 않고 비워 뒀다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['선명', 'GT', '선적', '등재 기구', '소유사']}
          rows={albacoraFleet.map((v) => [v.선명, v.gt.toLocaleString('ko-KR'), v.선적, v.기구, v.소유사])} />
      ),
      span: 'full',
      sourceLine: 'WCPFC·IOTC·ICCAT·IATTC 선박등록부 (2026-08-17 수집)',
    },
    {
      title: '감시 체계',
      caption: '타이유니온이 공급자에게 요구하는 조건을 자기 선단으로 이미 충족한다. REM은 2014년부터다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['장치', '내용']} rows={albacoraMonitoring.map((r) => [r.장치, r.내용])} />
      ),
      span: 'full',
      sourceLine: 'EINF 2025 (회사 명시, 자기주장 포함)',
    },
  ],
  c04: [
    {
      title: '가공 3사 매출과 인력',
      caption: '에콰도르 한 곳이 매출 74% · 인력 92%다. 스페인 두 공장이 줄 때 Posorja는 늘었다.',
      telemetry: SYNC,
      render: () => <AlbPlantChart />,
      sourceLine: 'EINF 2025 (사내 조사보고서 인용)',
    },
    {
      title: 'SIA 베르메오: 투입 톤수와 전년비',
      caption: '매출은 2.7% 줄었는데 실물 투입은 44% 빠졌다. EMAS는 법정 공개 문서라 물량이 그대로 실린다.',
      telemetry: SYNC,
      render: () => <AlbSiaTonnageChart />,
      sourceLine: 'EMAS 환경선언 (SIA 베르메오)',
    },
    {
      title: 'SAC 갈리시아: 원료·제품과 수율',
      caption: '2021년 정점 후 2023년 원료가 44% 감소했다. 물량이 적을 때 수율이 올라간다.',
      telemetry: SYNC,
      render: () => <AlbSacYieldChart />,
      sourceLine: 'EMAS 환경선언 (SAC 갈리시아)',
    },
    {
      title: '공장별 품목과 주시장',
      caption: 'SAE 포소르하만 對EU(UE-626)와 對미주(BASC) 양방향이다. 사실상 수직통합의 허브다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['플랜트', '직원', '2025 매출 (M€)', '품목', '주시장']}
          rows={albacoraPlants.map((p) => [p.플랜트, p.직원.toLocaleString('ko-KR'), p.y2025.toFixed(1), p.품목, p.주시장])} />
      ),
      span: 'full',
      sourceLine: 'EINF 2025 · Salica 인증서 원문',
    },
  ],
  c05: [
    {
      title: 'Campos 가격 사다리 (EUR)',
      caption: '프린사가 부위로 갈렸다면 이쪽은 인증(APR·MSC)과 대용량으로 갈린다. 최고가도 업소·수출 규격이다.',
      telemetry: SYNC,
      render: () => <AlbCamposPriceChart />,
      sourceLine: 'clubcampos.com 실측 (2026-08) · 단일가 16 SKU',
    },
    {
      title: '브랜드',
      caption: '축은 CAMPOS 하나다. 1921년 창립이고 1990년 합병 때 Salica가 승계했다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['브랜드', '성격']} rows={albacoraBrands.map((r) => [r.브랜드, r.성격])} />
      ),
      span: 'full',
      sourceLine: 'APR 인증서 · clubcampos.com',
    },
    {
      title: '플랜트별 인증 현황',
      caption: '3사 전부 MSC CoC·APR·BRC·IFS를 갖췄다. SIA의 MSC CoC 게시본은 2025-10-27 만료다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['플랜트', 'MSC CoC', 'APR', 'BRC', 'IFS']}
          rows={albacoraCerts.map((r) => [r.플랜트, r.msc, r.apr, r.brc, r.ifs])} />
      ),
      span: 'full',
      sourceLine: 'Salica 게시 인증서 원문 17건',
    },
    {
      title: '어업 인증 유닛별 상태',
      caption: '인증 이름 자체가 ‘대서양·인도양’이다. 동태평양 유닛은 철회됐고 에콰도르 원료가 그 밖에 있다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['유닛', '상태']} rows={albacoraMscUnits.map((r) => [r.유닛, r.상태])} />
      ),
      sourceLine: 'MSC-F-31556/31558 (Bureau Veritas · AGAC)',
    },
    {
      title: '그룹 지속가능 체계',
      caption: 'APR 그룹 100% · ISSF PVR/VOSI · 2025년부터 전 선박 Dolphin Safe.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', '내용']} rows={albacoraSustain.map((r) => [r.항목, r.내용])} />
      ),
      sourceLine: 'EINF 2025 · ISSF · Earth Island Institute',
    },
  ],
  c06: [
    {
      title: '재무 개요: 확인된 것만',
      caption: '비상장이라 절대액이 없다. ‘EBITDA −65%’는 개별법인 방향치이지 규모가 아니다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', '값', '출처·기준', '등급']}
          rows={albacoraFinancials.map((r) => [r.항목, r.값, r.기준, r.등급])} />
      ),
      span: 'full',
      sourceLine: 'EINF 2025 · CEO 발언(EFEAgro 2024-04) · 신용정보 방향치',
    },
    {
      title: '산업안전 지표',
      caption: '사고 109건(여 29 · 남 80). 스페인 INSHT 기준이라 타이유니온 LTIFR 과 직접 비교되지 않는다.',
      telemetry: SYNC,
      render: () => <AlbSafetyChart />,
      sourceLine: 'EINF 2025 (INSHT 산정 기준)',
    },
    {
      title: '리스크 이력',
      caption: '투자중재 패소·선박 폭발·ERTE 장기화·Atunlo 파산 연쇄. 매각설은 보도된 바 없다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['시점', '건', '내용']} rows={albacoraRisks.map((r) => [r.시점, r.건, r.내용])} />
      ),
      span: 'full',
      sourceLine: 'PCA/UNCITRAL 판정 · 언론 · 등기',
    },
  ],
  c07: [
    {
      title: '통상 위협: 세 회사의 방향이 다르다',
      caption: '태국은 미국 관세를, 스페인은 아세안 개방을 두려워한다. 한국 선단은 그 사이에 있다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['회사', '가장 큰 통상 위협', '대응']}
          rows={albacoraTradeThreat.map((r) => [r.회사, r.위협, r.대응])} />
      ),
      span: 'full',
      sourceLine: 'Albacora EINF 2025 회장 서한 · Thai Union One Report FY2025',
    },
    {
      title: '겹치는 지점 넷',
      caption: '어법·어장·인증 문턱·수직통합. 판매처만 갈린다. 알바코라는 인도양, 한국은 방콕이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['#', '축', '내용']}
          rows={albacoraOverlap.map((r) => [r.번호, r.축, r.내용])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 3건 대조 · Comtrade',
    },
    {
      title: '남은 물음',
      caption: '경쟁 강도를 정량화하려면 이 넷이 필요하다. 이 문서로는 답하지 못했다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['물음', '왜 중요한가']}
          rows={albacoraOpenQuestions.map((r) => [r.물음, r.왜])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) 07절',
    },
    {
      title: '자료의 한계',
      caption: '비상장 가족기업이라 공개 범위가 제한된다. 무엇이 없는지를 밝혀 두는 자리다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', '상태']} rows={albacoraLimits.map((r) => [r.항목, r.상태])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) 07절',
    },
  ],
};

const ALB_SPEC: CommoditySpec = {
  key: 'company-anatomy-albacora',
  title: '기업 해부: Albacora, S.A.',
  subtitle: '스페인 최대 참치 선망선사. 앞의 두 회사와 달리 거래 상대가 아니라 한국 선단의 직접 경쟁자다.',
  accent: ALB_ACCENT,
  primaryKpi: {
    label: `${ALB_CATCH.연도}년 어획량`,
    value: ALB_CATCH.톤,
    unit: '(톤)',
    accent: ALB_ACCENT,
  },
  secondaryKpis: [
    { label: '선단 (회사 공표)', value: ALBACORA_CLAIMED_VESSELS, unit: '(척)' },
    { label: '등록부 확인 선단', value: fleetGtTotal(), unit: '(GT · 12척)' },
    { label: '가공 3사 매출', value: plantRevenueTotal(), unit: '(M€)', decimals: 1 },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '규모',
      title: `${ALB_CATCH.연도}년 어획량`,
      body: `${ALB_CATCH.톤.toLocaleString('ko-KR')} (톤)`,
    },
    { eyebrow: '무게중심', title: '에콰도르 매출 비중', body: `${ecuadorRevenueShare()} (%)` },
    { eyebrow: '숨은 신호', title: 'SIA 실물 투입 (2023)', body: '−44 (%)' },
  ],
  briefing: proseBriefing('albacora'),
  narratives: inlineReport('albacora', proseStages('albacora')),
  // 보고서 표·그림은 flow 가 원문 자리에 낸다. 여기는 손으로 고른 슬롯만 남는다.
  chartSlots: ALB_CHART_SLOTS,
  // 조사보고서는 절을 하나씩 넘기며 읽는 문서가 아니다. 문서 순서 그대로 이어서 낸다.
  continuous: true,
  sourceNotes: ALBACORA_SOURCE_NOTES,
  sourceMeta: [
    `${albacoraMeta.회사} · ${albacoraMeta.국가} · ${albacoraMeta.업종}`,
    `출처 ${albacoraMeta.출처}`,
    `갱신 ${albacoraMeta.갱신방법}`,
  ].join(' · '),
};


/* ================= FCF ================= */

const FCF_ACCENT = '#c0202e';
const FCF_SILLA_PEAK = sillaPeak();
const FCF_SILLA_NOW = sillaLatest();

const FCF_CHART_SLOTS: Record<string, ChartSlot[]> = {
  c01: [
    {
      title: '회사 개요',
      caption: '설립·본사·자본 등 조사보고서 01절 요약. 2002년 발행정지라 등기와 지속가능보고서가 1차 출처다.',
      telemetry: SYNC,
      render: () => <TuRows head={['항목', '내용']} rows={fcfProfile.map(([k, v]) => [k, v])} />,
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) · 대만 상공등기 · 회사 지속가능보고서 2025',
    },
    {
      title: '4사 좌표: 사고 잡고 대는 회사',
      caption: '앞의 셋과 이 회사의 자리가 갈리는 지점. 신라교역에게의 무게가 다르다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', 'Frinsa', 'Albacora', 'FCF']}
          rows={fcfCompare.map((r) => [r.항목, r.frinsa, r.albacora, r.fcf])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 4건 대조 (2026-08)',
    },
  ],
  c02: [
    {
      title: '지분 구성: 이름과 실권',
      caption: '상호는 창업 張씨 가문의 것인데 이사회 지분은 光陽 계열이 더 많다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['법인', '지분 (%)', '대표']}
          rows={fcfOwnership.map((r) => [r.법인, r.지분.toFixed(2), r.대표])} />
      ),
      span: 'full',
      sourceLine: '대만 상공등기 董監事 자료 (2026-08)',
    },
  ],
  c03: [
    {
      title: '어종별 조달 구성 (2024년 물량)',
      caption: '가다랑어가 61.6에서 70.5로 올랐다. 통조림용 선망이 본체라는 뜻이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['어종', '비중 (%)', '비고']}
          rows={fcfSpecies.map((r) => [r.어종, r.비중.toFixed(1), r.비고])} />
      ),
      sourceLine: '회사 지속가능보고서 2025',
    },
    {
      title: '어법별 구성',
      caption: '선망은 통조림용, 연승은 사시미다. 한국 선망선이 잡는 것과 같은 물건이 90%다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['어법', '비중 (%)', '용도']}
          rows={fcfGear.map((r) => [r.어법, String(r.비중), r.용도])} />
      ),
      sourceLine: '회사 지속가능보고서 2025',
    },
  ],
  c04: [
    {
      title: '그룹 구성',
      caption: '2020년 Bumble Bee 인수로 원료에서 브랜드까지 한 그룹에 들어왔다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['국가', '법인', '분류', '비고']}
          rows={fcfGroup.map((r) => [r.국가, r.법인, r.분류, r.비고])} />
      ),
      span: 'full',
      sourceLine: '회사 공식 거점 목록 · 인수 공시',
    },
  ],
  c06: [
    {
      title: '신라교역 매출 중 FCF 비중',
      caption: '6년 내내 30%대 후반에서 40%대다. FY2024 금액은 2,296억원이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['연도', '비중 (%)']}
          rows={fcfSillaDependency.map((r) => [r.연도, r.비중.toFixed(1)])} />
      ),
      span: 'full',
      sourceLine: '신라교역 사업보고서 「주요 고객에 대한 정보」',
    },
  ],
};

const FCF_SPEC: CommoditySpec = {
  key: 'company-anatomy-fcf',
  title: '기업 해부: FCF Co., Ltd.',
  subtitle: '대만 최대 참치 트레이더. 자사 어선 0척인데 신라교역 매출의 40%를 사가는 단일 최대 고객이다.',
  accent: FCF_ACCENT,
  primaryKpi: {
    label: `신라교역 의존도 (${FCF_SILLA_PEAK.연도})`,
    value: FCF_SILLA_PEAK.비중,
    unit: '(%)',
    decimals: 1,
    accent: FCF_ACCENT,
  },
  secondaryKpis: [
    { label: '자사 보유 어선', value: fcfStats.자사선, unit: '(척)' },
    { label: '협력 공급 어선', value: fcfStats.협력선, unit: '(척 초과)' },
    { label: '그룹 인력', value: fcfStats.인력, unit: '(명)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '최대 고객',
      title: `신라교역 의존도 (${FCF_SILLA_NOW.연도})`,
      body: `${FCF_SILLA_NOW.비중.toFixed(1)} (%)`,
    },
    { eyebrow: '본체', title: '선망 원어 비중', body: '90 (%)' },
    { eyebrow: '실권', title: '光陽 계열 지분', body: `${kwangyangShare().toFixed(2)} (%)` },
  ],
  briefing: proseBriefing('fcf'),
  narratives: inlineReport('fcf', proseStages('fcf')),
  // 보고서 표·그림은 flow 가 원문 자리에 낸다. 여기는 손으로 고른 슬롯만 남는다.
  chartSlots: FCF_CHART_SLOTS,
  // 조사보고서는 절을 하나씩 넘기며 읽는 문서가 아니다. 문서 순서 그대로 이어서 낸다.
  continuous: true,
  sourceNotes: FCF_SOURCE_NOTES,
  sourceMeta: [
    `${fcfMeta.회사} · ${fcfMeta.국가} · ${fcfMeta.업종}`,
    `출처 ${fcfMeta.출처}`,
    `갱신 ${fcfMeta.갱신방법}`,
  ].join(' · '),
};

/* ================= ITOCHU ================= */

const ITC_ACCENT = '#bc002d';

const ITC_CHART_SLOTS: Record<string, ChartSlot[]> = {
  c01: [
    {
      title: '회사 개요',
      caption: '창업·상장·지배구조 등 조사보고서 01절 요약. 법정 공시가 1차 출처다.',
      telemetry: SYNC,
      render: () => <TuRows head={['항목', '내용']} rows={itochuProfile.map(([k, v]) => [k, v])} />,
      span: 'full',
      sourceLine: '유가증권보고서 제102기 (2026-06-12 제출) · 공식 회사개요',
    },
    {
      title: '5사 좌표: 참치가 본업인 회사와 아닌 회사',
      caption: '앞의 넷은 참치가 본업이었다. 이 회사는 참치가 부(部)의 절반이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', 'Frinsa', 'Albacora', 'FCF', 'ITOCHU']}
          rows={itochuCompare.map((r) => [r.항목, r.frinsa, r.albacora, r.fcf, r.itochu])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 5건 대조 (2026-08)',
    },
  ],
  c03: [
    {
      title: '인증 선단 구성',
      caption: '두 어업 25척의 기국별 구성. 대만이 최다이고 사조그룹 계열이 그 다음이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['기국', '척수', '비중 (%)', '선주']}
          rows={itochuFleet.map((r) => [r.기국, r.척수, String(r.비중), r.선주])} />
      ),
      span: 'full',
      sourceLine: 'MSC 선박목록 · 공개인증보고서 (SCS Global Services 제출분)',
    },
    {
      title: 'SI 어업 선박 명세',
      caption: '6척 전부 한국 선적이고 주 양륙항이 모두 타라와다. SI는 SaJo Industries의 약칭이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['선명', '선사', 'IMO', 'GT']}
          rows={itochuSiVessels.map((r) => [r.선명, r.선사, r.imo, r.gt.toLocaleString('ko-KR')])} />
      ),
      span: 'full',
      sourceLine: 'MSC-F-31555 Vessel List (2022-07-07 최종갱신)',
    },
  ],
  c04: [
    {
      title: 'ATI 개요',
      caption: '유일한 참치 가공 자산이다. 제조는 하고로모가 맡고 브랜드도 하고로모 것이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', '내용']} rows={itochuAti.map((r) => [r.항목, r.값])} />
      ),
      span: 'full',
      sourceLine: 'はごろもフーズ 유가증권보고서 제97기 · WCPFC 과학위원회 정보문서',
    },
  ],
  c05: [
    {
      title: '세그먼트별 순이익 (억엔)',
      caption: '食料는 8개 중 4위다. 그런데 그 아래로 수산 숫자가 없다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['세그먼트', 'FY2024', 'FY2025']}
          rows={itochuSegments.map((r) => [r.세그먼트, r.fy2024.toLocaleString('ko-KR'), r.fy2025.toLocaleString('ko-KR')])} />
      ),
      sourceLine: '유가증권보고서 제102기',
    },
    {
      title: '食料 3부문 (억엔)',
      caption: '참치가 속한 生鮮食品 부문만 역성장했다. 공시는 여기서 끝난다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['부문', 'FY2024', 'FY2025']}
          rows={itochuFoodDivisions.map((r) => [r.부문, String(r.fy2024), String(r.fy2025)])} />
      ),
      sourceLine: '유가증권보고서 제102기 · 경영계획 설명자료',
    },
  ],
  c06: [
    {
      title: '한국 지표',
      caption: '거래는 이미 있는데 파는 어종이 다르다. 그 간극이 이 표에 있다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', '값', '기준']}
          rows={itochuKorea.map((r) => [r.항목, r.값, r.기준])} />
      ),
      span: 'full',
      sourceLine: 'MSC 선박목록 · UN Comtrade(일본 신고) · 財務省 실행관세율표 · DART 감사보고서',
    },
  ],
};

const ITC_SPEC: CommoditySpec = {
  key: 'company-anatomy-itochu',
  title: '기업 해부: ITOCHU Corporation',
  subtitle: '일본 5대 상사 중 순이익 1위. 참치는 부(部)의 절반인데, 인증 선단 25척 중 11척이 사조그룹이다.',
  accent: ITC_ACCENT,
  primaryKpi: {
    label: '인증 선단 중 사조그룹',
    value: sajoVessels(),
    unit: `(척 · ${fleetTotal()}척 중)`,
    accent: ITC_ACCENT,
  },
  secondaryKpis: [
    { label: '사조 비중', value: sajoShare(), unit: '(%)', decimals: 1 },
    { label: '食料 세그먼트', value: itochuStats.식료_억엔, unit: '(억엔)' },
    { label: '生鮮食品 부문', value: itochuStats.생선식품_억엔, unit: '(억엔)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '접점',
      title: '인증 선단 중 사조그룹',
      body: `${sajoVessels()} / ${fleetTotal()} (척)`,
    },
    { eyebrow: '규모 상한', title: '生鮮食品 부문 순이익', body: `${itochuStats.생선식품_억엔} (억엔)` },
    { eyebrow: '부재', title: '수산 실적 공시', body: '0 (건)' },
  ],
  briefing: proseBriefing('itochu'),
  narratives: inlineReport('itochu', proseStages('itochu')),
  // 보고서 표·그림은 flow 가 원문 자리에 낸다. 여기는 손으로 고른 슬롯만 남는다.
  chartSlots: ITC_CHART_SLOTS,
  // 조사보고서는 절을 하나씩 넘기며 읽는 문서가 아니다. 문서 순서 그대로 이어서 낸다.
  continuous: true,
  sourceNotes: ITOCHU_SOURCE_NOTES,
  sourceMeta: [
    `${itochuMeta.회사} · ${itochuMeta.국가} · ${itochuMeta.업종}`,
    `출처 ${itochuMeta.출처}`,
    `갱신 ${itochuMeta.갱신방법}`,
  ].join(' · '),
};

/* ================= Bolton ================= */

const BOL_ACCENT = '#0b6b4f';

const nf = (n: number) => n.toLocaleString('ko-KR');

const BOL_CHART_SLOTS: Record<string, ChartSlot[]> = {
  c01: [
    {
      title: '법인 개요',
      caption: '비상장 가족기업이라 등기와 발표문이 1차 출처다. 연결재무제표는 공표되지 않는다.',
      telemetry: SYNC,
      render: () => <TuRows head={['항목', '내용']} rows={boltonProfile.map(([k, v]) => [k, v])} />,
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) · 이탈리아 등기 · Sustainability Report 2025',
    },
    {
      title: '카테고리 구성 (M€)',
      caption: '참치를 포함한 Food가 3분의 2다. 나머지 3분의 1이 원어 사이클 밖에 있다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['카테고리', '2024', '2025', '비중 (%)', '브랜드']}
          rows={boltonCategories.map((r) => [r.카테고리, nf(r.y2024), nf(r.y2025), r.비중.toFixed(1), r.브랜드])} />
      ),
      span: 'full',
      sourceLine: 'Sustainability Report 2025 - 순매출 기준',
    },
    {
      title: '앞의 회사들과의 좌표',
      caption: '통합 방향이 반대다. 브랜드에서 시작해 상류로 올라갔다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', 'Thai Union', 'FCF', 'ITOCHU', 'Bolton']}
          rows={boltonCompare.map((r) => [r.항목, r.thaiunion, r.fcf, r.itochu, r.bolton])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 6건 대조 (2026-08)',
    },
  ],
  c02: [
    {
      title: '연결 손익 (M€)',
      caption: '매출은 발표문, 이익은 등기 기탁분의 언론 인용이다. 2023년 이후 EBITDA는 확인되지 않는다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['연도', '연결 순매출', 'EBITDA', '순이익']}
          rows={boltonFinancials.map((r) => [
            r.연도, r.매출,
            r.ebitda === null ? '미확인' : r.ebitda.toFixed(1),
            r.순이익 === null ? '미확인' : r.순이익.toFixed(1),
          ])} />
      ),
      span: 'full',
      sourceLine: '회사 발표문 + 등기 기탁분 언론 인용 (B급)',
    },
  ],
  c03: [
    {
      title: '지역별 매출 비중 (%)',
      caption: '이탈리아가 6년 사이 39.5%에서 28.6%로 내려왔다. 그 자리를 남미와 기타 유럽이 채웠다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['지역', '2019', '2022', '2024', '2025']}
          rows={boltonRegions.map((r) => [
            r.지역,
            r.y2019 === null ? '-' : r.y2019.toFixed(1),
            r.y2022 === null ? '-' : r.y2022.toFixed(1),
            r.y2024.toFixed(1), r.y2025.toFixed(1),
          ])} />
      ),
      span: 'full',
      sourceLine: 'Sustainability Report 2019 · 2022 · 2024 · 2025',
    },
  ],
  c04: [
    {
      title: '자사 선단 - 등록부별',
      caption: '조달 선박명단 399척과 혼동하면 안 된다. 자사 보유는 이것뿐이고 ICCAT 3척은 전부 비활성이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['등록부', '척수', '상태', '내역']}
          rows={boltonOwnFleet.map((r) => [r.등록부, r.척수, r.상태, r.내역])} />
      ),
      span: 'full',
      sourceLine: 'IATTC · ICCAT 어선등록부 (2026-08 조회)',
    },
  ],
  c05: [
    {
      title: '조달량 시계열 (t)',
      caption: '2024년 +26% 안에 Tri Marine 트레이딩 증가 +144,000 t 이 섞여 있다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['연도', '조달량 (t)', '전년비 (%)']}
          rows={boltonSourcing.map((r) => [r.연도, nf(r.톤), r.전년비 === null ? '-' : r.전년비.toFixed(1)])} />
      ),
      sourceLine: 'Sustainability Report 2022~2025',
    },
    {
      title: '어종 구성 (t)',
      caption: '가다랑어가 79%에서 62%로 내려앉고 황다랑어가 두 배가 됐다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['어종', '2024', '2025', '비중 (%)', '증감 (%)']}
          rows={boltonSpecies.map((r) => [r.어종, nf(r.y2024), nf(r.y2025), r.비중.toFixed(1), r.증감])} />
      ),
      sourceLine: 'Sustainability Report 2025',
    },
    {
      title: '어법 구성 (t)',
      caption: '선망이 92%다. 나머지 셋을 합쳐도 8%에 못 미친다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['어법', '2024', '2025', '비중 (%)']}
          rows={boltonGear.map((r) => [r.어법, nf(r.y2024), nf(r.y2025), r.비중.toFixed(1)])} />
      ),
      span: 'full',
      sourceLine: 'Sustainability Report 2025',
    },
  ],
  c06: [
    {
      title: '공개 선박명단 속 한국 (척)',
      caption: '총 척수는 줄고 한국 비중은 올라갔다. 2024년에 신라교역 두 척이 돌아왔다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['명단 연도', '총 척수', '한국 국적선', '비중 (%)', '어법 구성']}
          rows={boltonVesselList.map((r) => [r.연도, r.총척수, r.한국선, r.비중.toFixed(1), r.구성])} />
      ),
      span: 'full',
      sourceLine: 'Bolton 공개 선박명단 2021~2024년판',
    },
    {
      title: '한국 지표',
      caption: '공시로는 잡히지 않고 명단과 품목대에서 잡힌다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', '값', '기준']} rows={boltonKorea.map((r) => [r.항목, r.값, r.기준])} />
      ),
      span: 'full',
      sourceLine: 'Bolton 공개 선박명단 · 조달 어업 목록 · UN Comtrade · DART',
    },
  ],
};

const BOL_SPEC: CommoditySpec = {
  key: 'company-anatomy-bolton',
  title: '기업 해부: Bolton Group',
  subtitle: 'Rio Mare를 가진 유럽 캔참치의 대표 브랜드군인데, 같은 그룹 안에 UHU 접착제와 세제가 있다. 참치 사이클 밖이 32.7%다.',
  accent: BOL_ACCENT,
  primaryKpi: {
    label: '2025년 순매출',
    value: boltonStats.매출_백만유로,
    unit: '(M€)',
    accent: BOL_ACCENT,
  },
  secondaryKpis: [
    { label: '참치 조달', value: boltonStats.조달_톤, unit: '(t)' },
    { label: '참치 사이클 밖', value: nonTunaShare(), unit: '(%)', decimals: 1 },
    { label: '브랜드', value: boltonStats.브랜드수, unit: '(개)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '접점',
      title: `명단 속 한국 국적선 (${latestVesselList().연도})`,
      body: `${latestVesselList().한국선} / ${latestVesselList().총척수} (척)`,
    },
    { eyebrow: '본체', title: '선망 비중', body: `${boltonStats.선망_비중.toFixed(0)} (%)` },
    { eyebrow: '자사 자산', title: '활성 등록 자사선', body: `${activeOwnVessels()} (척)` },
  ],
  briefing: proseBriefing('bolton'),
  narratives: inlineReport('bolton', proseStages('bolton')),
  // 보고서 표·그림은 flow 가 원문 자리에 낸다. 여기는 손으로 고른 슬롯만 남는다.
  chartSlots: BOL_CHART_SLOTS,
  // 조사보고서는 절을 하나씩 넘기며 읽는 문서가 아니다. 문서 순서 그대로 이어서 낸다.
  continuous: true,
  sourceNotes: BOLTON_SOURCE_NOTES,
  sourceMeta: [
    `${boltonMeta.회사} · ${boltonMeta.국가} · ${boltonMeta.업종}`,
    `출처 ${boltonMeta.출처}`,
    `갱신 ${boltonMeta.갱신방법}`,
  ].join(' · '),
};

/* ================= JAIS ================= */

const JAI_ACCENT = '#1b5e9c';

const eur = (n: number) => `€${n.toLocaleString('ko-KR')}`;

const JAI_CHART_SLOTS: Record<string, ChartSlot[]> = {
  c01: [
    {
      title: '법인 개요',
      caption: '동일성은 이름이 아니라 납세번호 위에 서 있다. 상호는 두 번 바뀌었다.',
      telemetry: SYNC,
      render: () => <TuRows head={['항목', '내용']} rows={jaisProfile.map(([k, v]) => [k, v])} />,
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) · 이탈리아 등기 · EU VAT · GLEIF',
    },
  ],
  c02: [
    {
      title: '7개년 재무 정본',
      caption: '매출은 두 배로 튀는데 순마진은 여섯 해가 ±0.35% 안이다. 2025년은 추정치다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['회계연도', '매출 (€)', '전년비 (%)', '순손익 (€)', '순마진 (%)', '종업원']}
          rows={jaisFinancials.map((r) => [
            r.연도, eur(r.매출),
            r.전년비 === null ? '-' : r.전년비.toFixed(1),
            eur(r.순손익), r.순마진.toFixed(2),
            r.종업원 === null ? '-' : r.종업원,
          ])} />
      ),
      span: 'full',
      sourceLine: '이탈리아 등기 기탁 재무제표 - 2025년은 「약」 표기 추정치',
    },
  ],
  c03: [
    {
      title: '네 명부가 따로 확인한 것',
      caption: '「가공 없는 순수 중개」는 한 출처의 주장이 아니라 네 갈래 원본이 독립적으로 말한 사실이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['근거', '표기', '뜻', '기준']}
          rows={jaisRegistries.map((r) => [r.근거, r.표기, r.뜻, r.기준])} />
      ),
      span: 'full',
      sourceLine: '이탈리아 보건부 · Friend of the Sea · MSC · 돌핀세이프',
    },
    {
      title: '명부에서 지워지는 과정 (등재행)',
      caption: '이 조사에서 가장 단단한 산출물이다. 같은 판에서 FCF는 34행 전부 유효였다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['명부 판', '등재행', '총 행수', '내역']}
          rows={jaisFos.map((r) => [r.판, r.등재행, r.총행수 === null ? '-' : nf(r.총행수), r.내역])} />
      ),
      span: 'full',
      sourceLine: 'Friend of the Sea 승인선박 명부 2018~2025년 판별',
    },
  ],
  c04: [
    {
      title: '두 축',
      caption: '2018~2020년, 대만 태평양 선단과 가나 대서양 선단이 한 판매권 아래 동시에 있었다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['축', '기간', '규모', '현재', '근거']}
          rows={jaisAxes.map((r) => [r.축, r.기간, r.규모, r.현재, r.근거])} />
      ),
      span: 'full',
      sourceLine: 'FoS 승인선박 명부 · 인증기관 기업 페이지 · ICCAT 어선등록부',
    },
    {
      title: '앞의 여섯 회사와 정반대 축',
      caption: '그 회사들은 무엇을 지배하는가로 설명됐다. 이 회사는 아무것도 소유하지 않는다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['축', '앞의 여섯 회사', 'JAIS']}
          rows={jaisCompare.map((r) => [r.항목, r.others, r.jais])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 7건 대조 (2026-08)',
    },
  ],
  c05: [
    {
      title: 'Panofi - 지분보다 채권이 크다',
      caption: '신라교역 지분은 45%에 장부가액 0인데, 수취채권과 담보가 실질 지배를 만든다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', '값', '기준']} rows={jaisPanofi.map((r) => [r.항목, r.값, r.기준])} />
      ),
      span: 'full',
      sourceLine: 'DART 감사보고서 FY2025 · ICCAT 어선등록부',
    },
  ],
  c06: [
    {
      title: '한국 지표',
      caption: '공시에는 0건인데 품목대에서는 한국이 이탈리아 수입 1위다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', '값', '기준']} rows={jaisKorea.map((r) => [r.항목, r.값, r.기준])} />
      ),
      span: 'full',
      sourceLine: 'UN Comtrade HS 0304.87 · 1604.14 · DART 전수',
    },
  ],
};

const FRA_ACCENT = '#0F3F7A';

const FRA_SPEC: CommoditySpec = {
  key: 'company-anatomy-frabelle',
  title: '기업 해부: Frabelle Group',
  subtitle: '캔을 만드는 회사가 아니다. 필리핀에서는 캐너리에 원어를 파는 쪽이고, 참치를 캔에 담는 공장은 파푸아뉴기니에 하나 있다.',
  accent: FRA_ACCENT,
  primaryKpi: {
    label: '등록부 확인 참치 선망선',
    value: frabelleStats.등록부_참치선망선,
    unit: '(척)',
    accent: FRA_ACCENT,
  },
  secondaryKpis: [
    { label: 'PNG Lae 가공 능력', value: frabelleStats.PNG_Lae_능력_MT일, unit: '(MT/일)' },
    { label: '필리핀 국내 참치 캐너리', value: frabelleStats.필리핀_국내_참치캐너리, unit: '(곳)' },
    { label: 'PNG Lae 현지 고용', value: frabelleStats.PNG_Lae_현지고용, unit: '(명)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '등록부',
      title: '선박 총계',
      body: `${registeredVessels()} (척 · 선망 13 + 운반 2 + 보조 2 + 용선 6)`,
    },
    { eyebrow: '실생산', title: 'PNG Lae', body: `${laeOutputRange()} (MT/일 · 능력 140)` },
    { eyebrow: '수출', title: 'EU 비중', body: `${frabelleStats.EU비중_2023} → ${frabelleStats.EU비중_2025} (%)` },
  ],
  briefing: proseBriefing('frabelle'),
  narratives: inlineReport('frabelle', proseStages('frabelle')),
  // 보고서 표·그림은 flow 가 원문 자리에 낸다. 여기는 손으로 고른 슬롯만 남는다.
  chartSlots: {},
  // 조사보고서는 절을 하나씩 넘기며 읽는 문서가 아니다. 문서 순서 그대로 이어서 낸다.
  continuous: true,
  sourceNotes: FRABELLE_SOURCE_NOTES,
  sourceMeta: [
    `${frabelleMeta.회사} · ${frabelleMeta.국가} · ${frabelleMeta.업종}`,
    `출처 ${frabelleMeta.출처}`,
    `갱신 ${frabelleMeta.갱신방법}`,
  ].join(' · '),
};

/** 갈리시아 로히괄다의 붉은 밴드에서 따온다. 앞선 두 스페인 편과 겹치지 않는 채도를 쓴다. */
const JEA_ACCENT = '#9d1017';

const JEA_SPEC: CommoditySpec = {
  key: 'company-anatomy-jealsa',
  title: '기업 해부: Jealsa',
  subtitle: '스페인 최대 통조림 그룹이다. 이익을 만든 것이 통조림이 아니었던 해가 있고, 창업 가문의 자산지주는 경쟁 그룹 Albacora의 부회장석에 앉아 있다.',
  accent: JEA_ACCENT,
  primaryKpi: {
    label: '2025년 연결매출',
    value: jealsaStats.연결매출_2025,
    unit: '(M€)',
    accent: JEA_ACCENT,
  },
  secondaryKpis: [
    { label: 'Mercadona 향 매출', value: jealsaStats.mercadona_매출, unit: '(M€)' },
    { label: '계열 법인 중 에너지', value: jealsaStats.에너지_법인수, unit: `(/${jealsaStats.계열_법인수}개사)` },
    { label: 'ICCAT 활성 과테말라 기국', value: jealsaStats.iccat_활성_과테말라, unit: '(척)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '단일 고객',
      title: 'Mercadona 비중',
      body: `${mercadonaShare()} (% · ${jealsaStats.mercadona_매출} / ${jealsaStats.연결매출_2025} M€)`,
    },
    {
      eyebrow: '정점',
      title: `${jealsaStats.정점연도}년 연결매출`,
      body: `${jealsaStats.연결매출_정점} (M€ · 2025년에 되찾았다)`,
    },
    {
      eyebrow: '조달',
      title: 'MSC 인증 어장',
      body: `${jealsaStats.msc_인증어장_비중} (% · 자사 단독 인증서는 2022년 철회)`,
    },
  ],
  briefing: proseBriefing('jealsa'),
  narratives: inlineReport('jealsa', proseStages('jealsa')),
  // 보고서 표·그림은 flow 가 원문 자리에 낸다. 여기는 손으로 고른 슬롯만 남는다.
  chartSlots: {},
  // 조사보고서는 절을 하나씩 넘기며 읽는 문서가 아니다. 문서 순서 그대로 이어서 낸다.
  continuous: true,
  sourceNotes: jealsaSourceNotes,
  sourceMeta: [
    `${jealsaMeta.회사} · ${jealsaMeta.국가} · ${jealsaMeta.업종}`,
    `출처 ${jealsaMeta.출처}`,
    `갱신 ${jealsaMeta.갱신방법}`,
  ].join(' · '),
};

/** 대서양 황혼의 선체 — 앞선 두 스페인 편(로히괄다 붉은 밴드·짙은 남색)과 겹치지 않는 청록으로 잡는다. */
const NAU_ACCENT = '#12414c';

const NAU_SPEC: CommoditySpec = {
  key: 'company-anatomy-nauterra',
  title: '기업 해부: Nauterra',
  subtitle: '배 여덟 척과 공장 셋을 가진 갈리시아 통조림 그룹인데, 상업등기부에도 어선등록부 소유자 칸에도 이 이름이 없다. 또렷이 남는 자리는 이탈리아 경쟁사가 쥔 40%다.',
  accent: NAU_ACCENT,
  primaryKpi: {
    label: '2025년 그룹 매출',
    value: nauterraStats.매출_2025,
    unit: '(M€)',
    accent: NAU_ACCENT,
  },
  secondaryKpis: [
    { decimals: 2, label: 'Bolton 지분', value: nauterraStats.bolton_지분, unit: `(% · 이사회 ${nauterraStats.이사회_bolton}/${nauterraStats.이사회_정원}석)` },
    { label: '엘살바도르 기 선박', value: nauterraStats.선단_엘살바도르기, unit: `(/${nauterraStats.선단}척)` },
    { label: '브라질 가공 캐파', value: nauterraStats.캐파_브라질, unit: '(t · 스페인 56.000)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '등록부',
      title: '상업등기부의 「Nauterra」',
      body: `0 (건 · 대조군 「nombramiento」 ${nauterraStats.borme_대조군.toLocaleString('ko-KR')}건)`,
    },
    {
      eyebrow: '선단',
      title: '스페인 국적선이 아닌 배',
      body: `${nonSpanishFlagShare()} (% · 등록 소유자는 현지 특수법인)`,
    },
    {
      eyebrow: '공적자금',
      title: '선단 법인이 받은 몫',
      body: `${fleetEntitySubsidyShare()} (% · Jealsa의 1/${subsidyGapVs('Jealsa')})`,
    },
  ],
  briefing: proseBriefing('nauterra'),
  narratives: inlineReport('nauterra', proseStages('nauterra')),
  chartSlots: {},
  continuous: true,
  sourceNotes: nauterraSourceNotes,
  sourceMeta: [
    `${nauterraMeta.회사} · ${nauterraMeta.국가} · ${nauterraMeta.업종}`,
    `출처 ${nauterraMeta.출처}`,
    `갱신 ${nauterraMeta.갱신방법}`,
  ].join(' · '),
};

/** 파고파고 만의 청회색 — 앞선 남색 셋(Thai Union·JAIS·Frabelle)보다 어둡고 채도가 낮다. */
const SK_ACCENT = '#16324f';
/** 전략 절의 축 수. 인테이크가 정본이라 로더에서 읽는다. */
const starkistStrategyAxes = 5;

const SK_SPEC: CommoditySpec = {
  key: 'company-anatomy-starkist',
  title: '기업 해부: StarKist',
  subtitle: '미국 캔참치 1위 브랜드이고 한국 상장사의 100% 자회사다. 2018년 가격담합으로 형사 유죄를 인정하고 법정 상한 1억 달러를 선고받았는데, 그 사건의 충당금·확정액·분할상환 일정을 연도별로 적은 문서는 미국 증권신고서가 아니라 서울에 제출된 정기공시다.',
  accent: SK_ACCENT,
  primaryKpi: {
    label: '회사가 공시한 법정 상한',
    value: starkistStats.법정상한_공시_usd_m,
    unit: '(US$ 백만 · 쌓은 충당은 그 절반)',
    accent: SK_ACCENT,
  },
  secondaryKpis: [
    { label: '미국 규제·소송 청구서', value: totalClaimsUsdM(), unit: '(US$ 백만 · 기간 합산)' },
    { label: '전수검색한 정기공시', value: starkistStats.전수검색_합, unit: `(건 · 자사 명의 선박 ${starkistStats.선단}척)` },
    { label: '자체브랜드 대비 프리미엄', value: pbPremiumMultiple('Chunk Light'), unit: '(배 · 월마트 5 oz 물캔 · 물뺀 기준)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '충당',
      title: '상한 대비 회사가 쌓은 금액',
      body: `${provisionVsCapPct()} (% · 그 절반이 이듬해 법정에서 요청한 액수와 같다)`,
    },
    {
      eyebrow: '통화',
      title: '3년 매출, 원화와 달러',
      body: `${revenueTrendPct('krw') > 0 ? '+' : ''}${revenueTrendPct('krw')} / ${revenueTrendPct('usd')} (% · 방향이 반대다)`,
    },
    {
      eyebrow: '제품',
      title: '파우치 매출 비중 변화',
      body: `${pouchShareChangePct()} (%p · 성장 축이라 말하는 품목이 줄었다)`,
    },
    {
      eyebrow: '전략',
      title: '말과 돈이 어긋나는 축',
      body: `${strategyGapCount()} (/${starkistStrategyAxes} 개)`,
    },
  ],
  briefing: proseBriefing('starkist'),
  narratives: inlineReport('starkist', proseStages('starkist')),
  chartSlots: {},
  continuous: true,
  sourceNotes: starkistSourceNotes,
  sourceMeta: [
    `${starkistMeta.회사} · ${starkistMeta.국가} · ${starkistMeta.업종}`,
    `출처 ${starkistMeta.출처}`,
    `갱신 ${starkistMeta.갱신방법}`,
  ].join(' · '),
};

const DW_ACCENT = '#1b3a5c';

const DW_SPEC: CommoditySpec = {
  key: 'company-anatomy-dongwon',
  title: '기업 해부: 동원산업',
  subtitle:
    '한국 원양 수출의 38.30%를 가진 1위 선사이고 선망 19척으로 한 해 약 20만 톤을 잡는다. ' +
    '그런데 사업보고서 본문은 스스로를 지주회사라 적고, 연결 외부수익에서 어획이 차지하는 몫은 3.54%다. ' +
    '다섯 개 보고부문 어느 이름에도 「참치」가 없다 — 어획과 가공유통으로 갈라 놓았기 때문이다.',
  accent: DW_ACCENT,
  primaryKpi: {
    label: '연결 외부수익에서 어획이 차지하는 몫',
    value: catchSharePct(),
    decimals: 2,
    unit: '(% · 339,590백만원 · 참치캔은 이 분자에 없다)',
    accent: DW_ACCENT,
  },
  secondaryKpis: [
    { label: '원양 수출실적 점유', value: dongwonStats.원양수출_점유, decimals: 2, unit: `(% · 2024년 · 2위와 ${exportLeadGapPct()}%p 차)` },
    { label: '운영 선단', value: dongwonStats.선단_척, unit: `(척 · 선망 ${dongwonStats.선망_척}척 · 연간 약 20만 톤)` },
    { label: 'StarKist 앞 연대보증', value: Math.round(dongwonStats.StarKist_보증_USD / 1e6), unit: `(US$ 백만 · 달러 보증의 ${starkistGuaranteeSharePct()}%)` },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '분모',
      title: '같은 회사, 다른 표',
      body: `${catchSharePct()} / ${dongwonStats.원양수출_점유} (% · 연결 어획 비중과 업계 수출 점유)`,
    },
    {
      eyebrow: '자본',
      title: '조 단위 자회사를 삼킨 값',
      body: '2,246 (억원 · 전부 신주 · 현금 유출입이 없는 거래)',
    },
    {
      eyebrow: '전략',
      title: '말만 있고 돈이 안 간 축',
      body: `${strategyGapAxes()} (/${dongwonStrategyAxes} 개)`,
    },
    {
      eyebrow: '업계',
      title: '경쟁사가 참치 밖에 쓴 돈',
      body: `${peerNonTunaBillionKrw().toLocaleString('ko-KR')} (억원 · 2024~2026)`,
    },
  ],
  briefing: proseBriefing('dongwon'),
  narratives: inlineReport('dongwon', proseStages('dongwon')),
  chartSlots: {},
  continuous: true,
  sourceNotes: dongwonSourceNotes,
  sourceMeta: [
    `${dongwonMeta.회사} · ${dongwonMeta.국가} · ${dongwonMeta.업종}`,
    `출처 ${dongwonMeta.출처}`,
    `조사 ${dongwonMeta.조사일}`,
  ].join(' · '),
};

const SJ_ACCENT = '#14494a';

const SJ_SPEC: CommoditySpec = {
  key: 'company-anatomy-sajo',
  title: '기업 해부: 사조그룹',
  subtitle:
    '계열 42사, 상장 6사, 참치를 잡는 법인이 셋이다. 맨 위는 비상장 ㈜사조시스템즈이고 사조산업 지분 29.94%를 단독으로 쥔다. ' +
    '사조산업 연결 일곱 부문 가운데 적자는 수산사업 하나이고 골프장이 그보다 번다. ' +
    '2024년부터 참치 밖 회사 일곱을 사서 자산이 1.4조 늘어 공시대상기업집단으로 지정됐고, 2026년 7월 그 계열 둘이 담합으로 3,832억을 물게 됐다.',
  accent: SJ_ACCENT,
  primaryKpi: {
    label: '일곱 부문 가운데 영업손실을 낸 부문',
    value: lossMakingSegments(),
    unit: `(개 · 수산사업 12,666,285천원 손실 · 나머지 ${segmentsBeatingLossMaker()}개는 흑자)`,
    accent: SJ_ACCENT,
  },
  secondaryKpis: [
    { label: '원양 수출실적 점유 (사조 3사 합)', value: sajoExportSharePct(), decimals: 2, unit: '(% · 2024년 · 씨푸드 9.83 + 산업 8.88 + 오양 1.16)' },
    { label: '㈜사조시스템즈 단독 지분', value: sajoStats.사조시스템즈_지분, decimals: 2, unit: `(% · 비상장 · 특수관계인 합산은 ${sajoStats.특수관계인_지분}%)` },
    { label: '2026-07 두 담합 과징금 합', value: cartelFineBillionKrw(), unit: `(억원 · 밀가루 1,830.97 + 전분당 2,001.32)` },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '부문',
      title: '적자는 수산사업 하나',
      body: `${lossMakingSegments()} / ${sajoStats.부문_수} (개 · 골프장 54.9억이 그보다 번다)`,
    },
    {
      eyebrow: '담합',
      title: '밀가루 7사에서 사조동아원의 몫',
      body: `${millFineSharePct()} (% · 671,045백만원 중 183,097 — 최대)`,
    },
    {
      eyebrow: '규모',
      title: '취득가와 과징금의 차',
      body: `${fineVsPurchaseGapBillionKrw()} (억원 · 우연이고 인과가 아니다)`,
    },
    {
      eyebrow: '전략',
      title: '말과 돈이 어긋난 축',
      body: `${strategyGapAxesSajo()} (/${sajoStrategyAxes} 개)`,
    },
  ],
  briefing: proseBriefing('sajo'),
  narratives: inlineReport('sajo', proseStages('sajo')),
  chartSlots: {},
  continuous: true,
  sourceNotes: sajoSourceNotes,
  sourceMeta: [
    `${sajoMeta.회사} · ${sajoMeta.국가} · ${sajoMeta.업종}`,
    `출처 ${sajoMeta.출처}`,
    `조사 ${sajoMeta.조사일}`,
  ].join(' · '),
};

const BB_ACCENT = '#1f3a54';

const BB_SPEC: CommoditySpec = {
  key: 'company-anatomy-bumblebee',
  title: '기업 해부: Bumble Bee',
  subtitle:
    '배가 한 척도 없이 미국 알바코어 캔의 41%를 판다. 2019년 11월 다섯 법인이 함께 챕터11을 냈고 두 달 뒤 유일한 원료 공급자가 회사를 샀다. ' +
    '9억 2,560만 달러 거래에서 현금은 2억 7,500만이었고 나머지는 채권을 갈아타거나 채무를 떠안은 것이다. ' +
    '재건계획은 끝내 만들어지지 못했고 남은 껍데기 세 곳의 도켓 표제는 지금 Old BBP·Old BBH·Old BBF다.',
  accent: BB_ACCENT,
  primaryKpi: {
    label: '총 기업가치에서 현금이 차지한 몫',
    value: cashSharePct(),
    decimals: 2,
    unit: '(% · 925,600,000 중 275,000,000 · 나머지는 굴리거나 떠안았다)',
    accent: BB_ACCENT,
  },
  secondaryKpis: [
    { label: '미국 알바코어 캔 점유', value: bumblebeeStats.알바코어_점유, unit: `(% · 즉석 참치식사는 ${bumblebeeStats.즉석식사_점유}%)` },
    { label: '선박명부 등재', value: bumblebeeStats.선박_등재, unit: '(척 · 감사가 항목 7.1을 N/A로 적는다)' },
    { label: '파산 신청일 형사벌금 잔액', value: Math.round(outstandingFine() / 1e6), unit: `(US$ 백만 · 벌금 ${Math.round(bumblebeeStats.벌금 / 1e6)}백만 중 매수인이 승계)` },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '대금',
      title: '현금은 3할이 안 된다',
      body: `${cashSharePct()} (% · 275,000,000 / 925,600,000)`,
    },
    {
      eyebrow: '조달',
      title: '알바코어를 한 곳에서만 산다',
      body: `${bumblebeeStats.알바코어_공급_하한}~100 (% · 2010년 이후 · 라이트미트는 ${bumblebeeStats.라이트미트_공급_하한}~100%)`,
    },
    {
      eyebrow: '절차',
      title: '접촉 대비 최종 응찰',
      body: `${bidFunnel().접촉} → ${bidFunnel().최종} (곳 · 경쟁 절차는 있었다)`,
    },
    {
      eyebrow: '매대',
      title: '알바코어가 라이트미트의',
      body: `${albacoreMultiple()} (배 · 같은 브랜드 같은 5 oz 캔)`,
    },
  ],
  briefing: proseBriefing('bumblebee'),
  narratives: inlineReport('bumblebee', proseStages('bumblebee')),
  chartSlots: {},
  continuous: true,
  sourceNotes: bumblebeeSourceNotes,
  sourceMeta: [
    `${bumblebeeMeta.회사} · ${bumblebeeMeta.국가} · ${bumblebeeMeta.업종}`,
    `출처 ${bumblebeeMeta.출처}`,
    `조사 ${bumblebeeMeta.조사일}`,
  ].join(' · '),
};

const JAI_SPEC: CommoditySpec = {
  key: 'company-anatomy-jais',
  title: '기업 해부: JAIS S.R.L.',
  subtitle: '공장도 배도 승인시설도 자회사도 없다. 여덟 명이 연 €3,400만~€5,200만어치 참치를 넘기며 ±0.3%를 남겨 온 60년 된 중개상이다.',
  accent: JAI_ACCENT,
  primaryKpi: {
    label: '2024년 매출',
    value: jaisStats.매출_만유로,
    unit: '(만 €)',
    accent: JAI_ACCENT,
  },
  secondaryKpis: [
    { label: '종업원', value: jaisStats.종업원, unit: '(명)' },
    { label: '총자산', value: jaisStats.총자산_만유로, unit: '(만 €)' },
    { label: '공장 · 선박 · 자회사', value: ownedAssets(), unit: '(개)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '지워진 자리',
      title: 'FoS 명부 등재행',
      body: `${jaisStats.fos_최대} → ${jaisStats.fos_현재} (행)`,
    },
    { eyebrow: '구조', title: '순마진 최대 진폭', body: `${marginBand().toFixed(2)} (%)` },
    { eyebrow: '지금', title: '연속 적자', body: `${lossStreak()} (년)` },
  ],
  briefing: proseBriefing('jais'),
  narratives: inlineReport('jais', proseStages('jais')),
  // 보고서 표·그림은 flow 가 원문 자리에 낸다. 여기는 손으로 고른 슬롯만 남는다.
  chartSlots: JAI_CHART_SLOTS,
  // 조사보고서는 절을 하나씩 넘기며 읽는 문서가 아니다. 문서 순서 그대로 이어서 낸다.
  continuous: true,
  sourceNotes: JAIS_SOURCE_NOTES,
  sourceMeta: [
    `${jaisMeta.회사} · ${jaisMeta.국가} · ${jaisMeta.업종}`,
    `출처 ${jaisMeta.출처}`,
    `갱신 ${jaisMeta.갱신방법}`,
  ].join(' · '),
};

/** 나라별 원본 SVG를 공유한다. 출처와 고정 버전은 public/flags/README.md 참조. */
const FLAG: Record<string, Pick<CompanyCard, 'flagSrc' | 'backInk'>> = {
  스페인: { flagSrc: '/flags/es.svg', backInk: '#4a2f00' },
  태국: { flagSrc: '/flags/th.svg', backInk: '#f4f5f0' },
  대만: { flagSrc: '/flags/tw.svg', backInk: '#f4f5f0' },
  일본: { flagSrc: '/flags/jp.svg', backInk: '#1b2733' },
  필리핀: { flagSrc: '/flags/ph.svg', backInk: '#f4f5f0' },
  미국: { flagSrc: '/flags/us.svg', backInk: '#1b2733' },
  한국: { flagSrc: '/flags/kr.svg', backInk: '#1b2733' },
  이탈리아: { flagSrc: '/flags/it.svg', backInk: '#f4f5f0' },
  싱가포르: { flagSrc: '/flags/sg.svg', backInk: '#1b2733' },
  영국: { flagSrc: '/flags/gb.svg', backInk: '#f4f5f0' },
  세이셸: { flagSrc: '/flags/sc.svg', backInk: '#f4f5f0' },
  인도네시아: { flagSrc: '/flags/id.svg', backInk: '#1b2733' },
  에콰도르: { flagSrc: '/flags/ec.svg', backInk: '#1b2733' },
};

/** 선택 갤러리 카드 목록. 회사가 늘면 여기에 한 장씩 추가한다. */
const UM_ACCENT = '#1d4e5f';

const UM_SPEC: CommoditySpec = {
  key: 'company-anatomy-umios',
  title: '기업 해부: Umios',
  subtitle:
    '2026년 3월 1일 マルハニチロ가 Umios가 됐고 종목코드 1333은 그대로다. 국내 양식 참다랑어 18,687톤 가운데 4,300톤이 이 회사 것이다. ' +
    '그 4,300톤에서 알에서부터 기른 것은 175톤, 약 4%다. 전국으로 넓히면 인공종묘에서 나온 참치가 2020년 2,975톤에서 2024년 405톤으로 86.4% 줄었다. ' +
    '보고부문 셋 어디에도 「まぐろ」가 없어 참치 비중은 공시로 낼 수 없다.',
  accent: UM_ACCENT,
  primaryKpi: {
    label: '전국 인공종묘 유래 출하의 정점 대비 변화',
    value: nationalSeedCollapsePct(),
    decimals: 1,
    unit: `(% · 2020년 ${umiosStats.전국_인공종묘_정점_톤.toLocaleString('ko-KR')}톤 → 2024년 ${umiosStats.전국_인공종묘_2024_톤}톤)`,
    accent: UM_ACCENT,
  },
  secondaryKpis: [
    { label: '전국 양식 참다랑어에서 이 회사 몫', value: umiosStats.회사_점유, decimals: 1, unit: '(% · 4,300 / 18,687톤 · 生産 대 出荷로 기준이 다르다)' },
    { label: '회사 양식 중 알에서 기른 몫', value: Math.round(fullCycleSharePct()), decimals: 0, unit: `(% · 약 4% · ${umiosStats.완전양식_톤}톤 出荷 / ${umiosStats.양식_참다랑어_톤.toLocaleString('ko-KR')}톤 生産 · 기준이 달라 소수점은 쓰지 않는다)` },
    { label: '무너진 405톤에서 이 회사 몫', value: Math.round(umiosSeedShareOfNational()), decimals: 0, unit: '(% · 약 43% · 분자는 완전양식, 분모는 인공종묘 유래다)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '부문',
      title: '보고부문 셋에 참치가 없다',
      body: `${umiosStats.부문에_참치_있는_수} / ${umiosStats.보고부문_수} (개 · 어획·양식·유통·가공 넷에 걸쳐 있다)`,
    },
    {
      eyebrow: '선단',
      title: '모회사 이름으로 명부를 뒤지면',
      body: `${umiosStats.모회사명의_RFMO_등재} (척 · RFMO 네 곳 · 자회사 명의로는 걸린다)`,
    },
    {
      eyebrow: '규제',
      title: '표시 규범을 논하는 회사가 받은 표시 지시',
      body: `${umiosStats.표시처분_팩.toLocaleString('ko-KR')} (팩 · 2024-03-26 농림수산성 · 본체 대상)`,
    },
    {
      eyebrow: '매대',
      title: '같은 브랜드 안 어종 프리미엄',
      body: `${umiosStats.매대_어종_프리미엄} (% · まぐろ 127.44엔 대 かつお 116.64엔)`,
    },
  ],
  briefing: proseBriefing('umios'),
  narratives: inlineReport('umios', proseStages('umios')),
  chartSlots: {},
  continuous: true,
  sourceNotes: umiosSourceNotes,
  sourceMeta: [
    `${umiosMeta.회사} · ${umiosMeta.국가} · ${umiosMeta.업종}`,
    `출처 ${umiosMeta.출처}`,
    `조사 ${umiosMeta.조사일}`,
  ].join(' · '),
};

const KY_ACCENT = '#2b4a3f';

const KY_SPEC: CommoditySpec = {
  key: 'company-anatomy-kyokuyo',
  title: '기업 해부: 極洋',
  subtitle:
    '2023년 3월기까지 이 회사 보고부문 하나의 이름은 「鰹・鮪」였다. 그 부문은 매출의 14.41%로 세그먼트이익의 57.17%를 냈고, 나머지 네 부문을 합쳐도 그 하나에 못 미쳤다. ' +
    '제101기에 관리구분을 바꾸며 生鮮事業으로 흡수했고, 회사가 전기를 신 구분으로 재작성해 공표한 덕분에 같은 해를 두 구분으로 견줄 수 있다 — 이익 몫은 57%에서 58%로 그대로인데 매출 몫만 14%에서 27%로 뛴다. ' +
    '이름이 사라진 첫 해 그 자리의 이익 몫은 23.53%로 떨어졌고 회사의 이익 중심은 水産事業으로 넘어갔다.',
  accent: KY_ACCENT,
  primaryKpi: {
    label: '구 「鰹・鮪」가 세그먼트이익에서 차지한 몫',
    value: kyokuyoStats.구부문_이익몫,
    decimals: 2,
    unit: `(% · 5,325 / 9,315 · 매출 몫은 ${kyokuyoStats.구부문_매출몫}%였다)`,
    accent: KY_ACCENT,
  },
  secondaryKpis: [
    { label: '이익 몫 ÷ 매출 몫', value: oldSegmentLeverage(), decimals: 2, unit: '(배 · 현행 구분으로 같은 해를 읽으면 2.18배다)' },
    { label: '이름이 사라진 첫 해 이익 몫', value: kyokuyoStats.FY2024_이익몫, decimals: 2, unit: `(% · 매출 몫 ${kyokuyoStats.FY2024_매출몫}%보다 낮았던 유일한 해)` },
    { label: '生鮮 이익 정점 대비 저점', value: freshProfitTrough(), decimals: 1, unit: '(% · 5,406 → 2,485백만엔 · 이후 3,856으로 회복)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '부문',
      title: '나머지 넷을 합쳐도 못 미쳤다',
      body: `3,988 대 ${kyokuyoStats.구부문_이익_백만엔.toLocaleString('ko-KR')} (백만엔 · 제100기 세그먼트이익)`,
    },
    {
      eyebrow: '선단',
      title: '모회사 이름으로 등록부를 뒤지면',
      body: `${kyokuyoStats.RFMO_모회사명의} (척 · 선망 ${kyokuyoStats.선망_척}척은 전부 자회사 極洋水産 명의)`,
    },
    {
      eyebrow: '양식',
      title: '참다랑어 완전양식 합작이 해산했다',
      body: `${kyokuyoStats.합작_대손_백만엔.toLocaleString('ko-KR')} (백만엔 대손 · 2024-03-31)`,
    },
    {
      eyebrow: '어구',
      title: '有報 다섯 연차에서 「延縄」이 나온 횟수',
      body: `${kyokuyoStats.연승_언급_횟수} (회 · 1973년 이래 선망이다)`,
    },
  ],
  briefing: proseBriefing('kyokuyo'),
  narratives: inlineReport('kyokuyo', proseStages('kyokuyo')),
  chartSlots: {},
  continuous: true,
  sourceNotes: kyokuyoSourceNotes,
  sourceMeta: [
    `${kyokuyoMeta.회사} · ${kyokuyoMeta.국가} · ${kyokuyoMeta.업종}`,
    `출처 ${kyokuyoMeta.출처}`,
    `조사 ${kyokuyoMeta.조사일}`,
  ].join(' · '),
};

const SV_ACCENT = '#6b4a2f';

const SV_SPEC: CommoditySpec = {
  key: 'company-anatomy-seavalue',
  title: '기업 해부: Sea Value',
  subtitle:
    '1989년 9월 태국 Unicord가 미국 Bumble Bee를 2억 6,900만 달러에 샀다. 그 뒤 미국 자회사는 1997년, 태국 Unicord는 2000년에 무너졌고 2005년 Sea Value가 지분 98.51%를 인수했다. ' +
    '지금 방향은 반대다 — 캔을 미국으로 보내는 계열 I.S.A. Value의 최대 거래상대가 StarKist이고 그것은 동원산업의 미국 자회사다. Bumble Bee는 한때 이 그룹의 지분 10%를 가졌다. ' +
    '비상장이지만 계열 Unicord가 공개회사라 재무제표가 열린다 — 2022년 매출 253억 바트, 순이익 13.6억 바트.',
  accent: SV_ACCENT,
  primaryKpi: {
    label: '1989년 Bumble Bee 인수 대가',
    value: seavalueStats.인수대가_백만USD,
    unit: '(US$ 백만 · 미국 국제무역위원회 조사보고서 2-16쪽 · 매수 주체는 Uni Group Inc.)',
    accent: SV_ACCENT,
  },
  secondaryKpis: [
    { label: '2005년 Sea Value의 Unicord 인수 지분', value: seavalueStats.인수지분, decimals: 2, unit: '(% · 1,477,631,210 / 1,500,000,000주)' },
    { label: '자체 브랜드 라이브 SKU 중 참치', value: ownBrandTunaShare(), decimals: 1, unit: `(% · ${seavalueStats.자체브랜드_참치_행} / ${seavalueStats.자체브랜드_총행}행 · 나머지는 사르딘·고등어)` },
    { label: '한국 가다랑어 태국행 — 분모를 바꾸면', value: denominatorGap(), decimals: 1, unit: '(%p 하락 · 수출 중 59.67% → 어획 중 40.5%)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '판로',
      title: 'I.S.A. Value의 최대 거래상대',
      body: `StarKist · 누적 ${(seavalueStats.starkist_누적_kg / 1e6).toFixed(1)}백만 kg (동원산업의 미국 자회사)`,
    },
    {
      eyebrow: '매대',
      title: '제조사를 이 이름으로 찍은 소매 페이지',
      body: `${seavalueStats.제조사표기_소매페이지} (건 · 전 세계 · 그것도 품절)`,
    },
    {
      eyebrow: '물류',
      title: '캐나다 두 건이 Bumble Bee 컨테이너의',
      body: `${canadaVsBumbleBee()} (배 · 198,444 kg 대 15,111 kg)`,
    },
    {
      eyebrow: '브랜드',
      title: '자기 캔에 붙는 남의 브랜드',
      body: `${seavalueStats.브랜드_수}+ (개 · 회사가 스스로 적는다)`,
    },
  ],
  briefing: proseBriefing('seavalue'),
  narratives: inlineReport('seavalue', proseStages('seavalue')),
  chartSlots: {},
  continuous: true,
  sourceNotes: seavalueSourceNotes,
  sourceMeta: [
    `${seavalueMeta.회사} · ${seavalueMeta.국가} · ${seavalueMeta.업종}`,
    `출처 ${seavalueMeta.출처}`,
    `조사 ${seavalueMeta.조사일}`,
  ].join(' · '),
};

const NS_ACCENT = '#1c3f5c';

const NS_SPEC: CommoditySpec = {
  key: 'company-anatomy-nissui',
  title: '기업 해부: ニッスイ',
  subtitle:
    '앞 편에서 極洋은 보고부문 이름 「鰹・鮪」를 지웠다. 이 회사는 반대로 2024년에 국내 양식 참치를 새 회사로 묶고 그 상호에 참치를 박았다 — ㈱ニッスイまぐろ. ' +
    '그 회사가 온전히 한 해를 돈 첫 회계연도에 水産事業 영업이익이 8,418에서 17,770백만엔으로 두 배가 됐고, 그 한 부문의 증가분(9,352)이 연결 영업이익 증가분(8,651)보다 크다. ' +
    '그런데 제111기 유가증권보고서 208쪽에서 그 회사 이름은 연혁 두 건에만 나오고 관계회사 표에는 행이 없다.',
  accent: NS_ACCENT,
  primaryKpi: {
    label: '水産事業 영업이익 증가분',
    value: nissuiStats.수산증가분,
    unit: `(백만엔 · 8,418 → 17,770 · 연결 증가분 ${nissuiStats.연결증가분.toLocaleString('ko-KR')}보다 크다)`,
    accent: NS_ACCENT,
  },
  secondaryKpis: [
    { label: '부문 증가분 ÷ 연결 증가분', value: nissuiStats.증가분_비율, decimals: 1, unit: '(% · 연결 기준일 때만 100%를 넘는다 · 4부문 계로는 95.5%)' },
    { label: '남미에서 감선한 배의 감손', value: nissuiStats.감손_백만엔, unit: `(백만엔 · 遊休資産·칠레·船舶 · 水産 증가분의 ${nissuiStats.감손_대_수산증가분}% · 特別損失이라 부문 이익 아래)` },
    { label: '物流 이익률이 분모를 바꾸면', value: logisticsMarginGap(), decimals: 2, unit: '(%p 하락 · 14.50% → 7.82% · 내부매출이 총매출의 46.11%)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '이름',
      title: '상호에 박았는데 명부에는 없다',
      body: `${nissuiStats.연결자회사_수}개 연결자회사 · ㈱ニッスイまぐろ는 「その他48社」에 들어 있다`,
    },
    {
      eyebrow: '참치',
      title: '회사가 가른 최소 칸',
      body: `${nissuiStats.참치버킷_억엔}억엔 (그 안 네 요인 중 하나가 참치 · 수산 증익의 46%는 북미·남미)`,
    },
    {
      eyebrow: '선단',
      title: '有報는 말하지 않고 등록부가 말한다',
      body: `${nissuiStats.참치선망_척} (척 · 第七十八·第八十八光洋丸 · MSC-F-31618)`,
    },
    {
      eyebrow: '매대',
      title: '자기 이름으로 파는 참치 캔',
      body: `${nissuiStats.자사_참치캔_SKU} (종 · 브랜드명 光洋丸은 그 선망선 이름이다)`,
    },
  ],
  briefing: proseBriefing('nissui'),
  narratives: inlineReport('nissui', proseStages('nissui')),
  chartSlots: {},
  continuous: true,
  sourceNotes: nissuiSourceNotes,
  sourceMeta: [
    `${nissuiMeta.회사} · ${nissuiMeta.국가} · ${nissuiMeta.업종}`,
    `출처 ${nissuiMeta.출처}`,
    `조사 ${nissuiMeta.조사일}`,
  ].join(' · '),
};

const CP_ACCENT = '#0b6b4f';

const CP_SPEC: CommoditySpec = {
  key: 'company-anatomy-centurypacific',
  title: '기업 해부: Century Pacific Food',
  subtitle:
    '캔참치 회사로 알려져 있으나 수산 부문은 2025년 매출의 40.28%이고 그 부문마저 참치와 정어리를 함께 담는다. ' +
    '중서부태평양 선박등록부에 이 회사군 명의 어선은 0척인데, 국제기구 공시는 같은 해 참치 매입의 59%를 선박 직구매로 적는다 — 소유하지 않고 직접 산다. ' +
    '같은 기간 한국이 이 나라에 파는 냉동 가다랑어의 몫은 9.70%에서 1.62%로 3년 만에 6분의 1이 됐다.',
  accent: CP_ACCENT,
  primaryKpi: {
    label: '수산 부문 외부매출',
    value: centurypacificStats.수산부문_외부매출_2025,
    unit: `(₱ · 연결 매출의 ${marineSharePct()}% · 참치와 정어리를 함께 담는 부문이다)`,
    accent: CP_ACCENT,
  },
  secondaryKpis: [
    { label: '참치 매입 중 선박 직구매', value: centurypacificStats.선박직구매_퍼센트, decimals: 0, unit: '(% · 등록부의 자사 어선은 0척 · 분모는 참치 환산 원어 톤)' },
    { label: '상반기 지출 중 공급자 선수금', value: advanceSharePct(), decimals: 1, unit: '(% · 절반이 아직 자산이 아니다 · 계획 대비 속도는 91.85%)' },
    { label: '한국 몫이 줄어든 배수', value: koreaShareShrinkFactor(), decimals: 1, unit: '(배 · 9.70% → 1.62% · 분모는 한국의 전세계 수출 중량)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '부문',
      title: 'Marine은 참치가 아니다',
      body: '참치·정어리·기타 수산물을 한 칸에 담는다. 이 회사에서 참치 단독 매출을 낼 수 있는 공개 문서는 없다',
    },
    {
      eyebrow: '조달',
      title: '배 0척, 직구매 59%',
      body: `참여사 경유 ${centurypacificStats.참여사경유_퍼센트}% · 기타 ${centurypacificStats.기타경로_퍼센트}% · 공급자 상호는 어디에도 없다`,
    },
    {
      eyebrow: '지배',
      title: '63%와 65.5%는 어긋난 것이 아니다',
      body: `직접명의 ${centurypacificStats.지주지분_직접명의_퍼센트}%에 예탁분을 더하면 ${centurypacificStats.지주지분_퍼센트}%가 된다`,
    },
    {
      eyebrow: '돈',
      title: '계획과 집행을 갈라 읽는다',
      body: '₱80~90억은 2026-06-30 주주총회가 재확인한 계획이다. 집행은 2025년 ₱40.8억, 2026년 상반기 ₱36.7억',
    },
  ],
  briefing: proseBriefing('centurypacific'),
  narratives: inlineReport('centurypacific', proseStages('centurypacific')),
  chartSlots: {},
  continuous: true,
  sourceNotes: centurypacificSourceNotes,
  sourceMeta: [
    `${centurypacificMeta.회사} · ${centurypacificMeta.국가} · ${centurypacificMeta.업종}`,
    `출처 ${centurypacificMeta.출처}`,
    `조사 ${centurypacificMeta.조사일}`,
  ].join(' · '),
};

const BF_ACCENT = '#7a2f3a';

const BF_SPEC: CommoditySpec = {
  key: 'company-anatomy-boltonfood',
  title: '기업 해부: Bolton Food S.p.A.',
  subtitle:
    '편 Ⅵ이 그룹을 다뤘다면 이 편은 법인 하나로 내려간다. 같은 회사를 부르는 숫자가 셋이고 서로 4,8배 차이다 — ' +
    '그룹 순매출 €3.541백만, 식품 카테고리 €2.382백만, 법인 개별 €734,2백만. 본사도 밀라노가 아니라 코모현 체르메나테다. ' +
    '이탈리아는 주식회사에 결산 예탁을 의무로 정하는데 그 원문은 무료 경로 어디에도 없다 — 「공개하지 않는다」가 아니라 「유료벽 뒤에 있다」가 정확한 문장이다.',
  accent: BF_ACCENT,
  primaryKpi: {
    label: '그룹 순매출 대 법인 개별',
    value: groupToEntityMultiple(),
    decimals: 1,
    unit: '(배 · €3.541백만 대 €734,2백만 · 법인 값만 집계 자료다)',
    accent: BF_ACCENT,
  },
  secondaryKpis: [
    { label: '공급선 명단이 넓어진 배수', value: vesselListGrowthMultiple(), decimals: 1, unit: '(배 · 398 → 964척 · 조달이 아니라 명단 정의가 넓어졌다)' },
    { label: '그룹 탄소발자국 중 트레이딩 계열', value: boltonfoodStats.트레이딩계열_탄소몫_퍼센트, decimals: 1, unit: '(% · 목표표에서 빠진 칸은 매출·물 지표이지 온실가스 목표가 아니다)' },
    { label: '한국 몫의 금액 대 중량 차', value: italyShareGapPp(), decimals: 2, unit: '(%p · 금액 36,88%로 1위 · 중량 31,09%로 2위)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '등기',
      title: '밀라노가 아니라 체르메나테',
      body: '부가세 번호 조회·법인식별자·코모현 환경허가 셋이 같은 주소로 닫힌다. 밀라노는 지주의 주소다',
    },
    {
      eyebrow: '명단',
      title: '한국 배 스물셋의 주인',
      body: `동원 ${boltonfoodStats.한국_동원} · 사조 ${boltonfoodStats.한국_사조} · 신라 ${boltonfoodStats.한국_신라} · 미확인 ${boltonfoodStats.한국_미확인}. 가장 많은 곳은 동원이다`,
    },
    {
      eyebrow: '기준',
      title: '2030년 인증 100%는 한 브랜드다',
      body: `대표 브랜드 참치만이고 2025년 실적 ${boltonfoodStats.대표브랜드_인증_퍼센트}%. 그룹 문장은 「매년 최소 95%를 건강한 자원에서」로 기준이 다르다`,
    },
    {
      eyebrow: '관세',
      title: '사흘 만에 닫히는 문',
      body: `로인 무관세 할당 ${boltonfoodStats.ATQ_배정_톤.toLocaleString('ko-KR')} t이 세 해 모두 1월 초에 잔량 0. 2027년분 근거 규정은 아직 없다`,
    },
  ],
  briefing: proseBriefing('boltonfood'),
  narratives: inlineReport('boltonfood', proseStages('boltonfood')),
  chartSlots: {},
  continuous: true,
  sourceNotes: boltonfoodSourceNotes,
  sourceMeta: [
    `${boltonfoodMeta.회사} · ${boltonfoodMeta.국가} · ${boltonfoodMeta.업종}`,
    `출처 ${boltonfoodMeta.출처}`,
    `조사 ${boltonfoodMeta.조사일}`,
  ].join(' · '),
};

const TM_ACCENT = '#2f5d6b';

const TM_SPEC: CommoditySpec = {
  key: 'company-anatomy-trimarine',
  title: '기업 해부: Tri Marine',
  subtitle:
    '스무 편이 잡는 회사와 만드는 회사와 쥔 회사를 덮었다. 거래상이 없었다 — 열 편이 각주로 스치고 아무도 해부하지 않은 회사다. ' +
    '크기가 함께 공개된 것은 한 판뿐이다: 순매출 906 M€, 그룹 매출의 28%, 공장 3, 배 15척, 종업원 5,100명. ' +
    '그 칸이 다음 판에서 사라졌고, 그 뒤 성과 지표 각주에는 「Group, Tri Marine excluded」가 고정된다.',
  accent: TM_ACCENT,
  primaryKpi: {
    label: '그룹 매출에서 차지하는 몫',
    value: trimarineStats.그룹매출_몫_퍼센트,
    decimals: 0,
    unit: '(% · FY2022 사업부 카드 · 순매출 906 M€)',
    accent: TM_ACCENT,
  },
  secondaryKpis: [
    { label: '태평양 세 등록부의 자사 명의 선박', value: trimarineStats.등록부_자사명의_선박, decimals: 0, unit: '(척 · 배는 계열 NFD 명의로 있다 · 대서양·인도양은 못 열었다)' },
    { label: '그룹 탄소발자국 중 이 회사 몫', value: trimarineStats.그룹탄소_이회사_몫_퍼센트, decimals: 1, unit: '(% · 조직도에서 지운 이름이 배출 배분표에는 남아 있다)' },
    { label: '콜롬비아 법인 선적 중 경쟁 브랜드행', value: competitorShipmentSharePct(), decimals: 1, unit: '(% · 24건 중 16건 · 그룹 내부행은 3건)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '등록부',
      title: '이 상호로 등록된 배가 없다',
      body: `WCPFC·IATTC·FFA 소유자·운영자 칸 모두 0척. 배는 계열 NFD 명의로 선망 ${trimarineStats.등록부_NFD_선망_등재}척이고 대만 연승 ${trimarineStats.용선_대만연승}척을 빌린다`,
    },
    {
      eyebrow: '조직도',
      title: '칸이 사라진 해는 2023년이다',
      body: 'FY2021 Tri Marine → FY2022 Tuna Supply → FY2023 삭제. 그 뒤 관련 정책은 「식품 사업부 대표가 승인」으로 적힌다',
    },
    {
      eyebrow: '세관',
      title: '경쟁 브랜드로 가는 물건',
      body: `콜롬비아 법인 ${trimarineStats.세관_GRALCO_총건수}건 중 ${trimarineStats.세관_GRALCO_경쟁사행_건수}건이 Tri Union·Bumble Bee 행이고 그룹 내부행은 ${trimarineStats.세관_GRALCO_그룹내부_건수}건이다`,
    },
    {
      eyebrow: '명단',
      title: '우리 배는 있고 이 이름은 없다',
      body: `Bolton 공급선 명단 네 판에 한국 국적선 ${trimarineStats.한국국적선_명단_2021}~${trimarineStats.한국국적선_명단_2024}척. 조달 주체로 이 상호가 적힌 자리는 ${trimarineStats.명단_TriMarine_표기_횟수}회다`,
    },
  ],
  briefing: proseBriefing('trimarine'),
  narratives: inlineReport('trimarine', proseStages('trimarine')),
  chartSlots: {},
  continuous: true,
  sourceNotes: trimarineSourceNotes,
  sourceMeta: [
    `${trimarineMeta.회사} · ${trimarineMeta.국가} · ${trimarineMeta.업종}`,
    `출처 ${trimarineMeta.출처}`,
    `조사 ${trimarineMeta.조사일}`,
  ].join(' · '),
};

const PR_ACCENT = '#3b5f7a';

const PR_SPEC: CommoditySpec = {
  key: 'company-anatomy-princes',
  title: '기업 해부: Princes',
  subtitle:
    '미쓰비시가 들고 있던 영국 캔참치 회사를 넘긴 대가는 회사 계정서에 「순현금 GBP 1」로 적혀 있다. ' +
    '그 회사는 15개월 만에 사모에서 공개로 재등록하고 런던 증시 본시장에 올랐다. ' +
    '상장 발행 £829,839,041 가운데 절반은 시장 현금이 아니라 모회사 대여금의 주식 전환이고, ' +
    '그 안에서 참치가 든 Fish 부문은 매출의 18.75% 를 대고 EBITDA 의 10.69% 를 낸다.',
  accent: PR_ACCENT,
  primaryKpi: {
    label: '상장 발행 총액 중 모회사 대여금 상계',
    value: ipoOffsetSharePct(),
    decimals: 2,
    unit: '(% · £429,699,000 · 시장 현금은 £400,140,028.50)',
    accent: PR_ACCENT,
  },
  secondaryKpis: [
    { label: '참치가 든 Fish 부문의 매출 몫', value: fishRevenueSharePct(), decimals: 2, unit: '(% · £350,992천 · 부문에는 고등어·연어도 들어간다)' },
    { label: '같은 부문의 EBITDA 몫', value: fishEbitdaSharePct(), decimals: 2, unit: '(% · 이익 몫이 아니라 EBITDA 몫이다)' },
    { label: '매입채무 회전일수 배수', value: dpoMultiple(), decimals: 2, unit: '(배 · 2024-03 36일 → 2025-12 93일 · 회사가 현금창출 기여로 적는다)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '계정서 주석 1',
      title: '지분 대가는 1파운드다',
      body: '매수인이 대(對)미쓰비시 차입 상환 재원을 댔다. 계정서가 적는 조달은 모회사 대여 €200m 과 은행단 €300m 이다',
    },
    {
      eyebrow: '등기',
      title: '하루에 상호가 두 번 바뀌었다',
      body: '2025-08-11 사모→공개 재등록. 같은 날 PRINCES LIMITED → PRINCES GROUP LIMITED → PRINCES GROUP PLC',
    },
    {
      eyebrow: '공장',
      title: '두 공장은 다른 법인이다',
      body: `리슈테르는 직접 ${princesStats.PTM_지분_퍼센트}%, 마린로드는 간접 ${princesStats.indico_지분_퍼센트}%. 모리셔스 법인 하나가 Fish 매출의 ${mauritiusRevenueSharePct()}% 를 낸다`,
    },
    {
      eyebrow: '인증',
      title: '100%는 브랜드에만 걸린다',
      body: `자체상표는 범위 밖이고, 회사 신고로 전 참치 조달 기준 MSC 인증은 ${princesStats.조달_MSC인증_퍼센트}% 다`,
    },
  ],
  briefing: proseBriefing('princes'),
  narratives: inlineReport('princes', proseStages('princes')),
  chartSlots: {},
  continuous: true,
  sourceNotes: princesSourceNotes,
  sourceMeta: [
    `${princesMeta.회사} · ${princesMeta.국가} · ${princesMeta.업종}`,
    `출처 ${princesMeta.출처}`,
    `조사 ${princesMeta.조사일}`,
  ].join(' · '),
};

const IOT_ACCENT = '#2c6b6b';

const IOT_SPEC: CommoditySpec = {
  key: 'company-anatomy-iot',
  title: '기업 해부: Indian Ocean Tuna',
  subtitle:
    '인도양 한가운데 섬나라의 캔참치 공장 하나다. 이 나라 국내수출의 74.8%가 이 캔이고, ' +
    '그 캔의 목적지에서 유럽이 차지하는 몫이 2019년 86%에서 2024년 54%로 내려갔다가 2025년 74.8%로 되돌아왔다. ' +
    '총수출은 줄지 않았다 — 2024년에 전년 대비 28% 늘었다. 줄어든 것은 유럽 향 몫뿐이고, 한 해로 끊으면 방향이 반대로 읽힌다.',
  accent: IOT_ACCENT,
  primaryKpi: {
    label: '이 나라 국내수출에서 캔참치가 차지하는 몫',
    value: cannedShareOfExportsPct(2024),
    decimals: 1,
    unit: '(% · 2024년 SCR 3,817.0M ÷ 5,101.3M · 「제조업 수출 95%」와는 분모가 다르다)',
    accent: IOT_ACCENT,
  },
  secondaryKpis: [
    { label: '캔참치 수출 중 유럽 몫', value: euShareOfCannedPct(2024), decimals: 1, unit: '(% · 2019년 86% → 2024년 54% → 2025년 74.8%)' },
    { label: '항구 양륙분 중 이 공장이 받는 몫', value: landingShareOfPortPct(), decimals: 1, unit: '(% · 분모는 양륙 88,569 t 이지 항구 합계가 아니다)' },
    { label: '이 나라 수역 허가 선망 중 자국 국적', value: domesticFlagShareSafe(), decimals: 0, unit: '(% · 13척 / 50척 · 유럽연합 협정선이 27척이다)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '표 7.1',
      title: '총수출은 늘었다',
      body: `2023년 ${iotStats.총수출_2023_톤.toLocaleString('ko-KR')} t → 2024년 ${iotStats.총수출_2024_톤.toLocaleString('ko-KR')} t. 줄어든 것은 유럽 향 몫뿐이다`,
    },
    {
      eyebrow: '원료',
      title: '양륙만으로는 캔이 설명되지 않는다',
      body: `양륙 매입 ${iotStats.공장매입_2024_톤.toLocaleString('ko-KR')} t 만 원료로 보면 수율이 ${impossibleYieldPct()}% 가 된다. 냉동어 수입 ${iotStats.냉동어수입_2023_톤.toLocaleString('ko-KR')} t 이 따로 있다`,
    },
    {
      eyebrow: '항구',
      title: '지나가는 물량은 섬에 남지 않는다',
      body: `포트 빅토리아 선망 물량 ${iotStats.항구_선망물량_2024_톤.toLocaleString('ko-KR')} t 중 섬에 남는 것은 ${landedSharePct()}% 이고 나머지는 전재로 나간다`,
    },
    {
      eyebrow: '선단',
      title: '이 공장에는 배가 없다',
      body: `자사 명의 선박 ${iotStats.자사선박_척}척. 이 나라 국적 선망 ${iotStats.세이셸국적선망_척}척은 경쟁 그룹 공급선 명부와 선박식별번호까지 전부 겹친다`,
    },
  ],
  briefing: proseBriefing('iot'),
  narratives: inlineReport('iot', proseStages('iot')),
  chartSlots: {},
  continuous: true,
  sourceNotes: iotSourceNotes,
  sourceMeta: [
    `${iotMeta.회사} · ${iotMeta.국가} · ${iotMeta.업종}`,
    `출처 ${iotMeta.출처}`,
    `조사 ${iotMeta.조사일}`,
  ].join(' · '),
};

const ATI_ACCENT = '#8a3b2e';

const ATI_SPEC: CommoditySpec = {
  key: 'company-anatomy-ati',
  title: '기업 해부: Aneka Tuna Indonesia',
  subtitle:
    '伊藤忠과 はごろもフーズ가 세운 인도네시아 동자바의 캔참치 공장이다. 일본 매대의 인도네시아 제조 シーチキン이 이 공장에서 나왔을 개연성이 높다(はごろも 공시상 인도네시아 제조위탁처는 이 회사 하나). ' +
    '국제수산물지속가능재단의 2025년 활동분 감사에서 참여사 스물네 곳 가운데 Major 부적합(제품 표시)을 받은 곳은 이 회사 하나이고, 같은 조치가 2024년분에서도 Major였다. ' +
    '같은 재단 조달표에서 선박 직접 구매 0%, 어느 범주에도 들지 않는 원료 89%로 ⅩⅩⅡ편의 영국 회사와 반대쪽에 선다.',
  accent: ATI_ACCENT,
  primaryKpi: {
    label: '일본 조제참치(HS 1604.14) 수입액 중 인도네시아산',
    value: japanImportShareIdnPct(),
    decimals: 1,
    unit: '(% · 2025년 재무성 확정치 · 태국 60.6% 다음 2위 · 나라 몫이지 이 회사 몫이 아니다)',
    accent: ATI_ACCENT,
  },
  secondaryKpis: [
    { label: 'MSC 인증 어업 구매 — 2024 → 2025', value: mscShiftPp(), decimals: 0, unit: '(%p · 9% → 7% · 목표는 매년 +1%였다)' },
    { label: 'はごろも 연결의 지분법 이익 증감', value: equityIncomeChangePct(), decimals: 1, unit: '(% · 제96기 146,365천엔 → 제97기 85,598천엔 · 매입은 +4.2%)' },
    { label: '월 원료 대비 월 제품', value: monthlyYieldPct(), decimals: 1, unit: '(% · 2025-08 주 수산청 · 공장 구분 없음)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '재단 감사',
      title: '제품 표시 Major, 24사 중 하나',
      body: '보존조치 2.3 — 어종과 어획 대양 표시. 2024·2025년 활동분 연속 Major, 대상 브랜드 Sun Bell·Hagoromo, 2026-06-11 기준 미시정',
    },
    {
      eyebrow: '관세',
      title: '9.6%에서가 아니라 5%에서 0',
      body: '2026-08-01 일본–인도네시아 협정 개정 발효. 개정 직전 최저는 아세안 협정 5%. 두 세번에는 체장 30 cm 증명 조건',
    },
    {
      eyebrow: '선박 명부',
      title: '등록부 0척, 사업 명부 118척',
      body: `WCPFC 등록부 인도네시아 ${atiStats.WCPFC_인니_척}척 중 자사 ${atiStats.자사선박_척}척. FIP 명부 ${atiStats.FIP_명부_척}척은 운영사 소유다`,
    },
    {
      eyebrow: '한국',
      title: '우리 가다랑어의 행선지로는 작다',
      body: `한국 냉동 가다랑어 수출 중 인도네시아 행 ${koreaSkjShareToIdnPct()}% (2024, ${atiStats.한국_0303_43_대인니_톤} t). 최대 행선지는 태국 61%`,
    },
  ],
  briefing: proseBriefing('ati'),
  narratives: inlineReport('ati', proseStages('ati')),
  chartSlots: {},
  continuous: true,
  sourceNotes: atiSourceNotes,
  sourceMeta: [
    `${atiMeta.회사} · ${atiMeta.국가} · ${atiMeta.업종}`,
    `출처 ${atiMeta.출처}`,
    `조사 ${atiMeta.조사일}`,
  ].join(' · '),
};

const NIRSA_ACCENT = '#8a6d1f';

const NIRSA_SPEC: CommoditySpec = {
  key: 'company-anatomy-nirsa',
  title: '기업 해부: NIRSA',
  subtitle:
    '에콰도르 포소르하의 참치·정어리 캐너리이고, 동태평양 참치위원회 등록부상 에콰도르 최대 선망 선단의 주인이다. ' +
    `등록 소유자가 「NIRSA S.A.」인 선망 ${nirsaStats.소유_선망_척}척의 어창 용적이 에콰도르 선망 ${nirsaStats.에콰도르_선망_척}척 합계의 ${nirsaStats.소유_용적_비중_pct}%다. ` +
    '그러나 유럽연합이 에콰도르산 조제참치에 0%를 매기는 조건은 이 회사의 배가 아니라 협정이 인정하는 배다 — 유럽연합·안데스 서명국 어느 쪽 배든 된다.',
  accent: NIRSA_ACCENT,
  primaryKpi: {
    label: '에콰도르 선망 어창 용적 중 NIRSA 소유선',
    value: nirsaStats.소유_용적_비중_pct,
    decimals: 1,
    unit: `(% · IATTC 등록부 2026-08-17 · 소유 ${nirsaStats.소유_선망_척}척 ${nirsaStats.소유_용적_m3.toLocaleString()} m³ · 운항만 맡은 한 척을 더하면 ${nirsaStats.운항포함_용적_비중_pct}%)`,
    accent: NIRSA_ACCENT,
  },
  secondaryKpis: [
    { label: '2024년 매출 — 에콰도르 참치 가공사 2위 대비', value: salesVsSecondX(), decimals: 2, unit: '(배 · 회사감독청 순위 원자료 · 새우 판매 포함)' },
    { label: '매출 증가 2019 → 2024', value: salesGrowthPct(), decimals: 1, unit: '(% · 순위 원자료 두 해)' },
    { label: '2019년 순매출 중 새우', value: shrimpShare2019Pct(), decimals: 1, unit: '(% · 경영자 보고서 · 법인 기준, 그룹 새우 가공사는 자매회사)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '원산지',
      title: '0%의 조건은 적격 배',
      body: `유럽연합 기준세율 ${nirsaStats.EU_기준세율_pct}% → 협정 ${nirsaStats.EU_협정세율_pct}%(2017-01-01). 원산지 의정서 제5조 1(f) — 유럽연합·안데스 서명국 어느 쪽 적격 선박이든 된다`,
    },
    {
      eyebrow: '선단',
      title: `소유 ${nirsaStats.소유_선망_척}척, 열하나가 1990년 이전`,
      body: '넷은 파나마·니카라과·코스타리카 어창 용적을 옮겨 받아 뛴다. 기국은 모두 에콰도르 — 「파나마 선적」이 아니다',
    },
    {
      eyebrow: '인증',
      title: '어업 증서의 주인은 Tunacons',
      body: `MSC-F-31557 선박 ${nirsaStats.MSC_증서_선박}척 중 NIRSA 소유 ${nirsaStats.MSC_증서_중_소유선}척. 「100% MSC」는 회사 주장이다`,
    },
    {
      eyebrow: '미국',
      title: '유럽의 반대편',
      body: `기본세 6~35%. 에콰도르 조제참치 세계 수출 중 미국행 ${ecuadorToUsSharePct()}%(2024). 301조 10%의 1604 면제 여부는 미확인`,
    },
    {
      eyebrow: '한국',
      title: '우리 선망은 이 바다에 없다',
      body: `IATTC 등록 한국 기국 ${nirsaStats.한국_IATTC_등록_척}척은 전부 연승선, 선망 ${nirsaStats.한국_IATTC_선망_척}척`,
    },
  ],
  briefing: proseBriefing('nirsa'),
  narratives: inlineReport('nirsa', proseStages('nirsa')),
  chartSlots: {},
  continuous: true,
  sourceNotes: nirsaSourceNotes,
  sourceMeta: [
    `${nirsaMeta.회사} · ${nirsaMeta.국가} · ${nirsaMeta.업종}`,
    `출처 ${nirsaMeta.출처}`,
    `조사 ${nirsaMeta.조사일}`,
  ].join(' · '),
};

const EUROFISH_ACCENT = '#2f6b5a';

const EUROFISH_SPEC: CommoditySpec = {
  key: 'company-anatomy-eurofish',
  title: '기업 해부: Eurofish',
  subtitle:
    '에콰도르 만타·몬테크리스티의 참치 가공사다. 회사는 자사 선망 21척이 원료의 약 70%를 댄다고 말하지만, 동태평양 참치위원회 등록부 소유자 칸에 이 회사 상호는 0척이다. ' +
    `회사 누리집의 MSC 증서 부속서(2024-07-03)는 선망 ${eurofishStats.부속서_연계_척}척을 「Eurofish(법인명)」으로 묶는다 — 등록 소유자는 에콰도르 단선 법인과 스페인·파나마·미국 법인으로 흩어져 있다. ` +
    '부속서의 회사 칸은 인증 연계이지 소유가 아니다.',
  accent: EUROFISH_ACCENT,
  primaryKpi: {
    label: '에콰도르 선망 어창 용적 중 Eurofish 인증 연계 선박(현재 에콰도르 기국)',
    value: linkedFleetSharePct(),
    decimals: 1,
    unit: `(% · ${eurofishStats.현재_에콰도르_연계_척}척 ${eurofishStats.현재_에콰도르_연계_용적_m3.toLocaleString()} m³ · 소유가 아니라 인증 연계 · NIRSA 등록 소유 ${eurofishStats.NIRSA_소유_용적_m3.toLocaleString()} m³와는 기준이 다르다)`,
    accent: EUROFISH_ACCENT,
  },
  secondaryKpis: [
    { label: '2019 관계회사 매입 거래 / 원어 매입액', value: relatedPurchaseSharePct(), decimals: 1, unit: '(% · 품목 미분류 조건부 비교값 · 자칭 70%와 단위가 다르다)' },
    { label: '인도양 이적 4척의 연계 선단 용적 몫', value: transferredShareOfLinkedPct(), decimals: 1, unit: '(% · 2010~2013 건조 · 등록 소유 스페인·파나마 법인)' },
    { label: '매출 증가 2019 → 2024', value: eurofishSalesGrowthPct(), decimals: 1, unit: '(% · 회사감독청 순위 원자료)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '선단',
      title: '등록부 0척, 인증서 19척',
      body: 'Elvayka Kyoei(주주 IBEROPESCA 50%·사장 50%) 5척 등 에콰도르 법인 명의. Eurofish S.A. 2019 장부에는 어선 자산(장부가 786만 달러)',
    },
    {
      eyebrow: '이적',
      title: '인도양 90 m 선망 4척',
      body: 'Sapmer(레위니옹)가 2023~2024년 매각. 등록 소유 스페인 Aldan Pacific S.L.·파나마 법인. 척당 어창 1,630 m³',
    },
    {
      eyebrow: '행선지',
      title: '유럽 브랜드 로인 · 미국 펫푸드',
      body: `조제참치 수출 FOB 2024 ${eurofishStats.조제참치_수출_FOB_2024_백만usd}백만 달러(${eurofishStats.조제참치_수출_순위_2024}위). 미국 선하증권 최다 수하인은 펫푸드 수입사`,
    },
    {
      eyebrow: '관세',
      title: '파나마 소유 세 척의 유럽 원산지',
      body: '유럽 0% 선박 요건은 등록·기국·소유. 등록 소유자가 파나마 법인인 세 척(4,890 m³)은 지분 비공개로 판단할 수 없다',
    },
  ],
  briefing: proseBriefing('eurofish'),
  narratives: inlineReport('eurofish', proseStages('eurofish')),
  chartSlots: {},
  continuous: true,
  sourceNotes: eurofishSourceNotes,
  sourceMeta: [
    `${eurofishMeta.회사} · ${eurofishMeta.국가} · ${eurofishMeta.업종}`,
    `출처 ${eurofishMeta.출처}`,
    `조사 ${eurofishMeta.조사일}`,
  ].join(' · '),
};

const TECOPESCA_ACCENT = '#8a5a2b';

const TECOPESCA_SPEC: CommoditySpec = {
  key: 'company-anatomy-tecopesca',
  title: '기업 해부: Tecopesca',
  subtitle:
    '에콰도르 만타 옆 하라미호의 참치 캐너리다. 동태평양 참치위원회 등록부 소유·운항자 칸에 이 회사 명의 배는 0척이고 원료는 전량 사 온다. ' +
    '2019년 감사 주석의 원료 매입처에 Tri Marine·동원산업이, 2018년에는 Albacora가 있고, 판로에는 2015년 매출의 28%를 받은 Frinsa와 Thai Union의 미국 법인이 있다. ' +
    '주석은 이 매입처들을 특수관계자 표에 적지만 근거를 밝히지 않는다 — 지분 관계로 읽지 않는다.',
  accent: TECOPESCA_ACCENT,
  primaryKpi: {
    label: '2019 특수관계자 원료 매입 중 이 시리즈 회사(Tri Marine·동원) 몫',
    value: seriesSupplierSharePct(),
    decimals: 1,
    unit: `(% · ${(tecopescaStats.시리즈_매입_2019_usd / 1e4).toFixed(0)}만 달러 / ${(tecopescaStats.특수관계_원료매입_2019_usd / 1e4).toFixed(0)}만 달러 · 최대 공급원은 시리즈 밖 Jadran 계열 두 선사 34.4%)`,
    accent: TECOPESCA_ACCENT,
  },
  secondaryKpis: [
    { label: '2018 특수관계자 원료 매입 / 원료 매입액', value: relatedPurchaseShare2018Pct(), decimals: 1, unit: '(% · 같은 해 금액끼리 · 2019 경영자 보고서 톤수는 2018 복제라 쓰지 않는다)' },
    { label: '2018 원료 톤수 중 가다랑어', value: skipjackShare2018Pct(), decimals: 1, unit: '(% · 2018 경영자 보고서 어종 표)' },
    { label: '매출 증가 2023 → 2024', value: salesGrowth2024Pct(), decimals: 1, unit: '(% · 회사감독청 순위 원자료 · 같은 해 총자산은 6.0% 증가)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '원료',
      title: '배 0척, 매입처 13곳',
      body: 'Jadran 계열 파나마 선사 둘·Cristina Fishing·Tri Marine·Echebastar·동원산업 247만 달러(2019). 매입처 구성이 해마다 바뀐다',
    },
    {
      eyebrow: '판로',
      title: 'Frinsa 28% · Tri-Union 94건',
      body: `2015년 최대 고객 Frinsa. 조제참치 수출 FOB 2024 ${tecopescaStats.조제참치_수출_FOB_2024_백만usd}백만 달러(${tecopescaStats.조제참치_수출_순위_2024}위). 콜롬비아로 Subway 상표 파우치`,
    },
    {
      eyebrow: '관계사',
      title: '상표 대금이 들어오지 않았다',
      body: 'Tunalia 상표를 2018-12 관계사에 계약가 250만 달러+세금으로 넘겼고, 매각이익 118만 달러가 그해 순이익 19만 달러보다 컸다',
    },
    {
      eyebrow: '관세',
      title: '유럽 0%는 매입처 배마다',
      body: '스페인·프랑스 기국은 적격 요건 대상, 파나마 기국은 중미 누적 조건부, 미국·한국 기국은 0% 칸 밖. 어느 캔에 어느 배 원료가 들었는지는 공개 자료로 가를 수 없다',
    },
  ],
  briefing: proseBriefing('tecopesca'),
  narratives: inlineReport('tecopesca', proseStages('tecopesca')),
  chartSlots: {},
  continuous: true,
  sourceNotes: tecopescaSourceNotes,
  sourceMeta: [
    `${tecopescaMeta.회사} · ${tecopescaMeta.국가} · ${tecopescaMeta.업종}`,
    `출처 ${tecopescaMeta.출처}`,
    `조사 ${tecopescaMeta.조사일}`,
  ].join(' · '),
};

export const COMPANY_CARDS: CompanyCard[] = [
  {
    key: 'frinsa',
    numeral: 'Ⅰ',
    name: 'Frinsa del Noroeste',
    country: '스페인 · 갈리시아',
    tagline: '이름을 팔지 않는 회사. 선단 0척으로 한 해 참치 원어 13만 톤을 사들인다.',
    ...FLAG.스페인,
    stats: [
      { label: `${FIN.연도}년 매출`, value: `${FIN.매출.toLocaleString('ko-KR')} M€` },
      { label: '참치 원어 구매', value: `${tunaPurchasedMt().toLocaleString('ko-KR')} 톤` },
      { label: '보유 선단', value: '0 척' },
    ],
  },
  {
    key: 'thaiunion',
    numeral: 'Ⅱ',
    name: 'Thai Union Group',
    country: '태국 · 사뭇사콘',
    tagline: 'John West 도 Chicken of the Sea 도 이 회사 것이다. 한국 참치 수출의 절반이 이곳으로 간다.',
    ...FLAG.태국,
    stats: [
      { label: `${TU_FIN.연도}년 연결 매출`, value: `${((TU_FIN.매출 ?? 0) / 1000).toFixed(0)}십억 밧` },
      { label: '참치 캐파', value: `${tunaCapacityMt().toLocaleString('ko-KR')} 톤/년` },
      { label: '보유 선단', value: '0 척' },
    ],
  },
  {
    key: 'albacora',
    numeral: 'Ⅲ',
    name: 'Albacora, S.A.',
    country: '스페인 · 바스크 베르메오',
    tagline: '앞의 둘은 사는 회사였다. 이쪽은 잡는 회사다. 선망 18척으로 한 해 20만 톤.',
    ...FLAG.스페인,
    stats: [
      { label: `${ALB_CATCH.연도}년 어획량`, value: `${(ALB_CATCH.톤 / 1000).toFixed(0)}천 톤` },
      { label: '등록부 확인 선단', value: `${fleetGtTotal().toLocaleString('ko-KR')} GT` },
      { label: '보유 선단', value: `${ALBACORA_CLAIMED_VESSELS} 척` },
    ],
  },
  {
    key: 'fcf',
    numeral: 'Ⅳ',
    name: 'FCF Co., Ltd.',
    country: '대만 · 가오슝',
    tagline: '배는 한 척도 없다. 그런데 신라교역 매출의 40%를 사가는 단일 최대 고객이다.',
    ...FLAG.대만,
    stats: [
      { label: `신라교역 의존 (${FCF_SILLA_PEAK.연도})`, value: `${FCF_SILLA_PEAK.비중.toFixed(1)} %` },
      { label: '자사 보유 어선', value: `${fcfStats.자사선} 척` },
      { label: '협력 공급 어선', value: `${fcfStats.협력선}척+` },
    ],
  },
  {
    key: 'itochu',
    numeral: 'Ⅴ',
    name: 'ITOCHU Corporation',
    country: '일본 · 오사카 · 도쿄',
    tagline: '참치는 부(部)의 절반이다. 그런데 인증 선단 25척 중 11척이 사조그룹이다.',
    ...FLAG.일본,
    stats: [
      { label: '인증 선단 중 사조', value: `${sajoVessels()} / ${fleetTotal()} 척` },
      { label: '食料 세그먼트', value: `${itochuStats.식료_억엔.toLocaleString('ko-KR')} 억엔` },
      { label: '수산 실적 공시', value: '0 건' },
    ],
  },
  {
    key: 'bolton',
    numeral: 'Ⅵ',
    name: 'Bolton Group',
    country: '이탈리아 · 밀라노',
    tagline: 'Rio Mare 옆에 UHU 접착제와 WC Net 세제가 있다. 참치 사이클 밖이 매출의 3분의 1이다.',
    ...FLAG.이탈리아,
    stats: [
      { label: '2025년 순매출', value: `${boltonStats.매출_백만유로.toLocaleString('ko-KR')} M€` },
      { label: '참치 조달', value: `${boltonStats.조달_톤.toLocaleString('ko-KR')} 톤` },
      { label: '명단 속 한국선', value: `${latestVesselList().한국선} / ${latestVesselList().총척수} 척` },
    ],
  },
  {
    key: 'jais',
    numeral: 'Ⅶ',
    name: 'JAIS S.R.L.',
    country: '이탈리아 · 밀라노',
    tagline: '공장도 배도 자회사도 없다. 여덟 명이 남의 명부에 한 줄로만 존재해 온 중개 노드다.',
    ...FLAG.이탈리아,
    stats: [
      { label: '2024년 매출', value: `${jaisStats.매출_만유로.toLocaleString('ko-KR')} 만 €` },
      { label: '종업원', value: `${jaisStats.종업원} 명` },
      { label: '공장 · 선박 · 자회사', value: `${ownedAssets()} 개` },
    ],
  },
  {
    key: 'frabelle',
    numeral: 'Ⅷ',
    name: 'Frabelle Group',
    country: '필리핀 · 나보타스',
    tagline: '캔을 만드는 회사가 아니다. 필리핀에는 자사 참치 캐너리가 없고 캔 공장은 파푸아뉴기니에 하나 있다.',
    ...FLAG.필리핀,
    stats: [
      { label: '등록부 확인 선망선', value: `${frabelleStats.등록부_참치선망선} 척` },
      { label: 'PNG Lae 가공 능력', value: `${frabelleStats.PNG_Lae_능력_MT일} MT/일` },
      { label: '필리핀 국내 캐너리', value: `${frabelleStats.필리핀_국내_참치캐너리} 곳` },
    ],
  },
  {
    key: 'jealsa',
    numeral: 'Ⅸ',
    name: 'Jealsa',
    country: '스페인 · 보이로',
    tagline: '매출의 절반 넘게를 고객 한 곳이 가져간다. 창업 가문의 자산지주는 경쟁 그룹 이사회의 부회장석에 앉아 있다.',
    ...FLAG.스페인,
    stats: [
      { label: '2025년 연결매출', value: `${jealsaStats.연결매출_2025} M€` },
      { label: 'Mercadona 향 비중', value: `${mercadonaShare()} %` },
      { label: '자체 선망선', value: `${jealsaStats.선단_회사표기} 척` },
    ],
  },
  {
    key: 'nauterra',
    numeral: 'Ⅹ',
    name: 'Nauterra',
    country: '스페인 · 카르바요',
    tagline: '배 여덟 척과 공장 셋을 가졌는데 명부를 열면 이름이 없다. 등기 상호는 아직 Luis Calvo Sanz다.',
    ...FLAG.스페인,
    stats: [
      { label: '2025년 그룹 매출', value: `${nauterraStats.매출_2025} M€` },
      { label: '엘살바도르 기 선박', value: `${nauterraStats.선단_엘살바도르기} / ${nauterraStats.선단} 척` },
      { label: 'Bolton 지분', value: `${nauterraStats.bolton_지분} %` },
    ],
  },
  {
    key: 'starkist',
    numeral: 'ⅩⅠ',
    name: 'StarKist',
    country: '미국 · 파고파고',
    tagline: '미국 법정에서 벌어진 일의 회계 계보를 연도별로 적은 문서는 한국어다.',
    ...FLAG.미국,
    stats: [
      { label: '회사가 공시한 법정 상한', value: `US$${starkistStats.법정상한_공시_usd_m}M` },
      { label: '회사가 쌓은 충당', value: `US$${starkistStats.충당_2018_usd_m}M` },
      { label: '전수검색 정기공시', value: `${starkistStats.전수검색_합} 건` },
    ],
  },
  {
    key: 'dongwon',
    numeral: 'ⅩⅡ',
    name: '동원산업㈜',
    country: '대한민국 · 서울 서초',
    tagline: '선망 19척으로 한 해 20만 톤을 잡는다. 그런데 연결 매출에서 어획은 3.54%다.',
    ...FLAG.한국,
    stats: [
      { label: '원양 수출 점유', value: `${dongwonStats.원양수출_점유}%` },
      { label: '연결 어획 비중', value: `${catchSharePct()}%` },
      { label: '보유 선단', value: `${dongwonStats.선단_척} 척` },
    ],
  },
  {
    key: 'sajo',
    numeral: 'ⅩⅢ',
    name: '기업집단 「사조」',
    country: '대한민국 · 서울 서대문',
    tagline: '일곱 부문 가운데 적자는 수산사업 하나이고 골프장이 그보다 번다.',
    ...FLAG.한국,
    stats: [
      { label: '계열 / 상장', value: `${sajoStats.계열_수}사 / ${sajoStats.상장_수}사` },
      { label: '원양 수출 점유 (3사)', value: `${sajoExportSharePct()}%` },
      { label: '두 담합 과징금', value: `${cartelFineBillionKrw().toLocaleString('ko-KR')} 억원` },
    ],
  },
  {
    key: 'bumblebee',
    numeral: 'ⅩⅣ',
    name: 'Bumble Bee Foods',
    country: '미국 · 캘리포니아 샌디에이고',
    tagline: '배가 한 척도 없는 회사가 미국 알바코어 캔의 41%를 판다.',
    ...FLAG.미국,
    stats: [
      { label: '알바코어 캔 점유', value: `${bumblebeeStats.알바코어_점유}%` },
      { label: '거래에서 현금 비중', value: `${cashSharePct()}%` },
      { label: '선박명부 등재', value: `${bumblebeeStats.선박_등재} 척` },
    ],
  },
  {
    key: 'umios',
    numeral: 'ⅩⅤ',
    name: 'Umios株式会社',
    country: '일본 · 도쿄 미나토',
    tagline: '국내 양식 참다랑어의 23%를 기른다. 알에서 기른 것은 약 4%이고, 전국 인공종묘 곡선은 이미 무너졌다.',
    ...FLAG.일본,
    stats: [
      { label: '전국 양식 참다랑어 몫', value: `${umiosStats.회사_점유}%` },
      { label: '알에서 기른 몫', value: `약 ${Math.round(fullCycleSharePct())}%` },
      { label: '전국 인공종묘 정점 대비', value: `${nationalSeedCollapsePct()}%` },
    ],
  },
  {
    key: 'kyokuyo',
    numeral: 'ⅩⅥ',
    name: '株式会社極洋',
    country: '일본 · 도쿄',
    tagline: '이익의 57%를 내던 참치 부문이 이름을 잃었다. 첫 해에 그 자리의 이익 몫은 24%가 됐다.',
    ...FLAG.일본,
    stats: [
      { label: '구 「鰹・鮪」 이익 몫', value: `${kyokuyoStats.구부문_이익몫}%` },
      { label: '이익 몫 ÷ 매출 몫', value: `${oldSegmentLeverage()}배` },
      { label: '선망 (자회사 명의)', value: `${kyokuyoStats.선망_척} 척` },
    ],
  },
  {
    key: 'seavalue',
    numeral: 'ⅩⅦ',
    name: 'Sea Value Group',
    country: '태국 · 사뭇사콘',
    tagline: '1989년에 Bumble Bee를 사서 무너진 회사가 이 그룹 안에 있다. 지금 캔은 StarKist로 간다.',
    ...FLAG.태국,
    stats: [
      { label: '1989년 인수 대가', value: `US$${seavalueStats.인수대가_백만USD}M` },
      { label: '2005년 인수 지분', value: `${seavalueStats.인수지분}%` },
      { label: '자체 브랜드 참치 SKU', value: `${seavalueStats.자체브랜드_참치_행} / ${seavalueStats.자체브랜드_총행}` },
    ],
  },
  {
    key: 'nissui',
    numeral: 'ⅩⅧ',
    name: '株式会社ニッスイ',
    country: '일본 · 도쿄',
    tagline: '참치를 회사 이름에 박았는데, 관계회사 명부에는 그 이름이 없다.',
    ...FLAG.일본,
    stats: [
      { label: '水産 이익 배수', value: `${marineProfitMultiple()}배` },
      { label: '부문 ÷ 연결 증가분', value: `${nissuiStats.증가분_비율}%` },
      { label: '자사 참치 캔', value: `${nissuiStats.자사_참치캔_SKU} 종` },
    ],
  },
  {
    key: 'centurypacific',
    numeral: 'ⅩⅨ',
    name: 'Century Pacific Food',
    country: '필리핀 · 파시그',
    tagline: '배가 한 척도 없는데 참치 매입의 59%가 선박 직구매다. 한국에서 사는 몫만 3년 만에 6분의 1이 됐다.',
    ...FLAG.필리핀,
    stats: [
      { label: '수산 부문 몫', value: `${marineSharePct()}%` },
      { label: '선박 직구매', value: `${centurypacificStats.선박직구매_퍼센트}%` },
      { label: '보유 선단', value: `${centurypacificStats.RFV_어선_척} 척` },
    ],
  },
  {
    key: 'boltonfood',
    numeral: 'ⅩⅩ',
    name: 'Bolton Food S.p.A.',
    country: '이탈리아 · 체르메나테',
    tagline: '같은 회사를 부르는 숫자가 셋이고 서로 4,8배 차이다. 결산 원문은 무료 경로 어디에도 없다.',
    ...FLAG.이탈리아,
    stats: [
      { label: '그룹 대 법인', value: `${groupToEntityMultiple()}배` },
      { label: '공급선 명단', value: `${boltonfoodStats.명단_2025_고유선박.toLocaleString('ko-KR')} 척` },
      { label: '한국 국적선', value: `${boltonfoodStats.명단_2025_한국} 척` },
    ],
  },
  {
    key: 'trimarine',
    numeral: 'ⅩⅩⅠ',
    name: 'Tri Marine',
    country: '싱가포르 · 등기',
    tagline: '그룹이 헤드라인에서 빼는 회사가 그룹 매출의 28%다. 태평양 등록부에 이 상호로 등록된 배는 없다.',
    ...FLAG.싱가포르,
    stats: [
      { label: '그룹 매출 몫', value: `${trimarineStats.그룹매출_몫_퍼센트}%` },
      { label: '자사 명의 선박', value: `${trimarineStats.등록부_자사명의_선박} 척` },
      { label: '연방법원', value: `${trimarineStats.연방법원_사건} 건` },
    ],
  },
  {
    key: 'princes',
    numeral: 'ⅩⅩⅡ',
    name: 'Princes Group plc',
    country: '영국 · 리버풀',
    tagline: '지분 대가는 1파운드였다. 15개월 뒤 런던 증시에 올랐고, 참치는 매출의 18.75%다.',
    ...FLAG.영국,
    stats: [
      { label: 'Fish 부문 매출', value: `£${(princesStats.fish_매출_천파운드 / 1000).toFixed(0)}백만` },
      { label: '매입채무 회전일수', value: `${princesStats.DPO_2025_12_일}일` },
      { label: '자사 선박', value: `${princesStats.자사선박_척} 척` },
    ],
  },
  {
    key: 'iot',
    numeral: 'ⅩⅩⅢ',
    name: 'Indian Ocean Tuna',
    country: '세이셸 · 빅토리아',
    tagline: '캔은 그대로 나가는데 가는 곳이 바뀌었다. 이 나라 국내수출의 74.8%가 이 캔이다.',
    ...FLAG.세이셸,
    stats: [
      { label: '국내수출 중 캔참치', value: `${cannedShareOfExportsPct(2024)}%` },
      { label: '공장 양륙 매입', value: `${(iotStats.공장매입_2024_톤 / 1000).toFixed(1)}천 t` },
      { label: '자사 선박', value: `${iotStats.자사선박_척} 척` },
    ],
  },
  {
    key: 'ati',
    numeral: 'ⅩⅩⅣ',
    name: 'Aneka Tuna Indonesia',
    country: '인도네시아 · 동자바 파수루안',
    tagline: '같은 재단의 표에서 준수가 가장 낮은 줄. 제품 표시 Major, 24사 중 이 회사뿐이다.',
    ...FLAG.인도네시아,
    stats: [
      { label: '일본 조제참치 수입 중 인니', value: `${japanImportShareIdnPct()}%` },
      { label: '선박 직접 구매', value: `${atiStats.선박직접_pct}%` },
      { label: '재단 Major', value: `${atiStats.ISSF_Major_회사} / ${atiStats.ISSF_참여사}` },
    ],
  },
  {
    key: 'nirsa',
    numeral: 'ⅩⅩⅤ',
    name: 'NIRSA',
    country: '에콰도르 · 과야킬·포소르하',
    tagline: '에콰도르 최대 선단의 주인. 그러나 유럽 무관세의 조건은 그 배가 아니라 협정이 인정하는 배다.',
    ...FLAG.에콰도르,
    stats: [
      { label: '에콰도르 선망 용적', value: `${nirsaStats.소유_용적_비중_pct}%` },
      { label: '2024 매출 · 2위 대비', value: `${salesVsSecondX()}배` },
      { label: '소유 선망', value: `${nirsaStats.소유_선망_척} 척` },
    ],
  },
  {
    key: 'eurofish',
    numeral: 'ⅩⅩⅥ',
    name: 'Eurofish',
    country: '에콰도르 · 만타·몬테크리스티',
    tagline: '등록부에는 이 회사 이름의 배가 없고, 인증서에는 이 회사 이름으로 열아홉 척이 묶여 있다.',
    ...FLAG.에콰도르,
    stats: [
      { label: '등록부 소유 / 인증 연계', value: `${eurofishStats.등록부_소유_척} / ${eurofishStats.부속서_연계_척} 척` },
      { label: '관계회사 매입 비교값', value: `${relatedPurchaseSharePct()}%` },
      { label: '2024 매출', value: `${(eurofishStats.매출_2024_usd / 1e6).toFixed(0)}M$` },
    ],
  },
  {
    key: 'tecopesca',
    numeral: 'ⅩⅩⅦ',
    name: 'Tecopesca',
    country: '에콰도르 · 하라미호(만타)',
    tagline: '배가 없는 캐너리, 원료와 판로가 앞 편 회사 다섯과 닿아 있다.',
    ...FLAG.에콰도르,
    stats: [
      { label: '등록부 소유', value: `${tecopescaStats.등록부_소유_척} 척` },
      { label: '시리즈 회사 원료 몫', value: `${seriesSupplierSharePct()}%` },
      { label: '2024 매출', value: `${(tecopescaStats.매출_2024_usd / 1e6).toFixed(0)}M$` },
    ],
  },

];

export interface CompanyAnatomyDashboardProps {
  heroOnly?: boolean;
}

export default function CompanyAnatomyDashboard({
  heroOnly = false,
}: CompanyAnatomyDashboardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (heroOnly) return <CommodityIndustryDashboard spec={SPEC} heroOnly />;

  if (selected === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <CompanyGallery companies={COMPANY_CARDS} onSelect={setSelected} />
      </div>
    );
  }

  const SPECS: Record<string, CommoditySpec> = {
    frinsa: SPEC,
    thaiunion: TU_SPEC,
    albacora: ALB_SPEC,
    fcf: FCF_SPEC,
    itochu: ITC_SPEC,
    bolton: BOL_SPEC,
    jais: JAI_SPEC,
    frabelle: FRA_SPEC,
    jealsa: JEA_SPEC,
    nauterra: NAU_SPEC,
    starkist: SK_SPEC,
    dongwon: DW_SPEC,
    sajo: SJ_SPEC,
    bumblebee: BB_SPEC,
    umios: UM_SPEC,
    kyokuyo: KY_SPEC,
    seavalue: SV_SPEC,
    nissui: NS_SPEC,
    centurypacific: CP_SPEC,
    boltonfood: BF_SPEC,
    trimarine: TM_SPEC,
    princes: PR_SPEC,
    iot: IOT_SPEC,
    ati: ATI_SPEC,
    nirsa: NIRSA_SPEC,
    eurofish: EUROFISH_SPEC,
    tecopesca: TECOPESCA_SPEC,
  };
  const spec = SPECS[selected] ?? SPEC;

  return (
    <div className={galleryStyles.wrap}>
      <button
        type="button"
        className={galleryStyles.backBtn}
        onClick={() => setSelected(null)}
      >
        ← 회사 선택
      </button>
      <CommodityIndustryDashboard spec={{ ...spec, stageNoun: '절' }} />
    </div>
  );
}
