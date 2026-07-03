import thaiTradeSummary from '../../data/thai_tuna_trade_summary.json';
import aquaHegemony from '../../data/tuna_aqua_hegemony.json';
import aquaValue from '../../data/tuna_aqua_value.json';
import crossroads from '../../data/tuna_crossroad.json';
import exportShare from '../../data/tuna_export_share.json';
import importBlackhole from '../../data/tuna_import_blackhole.json';
import koreaOrigins from '../../data/tuna_korea_import_origins.json';
import koreaPosition from '../../data/tuna_korea_position.json';
import librarian from '../../data/tuna_librarian_v1.json';
import petCareMargin from '../../data/tuna_petcare_margin.json';
import precisionFishing from '../../data/tuna_precision_fishing.json';
import priceDecoupling from '../../data/tuna_price_decoupling.json';
import thaiEmpire from '../../data/tuna_thai_empire.json';
import traditionalDecline from '../../data/tuna_traditional_decline.json';
import usdaKoreaSeafood from '../../data/tuna_usda_korea_seafood.json';

const tunaDatasets = {
  aquaHegemony,
  aquaValue,
  crossroads,
  exportShare,
  importBlackhole,
  koreaOrigins,
  koreaPosition,
  librarian,
  petCareMargin,
  precisionFishing,
  priceDecoupling,
  thaiEmpire,
  thaiTradeSummary,
  traditionalDecline,
  usdaKoreaSeafood,
} as const;

export type TunaDataset = keyof typeof tunaDatasets;

export function getTunaData<TDataset extends TunaDataset>(
  dataset: TDataset,
): (typeof tunaDatasets)[TDataset] {
  return tunaDatasets[dataset];
}
