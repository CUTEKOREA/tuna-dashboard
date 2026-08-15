# L-07 위젯 색상 치환 DRY-RUN

> 실행일: 2026-08-15 KST
> 기준 커밋: `055ef11212214f26aa528f201fd5f803730ac313` (`origin/main`과 동일)
> 명령: `python3 scripts/fix_widget_colors.py --dry-run`
> 범위: `components/**/*.tsx` (`components/v2/`, `components/cosmo/`, 테스트 파일 제외)
> 판별: 기존 스타일 위치 + 검증된 DOM 삽입 HTML 문자열 4파일만 치환; 의미값·주석·ECharts 캔버스 옵션은 보존


- 총 치환 수: 793
- 16진수 치환 수: 10
- rgba 치환 수: 783
- 변경 파일 수: 170

## 파일별 치환 예정 건수

| 파일 | 건수 |
| --- | ---: |
| `components/BeefDashboard.tsx` | 2 |
| `components/BeefUsdaWidgets.tsx` | 2 |
| `components/CanneryStatusCharts.tsx` | 8 |
| `components/CarrierUnloadingStatus.tsx` | 5 |
| `components/CarrotDashboard.tsx` | 5 |
| `components/CashewStrategy.tsx` | 5 |
| `components/CassavaDashboard.tsx` | 3 |
| `components/ChickenCorporateWidget.tsx` | 4 |
| `components/ChickenDashboard.tsx` | 6 |
| `components/ChickenEmpiricalInsights.tsx` | 2 |
| `components/ChickenPartsWidget.tsx` | 7 |
| `components/CocoaDashboard.tsx` | 3 |
| `components/ColdStorageDashboard.tsx` | 5 |
| `components/ColdStorageMap.tsx` | 2 |
| `components/CommandPalette.tsx` | 3 |
| `components/CompanyVesselStatus.tsx` | 1 |
| `components/CrossCommodityIntelligenceDashboard.tsx` | 6 |
| `components/ErrorBoundary.tsx` | 2 |
| `components/EuroTunaWidgets.tsx` | 12 |
| `components/ExchangeSimulator.tsx` | 5 |
| `components/FalklandSquidDashboard.tsx` | 9 |
| `components/FfaStockHealthGauge.tsx` | 1 |
| `components/FieldTools.tsx` | 48 |
| `components/FishStatBlackholeBar.tsx` | 1 |
| `components/FishStatClimateDeathCross.tsx` | 1 |
| `components/FishStatDumpingRoute.tsx` | 1 |
| `components/FishStatFilletCurve.tsx` | 1 |
| `components/FishStatHegemonySankey.tsx` | 1 |
| `components/FishStatProteinBubble.tsx` | 1 |
| `components/FishStatReplacementRadar.tsx` | 1 |
| `components/FishStatTACIllusion.tsx` | 1 |
| `components/FishingDaysStatus.tsx` | 2 |
| `components/FlatfishDashboard.tsx` | 3 |
| `components/FleetHeroKPI.tsx` | 1 |
| `components/FleetOperationStatus.tsx` | 2 |
| `components/FleetPerformance.tsx` | 6 |
| `components/FleetProduction2025.tsx` | 11 |
| `components/FleetRosterGrid.tsx` | 2 |
| `components/FleetStrategyMatrix.tsx` | 36 |
| `components/GalchiDashboard.tsx` | 3 |
| `components/GarlicDashboard.tsx` | 2 |
| `components/GensanVesselStatus.tsx` | 2 |
| `components/Gtc2026Insights.tsx` | 1 |
| `components/HarborBanner.tsx` | 1 |
| `components/HermesAgent.tsx` | 5 |
| `components/Insight6ClimateCombo.tsx` | 2 |
| `components/JukkumiDashboard.tsx` | 3 |
| `components/JukkumiFTAQuarterly.tsx` | 2 |
| `components/KimDashboard.tsx` | 1 |
| `components/KoreaConsignmentDashboard.tsx` | 14 |
| `components/MackerelDashboard.tsx` | 3 |
| `components/MangosteenDashboard.tsx` | 6 |
| `components/MarketDashboard.tsx` | 2 |
| `components/MscIntelligenceWidgets.tsx` | 5 |
| `components/MscStrategyDashboard.tsx` | 3 |
| `components/OctopusDashboard.tsx` | 3 |
| `components/OctopusDomesticCliff.tsx` | 3 |
| `components/OctopusFTAQuarterly.tsx` | 2 |
| `components/PacificEezStrategicWidget.tsx` | 2 |
| `components/PacificVesselMap.tsx` | 25 |
| `components/PetFoodDashboard.tsx` | 2 |
| `components/PetFoodMap.tsx` | 1 |
| `components/PnaAccessFeeWidgets.tsx` | 2 |
| `components/PollockDashboard.tsx` | 5 |
| `components/PollockLandedCost.tsx` | 5 |
| `components/PollockPolicyRiskRadar.tsx` | 3 |
| `components/PollockPriceForecast.tsx` | 4 |
| `components/PollockSupplyResilience.tsx` | 4 |
| `components/PollockTradeWidgets.tsx` | 6 |
| `components/PollockValueAddWidgets.tsx` | 2 |
| `components/PriceLagSimulator.tsx` | 1 |
| `components/PurseSeinerDashboard.tsx` | 6 |
| `components/ReeferFreightChart.tsx` | 2 |
| `components/ReeferMovement.tsx` | 4 |
| `components/ResearchLabDashboard.tsx` | 1 |
| `components/RetailPOS.tsx` | 2 |
| `components/SEAsiaOEMDashboard.tsx` | 48 |
| `components/SalmonDashboard.tsx` | 3 |
| `components/SalmonESGTracker.tsx` | 2 |
| `components/SalmonForecastSimulator.tsx` | 7 |
| `components/SalmonInsightLogisticsResilience.tsx` | 1 |
| `components/SalmonInsightTradeDown.tsx` | 2 |
| `components/SalmonLiveTicker.tsx` | 2 |
| `components/SalmonPolicyImpact.tsx` | 2 |
| `components/SashimiSteakDashboard.tsx` | 3 |
| `components/SeafoodStockWidget.tsx` | 2 |
| `components/ShrimpDashboard.tsx` | 3 |
| `components/ShrimpFTAQuarterly.tsx` | 2 |
| `components/SongkhlaCanneryStatusCharts.tsx` | 2 |
| `components/SupplierDiscoveryDashboard.tsx` | 12 |
| `components/SupplierTrademoPhase2.tsx` | 1 |
| `components/SurimiInsightWidgets.tsx` | 3 |
| `components/ThaiTunaTradeStats.tsx` | 3 |
| `components/ToastProvider.tsx` | 4 |
| `components/TradeRouteSankey.tsx` | 2 |
| `components/TraderImportChart.tsx` | 4 |
| `components/TraderStatus.tsx` | 6 |
| `components/TunaAquaValue.tsx` | 1 |
| `components/TunaComplianceRadar.tsx` | 2 |
| `components/TunaCrossroads.tsx` | 1 |
| `components/TunaDashboard.tsx` | 7 |
| `components/TunaEmergingMarkets.tsx` | 2 |
| `components/TunaExecutiveInsights.tsx` | 1 |
| `components/TunaInsiderSignalWidget.tsx` | 2 |
| `components/TunaInsightWidgets.tsx` | 1 |
| `components/TunaInsightsDashboard.tsx` | 6 |
| `components/TunaIntelInsightsB4.tsx` | 2 |
| `components/TunaLiveTicker.tsx` | 1 |
| `components/TunaMofFisheryWidget.tsx` | 1 |
| `components/TunaOperationalIntelWidgets.tsx` | 1 |
| `components/TunaPolicyRiskRadar.tsx` | 1 |
| `components/TunaPriceDecoupling.tsx` | 2 |
| `components/TunaProcessedWidgets.tsx` | 5 |
| `components/TunaRanching.tsx` | 42 |
| `components/TunaReeferLogisticsWidgets.tsx` | 2 |
| `components/TunaRestaurantMap.tsx` | 2 |
| `components/TunaUpcyclingWidgets.tsx` | 1 |
| `components/TunaUsGatewayWidget.tsx` | 1 |
| `components/TunaUsdaKoreaSeafood.tsx` | 2 |
| `components/UnloadingHistory.tsx` | 2 |
| `components/UnloadingHistoryBoundary.tsx` | 2 |
| `components/UnloadingStatus.tsx` | 16 |
| `components/UsedCarCharts.tsx` | 1 |
| `components/UsedCarExport.tsx` | 21 |
| `components/WestAfricaMap.tsx` | 3 |
| `components/WhelkDashboard.tsx` | 5 |
| `components/WhelkFTAQuarterly.tsx` | 3 |
| `components/msc-strategy/MscCertificationPipeline.tsx` | 6 |
| `components/msc-strategy/MscDemographicAcceptance.tsx` | 5 |
| `components/msc-strategy/MscEuropeRetailPrices.tsx` | 1 |
| `components/msc-strategy/MscFaoAreaPenetration.tsx` | 3 |
| `components/msc-strategy/MscGearTypeTrends.tsx` | 3 |
| `components/msc-strategy/MscGlobalEngagementKpi.tsx` | 4 |
| `components/msc-strategy/MscHarvestStrategyTimeline.tsx` | 2 |
| `components/msc-strategy/MscImprovementsDelivered.tsx` | 9 |
| `components/msc-strategy/MscKoreaPositioning.tsx` | 3 |
| `components/msc-strategy/MscMarketCategorySize.tsx` | 9 |
| `components/msc-strategy/MscOpenConditions.tsx` | 7 |
| `components/msc-strategy/MscPbNbMatrix.tsx` | 2 |
| `components/msc-strategy/MscProductCountByCountry.tsx` | 5 |
| `components/msc-strategy/MscProductVolumeGrowth.tsx` | 2 |
| `components/msc-strategy/MscRetailChannelPenetration.tsx` | 1 |
| `components/msc-strategy/MscSpeciesCoverageHeatmap.tsx` | 3 |
| `components/msc-strategy/MscStockScorecard.tsx` | 9 |
| `components/msc-strategy/MscSuspensionHistory.tsx` | 2 |
| `components/msc-strategy/MscUkShopperTrends.tsx` | 6 |
| `components/msc-strategy/MscVsFipComparison.tsx` | 1 |
| `components/sashimi-strategy/SasBluefinRanchingEconomics.tsx` | 2 |
| `components/sashimi-strategy/SasEuFreshVsCanned.tsx` | 11 |
| `components/sashimi-strategy/SasEuImportSegmentation.tsx` | 3 |
| `components/sashimi-strategy/SasExportChecklist.tsx` | 2 |
| `components/sashimi-strategy/SasGlTradeFlows.tsx` | 4 |
| `components/sashimi-strategy/SasGlobalOutlook2030.tsx` | 4 |
| `components/sashimi-strategy/SasJapanDemandDecline.tsx` | 2 |
| `components/sashimi-strategy/SasKoreaProductionStructure.tsx` | 2 |
| `components/sashimi-strategy/SasKrSuperTuna.tsx` | 2 |
| `components/sashimi-strategy/SasMarketKPIs.tsx` | 4 |
| `components/sashimi-strategy/SasSpeciesPriceTier.tsx` | 2 |
| `components/sashimi-strategy/SasThailandHub.tsx` | 2 |
| `components/sashimi-strategy/SasToyosuAuction.tsx` | 2 |
| `components/sashimi-strategy/SasTriadDynamics.tsx` | 8 |
| `components/sashimi-strategy/SasUsImportBarriers.tsx` | 2 |
| `components/sashimi-strategy/SasUsSupplierOrigin.tsx` | 7 |
| `components/sashimi-strategy/SasUsSushiPokeMarket.tsx` | 3 |
| `components/squid/GenericWidget.tsx` | 3 |
| `components/squid/SectionA.tsx` | 12 |
| `components/squid/SectionB.tsx` | 8 |
| `components/squid/SectionC.tsx` | 11 |
| `components/squid/SectionE.tsx` | 2 |
| `components/squid/SquidCard.tsx` | 2 |

