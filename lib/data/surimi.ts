import hegemony from '../../data/surimi_hegemony.json';
import koreaDeficit from '../../data/surimi_korea_deficit.json';
import lithuania from '../../data/surimi_lithuania.json';
import multiplier from '../../data/surimi_multiplier.json';

const surimiDatasets = {
  hegemony,
  koreaDeficit,
  lithuania,
  multiplier,
} as const;

export type SurimiDataset = keyof typeof surimiDatasets;

export function getSurimiData<TDataset extends SurimiDataset>(
  dataset: TDataset,
): (typeof surimiDatasets)[TDataset] {
  return surimiDatasets[dataset];
}
