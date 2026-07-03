import beef from '../../data/beef_usda_widgets.json';
import chicken from '../../data/chicken_usda_widgets.json';
import cocoa from '../../data/cocoa_usda_widgets.json';
import pork from '../../data/pork_usda_widgets.json';

const usdaWidgetDatasets = {
  beef,
  chicken,
  cocoa,
  pork,
} as const;

export type UsdaWidgetDataset = keyof typeof usdaWidgetDatasets;

export function getUsdaWidgetData<TDataset extends UsdaWidgetDataset>(
  dataset: TDataset,
): (typeof usdaWidgetDatasets)[TDataset] {
  return usdaWidgetDatasets[dataset];
}
