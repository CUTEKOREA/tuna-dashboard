import rawDashboard from '../../data/gmts_dashboard.json';

export type GmtsReportStatus = 'STATIC';

export type GmtsPriceQualifier =
  | 'quoted'
  | 'no-price'
  | 'no-offer'
  | 'no-transaction'
  | 'around'
  | 'level'
  | 'under'
  | 'old-contract';

export type GmtsNonQuotedPriceQualifier = Exclude<GmtsPriceQualifier, 'quoted'>;
export type GmtsPriceKey = 'nonGspNonMsc' | 'gspNonMsc';
export type GmtsSourceLane = 'unloading' | 'completedDischarging' | 'incoming';
export type GmtsAnnualYear = 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026;

export type GmtsMonthValues = [
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
];

export interface GmtsMetadata {
  status: GmtsReportStatus;
  reportCount: number;
  pageCount: number;
  firstReportDate: string;
  coverageStart: string;
  coverageEnd: string;
  latestReportDate: string;
}

export interface GmtsPriceObservation {
  amount: number | null;
  currencySymbol: '$';
  basisUnit: null;
  qualifier: GmtsPriceQualifier;
  rawText: string;
}

export interface GmtsPriceSnapshot {
  nonGspNonMsc: GmtsPriceObservation;
  gspNonMsc: GmtsPriceObservation;
}

export interface GmtsPortLaneSummary {
  declaredCount: number | null;
  recordCount: number;
}

export interface GmtsPortSummary {
  active: GmtsPortLaneSummary;
  completed: GmtsPortLaneSummary;
  incoming: GmtsPortLaneSummary;
}

export interface GmtsCanneryTotal {
  maxDailyProductionMt: number;
  currentDailyProductionMt: number;
  productionUtilizationPct: number;
  storageCapacityMt: number;
  currentStockMt: number;
  storageUtilizationPct: number;
  reportedProcessingDays: number;
}

export interface GmtsVolume2026 {
  year: 2026;
  months: GmtsMonthValues;
  total: number | null;
}

export interface GmtsWeeklySnapshot {
  reportDate: string;
  operationalAsOf: null;
  port: GmtsPortSummary;
  canneryTotal: GmtsCanneryTotal;
  prices: GmtsPriceSnapshot;
  volume2026: GmtsVolume2026;
}

export interface GmtsDateObservation {
  value: string | null;
  rawText: string | null;
}

export interface GmtsVesselDates {
  arrived: GmtsDateObservation;
  unloadingStarted: GmtsDateObservation;
  etd: GmtsDateObservation;
  etaStart: GmtsDateObservation;
  etaEnd: GmtsDateObservation;
}

export interface GmtsVesselRawFields {
  cargo?: string;
  discharged?: string;
  short?: string;
  gensanAllocation?: string;
}

export interface GmtsVesselRecord {
  sourceIdentifier: string;
  displayName: string;
  traders: string[];
  cargo: number | null;
  discharged: number | null;
  short: number | null;
  gensanAllocation: number | null;
  etaOrUnloadingDate: string | null;
  consignees: string[];
  dates: GmtsVesselDates;
  rawFields: GmtsVesselRawFields;
  rawText: string;
}

export interface GmtsDetailedPortLane extends GmtsPortLaneSummary {
  records: GmtsVesselRecord[];
  rawText: string;
}

export interface GmtsDetailedPortSummary {
  active: GmtsDetailedPortLane;
  completed: GmtsDetailedPortLane;
  incoming: GmtsDetailedPortLane;
}

export type GmtsCanneryName =
  | 'Gentuna/Century'
  | 'Philbest'
  | 'Alliance'
  | 'Celebes'
  | 'Foodsphere'
  | 'Sea Trade'
  | 'R&R'
  | 'Total';

export interface GmtsCanneryRawValues {
  maximumProductionMt: string;
  currentProductionMt: string;
  productionUtilizationPercent: string;
  maximumCapacityMt: string;
  currentStockMt: string;
  storageUtilizationPercent: string;
  processingDays: string;
}

