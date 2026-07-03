import collapseCountdown from '../../data/fishstatj_collapse.json';
import globalHegemony from '../../data/fishstatj_hegemony.json';
import proteinWar from '../../data/fishstatj_protein.json';
import arbitrageRoutes from '../../data/squid_arbitrage_routes.json';
import areaMap from '../../data/squid_area_map.json';
import b2bMargin from '../../data/squid_b2b_margin.json';
import climateRadar from '../../data/squid_climate_radar.json';
import complianceRisk from '../../data/squid_compliance_risk.json';
import cpueProfit from '../../data/squid_cpue_profit.json';
import demandDestruction from '../../data/squid_demand_destruction.json';
import fuelBep from '../../data/squid_fuel_bep.json';
import fxHedging from '../../data/squid_fx_hedging.json';
import importPortfolio from '../../data/squid_import_portfolio.json';
import inventoryRelease from '../../data/squid_inventory_release.json';
import koreaSupply from '../../data/squid_korea_supply.json';
import logisticsCost from '../../data/squid_logistics_cost.json';
import originDiversification from '../../data/squid_origin_diversification.json';
import policyArbitrage from '../../data/squid_policy_arbitrage.json';
import quotaExhaustion from '../../data/squid_quota_exhaustion.json';
import shrinkflation from '../../data/squid_shrinkflation.json';
import sizePremium from '../../data/squid_size_premium.json';
import substitution from '../../data/squid_substitution.json';
import tradeMatrix from '../../data/squid_trade_matrix.json';
import tunaBenchmark from '../../data/squid_tuna_benchmark.json';
import unitPrice from '../../data/squid_unit_price.json';
import valueChainMargin from '../../data/squid_valuechain_margin.json';
import winnersLosers from '../../data/squid_winners_losers.json';

const squidDatasets = {
  arbitrageRoutes,
  areaMap,
  b2bMargin,
  climateRadar,
  collapseCountdown,
  complianceRisk,
  cpueProfit,
  demandDestruction,
  fuelBep,
  fxHedging,
  globalHegemony,
  importPortfolio,
  inventoryRelease,
  koreaSupply,
  logisticsCost,
  originDiversification,
  policyArbitrage,
  proteinWar,
  quotaExhaustion,
  shrinkflation,
  sizePremium,
  substitution,
  tradeMatrix,
  tunaBenchmark,
  unitPrice,
  valueChainMargin,
  winnersLosers,
} as const;

export type SquidDataset = keyof typeof squidDatasets;

export function getSquidData<TDataset extends SquidDataset>(
  dataset: TDataset,
): (typeof squidDatasets)[TDataset] {
  return squidDatasets[dataset];
}
