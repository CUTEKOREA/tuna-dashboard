import doubleMateriality from '../../data/SalmonInsightDoubleMateriality.json';
import processing from '../../data/SalmonInsightProcessingData.json';
import smolt from '../../data/SalmonInsightSmolt.json';
import automationYield from '../../data/salmonInsightAutomationYield.json';
import climate from '../../data/salmonInsightClimate.json';
import feed from '../../data/salmonInsightFeed.json';
import feedBio from '../../data/salmonInsightFeedBio.json';
import marginSqueeze from '../../data/salmonInsightMarginSqueeze.json';
import smartColdChain from '../../data/salmonInsightSmartColdChain.json';
import esgTracker from '../../data/salmon_esg_tracker.json';
import globalSupplyPrice from '../../data/salmon_global_supply_price.json';
import tradeDown from '../../data/salmon_insight_trade_down.json';
import logisticsResilience from '../../data/salmon_logistics_resilience.json';
import ntbRadar from '../../data/salmon_ntb_radar.json';
import policyImpact from '../../data/salmon_policy_impact.json';

const salmonDatasets = {
  automationYield,
  climate,
  doubleMateriality,
  esgTracker,
  feed,
  feedBio,
  globalSupplyPrice,
  logisticsResilience,
  marginSqueeze,
  ntbRadar,
  policyImpact,
  processing,
  smartColdChain,
  smolt,
  tradeDown,
} as const;

export type SalmonDataset = keyof typeof salmonDatasets;

export function getSalmonData<TDataset extends SalmonDataset>(
  dataset: TDataset,
): (typeof salmonDatasets)[TDataset] {
  return salmonDatasets[dataset];
}
