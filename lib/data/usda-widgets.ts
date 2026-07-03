import beef from '../../data/beef_usda_widgets.json';
import chicken from '../../data/chicken_usda_widgets.json';
import cocoa from '../../data/cocoa_usda_widgets.json';
import garlic from '../../public/data/garlic_usda_widgets.json';
import pork from '../../data/pork_usda_widgets.json';
import { extractDatasetMeta } from './metadata';

const usdaWidgetDatasets = {
  beef,
  chicken,
  cocoa,
  garlic,
  pork,
} as const;

export type UsdaWidgetDataset = keyof typeof usdaWidgetDatasets;

export function getUsdaWidgetData<TDataset extends UsdaWidgetDataset>(
  dataset: TDataset,
): (typeof usdaWidgetDatasets)[TDataset] {
  return usdaWidgetDatasets[dataset];
}

export function getUsdaWidgetMeta(dataset: UsdaWidgetDataset) {
  return extractDatasetMeta(usdaWidgetDatasets[dataset], { status: 'SYNCED' });
}
