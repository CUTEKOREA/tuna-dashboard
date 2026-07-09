import mangosteenKoreaExport from '../../data/mangosteen_kr_export.json';
import octopusDomesticResource from '../../data/octopus_domestic_resource.json';
import octopusGlobalCatch from '../../data/octopus_global_catch.json';
import reeferWeek27 from '../../data/reefer_week27.json';
import seasiaOemMaCandidates from '../../data/seasia_oem_ma_candidates.json';
import seasiaOemVendors from '../../data/seasia_oem_vendors.json';
import shrimpDashboard from '../../data/shrimp_dashboard.json';

const miscDatasets = {
  mangosteenKoreaExport,
  octopusDomesticResource,
  octopusGlobalCatch,
  reeferWeek27,
  seasiaOemMaCandidates,
  seasiaOemVendors,
  shrimpDashboard,
} as const;

export type MiscDataset = keyof typeof miscDatasets;

export function getMiscData<TDataset extends MiscDataset>(
  dataset: TDataset,
): (typeof miscDatasets)[TDataset] {
  return miscDatasets[dataset];
}