## 스킵 사유

- rgba 비스타일/의미값: 173
- 비스타일/의미값: 1429
- 주석: 3
- 제외 디렉터리(v2/cosmo): 2
- 테스트 파일: 0

## 샘플 diff 20개

### 1. `components/BeefDashboard.tsx:94`

```diff
-          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요</span>
+          <span style={{ fontSize: '0.7rem', color: 'rgba(var(--w-slate-400-rgb), 0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요</span>
```
### 2. `components/BeefDashboard.tsx:105`

```diff
-                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(140,170,255,0.12)', color: isActive ? '#0a0f1f' : 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 800, boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none' }}>{idx + 1}</div>
+                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(140,170,255,0.12)', color: isActive ? '#0a0f1f' : 'rgba(var(--w-slate-400-rgb), 0.6)', fontSize: '0.75rem', fontWeight: 800, boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none' }}>{idx + 1}</div>
```
### 3. `components/BeefUsdaWidgets.tsx:62`

```diff
-      <YAxis yAxisId="right" orientation="right" stroke="rgba(245,158,11,0.5)" tick={{ fill: 'rgba(245,158,11,0.7)', fontSize: 10 }} tickFormatter={(v: number) => COMMA(v)} />
+      <YAxis yAxisId="right" orientation="right" stroke="rgba(var(--w-amber-500-rgb), 0.5)" tick={{ fill: 'rgba(var(--w-amber-500-rgb), 0.7)', fontSize: 10 }} tickFormatter={(v: number) => COMMA(v)} />
```
### 4. `components/CanneryStatusCharts.tsx:45`

