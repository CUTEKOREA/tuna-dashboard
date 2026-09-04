# 위젯 리니지 — 데이터 파일별 영향 범위

> `python3 scripts/widget_lineage.py`로 재생성. 손으로 고치지 말 것.
> 진입점 app/page.tsx · closure 212파일 · 위젯 110개 · 데이터 파일 99개.
> 데이터 파일 필드를 바꾸기 전에 여기서 영향 위젯을 확인한다 (파손 진단 1단계).

## data/beef_usda_widgets.json
- components/PorkDashboard.tsx
- components/PorkUsdaWidgets.tsx

## data/busan_port_calls.json
- components/BusanPortDashboard.tsx

## data/chicken_usda_widgets.json
- components/PorkDashboard.tsx
- components/PorkUsdaWidgets.tsx

## data/cocoa_usda_widgets.json
- components/PorkDashboard.tsx
- components/PorkUsdaWidgets.tsx

## data/gmts_dashboard.json
- components/gmts/GmtsDashboard.tsx

## data/gmts_monthly.json
- components/gmts/GmtsDashboard.tsx
- components/gmts/GmtsMonthlyReport.tsx

## data/pork_usda_widgets.json
- components/PorkDashboard.tsx
- components/PorkUsdaWidgets.tsx

## data/reefer_week35.json
- components/LogisticsDashboard.tsx
- components/ReeferMovement.tsx

## data/vds_company_burn.json
- components/FleetCommandCenter.tsx
- components/VdsStrategyMatrix.tsx

## lib/data/generated/fleet-daily-public.json
- components/FleetAnalysisPanels.tsx
- components/FleetCharts.tsx
- components/FleetCommandCenter.tsx
- components/FleetDailyOperations.tsx
- components/panofi/PanofiDashboard.tsx
- components/panofi/PanofiTabs.tsx

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

## public/data/companies/albacora_figures_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/albacora_prose_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/albacora_tables_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/albacora_v1.json
- components/market-understanding/AlbacoraCharts.tsx
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/bolton_figures_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/bolton_prose_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/bolton_tables_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/bolton_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/fcf_figures_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/fcf_prose_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/fcf_tables_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/fcf_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/frabelle_figures_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/frabelle_prose_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/frabelle_tables_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/frabelle_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/frinsa_figures_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/frinsa_prose_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/frinsa_tables_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/frinsa_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx
- components/market-understanding/FrinsaCharts.tsx

## public/data/companies/itochu_figures_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/itochu_prose_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/itochu_tables_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/itochu_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/jais_figures_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/jais_prose_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/jais_tables_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/jais_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/jealsa_figures_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/jealsa_prose_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/jealsa_tables_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/jealsa_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/thaiunion_figures_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/thaiunion_prose_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/thaiunion_skus_v1.json
- components/market-understanding/CompanyAnatomyDashboard.tsx

## public/data/companies/thaiunion_tables_v1.json
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
- components/market-understanding/PollockIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/TunaAnatomyDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/mackerel_industry_v1.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/PollockIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/TunaAnatomyDashboard.tsx
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

## public/data/pollock_industry_v1.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/PollockIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/TunaAnatomyDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/shrimp_argentina.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/PollockIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/TunaAnatomyDashboard.tsx
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
- components/market-understanding/PollockIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/TunaAnatomyDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/shrimp_real_data_v4.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/PollockIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/TunaAnatomyDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/singapore_mgo.json
- components/bangkok/BangkokDashboard.tsx
- components/bangkok/tabs/HomeTab.tsx

## public/data/skj_seasonal_outlook.json
- components/bangkok/BangkokDashboard.tsx
- components/bangkok/tabs/HomeTab.tsx

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

## public/data/tuna_anatomy_v1.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/PollockIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/TunaAnatomyDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

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
- components/market-understanding/PollockIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/TunaAnatomyDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx

## public/data/whelk_industry_v1.json
- components/market-understanding/CommodityCharts.tsx
- components/market-understanding/MackerelIndustryDashboard.tsx
- components/market-understanding/PollockIndustryDashboard.tsx
- components/market-understanding/ShrimpIndustryDashboard.tsx
- components/market-understanding/TunaAnatomyDashboard.tsx
- components/market-understanding/WhelkIndustryDashboard.tsx
