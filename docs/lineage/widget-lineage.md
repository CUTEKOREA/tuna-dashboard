# 위젯 리니지 — 데이터 파일별 영향 범위

> `python3 scripts/widget_lineage.py`로 재생성. 손으로 고치지 말 것.
> 진입점 app/page.tsx · closure 181파일 · 위젯 108개 · 데이터 파일 70개.
> 데이터 파일 필드를 바꾸기 전에 여기서 영향 위젯을 확인한다 (파손 진단 1단계).

## data/beef_usda_widgets.json
- components/PorkDashboard.tsx
- components/PorkUsdaWidgets.tsx

## data/chicken_usda_widgets.json
- components/PorkDashboard.tsx
- components/PorkUsdaWidgets.tsx

## data/cocoa_usda_widgets.json
- components/PorkDashboard.tsx
- components/PorkUsdaWidgets.tsx

## data/gmts_dashboard.json
- components/gmts/GmtsDashboard.tsx

## data/mangosteen_kr_export.json
- components/LogisticsDashboard.tsx
- components/ReeferMovement.tsx

## data/octopus_domestic_resource.json
- components/LogisticsDashboard.tsx
- components/ReeferMovement.tsx

## data/octopus_global_catch.json
- components/LogisticsDashboard.tsx
- components/ReeferMovement.tsx

## data/pork_usda_widgets.json
- components/PorkDashboard.tsx
- components/PorkUsdaWidgets.tsx

## data/reefer_week27.json
- components/LogisticsDashboard.tsx
- components/ReeferMovement.tsx

## data/reefer_week29.json
- components/LogisticsDashboard.tsx
- components/ReeferMovement.tsx

## data/reefer_week30.json
- components/LogisticsDashboard.tsx
- components/ReeferMovement.tsx

## data/reefer_week31.json
- components/LogisticsDashboard.tsx
- components/ReeferMovement.tsx

## data/reefer_week32.json
- components/LogisticsDashboard.tsx
- components/ReeferMovement.tsx

## data/seasia_oem_ma_candidates.json
- components/LogisticsDashboard.tsx
- components/ReeferMovement.tsx

## data/seasia_oem_vendors.json
- components/LogisticsDashboard.tsx
- components/ReeferMovement.tsx

## data/shrimp_dashboard.json
- components/LogisticsDashboard.tsx
- components/ReeferMovement.tsx

## lib/data/generated/fleet-daily-public.json
- components/FleetCommandCenter.tsx
- components/FleetDailyOperations.tsx

## public/data/bangkok/seasia_processors.json
- components/bangkok/BangkokDashboard.tsx
- components/bangkok/tabs/ProcessorsTab.tsx

## public/data/bangkok_weekly_kpi.json
- components/LogisticsDashboard.tsx
- components/TraderStatus.tsx
- components/bangkok/BangkokDashboard.tsx
- components/bangkok/tabs/CanneryTab.tsx
- components/bangkok/tabs/ClaimsTab.tsx
- components/bangkok/tabs/HomeTab.tsx
- components/bangkok/tabs/LeadingTab.tsx
- components/bangkok/tabs/PriceTab.tsx
- components/bangkok/tabs/ProcessorsTab.tsx
- components/bangkok/tabs/QualityTab.tsx
- components/bangkok/tabs/UnloadTab.tsx

## public/data/bangkok_weekly_payload.json
- components/LogisticsDashboard.tsx
- components/TraderStatus.tsx
- components/bangkok/BangkokDashboard.tsx
- components/bangkok/tabs/CanneryTab.tsx
- components/bangkok/tabs/ClaimsTab.tsx
- components/bangkok/tabs/HomeTab.tsx
- components/bangkok/tabs/LeadingTab.tsx
- components/bangkok/tabs/PriceTab.tsx
- components/bangkok/tabs/ProcessorsTab.tsx
- components/bangkok/tabs/QualityTab.tsx
- components/bangkok/tabs/UnloadTab.tsx

## public/data/companies/albacora_v1.json
- components/market-understanding/AlbacoraCharts.tsx
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/fcf_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/frinsa_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx
- components/market-understanding/FrinsaCharts.tsx

## public/data/companies/itochu_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/thaiunion_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx
- components/market-understanding/ThaiUnionCharts.tsx

## public/data/cosmo/cosmo_2026.json
- components/cosmo/CosmoDashboard.tsx
- components/cosmo/tabs/CashTab.tsx
- components/cosmo/tabs/HistoryTab.tsx
- components/cosmo/tabs/HomeTab.tsx
- components/cosmo/tabs/MarketTab.tsx
- components/cosmo/tabs/ProductionTab.tsx
- components/cosmo/tabs/ProfitTab.tsx
- components/cosmo/tabs/QualityTab.tsx
- components/cosmo/tabs/SalesTab.tsx
- components/cosmo/tabs/SupplyTab.tsx

## public/data/cosmo/cosmo_export.json
- components/cosmo/CosmoDashboard.tsx
- components/cosmo/tabs/CashTab.tsx
- components/cosmo/tabs/HistoryTab.tsx
- components/cosmo/tabs/HomeTab.tsx
- components/cosmo/tabs/MarketTab.tsx
- components/cosmo/tabs/ProductionTab.tsx
- components/cosmo/tabs/ProfitTab.tsx
- components/cosmo/tabs/QualityTab.tsx
- components/cosmo/tabs/SalesTab.tsx
- components/cosmo/tabs/SupplyTab.tsx