```diff
-          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: '20px' }}>
+          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(var(--w-slate-400-rgb), 0.1)', border: '1px solid rgba(var(--w-slate-400-rgb), 0.25)', borderRadius: '20px' }}>
```
### 5. `components/CanneryStatusCharts.tsx:53`

```diff
-        <div style={{ background: 'var(--panel-bg)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
+        <div style={{ background: 'var(--panel-bg)', border: '1px solid rgba(var(--w-violet-500-rgb), 0.3)', borderRadius: '8px', padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
```
### 6. `components/CanneryStatusCharts.tsx:54`

```diff
-          <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: 'var(--w-violet-500)' }}>
+          <div style={{ padding: '12px', background: 'rgba(var(--w-violet-500-rgb), 0.1)', borderRadius: '8px', color: 'var(--w-violet-500)' }}>
```
### 7. `components/CanneryStatusCharts.tsx:60`

```diff
-              <span style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-muted)', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.25)' }}>전구간 순마진(추정): {liveData.marginIndex.netMargin}</span>
+              <span style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(var(--w-slate-400-rgb), 0.1)', color: 'var(--text-muted)', borderRadius: '12px', border: '1px solid rgba(var(--w-slate-400-rgb), 0.25)' }}>전구간 순마진(추정): {liveData.marginIndex.netMargin}</span>
```
### 8. `components/CanneryStatusCharts.tsx:115`

