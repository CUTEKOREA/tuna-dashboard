# L-07 위젯 색상 치환 DRY-RUN

> 실행일: 2026-08-15 KST
> 기준 커밋: `4adc98e3065faa61ac974ed41ad76f9ab1938919` (`origin/main`과 동일)
> 명령: `python3 scripts/fix_widget_colors.py --dry-run`
> 범위: `components/**/*.tsx` (`components/v2/`, `components/cosmo/`, 테스트 파일 제외)
> 판별: 명시된 JSX 색 속성, JSX 스타일 객체, CSS 블록, 명시적 스타일 상수만 치환; rgba·주석·데이터 의미값은 스킵


- 총 치환 수: 4103
- 변경 파일 수: 334

## 파일별 치환 예정 건수

| 파일 | 건수 |
| --- | ---: |
| `components/AIForecast.tsx` | 10 |
| `components/BeefDashboard.tsx` | 9 |
| `components/BeefEmpiricalInsights.tsx` | 17 |
| `components/BeefUsdaWidgets.tsx` | 2 |
| `components/BeefWidgets.tsx` | 59 |
| `components/CanneryStatusCharts.tsx` | 4 |
| `components/CarrotDashboard.tsx` | 91 |
| `components/CashewIntelligence.tsx` | 1 |
| `components/CashewStrategy.tsx` | 40 |
| `components/CassavaDashboard.tsx` | 25 |
| `components/CategoryPortfolio.tsx` | 9 |
| `components/ChickenCorporateWidget.tsx` | 5 |
| `components/ChickenDashboard.tsx` | 18 |
| `components/ChickenEmpiricalInsights.tsx` | 16 |
| `components/ChickenPartsWidget.tsx` | 13 |
| `components/ChickenThaiInsightsA.tsx` | 18 |
| `components/ChickenThaiInsightsB.tsx` | 21 |
| `components/ChickenUsdaWidgets.tsx` | 2 |
| `components/CocoaDashboard.tsx` | 6 |
| `components/CocoaUsdaWidgets.tsx` | 2 |
| `components/ColdStorageDashboard.tsx` | 14 |
| `components/ColdStorageMap.tsx` | 2 |
| `components/CompanyVesselStatus.tsx` | 5 |
| `components/EstimateBadge.tsx` | 2 |
| `components/EuroTunaWidgets.tsx` | 9 |
| `components/ExchangeSimulator.tsx` | 14 |
| `components/FalklandSquidDashboard.tsx` | 15 |
| `components/FfaEnsoCatchCorrelation.tsx` | 11 |
| `components/FfaGlobalProcessingCapacity.tsx` | 6 |
| `components/FfaStockHealthGauge.tsx` | 11 |
| `components/FfaSupplyConcentrationRisk.tsx` | 5 |
| `components/FfaVdsMarketIndicator.tsx` | 19 |
| `components/FfaWcpoSupplyDashboard.tsx` | 12 |
| `components/FieldTools.tsx` | 49 |
| `components/FishStatBlackholeBar.tsx` | 1 |
| `components/FishStatClimateDeathCross.tsx` | 1 |
| `components/FishStatDumpingRoute.tsx` | 2 |
| `components/FishStatFilletCurve.tsx` | 2 |
| `components/FishStatHegemonySankey.tsx` | 1 |
| `components/FishStatProteinBubble.tsx` | 1 |
| `components/FishStatReplacementRadar.tsx` | 1 |
| `components/FishStatSafetyGap.tsx` | 2 |
| `components/FishStatTACIllusion.tsx` | 1 |
| `components/FishingDaysStatus.tsx` | 1 |
| `components/FlatfishDashboard.tsx` | 22 |
| `components/FleetAnalysisPanels.tsx` | 2 |
| `components/FleetOperationStatus.tsx` | 18 |
| `components/FleetPerformance.tsx` | 1 |
| `components/FleetPixelMap.tsx` | 4 |
| `components/FleetProduction2025.tsx` | 5 |
| `components/FleetRosterGrid.tsx` | 3 |
| `components/FleetStrategyMatrix.tsx` | 38 |
| `components/GalchiDashboard.tsx` | 12 |
| `components/GarlicDashboard.tsx` | 5 |
| `components/GarlicUsdaWidgets.tsx` | 4 |
| `components/GensanImportChart.tsx` | 5 |
| `components/Gtc2026Insights.tsx` | 1 |
| `components/HarborBanner.tsx` | 7 |
| `components/HermesAgent.tsx` | 13 |
| `components/InfoTooltip.tsx` | 2 |
| `components/Insight9TunaVsSquidCombo.tsx` | 3 |
| `components/JukkumiDashboard.tsx` | 13 |
| `components/JukkumiFTAQuarterly.tsx` | 15 |
| `components/KimAgriDataWidgets.tsx` | 17 |
| `components/KimDashboard.tsx` | 16 |
| `components/KimLogisticsWidget.tsx` | 5 |
| `components/KimSeasonedWidget.tsx` | 7 |
| `components/KoreaConsignmentDashboard.tsx` | 49 |
| `components/MackerelDashboard.tsx` | 18 |
| `components/MackerelWidgetV2.tsx` | 3 |
| `components/MangosteenDashboard.tsx` | 41 |
| `components/MarketDashboard.tsx` | 5 |
| `components/MscIntelligenceWidgets.tsx` | 52 |
| `components/MscStrategyDashboard.tsx` | 2 |
| `components/OctopusDomesticCliff.tsx` | 11 |
| `components/OctopusFTAQuarterly.tsx` | 8 |
| `components/OctopusPhase2Widgets.tsx` | 47 |
| `components/PacificEezStrategicWidget.tsx` | 6 |
| `components/PacificGlobe.tsx` | 4 |
| `components/PacificVesselMap.tsx` | 26 |
| `components/PetFoodDashboard.tsx` | 42 |
| `components/PnaAccessFeeWidgets.tsx` | 11 |
| `components/PollockChinaDetour.tsx` | 5 |
| `components/PollockComplianceWidgets.tsx` | 6 |
| `components/PollockDashboard.tsx` | 43 |
| `components/PollockDraftInsights.tsx` | 21 |
| `components/PollockFinancialWidgets.tsx` | 6 |
| `components/PollockFutureWidgets.tsx` | 41 |
| `components/PollockKoreaCrisis.tsx` | 8 |
| `components/PollockLandedCost.tsx` | 8 |
| `components/PollockMacroWidgets.tsx` | 7 |
| `components/PollockPolicyFinanceWidgets.tsx` | 6 |
| `components/PollockPolicyRiskRadar.tsx` | 16 |
| `components/PollockPremiumSpread.tsx` | 5 |
| `components/PollockPriceForecast.tsx` | 9 |
| `components/PollockProcessedWidgets.tsx` | 13 |
| `components/PollockProcessingMarginWidgets.tsx` | 53 |
| `components/PollockSalesValueWidgets.tsx` | 46 |
| `components/PollockSupplyMacroWidgets.tsx` | 44 |
| `components/PollockSupplyResilience.tsx` | 15 |
| `components/PollockTradeWidgets.tsx` | 8 |
| `components/PollockValueAddWidgets.tsx` | 6 |
| `components/PollockValueDecoupling.tsx` | 6 |
| `components/PorkEmpiricalInsights.tsx` | 19 |
| `components/PorkUsdaWidgets.tsx` | 2 |
| `components/PorkWidgets.tsx` | 59 |
| `components/PriceLagSimulator.tsx` | 8 |
| `components/PurseSeinerDashboard.tsx` | 51 |
| `components/ReeferFreightChart.tsx` | 2 |
| `components/ReeferMovement.tsx` | 16 |
| `components/ResearchLabDashboard.tsx` | 21 |
| `components/RetailPOS.tsx` | 12 |
| `components/SEAsiaOEMDashboard.tsx` | 53 |
| `components/SalmonDashboard.tsx` | 43 |
| `components/SalmonESGTracker.tsx` | 7 |
| `components/SalmonForecastSimulator.tsx` | 15 |
| `components/SalmonInsightAutomationYield.tsx` | 2 |
| `components/SalmonInsightClimate.tsx` | 1 |
| `components/SalmonInsightDoubleMateriality.tsx` | 6 |
| `components/SalmonInsightFeed.tsx` | 4 |
| `components/SalmonInsightFeedBio.tsx` | 2 |
| `components/SalmonInsightGlobalSupplyPrice.tsx` | 1 |
| `components/SalmonInsightLogisticsResilience.tsx` | 7 |
| `components/SalmonInsightMarginSqueeze.tsx` | 1 |
| `components/SalmonInsightProcessing.tsx` | 2 |
| `components/SalmonInsightSmartColdChain.tsx` | 1 |
| `components/SalmonInsightSmolt.tsx` | 1 |
| `components/SalmonInsightTradeDown.tsx` | 9 |
| `components/SalmonInsightWidgets.tsx` | 12 |
| `components/SalmonLiveTicker.tsx` | 7 |
| `components/SalmonNTBRadar.tsx` | 5 |
| `components/SalmonPolicyImpact.tsx` | 9 |
| `components/SashimiSteakDashboard.tsx` | 2 |
| `components/SeafoodStockWidget.tsx` | 4 |
| `components/ShrimpDashboard.tsx` | 7 |
| `components/ShrimpFTAQuarterly.tsx` | 10 |
| `components/ShrimpWidgetCommon.tsx` | 5 |
| `components/SongkhlaCanneryStatusCharts.tsx` | 3 |
| `components/SquidDashboard.tsx` | 8 |
| `components/StrategyIntel.tsx` | 9 |
| `components/SupplierDiscoveryDashboard.tsx` | 125 |
| `components/SupplierTrademoPhase2.tsx` | 20 |
| `components/SurimiInsightWidgets.tsx` | 9 |
| `components/TakeawayBox.tsx` | 1 |
| `components/ThaiTunaTradeStats.tsx` | 11 |
| `components/ToastProvider.tsx` | 4 |
| `components/TradeRouteSankey.tsx` | 4 |
| `components/TraderImportChart.tsx` | 2 |
| `components/TunaAquaHegemony.tsx` | 2 |
| `components/TunaAquaValue.tsx` | 4 |
| `components/TunaAquacultureExpansion.tsx` | 5 |
| `components/TunaAtuna8YPrice.tsx` | 5 |
| `components/TunaAtunaMayNews.tsx` | 3 |
| `components/TunaBioUpcyclingGap.tsx` | 8 |
| `components/TunaCannedMarketShare.tsx` | 1 |
| `components/TunaCatchBySpeciesLive.tsx` | 11 |
| `components/TunaCatchVolumeTrend.tsx` | 3 |
| `components/TunaColdChainCostGap.tsx` | 4 |
| `components/TunaComplianceRadar.tsx` | 12 |
| `components/TunaCorpusStudyInsights.tsx` | 16 |
| `components/TunaCrossroads.tsx` | 2 |
| `components/TunaDashboard.tsx` | 21 |
| `components/TunaEmergingMarkets.tsx` | 5 |
| `components/TunaEsgRiskRadar.tsx` | 6 |
| `components/TunaExportRaceWidget.tsx` | 5 |
| `components/TunaExportShare.tsx` | 1 |
| `components/TunaExtractDashboard.tsx` | 35 |
| `components/TunaForecastWidgets.tsx` | 11 |
| `components/TunaGlobalHalalStrategy.tsx` | 2 |
| `components/TunaHSClassifier.tsx` | 5 |
| `components/TunaImportBlackhole.tsx` | 1 |
| `components/TunaInsiderSignalWidget.tsx` | 12 |
| `components/TunaInsightWidgets.tsx` | 17 |
| `components/TunaInsightsDashboard.tsx` | 65 |
| `components/TunaIntelInsightsB4.tsx` | 32 |
| `components/TunaJapan2050Insights.tsx` | 32 |
| `components/TunaKfasResearch.tsx` | 33 |
| `components/TunaKmiFtaBluefinInsights.tsx` | 15 |
| `components/TunaKoreaOrigins.tsx` | 6 |
| `components/TunaKoreaPosition.tsx` | 5 |
| `components/TunaLandingCost.tsx` | 13 |
| `components/TunaLiveTicker.tsx` | 6 |
| `components/TunaMofFisheryWidget.tsx` | 19 |
| `components/TunaNewInsightsA.tsx` | 12 |
| `components/TunaNewInsightsB.tsx` | 14 |
| `components/TunaOperationalIntelWidgets.tsx` | 18 |
| `components/TunaOriginPriceTrend.tsx` | 2 |
| `components/TunaOriginPriceTrendLive.tsx` | 2 |
| `components/TunaPeptideEfficacy.tsx` | 8 |
| `components/TunaPetCareMargin.tsx` | 2 |
| `components/TunaPngHubStrategy.tsx` | 6 |
| `components/TunaPolicyRiskRadar.tsx` | 18 |
| `components/TunaPrecisionFishing.tsx` | 10 |
| `components/TunaPriceDecoupling.tsx` | 12 |
| `components/TunaProcessedWidgets.tsx` | 11 |
| `components/TunaProcessingYield.tsx` | 1 |
| `components/TunaProteinBasketWidget.tsx` | 3 |
| `components/TunaRFMOLibrarian.tsx` | 3 |
| `components/TunaRanching.tsx` | 150 |
| `components/TunaRanchingEducation.tsx` | 2 |
| `components/TunaReeferLogisticsWidgets.tsx` | 14 |
| `components/TunaRestaurantMap.tsx` | 1 |
| `components/TunaSdgCircular.tsx` | 8 |
| `components/TunaSpeciesComposition.tsx` | 1 |
| `components/TunaSupplierHub.tsx` | 7 |
| `components/TunaTacMonitor.tsx` | 9 |
| `components/TunaTradeIntelWidgets.tsx` | 6 |
| `components/TunaUpcyclingWidgets.tsx` | 11 |
| `components/TunaUsGatewayWidget.tsx` | 7 |
| `components/TunaUsLoinImports.tsx` | 15 |
| `components/TunaUsdaKoreaSeafood.tsx` | 2 |
| `components/TunaVietnamOemStrategy.tsx` | 6 |
| `components/UnloadingAnalytics.tsx` | 16 |
| `components/UnloadingHistory.tsx` | 6 |
| `components/UnloadingHistoryBoundary.tsx` | 1 |
| `components/UnloadingStatus.tsx` | 34 |
| `components/UnloadingTimelineReplay.tsx` | 14 |
| `components/UsPolicyImpactWidget.tsx` | 7 |
| `components/UsPollockDetourWidget.tsx` | 7 |
| `components/UsTunaImportWidget.tsx` | 2 |
| `components/UsTunaMarketShareWidget.tsx` | 2 |
| `components/UsedCarCharts.tsx` | 26 |
| `components/UsedCarExport.tsx` | 92 |
| `components/VdsStrategyMatrix.tsx` | 6 |
| `components/WestAfricaMap.tsx` | 6 |
| `components/WhelkDashboard.tsx` | 98 |
| `components/WhelkFTAQuarterly.tsx` | 13 |
| `components/WidgetCard.tsx` | 3 |
| `components/WidgetProvenance.tsx` | 5 |
| `components/msc-strategy/MscCanadaGrowthCase.tsx` | 15 |
| `components/msc-strategy/MscCertificationPipeline.tsx` | 13 |
| `components/msc-strategy/MscConsumerAwareness.tsx` | 15 |
| `components/msc-strategy/MscConsumptionStructure.tsx` | 6 |
| `components/msc-strategy/MscDemographicAcceptance.tsx` | 6 |
| `components/msc-strategy/MscEcolabelCompetition.tsx` | 9 |
| `components/msc-strategy/MscEcolabelRegistryScale.tsx` | 4 |
| `components/msc-strategy/MscEuropeRetailPrices.tsx` | 11 |
| `components/msc-strategy/MscFaoAreaPenetration.tsx` | 5 |
| `components/msc-strategy/MscGearTypeTrends.tsx` | 15 |
| `components/msc-strategy/MscGlobalEngagementKpi.tsx` | 13 |
| `components/msc-strategy/MscHarvestStrategyTimeline.tsx` | 8 |
| `components/msc-strategy/MscImprovementsDelivered.tsx` | 14 |
| `components/msc-strategy/MscKoreaPositioning.tsx` | 7 |
| `components/msc-strategy/MscMarketCategorySize.tsx` | 16 |
| `components/msc-strategy/MscOpenConditions.tsx` | 7 |
| `components/msc-strategy/MscPbNbMatrix.tsx` | 11 |
| `components/msc-strategy/MscProductCountByCountry.tsx` | 7 |
| `components/msc-strategy/MscProductVolumeGrowth.tsx` | 10 |
| `components/msc-strategy/MscProgramOverview.tsx` | 6 |
| `components/msc-strategy/MscRetailChannelPenetration.tsx` | 5 |
| `components/msc-strategy/MscRetailerSkuMonitor.tsx` | 4 |
| `components/msc-strategy/MscRfmoAlignment.tsx` | 12 |
| `components/msc-strategy/MscSouthVsNorthEurope.tsx` | 25 |
| `components/msc-strategy/MscSpeciesCoverageHeatmap.tsx` | 7 |
| `components/msc-strategy/MscStockScorecard.tsx` | 14 |
| `components/msc-strategy/MscSuspensionHistory.tsx` | 10 |
| `components/msc-strategy/MscUkShopperTrends.tsx` | 7 |
| `components/msc-strategy/MscVsFipComparison.tsx` | 10 |
| `components/sashimi-strategy/SasBluefinRanchingEconomics.tsx` | 5 |
| `components/sashimi-strategy/SasCoTreatmentImpact.tsx` | 8 |
| `components/sashimi-strategy/SasDomesticRetailTrend.tsx` | 10 |
| `components/sashimi-strategy/SasEuBrandMap.tsx` | 2 |
| `components/sashimi-strategy/SasEuCatchGate.tsx` | 2 |
| `components/sashimi-strategy/SasEuClosedCycle.tsx` | 2 |
| `components/sashimi-strategy/SasEuDistantFleet.tsx` | 10 |
| `components/sashimi-strategy/SasEuFreshVsCanned.tsx` | 16 |
| `components/sashimi-strategy/SasEuImportSegmentation.tsx` | 7 |
| `components/sashimi-strategy/SasEuMscGate.tsx` | 10 |
| `components/sashimi-strategy/SasEuProcessingHub.tsx` | 3 |
| `components/sashimi-strategy/SasEuQuotaProduction.tsx` | 5 |
| `components/sashimi-strategy/SasEuRetailInflation.tsx` | 10 |
| `components/sashimi-strategy/SasEuTariffRegime.tsx` | 6 |
| `components/sashimi-strategy/SasExColdLogistics.tsx` | 8 |
| `components/sashimi-strategy/SasExEmergingMena.tsx` | 3 |
| `components/sashimi-strategy/SasExportChecklist.tsx` | 6 |
| `components/sashimi-strategy/SasExportPartnerStrategy.tsx` | 10 |
| `components/sashimi-strategy/SasFourCountryComparison.tsx` | 4 |
| `components/sashimi-strategy/SasGlChinaDemand.tsx` | 3 |
| `components/sashimi-strategy/SasGlConsumptionMatrix.tsx` | 7 |
| `components/sashimi-strategy/SasGlTradeFlows.tsx` | 11 |
| `components/sashimi-strategy/SasGlWcpoSupply.tsx` | 8 |
| `components/sashimi-strategy/SasGlobalHotspots.tsx` | 2 |
| `components/sashimi-strategy/SasGlobalOutlook2030.tsx` | 15 |
| `components/sashimi-strategy/SasHawaiiDomesticNiche.tsx` | 9 |
| `components/sashimi-strategy/SasHedonicPriceFactors.tsx` | 6 |
| `components/sashimi-strategy/SasJapanDemandDecline.tsx` | 15 |
| `components/sashimi-strategy/SasJpAquaculture.tsx` | 9 |
| `components/sashimi-strategy/SasJpDistribution.tsx` | 1 |
| `components/sashimi-strategy/SasJpImportYen.tsx` | 11 |
| `components/sashimi-strategy/SasKoreaFoodserviceD2C.tsx` | 7 |
| `components/sashimi-strategy/SasKoreaJapanDependency.tsx` | 21 |
| `components/sashimi-strategy/SasKoreaMajorCompanies.tsx` | 17 |
| `components/sashimi-strategy/SasKoreaMedBftImports.tsx` | 9 |
| `components/sashimi-strategy/SasKoreaProductionStructure.tsx` | 31 |
| `components/sashimi-strategy/SasKoreaTradeDecade.tsx` | 16 |
| `components/sashimi-strategy/SasKrAccessQuota.tsx` | 9 |
| `components/sashimi-strategy/SasKrByproduct.tsx` | 8 |
| `components/sashimi-strategy/SasKrDualRoute.tsx` | 3 |
| `components/sashimi-strategy/SasKrFleetEconomics.tsx` | 10 |
| `components/sashimi-strategy/SasKrSuperTuna.tsx` | 10 |
| `components/sashimi-strategy/SasMarketKPIs.tsx` | 20 |
| `components/sashimi-strategy/SasOlCellBased.tsx` | 1 |
| `components/sashimi-strategy/SasOlClimateMigration.tsx` | 9 |
| `components/sashimi-strategy/SasPrAuctionDirect.tsx` | 3 |
| `components/sashimi-strategy/SasPrGradeBySpecies.tsx` | 3 |
| `components/sashimi-strategy/SasPrGradeSystem.tsx` | 4 |
| `components/sashimi-strategy/SasQuotaVolatility.tsx` | 3 |
| `components/sashimi-strategy/SasSashimiPriceLadder.tsx` | 3 |
| `components/sashimi-strategy/SasSpeciesPriceTier.tsx` | 13 |
| `components/sashimi-strategy/SasSupplyChainSplit.tsx` | 6 |
| `components/sashimi-strategy/SasThaiEsgRisk.tsx` | 2 |
| `components/sashimi-strategy/SasThaiSourcing.tsx` | 8 |
| `components/sashimi-strategy/SasThailandHub.tsx` | 11 |
| `components/sashimi-strategy/SasToyosuAuction.tsx` | 16 |
| `components/sashimi-strategy/SasTraceabilityRatings.tsx` | 9 |
| `components/sashimi-strategy/SasTriadDynamics.tsx` | 5 |
| `components/sashimi-strategy/SasUkChannelSplit.tsx` | 7 |
| `components/sashimi-strategy/SasUkMarket.tsx` | 11 |
| `components/sashimi-strategy/SasUkSupplierTariff.tsx` | 9 |
| `components/sashimi-strategy/SasUsCompetitorMap.tsx` | 3 |
| `components/sashimi-strategy/SasUsDemandSeasonality.tsx` | 11 |
| `components/sashimi-strategy/SasUsImportBarriers.tsx` | 5 |
| `components/sashimi-strategy/SasUsMarginWaterfall.tsx` | 7 |
| `components/sashimi-strategy/SasUsSupplierOrigin.tsx` | 10 |
| `components/sashimi-strategy/SasUsSushiPokeMarket.tsx` | 9 |
| `components/sashimi-strategy/SasUsTariffLadder.tsx` | 10 |
| `components/squid/BasisChips.tsx` | 5 |
| `components/squid/GenericWidget.tsx` | 13 |
| `components/squid/SectionA.tsx` | 15 |
| `components/squid/SectionB.tsx` | 6 |
| `components/squid/SectionC.tsx` | 6 |
| `components/squid/SectionE.tsx` | 3 |
| `components/squid/SquidCard.tsx` | 3 |
| `components/squid/SquidSection.tsx` | 3 |

