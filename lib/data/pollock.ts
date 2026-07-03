import chinaDetour from '../../data/pollock_china_detour.json';
import koreaCrisis from '../../data/pollock_korea_crisis.json';
import premiumSpread from '../../data/pollock_premium_spread.json';
import valueDecoupling from '../../data/pollock_value_decoupling.json';

const pollockDatasets = {
  chinaDetour,
  koreaCrisis,
  premiumSpread,
  valueDecoupling,
} as const;

export type PollockDataset = keyof typeof pollockDatasets;

export function getPollockData<TDataset extends PollockDataset>(
  dataset: TDataset,
): (typeof pollockDatasets)[TDataset] {
  return pollockDatasets[dataset];
}