```diff
-                contentStyle={{ background: 'rgba(20, 28, 52, 0.88)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', color: 'var(--text-main)', boxShadow: '0 8px 30px rgba(0,0,0,0.45)' }}
+                contentStyle={{ background: 'rgba(20, 28, 52, 0.88)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(var(--w-emerald-500-rgb), 0.25)', borderRadius: '10px', color: 'var(--text-main)', boxShadow: '0 8px 30px rgba(0,0,0,0.45)' }}
```
### 9. `components/CanneryStatusCharts.tsx:175`

```diff
-                contentStyle={{ background: 'rgba(20, 28, 52, 0.88)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', color: 'var(--text-main)', boxShadow: '0 8px 30px rgba(0,0,0,0.45)' }}
+                contentStyle={{ background: 'rgba(20, 28, 52, 0.88)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(var(--w-emerald-500-rgb), 0.25)', borderRadius: '10px', color: 'var(--text-main)', boxShadow: '0 8px 30px rgba(0,0,0,0.45)' }}
```
### 10. `components/CarrierUnloadingStatus.tsx:41`

```diff
-            <tr style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))', borderBottom: '1px solid rgba(245,158,11,0.25)' }}>
+            <tr style={{ background: 'linear-gradient(90deg, rgba(var(--w-amber-500-rgb), 0.12), rgba(var(--w-amber-500-rgb), 0.04))', borderBottom: '1px solid rgba(var(--w-amber-500-rgb), 0.25)' }}>
```
### 11. `components/CarrierUnloadingStatus.tsx:57`