export interface GmtsCanneryRecord {
  name: GmtsCanneryName;
  rawText: string;
  rawValues: GmtsCanneryRawValues;
  maximumProductionMt: number;
  currentProductionMt: number;
  productionUtilizationPercent: number;
  maximumCapacityMt: number;
  currentStockMt: number;
  storageUtilizationPercent: number;
  processingDays: number;
}

export interface GmtsSource {
  reportDate: string;
  fileName: string;
  sha256: string;
  pages: 1 | 2;
}

export interface GmtsLatestSnapshot {
  reportDate: string;
  operationalAsOf: null;
  port: GmtsDetailedPortSummary;
  canneries: GmtsCanneryRecord[];
  canneryTotal: GmtsCanneryTotal;
  prices: GmtsPriceSnapshot;
  source: GmtsSource;
}

export interface GmtsAnnualVolume<Year extends GmtsAnnualYear = GmtsAnnualYear> {
  year: Year;
  months: GmtsMonthValues;
  total: number | null;
  rawText: string;
}

export type GmtsAnnualVolumeHistory = [
  GmtsAnnualVolume<2019>,
  GmtsAnnualVolume<2020>,
  GmtsAnnualVolume<2021>,
  GmtsAnnualVolume<2022>,
  GmtsAnnualVolume<2023>,
  GmtsAnnualVolume<2024>,
  GmtsAnnualVolume<2025>,
  GmtsAnnualVolume<2026>,
];

export interface GmtsVolumeSnapshot {
  reportDate: string;
  volume2026: {
    months: GmtsMonthValues;
    total: number | null;
  };
}

export interface GmtsVolumeRevision {
  month: string;
  previousReportDate: string;
  previousValue: number | null;
  reportDate: string;
  value: number | null;
}

export interface GmtsVolumeHistory {
  excludesFreshTuna: true;
  unit: null;
  annual: GmtsAnnualVolumeHistory;
  snapshots: GmtsVolumeSnapshot[];
  revisions: GmtsVolumeRevision[];
}

export interface GmtsBlankDeclaredCountFlag {
  code: 'blank_declared_count';
  reportDate: string;
  lane: GmtsSourceLane;
}

export interface GmtsPriceQualifierFlag {
  code: 'price_qualifier';
  reportDate: string;
  price: GmtsPriceKey;
  qualifier: GmtsNonQuotedPriceQualifier;
}

export interface GmtsVolumeRevisionFlag extends GmtsVolumeRevision {
  code: 'volume_revision';
}

export interface GmtsCapacityExceededFlag {
  code: 'capacity_exceeded';
  reportDate: string;
  name: GmtsCanneryName;
  storageUtilizationPercent: number;
}

export interface GmtsPriceBasisUnitMissingFlag {
  code: 'price_basis_unit_missing';
  field: 'price_basis_unit_missing';
}

export interface GmtsVolumeUnitMissingFlag {
  code: 'volume_unit_missing';
  field: 'volume_unit_missing';
}

export type GmtsQualityFlag =
  | GmtsBlankDeclaredCountFlag
  | GmtsPriceQualifierFlag
  | GmtsVolumeRevisionFlag
  | GmtsCapacityExceededFlag
  | GmtsPriceBasisUnitMissingFlag
  | GmtsVolumeUnitMissingFlag;

export interface GmtsDashboardData {
  schemaVersion: 1;
  metadata: GmtsMetadata;
  weekly: GmtsWeeklySnapshot[];
  latest: GmtsLatestSnapshot;
  volumeHistory: GmtsVolumeHistory;
  sources: GmtsSource[];
  qualityFlags: GmtsQualityFlag[];
}

const dashboard = rawDashboard as unknown as GmtsDashboardData;

export function getGmtsDashboard(): GmtsDashboardData {
  return dashboard;
}
