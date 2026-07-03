import filletPenetration from '../../data/MackerelFilletPenetration.json';
import norwaySpread from '../../data/MackerelNorwaySpread.json';
import sizePremium from '../../data/MackerelSizePremium.json';
import africanExportRoi from '../../data/mackerel_african_export_roi.json';
import aquaculture from '../../data/mackerel_aquaculture.json';
import blackhole from '../../data/mackerel_blackhole.json';
import chinaStealth from '../../data/mackerel_china_stealth.json';
import climatePredictor from '../../data/mackerel_climate_predictor.json';
import fishmeal from '../../data/mackerel_fishmeal.json';
import koreaSupply from '../../data/mackerel_korea_supply.json';
import macroCycle from '../../data/mackerel_macro.json';
import norwayAlt from '../../data/mackerel_norway_alt.json';
import safetyPremium from '../../data/mackerel_safety_premium.json';
import sankey from '../../data/mackerel_sankey.json';
import spread from '../../data/mackerel_spread.json';
import trio from '../../data/mackerel_trio.json';
import unitPrice from '../../data/mackerel_unit_price.json';
import altSourcingIndex from '../../data/mackerel/mackerel_alt_sourcing_index.json';
import storageTurnover from '../../data/mackerel/mackerel_storage_turnover.json';
import trqMeter from '../../data/mackerel/mackerel_trq_meter.json';

const mackerelDatasets = {
  africanExportRoi,
  altSourcingIndex,
  aquaculture,
  blackhole,
  chinaStealth,
  climatePredictor,
  filletPenetration,
  fishmeal,
  koreaSupply,
  macroCycle,
  norwayAlt,
  norwaySpread,
  safetyPremium,
  sankey,
  sizePremium,
  spread,
  storageTurnover,
  trio,
  trqMeter,
  unitPrice,
} as const;

export type MackerelDataset = keyof typeof mackerelDatasets;

export function getMackerelData<TDataset extends MackerelDataset>(
  dataset: TDataset,
): (typeof mackerelDatasets)[TDataset] {
  return mackerelDatasets[dataset];
}
