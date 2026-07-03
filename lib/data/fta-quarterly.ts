import jukkumiFtaQuarterly from '../../data/jukkumi_fta_quarterly.json';
import mackerelFtaQuarterly from '../../data/mackerel_fta_quarterly.json';
import octopusFtaQuarterly from '../../data/octopus_fta_quarterly.json';
import shrimpFtaQuarterly from '../../data/shrimp_fta_quarterly.json';
import whelkFtaQuarterly from '../../data/whelk_fta_quarterly.json';

const ftaQuarterlyDatasets = {
  jukkumi: jukkumiFtaQuarterly,
  mackerel: mackerelFtaQuarterly,
  octopus: octopusFtaQuarterly,
  shrimp: shrimpFtaQuarterly,
  whelk: whelkFtaQuarterly,
} as const;

export type FtaQuarterlyCommodity = keyof typeof ftaQuarterlyDatasets;

export function getFtaQuarterlyData<TCommodity extends FtaQuarterlyCommodity>(
  commodity: TCommodity,
): (typeof ftaQuarterlyDatasets)[TCommodity] {
  return ftaQuarterlyDatasets[commodity];
}