## public/data/cosmo/cosmo_history.json
- components/cosmo/CosmoDashboard.tsx
- components/cosmo/tabs/CashTab.tsx
- components/cosmo/tabs/HistoryTab.tsx
- components/cosmo/tabs/HomeTab.tsx
- components/cosmo/tabs/MarketTab.tsx
- components/cosmo/tabs/ProductionTab.tsx
- components/cosmo/tabs/ProfitTab.tsx
- components/cosmo/tabs/QualityTab.tsx
- components/cosmo/tabs/SalesTab.tsx
- components/cosmo/tabs/SupplyTab.tsx

## public/data/cosmo/trade_stats.json
- components/cosmo/CosmoDashboard.tsx
- components/cosmo/tabs/MarketTab.tsx

## public/data/deepsea_fishery_v1.json
- components/market-understanding/SquidCharts.tsx
- components/market-understanding/SquidIndustryDashboard.tsx

## public/data/falkland_squid_vessels_v1.json
- components/market-understanding/FalklandMonthFilter.tsx
- components/market-understanding/SquidCharts.tsx
- components/market-understanding/SquidIndustryDashboard.tsx

## public/data/ffa_vrst_v1.json
- components/FfaGoodStandingPanel.tsx
- components/PurseSeinerDashboard.tsx

## public/data/garlic_usda_widgets.json
- components/PorkDashboard.tsx
- components/PorkUsdaWidgets.tsx

## public/data/kofa_fleet_age_v1.json
- components/market-understanding/CompanyResearchTables.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/kofa_insights_v1.json
- components/market-understanding/CompanyResearchTables.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/kofa_series_v1.json
- components/market-understanding/CompanyResearchTables.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/mackerel_company_research_v1.json
- components/market-understanding/CompanyResearchTables.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/mackerel_country_series_v1.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/mackerel_industry_v1.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/panofi/ghana_tuna_mirror.json
- components/panofi/PanofiDashboard.tsx
- components/panofi/PanofiTabs.tsx

## public/data/panofi/ghana_tuna_trade.json
- components/panofi/PanofiDashboard.tsx
- components/panofi/PanofiTabs.tsx

## public/data/panofi/panofi_actuals.json
- components/panofi/PanofiDashboard.tsx
- components/panofi/PanofiTabs.tsx

## public/data/panofi/panofi_fs_2025.json
- components/panofi/PanofiDashboard.tsx
- components/panofi/PanofiTabs.tsx

## public/data/panofi/panofi_liquidity.json
- components/panofi/PanofiDashboard.tsx
- components/panofi/PanofiTabs.tsx

## public/data/panofi/panofi_profile.json
- components/panofi/PanofiDashboard.tsx
- components/panofi/PanofiTabs.tsx

## public/data/panofi/panofi_weekly.json
- components/panofi/PanofiDashboard.tsx
- components/panofi/PanofiTabs.tsx

## public/data/shrimp_argentina.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/shrimp_company_research_v1.json
- components/market-understanding/CompanyResearchTables.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/shrimp_industry_v1.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/shrimp_real_data_v4.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/squid_company_research_v1.json
- components/market-understanding/CompanyResearchTables.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/squid_fleet_v1.json
- components/market-understanding/SquidCharts.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/SquidWidgetView.tsx

## public/data/squid_industry_v1.json
- components/market-understanding/SquidCharts.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/SquidWidgetView.tsx

## public/data/squid_industry_widgets_v1.json
- components/market-understanding/SquidCharts.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/SquidWidgetView.tsx

## public/data/squid_ocean_fleet_v1.json
- components/market-understanding/SquidCharts.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/SquidWidgetView.tsx

## public/data/squid_trade_v1.json
- components/market-understanding/SquidCharts.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/SquidWidgetView.tsx

## public/data/tuna_carrier_fleet_v1.json
- components/market-understanding/CompanyResearchTables.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/tuna_company_research_v1.json
- components/market-understanding/CompanyResearchTables.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/tuna_daily_briefing.json
- components/MarketDashboard.tsx
- components/NewsFrontPage.tsx

## public/data/tuna_fleet_v1.json
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryChart.tsx
- components/market-understanding/TunaIndustryDashboard.tsx

## public/data/tuna_glossary_v1.json
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryChart.tsx
- components/market-understanding/TunaIndustryDashboard.tsx

## public/data/tuna_industry_prices_v1.json
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryChart.tsx
- components/market-understanding/TunaIndustryDashboard.tsx

## public/data/tuna_industry_v1.json
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryChart.tsx
- components/market-understanding/TunaIndustryDashboard.tsx

## public/data/tuna_industry_widgets_v1.json
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryChart.tsx
- components/market-understanding/TunaIndustryDashboard.tsx

## public/data/tuna_ocean_operators_v1.json
- components/market-understanding/CompanyResearchTables.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/tuna_purse_seiners_v1.json
- components/PurseSeinerDashboard.tsx

## public/data/tuna_trade_v1.json
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryChart.tsx
- components/market-understanding/TunaIndustryDashboard.tsx

## public/data/whelk_company_research_v1.json
- components/market-understanding/CompanyResearchTables.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/SquidIndustryDashboard.tsx
- components/market-understanding/TunaCatchCharts.tsx
- components/market-understanding/TunaIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/whelk_country_series_v1.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/whelk_industry_v1.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx
