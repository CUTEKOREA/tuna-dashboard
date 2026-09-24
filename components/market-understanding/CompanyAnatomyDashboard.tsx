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
import {
  dongwonfnbMeta, dongwonfnbStats, dongwonfnbSourceNotes,
  ownPlantSharePct, rawPriceChange2025Pct, generalFoodOpChangePct,
} from '@/lib/data/company-dongwonfnb';
import {
  hagoromoMeta, hagoromoStats, hagoromoSourceNotes,
  itochuSalesSharePct, tradingHousesSharePct, pbMultiple,
} from '@/lib/data/company-hagoromo';
import {
  cnfcMeta, cnfcStats, cnfcSourceNotes,
  tunaSharePct, tunaLossWan, subsidyToProfit,
} from '@/lib/data/company-cnfc';
import {
  kaichuangMeta, kaichuangStats, kaichuangSourceNotes,
  canGrossShare, adToCanGross, panPacificShare, alboShare,
} from '@/lib/data/company-kaichuang';
import {
  allianceMeta, allianceStats, allianceSourceNotes,
  revenueMultiple, operatingCashFlowMn, dilutionPoints,
} from '@/lib/data/company-alliance';
import {
  herdezMeta, herdezStats, herdezSourceNotes,
  soldPlantThroughput, drainedShortfallPct, priceRatioVsDolores,
} from '@/lib/data/company-herdez';
import {
  sajoseafoodMeta, sajoseafoodStats, sajoseafoodSourceNotes,
  processedToAssetRatio, affiliateShare2025,
} from '@/lib/data/company-sajoseafood';
import {
  garavillaMeta, garavillaStats, garavillaSourceNotes,
  fleetEnergyRatio, authorizedCasesShift,
} from '@/lib/data/company-garavilla';
import {
  salicaMeta, salicaStats, salicaSourceNotes,
  ecuadorHeadcountShare, permitVsInput,
} from '@/lib/data/company-salica';
import {
  majesticMeta, majesticStats, majesticSourceNotes,
  capacityValues, nationalGrowth,
} from '@/lib/data/company-majestic';
import {
  scaMeta, scaStats, scaSourceNotes,
  twoEntities, bookValueGap,
} from '@/lib/data/company-sca';
import {
  ghanaMeta, ghanaStats, ghanaSourceNotes,
  ownershipDepth, purchaseTurn,
} from '@/lib/data/company-ghana';
import {
  azoresMeta, azoresStats, azoresSourceNotes,
  regionalSpectrum, regionalTonnes2024,
} from '@/lib/data/company-azores';
import {
  togMeta, togStats, togSourceNotes,
  halfHalf, customsGap,
} from '@/lib/data/company-tog';
import {
  mauritiusMeta, mauritiusStats, mauritiusSourceNotes,
  equityBasis, shareGap, restatedRows,
} from '@/lib/data/company-mauritius';
import {
  galapescaMeta, galapescaStats, galapescaSourceNotes,
  leases, ownedVsLeased, production,
} from '@/lib/data/company-galapesca';
import {
  cosiMeta, cosiStats, cosiSourceNotes,
  settlements, share, parentUs,
} from '@/lib/data/company-cosi';
import {
  kingfisherMeta, kingfisherStats, kingfisherSourceNotes,
  voting, plants, certs,
} from '@/lib/data/company-kingfisher';
import {
  capsenMeta, capsenStats, capsenSourceNotes,
  ceiling, fleet, certification, ledger,
} from '@/lib/data/company-capsen';
import {
  rdMeta, rdStats, rdSourceNotes,
  gates as rdGates, madang as rdMadang, courts as rdCourts,
  promises as rdPromises, shelf as rdShelf,
} from '@/lib/data/company-rd';
import {
  soltunaMeta, soltunaSourceNotes,
  equity as stEquity, handles as stHandles, europe as stEurope, plant as stPlant,
} from '@/lib/data/company-soltuna';
import {
  bountyMeta, bountyStats, bountySourceNotes,
  registry as bountyRegistry, money as bountyMoney,
  registers as bountyRegisters, context as bountyContext, shelf as bountyShelf,
} from '@/lib/data/company-bounty';


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
  멕시코: { flagSrc: '/flags/mx.svg', backInk: '#123b2a' },
  미국: { flagSrc: '/flags/us.svg', backInk: '#1b2733' },
  한국: { flagSrc: '/flags/kr.svg', backInk: '#1b2733' },
  중국: { flagSrc: '/flags/cn.svg', backInk: '#1b2733' },
  이탈리아: { flagSrc: '/flags/it.svg', backInk: '#f4f5f0' },
  싱가포르: { flagSrc: '/flags/sg.svg', backInk: '#1b2733' },
  영국: { flagSrc: '/flags/gb.svg', backInk: '#f4f5f0' },
  세이셸: { flagSrc: '/flags/sc.svg', backInk: '#f4f5f0' },
  인도네시아: { flagSrc: '/flags/id.svg', backInk: '#1b2733' },
  에콰도르: { flagSrc: '/flags/ec.svg', backInk: '#1b2733' },
  파푸아뉴기니: { flagSrc: '/flags/pg.svg', backInk: '#f4f5f0' },
  세네갈: { flagSrc: '/flags/sn.svg', backInk: '#f4f5f0' },
  가나: { flagSrc: '/flags/gh.svg', backInk: '#1b2733' },
  포르투갈: { flagSrc: '/flags/pt.svg', backInk: '#1b2733' },
  코트디부아르: { flagSrc: '/flags/ci.svg', backInk: '#f4f5f0' },
  모리셔스: { flagSrc: '/flags/mu.svg', backInk: '#f4f5f0' },
  솔로몬제도: { flagSrc: '/flags/sb.svg', backInk: '#f4f5f0' },
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

const DONGWONFNB_ACCENT = '#b23a48';

const DONGWONFNB_SPEC: CommoditySpec = {
  key: 'company-anatomy-dongwonfnb',
  title: '기업 해부: 동원F&B',
  subtitle:
    '1982년 동원산업이 국내에 처음 낸 참치캔 사업을 2000년 인적분할로 넘겨받은 회사다. 연결 매출 4조 8,777억 원의 식품·유통 회사지만, 한국신용평가는 2024년 별도 영업이익의 47%가 참치캔에서 나왔다고 본다. ' +
    '원료 일부를 모회사 동원산업에서 사고(2025년 1,172억 원, 품목 미기재), 동원 브랜드 캔의 45%는 다른 회사 공장에서 나온다. 2025년 7월 동원산업의 완전자회사가 되어 상장폐지됐고, 공모사채가 남아 공시는 계속한다.',
  accent: DONGWONFNB_ACCENT,
  primaryKpi: {
    label: '2024년 별도 영업이익 중 참치캔 몫 (한국신용평가 평가서)',
    value: dongwonfnbStats.참치캔_별도_영업이익몫_2024_pct,
    decimals: 0,
    unit: `(% · 같은 해 매출 몫 ${dongwonfnbStats.참치캔_별도_매출몫_2024_pct}% · 사업보고서에는 참치캔 단독 이익이 없다)`,
    accent: DONGWONFNB_ACCENT,
  },
  secondaryKpis: [
    { label: '참치캔 시장점유율 2025 (닐슨, 사업보고서)', value: dongwonfnbStats.점유율_2025_pct, decimals: 1, unit: `(% · 2022년 ${dongwonfnbStats.점유율_2022_pct}%)` },
    { label: '수산물 원재료 단가 변화 2024 → 2025', value: rawPriceChange2025Pct(), decimals: 1, unit: '(% · 원/kg, 사업보고서)' },
    { label: '2024 동원 브랜드 캔 중 창원 자기 공장 몫', value: ownPlantSharePct(), decimals: 1, unit: '(% · 식품안전나라 생산실적 품목명 기준)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '이익',
      title: '매출 20%, 영업이익 47%',
      body: `2024년 별도 기준(평가서). 2025년 일반식품 영업이익 ${generalFoodOpChangePct()}% — 회사는 「고환율에 따른 원부재료 구매단가 급등」을 들었다`,
    },
    {
      eyebrow: '원료',
      title: '모회사 동원산업에서 1,172억 원',
      body: '2025년 특수관계자 매입. 수산물 원재료 단가 kg당 2,580원 → 2,949원 → 3,054원(2026 상반기)',
    },
    {
      eyebrow: '생산',
      title: '동원 캔의 45%는 다른 회사 공장',
      body: '2024년 동원 브랜드 캔 38,135 t 중 창원 21,032 t. 삼진물산(목포)·신진물산(함안)이 나머지를 만든다',
    },
    {
      eyebrow: '가격',
      title: '가격 인상 네 번, 용량 축소 한 번',
      body: '출고가 2021-12·2022-12 인상과 2026-09 인상 보도, 편의점가 2022-08, 2023년 편의점 100 g → 90 g. 라이트스탠다드 150 g은 kg당 18,667원',
    },
  ],
  briefing: proseBriefing('dongwonfnb'),
  narratives: inlineReport('dongwonfnb', proseStages('dongwonfnb')),
  chartSlots: {},
  continuous: true,
  sourceNotes: dongwonfnbSourceNotes,
  sourceMeta: [
    `${dongwonfnbMeta.회사} · ${dongwonfnbMeta.국가} · ${dongwonfnbMeta.업종}`,
    `출처 ${dongwonfnbMeta.출처}`,
    `조사 ${dongwonfnbMeta.조사일}`,
  ].join(' · '),
};

const HAGOROMO_ACCENT = '#2f6f8f';

const HAGOROMO_SPEC: CommoditySpec = {
  key: 'company-anatomy-hagoromo',
  title: '기업 해부: はごろもフーズ',
  subtitle:
    '1958년 참치 기름절임 캔의 이름 「シーチキン」을 상표로 등록한 시즈오카 회사다. 2026년 3월기 연결 매출 750.8억 엔의 47.0%가 참치 제품이지만, 자사 참치캔 공장은 焼津와 新清水 두 곳이고 전 제품을 통틀어 약 70곳 협력공장에 제조를 맡긴다. ' +
    '공시에 이름이 나오는 참치 위탁처는 伊藤忠商事가 47%, 하고로모가 33%를 가진 인도네시아 PT Aneka Tuna 하나이고, 그 매입(62억 792만 엔)은 전량 伊藤忠을 거쳐 伊藤忠의 견적을 검토해 값을 정한다. 같은 해 하고로모 매출의 32.0%는 伊藤忠으로 나갔다.',
  accent: HAGOROMO_ACCENT,
  primaryKpi: {
    label: '2026년 3월기 연결 매출 중 「ツナ等」 몫 (유가증권보고서)',
    value: hagoromoStats.ツナ等_비중_FY26_pct,
    decimals: 1,
    unit: `(% · 2023년 3월기 ${hagoromoStats.ツナ等_비중_FY23_pct}%에서 3년 연속 상승)`,
    accent: HAGOROMO_ACCENT,
  },
  secondaryKpis: [
    { label: '연결 매출 중 伊藤忠商事 앞 몫 (전 제품)', value: itochuSalesSharePct(), decimals: 1, unit: `(% · 상사 세 곳 합 ${tradingHousesSharePct()}%)` },
    { label: 'PT Aneka Tuna 제품 매입 2026년 3월기', value: hagoromoStats.ATI_매입_FY26_jpy_k / 1e5, decimals: 1, unit: '(억 엔 · 전량 伊藤忠 경유, 지분 33.0%)' },
    { label: 'L 플레이크 70 g 세 캔 kg당 값 ÷ 이온 자체상표', value: pbMultiple(), decimals: 2, unit: '(배 · 소매 페이지 2026-09, 순중량 기준)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '구조',
      title: '자사 캔 공장 둘, 협력공장 약 70곳',
      body: '焼津·新清水 장부가 46억 4,829만 엔·180명. 70곳은 디저트·파스타를 포함한 전 제품 기준이고 참치 위탁처 수는 공시에 없다',
    },
    {
      eyebrow: '상사',
      title: '伊藤忠이 매입과 매출 양쪽에',
      body: 'PT Aneka Tuna 제품 매입은 伊藤忠 경유·伊藤忠 견적을 검토해 결정. 伊藤忠 앞 매출은 연결의 32.0%(전 제품)',
    },
    {
      eyebrow: '재무',
      title: '영업손실 11억 엔에서 영업이익 31억 엔으로',
      body: '2023년 3월기 → 2026년 3월기. 회사는 매출총이익 증가와 판매장려금 감소를 들었다. 원료가·엔저 영향 금액은 공시에 없다',
    },
    {
      eyebrow: '가격',
      title: '2022년 이후 다섯 번 인상',
      body: '2026-08-01 시치킨 가정용 80품목 6.7~25.0%·업무용 32품목 9.2~33.3%. 같은 날 발효한 EPA 무관세와 잇는 공시는 없다',
    },
  ],
  briefing: proseBriefing('hagoromo'),
  narratives: inlineReport('hagoromo', proseStages('hagoromo')),
  chartSlots: {},
  continuous: true,
  sourceNotes: hagoromoSourceNotes,
  sourceMeta: [
    `${hagoromoMeta.회사} · ${hagoromoMeta.국가} · ${hagoromoMeta.업종}`,
    `출처 ${hagoromoMeta.출처}`,
    `조사 ${hagoromoMeta.조사일}`,
  ].join(' · '),
};

const CNFC_ACCENT = '#a33a2c';

const CNFC_SPEC: CommoditySpec = {
  key: 'company-anatomy-cnfc',
  title: '기업 해부: 中水集团远洋',
  subtitle:
    '중국 국유 원양어업 그룹 中国农业发展集团의 선전 상장 자회사다. 캔공장 표에 이름이 올랐지만 2023~2025 연보와 2026 반기보고서에 「罐」 자가 한 번도 없고, 참치 이름이 붙은 가공 설비는 냉동 날개다랑어 로인을 만드는 저우산 초저온 가공센터 하나다. ' +
    '캔 계획이 확인되는 곳은 바누아투 합작 Sino-Van(中瓦渔业 51%) 하나이고 캔 생산에 이르지 못했다. 2025년 참치 매출 7억 7,669만 위안은 원가보다 5,405만 위안 적었고, 같은 해 수익 관련 정부보조금 2억 6,656만 위안이 순이익보다 컸다.',
  accent: CNFC_ACCENT,
  primaryKpi: {
    label: '2025년 참치 매출총이익률 (연결, 연보 分产品 표)',
    value: cnfcStats.참치_이익률_2025_pct,
    decimals: 2,
    unit: `(% · 2023 ${cnfcStats.참치_이익률_2023_pct}% · 2024 ${cnfcStats.참치_이익률_2024_pct}% · 2026 상반기 ${cnfcStats.참치_이익률_2026H1_pct}%)`,
    accent: CNFC_ACCENT,
  },
  secondaryKpis: [
    { label: '2025 연결 매출 중 참치 몫', value: tunaSharePct(), decimals: 2, unit: '(% · 자기 배로 잡은 참치)' },
    { label: '수익 관련 정부보조금 ÷ 순이익 (2025)', value: subsidyToProfit(), decimals: 2, unit: '(배 · 회사는 보조금을 경상 손익으로 분류, 비경상 125만 위안)' },
    { label: 'RFMO 등록부 소유 선박', value: cnfcStats.등록부_선박, decimals: 0, unit: '(척 · 68행에서 기구 간 중복 제외 · 전부 연승)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '구조',
      title: '연보 네 권에 「罐」 0회',
      body: '참치 이름이 붙은 가공 설비는 저우산 연구개발가공센터(냉동 날개다랑어 로인, 2025 실현 이익 13만 위안) 하나. 캔 계획은 바누아투 Sino-Van에만 있었다',
    },
    {
      eyebrow: '이익',
      title: `참치 원가가 매출보다 ${tunaLossWan().toLocaleString('ko-KR')}만 위안 많았다`,
      body: '2025년. 손실은 상장사 개별(母公司)의 연승 참치에서 나고(−19.49%), 자회사 몫은 네 기간 모두 흑자(계산)',
    },
    {
      eyebrow: '보조금',
      title: '세 해 연속 보조금이 순이익보다 컸다',
      body: '2025년 수익 관련 보조금 2억 6,656만 위안 대 순이익 1억 4,161만 위안. 2026 상반기 이익은 6월에 들어온 보조금 때문에 부풀어 보인다',
    },
    {
      eyebrow: '선단',
      title: '중국 선적 소유사 가운데 등록부 1위',
      body: 'RFMO 등록부 소유 명의 61척(2위 30척). 새 예산 9,600만 위안도 고위도 초저온 참치 연승선이다',
    },
  ],
  briefing: proseBriefing('cnfc'),
  narratives: inlineReport('cnfc', proseStages('cnfc')),
  chartSlots: {},
  continuous: true,
  sourceNotes: cnfcSourceNotes,
  sourceMeta: [
    `${cnfcMeta.회사} · ${cnfcMeta.국가} · ${cnfcMeta.업종}`,
    `출처 ${cnfcMeta.출처}`,
    `조사 ${cnfcMeta.조사일}`,
  ].join(' · '),
};

const KAICHUANG_ACCENT = '#1f6f8b';

const KAICHUANG_SPEC: CommoditySpec = {
  key: 'company-anatomy-kaichuang',
  title: '기업 해부: 上海开创',
  subtitle:
    '상하이 국유 식품그룹 光明食品의 원양어업 상장사다. 중서부태평양 선망선이 2025년 참치 88,561 t을 잡았고, 스페인 참치캔 브랜드 Albo를 100% 갖고 있다. ' +
    '2025년 캔은 주영업 매출총이익의 52.48%를 냈지만 같은 해 광고·판촉비가 그 78.25%였고, 연결 순이익의 68.96%는 마셜제도 선적 선망선을 가진 손자회사 泛太渔业에 잡혔다. 선단의 참치가 Albo 캔으로 간다는 문장은 연보에 없다.',
  accent: KAICHUANG_ACCENT,
  primaryKpi: {
    label: '2025년 주영업 매출총이익 가운데 캔(罐头食品) 몫 (연결 제품별 표, 계산)',
    value: canGrossShare(),
    decimals: 2,
    unit: '(% · 캔 매출은 연결 매출의 34.9%)',
    accent: KAICHUANG_ACCENT,
  },
  secondaryKpis: [
    { label: '광고·판촉비 ÷ 캔 매출총이익 (2025)', value: adToCanGross(), decimals: 2, unit: '(% · 광고·판촉비 2억 8,397만 위안)' },
    { label: '연결 순이익 가운데 泛太渔业 몫 (2025)', value: panPacificShare(), decimals: 2, unit: `(% · Albo 몫 ${alboShare()}% · 내부거래 보정 없음)` },
    { label: 'RFMO 등록부 선망선', value: kaichuangStats.등록부_선망_중국 + kaichuangStats.등록부_선망_마셜, decimals: 0, unit: '(척 · 중국 선적 6·마셜 선적 6 · 2척은 지배주주 소유 임차)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '구조',
      title: '매출총이익의 과반은 스페인 캔',
      body: '2025년 캔 매출 8억 1,635만 위안, 매출총이익 3억 6,291만 위안. 같은 해 Albo 순이익은 1,924만 위안이었다',
    },
    {
      eyebrow: '이익',
      title: '연결 순이익의 7할만큼을 마셜 선적 선망선 법인이 번다',
      body: '泛太渔业(Pan Pacific Fishing RMI) 순이익 5,382만 위안 — 연결 순이익 7,805만 위안의 68.96%(계산). 2024년에도 68.19%',
    },
    {
      eyebrow: '원료',
      title: '선단 참치가 Albo로 간다는 문장은 연보에 없다',
      body: '2023년 참치 판매의 98.75%가 중국 내 판매. Atuna가 전한 Albo행 중국산 원어는 대부분 연승 날개다랑어다',
    },
    {
      eyebrow: '매대',
      title: '같은 매장 같은 규격에서 자체상표의 2.29배',
      body: 'El Corte Inglés 온라인 슈퍼, Albo 황다랑어 올리브유 82 g(물뺀) 3.66유로 대 자체상표 1.60유로(2026-09-12)',
    },
  ],
  briefing: proseBriefing('kaichuang'),
  narratives: inlineReport('kaichuang', proseStages('kaichuang')),
  chartSlots: {},
  continuous: true,
  sourceNotes: kaichuangSourceNotes,
  sourceMeta: [
    `${kaichuangMeta.회사} · ${kaichuangMeta.국가} · ${kaichuangMeta.업종}`,
    `출처 ${kaichuangMeta.출처}`,
    `조사 ${kaichuangMeta.조사일}`,
  ].join(' · '),
};

const ALLIANCE_ACCENT = '#2f6f4f';

const ALLIANCE_SPEC: CommoditySpec = {
  key: 'company-anatomy-alliance',
  title: '기업 해부: Alliance Select',
  subtitle:
    '필리핀 제너럴산토스에서 남의 브랜드를 붙인 캔참치를 만드는 상장사다. 2025년 매출 7,882만 달러의 92.8%가 캔참치이고 자기 어선은 공시에 없다. ' +
    '매출은 2022년 3,458만 달러에서 2.28배가 됐지만 매출총이익률은 11.10%(2024)에서 6.80%로 내려갔고 2025년 영업활동 현금흐름은 −1,578만 달러다. 2026년 6월 사장이 사임했고 9월 2일 이사회가 감자와 모회사 인수 ₱6억 6,000만을 의결했다.',
  accent: ALLIANCE_ACCENT,
  primaryKpi: {
    label: '2025년 매출총이익률 (연결, 계산)',
    value: allianceStats.매출총이익률_2025_pct,
    decimals: 2,
    unit: `(% · 2024년 ${allianceStats.매출총이익률_2024_pct}%에서 하락)`,
    accent: ALLIANCE_ACCENT,
  },
  secondaryKpis: [
    { label: '2025년 영업활동 현금흐름', value: operatingCashFlowMn(), decimals: 2, unit: '(백만 달러 · 매출채권과 공급자 선급금이 늘었다)' },
    { label: '매출 배수 (2022 → 2025)', value: revenueMultiple(), decimals: 2, unit: '(배 · 3,458만 → 7,882만 달러)' },
    { label: '모회사 증자 뒤 지분', value: allianceStats.증자후_지분_pct, decimals: 1, unit: `(% · 현재 ${allianceStats.Strongoak_지분_pct}% · 주주총회·규제 승인 조건부)` },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '현금',
      title: '매출은 2.3배, 현금은 반대로',
      body: '2025년 영업활동 현금흐름 −1,578만 달러. 매출채권 +72%·공급자 선급금 +93%가 가져갔고 만기 4~11개월 무역금융 3,670만 달러가 메웠다',
    },
    {
      eyebrow: '2026년',
      title: '공장이 멈춘 것은 두 번이고 첫 번째는 지진이 아니다',
      body: '1월 연례정비 연장으로 1분기 매출 −54%, 6월 8일 지진이 2분기를 덮쳤다. 상반기 순손실 716만 달러 중 36%가 지진 전(계산)',
    },
    {
      eyebrow: '지배',
      title: '55%가 87%로 불어나는 안',
      body: '액면 ₱0.50 → ₱0.10 감자와 결손금 상계, 모회사 Strongoak의 60억 주 인수 ₱6억 6,000만. 특별주주총회 2026-10-15',
    },
    {
      eyebrow: '공장',
      title: '한 부지에 캔·어분·연어',
      body: '제너럴산토스 68,751 ㎡ · 처리량 102 t/일(2025) · 가동률 81%(2024) · 총원 1,937명 중 정규직 123명',
    },
  ],
  briefing: proseBriefing('alliance'),
  narratives: inlineReport('alliance', proseStages('alliance')),
  chartSlots: {},
  continuous: true,
  sourceNotes: allianceSourceNotes,
  sourceMeta: [
    `${allianceMeta.회사} · ${allianceMeta.국가} · ${allianceMeta.업종}`,
    `출처 ${allianceMeta.출처}`,
    `조사 ${allianceMeta.조사일}`,
  ].join(' · '),
};

const HERDEZ_ACCENT = '#9c4f2f';

const HERDEZ_SPEC: CommoditySpec = {
  key: 'company-anatomy-herdez',
  title: '기업 해부: Grupo Herdez',
  subtitle:
    '멕시코 가공식품 상장사다. 2020년 7월 29일 합작사 Herdez Del Fuerte가 참치 어선과 조업장비, 치아파스 가공·포장 공장, 「Nair」 상표권을 팔았다. ' +
    '「Herdez」 브랜드 참치는 제3자 위탁 생산으로 바꿔 유통과 판매만 남겼고, 그 뒤 현행 공시 열 권에 「atún」이 0회다. 2024년 연방소비자보호청 조사에서 이 브랜드 130 g 캔의 배수중량은 표시 90 g에 실측 83 g이었고, 그 공장을 사 간 회사의 Nair는 전 항목 적합이었다.',
  accent: HERDEZ_ACCENT,
  primaryKpi: {
    label: '판 공장의 연간 설비용량 (2019년, 매각 전)',
    value: herdezStats.판_공장_설비용량_t,
    decimals: 0,
    unit: `(t · 가동률 ${herdezStats.판_공장_가동률_pct}% · 환산 처리량 ${soldPlantThroughput().toLocaleString('ko-KR')} t)`,
    accent: HERDEZ_ACCENT,
  },
  secondaryKpis: [
    { label: '현행 공시 열 권의 「atún」', value: herdezStats.atun_출현_현행공시, decimals: 0, unit: '(회 · 통합보고서·감사재무제표·분기보고서·컨퍼런스콜 포함)' },
    { label: '배수중량 실측 미달률 (130 g, 2024년 정부 조사)', value: drainedShortfallPct(), decimals: 1, unit: `(% · 표시 ${herdezStats.표시_배수중량_g} g → 실측 ${herdezStats.실측_배수중량_g} g)` },
    { label: '통조림 카테고리 비중 (FY2025)', value: herdezStats.Enlatados_비중_pct, decimals: 1, unit: '(% · 참치 단독 수치는 공시에 없다 — 이 값이 상한)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '매각',
      title: '선단·공장·상표를 한꺼번에 넘겼다',
      body: '2020-07-29 두 회사 동시 공시. 남긴 것은 브랜드와 매대 자리이고 생산은 「maquilados por terceros」 — 제조사 상호는 공시에 없다',
    },
    {
      eyebrow: '공시',
      title: '판 뒤로 참치가 문서에서 사라졌다',
      body: '현행 공시 열 권에 「atún」 0회. 회사가 남긴 마지막 참치 수치는 2019년 Nair의 연결 순매출 1.4%이고 그것도 판 브랜드 몫이다',
    },
    {
      eyebrow: '표시',
      title: '표시 90 g, 실측 83 g',
      body: '연방소비자보호청 2024년 조사 52종 중 배수중량 미달 7건에 Herdez 2건. 그 공장을 사 간 회사의 Nair(대두 0%)는 전 항목 적합',
    },
    {
      eyebrow: '매대',
      title: '기본 라인에서 가장 비싼 자리',
      body: `100 g당 Herdez 18.5페소 대 Dolores 15.7·Tuny 15.0페소(${priceRatioVsDolores()}배). 고체 프리미엄 라인은 그 위에 따로 있다`,
    },
  ],
  briefing: proseBriefing('herdez'),
  narratives: inlineReport('herdez', proseStages('herdez')),
  chartSlots: {},
  continuous: true,
  sourceNotes: herdezSourceNotes,
  sourceMeta: [
    `${herdezMeta.회사} · ${herdezMeta.국가} · ${herdezMeta.업종}`,
    `출처 ${herdezMeta.출처}`,
    `조사 ${herdezMeta.조사일}`,
  ].join(' · '),
};

const SAJOSEAFOOD_ACCENT = '#1f6f8b';