```diff
-            <tr style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
+            <tr style={{ background: 'rgba(var(--w-emerald-500-rgb), 0.1)' }}>
```
### 12. `components/CarrierUnloadingStatus.tsx:79`

```diff
-                padding: '12px', background: 'rgba(56,189,248,0.05)', borderRadius: '8px',
+                padding: '12px', background: 'rgba(var(--w-sky-400-rgb), 0.05)', borderRadius: '8px',
```
### 13. `components/CarrotDashboard.tsx:287`

```diff
-                <span style={{ fontSize:'0.65rem', background:'rgba(239,68,68,0.2)', color:'var(--w-amber-500)', padding:'2px 6px', borderRadius:'4px', display:'flex', alignItems:'center', gap:'3px' }}>
+                <span style={{ fontSize:'0.65rem', background:'rgba(var(--w-red-500-rgb), 0.2)', color:'var(--w-amber-500)', padding:'2px 6px', borderRadius:'4px', display:'flex', alignItems:'center', gap:'3px' }}>
```
### 14. `components/CarrotDashboard.tsx:315`

```diff
-      <div style={{ marginBottom:'2rem', background:'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', border:'1px solid rgba(249, 115, 22, 0.2)', borderRadius:'8px', padding:'1.5rem', boxShadow:'rgba(0,0,0,0.3) 0px 8px 8px' }}>
+      <div style={{ marginBottom:'2rem', background:'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(var(--w-emerald-500-rgb), 0.05) 100%)', border:'1px solid rgba(249, 115, 22, 0.2)', borderRadius:'8px', padding:'1.5rem', boxShadow:'rgba(0,0,0,0.3) 0px 8px 8px' }}>
```
### 15. `components/CarrotDashboard.tsx:425`

```diff
-              style={{ width:'100%', cursor:'pointer', accentColor:'#f59e0b' }}
+              style={{ width:'100%', cursor:'pointer', accentColor:'var(--w-amber-500)' }}
```
### 16. `components/CarrotDashboard.tsx:435`

```diff
-          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요</span>
+          <span style={{ fontSize: '0.7rem', color: 'rgba(var(--w-slate-400-rgb), 0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요</span>
```
### 17. `components/CarrotDashboard.tsx:446`

```diff
-                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(140,170,255,0.12)', color: isActive ? '#0a0f1f' : 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 800, boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none' }}>{idx + 1}</div>
+                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(140,170,255,0.12)', color: isActive ? '#0a0f1f' : 'rgba(var(--w-slate-400-rgb), 0.6)', fontSize: '0.75rem', fontWeight: 800, boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none' }}>{idx + 1}</div>
```
### 18. `components/CashewStrategy.tsx:303`

```diff
-        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
+        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(var(--w-emerald-500-rgb), 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
```
### 19. `components/CashewStrategy.tsx:397`

```diff
-          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요</span>
+          <span style={{ fontSize: '0.7rem', color: 'rgba(var(--w-slate-400-rgb), 0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요</span>
```
### 20. `components/CashewStrategy.tsx:408`

```diff
-                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(140,170,255,0.12)', color: isActive ? '#0a0f1f' : 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 800, boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none' }}>{idx + 1}</div>
+                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(140,170,255,0.12)', color: isActive ? '#0a0f1f' : 'rgba(var(--w-slate-400-rgb), 0.6)', fontSize: '0.75rem', fontWeight: 800, boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none' }}>{idx + 1}</div>
```
