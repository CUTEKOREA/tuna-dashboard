import rawMonthly from '../../data/gmts_monthly.json';

export type GmtsMonthlyCompany = 'GMTS' | 'KFC' | 'NFDC';

export const GMTS_MONTHLY_COMPANIES: readonly GmtsMonthlyCompany[] = ['GMTS', 'KFC', 'NFDC'];

export interface GmtsMonthlyMetadata {
  status: 'STATIC';
  reportCount: number;
  firstReportDate: string;
  latestReportDate: string;
  reportMonths: number[];
}

export interface GmtsMonthlyTrend {
  unit: 'M/T' | 'USD/MT';
  years: string[];
  series: Record<string, Array<number | null>>;
  sourceReportDate: string;
}

export interface GmtsMonthlyProfit {
  periodLabel: string;
  rows: string[];
  companies: Record<GmtsMonthlyCompany, { y2025: Array<number | null>; y2026: Array<number | null> }>;
}

export interface GmtsMonthlyFundsRecord {
  cash: number | null;
  deposit: number | null;
  receivable: number | null;
  assetSubtotal: number | null;
  toSilla: number | null;
  toGmts: number | null;
  toOthers: number | null;
  debtSubtotal: number | null;
  netBalance: number | null;
}

export interface GmtsMonthlyFunds {
  asOfLabel: string;
  companies: Record<GmtsMonthlyCompany, GmtsMonthlyFundsRecord>;
  notes: Partial<Record<GmtsMonthlyCompany, string>>;
}

export interface GmtsMonthlySource {
  fileName: string;
  reportDate: string;
  sha256: string;
}

export interface GmtsMonthlyReport {
  reportMonth: number;
  reportDate: string;
  priceNote: string;
  profit: GmtsMonthlyProfit;
  funds: GmtsMonthlyFunds;
  briefing: string[];
  briefingFootnotes: string[];
  source: GmtsMonthlySource;
}

export interface GmtsMonthlyQualityFlag {
  code: 'PROFIT_IDENTITY_MISMATCH' | 'FUNDS_IDENTITY_MISMATCH';
  where: string;
  expected: number;
  printed: number;
}

export interface GmtsMonthlyData {
  schemaVersion: 1;
  metadata: GmtsMonthlyMetadata;
  catchTrend: GmtsMonthlyTrend;
  priceTrend: GmtsMonthlyTrend;
  reports: GmtsMonthlyReport[];
  qualityFlags: GmtsMonthlyQualityFlag[];
  sources: GmtsMonthlySource[];
}

const monthly = rawMonthly as unknown as GmtsMonthlyData;

export function getGmtsMonthly(): GmtsMonthlyData {
  return monthly;
}