const SAJOSEAFOOD_SPEC: CommoditySpec = {
  key: 'company-anatomy-sajoseafood',
  title: '기업 해부: 사조씨푸드',
  subtitle:
    '유가증권시장 014710. 참치 매출 1,465억 7,640만 원(별도 매출의 67.41%)을 내는 수산물가공유통 부문의 설비 장부가가 2025년 말 3억 5,962만 원이고 그 부문에는 토지도 건물도 한 줄이 없다. ' +
    '라인을 거치는 가공품 822억 8,654만 원만 놓아도 228.8배다. 부산 냉동창고 777㎡의 그해 임차료 3억 6,942만 원이 그 부문 전 자산의 장부가보다 크고, 가공용 원어의 94.9%는 사조산업·사조오양에서 온다. 원가를 정하는 것은 설비가 아니라 조달 계약이다.',
  accent: SAJOSEAFOOD_ACCENT,
  primaryKpi: {
    label: '가공품 매출 대 그 부문 설비 장부가 (2025)',
    value: processedToAssetRatio(),
    decimals: 1,
    unit: `(배 · 가공품 ${sajoseafoodStats.가공품_매출_2025.toLocaleString('ko-KR')}천원 ÷ 설비 ${sajoseafoodStats.부문_설비_장부가_2025.toLocaleString('ko-KR')}천원)`,
    accent: SAJOSEAFOOD_ACCENT,
  },
  secondaryKpis: [
    { label: '참치 매출 비중 (2025, 별도 기준)', value: sajoseafoodStats.참치_비중_별도_pct, decimals: 2, unit: `(% · 1,465억 7,640만 원 ÷ 별도 매출 — 연결 기준이면 ${sajoseafoodStats.참치_비중_연결_pct}%)` },
    { label: '가공용 원어의 계열 몫 (2025)', value: affiliateShare2025(), decimals: 1, unit: '(% · 사조산업 + 사조오양 ÷ 부문 원재료 매입 711억 2,778만 원)' },
    { label: '가동률 (2025, 수산물가공유통)', value: sajoseafoodStats.가동률_2025_pct, decimals: 2, unit: `(% · ${sajoseafoodStats.가동시간_2025_hr.toLocaleString('ko-KR')}시간 ÷ 정규 ${sajoseafoodStats.정규시간_2025_hr.toLocaleString('ko-KR')}시간 — 분모는 8시간 × 259일 가정)` },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '자산',
      title: '참치 1,466억 옆의 설비 3억 5,962만',
      body: '그 부문에 토지도 건물도 없다. 라인을 거치는 가공품 822억 8,654만 원만 놓아도 228.8배이고, 상품 508억은 사서 되파는 것이다',
    },
    {
      eyebrow: '임차',
      title: '설비보다 임차료가 크다',
      body: '부산 냉동창고 777㎡를 최대주주 사조산업에서 빌리고 2025년 임차료가 3억 6,942만 원 — 그 부문 전 자산의 장부가보다 크다',
    },
    {
      eyebrow: '조달',
      title: '가공용 원어의 94.9%가 계열에서 온다',
      body: '다만 매끄러운 상승이 아니다 — 2023년 81.8%에서 2024년 94.4%로 12.6포인트 뛰었고 2026년 상반기에는 91.3%로 내려갔다',
    },
    {
      eyebrow: '명판',
      title: '가동률 105.74%의 분모는 행정 숫자다',
      body: '분모 2,072시간은 259일 가정이고 같은 표의 능력 6,336톤은 264일 가정이다. 물량으로 재면 7,583 ÷ 6,336 = 119.7%다',
    },
  ],
  briefing: proseBriefing('sajoseafood'),
  narratives: inlineReport('sajoseafood', proseStages('sajoseafood')),
  chartSlots: {},
  continuous: true,
  sourceNotes: sajoseafoodSourceNotes,
  sourceMeta: [
    `${sajoseafoodMeta.회사} · ${sajoseafoodMeta.국가} · ${sajoseafoodMeta.업종}`,
    `출처 ${sajoseafoodMeta.출처}`,
    `조사 ${sajoseafoodMeta.조사일}`,
  ].join(' · '),
};

const GARAVILLA_ACCENT = '#0e6b7a';

const GARAVILLA_SPEC: CommoditySpec = {
  key: 'company-anatomy-garavilla',
  title: '기업 해부: Conservas Garavilla',
  subtitle:
    '브랜드 Isabel. 공장 넷 가운데 라인 수와 분당 캔 수와 보일러 형식번호까지 읽히는 곳은 오 그로베 하나다 — 회사가 밝혀서가 아니라 갈리시아 통합환경허가가 공정 전체를 한 문서에 그리는 유일한 제도이기 때문이다. ' +
    '만타의 에콰도르 ARCSA는 회수 결의로, 아가디르의 모로코 ONSSA는 위생승인 번호로 말한다. 사건과 번호는 주지만 도면은 주지 않는다. 그래서 사람이 가장 많은 공장(만타 1,799.00명)이 가장 얇게 보이고, 탄소는 공장이 아니라 선망 4척에 있다.',
  accent: GARAVILLA_ACCENT,
  primaryKpi: {
    label: '선망 4척 대 공장 넷의 에너지 (2022)',
    value: fleetEnergyRatio(),
    decimals: 2,
    unit: `(배 · 선단 ${Number(garavillaStats.에너지_선단_2022_GJ).toLocaleString('ko-KR')} GJ ÷ 공장 237,070.59 GJ · 절사)`,
    accent: GARAVILLA_ACCENT,
  },
  secondaryKpis: [
    { label: '오 그로베 인가 캔상자 증가 (2024 → 2025)', value: authorizedCasesShift().증가율, decimals: 1, unit: `(% · ${authorizedCasesShift()[2024].toLocaleString('ko-KR')} → ${authorizedCasesShift()[2025].toLocaleString('ko-KR')}상자 — 늘어난 자리는 전부 고등어다)` },
    { label: '2025년 인가 물량의 고등어 몫', value: Number(garavillaStats.인가_캔상자_고등어_비중_pct), decimals: 1, unit: '(% · 1,666,667상자 ÷ 6,744,212상자 — 참치 인가 능력 3,910,568상자는 개편 전후가 같다)' },
    { label: '선단 배출 대 공장 넷 배출 (2025)', value: Number(garavillaStats.배출_선단_2025_tCO2eq), decimals: 0, unit: '(tCO2eq · 공장 넷 합 20,023 — 오 그로베 2,778 · 카보 데 크루스 663 · 만타 11,692 · 아가디르 4,890)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '제도',
      title: '도면을 가진 제도는 IPPC 하나뿐이다',
      body: '오 그로베만 부지 44,131 ㎡·보일러 3×5.22 MWt·방류 821,250 ㎥가 관보에 찍힌다. 만타·아가디르는 사건번호와 승인번호만 준다',
    },
    {
      eyebrow: '라인',
      title: '라인은 15 → 9인데 참치 능력은 그대로다',
      body: '참치를 다루던 라인이 13개에서 5개로 줄었는데 참치 인가 생산능력은 3,910,568상자로 같다. 늘어난 인가 물량은 전부 고등어다',
    },
    {
      eyebrow: '무게',
      title: '사람은 만타, 탄소는 배, 문서는 오 그로베',
      body: '만타 1,799.00명이 가장 얇게 보이고, 선망 4척이 2022년 에너지로 공장 넷의 2.39배를 태운다',
    },
    {
      eyebrow: '2025',
      title: '합병이 아니라 한 해에 겹친 세 갈래다',
      body: '4/3 본점 빌바오 이전 · 5/6 상표 네 건이 Bolton Food S.p.A.로 · 9/16 단독주주 선언 · 12/23 이사회 교체. 합병 공고는 어느 관보에도 0건이다',
    },
  ],
  briefing: proseBriefing('garavilla'),
  narratives: inlineReport('garavilla', proseStages('garavilla')),
  chartSlots: {},
  continuous: true,
  sourceNotes: garavillaSourceNotes,
  sourceMeta: [
    `${garavillaMeta.회사} · ${garavillaMeta.국가} · ${garavillaMeta.업종}`,
    `출처 ${garavillaMeta.출처}`,
    `조사 ${garavillaMeta.조사일}`,
  ].join(' · '),
};

const SALICA_ACCENT = '#8a4b1f';

const SALICA_SPEC: CommoditySpec = {
  key: 'company-anatomy-salica',
  title: '기업 해부: Salica',
  subtitle:
    '문서의 두께를 정하는 것은 물량이 아니라 문턱이다. 사람이 가장 적은 베르메오 공장(2025년 138명)은 유럽 산업배출지침 범주에 걸려 통합환경허가 AAI00228이 부지 18,150 ㎡와 굴뚝 높이 10.5 m와 새벽 1시~6시 방류 금지까지 적고 12년 동안 정기검사를 다섯 번 받는다. ' +
    '아 포브라 두 카라미냘은 완제품 하루 21 t으로 문턱에 못 미쳐 갈리시아 허가 등록부에 아예 없고, 사람이 2,358명인 포소르하는 에콰도르 원장에 생산부 코드 PP-670 한 줄과 항만보안 등록 ECPSJ-0001로만 남는다. 감시의 밀도는 물량이 아니라 관할과 문턱이 정한다.',
  accent: SALICA_ACCENT,
  primaryKpi: {
    label: '세 공장 인원 가운데 에콰도르 몫 (2025)',
    value: ecuadorHeadcountShare(),
    decimals: 1,
    unit: `(% · ${salicaStats.인원_포소르하_2025.toLocaleString('ko-KR')}명 ÷ ${salicaStats.인원_3사합_2025.toLocaleString('ko-KR')}명 — 분모를 그룹 전체 ${salicaStats.인원_그룹_2025.toLocaleString('ko-KR')}명으로 놓으면 ${salicaStats.에콰도르_인원비중_그룹_pct}%다)`,
    accent: SALICA_ACCENT,
  },
  secondaryKpis: [
    {
      label: '베르메오 허가 능력 대 2022년 총투입',
      value: permitVsInput().비율,
      decimals: 1,
      unit: `(% · ${permitVsInput().투입2022.toLocaleString('ko-KR')} t ÷ ${permitVsInput().허가.toLocaleString('ko-KR')} t — ${permitVsInput().단서})`,
    },
    {
      label: '매출 가운데 에콰도르 몫 (2025)',
      value: Number(salicaStats.에콰도르_매출비중_총액_pct),
      decimals: 1,
      unit: `(% · 세 법인 총액 단순합 ${salicaStats.매출_3사합_2025_M유로} M€ 기준 · 내부거래 미제거 — 같은 보고서 본문은 ${salicaStats.본문_세공장_매출_M유로} M€로 적는다)`,
    },
    {
      label: '포소르하 역산 물량 증가 (2022 → 2025)',
      value: Number(salicaStats.포소르하_역산증가_pct),
      decimals: 0,
      unit: '(% · 6.4만 → 8.8만 t · 그룹 원단위로 되짚은 B등급 역산이다)',
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '문턱',
      title: '가장 작은 공장이 가장 두껍게 적힌다',
      body: '베르메오만 부지 18,150 ㎡·건축 12,224.59 ㎡·보일러 2기(굴뚝 10.5·12.5 m)·새벽 1~6시 방류 금지가 관보에 찍힌다. 사람은 셋 중 가장 적은 138명이다',
    },
    {
      eyebrow: '줄자',
      title: '48,015 나누기 5,838은 가동률이 아니다',
      body: '분자 48,015 t/년은 완제품 상한이고 분모 5,838 t은 캔과 세척제를 포함한 원료·부자재 총투입이다. 2024년 실제 참치 투입은 1,459 t이다',
    },
    {
      eyebrow: '자기 신고',
      title: '문턱 아래 공장의 자기 문서에 초과가 있다',
      body: '아 포브라는 허가 대상이 아닌데 회사 환경선언의 암모니아성 질소가 2021~2024년 46·33·36·37로 한도 30을 네 해 연속 넘는다 — 감시체계가 다른 것이지 더러운 것이 아니다',
    },
    {
      eyebrow: '순서',
      title: '통합을 발표하기 전에 상표를 놓았다',
      body: '유럽연합 SALICA 상표는 2025-05-25 만료, 유예는 2025-11-25에 끝났다. 「Albacora와 Salica를 하나로」라는 로고 발표는 그 다섯 달 뒤인 2026년 4월이고 합병 등기는 0건이다',
    },
  ],
  briefing: proseBriefing('salica'),
  narratives: inlineReport('salica', proseStages('salica')),
  chartSlots: {},
  continuous: true,
  sourceNotes: salicaSourceNotes,
  sourceMeta: [
    `${salicaMeta.회사} · ${salicaMeta.국가} · ${salicaMeta.업종}`,
    `출처 ${salicaMeta.출처}`,
    `조사 ${salicaMeta.조사일}`,
  ].join(' · '),
};

const MAJESTIC_ACCENT = '#7a5a2e';