## 스킵 사유

- 알파 포함 rgba: 956
- 비스타일/의미값: 1439
- 주석: 3
- 제외 디렉터리(v2/cosmo): 2
- 테스트 파일: 0

## 샘플 diff 20개

### 1. `components/AIForecast.tsx:80`

```diff
-        <p style={{ color: '#94a3b8', margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold' }}>{label}</p>
+        <p style={{ color: 'var(--w-slate-400)', margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold' }}>{label}</p>
```
### 2. `components/AIForecast.tsx:118`

```diff
-        <circle cx={cx} cy={cy} r={5} fill={dotColor} stroke="#1a2442" strokeWidth={2} />
+        <circle cx={cx} cy={cy} r={5} fill={dotColor} stroke="var(--w-navy-900)" strokeWidth={2} />
```
### 3. `components/AIForecast.tsx:137`

```diff
-  return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill="#1a2442" stroke={dotColor} strokeWidth={2} />;
+  return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill="var(--w-navy-900)" stroke={dotColor} strokeWidth={2} />;
```
### 4. `components/AIForecast.tsx:148`

```diff
-          <Cpu size={22} style={{ color: '#8b5cf6' }} />
+          <Cpu size={22} style={{ color: 'var(--w-violet-500)' }} />
```
### 5. `components/AIForecast.tsx:168`

