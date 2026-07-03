import insight3Blackhole from '../../data/insight3_blackhole.json';
import insight4Middlemen from '../../data/insight4_middlemen.json';
import insight5JumboLeap from '../../data/insight5_jumbo_leap.json';
import insight6Combo from '../../data/insight6_combo.json';
import insight7SpreadWinners from '../../data/insight7_spread_winners.json';

const crossInsightDatasets = {
  insight3Blackhole,
  insight4Middlemen,
  insight5JumboLeap,
  insight6Combo,
  insight7SpreadWinners,
} as const;

export type CrossInsightDataset = keyof typeof crossInsightDatasets;

export function getCrossInsightData<TDataset extends CrossInsightDataset>(
  dataset: TDataset,
): (typeof crossInsightDatasets)[TDataset] {
  return crossInsightDatasets[dataset];
}
