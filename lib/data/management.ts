import competitor from '../../data/competitor-data.json';
import foodtech from '../../data/foodtech-research-2026.json';
import listedCompanies from '../../data/listed-companies-data.json';
import performance from '../../data/management-performance-2026-03.json';

const managementDatasets = {
  competitor,
  foodtech,
  listedCompanies,
  performance,
} as const;

export type ManagementDataset = keyof typeof managementDatasets;

export function getManagementData<TDataset extends ManagementDataset>(
  dataset: TDataset,
): (typeof managementDatasets)[TDataset] {
  return managementDatasets[dataset];
}