const MAJESTIC_SPEC: CommoditySpec = {
  key: 'company-anatomy-majestic',
  title: '기업 해부: Majestic Seafood',
  subtitle:
    '값은 많고 실측은 하나다. 열세 해 동안 라에 말라항의 이 공장은 처리능력이 120·150·200·250·350·380·600 t/일 일곱 값으로, 고용이 800명에서 7,000명 사이 열한 값으로 적혔다. ' +
    '그런데 부지·건물 면적을 적은 원문이 0건이고 연도별 생산 실적을 적은 원문도 0건이다 — 설비 명세 열 칸 가운데 두 칸이 통째로 비는데 그 둘이 공장의 크기를 재는 칸이다. ' +
    '실제로 돌아간 날의 기록은 2019년 하나뿐이다(가용 250 가운데 하루 80 t). 2023년 6월에 멈춘 뒤에도 유럽연합 승인번호와 인증과 용선 세 척은 살아 있다 — 멈춘 것은 생산이다.',
  accent: MAJESTIC_ACCENT,
  primaryKpi: {
    label: '이 나라 참치 가공 생산 증가 (2023 → 2024, 계산)',
    value: nationalGrowth().계산증가율,
    decimals: 1,
    unit: `(% · ${nationalGrowth()[2023].toLocaleString('ko-KR')} t → ${nationalGrowth()[2024].toLocaleString('ko-KR')} t — 같은 발표문이 한 문장에 적은 값은 ${nationalGrowth().발표증가율}%다. 둘은 같이 성립하지 않는다)`,
    accent: MAJESTIC_ACCENT,
  },
  secondaryKpis: [
    {
      label: '본문이 세는 처리능력 값의 개수',
      value: capacityValues().개수,
      decimals: 0,
      unit: `(개 · ${capacityValues().값.join('·')} t/일 — 전부 계획·명판·전망이다. 실측은 ${capacityValues().실측연도}년 하루 ${capacityValues().실측} t 하나뿐이고 그때 가용은 ${capacityValues().가용}이었다)`,
    },
    {
      label: '본문이 세는 고용 값의 개수',
      value: Number(majesticStats.고용_값_개수),
      decimals: 0,
      unit: `(개 · ${Number(majesticStats.고용_최소_명).toLocaleString('ko-KR')}~${Number(majesticStats.고용_최대_명).toLocaleString('ko-KR')}명 — 폐쇄 시 파트너사 집계 ${Number(majesticStats.폐쇄시_파트너사집계_명).toLocaleString('ko-KR')}명 · 매체 ${Number(majesticStats.폐쇄시_매체_명).toLocaleString('ko-KR')} · 협회장 ${Number(majesticStats.폐쇄시_협회장_명).toLocaleString('ko-KR')})`,
    },
    {
      label: '부지 면적·연도별 생산 실적을 적은 원문',
      value: Number(majesticStats.면적_원문_건수) + Number(majesticStats.생산실적_원문_건수),
      decimals: 0,
      unit: `(건 · 설비 명세 ${majesticStats.설비명세_칸_수}칸 가운데 ${majesticStats.설비명세_빈칸_수}칸이 통째로 빈다 — 그 둘이 공장의 크기를 재는 칸이다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '산술',
      title: '한 문장 안에서 34%와 50.5%가 같이 선다',
      body: '재가동을 알린 발표문이 「34% 늘어 2023년 79,209 t에서 2024년 사상 최고 119,232 t」이라 적는다. 그 두 값의 산술은 +50.5%다(차이 40,023 t). 종전 최고는 2021년 117,483 t이다',
    },
    {
      eyebrow: '줄자',
      title: '350은 명판이고 실적은 80이다',
      body: '350을 실적으로 쓴 원문은 0건이다. 2013년 개장 때 1단계는 150이었고 2019년 명판은 250으로 내려가 있는데 그 사유를 적은 원문이 없다. 그해 실가동은 하루 80 t이다',
    },
    {
      eyebrow: '전망치',
      title: '「5,000명」은 전망치가 실적으로 굳은 것이다',
      body: '2012-08 「완전 가동이면 최소 5,000명」 → 2013-02 「최대」 → 2023-06 폐쇄 기사에서 실제 잉여 인원. 같은 사건에 파트너사는 1,300명, 협회장은 5,500명을 댄다',
    },
    {
      eyebrow: '서류',
      title: '생산은 멈췄고 등록은 살아 있다',
      body: '유럽연합 승인 07EPR5110이 가공시설로 유효하고 Friend of the Sea가 2029-04-14까지 붙어 있으며 용선 세 척이 2026년에도 이 이름으로 등록부에 있다 — 소유가 아니라 용선이고 기국은 확인되지 않는다',
    },
  ],
  briefing: proseBriefing('majestic'),
  narratives: inlineReport('majestic', proseStages('majestic')),
  chartSlots: {},
  continuous: true,
  sourceNotes: majesticSourceNotes,
  sourceMeta: [
    `${majesticMeta.회사} · ${majesticMeta.국가} · ${majesticMeta.업종}`,
    `출처 ${majesticMeta.출처}`,
    `조사 ${majesticMeta.조사일}`,
  ].join(' · '),
};

const SCA_ACCENT = '#0b6b3a';

const SCA_SPEC: CommoditySpec = {
  key: 'company-anatomy-sca',
  title: '기업 해부: S.C.A',
  subtitle:
    '같은 부두의 두 법인을 그룹 장부가 다르게 적는다. 세네갈 다카르 몰 10 부두에 한국 상장사의 법인이 둘 있다 — 고기를 잡는 CAPSEN과 통조림을 만드는 이 회사이고 대표이사가 같은 사람이다. ' +
    '지분은 이 회사가 60%로 더 많은데 장부가는 2014년에 0이 되어 열한 해째 그대로이고 「주요 종속회사」도 아니다. 지분 49%인 조업사는 연결 사유가 그룹에서 유일하게 「실질지배력 보유」이고 장부가가 남아 있으며 주요 종속회사로 분류된다. ' +
    '그런데 그룹이 지급보증을 세운 쪽은 장부가 0인 이 회사이고(EUR 2,860만) 값이 남은 조업사는 맨몸이다. 이 편이 세는 것은 회계 규칙 위반이 아니라 같은 항구의 두 법인이 장부에서 다르게 다뤄진다는 사실과 그 대비다.',
  accent: SCA_ACCENT,
  primaryKpi: {
    label: '취득원가가 장부에서 0으로 남아 있는 햇수',
    value: bookValueGap().경과연수,
    decimals: 0,
    unit: `(년 · 취득원가 ${bookValueGap().취득원가.toLocaleString('ko-KR')}백만원 전액을 ${bookValueGap().손상연도}년에 손상 처리해 장부가 ${bookValueGap().장부가} · 그 뒤 여섯 해 연속 흑자에도 환입 ${bookValueGap().환입건수}건 — ${bookValueGap().단서})`,
    accent: SCA_ACCENT,
  },
  secondaryKpis: [
    {
      label: '이 회사 지분 (장부가 0 · 주요 종속회사 X)',
      value: twoEntities().가공.지분_pct,
      decimals: 0,
      unit: `(% · 연결 사유 「${twoEntities().가공.연결사유}」 — 지분 ${twoEntities().조업.지분_pct}%인 조업사 ${twoEntities().조업.이름}은 연결 사유가 「${twoEntities().조업.연결사유}」이고 주요 종속회사 ${twoEntities().조업.주요종속회사}에 장부가 ${twoEntities().조업.장부가_천원.toLocaleString('ko-KR')}천원이 남는다)`,
    },
    {
      label: '그룹이 이 회사에 세운 지급보증',
      value: Number(scaStats.지급보증_EUR) / 1_000_000,
      decimals: 1,
      unit: `(백만 유로 · 2023년부터 · 통화는 차입지가 정한다 — 그룹 최대는 StarKist의 미화 ${(Number(scaStats.그룹최대보증_StarKist_USD) / 1_000_000).toLocaleString('ko-KR')}백만이다. 같은 나라 조업사에는 보증이 ${twoEntities().조업.지급보증}이다)`,
    },
    {
      label: '같은 기준일 2025년 말 총자산을 적은 값의 개수',
      value: 2,
      decimals: 0,
      unit: `(개 · 사업보고서 ${Number(scaStats.총자산_2025_사업보고서_백만원).toLocaleString('ko-KR')}백만원 대 반기보고서 ${Number(scaStats.총자산_2025_반기보고서_백만원).toLocaleString('ko-KR')}백만원 — ${scaStats.총자산_두값_차이_pct}% 차이다. 어느 쪽이 감사받은 값인지 원문으로 가릴 수 없어 둘 다 적는다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '장부',
      title: '환입을 막은 것은 기준서가 아니다',
      body: '2014년 「결손누적으로 손상징후가 발생한」 투자주식의 장부금액 전액을 손상으로 인식했다. 2018~2023년 여섯 해 흑자를 냈는데도 환입이 없다 — 환입이 금지된 것은 영업권뿐이고 종속기업투자 손상차손은 환입이 허용된다',
    },
    {
      eyebrow: '옆자리',
      title: '49%짜리가 「주요 종속회사」다',
      body: '지분 49%인 조업사만 연결 사유가 그룹에서 유일하게 「실질지배력 보유」이고 주요 종속회사로 분류된다. 모회사가 2025년에 그쪽에서 사들인 금액은 330.0억이고 이 회사 쪽은 매입 열 자체가 없다 — 다만 가공 자회사 전부가 그렇다',
    },
    {
      eyebrow: '줄자',
      title: '명판은 120이고 그날 실제는 90~100이다',
      body: '능력으로 적힌 값이 일곱인데 정부·인증 문서 근거가 0건이다. 명판과 실제가 한 문서에 함께 적힌 자리는 2025년 5월 현지 취재 하나뿐이고 사유로 든 것은 「물고기가 귀하다」였다. 부지·건물 면적과 연도별 생산 실적은 어느 원문에도 없다',
    },
    {
      eyebrow: '2024년',
      title: '여섯 달 사이에 표지와 경고가 함께 왔다',
      body: '5월에 유럽연합이 세네갈을 불법·비보고·비규제 어업 사전지정(옐로카드)했고 11월 14일에 조업 단위가 서아프리카 최초로 해양관리협의회 인증을 받았다 — 인증 단위 이름은 「CAPSEN & Grand Bleu」 공동이다. 같은 해 이 공장 결산은 △124.5억이다',
    },
  ],
  briefing: proseBriefing('sca'),
  narratives: inlineReport('sca', proseStages('sca')),
  chartSlots: {},
  continuous: true,
  sourceNotes: scaSourceNotes,
  sourceMeta: [
    `${scaMeta.회사} · ${scaMeta.국가} · ${scaMeta.업종}`,
    `출처 ${scaMeta.출처}`,
    `조사 ${scaMeta.조사일}`,
  ].join(' · '),
};

const GHANA_ACCENT = '#b8860b';

const GHANA_SPEC: CommoditySpec = {
  key: 'company-anatomy-ghana',
  title: '기업 해부: 가나 테마의 두 캐너리',
  subtitle:
    '같은 부두에 선 두 공장이 문서에서 갈린다. 가나 테마 어항에 참치 캔을 만드는 공장이 둘 있다 — 태국 그룹의 Pioneer Food Cannery 와 한국 회사가 지분 일부를 쥔 Cosmo Seafoods 다. ' +
    '한쪽은 주인이 다섯 겹까지 적혀 있다(타이유니언 → TUES1 → Thai Union Europe → Etablissements Paul Paulet → PFC, 전부 100%). 다른 한쪽에 공시가 적는 것은 신라교역 23.84% 한 줄뿐이고 나머지 76% 를 적은 문서는 어디에도 없다. ' +
    '그리고 한국에서 간 돈은 보이지 않는 쪽으로 흘렀다 — 지분을 취득한 2012년 이후 열한 해 동안 0원이던 매입이 두 해 만에 846억 2,933만원이 됐다. 이 편이 세는 것은 비중의 크기가 아니라 그 전환과, 그 돈이 가는 쪽의 소유가 4분의 1만 보인다는 사실이다.',
  accent: GHANA_ACCENT,
  primaryKpi: {
    label: '돈이 가는 공장의 소유 가운데 문서로 확인되는 지분',
    value: ownershipDepth().빈쪽.지분_pct,
    decimals: 2,
    unit: `(% · 나머지 ${ownershipDepth().빈쪽.미상_pct}% 의 주주를 적은 문서가 없다 — ${ownershipDepth().빈쪽.근거}. 같은 항구의 ${ownershipDepth().적힌쪽.이름} 는 ${ownershipDepth().적힌쪽.겹수}겹이 전부 ${ownershipDepth().적힌쪽.지분_pct}% 로 적히고 소수 지분이 ${ownershipDepth().적힌쪽.미상_pct}이다)`,
    accent: GHANA_ACCENT,
  },
  secondaryKpis: [
    {
      label: '신라교역이 이 공장에서 산 금액 (FY2025)',
      value: purchaseTurn().FY2025_백만원 / 100,
      decimals: 0,
      unit: `(억원 · 그 공장 매출의 ${purchaseTurn().FY2025_비중_pct}% — ${purchaseTurn().공백_기간}년 ${purchaseTurn().공백_해수}해 동안 0원이었다가 FY2023 ${(purchaseTurn().FY2023_백만원 / 100).toFixed(0)}억 → FY2024 ${(purchaseTurn().FY2024_백만원 / 100).toFixed(0)}억을 거쳐 두 해 만에 ${purchaseTurn().배수}배가 됐다)`,
    },
    {
      label: '같은 기간 그 투자의 장부금액',
      value: purchaseTurn().장부금액_백만원,
      decimals: 0,
      unit: `(백만원 · ${purchaseTurn().장부금액_경과연수}년째 0 — ${purchaseTurn().단서}. 이 공장의 자본은 FY2025 말 ${purchaseTurn().자본_백만원.toLocaleString('ko-KR')}백만원으로 완전자본잠식이다)`,
    },
    {
      label: '두 공장 가운데 고용을 해마다 적는 곳',
      value: Number(ghanaStats.고용_연도별공시_공장수),
      decimals: 0,
      unit: `(곳 · PFC 는 FY2022 ${ghanaStats.PFC_고용_2022_명} → FY2023 ${Number(ghanaStats.PFC_고용_2023_명).toLocaleString('ko-KR')} → FY2024 ${Number(ghanaStats.PFC_고용_2024_명).toLocaleString('ko-KR')} → FY2025 ${Number(ghanaStats.PFC_고용_2025_명).toLocaleString('ko-KR')}명이 모회사 공시 부속 데이터로 ${ghanaStats.고용_연도별공시_해수}해 연속 잡히고, Cosmo 쪽은 2020년 현지 매체의 한 점이 전부다. 면적·라인은 두 공장 다 기재 ${ghanaStats.면적_라인_기재_건수}건이다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '전환',
      title: '열한 해 동안 한 푼도 사지 않았다',
      body: '관계기업 행은 매 해 표에 있었고 매입 칸만 「-」였다 — 열이 없어서 0인 것이 아니다. 회사가 사유를 적어 놨다. 사업 개요가 「2023년말부터 해외 합작법인에서 생산된 참치캔을 유럽 캔 시장에 유통하는 사업」이라 쓴다. 지분을 열한 해 들고 있다가 열두 해째에 유통을 시작한 것이다',
    },
    {
      eyebrow: '장부',
      title: '두 번 0이 됐고 한 번 되살아났다',
      body: '2015년 말 지분법손실로 1차 소멸, 2016년 중 현금출자 43억 9,500만원으로 3억 401만원이 되살아났다가 2017년 말 2차 소멸했다. 신라교역 관계기업 일곱 곳 가운데 다섯이 장부가 0이고, 값이 남은 둘은 한국 섬유회사와 키리바시 조선소다 — 참치를 잡고 만드는 법인은 전부 0이다',
    },
    {
      eyebrow: '번호',
      title: '승인번호가 둘인 것은 공장이 둘이었기 때문이다',
      body: '유럽연합 목록에 Cosmo 가 GS/SF/E070 과 GS/SF/E103 두 줄로 실린다. E103 은 원래 Ichiban Seafoods 의 번호이고 2016-01-01 에 Cosmo 가 흡수합병했다. 다만 「합병했으니 공장도 합쳤다」는 원문에 없는 말이다 — 목록은 도시까지만 적고 번호는 둘 다 살아 있다',
    },
    {
      eyebrow: '카드',
      title: '이 나라는 옐로카드를 두 번 받았다',
      body: '2013-11-26 에 받아 2015-10-01 에 해제됐고, 2021-06-02 에 다시 받아 지금도 걸려 있다. 옐로카드는 수출 금지가 아니다 — 재지정 뒤에도 가나 캔참치 수출은 2022년 26,567톤에서 2025년 31,956톤으로 늘었다. 무게는 다음 단계에 있다',
    },
  ],
  briefing: proseBriefing('ghana'),
  narratives: inlineReport('ghana', proseStages('ghana')),
  chartSlots: {},
  continuous: true,
  sourceNotes: ghanaSourceNotes,
  sourceMeta: [
    `${ghanaMeta.회사} · ${ghanaMeta.국가} · ${ghanaMeta.업종}`,
    `출처 ${ghanaMeta.출처}`,
    `조사 ${ghanaMeta.조사일}`,
  ].join(' · '),
};

const AZORES_ACCENT = '#0f6e6e';

const AZORES_SPEC: CommoditySpec = {
  key: 'company-anatomy-azores',
  title: '기업 해부: 아소르스의 다섯 캔공장',
  subtitle:
    '같은 보전금 명부가 다섯 공장을 한 줄에 세운다. 포르투갈 아소르스의 네 섬에 참치 캔 공장이 다섯 있다 — COFACO Açores · Santa Catarina(SCA 운영) · Pescatum · Sociedade Corretora · Conseran. ' +
    '다섯은 유럽연합의 같은 최외곽지역 추가비용 보전금을 받고, 그 명부가 원어를 아소르스 배가 잡은 역내산과 그 밖의 배가 잡은 공동체산 두 코드로 갈라 적는다. 그래서 공장마다 어느 배의 참치를 얼마나 신청했는지가 남는다. ' +
    '승인액 기준 역내산 비중은 Sociedade Corretora 100.00 % 부터 COFACO 8.72 % 까지 갈리고, 가장 낮은 COFACO 의 네 해 신청액이 나머지 넷의 합보다 크다. 본토 대조군 Ramirez 는 이 제도에 한 줄도 없고 공적 자금을 설비 사업의 이름으로 받는다.',
  accent: AZORES_ACCENT,
  primaryKpi: {
    label: '신청액이 가장 큰 공장의 역내산 비중 (COFACO Açores · 승인액 기준 2021~2024 합)',
    value: regionalSpectrum().공장[4].비중_pct,
    decimals: 2,
    unit: `(% · 같은 명부에서 ${regionalSpectrum().공장.slice(0, 4).map((x) => `${x.이름} ${x.비중_pct.toFixed(2)}`).join(' · ')} — COFACO 의 네 해 신청액 ${regionalSpectrum().최대_신청.신청액_EUR.toLocaleString('ko-KR')} € 는 나머지 넷의 합 ${regionalSpectrum().최대_신청.나머지넷_EUR.toLocaleString('ko-KR')} € 보다 크고, 그 가운데 ${Number(azoresStats.COFACO_공동체산_신청액_EUR).toLocaleString('ko-KR')} € 가 공동체산 코드다)`,
    accent: AZORES_ACCENT,
  },
  secondaryKpis: [
    {
      label: '같은 1톤에 붙는 보전 단가 — 공동체산 대 역내산',
      value: Number(azoresStats.단가_배수),
      decimals: 2,
      unit: `(배 · 역내산 ${Number(azoresStats.단가_역내산_EUR_t).toFixed(2)} €/t · 공동체산 ${Number(azoresStats.단가_공동체산_EUR_t).toFixed(2)} €/t(Portaria n.º 61/2023 제12조 제3항 b·제4항). 규정은 차이의 사유를 밝히지 않는다 — 공동체산 쪽 산식이 같다면 금액으로 잰 역내산 비중은 물량으로 잰 것보다 낮게 나온다)`,
    },
    {
      label: '2024년 COFACO 가 신청한 역내산',
      value: regionalTonnes2024().COFACO_t,
      decimals: 1,
      unit: `(t · 역내산 신청액 ${Number(azoresStats.역내산_2024_COFACO_신청액_EUR).toLocaleString('ko-KR')} € ÷ ${regionalTonnes2024().단가_EUR_t} €/t — 다섯 중 가장 적다. 가장 많은 SCA ${regionalTonnes2024().SCA_t} t 가 그 네 배에 가깝고, 다섯 합 ${regionalTonnes2024().합_t.toLocaleString('ko-KR')} t 은 그해 한도 훈령 ${regionalTonnes2024().한도_kg.toLocaleString('ko-KR')} kg 과 kg 단위까지 같다. ${regionalTonnes2024().단서})`,
    },
    {
      label: 'Lotaçor 가 Santa Catarina 지분 99.73 % 를 넘겨받은 값 (2009-01-20)',
      value: Number(azoresStats.Lotaçor_취득가_EUR),
      decimals: 0,
      unit: `(€ · 두 주 뒤 ${Number(azoresStats.회생대출_1차_EUR).toLocaleString('ko-KR')} €, 그해 8월 ${Number(azoresStats.회생대출_2차_EUR).toLocaleString('ko-KR')} € 대출이 이어졌다. ${azoresStats.운영이관일} 부터 민간 SCA 가 임차 운영하고 계약서 초안의 지분 매수옵션은 ${Number(azoresStats.매수옵션_EUR).toLocaleString('ko-KR')} € 다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '명부',
      title: '한 장의 지급 명부가 다섯을 한 줄에 세운다',
      body: '보전금이 원어를 역내산과 공동체산 두 코드로 갈라 지급해서 공장마다의 원어 구성이 지급 명부에 실린다. 표의 맨 위(Sociedade Corretora · 빌라프랑카두캄푸)와 맨 아래(COFACO · 라부드페이시)가 같은 상미겔섬에 있고 직선거리로 20 km 가 안 된다. 공동체산 보전의 조건(제5항)은 아소르스 전체의 상한에 걸려 있어 공장을 가르지 않는다',
    },
    {
      eyebrow: '톤',
      title: '역내산은 금액이 톤으로 되돌아간다',
      body: '2024년분 다섯 공장의 역내산 신청액 합 432,711.23 € 를 171 €/t 로 나누면 2,530,475 kg 이고, 그해 한도 훈령과 kg 단위까지 같다. 공동체산은 같은 방식으로 한도 2,301,000 kg 이 되살아나지 않아 금액으로 둔다 — 넘길 자리는 공동체산 산정 서식 한 장이다',
    },
    {
      eyebrow: '임대',
      title: '공공이 가진 공장을 민간이 돌린다',
      body: 'Santa Catarina 공장은 2022-08-01 부터 SCA 가 임차 운영한다. 보전금 명부의 행이 2022-07-31 에 끊기고 8-01 에 이어지며, 위생 승인번호 C 213 1 P 도 운영사 이름으로 옮겨졌다. 관보 초안의 고정 임차료 10년치는 약 1,610,000 € 인데 정부 발표 인용 보도는 「700만 € 이상」이라 4.3배 어긋나고 서명본은 관보에 없다',
    },
    {
      eyebrow: '인증',
      title: '없는 것은 MSC 하나다',
      body: '아소르스 참치 어업은 MSC 인증 어업 목록에 없다. 그러나 COFACO · Santa Catarina · Ramirez 셋 다 Friend of the Sea 2021년판 고객명부에 있고 두 공장은 2026년 돌고래 안전 명부에 올라 있다. 포르투갈 등록 캔참치 211건 중 MSC 라벨은 2건이고, MSC 가 발표한 +153 % 는 기준 물량을 밝히지 않는다',
    },
  ],
  briefing: proseBriefing('azores'),
  narratives: inlineReport('azores', proseStages('azores')),
  chartSlots: {},
  continuous: true,
  sourceNotes: azoresSourceNotes,
  sourceMeta: [
    `${azoresMeta.회사} · ${azoresMeta.국가} · ${azoresMeta.업종}`,
    `출처 ${azoresMeta.출처}`,
    `조사 ${azoresMeta.조사일}`,
  ].join(' · '),
};

const TOG_ACCENT = '#b45309';

const TOG_SPEC: CommoditySpec = {
  key: 'company-anatomy-tog',
  title: '기업 해부: TOG',
  subtitle:
    '아비장의 캔공장 SCODI(어항)와 PFCI(브리디 항만구역)는 한때 선망 선단을 거느린 회사(Saupiquet·Pêche et Froid)의 공장이었다. 2005년 전후 두 공장은 창업자 쪽으로 넘어갔고, 2008년에 설립된 프랑스 지주 TOG에는 선망선이 없었다. ' +
    '2021년 네덜란드 PP 그룹의 프랑스 지주 PP THON이 TOG 주식의 정확히 절반을 가졌고, 2026년 7월 10일 결정문에서 TOG의 단독사원으로 서명했다. PP THON은 프랑스 선망 회사 CFTO의 단독사원이기도 하다. ' +
    '그사이 유럽연합 목록의 코트디부아르 캔공장은 셋에서 둘로 줄었고, 남은 둘 가운데 Airone Côte d\'Ivoire는 2025년 이탈리아 법원 절차 공고에 「활동 중단」으로 나온다.',
  accent: TOG_ACCENT,
  primaryKpi: {
    label: '2021년 6월 30일 임시총회 뒤 PP THON 과 창업자가 각각 가진 TOG 주식 수',
    value: halfHalf().PP_THON_주식,
    decimals: 0,
    unit: `(주 · 창업자도 ${halfHalf().창업자_주식.toLocaleString('ko-KR')}주로 두 줄이 같다. 사모펀드 지분 매수 ${halfHalf().ECP_매수_EUR.toLocaleString('ko-KR')} € · 창업자와 SMS 만 부담한 감자 ${halfHalf().감자_EUR.toLocaleString('ko-KR')} € · PP THON 신주 ${halfHalf().신주.toLocaleString('ko-KR')}주가 겹친 결과이고 결의록 본문에 퍼센트는 없다. ${halfHalf().단독사원_결정일} 결정문에서 PP THON 이 단독사원으로 서명했고 ${halfHalf().단서})`,
    accent: TOG_ACCENT,
  },
  secondaryKpis: [
    {
      label: '유럽연합 제3국 수산시설 목록의 코트디부아르 캔공장 승인번호 (2022-01-14 기준)',
      value: Number(togStats.EU목록_CI_캔공장_2022),
      decimals: 0,
      unit: `(개 · 2013년 ${togStats.EU목록_CI_캔공장_2013}개(100 PP SCODI · 110 PP PFCI · 120 PP Castelli). 110 PP 는 2016년 11월 발효판에 있고 2020년 9월 기준 목록부터 없다 — PFCI 법인은 ${togStats.PFCI_해산결의일} 해산을 결의했다. 남은 120 PP 의 법인 Airone Côte d'Ivoire 는 TOG 계열이 아니고 2025년 이탈리아 법원 절차 공고에 「활동 중단」으로 나온다)`,
    },
    {
      label: '코트디부아르 세관이 신고한 캔참치(HS 160414) 대세계 수출 — 2021~2023년 합',
      value: customsGap().수출신고_3년합_kg,
      decimals: 0,
      unit: `(kg · ${customsGap().수출신고_kg.map((x) => `${x.연도}년 ${x.kg} kg`).join(' · ')}. 같은 2023년 프랑스 세관은 코트디부아르산 ${customsGap().프랑스수입_kg[2].kg.toLocaleString('ko-KR')} kg 수입을 신고했다 — ${customsGap().단서})`,
    },
    {
      label: 'CFTO 개별 계정 순손실 — 2020~2023년 네 해 합',
      value: Number(togStats.CFTO_순손실_2020_2023_합_EUR),
      decimals: 0,
      unit: `(€ · PP THON 이 단독사원인 프랑스 선망 회사. IOTC 허가선박 기록부 2025-02-28판에 2024년 활동이 신고된 선망선 ${togStats.CFTO_IOTC_선망선_척}척과 보조선 ${togStats.CFTO_IOTC_보조선_척}척 · 2021년 채권 상계 증자 ${Number(togStats.CFTO_채권상계_증자_2021_EUR).toLocaleString('ko-KR')} €. 아비장 공장의 원어를 CFTO 배가 대는지는 공개 기록에 나오지 않는다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '서명',
      title: 'PP THON이 TOG의 단독사원으로 서명했다',
      body: '프랑스 낭테르 상사법원 등기소에 2026-08-04 예탁된 TOG 의 7월 10일자 결정문 끝 서명란에 「PP THON Représentée par Diederik PARLEVLIET」가 찍혔다. 결정문과 새 정관, 8월 13일 등기공고 어디에도 창업자 지분의 대금은 없다. TOG가 두 나라 공장 법인의 지분을 얼마나 갖는지도 등기에 나오지 않는다',
    },
    {
      eyebrow: '목록',
      title: '2016년 해산 결의 뒤의 PFCI',
      body: '2016-11-25 단독주주가 조기 해산을 결의했고 공고가 OHADA 회사법 제201조를 인용한다. 110 PP 는 2019-09-21 에도 게시돼 있던 2016-11-20 발효판에 있고, 번호가 없는 것은 2020년 9월 기준 목록부터다. 옛 브리디 항만구역의 PFCI 설비를 어느 법인이 넘겨받았는지는 어느 공고에도 나오지 않는다',
    },
    {
      eyebrow: '재무',
      title: 'TOG 연결 매출보다 판매 자회사 CCO의 매출이 해마다 크다',
      body: 'TOG 가 99.9989 % 가진 CCO 의 2024년 개별 매출은 171,578,842 € 이고 TOG 연결 매출은 123,358,663 € 다. 까닭은 TOG 연결재무 주석의 연결 범위에 있고 공개 재무비율 데이터에는 그 항목이 없다. TOG 2023년 계정은 예탁 기록 자체가 없다',
    },
    {
      eyebrow: '매대',
      title: 'Carrefour·Auchan 자체상표의 승인번호 100 PP',
      body: '식품 데이터베이스와 품질표의 캔 표시에는 SCODI라는 이름이 없고, 프랑스 매대에서 이 공장을 가리키는 표시는 유럽연합 승인번호 「100PP」다. CCO 의 Pompon Rouge 품질표는 생산지를 「Madagascar MAD 111 SV, Côte d\'Ivoire 100PP」로 적어 캔 하나가 어느 공장에서 나왔는지는 가리지 않는다',
    },
  ],
  briefing: proseBriefing('tog'),
  narratives: inlineReport('tog', proseStages('tog')),
  chartSlots: {},
  continuous: true,
  sourceNotes: togSourceNotes,
  sourceMeta: [
    `${togMeta.회사} · ${togMeta.국가} · ${togMeta.업종}`,
    `출처 ${togMeta.출처}`,
    `조사 ${togMeta.조사일}`,
  ].join(' · '),
};

const MAURITIUS_ACCENT = '#0f6b6b';

/** FY2023 이 이듬해 보고서에서 사유 없이 바뀐 자리. 세 줄이고 유동자산만 그대로다. */
const MU_RESTATED = restatedRows();
const MU_SHARE = shareGap();
const MU_EQUITY = equityBasis();
const MU_FY2024 = MU_SHARE.연도별.find((y) => y.회계연도 === 'FY2024')!;

const MAURITIUS_SPEC: CommoditySpec = {
  key: 'company-anatomy-mauritius',
  title: '기업 해부: 모리셔스',
  subtitle:
    '모리셔스에서 참치를 캔과 로인으로 가공하는 회사는 둘만 남았다. 수의당국 승인번호로는 셋인데 그 셋을 가진 법인은 둘이고, 둘 다 영국 Princes 계열이다 — 리슈테르와 마린로드의 Princes Tuna (Mauritius) Ltd, 그리고 같은 마린로드 주소의 별개 법인 Indico Canning. ' +
    '같은 항구에서 냉동 로인을 만들던 Mer des Mascareignes 는 자기 배 세 척의 쿼터와 허가를 얻지 못해 원료가 끊겼고 2024년에 문을 닫고 청산에 들어갔다. 남은 공장은 유럽연합 선단에서 한 해 약 9만 톤을 산다. ' +
    '그 공장을 지분법으로 드는 모리셔스 상장 그룹 IBL 의 장부에서는 같은 회사의 같은 해가 두 번 다르게 적힌다.',
  accent: MAURITIUS_ACCENT,
  primaryKpi: {
    label: `PTM 주주 귀속 순이익이 ${MU_FY2024.순이익_천Rs.toLocaleString('ko-KR')}천 루피였던 FY2024 에 IBL 이 인식한 지분 몫`,
    value: MU_FY2024.인식몫_천Rs,
    decimals: 0,
    unit: `(천 루피 · ${MU_EQUITY.IBL_지분법적용률_pct} % 를 곱하면 ${MU_FY2024.산술몫_천Rs.toLocaleString('ko-KR')} 이다. FY2023 은 거꾸로 ${Number(mauritiusStats.차_FY2023_천Rs).toLocaleString('ko-KR')} 이 더 잡혔고, FY2022~FY2025 네 해를 합쳐도 ${MU_SHARE.미상쇄_천Rs.toLocaleString('ko-KR')} 천 루피가 상쇄되지 않는다 — 순이익 합 ${MU_SHARE.순이익_4년합_천Rs.toLocaleString('ko-KR')} × ${MU_EQUITY.IBL_지분법적용률_pct} % = ${MU_SHARE.산술몫_4년합_천Rs.toLocaleString('ko-KR')} 대 인식 합 ${MU_SHARE.인식몫_4년합_천Rs.toLocaleString('ko-KR')}. IBL 의 지분법 회계정책 전문에 관계회사의 결산일 차이나 재무정보 조정을 다루는 문장이 없어 사유는 공시 어디에도 없다)`,
    accent: MAURITIUS_ACCENT,
  },
  secondaryKpis: [
    {
      label: '모리셔스 수의당국의 참치 가공 승인번호 (러시아 수의당국 수입허가 명부)',
      value: Number(mauritiusStats.가공승인_수),
      decimals: 0,
      unit: `(개 · ${mauritiusStats.승인_리슈테르}(리슈테르) · ${mauritiusStats.승인_마린로드_PTM}(마린로드) · ${mauritiusStats.승인_마린로드_Indico}(마린로드). 그 셋을 가진 법인은 ${mauritiusStats.가공법인_수}이다 — 앞의 둘이 Princes Tuna (Mauritius) Ltd 이고 마지막은 영국 Princes 가 간접 ${MU_EQUITY.Indico_Princes_간접_pct} % 를 가진 별개 법인 Indico Canning 이다. 같은 명부의 DVS/F/C/2(Froid des Mascareignes)는 가공이 아니라 냉동 어류 명부다)`,
    },
    {
      label: 'PTM 이 유럽연합 선단에서 사는 원어 — 연 약',
      value: Number(mauritiusStats.PTM_매입_t),
      decimals: 0,
      unit: `(t · 집행위 평가 작업문서 SWD(2026) 68 이 유럽연합 선단의 인도양 선망 어획 연 약 ${Number(mauritiusStats.EU선단_인도양_선망어획_t).toLocaleString('ko-KR')} t 가운데 이만큼을 PTM 이 산다고 적는다. 그 원어의 접근권을 받치는 현행 이행의정서는 ${mauritiusStats.이행의정서_잠정적용} 잠정 적용돼 ${mauritiusStats.이행의정서_종료} 에 끝나고, 집행위는 ${mauritiusStats.집행위_재협상제안일} 에 새 협정·의정서 협상 제안을 채택했다)`,
    },
    {
      label: 'IBL 이 이듬해 보고서에서 사유 없이 고쳐 적은 FY2023 PTM 항목',
      value: MU_RESTATED.length,
      decimals: 0,
      unit: `(줄 · ${MU_RESTATED.map((r) => `${r.항목} ${r.판2023_천Rs.toLocaleString('ko-KR')} → ${r.판2024_천Rs.toLocaleString('ko-KR')}`).join(' · ')}. 유동자산만 두 판이 같다. IBL 장부가도 영업권과 같은 폭으로 줄었고, 두 보고서 모두 사유를 적지 않으며 전기오류 수정·재표시를 밝히는 문장도 이 항목에 붙어 있지 않다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '두 장부',
      title: '같은 회사를 가리키는 세 숫자는 기준이 다르다',
      body: `영국 Princes 계정에는 직접 ${MU_EQUITY.Princes_직접_pct} %, IBL 감사재무 주석 12(h)에는 직접 ${MU_EQUITY.IBL_직접_pct} % 와 간접 ${MU_EQUITY.IBL_간접_pct} % 를 합한 유효지분 ${MU_EQUITY.IBL_유효_pct} %, 주석 12(j)에는 지분법 적용률 ${MU_EQUITY.IBL_지분법적용률_pct} % 가 올라 있다. 유효지분과 지분법 적용률은 같은 수가 아니다. 100 − ${MU_EQUITY.Princes_직접_pct} − ${MU_EQUITY.IBL_지분법적용률_pct} = 5,32 도 잔여 지분율이 아니다 — 기준이 다른 두 수를 뺀 것이다`,
    },
    {
      eyebrow: '손상',
      title: '이름이 적힌 손상과 이름이 없는 손상',
      body: `FY2022 에는 대상이 「주로 PTM … 그리고 Mer des Mascareignes」로 적혔고 FY2025 에는 「실적이 떨어진 관계회사 하나」로만 적혔다(${Number(mauritiusStats.손상_FY2025_이름없음_천Rs).toLocaleString('ko-KR')}천 루피 · 회수가능액은 EBITDA 6,41배). 같은 해 PTM 영업권이 ${Number(mauritiusStats.PTM_영업권_FY2024_천Rs).toLocaleString('ko-KR')} 에서 ${Number(mauritiusStats.PTM_영업권_FY2025_천Rs).toLocaleString('ko-KR')} 으로 ${Number(mauritiusStats.PTM_영업권_감소_천Rs).toLocaleString('ko-KR')} 줄었지만, IBL 회계정책 전문이 「인식한 손상은 영업권을 포함한 어떤 자산에도 배분하지 않는다」고 적는다. 두 숫자가 가깝다는 사실과 같은 사건이라는 주장은 다르다`,
    },
    {
      eyebrow: '죽은 공장',
      title: '배가 먼저 끊기고 공장이 뒤따라 닫혔다',
      body: `Sapmer 와 IBL 이 절반씩 든 Mer des Mascareignes 는 ${mauritiusStats.MDM_가동개시} 프리포트 구역에서 가동을 시작했다. Sapmer 연차재무보고는 2023년에 모리셔스기 참치선 ${mauritiusStats.MDM_선박_척}척의 쿼터와 조업 허가를 얻지 못해 원료가 크게 타격받았고, 매수 예정자가 물러나면서 공장이 닫히고 회사가 청산 중이라고 적는다. 그 배 셋은 ${mauritiusStats.MDM_선박매각_1차} 와 ${mauritiusStats.MDM_선박매각_2차} 에 차례로 인도됐다. PTM 은 애초에 자기 배가 없다`,
    },
    {
      eyebrow: '매대',
      title: '캔은 섬을 적지만 사업장을 적지 않는다',
      body: `원산지 칸이 「Mauritius」인 캔은 ${mauritiusStats.매대_브랜드_수}개 브랜드로 영국·독일·폴란드·이탈리아·스웨덴과 모리셔스 현지 매대에 걸쳐 있는데, 어느 사업장에서 만들었는지는 어느 캔에도 적혀 있지 않다. 캔에 찍힌 MSC 코드는 그 수산물을 소유한 회사의 것이지 공장 주소가 아니다 — Lidl Nixe 캔의 MSC-C-56655 는 에콰도르 NIRSA 의 번호다. 2024년 수입국 신고 단가는 이탈리아 ${mauritiusStats.단가_2024_이탈리아_USD_kg} 달러/kg 부터 프랑스 ${mauritiusStats.단가_2024_프랑스_USD_kg} 달러/kg 까지 벌어진다`,
    },
  ],
  briefing: proseBriefing('mauritius'),
  narratives: inlineReport('mauritius', proseStages('mauritius')),
  chartSlots: {},
  continuous: true,
  sourceNotes: mauritiusSourceNotes,
  sourceMeta: [
    `${mauritiusMeta.회사} · ${mauritiusMeta.국가} · ${mauritiusMeta.업종}`,
    `출처 ${mauritiusMeta.출처}`,
    `조사 ${mauritiusMeta.조사일}`,
  ].join(' · '),
};

const GALAPESCA_ACCENT = '#0e6a8c';

/** 빌린 것 넷과 그 값. 건물 둘의 합보다 기계 한 건이 크다. */
const GP_LEASE = leases();
const GP_ASSET = ownedVsLeased();
const GP_PROD = production();
const GP_2024 = GP_PROD.연도별.find((y) => y.연도 === 2024)!;

const GALAPESCA_SPEC: CommoditySpec = {
  key: 'company-anatomy-galapesca',
  title: '기업 해부: Galapesca',
  subtitle:
    '미국 매대에서 가장 많이 팔리는 참치 브랜드의 파우치는 미국령 사모아가 아니라 에콰도르 과야킬의 이 공장에서 나온다. 그런데 이 회사는 그 공장을 갖고 있지 않다 — 참치를 가공하는 건물 두 동과 창고 한 동, 그리고 기계와 설비를 네 계약으로 빌려 쓰고 그 안을 채운 설비만 자기 장부에 둔다. ' +
    '배는 한 척도 없고 무형자산은 전 항목이 0이며 자기 브랜드도 없다. 매출의 여덟 할 넘게가 모회사 한 곳으로 가고 원어와 캔은 한국의 계열사에서 사 온다. ' +
    '설비를 빌려주는 회사는 2000년에 이 회사에 그 설비를 판 바로 그 회사다.',
  accent: GALAPESCA_ACCENT,
  primaryKpi: {
    label: `공장 두 동·창고 한 동·기계를 빌리는 데 2019년에 낸 임차료 — 임대인 ${GP_LEASE.계약.length}곳`,
    value: GP_LEASE.합계_USD,
    decimals: 0,
    unit: `(US$ · ${GP_LEASE.계약.map((c) => `${c.임대인} ${c.연임차료_USD.toLocaleString('ko-KR')}`).join(' · ')}. 건물 둘의 합 ${GP_LEASE.건물합_USD.toLocaleString('ko-KR')} 보다 기계 한 건 ${GP_LEASE.기계_USD.toLocaleString('ko-KR')} 이 크다 — 빌린 것은 공간보다 생산 능력 쪽에 더 걸려 있다. 2018년 1월에 시작한 세 계약은 5년이라 2022년 말에 끝났고 그 뒤 계약의 임차료·기간은 공개된 제출본에 없다)`,
    accent: GALAPESCA_ACCENT,
  },
  secondaryKpis: [
    {
      label: '빌린 자리에 회사가 자기 이름으로 얹은 것 — 2018년 말 유형자산 순장부',
      value: GP_ASSET.자기유형자산_USD,
      decimals: 0,
      unit: `(US$ · 하루 뒤 장부에 올라온 사용권자산 ${GP_ASSET.사용권자산_USD.toLocaleString('ko-KR')} 의 ${GP_ASSET.배}배다. 이 안에 토지 ${GP_ASSET.토지_USD.toLocaleString('ko-KR')} 이 들어 있다 — 건물과 기계는 빌렸지만 토지는 갖고 있다. 다만 「건물·설비·개량」이 한 열로 묶여 있어 그 가운데 임차공장 개량분이 얼마인지는 갈리지 않는다. 사용권자산은 그해 말 ${GP_ASSET.사용권자산_기말_USD.toLocaleString('ko-KR')} 으로 내려간다)`,
    },
    {
      label: '매출 가운데 모회사 StarKist Co. 앞 비중 (2019 · 감사받은 주석)',
      value: Number(galapescaStats['StarKist향_비중_2019_pct']),
      decimals: 2,
      unit: `(% · 2018년 ${galapescaStats['StarKist향_비중_2018_pct']} % · 2017년 ${galapescaStats['StarKist향_비중_2017_pct']} %. 2019년은 같은 방식으로 계산하면 ${galapescaStats['StarKist향_재계산_2019_pct']} %(${Number(galapescaStats['StarKist_완제품매출_2019_USD']).toLocaleString('ko-KR')} + ${Number(galapescaStats['StarKist_원료매출_2019_USD']).toLocaleString('ko-KR')} ÷ ${Number(galapescaStats['매출_2019_USD']).toLocaleString('ko-KR')})여서 0,07 %p 어긋나므로 주석 수치를 쓰되 계산값을 같이 적는다. 이 비중은 상대방 기준이고 지역 북미 비중은 분모가 다른 별개의 수다)`,
    },
    {
      label: '2024년 이 공장이 만든 파우치 — 같은 해 캔의',
      value: GP_2024.배,
      decimals: 1,
      unit: `(배 · 파우치 ${GP_2024.파우치_t.toLocaleString('ko-KR')} t 대 캔 ${GP_2024.캔_t.toLocaleString('ko-KR')} t. 2023년 ${GP_PROD.연도별[0].파우치_t.toLocaleString('ko-KR')}/${GP_PROD.연도별[0].캔_t.toLocaleString('ko-KR')} · 2025년 ${GP_PROD.연도별[2].파우치_t.toLocaleString('ko-KR')}/${GP_PROD.연도별[2].캔_t.toLocaleString('ko-KR')} t 이고, 2026년 1분기에는 파우치 ${Number(galapescaStats['파우치_2026_1Q_t']).toLocaleString('ko-KR')} t 에 캔 ${galapescaStats['캔_2026_1Q_t']} t 이다 — 같은 분기 미국령 사모아 공장의 파우치는 ${Number(galapescaStats['사모아_파우치_2026_1Q_t']).toLocaleString('ko-KR')} t 다. 모회사 공시의 캔 생산능력은 연 ${GP_PROD.능력_연_t.toLocaleString('ko-KR')} t · 가동일수 ${galapescaStats['가동일수_일']}일로 하루 ${GP_PROD.능력_일_t} t 이고 이것은 능력이지 실적이 아니다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '임차공장',
      title: '껍데기는 빌린 것이고 그 안의 설비는 자기 것이다',
      body: `2019년 감사 재무제표의 첫 절이 「회사는 사업을 하는 과야킬에서 산업용 공장 두 곳, 창고용 갈폰 한 동, 그리고 기계와 설비를 임차한다」고 적는다. 계약 기간은 2~5년이고 갱신 선택권은 임차인만 행사한다. 사용권자산은 2019년 초 ${GP_ASSET.사용권자산_USD.toLocaleString('ko-KR')} 달러로 잡혔고 리스 이자 ${Number(galapescaStats['리스이자_2019_USD']).toLocaleString('ko-KR')} 달러가 손익에 들어갔으며, 갱신 선택권을 모두 행사하면 리스부채가 ${Number(galapescaStats['연장옵션_리스부채증가_USD']).toLocaleString('ko-KR')} 달러 늘어난다고 회사가 추정한다`,
    },
    {
      eyebrow: '되사기',
      title: '설비를 판 회사가 지금은 그 설비를 빌려준다',
      body: `2000년 10월 15일 이 회사는 EMPESEC 의 자산 ${Number(galapescaStats['EMPESEC_인수자산_USD']).toLocaleString('ko-KR')} 과 부채 ${Number(galapescaStats['EMPESEC_인수부채_USD']).toLocaleString('ko-KR')} 을 넘겨받고 차액 ${Number(galapescaStats['EMPESEC_약속어음_USD']).toLocaleString('ko-KR')} 달러를 약속어음으로 끊었다. 2003년에는 재고를 통째로 EMPESEC 에 팔고 냉동보관·생산감독 서비스 회사가 됐다가 ${galapescaStats['모델전환']} 후반에 참치 통조림 가공으로 돌아왔다 — 일곱 해 남짓 제조를 하지 않았다. 지금 기계를 빌려주는 EMPESEC 의 2024년 매출은 0이고, 공장을 빌려준 INCOPECA 의 2019년 영업수익은 ${Number(galapescaStats['INCOPECA_영업수익_2019_USD']).toLocaleString('ko-KR')} 달러 한 줄로 이 회사가 낸 임차료와 센트까지 같으며 그해 재고도 인원도 0이다`,
    },
    {
      eyebrow: '특혜',
      title: '파우치를 에콰도르로 부른 이유는 관세였고 그 구성이 특혜보다 오래 남았다',
      body: `2010년 재무제표는 「에콰도르에서 가공하는 파우치 참치의 대부분이 안데스 무역특혜·마약퇴치법(ATPDEA)의 특혜를 받아 미국에 들어간다」고 적는다. 주석이 고른 말은 캔이 아니라 파우치였고, 서비스업에서 가공업으로 돌아선 ${galapescaStats['모델전환']} 과 생산이 파우치로 쏠린 시점이 겹친다. 특혜는 ${galapescaStats['ATPDEA_최종종료']} 에 끝났지만 열두 해 뒤인 2025년에도 에콰도르는 미국에 파우치 ${Number(galapescaStats['에콰도르_미국행_파우치_2025_t']).toLocaleString('ko-KR')} t 과 캔 ${Number(galapescaStats['에콰도르_미국행_캔_2025_t']).toLocaleString('ko-KR')} t 을 보냈다. 다만 이 물량은 나라 단위이고 에콰도르에서 파우치를 만드는 공장이 이곳만도 아니다`,
    },
    {
      eyebrow: '이름이 없다',
      title: '배도 상표도 없이 톤을 판다',
      body: `회사는 배를 ${galapescaStats['선박_척']}척 갖고 있고 태평양의 두 지역수산기구 선박등록부에도 국제 인증기관 승인선박 명부에도 이 법인 이름이 없다. 2019년 제출 양식의 무형자산은 상표·영업권·개발비까지 전 항목이 ${galapescaStats['무형자산_USD']}이고 광고선전비 계정이 따로 서지 않으며 판매수수료는 ${Number(galapescaStats['판매수수료_2019_USD']).toLocaleString('ko-KR')} 달러로 총비용의 0,03 %다. 그 대신 관세비용 ${Number(galapescaStats['관세비용_2019_USD']).toLocaleString('ko-KR')} 과 보관료 ${Number(galapescaStats['보관료_2019_USD']).toLocaleString('ko-KR')} 달러가 나간다 — 파는 값을 정하는 쪽과 만드는 쪽이 떨어져 있으면 비용의 모양도 달라진다. 유럽연합 제3국 승인번호 ${galapescaStats['EU승인번호']} 는 명부에 있지만 미국 법원기록과 관세청 판정에는 이 상호가 한 번도 나오지 않는다`,
    },
  ],
  briefing: proseBriefing('galapesca'),
  narratives: inlineReport('galapesca', proseStages('galapesca')),
  chartSlots: {},
  continuous: true,
  sourceNotes: galapescaSourceNotes,
  sourceMeta: [
    `${galapescaMeta.회사} · ${galapescaMeta.국가} · ${galapescaMeta.업종}`,
    `출처 ${galapescaMeta.출처}`,
    `조사 ${galapescaMeta.조사일}`,
  ].join(' · '),
};

const COSI_ACCENT = '#15506e';

/** 형사에서 0이었던 값이 민사에서는 트랙마다 붙었다. */
const CS_SETTLE = settlements();
const CS_SHARE = share();
const CS_US = parentUs();
const CS_US_2021 = CS_US.연도별[0];
const CS_US_2025 = CS_US.연도별[1];

const COSI_SPEC: CommoditySpec = {
  key: 'company-anatomy-cosi',
  title: '기업 해부: Chicken of the Sea',
  subtitle:
    '미국 매대에서 셋째로 많이 팔리는 참치 브랜드다. 그 브랜드를 가진 법인 Tri-Union Seafoods LLC 는 태국 상장사 Thai Union 이 100 % 쥐고 있고, 이 회사가 미국에 가진 공장은 조지아주 라이언스 한 곳뿐이다. ' +
    '그 공장은 배를 갖지 않고 생선을 쪄 내지도 않는다 — 남의 나라에서 이미 살만 발라 낸 프리쿡 로인을 받아 자르고 간해서 캔에 넣고 레토르트에 건다. ' +
    '미국 참치 캔 값을 올린 담합에서 이 회사는 셋 가운데 유일하게 기소되지 않았다. 먼저 자백하고 법무부의 조건부 사면을 받았기 때문이다. 대신 민사에서는 트랙마다 따로 냈다.',
  accent: COSI_ACCENT,
  primaryKpi: {
    label: `집단소송 ${CS_SETTLE.트랙.length}개 트랙의 합의금 합계 — 같은 사건의 형사 벌금은 ${CS_SETTLE.형사벌금_USD}이었다`,
    value: CS_SETTLE.합계_USD,
    decimals: 0,
    unit: `(US$ · ${CS_SETTLE.트랙.map((t) => `${t.이름} ${t.금액_USD.toLocaleString('ko-KR')}`).join(' · ')}. 여기에 워싱턴주 동의명령 ${CS_SETTLE.주정부_USD.toLocaleString('ko-KR')} 달러가 따로 있고, 월마트·크로거 등 개별 합의는 금액이 공개되지 않아 총액은 정할 수 없다. 형사에서는 StarKist 가 ${CS_SETTLE.형사_StarKist_USD.toLocaleString('ko-KR')}, Bumble Bee 가 ${CS_SETTLE.형사_BumbleBee_USD.toLocaleString('ko-KR')} 달러를 냈고 이 회사는 기소 자체가 없었다 — 법무부가 기소한 법인은 둘, 개인은 넷이다)`,
    accent: COSI_ACCENT,
  },
  secondaryKpis: [
    {
      label: '민사 합의의 크기를 재는 자 — 최종소비자 쪽 전문가가 계산한 이 회사의 과징액',
      value: CS_SETTLE.전문가추정_USD,
      decimals: 0,
      unit: `(US$ · 최종소비자 합의금은 그 3분의 1 수준이다. 합의 상한 ${Number(cosiStats['합의_최종소비자_상한_USD']).toLocaleString('ko-KR')}(합의금 ${Number(cosiStats['합의_최종소비자_합의금_USD']).toLocaleString('ko-KR')} + 관리비 최대 ${Number(cosiStats['합의_최종소비자_관리비상한_USD']).toLocaleString('ko-KR')})과 총 합의이익에 산입된 실현액 ${Number(cosiStats['합의_최종소비자_USD']).toLocaleString('ko-KR')} 을 섞어 쓰지 않는다. 법원은 ${cosiStats['사면_근거조항']}에 따른 사면 신청자 지위를 인정해 법률상 최대 노출을 자기 매출분의 단일 손해로 적었고, 가장 먼저 합의해 다른 피고의 합의를 끌어낸 점을 들어 할인을 받아들였다. 모회사는 2019년 2분기에 이 소송 몫으로 추가로만 ${CS_SETTLE.모회사추가충당_USD.toLocaleString('ko-KR')} 달러를 충당했다)`,
    },
    {
      label: '미국 상온 수산물 시장 금액 점유율 (2025-12-28 종료 52주)',
      value: CS_SHARE.연도별[2].pct,
      decimals: 1,
      unit: `(% · ${CS_SHARE.연도별[0].연도}년 ${CS_SHARE.연도별[0].pct} % → ${CS_SHARE.연도별[1].연도}년 ${CS_SHARE.연도별[1].pct} %(${CS_SHARE.연도별[1].기준}) → ${CS_SHARE.연도별[2].pct} %(${CS_SHARE.연도별[2].기준}). 분모는 참치가 아니라 ${CS_SHARE.분모}다 — 제9연방항소법원이 2022년에 적은 「세 회사가 미국 포장참치의 ${CS_SHARE.포장참치_3사_pct} % 초과」는 분모가 참치만이라 같은 문장에 넣을 수 없다. 자매 브랜드 Genova 도 2024년 보고서에서는 프리미엄 참치 분모로 ${cosiStats['Genova_2024_프리미엄참치_pct']} %, 2025년 보고서에서는 상온 수산물 분모로 ${cosiStats['Genova_2025_상온수산물_pct']} % 다)`,
    },
    {
      label: `모회사 재무제표 주석의 미국 매출 (${CS_US_2025.연도}년 · 고객 소재지 기준)`,
      value: CS_US_2025.천바트,
      decimals: 0,
      unit: `(천 바트 · 그룹 매출의 ${CS_US_2025.비중_pct} %. ${CS_US_2021.연도}년 ${CS_US_2021.천바트.toLocaleString('ko-KR')} 천 바트 ${CS_US_2021.비중_pct} % 에서 네 해 사이에 금액으로 ${CS_US.감소_pct} % 줄었다. 2026년 1분기는 ${CS_US.분기_2026_1Q_천바트.toLocaleString('ko-KR')} 천 바트다. 이 안에서 ${CS_US.그룹공장분_pct_pt} %포인트가 그룹 공장 가공분이고 ${CS_US.그룹밖_pct_pt} %포인트는 그룹 밖 공장에서 왔다 — 그룹의 미국 매출이지 이 브랜드의 매출이 아니다. 브랜드 단위 손익은 어느 공시에도 없다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '사면',
      title: '셋이 같은 값을 올렸는데 하나만 기소되지 않았다',
      body: `${cosiStats['사면공시일']} 태국 증권거래소 공시가 미국 자회사 Tri-Union Seafoods 의 조건부 사면을 적는다 — 「법무부에 계속 충분히 협력하는 한, 회사도 수사 범위 안에서 협력하는 임직원도 형사벌금이나 수감, 기소를 받지 않는다.」 사면은 먼저 자백한 첫 참가자에게만 주고 둘째부터는 받지 못한다. 법무부가 이 사건에서 기소한 법인은 ${cosiStats['기소_법인_수']}, 개인은 ${cosiStats['기소_개인_수']}이고 그 명단에 이 회사와 그 임직원은 없다. 민사에서 셋이 모두 합의금을 낸 것과 형사에서 셋 중 둘만 기소된 것은 다른 사실이다`,
    },
    {
      eyebrow: '로인',
      title: '공장이 사는 것은 생선이 아니라 반제품이다',
      body: `주 환경보호국 허가 문서의 공정 목록은 입고 → 해동 → 손질·조미 → 캔 충전 → 레토르트 → 출고이고 원료는 프리쿡 로인·육수·캔·대두유와 올리브유·소금이다. 배를 대는 항구도 생선을 쪄 내는 자숙 설비도 이 목록에 없다 — 통마리를 살덩어리로 바꾸는 공정은 이 공장 밖에서, 대개 다른 나라에서 끝난다. ${cosiStats['공장_발표일']} 조지아 주지사 발표는 투자 ${Number(cosiStats['공장_투자발표_USD']).toLocaleString('ko-KR')} 달러에 일자리 ${cosiStats['인력_약정_2009_명']}개였고 창호회사가 쓰다 비운 건물에 들어가 ${cosiStats['공장_가동_연월']}에 돌기 시작했다. 라인 대수·분당 속도·부지 면적·명판 능력은 어느 공개 문서에도 없다`,
    },
    {
      eyebrow: '관세',
      title: '주 5일이 주 4일이 됐다',
      body: `태국에 걸린 상호관세는 2025년 4월 발표에서 ${cosiStats['태국_상호관세_발표_pct']} % 였다가 ${cosiStats['태국_상호관세_조정일']}에 ${cosiStats['태국_상호관세_조정_pct']} % 로 조정됐고, 회사는 그 뒤로도 냉동참치에 ${cosiStats['냉동참치_관세_하한_pct']}~${cosiStats['냉동참치_관세_상한_pct']} % 가 붙는다고 말한다. 공장은 관세 전에 ${cosiStats['비축_개월_하한']}~${cosiStats['비축_개월_상한']}개월치를 쌓아 두고 풀가동했고 비축분이 떨어지자 주 ${cosiStats['조업일_전_일주']}일에서 주 ${cosiStats['조업일_후_일주']}일로 내려갔다. 2026년 2월 보도에서 가을 이후 관세 부담이 ${Number(cosiStats['관세부담_2026_02_USD']).toLocaleString('ko-KR')} 달러를 넘었다고 했고, 모회사는 관세가 그룹 영업이익을 ${Number(cosiStats['모회사_관세_영업이익영향_천바트']).toLocaleString('ko-KR')} 천 바트 줄인 것으로 추정하며 라이언스의 일부 품목을 태국과 가나로 옮긴다고 적었다. 문을 닫은 것이 아니라 조업일이 줄었다`,
    },
    {
      eyebrow: '원산지',
      title: '캔 바닥을 보라고 적혀 있다',
      body: `회사 제품 페이지는 원산지 칸에 나라를 적지 않고 추적 코드를 안내한다. 실제로 청크라이트 기름캔 5 oz 는 ${cosiStats['원산지_기름캔_5oz']}, 물캔 5 oz 는 ${cosiStats['원산지_물캔_5oz']}, 고등어 파우치 3,53 oz 는 ${cosiStats['원산지_고등어파우치']}다. 4,5 oz 클럽캔은 가나 선적 어선이 잡은 참치를 가나에서 로인으로 만들고 폴란드에서 캔에 채웠는데 세관 사전판정(${cosiStats['세관판정번호']}, ${cosiStats['세관판정일']})은 원산지를 가나로 봤다 — 나라를 바꿀 만큼 성질이 변하는 지점은 통마리를 로인으로 바꾸는 쪽이지 그 로인을 채워 봉하는 쪽이 아니다. 라이언스 공장이 하는 일도 뒤쪽이다`,
    },
  ],
  briefing: proseBriefing('cosi'),
  narratives: inlineReport('cosi', proseStages('cosi')),
  chartSlots: {},
  continuous: true,
  sourceNotes: cosiSourceNotes,
  sourceMeta: [
    `${cosiMeta.회사} · ${cosiMeta.국가} · ${cosiMeta.업종}`,
    `출처 ${cosiMeta.출처}`,
    `조사 ${cosiMeta.조사일}`,
  ].join(' · '),
};

const KINGFISHER_ACCENT = '#1f5e52';

/** 도쿄가 쥔 몫과 나디에 겹친 법인 셋, 그리고 갈린 증서 셋. */
const KF_VOTE = voting();
const KF_PLANT = plants();
const KF_CERT = certs();
const KF_SEAPAC = KF_PLANT.거점[0];
const KF_KFF = KF_PLANT.거점[1];
const KF_HOLD = KF_PLANT.거점[2];
const KF_LIVE = KF_CERT.filter((c) => c.살아있나);

/** 화면은 ko-KR 자릿수(1,028명)를 쓴다. 소수점까지 쉼표로 적으면 50,70 이 천 단위로 읽혀
 *  발행본의 유럽식 표기를 여기서는 점 소수로 옮긴다 — 값은 그대로다. */
const kfPct = (v: number, d = 2) => v.toFixed(d);

const KINGFISHER_SPEC: CommoditySpec = {
  key: 'company-anatomy-kingfisher',
  title: '기업 해부: Kingfisher Holdings',
  subtitle:
    '태국 사뭇사콘 나디와 사뭇쁘라깐 방푸, 남쪽 송클라에 공장을 둔 참치·펫푸드 가공 그룹이다. 그런데 지주회사 Kingfisher Holdings 의 의결권 50.70 % 는 일본 상장사 Umios 가 쥐고 있고, 사업회사 SEAPAC 과 KF Foods 는 같은 모회사가 100.00 % 전부 간접으로 든다. ' +
    '지주회사의 등기 본점은 사뭇사콘이 아니라 방콕 야나와의 사무실 한 층이다 — 네 법인 가운데 KF Foods 만 등기 주소가 나디의 공장 자리다. 땅과 설비는 지주회사가 갖고 사업회사 둘에 빌려준다. ' +
    '그리고 방푸 공장은 소매협회가 감사한 생산범위 전체가 사람 아닌 것이 먹는 물건이다. 그 증서의 제외 항목 칸에 「없음」이라고 적혀 있다.',
  accent: KINGFISHER_ACCENT,
  primaryKpi: {
    label: `일본 상장사 ${kingfisherStats['모회사']} 가 쥔 지주회사 의결권 — 사업회사 둘은 ${kfPct(KF_VOTE.사업회사_pct)} % 전부 간접이다`,
    value: KF_VOTE.지주회사_pct,
    decimals: 2,
    unit: `(% · 괄호 안 간접분 ${kfPct(KF_VOTE.간접분_pct)} % 는 그 안에 든 값이다. 지주회사 ${kfPct(KF_VOTE.지주회사_pct)} % 와 사업회사 ${kfPct(KF_VOTE.사업회사_pct)} % 는 어긋나지 않는다 — 일본 공시의 間接所有割合은 자회사가 쥔 의결권을 액면 그대로 더해 적는 값이고, 같은 표에서 지주회사 자신이 50.70(7.47)로 적히는 것이 그 증거다. 어긋난 자리가 아니라 비어 있는 자리다: 사업회사 둘의 주식을 실제로 누가 쥐는지는 태국 주주명부에서만 나오고 그 명부는 유료다. 「일본 회사가 100 % 갖고 있다」는 틀린 문장이다)`,
    accent: KINGFISHER_ACCENT,
  },
  secondaryKpis: [
    {
      label: `나디 두 공장의 임시직 (${KF_PLANT.기준일} · 일본 유가증권보고서 주요 설비 표)`,
      value: KF_PLANT.임시직_두공장,
      decimals: 0,
      unit: `(명 · 같은 두 공장의 정사원은 ${KF_PLANT.정사원_두공장.toLocaleString('ko-KR')}명이다. ${KF_SEAPAC.법인} ${KF_SEAPAC.정사원.toLocaleString('ko-KR')}명[${(KF_SEAPAC.임시직 ?? 0).toLocaleString('ko-KR')}] · ${KF_KFF.법인} ${KF_KFF.정사원}명[${(KF_KFF.임시직 ?? 0).toLocaleString('ko-KR')}] · 가공을 하지 않는 ${KF_HOLD.법인}만 정사원 ${KF_HOLD.정사원}명에 임시직 칸이 비어 있다. 공시는 「임시」라고만 적는다 — 그 칸을 이주노동자로 옮겨 적으면 문서에 없는 뜻을 넣는 것이 된다)`,
    },
    {
      label: '지주회사 2024년 순이익률 (태국 상업등기소 기탁 재무)',
      value: Number(kingfisherStats['순이익률_Holdings_2024_pct']),
      decimals: 1,
      unit: `(% · 총수익 ${Number(kingfisherStats['총수익_Holdings_2024_바트']).toLocaleString('ko-KR')} 바트에 순이익 ${Number(kingfisherStats['순이익_Holdings_2024_바트']).toLocaleString('ko-KR')} 바트. 가공 수익성으로 읽지 않는다. 그렇다고 순수 지주회사도 아니다 — 일본 공시가 이 법인을 두고 관계회사에 제품을 판다고 적고, 태국 등기 업종은 냉동수산물 제조이며, 송클라에 유럽연합 승인번호 ${kingfisherStats['EU승인_송클라']} 를 가진 자체 공장이 있다. 배당인지 임대료인지 송클라의 영업이익인지는 공개 요약이 갈라 주지 않는다. 자본이 가장 큰 SEAPAC(${Number(kingfisherStats['자본_SEAPAC_2025_바트']).toLocaleString('ko-KR')} 바트)은 손익이 어느 해도 열리지 않는다)`,
    },
    {
      label: `${kingfisherStats['순위표_기준연']}년 주요 ${kingfisherStats['순위표_표본_수']}개사 표에서 참치 아홉 줄의 합 가운데 이 그룹 몫`,
      value: Number(kingfisherStats['참치몫_pct']),
      decimals: 1,
      unit: `(% · KF Foods ${Number(kingfisherStats['매출_KFFoods_2022_백만바트']).toLocaleString('ko-KR')} ÷ 아홉 줄 합 ${Number(kingfisherStats['참치9사합_백만바트']).toLocaleString('ko-KR')} 백만 바트. 그 표의 ${kingfisherStats['순위표_줄']}번째 줄이지 매출 ${kingfisherStats['순위표_줄']}위가 아니다 — 매출 순 정렬이 아니고 2번째 줄 CPF 는 매출 칸이 N/A 다. 1위 Thai Union ${Number(kingfisherStats['매출_ThaiUnion_2022_백만바트']).toLocaleString('ko-KR')} · 3위 Unicord ${Number(kingfisherStats['매출_Unicord_2022_백만바트']).toLocaleString('ko-KR')} · 6위 Pataya ${Number(kingfisherStats['매출_Pataya_2022_백만바트']).toLocaleString('ko-KR')} · 7위 Chotiwat ${Number(kingfisherStats['매출_Chotiwat_2022_백만바트']).toLocaleString('ko-KR')} 백만 바트. 정사원이 KF Foods 의 ${kfPct(Number(kingfisherStats['SEAPAC_인원_배']), 1)}배, 설비 장부가가 ${kfPct(Number(kingfisherStats['SEAPAC_설비장부가_배']), 1)}배인 SEAPAC 은 그 표에 아예 없다 — 표가 포괄하는 코드에 그 회사 코드가 들어가는데도 잡히지 않았다. 원자료 DBD·BOL 에 발행일 마스킹이라 등급 B 이고 전수 순위가 아니다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '지분',
      title: '경쟁사 넷 분의 일을 사기로 결정했다',
      body: `${kingfisherStats['Pataya_발표일']} Umios 가 Kingfisher Holdings 와 함께 태국 Pataya Food Industries 지분 ${kfPct(Number(kingfisherStats['Pataya_지분_pct']), 1)} % 를 취득하기로 결정했다고 발표했다 — 원문은 「取得することを決定」이고 산 것이 아니라 결정이다. 대금과 완료일은 공개되지 않았다. Pataya 는 Nautilus 브랜드를 가진 회사다. 그 브랜드는 이 그룹의 것이 아니었고, 이름이 비슷해 자주 혼동되던 두 회사가 이제 지분으로 묶인다. 태국 비공개 유한회사의 특별결의 요건은 출석 의결권의 4분의 3이라 ${kfPct(Number(kingfisherStats['Pataya_지분_pct']), 1)} % 가 거부권이 되는지는 출석률에 달렸다. 경영권은 아니다`,
    },
    {
      eyebrow: '고양이',
      title: '감사받은 생산범위가 통째로 펫푸드인 공장이 있다',
      body: `방푸 SP-1 증서(${kingfisherStats['BRC_방푸_증서']} · 등급 ${kingfisherStats['BRC_방푸_등급']} · 무예고 자발 감사 · ${kingfisherStats['BRC_방푸_발행']} 발행)의 감사받은 생산범위가 캔·파우치·스파우트파우치·플라스틱 컵에 담는 펫푸드로 끝나고 제외 항목 칸이 「${kingfisherStats['BRC_방푸_제외항목']}」이다. 나디 SP-2 증서(${kingfisherStats['BRC_나디_증서']})에는 펫푸드용 베이스와 사람이 먹는 어육·가금·쌀 베이스가 같이 적힌다. 러시아가 ${kingfisherStats['러시아_펫푸드제한일']} 현장검사 뒤 임시 제한한 것도 SEAPAC 의 펫푸드이고 2026년 9월 현재도 제한 상태다. 다만 매출에서의 몫은 어느 문서에도 없다 — 모회사는 태국 사업을 상온식품과 펫푸드로 묶어 목표만 말한다. 공개 기록에 자주 나온다는 것과 매출에서 크다는 것은 다른 말이다`,
    },
    {
      eyebrow: '임대',
      title: '그룹 안에 임대인이 있다',
      body: `일본 공시의 주요 설비 표에서 지주회사의 나디 사업장은 가공을 하지 않는다. 토지 ${KF_PLANT.토지_m2.toLocaleString('ko-KR')} ㎡(장부가 ${Number(kingfisherStats['장부가_Holdings_토지_백만엔']).toLocaleString('ko-KR')} 백만 엔)와 건물·기계를 갖고 그 설비를 SEAPAC·KF Foods 에 대여한다고 주석이 적는다. 임대인이 그룹 밖이 아니라 안에 있어 임대료가 그룹 밖으로 나가지 않고 지주회사의 수익이 된다. 같은 사업장의 정사원은 ${KF_HOLD.정사원}명이다 — 그 땅과 ${KF_HOLD.장부가_백만엔.toLocaleString('ko-KR')} 백만 엔어치 자산을 아홉 명이 관리하고, 옆 줄의 SEAPAC 은 같은 지역에서 ${KF_SEAPAC.정사원.toLocaleString('ko-KR')}명에 임시직 ${(KF_SEAPAC.임시직 ?? 0).toLocaleString('ko-KR')}명을 쓴다. 임차료 금액과 계약 기간은 어느 공개 문서에도 없다 — 특수관계자 주석이 유료벽 뒤에 있다`,
    },
    {
      eyebrow: '인증',
      title: '만료와 정지와 취소는 다른 말이다',
      body: `${KF_LIVE.map((c) => `${c.공장} 증서 ${c.증서} 는 만료 ${c.만료}, 등급 ${c.등급} 로 살아 있다`).join(' · ')}. 지난 것은 SEAPAC 두 공장의 공개본이다 — 방푸 ${kingfisherStats['BRC_방푸_만료']}, 나디 ${kingfisherStats['BRC_나디_만료']}. 어분·어유 인증(증서 ${kingfisherStats['어분인증_증서']})은 ${kingfisherStats['어분인증_정지일']} 정지됐다가 ${kingfisherStats['어분인증_재개일']} 재개돼 ${kingfisherStats['어분인증_만료']} 까지 유효하다. 유럽연합 승인번호는 송클라 ${kingfisherStats['EU승인_송클라']}·KF Foods ${kingfisherStats['EU승인_KFFoods']}·SEAPAC 나디 ${kingfisherStats['EU승인_SEAPAC나디']} 가 현행 목록에 있고 방푸의 옛 번호 2003 은 행이 없다. 이 명부들에 취소는 없다. 갱신본이 회사 페이지에 걸려 있지 않다는 것과 인증이 사라졌다는 것도 같지 않다 — 이 그룹은 남의 브랜드를 채우는 쪽이라 고객사가 요구하는 증서는 고객사와 인증기관 사이에서만 오갈 수 있다`,
    },
  ],
  briefing: proseBriefing('kingfisher'),
  narratives: inlineReport('kingfisher', proseStages('kingfisher')),
  chartSlots: {},
  continuous: true,
  sourceNotes: kingfisherSourceNotes,
  sourceMeta: [
    `${kingfisherMeta.회사} · ${kingfisherMeta.국가} · ${kingfisherMeta.업종}`,
    `출처 ${kingfisherMeta.출처}`,
    `조사 ${kingfisherMeta.조사일}`,
  ].join(' · '),
};

const CAPSEN_ACCENT = '#14635a';

/** 법이 정한 천장과 그 아래 놓인 배 넷, 그리고 움직이지 않는 장부 칸. */
const CP_CEIL = ceiling();
const CP_FLEET = fleet();
const CP_CERT = certification();
const CP_LEDGER = ledger();

/** 화면은 ko-KR 자릿수(6,800톤)를 쓴다. 발행본의 유럽식 소수 쉼표(49,00)를 여기서는
 *  점 소수로 옮긴다 — 값은 그대로다. 49,00 을 그대로 두면 천 단위로 읽힌다. */
const cpPct = (v: number, d = 2) => v.toFixed(d);
/** 천원 단위 공시값을 억 원으로 옮겨 적는다(1억 원 = 10만 천원). 반올림 값이라
 *  원문 자릿수는 같은 문장에 천 원 단위로 그대로 남긴다. */
const cpEok = (천원: number) => Math.round(천원 / 100_000);

const ST_ACCENT = '#1f5a6b';

/** 지분·손잡이·유럽·공장. 발행본의 확정 수치 정본에서만 값을 가져온다. */
const ST_Q = stEquity();
const ST_H = stHandles();
const ST_E = stEurope();
const ST_P = stPlant();

/** 화면은 ko-KR 자릿수를 쓴다. 발행본의 유럽식 소수 쉼표는 여기서 점 소수로 옮긴다. */
const stNum = (v: number, d = 0) => v.toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d });

const SOLTUNA_SPEC: CommoditySpec = {
  key: 'company-anatomy-soltuna',
  title: '기업 해부: SolTuna',
  subtitle:
    `솔로몬제도에서 유럽연합이 수산물 가공공장으로 승인한 시설은 노로의 이 공장 한 곳이다(${ST_E.승인번호}). 가공 법인 SolTuna Limited(회사등기 ${ST_Q.법인번호} · ${ST_Q.설립일} 설립)와 선단 법인 National Fisheries Developments(${ST_Q.NFD_법인번호} · ${ST_Q.NFD_설립일} 설립)가 같은 Tri Marine 그룹에 속한다. ` +
    '유럽연합이 2021~2025년에 이 나라에서 들여온 참치 조제품은 해마다 조리 로인이었고 캔은 역내와 태평양 매대로 간다. ' +
    `국가·공공 주주 셋이 공장 지분 ${stNum(ST_Q.국가공공_pct, 6)} %를 가졌지만 연금은 제 몫을 비지배 투자로 적고, 배를 가진 NFD 에는 한 주도 없다. 국가가 쥔 것은 공캔·뚜껑을 무세로 들이는 면제 명령의 갱신권이다. ` +
    '1973년 竿釣로 시작한 이 사업은 2024년에 竿釣를 멈췄고, 인증기관은 고객이 인증 대상 선박을 쓰지 않기로 한 이유를 운영상의 결정으로 전했다.',
  accent: ST_ACCENT,
  primaryKpi: {
    label: '유럽연합이 들여온 솔로몬제도산 참치 조제품(HS 1604.14) 가운데 조리 로인 세목의 몫 — 2021~2025년 해마다 (유럽연합 통계청 Comext CN8)',
    value: ST_E.로인비중_pct,
    decimals: 2,
    unit: `(% · 로인 세 세목 1604 14 26·36·46 을 더하면 여섯 자리 총계와 무게·금액이 오차 없이 맞는다. 캔·소매 여섯 세목과 Bonito 는 다섯 해 동안 0이고, 로인이 아닌 물량이 마지막으로 있던 해는 ${ST_E.비로인_마지막해}년이다. 물량은 ${stNum(ST_E.t2021, 1)} t(2021)에서 ${stNum(ST_E.t2024, 1)} t(2024, 최고)로 올랐다가 2025년 ${stNum(ST_E.t2025, 1)} t 으로 꺾였고 단가는 kg당 €${stNum(ST_E.EURkg2025, 2)} 다. 받은 나라는 이탈리아와 스페인이다 — 2024년 EU 로인 안에서 ${stNum(ST_E.이탈리아_pct, 2)} 대 ${stNum(ST_E.스페인_pct, 2)} 이고, 두 나라 밖 물량은 5년 통산 ${stNum(ST_E.두나라밖_pct, 2)} %로 2022년 한 해의 프랑스·라트비아 두 건이다. **무역통계는 나라까지만 가르므로 「모회사 공장으로 간다」로 읽지 않는다**)`,
    accent: ST_ACCENT,
  },
  secondaryKpis: [
    {
      label: '공장 SolTuna 의 국가·공공 지분 — SINPF + ICSI + 서부주 (회사등기 2026-09-24)',
      value: ST_Q.국가공공_pct,
      decimals: 6,
      unit: `(% · 선단 법인 NFD 는 ${ST_Q.NFD_국가공공_pct} %다. Tri-Marine International 이 ${stNum(ST_Q.TMI_pct, 4)} %를 갖고 국가 몫은 SINPF ${stNum(ST_Q.SINPF_pct, 4)} · ICSI ${stNum(ST_Q.ICSI_pct, 4)} · 서부주 ${stNum(ST_Q.서부주_pct, 4)} 이다. 발행주식 ${stNum(ST_Q.발행주식)} 는 100 으로 나누어떨어지지 않아 정확한 51 : 49 가 애초에 불가능하다. 연금은 제 몫을 「Other equity investments」로 적고 재무제표는 일상 운영을 Tri Marine 이 맡는다고 쓴다 — **등기와 재무제표에 국가의 경영 지배를 보여 주는 표지가 없다**(정관은 판독되지 않았다). 신주는 공장만 ${ST_Q.신주발행}번 냈고 NFD 는 ${ST_Q.NFD_신주발행}번이다. 이사회도 갈린다: SolTuna 는 ${ST_Q.이사}명 중 ${ST_Q.이사_솔로몬}명이 솔로몬 국적이고 NFD 는 ${ST_Q.NFD_이사}명 중 ${ST_Q.NFD_이사_솔로몬}명이다)`,
    },
    {
      label: '국가가 쥔 손잡이 — SolTuna 의 공캔·뚜껑·포장재 면제 두 건의 포기 세액 (관보 LN 590·591)',
      value: ST_H.합,
      decimals: 0,
      unit: `(SBD · 물품세 ${stNum(ST_H.LN590)} + 관세 ${stNum(ST_H.LN591)}. 두 명령 다 2025-08-01 에 서명돼 **${ST_H.기간}** 동안 유효하고, 공캔·뚜껑·라벨·포장재·실험 자재가 열거돼 있다. 둘 다 **양도할 수 없고 분기마다 보고해야 하며 어기면 무효**다(관보 719~720쪽). NFD 도 선박 한 척에 SBD ${stNum(ST_H.LN411, 2)} 를 면제받았다(LN 411). **특별대우로 읽지 않는다** — 관보 한 호(2025-02-14)에만 100 % 면제가 ${ST_H.같은관보}건이다. 캔참치 가격통제도 이 회사를 겨냥하지 않는다: 1987년부터 ${ST_H.가격통제_품목수}개 생필품 가운데 ${ST_H.가격통제_순번}번이고 통제구역 ${ST_H.가격통제_구역수}곳에 **노로가 없다.** 같은 지면의 다음 공고(LN 592, 다이빙 장비 물품세 면제)도 양도금지·분기보고·무효 규정을 둔다 — SolTuna 에만 붙은 조건이 아니다. **반복도 관보에 없다**: 2025-01 ~ 2026-07-08 관보의 물품세·관세 면제 공고 ${stNum(ST_H.관보공고_하한)}여 건에서 SolTuna 명의는 이 ${ST_H.SolTuna공고}건뿐이다. 만료 뒤 새 명령도 아직 게재되지 않았지만, 그 기간에 실린 면제는 2025-12-12 서명분이 마지막이라 갱신 여부는 아직 판정할 수 없다)`,
    },
    {
      label: '국가 竿釣 어획 — 2022년과 2024년 (정부가 WCPFC 에 낸 연례보고서, 2026-07-07)',
      value: ST_P.竿釣[1],
      decimals: 0,
      unit: `(t → **0 t** · 2021 ${stNum(ST_P.竿釣[0])} · 2022 ${stNum(ST_P.竿釣[1])} · 2023 ${stNum(ST_P.竿釣[2])} · 2024 ${ST_P.竿釣[3]} · 2025 ${ST_P.竿釣[4]}. 2025년에는 국내수역 竿釣 면허가 ${ST_P.竿釣_면허_2025}장이다. ${ST_P.竿釣_시작}년에 竿釣로 시작한 사업이다. 인증기관이 피어리뷰 응답 열에 적은 이유는 「operational decisions (e.g. targeting other species, fishing outside the UoA, or due to economic reasons)」이고 「they want the option to use the certificate if conditions change」다 — **자원 상태는 그 예에 없고, 인증 범위는 살려 뒀다.** 1991년 노조 판정문에서 가장 큰 직군이 Pole and Line Fleet ${ST_P.인원_竿釣}명(총원 ${stNum(ST_P.인원_총원)}, 캐너리 ${ST_P.인원_캐너리})이었다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '하나',
      title: '승인 가공공장은 한 곳이고, 유럽행 조제품은 로인이다',
      body: `유럽연합 제3국 승인 명부에서 솔로몬제도의 현행 수산물 항목은 ${ST_E.명부건수}건이고, 가공공장(PP) 승인은 노로 1 Tuna Drive 한 주소(${ST_E.승인번호})에만 붙어 있다. IFC 는 2013년 사업 공시에서 이 회사를 「sole tuna loining and canning processor」로 적었다. 유럽으로 가는 것은 캔이 아니다 — 2021~2025년 이 나라에서 들어간 참치 조제품은 해마다 조리 로인이었다. 원료 쪽 진술도 있다: 2014-12-12 채택된 유럽연합 옐로카드 결정(2014/C 447/09)의 전문 (27)·(28)은 **한 참치 가공공장 운영자**의 말을 싣는다 — 유럽행 조리 로인·플레이크에는 솔로몬 국기 선망선 어획만 쓰고, 나머지 원료는 연승선에서 받아 주로 미국·역내 시장으로 보낸다는 진술이다. 결정의 대상은 회사가 아니라 나라였고 레드카드로 가지 않았다(2017-02-24 종료, 2017/C 60/05)`,
    },
    {
      eyebrow: '지분',
      title: '국가는 공장에만 들어가 있다',
      body: `SolTuna 의 주주는 넷이다 — Tri-Marine International ${stNum(ST_Q.TMI_pct, 4)} %, 국가연금(SINPF) ${stNum(ST_Q.SINPF_pct, 4)} %, 국영투자공사(ICSI) ${stNum(ST_Q.ICSI_pct, 4)} %, 서부주 집행부 ${stNum(ST_Q.서부주_pct, 4)} %. 선단 법인 NFD 의 주주 칸은 Tri Marine International 한 줄이다. 두 회사의 현 등기본점은 호니아라의 같은 건물 같은 층이고 대리인만 다르다. **돈이 들어간 쪽이 갈린다** — 2011년 이후 SolTuna 에는 신주발행 신고(Form 8)가 ${ST_Q.신주발행}건 쌓였고 NFD 에는 없다. 마지막 증자(2024-10-29 신고, 42,000,000주)는 기존 지분율을 재현하지 않고 **약정 51 : 49 로 정액 배분**했다 — Tri Marine 몫 21,420,000주가 증자분의 정확히 51 %다. 명의 이전은 Bolton 인수(2019-07-03)보다 앞선다: NFD 는 2017-01-01, SolTuna 는 2017-12-19 에 네비스의 TOOH 에서 싱가포르의 TMI 로 옮겨졌다`,
    },
    {
      eyebrow: '부두',
      title: '인증 물량은 부두에서 주인이 바뀐다',
      body: `MSC 재심사 보고서는 「When catch is unloaded in Noro, ownership changes and catch becomes property of Tri Marine International as a trading agent. It is then sold to SolTuna」라고 적는다 — 노로에 양륙하는 순간 싱가포르의 Tri Marine International 이 거래대리인으로 소유권을 받고 그 뒤 공장에 판다. **그 칸이 묻는 것은 인증 어업(「from the certified fishery」)의 어획물**이다. 현지 면허 외국기 연승선의 알바코어에 같은 순서가 적용됐는지는 문서에 없다. 이름과 명의도 갈린다: 「Kitano」는 소유 회사가 아니라 1992년 일본 무상원조(Noro Infrastructure Development Project Phase 2)의 시공사 이름이다. 2013년 고등법원([2013] SBHC 158)이 다룬 냉장창고는 SIPA 가 정부를 대리해 관리하는 국가 자산이고 SolTuna 는 2011-02-24 계약으로 월 SBD 25,000 에 빌렸다 — 법원은 서부주로의 무상 이전을 취소하면서 SolTuna 의 점유 권리(overriding interest)를 인정했다. 유럽연합 명부의 Kitano Cold Store 는 별도 승인번호(SI-02-01-004-NFKCS1)이고 SolTuna 의 번호에는 가공공장 활동만 붙는다. 명부는 그 건물을 판결의 필지와 지번으로 잇지 않는다`,
    },
    {
      eyebrow: '전기',
      title: '한 마을에 계통이 두 개다',
      body: `공장은 디젤 자가발전(${ST_P.자가발전_구성} = ${stNum(ST_P.자가발전_MW, 1)} MW, IFC ESRS 2013)으로 돌고, 노로에는 Solomon Power 의 공공 계통이 따로 있어 2025-12 에 고객 ${ST_P.계통_고객}호에 전기를 댄다. 그 계통은 아시아개발은행 차관(Loan 0803-SOL)으로 1986~1989년에 ${stNum(ST_P.ADB_MW, 1)} MW 발전소와 배전망이 선 것이고 지금은 문다와 지중 케이블로 이어진다. 둘 사이의 거래는 끊겼다 — 2014년 전력청이 SolTuna 에서 산 예비전력이 0.05 GWh 였고 이듬해 보고서는 「there was no energy bought from Soltuna PPA during the year」라고 적는다. 규모 차이가 크다: 2013년 지방 발전 거점 여덟 곳의 설치용량을 모두 합쳐 ${ST_P.지방거점_MW} MW 였고 공장 자가발전 한 곳이 그 ${ST_P.자가발전_몫_pct} %였다. **Bolton 지속가능보고서의 「in the absence of a local grid infrastructure」는 마을 전체에 적용하면 맞지 않는다.** 노로는 Solomon Power 의 solar hybrid 명단 12곳에 없고, Bolton 은 노로에 신규 발전동과 냉동창고를 지어 2026년 말 준공할 예정이다`,
    },
    {
      eyebrow: '배',
      title: '배를 가진 회사가 스물네 해 먼저 섰다',
      body: `NFD 는 ${ST_Q.NFD_설립일}, 공장 법인 SolTuna 는 ${ST_Q.설립일} 에 섰다. NFD 선망은 WCPFC 등록부의 NFD 명의 6척에, 등록부에 없는 SOLOMON DIAMOND(IMO 1027524 · 2024-05-25 진수)를 Bolton 의 「NFD FLEET」 표가 더해 ${ST_Q.NFD_자사선망}척이다. 솔로몬 국기 선망에는 주인이 하나 더 있다 — Southern Seas Logistics 가 자사선 ${ST_Q.SSL_자사선망}척에 **중국 국기 용선 ${ST_Q.SSL_용선선망}척**을 쓴다. 7 대 7 은 척수가 같을 뿐 소유 구조는 다르다. NFD 는 따로 대만 국기 연승선 ${ST_Q.NFD_용선연승}척을 용선한다. NFD 가 잃은 선망 두 척(SOLOMON TOPAZ · SAPPHIRE)은 2020-05 베네수엘라로 팔려 이름이 바뀌었고 폐선된 배가 아니다. 竿釣는 멈췄지만 채낚기 인증 범위(MSC-F-30002)는 Certified 로 남아 있다`,
    },
    {
      eyebrow: '공장',
      title: '150 t/일은 2019년까지의 목표였고, 수단은 교대였다',
      body: `2013년 IFC 공시의 하루 가공능력은 ${ST_P.능력_2013}톤이고 ${ST_P.능력_목표}톤은 ${ST_P.능력_목표연도}년까지의 목표다. 증산 수단으로 기록된 것은 설비가 아니라 교대다 — 수산부 관리계획 초안(DRAFT V6)은 「a second shift has been established at the SolTuna Processing Plant – employing more than 500 new staff – to process albacore tuna」라고 적는다. 150톤 도달을 입증하는 1차 자료는 없다. IFC 대출(최대 US$10 M)의 공개 용처에도 가공 라인이 없다 — ESRS 는 선착장·디젤 저장·폐수처리장·사택을, 사업 브리프는 디젤 저장 대신 냉동창고를 적는다. 폐수처리장은 2007년 쓰나미로 부서졌고 2013-04 공시 때도 가동 중인 것이 없었다. 두 번째 공장(Bina Harbour)은 토지 확보와 개념설계까지 기록됐고 운영사와 건설 자금은 정해지지 않았다`,
    },
    {
      eyebrow: '사람',
      title: '1991년에는 배에 탄 사람이 공장 사람보다 많았다',
      body: `1991년 노조 판정문([1991] SBTDP 2)은 총원 ${stNum(ST_P.인원_총원)}명을 아홉 직군으로 나눠 적는다. 가장 큰 직군이 Pole and Line Fleet ${ST_P.인원_竿釣}명이고 캐너리는 ${ST_P.인원_캐너리}명이며, 선단과 운반선에 적힌 사람을 합치면 ${ST_P.인원_선단운반선}명이다. 파업은 ${ST_P.파업}번 기록돼 있다: 1984-09-26(식량 대체수당 폐지), 1985-11-29(툴라기 기지, 선원 해고 뒤), 1990-05-11(최저임금 요구). 1990년 파업에 회사가 노조를 상대로 낸 손해배상 청구 SBD 913,617.78 은 전부 기각됐다([1991] SBHC 55). 1991년 회사는 노조 인정을 철회했다 — 조합원이 자격자 1,514명 중 706명으로 인정 협정의 50 % 문턱에 못 미쳤다. 지금 인원은 SolTuna 와 NFD 를 함께 센 국가 단위 값(2024-12-31 2,208명 → 2025-12-31 1,895명)이라 1991년 총원과 같은 경계가 아니다`,
    },
  ],
  briefing: proseBriefing('soltuna'),
  narratives: inlineReport('soltuna', proseStages('soltuna')),
  chartSlots: {},
  continuous: true,
  sourceNotes: soltunaSourceNotes,
  sourceMeta: [
    `${soltunaMeta.회사} · ${soltunaMeta.국가} · ${soltunaMeta.업종}`,
    `출처 ${soltunaMeta.출처}`,
    `조사 ${soltunaMeta.조사일}`,
  ].join(' · '),
};

const RD_ACCENT = '#2f6b4f';

/** 두 문·마당 공장·법원·약속·매대. 발행본의 확정 수치 정본에서만 값을 가져온다. */
const RD_G = rdGates();
const RD_M = rdMadang();
const RD_C = rdCourts();
const RD_P = rdPromises();
const RD_S = rdShelf();

/** 화면은 ko-KR 자릿수를 쓴다. 발행본의 유럽식 소수 쉼표는 여기서 점 소수로 옮긴다. */
const rdNum = (v: number, d = 0) => v.toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d });
/** 키나 금액을 백만 단위로 줄여 적는다. 원문 자릿수는 같은 문장에 남긴다. */
const rdM = (키나: number) => Math.round(키나 / 1_000_000);

const RD_SPEC: CommoditySpec = {
  key: 'company-anatomy-rd',
  title: '기업 해부: RD Corporation',
  subtitle:
    '참치 캔공장을 두 나라에 나눠 가진 그룹이다. 파푸아뉴기니 마당의 R.D. Tuna Canners Limited(회사등록 1-22587 · 구 상호 KAPIAPUL PTY. LIMITED)와 필리핀 제너럴산토스 탐블러의 PHIL. BEST CANNING CORP.가 축이다. ' +
    '유럽연합이 2012년에 발주한 연구가 그 두 나라를 같은 표에서 재는데, 마당 쪽은 인건비가 30 % 비싸고 생산성이 20 % 낮다. 그런데 두 공장 다 유럽에 무관세로 들어간다 — 다른 것은 원료의 국적을 묻는가다. ' +
    '마당은 묻지 않고(경제동반자협정 원산지 의정서 Ⅱ 제6조 6항 (b)의 전면적 조달 예외) 탐블러는 묻는다(일반특혜관세의 어선 기국·등록·소유 요건). 그리고 그 문을 실제로 여닫는 것은 원산지 서류가 아니라 위생 승인이다 — 2012년 연구는 피지가 위생 미비로 같은 문을 쓰지 못했다고 적었고(피지는 2025-04-08 에 통보했다), 이 공장도 2008년에 같은 이유로 한 해 동안 유럽 시장에서 배제됐다. ' +
    '마당의 두 번째 공장은 열세 해째 짓겠다는 말로 남아 있다. 2013년에는 「착공 임박」이었고, 그 앞에는 같은 번지에 등록돼 연차보고를 한 번도 내지 않고 말소된 법인이 있었으며, 지금은 국가와의 합작 협정이 서명됐는데 그 합작법인이 등기에 없다.',
  accent: RD_ACCENT,
  primaryKpi: {
    label: '마당 공장의 가동률 — 정격 능력 대비 실제 처리량 (유럽의회 연구 PE 474.562 표 2)',
    value: RD_M.가동률_pct,
    decimals: 0,
    unit: `(% · 정격 ${RD_M.정격_t일} t/일에 실제 처리 ${RD_M.실제_t일} t/일. 그 안에서 로인이 ${RD_M.로인_t일}, 캔이 ${RD_M.캔_t일} 이고 제관 설비를 공장 안에 갖는다. 부지는 ${rdNum(RD_M.면적_ha, 2)} 헥타르이고 자가발전이 ${rdNum(RD_M.자가발전_MW, 1)} 메가와트다. **능력 값은 다섯이라 한 값으로 적을 수 없다** — 2012년 표의 정격 200·실제 120, 2019년 표의 140, 2020년 회사 카탈로그의 150 MT, 2025년 설치 150~160(등급 C), 2025년 11월 가동 약 120(회사 발언, 등급 C)이다. 2012년의 실제 처리량과 2025년의 가동량이 둘 다 120 인데 그 사이에 명판만 내려 적힌다. 사람 쪽은 세 자가 다르다: 표 2 의 ${rdNum(RD_M.인원_정규직)} 은 열 이름이 「정규직 자리」이고, 같은 쪽 급여명부가 ${rdNum(RD_M.급여명부)} 이며, 국적 구성 합이 ${rdNum(RD_M.국적합)} 이다)`,
    accent: RD_ACCENT,
  },
  secondaryKpis: [
    {
      label: '회사 방침으로 적힌 월 신규 생산직 채용 인원 (연구 인쇄 173쪽)',
      value: RD_M.채용_월,
      decimals: 0,
      unit: `(명 · 연 ${rdNum(RD_M.채용_연)}명이고 정규직 자리 ${rdNum(RD_M.인원_정규직)} 의 ${rdNum(RD_M.채용_몫_pct, 1)} %다. 같은 연구의 근속 표는 10년 이상을 약 ${RD_M.근속10년}명으로 적는다 — 2.800 자리의 5 % 남짓이다. 그 위에 결근율과 생산성 판단이 얹힌다: 현장조사가 확인한 결근율이 하루 약 ${RD_M.결근_pct} %이고, 생산성은 필리핀 기준 대비 ${RD_M.생산성열위_pct} % 낮다고 적힌다. **「라에 20 %·마당 30~40 %」라는 값도 같은 연구에 있으나 인용된 수치이고 로인 작업자에 한정되며 연구가 그 문장에 회사 이름을 적지 않는다.** 감독직은 ${RD_M.감독_총}석 가운데 ${RD_M.감독_현지}석이 현지인이다. 캐너리 노동자의 70 %가 여성이고 그중 80~90 %가 생산라인이라는 값은 **나라 단위**이지 이 공장 한 곳의 구성이 아니다)`,
    },
    {
      label: '제조물 소송 1심에서 회사가 진 건수와 대법원에서 남은 건수',
      value: RD_C.일심건수,
      decimals: 0,
      unit: `(건 → **0건** · ${RD_C.제소}년 제소 · ${RD_C.일심일} 하루에 여섯 건이 선고돼 전부 과실이 인정됐고(N6645~N6650), **여섯 건 모두 항소심에서 파기**됐다 — 한 건은 ${RD_C.파기1건일}(미공간), 다섯 건은 ${RD_C.파기5건일} 에 「항소를 인용한다. 2017년 2월 15일자 국가법원 명령을 파기한다」로 끝났다. **파기 이유는 1심이 개연성 판단의 이유를 적지 않았다는 절차 흠이고 대법원은 이물 유무를 판단하지 않았다.** 회사의 「시험사건 하나로 정리하자」는 주장은 거절됐다. 배상액은 여섯 건 다 책임 단계에서 끝나 산정에 이르지 않았다. 소송은 이 갈래만이 아니다 — 태평양 법률정보원에서 이 회사 이름으로 ${RD_C.PacLII문서}건이 검색되고 당사자인 사건은 **${RD_C.갈래수} 갈래**다: 건설계약(1998)·관습지(2000)·고용(2010)·제조물. 고용 사건은 **회사가 졌다**(${RD_C.고용판결일}) — 절도 혐의 뒤 ${RD_C.고용지연_개월}개월 넘게 기다렸다가 해고해 요건을 어겼고 4주치 급여도 주지 않았다)`,
    },
    {
      label: '국가와의 합작 캔공장 법인이 파푸아뉴기니 등기에 올라 있는 건수',
      value: RD_P.합작법인등기,
      decimals: 0,
      unit: `(건 · 2025년 12월에 사업개발협정이 서명됐고 정부 쪽 지분 실체는 국가 지주회사 ${RD_P.정부지분_pct} %다. **대조군이 선다** — 같은 등기에서 경제특구 법인 12건이 잡히고 그중 하나가 2025년 6월에 등기됐다. 예산서는 그 합작법인을 이름으로 부르는데 그 이름이 등기에 없고, 같은 문단의 형제 법인은 2021년부터 해마다 보고를 낸다. 국가 몫 8.000만 키나는 배정액도 사업코드도 없고 상태 설명 한 줄뿐이며 **2025년판과 2026년판이 글자 그대로 같다.** 숫자가 반대로 움직였다: 투자액은 ${rdM(RD_P.투자액_2023)}백만 키나에서 ${rdM(RD_P.투자액_2025)}백만 키나로 뛰었는데 계획 능력은 ${RD_P.능력_2025} t/일에서 ${RD_P.능력_2026} t/일로 내려갔다. **구역은 아직 특구가 아니다** — 특구청 직무대행 대표가 2026년 5월에 직접 부인했고 7월 시점에 라이선스 신청도 없었다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '두 문',
      title: '세율은 같고 원산지 규칙이 다르다',
      body: `이 그룹의 두 공장은 유럽에 같은 세율로 들어간다. 둘 다 0 %다. 파푸아뉴기니는 잠정 경제동반자협정(잠정적용 ${RD_G.EPA잠정적용}), 필리핀은 일반특혜관세(${RD_G.GSP개시} 수혜)로 온다. 다른 것은 그 0 %를 받기 위해 무엇을 증명해야 하는가다. **마당은 원료의 국적을 묻지 않는다** — ${RD_G.조달예외조항}의 전면적 조달 예외가 자국 항구에 양륙해 육상에서 가공한 것을 원산지로 본다. 보통의 수산물 원산지 규정은 어느 나라 배가 잡았는지로 통조림의 국적을 정하는데 이 조항이 그 고리를 끊는다. 그 예외가 실제로 하중을 받는다: 2019년에 마당 공장에 원료를 대던 어선 15척 가운데 13척이 현지에 기반을 둔 외국 국적선이었다. **탐블러는 묻는다** — 어선의 기국·등록·소유가 원산지를 정하고, 다른 수혜국과의 누적은 가능하되 **파푸아뉴기니는 그 명부에 없다.** 조문 쪽도 정확히 적어 둔다: ${RD_G.의정서대체} 이 ${RD_G.의정서대체발효} 자로 의정서를 통째로 대체했고, 조문이 요구하는 것은 **수량의 「표시」이지 상한이 아니다**(통보는 ${RD_G.통보일} 에 실재한다). 미충족 시 최혜국 세율은 ${RD_G.MFN_pct} %다`,
    },
    {
      eyebrow: '열쇠',
      title: '문을 여는 것은 원산지 서류가 아니라 위생 승인이다',
      body: `전면적 조달 예외만 보면 문이 아주 넓다. 그런데 같은 연구 안에 그때까지 그 문을 통과하지 못한 나라가 적혀 있다. 피지다. 같은 협정에 서명해 같은 조항을 쓸 자격이 있었는데 연구 시점까지 집행위원회에 통보하지 않았고, 연구는 그 이유를 **자국 참치산업의 위생검역 미비**로 설명한다(피지는 2025-04-08 에 통보했고 2025-07-30 유럽연합 관보에 고시됐다 · C/2025/4197). 유럽이 요구하는 위생 조건을 시설이 채우지 못하면 관세율이 0 %든 ${RD_G.MFN_pct} %든 배에 실을 수가 없다. 이 공장도 같은 자물쇠에 걸린 적이 있다: 2007/8년에 유럽연합 조사단이 **파푸아뉴기니의 한 대형 가공장에서 미비점을 발견해 그 공장이 1년간 유럽 시장에서 배제**됐고, 연구의 다른 쪽은 「한 가공업체의 일시적 등재말소, 2009년 재인증」이라 적는다. **나라 단위가 아니다** — 같은 해에 라에의 다른 공장은 오히려 생산이 늘었다. 그 승인은 시설 단위로 붙는다: 이 그룹의 네 거점 가운데 유럽으로 조제품을 실을 수 있는 번호를 가진 것은 마당(08EPR001)과 탐블러(1652) 둘이고 나머지 둘은 냉동창고 번호다. **회사가 적는 것과 규제가 등재하는 것이 갈리는 자리도 있다** — 칼룸팡을 회사 카탈로그는 「가공공장 셋」 중 하나로 적는데 유럽연합 명부와 필리핀 수산청 명부는 둘 다 냉동창고로만 올린다`,
    },
    {
      eyebrow: '조건',
      title: '무관세를 지탱하는 것이 노동권이다',
      body: `필리핀 쪽 통로는 성격이 다르다. 세율을 주는 대가로 요구하는 것이 어획 증명이 아니라 27개 국제협약의 비준과 이행이고, 그 이행을 집행위원회가 정기적으로 평가해 문서로 낸다. 2026년 7월에 나온 평가문서가 두 가지를 같이 적는다. 하나는 이 통로가 얼마나 쓰이는가다 — **어육 조제품 부문의 특혜 활용률이 ${rdNum(RD_G.활용률_pct, 1)} %**로 상위 다섯 부문 가운데 가장 높다. 다른 하나는 그 통로가 걸려 있는 조건이다: 결사의 자유에 대한 지적이 반복되고, **단체협약 적용률이 ${rdNum(RD_G.단체협약_pct, 1)} %**이며, 2026년 전문가위원회가 노조원 괴롭힘과 자의적 체포 주장이 계속된다고 적었다. 그리고 **시계가 셋이고 같은 방향으로 가지 않는다** — 제도는 규정 ${RD_G.신규규정} 로 ${RD_G.신규발효} 부터 ${RD_G.신규기간_년}년 더 가고, 이 나라의 자격은 세계은행이 ${RD_G.재분류일} 자로 고중소득국으로 재분류해(1인당 국민총소득 ${rdNum(RD_G.GNI_USD)} 달러) 3년 연속이면 졸업하며, 그 전에 유럽연합·필리핀 자유무역협정이 타결 직전이다. 파푸아뉴기니 쪽 통로는 기한이 아니라 잠정적용 상태라 **두 통로가 끝나는 방식 자체가 다르다**`,
    },
    {
      eyebrow: '약속',
      title: '같은 번지에 등록되고 한 번도 보고하지 않은 채 말소됐다',
      body: `마당에 공장을 하나 더 짓겠다는 이야기는 새것이 아니다. 이 그룹이 당사자였던 앞선 계획이 **Niugini Tuna Limited**(이 그룹 + 대만 어업사 + 미국 무역사)이고, 해양산업단지 안의 일 200톤 캔공장으로 정부와 협정까지 맺었으며 2012년 유럽의회 연구의 후보 표에 **성사 가능성 ${RD_P.viability_pct} %**로 올라 있다. 그 법인의 등기가 남아 있다: 회사번호 ${RD_P.법인번호}, ${RD_P.등기일} 등록, **등기 사무소가 ${RD_P.필지} — 이 그룹 캔공장과 같은 번지**이고, 외국인기업 인증의 업종 칸에 참치 캔닝과 어분 생산이 원문 그대로 적혀 있다. 그런데 **필링이 「설립」과 「말소」 두 줄뿐이다** — 첫 연차보고 기한이 ${RD_P.첫보고기한} 이었고 제출 기록이 ${RD_P.제출건수}건이며 ${RD_P.말소일} 에 재등록 불이행으로 말소됐다. **대조군이 선다**: 같은 계획의 대만 파트너(${RD_P.대만파트너번호})는 등록 상태를 유지하며 연차보고를 ${RD_P.대만파트너_보고년}년 연속 냈다. **등기의 다수주주 칸이 비어 있어 「이 그룹이 소유했다」로는 쓸 수 없다** — 같은 번지라는 것까지가 문서가 말하는 전부다. 그 계획들이 놓였던 해양산업단지 자체도 2015년에 9.500만 달러 공사 단계를 출범시키며 2018년까지 캔공장 아홉 곳을 말했는데, 2024년 평가 보고서는 **그 구역에 캔공장이 ${RD_P.PMIZ_캔너리}곳 지어졌다**고 적는다`,
    },
    {
      eyebrow: '매대',
      title: '같은 그룹이 나라마다 다른 칸에 선다',
      body: `필리핀 매대에서 이 그룹의 브랜드는 위쪽에 선다 — 90 g 올리브유가 kg당 ${rdNum(RD_S.필리핀_90g, 2)}달러, 185 g 이 ${rdNum(RD_S.필리핀_185g, 2)}달러다. 성분표가 그 자리를 설명한다: 이 브랜드는 황다랑어 청크와 올리브유와 물과 요오드 첨가 소금인데 같은 매대의 경쟁 네 브랜드는 모두 대두단백농축물이 들어가고, 브랜드 쪽이 그 차이를 광고 문구로 쓴다. 파푸아뉴기니 매대에서는 이 그룹의 캔이 ${rdNum(RD_S.PNG_최저, 2)}에서 ${rdNum(RD_S.PNG_최고, 2)}달러 구간에 걸쳐 있다 — **두 시장은 규격과 유통 단계가 달라 한 자로 잰 값이 아니다.** 유럽 쪽에서 이 그룹은 자기 이름으로 서지 않고 소매체인이 붙인 자체상표를 채운다. 다만 그 규모는 자료가 받쳐 주는 만큼만 적을 수 있다: 소비자 제품 등록에서 마당 공장코드가 찍힌 자체상표는 **${RD_S.유럽PB_마당건수}건**이고 필리핀 공장코드는 **${RD_S.유럽PB_필리핀건수}건**이다. 프랑스 자체상표 사다리는 ${rdNum(RD_S.프랑스PB_최저, 2)}에서 ${rdNum(RD_S.프랑스PB_최고, 2)}달러에 걸친다`,
    },
    {
      eyebrow: '이름',
      title: '같은 상표를 다른 대륙에서 다른 회사가 갖는다',
      body: `이 그룹의 브랜드 목록에 Dolores 가 있고 업계지는 같은 이름을 멕시코 회사 것으로 적는다. 둘 다 맞다 — **관할이 갈려 있다.** 이 그룹은 파푸아뉴기니(2031년까지 유효)·호주·뉴질랜드·영국·스위스·중국·베트남에서 갖고, 멕시코·**미국(1942년 등록)**·스페인·독일·이탈리아·중남미 9개국은 다른 권리자가 갖는다. 두 진영이 유럽에서 한 번 부딪혔다: 이 그룹이 2013년 3월에 유럽연합 상표로 출원했고 이의신청을 받아 2015년 11월에 철회했으며, 공보의 출원인 주소 칸에 마당 공장 번지가 그대로 찍혀 있다. **이의신청을 낸 쪽은 멕시코 회사가 아니라 독일 법인이다** — 「멕시코가 막았다」로 읽으면 사실과 다르다. 브랜드가 법인별로 쪼개져 있는 것도 읽을 만하다: 파푸아뉴기니·아시아태평양은 마당 법인 명의로 **${RD_S.상표_PNG건수}건**이 등록돼 있고 대표 브랜드는 1997년부터이며, 필리핀·중남미·유럽연합은 별도 브랜드 법인이, 미국은 미국 판매 법인이 갖는다. 유럽 상표를 손에 넣는 데는 오래 걸렸다 — 2015년과 2017년에 두 건을 철회했고 이 그룹 이름으로 등록된 첫 유럽연합 상표는 2026년 5월에 나왔다`,
    },
  ],
  briefing: proseBriefing('rd'),
  narratives: inlineReport('rd', proseStages('rd')),
  chartSlots: {},
  continuous: true,
  sourceNotes: rdSourceNotes,
  sourceMeta: [
    `${rdMeta.회사} · ${rdMeta.국가} · ${rdMeta.업종}`,
    `출처 ${rdMeta.출처}`,
    `조사 ${rdMeta.조사일}`,
  ].join(' · '),
};

const BOUNTY_ACCENT = '#8a5a2b';

/** 등기·돈·명부·2012년·매대. 발행본의 확정 수치 정본에서만 값을 가져온다. */
const BT_REG = bountyRegistry();
const BT_MONEY = bountyMoney();
const BT_LIST = bountyRegisters();
const BT_CTX = bountyContext();
const BT_SHELF = bountyShelf();

/** 화면은 ko-KR 자릿수를 쓴다. 발행본의 유럽식 소수 쉼표(4,6 %)는 여기서 점 소수로 옮긴다. */
const btNum = (v: number, d = 0) => v.toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d });
/** 천원 단위 공시값을 억 원으로 옮겨 적는다(1억 원 = 10만 천원). 원문 자릿수는 같은 문장에 남긴다. */
const btEok = (천원: number) => Math.round(천원 / 100_000);

const BOUNTY_SPEC: CommoditySpec = {
  key: 'company-anatomy-bounty',
  title: '기업 해부: Bounty Seafood',
  subtitle:
    '파푸아뉴기니 라에 말라항 공단 Portion 679 에 등기된 동원산업 100 % 자회사다. 2012년에 하루 150톤짜리 참치 로인 공장을 세우겠다는 계획으로 만들어졌고 그 공장은 서지 않았다. ' +
    '먼저 오해를 걷어야 한다 — 동원산업은 파푸아뉴기니에서 사라지지 않았다. 파푸아뉴기니 수산업협회 회원명부가 선망 조업사로 적고, 수산청 2025-02-17 성명은 마당 RD Tuna Canners 의 사업 재편을 받치는 쪽에 그 이름을 적는다. 없는 것은 회사가 아니라 자기 이름의 공장이다. ' +
    '그 공장을 위해 만든 법인은 등기부에 살아 있다(회사 등록 1-80688 · Registered). 다만 외국인기업 인증 93137 은 2026년 1월 11일자로 취소됐고, 투자진흥법은 인증 없는 외국기업의 영업을 금하면서 취소 뒤에는 청산 목적의 한시 영업만 남긴다. ' +
    '장부 쪽은 더 조용하다. 출자금 5,600만 원은 전액 손상돼 장부가가 0 이고, 2012년 5월에 빌려준 40만 1,232 달러는 열네 해 동안 회수 기록이 한 줄도 없다. 모회사와의 매출·매입·보증 표에는 이 회사 행이 아예 없다.',
  accent: BOUNTY_ACCENT,
  primaryKpi: {
    label: '2012년 5월에 나간 대여금 원금 — 열네 해 동안 달러로 고정돼 한 번도 회수되지 않았다',
    value: BT_MONEY.원금_USD,
    decimals: 0,
    unit: `(달러 · 실행 ${bountyStats['대여실행일']} · 목적 「법인운영」 · 이자율 ${btNum(BT_MONEY.이자율_pct, 1)} % · 담보 없음. 원화 잔액만 보면 2020년 말 ${btNum(Number(bountyStats['대여잔액_2020_천원']))}천 원에서 2026년 상반기 말 ${btNum(BT_MONEY.잔액_2026반기_천원)}천 원(약 ${btEok(BT_MONEY.잔액_2026반기_천원)}억)으로 늘어난 것처럼 보인다. 그런데 일곱 시점의 잔액을 각 기준일의 원·미국달러 매매기준율(한국은행 경제통계시스템 731Y001)로 나누면 전부 같은 값에서 만난다 — 회수나 추가 대여가 한 번이라도 있었으면 이 열이 닫히지 않는다. 기준일이 휴장일인 2022·2023년 말은 직전 영업일(12-30 · 12-29) 고시값을 썼다. 공시의 「회수」 칸은 확인된 전 기간 「—」이고, 2026년 반기 특수관계자 자금거래 표에는 이 회사 열 자체가 없다. **떼였다고는 쓰지 않는다** — 공시는 전액 충당금을 인식했다고 적을 뿐 상각·청구 포기·소송을 적지 않는다)`,
    accent: BOUNTY_ACCENT,
  },
  secondaryKpis: [
    {
      label: '파푸아뉴기니 참치 가공장을 이름으로 적는 명부에 실린 육상 가공장 수 (유럽연합 제3국 승인시설 목록, 조회 2026-09-20)',
      value: BT_LIST.EU육상가공장,
      decimals: 0,
      unit: `(곳 · 파푸아뉴기니 수산물 항목 전수 ${BT_LIST.EU전수}건 가운데 육상 가공장이 여섯이고 나머지는 냉동창고 한 곳과 냉동운반선 열 척이다. 승인번호까지 적힌다: 07EST079 Frabelle · 07EPR039 IFC · 07EPR5110 Majestic · 07EPR009 Nambawan · 08EPR001 RD Tuna Canners(마당) · 09EPR019 South Seas Tuna(웨왁). **이 목록에 Bounty 는 ${BT_LIST.EU_Bounty등재}건이다.** 같은 여섯을 해양관리협의회 유통관리 인증 명부·돌고래 안전 가공사 명부·수산업협회 회원명부도 이름으로 잡는데 셋 다 이 회사가 없다 — 넷 모두에서 대조군이 서므로 부재를 말할 수 있다. 다만 수산청 2025-02-17 성명은 「여섯 곳」이라는 수만 적고 회사 이름을 적지 않아 대조군이 되지 않는다. **네 명부 가운데 유럽연합 목록의 부재가 가장 무겁다** — 이 나라 캔공장이 서는 이유가 경제동반자협정의 무관세 통로이고, 그 목록에 번호가 없으면 관세율이 0 %든 ${BT_CTX.MFN관세_pct} %든 애초에 실을 수가 없다)`,
    },
    {
      label: '2012년 유럽의회 연구가 이 계획에 매긴 실현 가능성 (PE 474.562 · Table 5 · 인쇄 52쪽)',
      value: BT_CTX.viability_pct,
      decimals: 0,
      unit: `(% · 같은 표가 라에·마당 후보 ${BT_CTX.EP후보수}곳을 줄 세운다: Majestic 100 · IFC 100 · Namabawan(원문 철자) 80 · Niugini Tuna 80 · **Dongwon 50** · Halisheng 50. 그 백분율은 능력이나 자본의 크기가 아니라 절차의 진척도를 매긴 값이다 — 연구는 「신규 사업의 실현 가능성을 보수적으로 보며 개발 경로를 얼마나 밟아 왔는지를 백분율로 표시한다」고 적는다. 2012년 3월에 국가행정평의회 승인을 받은 것은 Nambawan 과 Niugini Tuna 둘이고 Dongwon 과 Halisheng 은 그때까지 수산청과 교섭 중이었다. 같은 연구 인쇄 51쪽이 「Halisheng 은 이미 말라항에 부지를 사 두었고, Dongwon 은 사들이는 중이다. 두 회사 모두 어업면허를 각각 ${BT_CTX.면허수}개씩 받았다」고 적는다 — **흔히 도는 「초기 면허 넷 + 증산 시 여섯」은 Majestic 공장 이야기이고 이 계획의 것이 아니다.** 계획 용량도 갈래가 있다: 이 연구는 하루 ${BT_CTX.계획용량_EP_t}톤 로인(교섭 중), 2013~2014년 업계 연감은 하루 ${BT_CTX.계획용량_업계지_t}톤 가공(승인 후)으로 적고 사이를 잇는 수산청 승인 문서가 공개되지 않아 상향 인과를 쓸 수 없다. 그리고 **254쪽 전문에 「Bounty」 라는 문자열이 ${BT_LIST.EP_Bounty문자열}번 나온다** — 연구는 현지 법인이 아니라 한국 모회사 이름만 적는다)`,
    },
    {
      label: '업계지 Atuna 아카이브에서 이 회사 이름이 걸린 기사 수 (2026-02-13 ~ 2026-09-15)',
      value: BT_LIST.Atuna_Bounty건,
      decimals: 0,
      unit: `(건 · 같은 아카이브·같은 기간에 나라 이름으로 ${BT_LIST.Atuna_PNG건}건, 모회사 이름으로 ${BT_LIST.Atuna_Dongwon건}건이 걸린다 — 검색이 닿지 않은 것이 아니라 이 회사가 적히지 않았다. 모회사 ${BT_LIST.Atuna_Dongwon건}건 가운데 파푸아뉴기니가 같은 기사에 나오는 것은 ${BT_LIST.Atuna_동시건}건이고, 그 문장은 「파푸아뉴기니의 공장 세 곳이 미크로네시아 협정 면허와 묶여 원료와 유럽 무관세 접근을 준다」고만 적을 뿐 그 세 곳이 누구의 공장인지 밝히지 않는다. **아카이브가 2026-02-13 부터 시작하므로 그 이전의 보도 여부는 이 검색에 잡히지 않는다** — 외국인기업 인증이 취소된 ${BT_REG.인증비활성일}은 이 범위 밖이다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '법인',
      title: '등기부에는 살아 있고 인증은 꺼졌다',
      body: `투자진흥청 등기에 번호가 둘 붙어 있다. 회사 등록 ${BT_REG.회사등록번호}은 상태가 ${BT_REG.회사등록상태}이고, 외국인기업 인증 ${BT_REG.인증번호}은 ${BT_REG.인증상태}이며 비활성일이 ${BT_REG.인증비활성일}이다. 투자진흥법 제25조 2항은 인증 없는 외국기업의 영업을 금하고 제41조 1항 가목이 위반에 ${btNum(BT_REG.벌금상한_키나)}키나 이하의 벌금을 매긴다. 취소 뒤 그 법이 남겨 둔 영업은 제36조 3항의 청산 목적 한시 영업 하나뿐이다. **취소 사유는 공개되지 않는다** — 등기 조회에 사유 칸이 없다. 업종 칸도 갈린다: 회사 등록에 적힌 업종은 어업과 건설이고 참치 가공·저장은 지금 취소된 인증 쪽에만 있다. 설립일은 등기가 ${BT_REG.설립일_등기}, 동원산업 연혁이 ${BT_REG.설립일_공시}로 하루 어긋나는데 **2012년 5월의 두 날짜는 설립일이 아니다**(15일이 출자 취득일, 16일이 대여 실행일). 등기 이력은 ${BT_REG.제적일} 「재등록되지 않음」 → ${BT_REG.복권일} 복권 → 사흘 뒤 이사·감사 변경이고, 연차보고 기한 ${BT_REG.연차보고기한}이 지난 채다. 등기의 자본금 0·영업 중 「아니오」 표기는 **가동 중인 Majestic 등기도 같은 값**이라 이 회사의 특징이 아니다`,
    },
    {
      eyebrow: '장부',
      title: '5,600만 원을 넣고 전액을 지웠다',
      body: `타법인출자 현황의 최초취득금액이 ${BT_MONEY.취득금액_백만원}백만 원(2012-05-15 취득 · 10만주 · 지분 100.00 %)이고 기말 장부가액은 0 이다. 주석은 「전기 이전에 상기 종속기업투자 전액에 대하여 종속기업투자손상차손 ${BT_MONEY.손상_백만원}백만원을 인식」이라고만 적어 **어느 해에 지웠는지는 그 문장에서 알 수 없다.** 같은 표를 전 행으로 세면 장부가가 0 이거나 「—」인 행이 ${Number(bountyStats['타법인출자_장부가0_행수'])}이고, 출자목적이 「경영참여」인 것으로 좁히면 ${Number(bountyStats['타법인출자_장부가0_경영참여_행수'])}만 남는다 — 세네갈의 S.C.A(편 ⅩⅩⅩⅧ)와 이 회사다. 같은 0 이 서로 다른 것을 뜻한다: 세네갈 쪽은 배를 사고 사람을 쓰고 통조림을 만들면서 0 이고 이쪽은 아무것도 하지 않으면서 0 이다. 총자산은 2025 사업보고서 ${btNum(BT_MONEY.총자산_2025_백만원)}백만 원 · 2026 반기 ${btNum(BT_MONEY.총자산_2026반기_백만원)}백만 원인데, **2025년 표는 당기순손익 칸에 총자산 값을 그대로 복제해 넣었다** — 그 칸을 순이익으로 읽으면 이 회사가 6억 원을 벌었다는 문장이 나온다. 그 표의 다른 행들도 같은 방식이라 한 회사의 오기가 아니라 표 전체의 기재 방식이다`,
    },
    {
      eyebrow: '거래',
      title: '채권만 남고 흐름이 없다',
      body: `동원산업 특수관계자 공시에서 이 회사는 채권·채무 잔액 표에만 나타난다. 매출 등 거래 표에 행이 ${BT_MONEY.매출행}, 매입 등 거래 표에 행이 ${BT_MONEY.매입행}, 지급보증 표에 행이 ${BT_MONEY.보증행}이고 2026년 반기 자금거래 표에는 열 자체가 없다. 남아 있는 것은 대여금과 미수금 ${btNum(BT_MONEY.미수금_천원)}천 원뿐이다. 그 미수금은 2020년부터 2026년 상반기까지 **1원도 움직이지 않았다** — 원금은 환율을 따라 매년 바뀌는데 이자 자리는 같은 값에 멈춰 있다(전액 충당금을 쌓아 순장부가가 0 이 된 채권에서 이자를 더 쌓지 않는 처리와 맞는다). 채권 표의 행 이름은 「미수금」인데, 충당금 각주가 「대여금 및 미수수익 전액」이라 적고 그 충당금이 공시된 다섯 시점 전부에서 대여금 잔액에 정확히 ${btNum(BT_MONEY.미수금_천원)}천 원을 더한 값이라 그 숫자가 이자 자리에 선다. **2025년부터 충당금이 키리바시 법인과 합산으로만 공시돼** 이 회사 단독 마지막 값은 2024년 ${btNum(BT_MONEY.충당금_2024단독_천원)}천 원(약 ${btEok(BT_MONEY.충당금_2024단독_천원)}억)이다. 같은 공시에서 세네갈 계열 두 곳은 모회사와 물건을 주고받고 한쪽에는 유로로 매긴 지급보증까지 붙어 있다`,
    },
    {
      eyebrow: '바다',
      title: '두 장부가 한 바다를 따로 센다',
      body: `서중부태평양수산위원회 2026년 연차보고에서 파푸아뉴기니 어획은 한 표에 적히지 않는다. **외국선단이 파푸아뉴기니 배타적경제수역에서** 잡은 선망 어획이 ${btNum(BT_CTX.외국선단_EEZ_선망_t)}톤(연승 ${btNum(Number(bountyStats['외국선단_EEZ_연승_t']))}톤)이고, **파푸아뉴기니 기국 선단이 협약수역 전체에서** 잡은 선망 어획이 ${btNum(BT_CTX.국적선망_협약수역_t, 1)}톤이다(가다랑어 215,043.8 · 황다랑어 112,652.9 · 눈다랑어 1,298.3). 국적 연승은 2025년에 조업이 ${BT_CTX.국적연승_t}이다. **두 값을 더하면 안 된다** — 공간 단위가 다르고 겹치는 구간과 빠지는 구간이 함께 있다. 국적 선망 활성 척수는 ${BT_CTX.국적선망_척}척(2024년 ${Number(bountyStats['국적선망_척_2024'])}척)인데 같은 해를 수산업협회는 ${BT_CTX.협회기준_척}척으로 센다 — 활성·국적·용선의 정의가 자료마다 다르다. 가공은 공장 ${BT_CTX.가공공장수}기가 합산 하루 1,000톤을 넘고, 이 나라가 가공한 참치는 2023년 79,209톤에서 2024년 ${btNum(BT_CTX.가공물량_2024_t)}톤으로 한 해에 50.5 % 늘었다 — 그 사이 라에의 한 공장은 원어 부족으로 문을 닫은 채였다`,
    },
    {
      eyebrow: '제도',
      title: '공장이 서는 이유는 조문 한 줄에 있다',
      body: `유럽연합·태평양 잠정 경제동반자협정(서명 2009-07-30 · 잠정적용 2009-12-20 · 지금도 잠정적용)에서 파푸아뉴기니산 참치 조제품은 원산지 요건을 채우면 관세가 0 %이고 채우지 못하면 최혜국 세율 ${BT_CTX.MFN관세_pct} %다. 그 요건을 바꾸는 것이 **${BT_CTX.조달예외조항}의 전면적 조달 예외**다 — 자국 항구에 양륙한 비원산 원료로 육상에서 만든 조제품을 충분가공으로 본다. 보통의 수산물 원산지 규정은 어느 나라 배가 잡았는지로 통조림의 국적을 정하는데 이 조항이 그 고리를 끊는다. 그래서 이 나라의 공장은 자국 선단의 크기에 매이지 않는다. **수량 상한은 조문에 없다**(통보 기재사항으로 수량을 적을 뿐이고, 통보일은 2008-03-13 · 관보 공고 2010/C 125/07 이다). 불법어업 카드는 옐로가 2014-06-10 에 붙었다가 2015-10-01 에 풀렸고 현재 카드가 없다. 2012년에 외국 자본 다섯이 같은 공단으로 몰린 것도 이 통로 때문이다 — 다만 그 통로를 쓰려면 유럽연합 제3국 승인시설 목록에 번호가 있어야 한다`,
    },
    {
      eyebrow: '매대',
      title: '값을 가르는 것은 공장이 아니라 브랜드 층이다',
      body: `이 회사에는 팔 물건이 없어 매대의 캔은 전부 남의 것이다. 포트모르즈비 한 소매점의 상품 피드(조회 2026-09-20 · 1 달러 = ${btNum(BT_SHELF.환산율, 6)} 키나 · 순중량 기준)에서 RD 진영의 Diana Blu 세이버스 180 g 이 kg당 ${btNum(BT_SHELF.RD최저_USD_kg, 2)}달러이고 같은 진영의 Dolly 청크 인 오일 180 g 이 ${btNum(BT_SHELF.RD최고_USD_kg, 2)}달러다 — **한 진영 안에서 ${btNum(BT_SHELF.RD배수, 1)}배**가 벌어진다. 그 사이에 Frabelle 의 Isabella 가 3.32달러로 들어가고, 제일 싼 칸(${btNum(BT_SHELF.최저_USD_kg, 2)}달러)은 제조사가 밝혀지지 않은 브랜드다. **매대 꼭대기는 이 나라 공장이 아니라 솔로몬제도에서 들여온 프리미엄 라인(${btNum(BT_SHELF.수입최고_USD_kg, 2)}달러)이 잡았다.** 유럽 쪽은 구조가 다르다: 프랑스 소매체인 자체상표 Winny 와 영국 Lidl 의 Nixe 4×160 g 이 **같은 공장코드 08EPR001** 을 달고 있고 그 번호가 유럽연합 목록에서 마당의 RD Tuna Canners 로 선다 — 여섯 공장이 유럽에 파는 방식은 자기 브랜드를 파는 대신 남의 이름을 단 캔을 채우는 것이다. 법정 규격(이사회 규정 1536/92)은 solid·chunks·fillets·flakes·grated 를 정의하고 어육을 자숙 기준 순중량의 ${BT_SHELF.물뺀하한_pct} % 이상으로 요구하는데, 확인된 물뺀비율 두 건(70.3 % · 70.0 %)이 그 하한에 붙어 있다. **「white」·「light」 는 그 규정에 없는 말이다**`,
    },
  ],
  briefing: proseBriefing('bounty'),
  narratives: inlineReport('bounty', proseStages('bounty')),
  chartSlots: {},
  continuous: true,
  sourceNotes: bountySourceNotes,
  sourceMeta: [
    `${bountyMeta.회사} · ${bountyMeta.국가} · ${bountyMeta.업종}`,
    `출처 ${bountyMeta.출처}`,
    `조사 ${bountyMeta.조사일}`,
  ].join(' · '),
};

const CAPSEN_SPEC: CommoditySpec = {
  key: 'company-anatomy-capsen',
  title: '기업 해부: CAPSEN',
  subtitle:
    '세네갈 다카르 몰 10 부두의 참치 선망 조업 법인이다. 동원산업 지분은 49.00 %(735주 / 1,500주)인데 그 숫자는 고른 값이 아니라 세네갈 해상운송법(loi n°2002-22) 제91조가 정한 천장이다 — 선박이나 선주회사 자본의 51 % 이상이 세네갈 또는 서아프리카경제공동체 국민 소유여야 배가 세네갈 국적을 얻는다. ' +
    '지분이 절반에 못 미치는데도 동원산업 연결재무제표에는 종속기업으로 들어온다. 근거는 「다른 의결권 보유자와의 약정」이고, 동원산업 계열 가운데 「실질지배력보유」로 연결되는 법인은 이 회사 하나뿐이다. 그 상대방의 이름은 열한 해 동안 한 번도 공시에 적히지 않았다. ' +
    '그 회사가 지금 세네갈 국적 참치 선망 일곱 척 가운데 넷을 갖는다. 가공은 하지 않는다 — 잡아서 같은 부두의 별개 법인 S.C.A(편 ⅩⅩⅩⅧ · 동원산업 60 %)에 넘기거나 통마리로 내보내는 데까지가 이 회사 일이다.',
  accent: CAPSEN_ACCENT,
  primaryKpi: {
    label: `동원산업이 든 지분 — 2015년부터 2026년 상반기까지 한 번도 바뀌지 않았다`,
    value: CP_CEIL.지분_pct,
    decimals: 2,
    unit: `(% · ${CP_CEIL.보유주식.toLocaleString('ko-KR')}주 / ${CP_CEIL.총주식.toLocaleString('ko-KR')}주. 「소수주주라서 절반을 못 넘긴 것」이 아니다 — 세네갈 해상운송법 제91조가 자본의 ${CP_CEIL.현지요건_pct} % 이상을 세네갈 또는 서아프리카경제공동체 국민 소유로 요구해 외국 자본이 올라갈 수 있는 끝이 여기다. 한 칸 더 넣으면 배가 국적을 잃는다. 그런데도 동원산업 연결재무제표에는 종속기업으로 들어온다: 계열회사 현황표가 적는 지배관계 근거가 「${CP_CEIL.연결사유}」이고 동원산업 계열에서 이 근거를 쓰는 법인은 이 회사 하나다. 나머지 ${CP_CEIL.미보유주식.toLocaleString('ko-KR')}주의 주인은 공시에 없다 — 열한 해 치 사업보고서와 반기보고서 어디에도 상대방의 상호나 성명이 적히지 않았다. 「어느 원문에도 없다」고는 쓸 수 없다: 세네갈 현지 매체가 2015-03-15 에 회사가 주식 51 %를 종업원에게 주었다고 보도했고 등기로 확인되지 않은 등급 B 다)`,
    accent: CAPSEN_ACCENT,
  },
  secondaryKpis: [
    {
      label: `세네갈 국적 참치 선망 톤수 가운데 이 회사 배 넷의 몫 (국제대서양참치보존위원회 활성 명부 ${capsenStats['ICCAT_조회일']} 추출)`,
      value: CP_FLEET.비중_7척기준_pct,
      decimals: 1,
      unit: `(% · ${CP_FLEET.배.map((b) => `${b.선명} ${b.톤수.toLocaleString('ko-KR')}`).join(' · ')} = ${CP_FLEET.톤수_이_회사.toLocaleString('ko-KR')} ÷ 세네갈 선망 ${CP_FLEET.선망_세네갈}척 합 ${CP_FLEET.톤수_세네갈7척.toLocaleString('ko-KR')}. 분모가 둘이다 — 인증 시점 여섯 척(${CP_FLEET.톤수_인증6척.toLocaleString('ko-KR')}) 기준으로는 ${cpPct(CP_FLEET.비중_인증6척_pct, 1)} %이고, ${cpPct(CP_FLEET.비중_7척기준_pct, 1)} %는 인증에 들지 않은 SEA BREEZE 까지 넣은 값이다. 어느 쪽이든 배마다 어획 효율이 달라 이 비율을 어획량에 그대로 곱할 수 없다. 현행 증서 1.2판은 일곱째로 COSMOS KIM 을 적지만 국제대서양참치보존위원회 명부에 없어 이 분모에 넣지 않았다. 톤수는 단위가 섞인 단순합이다 — 원문이 GRANADA 만 총톤수(GT)로, 나머지 여섯은 옛 방식 총톤수(GRT)로 적는다. 「배 넷」과 「선망 넷」도 다른 말이다: 세네갈 수산가공검사국 승인 명부는 채낚기 CAP ATLANTIQUE(2020년 승인 · 741 GT)까지 이 회사 소속으로 적어 그 명부 기준으로는 다섯이다)`,
    },
    {
      label: '동원산업이 2025년에 이 회사에서 사들인 금액이 판 금액의 몇 배인가 (특수관계자 주석, 별도)',
      value: CP_LEDGER.배수_매입대매출,
      decimals: 1,
      unit: `(배 · 매입 ${CP_LEDGER.매입_2025_천원.toLocaleString('ko-KR')}천 원(약 ${cpEok(CP_LEDGER.매입_2025_천원)}억) 대 매출 ${CP_LEDGER.매출_2025_천원.toLocaleString('ko-KR')}천 원(약 ${cpEok(CP_LEDGER.매출_2025_천원)}억). 세네갈에 있는 동원산업의 두 법인은 돈이 흐르는 방향이 반대다 — 조업 법인에서는 사 오고, 가공 법인 S.C.A 에는 팔기만 한다(같은 공시에서 S.C.A 는 「매입」 표에 행 자체가 없다). 보증은 그 반대다: 지급보증 EUR ${CP_LEDGER.SCA_지급보증_EUR.toLocaleString('ko-KR')}(신한은행 런던지점·하나은행 바레인지점)은 전부 S.C.A 쪽이고 이 회사는 보증표에 행이 없다. 미수금이 십 년 넘게 상시로 걸려 있다 — 2017년 ${capsenStats['미수금_최대_2017_억원']}억이 최고였고 2026년 6월에도 ${CP_LEDGER.미수금_2026상반기_천원.toLocaleString('ko-KR')}천 원(약 ${cpEok(CP_LEDGER.미수금_2026상반기_천원)}억)이 남아 있는데 그 성격을 공시가 적지 않는다. 매출채권과 따로 적히니 물건값은 아니다)`,
    },
    {
      label: '미국이 세네갈에서 들여온 참치 조제품의 감소 폭 (유엔 무역통계 · 미국 신고 · 세번 1604.14 · 2023 → 2025)',
      value: Number(capsenStats['미국수입_감소_pct']),
      decimals: 1,
      unit: `(% · ${Number(capsenStats['미국수입_2023_t']).toLocaleString('ko-KR')} t → ${Number(capsenStats['미국수입_2024_t']).toLocaleString('ko-KR')} t → ${Number(capsenStats['미국수입_2025_t']).toLocaleString('ko-KR')} t. 나라 합계이고 이 회사 물량이 아니다 — 세네갈에는 참치를 다루는 회사가 여럿이고 세관 통계에 회사 이름 칸이 없다. 게다가 이 회사가 잡은 고기는 최대 절반까지 부두에서 가공회사로 넘어가므로 수출 통계에는 원어가 아니라 캔으로 나타난다. 세번 1604.14 는 가다랑어·다랑어에 줄삼치까지 담는 바스켓이다. 2023년만 미국 신고 ${Number(capsenStats['미국수입_2023_t']).toLocaleString('ko-KR')} t 가 세네갈 신고 총수출 ${Number(capsenStats['세네갈조제품수출_2023_t']).toLocaleString('ko-KR')} t 보다 ${capsenStats['미러불일치_2023_t']} t 많은 미러 불일치인데, 세네갈 신고 누락·제3국 경유 재수출·신고 시점 차이 가운데 어느 쪽인지 이 자료로 갈리지 않는다)`,
    },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '인증',
      title: '통과가 아니라 숙제 열 개가 붙은 인증이다',
      body: `${CP_CERT.인증일} 에 이 회사와 Grand Bleu 가 함께 해양관리협의회 조업 인증을 받았다(증서 ${CP_CERT.증서} · 만료 ${CP_CERT.만료일} · 인증기관 ${CP_CERT.인증기관} · 어획 적격일 ${CP_CERT.적격일}). 고객 집단 이름은 「${capsenStats['MSC_고객집단']}」이다. 선박 수는 시점을 밝혀야 한다 — 인증 시점은 ${CP_CERT.선박_인증시점_척}척(이 회사 넷과 증서가 Grand Bleu 것으로 적는 둘)이고 현행 증서 ${CP_CERT.증서판}은 ${CP_CERT.선박_현행증서_척}척이다. 일곱째 COSMOS KIM 은 소유자 칸 CAPSEN·기국 Senegal·적격일 ${CP_CERT.적격일_일곱째} 으로 붙었고 AIS·IRCS 칸은 비어 있다 — 국제대서양참치보존위원회 세네갈 명부에는 없어 선단 수와 톤수 분모에는 넣지 않았다. 거기 붙은 조건이 ${CP_CERT.조건_수}개다: 자원 ${CP_CERT.조건_자원} · 생태계 ${CP_CERT.조건_생태계} · 관리 ${CP_CERT.조건_관리}. 그 가운데 ${CP_CERT.조건_손밖}개는 조업자 손 밖에 있다 — 어획 관리 규칙과 의사결정 절차는 국제대서양참치보존위원회 회원국들이 합의해야 움직인다. 인증일로 도는 숫자가 둘인데 증서와 조업 페이지가 적는 ${CP_CERT.인증일}이 인증일이고 ${capsenStats['MSC_보도자료일']}은 보도자료 날짜다. 그 보도자료만 이 회사를 「동원산업의 사업부」라 부르는데 틀린 표현이다 — 별개 세네갈 법인이고 지분은 ${cpPct(CP_CEIL.지분_pct)} %다`,
    },
    {
      eyebrow: '장부',
      title: '1,400만 원짜리 칸 뒤에 935억이 있다',
      body: `동원산업 별도재무제표에서 이 회사는 ${CP_LEDGER.장부가_천원.toLocaleString('ko-KR')}천 원이고 열한 해 동안 한 원도 바뀌지 않았다 — 종속기업 투자를 취득원가로 적고 손상이 있을 때만 깎는 회계 때문이다. 같은 기간 총자산은 ${CP_LEDGER.총자산_2015_백만원.toLocaleString('ko-KR')}백만 원에서 ${CP_LEDGER.총자산_2025_사업보고서_백만원.toLocaleString('ko-KR')}백만 원(2025 사업보고서) 또는 ${CP_LEDGER.총자산_2025_반기_백만원.toLocaleString('ko-KR')}백만 원(이듬해 반기 재기재)이 됐다. ${cpPct(CP_LEDGER.배수_하한, 2)}배에서 ${cpPct(CP_LEDGER.배수_상한, 2)}배 사이인데, 같은 기준일을 두 공시가 다르게 적고 어느 쪽이 감사를 거친 값인지 원문으로 가려지지 않는다. 이 칸을 회사 가치로 읽으면 안 된다. 다만 같은 표의 옆자리가 다르다 — 같은 부두의 가공회사 S.C.A 는 취득가액 ${CP_LEDGER.SCA_취득가액_천원.toLocaleString('ko-KR')}천 원이 전액 손상돼 장부가가 0 이다. 조업 쪽은 1,400만 원이 살아 있고 가공 쪽은 32억이 지워졌다. 2018년 손익은 쓰지 않는다 — 한 공시 안에 △59백만 원과 +2,077백만 원 두 값이 부호까지 뒤집혀 있다`,
    },
    {
      eyebrow: '그물',
      title: '열에 아홉 가까이 유목에 붙인다',
      body: `어선일지 기준으로 이 선단 어획의 ${CP_CERT.유목_pct} %가 유목 투망에서 나온다(${capsenStats['조성_기간']}, 연도별 ${capsenStats['유목비중_연도별_하한_pct']}~${capsenStats['유목비중_연도별_상한_pct']} %). 유목 투망의 어획 조성은 가다랑어 ${cpPct(Number(capsenStats['조성_가다랑어_pct']))} %·황다랑어 ${cpPct(Number(capsenStats['조성_황다랑어_pct']))} %이고 눈다랑어가 ${cpPct(Number(capsenStats['조성_눈다랑어_pct']))} % 섞인다 — 인증 어종에서 빠진 그 어종이다. 여기 붙는 라벨이 셋인데 서로 다르다. 유목 비중과 조성은 인증 시점 여섯 척 전체의 값이고, 관측 비율 유목 ${CP_CERT.관측_유목_pct} %·자유군 ${CP_CERT.관측_자유군_pct} %만 이 회사 네 척에서 계산했다(Grand Bleu 두 척은 관측 자료가 빠져 비율을 낼 수 없었다고 공개 인증보고서가 적는다). 그리고 조성 수치는 승선 관찰을 어선일지 대비 관측 비율로 선단 규모에 환산한 값이지 실측 총량이 아니다. 2025년 어획 ${CP_CERT.어획_가다랑어_t.toLocaleString('ko-KR')} t + ${CP_CERT.어획_황다랑어_t.toLocaleString('ko-KR')} t = ${CP_CERT.어획_합계_t.toLocaleString('ko-KR')} t 도 여섯 척 합계다`,
    },
    {
      eyebrow: '문',
      title: '유럽 배가 못 들어가는 바다인데, 인증이 그 결과는 아니다',
      body: `유럽연합·세네갈 어업의정서가 ${capsenStats['의정서만료일']}에 만료돼 유럽 선박이 세네갈 수역에서 조업하지 못한다. 만료된 의정서가 유럽 선단에 주던 것은 냉동 선망 28척·채낚기 10척·연승 5척의 조업 기회와 연 1만 톤의 기준 어획량이었다. 그 앞 ${capsenStats['옐로카드일']}에 유럽연합이 세네갈에 옐로카드를 냈고(결정 C/2024/3277) 대상 선박 명단에 이 회사 배는 없다. ${capsenStats['SFPA_조회일']} 조회 기준으로 어업협정 상태는 여전히 휴면이고 철회 공고도 없다. 그렇다고 이 인증을 그 공백의 결과로 읽으면 순서가 맞지 않는다 — 인증일 ${CP_CERT.인증일}은 의정서 만료보다 사흘 빠르고, 심사 착수 ${capsenStats['MSC_심사착수일']}은 옐로카드보다 열석 달 앞서며, 그 앞의 어업개선사업은 2020년에 시작됐다. 어장도 겹치지 않는다: 닫힌 것은 세네갈 어업수역 하나이고 인증 어장은 공해와 일곱 나라 배타적경제수역이다. 같은 해에 있었을 뿐 서로를 부르지 않았다`,
    },
  ],
  briefing: proseBriefing('capsen'),
  narratives: inlineReport('capsen', proseStages('capsen')),
  chartSlots: {},
  continuous: true,
  sourceNotes: capsenSourceNotes,
  sourceMeta: [
    `${capsenMeta.회사} · ${capsenMeta.국가} · ${capsenMeta.업종}`,
    `출처 ${capsenMeta.출처}`,
    `조사 ${capsenMeta.조사일}`,
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
  {
    key: 'dongwonfnb',
    numeral: 'ⅩⅩⅧ',
    name: '동원F&B',
    country: '대한민국 · 서울(창원 공장)',
    tagline: '참치캔은 별도 매출의 20%로 영업이익의 47%를 냈다(2024년).',
    ...FLAG.한국,
    stats: [
      { label: '참치캔 영업이익 몫', value: `${dongwonfnbStats.참치캔_별도_영업이익몫_2024_pct}%` },
      { label: '점유율 2025', value: `${dongwonfnbStats.점유율_2025_pct}%` },
      { label: '연결 매출 2025', value: `${(dongwonfnbStats.연결_매출_2025_krw_m / 1e6).toFixed(2)}조원` },
    ],
  },
  {
    key: 'hagoromo',
    numeral: 'ⅩⅩⅨ',
    name: 'はごろもフーズ',
    country: '일본 · 시즈오카(焼津·新清水 공장)',
    tagline: '자사 캔 공장은 둘, 공시에 이름이 나오는 참치 위탁처는 伊藤忠 경유 PT Aneka Tuna 하나.',
    ...FLAG.일본,
    stats: [
      { label: 'ツナ等 매출 몫', value: `${hagoromoStats.ツナ等_비중_FY26_pct}%` },
      { label: '伊藤忠 앞 매출', value: `${itochuSalesSharePct()}%` },
      { label: '연결 매출 FY26/3', value: `${(hagoromoStats.연결_매출_FY26_jpy_k / 1e5).toFixed(1)}억엔` },
    ],
  },
  {
    key: 'cnfc',
    numeral: 'ⅩⅩⅩ',
    name: '中水集团远洋',
    country: '중국 · 베이징(저우산 가공센터·바누아투 로인 공장)',
    tagline: '연보 네 권에 통조림은 없고, 참치는 네 기간 가운데 세 기간 원가보다 싸게 팔렸다.',
    ...FLAG.중국,
    stats: [
      { label: '참치 이익률 2025', value: `${cnfcStats.참치_이익률_2025_pct}%` },
      { label: '참치 매출 몫', value: `${tunaSharePct()}%` },
      { label: '등록부 선박', value: `${cnfcStats.등록부_선박}척` },
    ],
  },
  {
    key: 'kaichuang',
    numeral: 'ⅩⅩⅪ',
    name: '上海开创',
    country: '중국 · 상하이(스페인 Albo 공장·저우산 로인 공장·마셜 선단)',
    tagline: '매출총이익의 과반은 스페인 캔이 벌고, 연결 순이익의 7할만큼은 마셜제도 선적 선망선 법인 한 곳이 번다.',
    ...FLAG.중국,
    stats: [
      { label: '캔 매출총이익 몫', value: `${canGrossShare()}%` },
      { label: '泛太渔业 순이익 몫', value: `${panPacificShare()}%` },
      { label: '등록부 선망', value: `${kaichuangStats.등록부_선망_중국 + kaichuangStats.등록부_선망_마셜}척` },
    ],
  },  {
    key: 'alliance',
    numeral: 'ⅩⅩⅫ',
    name: 'Alliance Select Foods',
    country: '필리핀 · 제너럴산토스',
    tagline: '매출이 2.3배가 되는 동안 현금은 반대로 흘렀고, 그 값을 모회사 증자안이 떠안는다.',
    ...FLAG.필리핀,
    stats: [
      { label: '매출총이익률 2025', value: `${allianceStats.매출총이익률_2025_pct}%` },
      { label: '영업현금흐름 2025', value: `${operatingCashFlowMn()}백만 달러` },
      { label: '증자 뒤 모회사 지분', value: `${allianceStats.증자후_지분_pct}%` },
    ],
  },  {
    key: 'herdez',
    numeral: 'ⅩⅩⅩⅢ',
    name: 'Grupo Herdez',
    country: '멕시코 · 멕시코시티(판 공장은 푸에르토치아파스)',
    tagline: '공장을 판 뒤에도 이름은 매대에 남았다.',
    ...FLAG.멕시코,
    stats: [
      { label: '현행 공시의 「atún」', value: `${herdezStats.atun_출현_현행공시}회` },
      { label: '배수중량 미달률', value: `${drainedShortfallPct()}%` },
      { label: '판 공장 설비용량', value: `${herdezStats.판_공장_설비용량_t.toLocaleString('ko-KR')} t` },
    ],
  },  {
    key: 'sajoseafood',
    numeral: 'ⅩⅩⅩⅣ',
    name: '사조씨푸드',
    country: '대한민국 · 서울 서대문(가공은 부산, 김 공장은 익산)',
    tagline: '참치는 설비가 아니라 계약서에서 나온다.',
    ...FLAG.한국,
    stats: [
      { label: '가공품 대 부문 설비', value: `${processedToAssetRatio()}배` },
      { label: '가공용 원어의 계열 몫', value: `${affiliateShare2025()}%` },
      { label: '원양참치어선', value: `${sajoseafoodStats.어선_척수}척(선망 1·연승 2)` },
    ],
  },  {
    key: 'garavilla',
    numeral: 'ⅩⅩⅩⅤ',
    name: 'Conservas Garavilla',
    country: '스페인 · 빌바오(공장은 오 그로베·카보 데 크루스·만타·아가디르)',
    tagline: '설비 도면을 가진 제도는 하나뿐이다.',
    ...FLAG.스페인,
    stats: [
      { label: '선단 대 공장 에너지', value: `${fleetEnergyRatio()}배` },
      { label: '오 그로베 인가 라인', value: `${garavillaStats.오그로베_라인_2024} → ${garavillaStats.오그로베_라인_2025}개` },
      { label: '선망선', value: `${garavillaStats.선망선_척수}척(에콰도르 2·스페인 2)` },
    ],
  },
  {
    key: 'salica',
    numeral: 'ⅩⅩⅩⅥ',
    name: 'Salica',
    country: '스페인 · 베르메오(공장은 베르메오·아 포브라 두 카라미냘·포소르하)',
    tagline: '가장 작은 공장이 가장 두껍게 적힌다.',
    ...FLAG.스페인,
    stats: [
      { label: '세 공장 인원의 에콰도르 몫', value: `${ecuadorHeadcountShare()}%` },
      { label: '허가 능력 대 2022 총투입', value: `${permitVsInput().비율}%(가동률 아님)` },
      { label: '그룹 선박', value: `${salicaStats.그룹_선박_척수}척(용선 ${salicaStats.그룹_용선_척수}척 포함)` },
    ],
  },
  {
    key: 'majestic',
    numeral: 'ⅩⅩⅩⅦ',
    name: 'Majestic Seafood',
    country: '파푸아뉴기니 · 라에 말라항(공장 한 곳)',
    tagline: '값은 많고 실측은 하나다.',
    ...FLAG.파푸아뉴기니,
    stats: [
      { label: '처리능력으로 적힌 값', value: `${capacityValues().개수}개(명판·계획·전망)` },
      { label: '실측 가동', value: `${capacityValues().실측} t/일(${capacityValues().실측연도} · 가용 ${capacityValues().가용})` },
      { label: '용선', value: `${majesticStats.용선_척수}척(소유 아님 · 기국 미확인)` },
    ],
  },
  {
    key: 'sca',
    numeral: 'ⅩⅩⅩⅧ',
    name: 'S.C.A',
    country: '세네갈 · 다카르 몰 10 부두(공장 한 곳)',
    tagline: '같은 부두의 두 법인을 장부가 다르게 적는다.',
    ...FLAG.세네갈,
    stats: [
      { label: '지분 대 장부가', value: `${twoEntities().가공.지분_pct}%인데 장부가 ${bookValueGap().장부가}(${bookValueGap().손상연도}년 전액 손상 · ${bookValueGap().경과연수}년째)` },
      { label: '옆 법인(조업)', value: `${twoEntities().조업.지분_pct}% · 주요종속회사 ${twoEntities().조업.주요종속회사} · 장부가 ${twoEntities().조업.장부가_천원.toLocaleString('ko-KR')}천원` },
      { label: '가동', value: `명판 일 ${scaStats.명판_일_t} t 대 실제 일 ${scaStats.실가동_일_최저_t}~${scaStats.실가동_일_최고_t} t` },
    ],
  },
  {
    key: 'ghana',
    numeral: 'ⅩⅩⅩⅨ',
    name: '가나 테마의 두 캐너리',
    country: '가나 · 테마 어항(Cosmo Seafoods · Pioneer Food Cannery)',
    tagline: '한 공장은 주인이 다섯 겹까지 적혀 있고, 다른 공장은 4분의 3이 어디에도 없다.',
    ...FLAG.가나,
    stats: [
      { label: '소유가 적힌 두께', value: `PFC ${ownershipDepth().적힌쪽.겹수}겹 전부 ${ownershipDepth().적힌쪽.지분_pct}% 대 Cosmo 한 줄 ${ownershipDepth().빈쪽.지분_pct}%(나머지 ${ownershipDepth().빈쪽.미상_pct}% 문서 없음)` },
      { label: '매입 대 장부', value: `${purchaseTurn().공백_해수}해 0원 → FY2025 ${(purchaseTurn().FY2025_백만원 / 100).toFixed(0)}억(매출의 ${purchaseTurn().FY2025_비중_pct}%)인데 장부금액은 ${purchaseTurn().장부금액_경과연수}년째 ${purchaseTurn().장부금액_백만원}` },
      { label: '설비', value: `면적·라인 기재 ${ghanaStats.면적_라인_기재_건수}건(두 공장 다) · 고용은 PFC만 연도별 ${ghanaStats.PFC_고용_2025_명}명` },
    ],
  },
  {
    key: 'azores',
    numeral: 'ⅩⅬ',
    name: '아소르스의 다섯 캔공장',
    country: '포르투갈 · 아소르스(COFACO Açores · Santa Catarina · Pescatum · Sociedade Corretora · Conseran)',
    tagline: '같은 보전금 안에서 섬 물고기 비중이 100 %부터 8.72 %까지 갈리고, 가장 낮은 곳이 가장 큰 공장이다.',
    ...FLAG.포르투갈,
    stats: [
      { label: '역내산 비중(승인액)', value: regionalSpectrum().공장.map((x) => `${x.약칭} ${x.비중_pct.toFixed(2)}%`).join(' · ') },
      { label: '신청액 대 비중', value: `COFACO 네 해 ${regionalSpectrum().최대_신청.신청액_EUR.toLocaleString('ko-KR')} € > 나머지 넷 ${regionalSpectrum().최대_신청.나머지넷_EUR.toLocaleString('ko-KR')} € · 2024년 역내산은 ${regionalTonnes2024().COFACO_t} t 로 다섯 중 최소` },
      { label: '공공 공장', value: `Santa Catarina 99.73% 를 1 € 에(2009) → ${azoresStats.운영이관일} 민간 임차 · 매수옵션 ${Number(azoresStats.매수옵션_EUR).toLocaleString('ko-KR')} €` },
    ],
  },
  {
    key: 'tog',
    numeral: 'ⅩⅬⅠ',
    name: 'TOG',
    country: '코트디부아르 · 아비장(Thunnus Overseas Group · SCODI · CCO — 단독사원 PP THON 은 선망 회사 CFTO 의 단독사원)',
    tagline: '선망선이 없던 캔 지주 TOG를 선망 회사 CFTO의 주주가 통째로 가졌다.',
    ...FLAG.코트디부아르,
    stats: [
      { label: '2021년의 반반', value: `PP THON ${halfHalf().PP_THON_주식.toLocaleString('ko-KR')}주 = 창업자 ${halfHalf().창업자_주식.toLocaleString('ko-KR')}주 → ${halfHalf().단독사원_결정일} PP THON 단독사원 서명 · 대금은 문서에 없음` },
      { label: 'EU 목록 캔공장 번호', value: `${togStats.EU목록_CI_캔공장_2013} → ${togStats.EU목록_CI_캔공장_2022} · 110 PP(PFCI)는 2020년 9월 기준 목록부터 없음 · 120 PP Airone 은 TOG 계열 아님` },
      { label: '세관 신고', value: `코트디부아르 수출 2021~2023 ${customsGap().수출신고_3년합_kg} kg 대 프랑스 수입 2023 ${customsGap().프랑스수입_kg[2].kg.toLocaleString('ko-KR')} kg` },
    ],
  },
  {
    key: 'mauritius',
    numeral: 'ⅩⅬⅡ',
    name: '모리셔스',
    country: '모리셔스 · 포트루이스(Princes Tuna (Mauritius) — 승인 둘 · Indico Canning — 승인 하나 · 지분법으로 드는 IBL · 2024년에 닫힌 Mer des Mascareignes)',
    tagline: '한 회사의 같은 해를 두 상장사의 장부가 서로 다르게 적는다.',
    ...FLAG.모리셔스,
    stats: [
      { label: '승인 셋 · 법인 둘', value: `${mauritiusStats.승인_리슈테르}(리슈테르) · ${mauritiusStats.승인_마린로드_PTM}(마린로드)는 PTM · ${mauritiusStats.승인_마린로드_Indico}(마린로드)는 별개 법인 Indico Canning(영국 Princes 간접 ${MU_EQUITY.Indico_Princes_간접_pct} %)` },
      { label: '세 지분 숫자', value: `영국 Princes 직접 ${MU_EQUITY.Princes_직접_pct} % · IBL 유효지분 ${MU_EQUITY.IBL_유효_pct} %(직접 ${MU_EQUITY.IBL_직접_pct} + 간접 ${MU_EQUITY.IBL_간접_pct}) · 지분법 적용률 ${MU_EQUITY.IBL_지분법적용률_pct} % — 기준이 다른 세 수다` },
      { label: 'FY2024 의 몫', value: `순이익 ${MU_FY2024.순이익_천Rs.toLocaleString('ko-KR')} × ${MU_EQUITY.IBL_지분법적용률_pct} % = ${MU_FY2024.산술몫_천Rs.toLocaleString('ko-KR')} 인데 인식 ${MU_FY2024.인식몫_천Rs.toLocaleString('ko-KR')}천 루피 · 네 해 합 ${MU_SHARE.미상쇄_천Rs.toLocaleString('ko-KR')} 미상쇄 · 사유는 공시에 없음` },
    ],
  },
  {
    key: 'galapesca',
    numeral: 'ⅩⅬⅢ',
    name: 'Galapesca',
    country: '에콰도르 · 과야킬 Km 12,5 Vía Daule(StarKist Co. 100 % 자회사 · 동원산업 연결 · 공장 두 동과 기계는 임차)',
    tagline: '공장을 갖지 않은 채 미국 1위 브랜드의 파우치를 만든다.',
    ...FLAG.에콰도르,
    stats: [
      { label: '빌린 것 넷', value: `${GP_LEASE.계약.map((c) => `${c.임대인} ${c.연임차료_USD.toLocaleString('ko-KR')}`).join(' · ')} = ${GP_LEASE.합계_USD.toLocaleString('ko-KR')} US$ (2019) — 건물 둘의 합보다 기계 한 건이 크다` },
      { label: '빌린 껍데기 대 자기 설비', value: `자기 유형자산 순장부 ${GP_ASSET.자기유형자산_USD.toLocaleString('ko-KR')}(2018년 말 · 토지 ${GP_ASSET.토지_USD.toLocaleString('ko-KR')} 포함) 대 사용권자산 ${GP_ASSET.사용권자산_USD.toLocaleString('ko-KR')} US$ — ${GP_ASSET.배}배` },
      { label: '한 상대에게 가는 매출', value: `StarKist Co. 앞 ${galapescaStats['StarKist향_비중_2019_pct']} %(2019 주석 · 재계산 ${galapescaStats['StarKist향_재계산_2019_pct']} %) · 선박 ${galapescaStats['선박_척']}척 · 무형자산 ${galapescaStats['무형자산_USD']} · 2024년 매출 ${Number(galapescaStats['매출_2024_USD']).toLocaleString('ko-KR')} · 순이익 ${Number(galapescaStats['순이익_2024_USD']).toLocaleString('ko-KR')} US$` },
    ],
  },
  {
    key: 'cosi',
    numeral: 'ⅩⅬⅣ',
    name: 'Chicken of the Sea',
    country: '미국 · 캘리포니아 엘세군도 등기(운영 법인 Tri-Union Seafoods LLC · Thai Union Group PCL 100 % · 공장은 조지아주 라이언스 하나)',
    tagline: '셋이 같은 값을 올렸는데 하나만 기소되지 않았다.',
    ...FLAG.미국,
    stats: [
      { label: '형사 0, 민사 셋', value: `형사 벌금 ${CS_SETTLE.형사벌금_USD}(기소 없음 · 법무부 조건부 사면) 대 집단 세 트랙 ${CS_SETTLE.트랙.map((t) => `${t.이름} ${t.금액_USD.toLocaleString('ko-KR')}`).join(' · ')} = ${CS_SETTLE.합계_USD.toLocaleString('ko-KR')} US$ · 워싱턴주 동의명령 ${CS_SETTLE.주정부_USD.toLocaleString('ko-KR')} 별도 · 개별 합의 비공개 — 같은 사건에서 StarKist 는 ${CS_SETTLE.형사_StarKist_USD.toLocaleString('ko-KR')}, Bumble Bee 는 ${CS_SETTLE.형사_BumbleBee_USD.toLocaleString('ko-KR')} US$ 를 냈다` },
      { label: '매대의 몫', value: `${CS_SHARE.연도별[0].연도}년 ${CS_SHARE.연도별[0].pct} % → ${CS_SHARE.연도별[1].연도}년 ${CS_SHARE.연도별[1].pct} %(MULO) → ${CS_SHARE.연도별[2].연도}년 ${CS_SHARE.연도별[2].pct} %(MULO+) · 분모는 ${CS_SHARE.분모}이고 포장참치 3사 ${CS_SHARE.포장참치_3사_pct} % 초과와 같은 자에 놓지 않는다` },
      { label: '공장 하나와 그 원료', value: `조지아주 라이언스 ${cosiStats['공장_수']}곳 · ${cosiStats['공장_가동_연월']} 가동 · 투자 발표 ${Number(cosiStats['공장_투자발표_USD']).toLocaleString('ko-KR')} US$ · 인력 약정 ${cosiStats['인력_약정_2009_명']} → ${cosiStats['인력_2014_명']}(2014) → ${cosiStats['인력_2025_명']}(2025)명 · 관세 뒤 주 ${cosiStats['조업일_후_일주']}일 · 원료는 프리쿡 로인이고 캔 바닥의 나라는 가나·태국·유럽으로 갈린다` },
    ],
  },
  {
    key: 'kingfisher',
    numeral: 'ⅩⅬⅤ',
    name: 'Kingfisher Holdings',
    country: `태국 · 방콕 야나와 등기(사업회사 SEAPAC·KF Foods · 공장은 사뭇사콘 나디·사뭇쁘라깐 방푸·송클라 · 일본 상장사 ${kingfisherStats['모회사']} 의결권 ${kfPct(KF_VOTE.지주회사_pct)} %)`,
    tagline: '감사받은 생산범위 전체가 사람 아닌 것이 먹는 물건이다.',
    ...FLAG.태국,
    stats: [
      { label: '도쿄가 쥔 몫', value: `지주회사 의결권 ${kfPct(KF_VOTE.지주회사_pct)} %(간접분 ${kfPct(KF_VOTE.간접분_pct)} % 는 그 안에 든 값) · 사업회사 SEAPAC·KF Foods ${kfPct(KF_VOTE.사업회사_pct)} % 전부 간접 — 어긋난 게 아니라 액면 가산이다 · 네 법인 중 ${KF_VOTE.방콕등기_수}곳이 ${KF_VOTE.등기본점} 등기이고 KF Foods 만 사뭇사콘 나디의 공장 주소다` },
      { label: '정사원 한 명에 임시직 셋', value: `${KF_SEAPAC.법인} ${KF_SEAPAC.정사원.toLocaleString('ko-KR')}명[${(KF_SEAPAC.임시직 ?? 0).toLocaleString('ko-KR')}] · ${KF_KFF.법인} ${KF_KFF.정사원}명[${(KF_KFF.임시직 ?? 0).toLocaleString('ko-KR')}] · ${KF_HOLD.법인} ${KF_HOLD.정사원}명[—] · 두 공장 합 정사원 ${KF_PLANT.정사원_두공장.toLocaleString('ko-KR')}명에 임시직 ${KF_PLANT.임시직_두공장.toLocaleString('ko-KR')}명 · 공시는 「임시」라고만 적는다 (${KF_PLANT.기준일})` },
      { label: '살아 있는 증서와 지나간 증서', value: `${KF_CERT.map((c) => `${c.공장} ${c.증서} ${c.만료}(${c.등급})${c.살아있나 ? ' 유효' : ' 공개본 지남'}`).join(' · ')} · 어분 증서 ${kingfisherStats['어분인증_증서']} 은 ${kingfisherStats['어분인증_정지일']} 정지 → ${kingfisherStats['어분인증_재개일']} 재개, ${kingfisherStats['어분인증_만료']} 까지 · 취소는 없다` },
    ],
  },
  {
    key: 'capsen',
    numeral: 'ⅩⅬⅥ',
    name: 'CAPSEN',
    country: `세네갈 · 다카르 몰 10 부두(조업만 · 공장 없음) · ${capsenStats['모회사']} 지분 ${cpPct(CP_CEIL.지분_pct)} %`,
    tagline: '49 %는 고른 숫자가 아니라 법이 정한 천장이다.',
    ...FLAG.세네갈,
    stats: [
      { label: '법이 정한 천장', value: `지분 ${cpPct(CP_CEIL.지분_pct)} % · ${CP_CEIL.보유주식.toLocaleString('ko-KR')}주 / ${CP_CEIL.총주식.toLocaleString('ko-KR')}주 · 세네갈 해상운송법 loi n°2002-22 제91조가 자본의 ${CP_CEIL.현지요건_pct} % 이상을 현지 국민 소유로 요구한다 — 소수주주라서가 아니다 · 그런데도 연결 종속기업이고 근거는 동원산업 계열 유일의 「${CP_CEIL.연결사유}」다 · 남은 ${CP_CEIL.미보유주식.toLocaleString('ko-KR')}주의 주인은 열한 해 동안 공시에 적히지 않았다(2015년 현지 매체는 종업원 명의를 가리킨다 — 등급 B)` },
      { label: '배 넷과 분모 둘', value: `${CP_FLEET.배.map((b) => `${b.선명}(IMO ${b.imo} · ${b.톤수.toLocaleString('ko-KR')} · ${b.승인연도}년 승인)`).join(' · ')} · 합 ${CP_FLEET.톤수_이_회사.toLocaleString('ko-KR')} 은 세네갈 선망 ${CP_FLEET.선망_세네갈}척 ${CP_FLEET.톤수_세네갈7척.toLocaleString('ko-KR')} 의 ${cpPct(CP_FLEET.비중_7척기준_pct, 1)} %, 인증 시점 여섯 척 ${CP_FLEET.톤수_인증6척.toLocaleString('ko-KR')} 의 ${cpPct(CP_FLEET.비중_인증6척_pct, 1)} % · 단위가 섞인 합이다(GRANADA 만 GT) · 승인 명부는 채낚기 CAP ATLANTIQUE 까지 이 회사 소속으로 적어 「배 다섯」과 「선망 넷」이 갈린다` },
      { label: '인증과 숙제 열 개', value: `${CP_CERT.증서} · ${CP_CERT.인증일} ~ ${CP_CERT.만료일} · 인증기관 ${CP_CERT.인증기관} · 적격일 ${CP_CERT.적격일} · 고객 집단은 이 회사와 Grand Bleu 공동 · 선박은 인증 시점 ${CP_CERT.선박_인증시점_척}척인데 현행 증서 ${CP_CERT.증서판}은 ${CP_CERT.선박_현행증서_척}척이다(COSMOS KIM 적격일 ${CP_CERT.적격일_일곱째}, 명부에 없어 톤수 분모에는 안 넣는다) · 조건 ${CP_CERT.조건_수}개(자원 ${CP_CERT.조건_자원}·생태계 ${CP_CERT.조건_생태계}·관리 ${CP_CERT.조건_관리})이고 ${CP_CERT.조건_손밖}개는 지역수산관리기구가 움직여야 풀린다 · 2025년 어획 ${CP_CERT.어획_합계_t.toLocaleString('ko-KR')} t 은 인증 시점 여섯 척 전체 값이다` },
    ],
  },
  {
    key: 'bounty',
    numeral: 'ⅩⅬⅦ',
    name: 'Bounty Seafood',
    country: `파푸아뉴기니 · 라에 말라항 Portion 679(등기 사무소 · 공장 없음) · ${bountyStats['모회사']} 지분 100.00 %`,
    tagline: '없는 것은 회사가 아니라 자기 이름의 공장이다.',
    ...FLAG.파푸아뉴기니,
    stats: [
      { label: '등기는 살아 있고 인증은 꺼졌다', value: `회사 등록 ${BT_REG.회사등록번호} · ${BT_REG.회사등록상태} · 외국인기업 인증 ${BT_REG.인증번호}은 ${BT_REG.인증비활성일} 자로 ${BT_REG.인증상태} · 투자진흥법 제25조 2항이 인증 없는 영업을 금하고 제36조 3항은 취소 뒤 청산 목적 한시 영업만 남긴다(사유는 비공개) · 등기 업종은 어업과 건설이고 참치 가공은 취소된 인증 쪽에만 있다 · 설립은 등기 ${BT_REG.설립일_등기} · 공시 연혁 ${BT_REG.설립일_공시}이고 2012년 5월의 두 날짜는 취득일·대여일이다` },
      { label: '회수 열이 비어 있다', value: `출자 ${BT_MONEY.취득금액_백만원}백만 원 전액 손상(장부가 0) · 대여 원금 ${btNum(BT_MONEY.원금_USD)} 달러가 ${bountyStats['대여실행일']} 이후 달러로 고정 — 일곱 시점 잔액을 각 기준일 매매기준율로 나누면 전부 같은 값이다 · 이자율 ${btNum(BT_MONEY.이자율_pct, 1)} % · 담보 없음 · 미수금 ${btNum(BT_MONEY.미수금_천원)}천 원은 2020년부터 1원도 안 움직였다 · 충당금 단독 마지막 값은 2024년 ${btNum(BT_MONEY.충당금_2024단독_천원)}천 원(2025년부터 키리바시 법인과 합산 공시) · 매출·매입·보증 표에 행이 전부 없다` },
      { label: '여섯을 잡는 명부가 이 회사만 빼놓는다', value: `유럽연합 제3국 승인시설 목록 파푸아뉴기니 항목 전수 ${BT_LIST.EU전수}건 중 육상 가공장 ${BT_LIST.EU육상가공장}곳(07EST079 Frabelle · 07EPR039 IFC · 07EPR5110 Majestic · 07EPR009 Nambawan · 08EPR001 RD · 09EPR019 South Seas)에 이 회사는 ${BT_LIST.EU_Bounty등재}건 · 해양관리협의회 유통관리·돌고래 안전·수산업협회 명부도 같은 여섯을 잡고 이 회사를 잡지 않는다 · 필지도 다르다(Majestic ${BT_LIST.Majestic필지} · IFC ${BT_LIST.IFC필지} · Nambawan ${BT_LIST.Nambawan필지} 대 이 회사 ${BT_LIST.등기필지}) · 2012년 유럽의회 연구 Table 5 는 후보 ${BT_CTX.EP후보수}곳을 줄 세워 이 계획에 ${BT_CTX.viability_pct} %를 매겼고 254쪽 전문에 「Bounty」 문자열이 ${BT_LIST.EP_Bounty문자열}번 나온다` },
    ],
  },
  {
    key: 'rd',
    numeral: 'ⅩⅬⅧ',
    name: 'RD Corporation',
    country: `파푸아뉴기니 · 마당 Portion 1004(가공장 08EPR001) + 필리핀 탐블러(1652)`,
    tagline: '두 문의 폭이 다르다 — 비싼 공장만 원료의 국적을 안 묻는다.',
    ...FLAG.파푸아뉴기니,
    stats: [
      { label: '두 문', value: `두 공장 다 유럽 관세 0 % — 마당은 경제동반자협정(잠정적용 ${RD_G.EPA잠정적용}), 탐블러는 일반특혜관세(${RD_G.GSP개시}) · 다른 것은 원료의 국적을 묻는가다: 마당은 ${RD_G.조달예외조항}의 전면적 조달 예외로 묻지 않고(2019년 어선 15척 중 13척이 현지기반 외국선), 탐블러는 어선의 기국·등록·소유를 따진다 · ${RD_G.의정서대체}이 ${RD_G.의정서대체발효} 자로 의정서를 대체했고 조문이 요구하는 것은 수량의 「표시」이지 상한이 아니다 · 미충족 시 최혜국 ${RD_G.MFN_pct} % · 문을 실제로 여는 열쇠는 위생 승인이다(2012년 연구 시점의 피지는 통보하지 않았고 연구는 그 이유를 위생 미비로 적는다 — 통보는 2025-04-08 · 이 공장도 2008년에 한 해 배제)` },
      { label: '마당 공장과 사람', value: `정격 ${RD_M.정격_t일} t/일 · 실제 ${RD_M.실제_t일} t/일(가동률 ${RD_M.가동률_pct} %) · 로인 ${RD_M.로인_t일}·캔 ${RD_M.캔_t일} · 제관 설비 있음 · ${rdNum(RD_M.면적_ha, 2)} ha · 자가발전 ${rdNum(RD_M.자가발전_MW, 1)} MW · 능력은 다섯 값이라 한 값으로 못 적는다 · 사람도 세 자가 다르다: 정규직 자리 ${rdNum(RD_M.인원_정규직)} · 급여명부 ${rdNum(RD_M.급여명부)} · 국적 합 ${rdNum(RD_M.국적합)} · 회사 방침이 월 ${RD_M.채용_월}명 신규 채용(연 ${rdNum(RD_M.채용_연)}명 = 정규직 자리의 ${rdNum(RD_M.채용_몫_pct, 1)} %)이고 10년 이상 근속은 약 ${RD_M.근속10년}명 · 결근율 현장확인 약 ${RD_M.결근_pct} %(「30~40 %」는 인용·로인 한정) · 생산성 필리핀 대비 ${RD_M.생산성열위_pct} % 낮음` },
      { label: '법원과 약속', value: `소송 ${RD_C.갈래수} 갈래(건설계약 1998·관습지 2000·고용 2010·제조물 2008) · 제조물은 ${RD_C.일심일} 하루에 ${RD_C.일심건수}건 1심 패소 → ${RD_C.파기1건일}·${RD_C.파기5건일} 에 대법원이 전부 파기(이유는 1심의 이유 기재 흠이고 이물 유무는 판단 안 함, 배상액 미산정) · 고용 사건은 회사 패소 · 마당 2차 공장은 열세 해째 말이다: 같은 번지에 ${RD_P.등기일} 등록된 Niugini Tuna(${RD_P.법인번호})가 연차보고 ${RD_P.제출건수}건으로 ${RD_P.말소일} 말소(대만 파트너는 ${RD_P.대만파트너_보고년}년 연속 제출) · 지금 합작법인은 등기 ${RD_P.합작법인등기}건이고 예산 배정액도 없으며 계획 능력이 ${RD_P.능력_2025} → ${RD_P.능력_2026} t/일로 내려갔다` },
    ],
  },
  {
    key: 'soltuna',
    numeral: 'ⅩⅬⅨ',
    name: 'SolTuna',
    country: `솔로몬제도 · 서부주 노로 1 Tuna Drive(가공장 ${ST_E.승인번호}) + 선단 법인 NFD`,
    tagline: '한 나라에 공장 하나 — 유럽으로 가는 것은 캔이 아니라 조리 로인이다.',
    ...FLAG.솔로몬제도,
    stats: [
      { label: '유럽', value: `승인 가공공장은 이 나라에 한 곳(${ST_E.승인번호}) · 2021~2025년 EU 가 들여온 솔로몬제도산 참치 조제품은 해마다 조리 로인 ${stNum(ST_E.로인비중_pct, 2)} %(Comext CN8 · 캔·소매 여섯 세목과 Bonito 0) · 받은 나라는 이탈리아·스페인(2024년 EU 로인 안에서 ${stNum(ST_E.이탈리아_pct, 2)} 대 ${stNum(ST_E.스페인_pct, 2)} · 두 나라 밖은 5년 통산 ${stNum(ST_E.두나라밖_pct, 2)} %) · ${stNum(ST_E.t2024, 1)} t(2024 최고) → ${stNum(ST_E.t2025, 1)} t(2025), kg당 €${stNum(ST_E.EURkg2025, 2)} · 캔은 역내·태평양 매대로 간다` },
      { label: '국가와 공장', value: `국가·공공 세 곳이 공장 지분 ${stNum(ST_Q.국가공공_pct, 6)} %(SINPF ${stNum(ST_Q.SINPF_pct, 4)} · ICSI ${stNum(ST_Q.ICSI_pct, 4)} · 서부주 ${stNum(ST_Q.서부주_pct, 4)}) · 선단 법인 NFD 에는 ${ST_Q.NFD_국가공공_pct} % · 신주는 공장만 ${ST_Q.신주발행}번 · 연금은 제 몫을 「Other equity investments」로 적고 운영은 Tri Marine 이 한다 · 국가가 쥔 것은 공캔·뚜껑 면제 명령의 갱신권(LN 590·591 합 SBD ${stNum(ST_H.합)}, 2026-01-30 만료) · 캔참치 가격통제는 1987년부터 ${ST_H.가격통제_품목수}개 생필품 중 ${ST_H.가격통제_순번}번이고 통제구역 ${ST_H.가격통제_구역수}곳에 노로가 없다` },
      { label: '竿釣·전기·사람', value: `국가 竿釣 어획 ${stNum(ST_P.竿釣[1])} t(2022) → ${ST_P.竿釣[3]}(2024) · 2025년 면허 ${ST_P.竿釣_면허_2025}장 · 인증기관이 전한 이유는 운영상의 결정이고 인증 범위는 살려 뒀다 · 공장 자가발전 ${stNum(ST_P.자가발전_MW, 1)} MW 옆에 Solomon Power 계통(고객 ${ST_P.계통_고객}호)이 따로 있다 · 1991년 가장 큰 직군은 Pole and Line Fleet ${ST_P.인원_竿釣}명(총원 ${stNum(ST_P.인원_총원)})` },
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
    dongwonfnb: DONGWONFNB_SPEC,
    hagoromo: HAGOROMO_SPEC,
    cnfc: CNFC_SPEC,
    kaichuang: KAICHUANG_SPEC,
    alliance: ALLIANCE_SPEC,
    herdez: HERDEZ_SPEC,
    sajoseafood: SAJOSEAFOOD_SPEC,
    garavilla: GARAVILLA_SPEC,
    salica: SALICA_SPEC,
    majestic: MAJESTIC_SPEC,
    sca: SCA_SPEC,
    ghana: GHANA_SPEC,
    azores: AZORES_SPEC,
    tog: TOG_SPEC,
    mauritius: MAURITIUS_SPEC,
    galapesca: GALAPESCA_SPEC,
    cosi: COSI_SPEC,
    kingfisher: KINGFISHER_SPEC,
    capsen: CAPSEN_SPEC,
    bounty: BOUNTY_SPEC,
    rd: RD_SPEC,
    soltuna: SOLTUNA_SPEC,
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