```diff
-          style={{ borderColor: scenario === 'base' ? '#38bdf8' : '' }}
+          style={{ borderColor: scenario === 'base' ? 'var(--w-sky-400)' : '' }}
```
### 6. `components/AIForecast.tsx:193`

```diff
-            <div className={styles.legendItem}><div className={styles.colorBox} style={{ background: 'var(--color-danger)', border: '1px dashed #ef4444' }} /><TermTooltip term="SKJ 예측 (Est)" description="Estimated(예상치)의 약자로 AI가 계산한 가다랑어의 향후 예상 가격입니다." /></div>
+            <div className={styles.legendItem}><div className={styles.colorBox} style={{ background: 'var(--color-danger)', border: '1px dashed var(--w-red-500)' }} /><TermTooltip term="SKJ 예측 (Est)" description="Estimated(예상치)의 약자로 AI가 계산한 가다랑어의 향후 예상 가격입니다." /></div>
```
### 7. `components/AIForecast.tsx:202`

```diff
-            <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
+            <XAxis dataKey="month" stroke="var(--w-slate-500)" fontSize={12} tickLine={false} axisLine={false} />
```
### 8. `components/AIForecast.tsx:203`

```diff
-            <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${Number(val).toLocaleString()}`} />
+            <YAxis yAxisId="left" stroke="var(--w-slate-500)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${Number(val).toLocaleString()}`} />
```
### 9. `components/AIForecast.tsx:204`

```diff
-            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
+            <YAxis yAxisId="right" orientation="right" stroke="var(--w-slate-500)" fontSize={12} tickLine={false} axisLine={false} />
```
### 10. `components/AIForecast.tsx:218`

```diff
-            <Line yAxisId="left" type="stepAfter" dataKey="mgo" name="Brent Oil ($/bbl)" stroke="var(--color-info)" strokeWidth={3} dot={{ r: 4, fill: '#1a2442', strokeWidth: 2 }} />
+            <Line yAxisId="left" type="stepAfter" dataKey="mgo" name="Brent Oil ($/bbl)" stroke="var(--color-info)" strokeWidth={3} dot={{ r: 4, fill: 'var(--w-navy-900)', strokeWidth: 2 }} />
```
### 11. `components/BeefDashboard.tsx:50`

```diff
-    <div style={{ padding: '0 1.5rem 3rem', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
+    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--w-slate-50)', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
```
### 12. `components/BeefDashboard.tsx:56`

```diff
-            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'linear-gradient(135deg, #dc2626, #e11d48, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
+            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'linear-gradient(135deg, #dc2626, #e11d48, var(--w-amber-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
```
### 13. `components/BeefDashboard.tsx:60`

```diff
-              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#f8fafc' }}>
+              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--w-slate-50)' }}>
```
### 14. `components/BeefDashboard.tsx:63`

```diff
-              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
+              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--w-slate-400)' }}>
```
### 15. `components/BeefDashboard.tsx:68`

```diff
-          <div style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: '#11182f', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '8px', color: '#94a3b8' }}>
+          <div style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: '#11182f', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '8px', color: 'var(--w-slate-400)' }}>
```
### 16. `components/BeefDashboard.tsx:80`

```diff
-              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{kpi.title}</span>
+              <span style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)', fontWeight: 600 }}>{kpi.title}</span>
```
### 17. `components/BeefDashboard.tsx:83`

```diff
-            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>{kpi.value}</div>
+            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--w-slate-50)', marginTop: '4px' }}>{kpi.value}</div>
```
### 18. `components/BeefDashboard.tsx:119`

```diff
-              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px' }}>{sec.title}</h2>
+              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--w-slate-50)', letterSpacing: '-0.3px' }}>{sec.title}</h2>
```
### 19. `components/BeefDashboard.tsx:120`

```diff
-              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{sec.desc}</p>
+              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--w-slate-400)' }}>{sec.desc}</p>
```
### 20. `components/BeefEmpiricalInsights.tsx:16`

```diff
-  color: '#f8fafc',
+  color: 'var(--w-slate-50)',
```
