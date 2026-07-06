import rawDashboard from '../../data/bni_global_dashboard.json';

export type BniRiskLevel = '주의' | '경계' | '높음';

export interface BniPriceSignal {
  seriesId: string;
  latestDate: string;
  latestValue: number | null;
  previousValue: number | null;
  monthChangePct: number | null;
  sinceFirstPct: number | null;
  observations: number;
  unit: string;
}

export interface BniCustomsSignal {
  latestPeriod: string;
  latestMonth: string;
  rows: number;
  latestRows: number;
  importUsd: number;
  importTon: number;
  unitUsdPerTon: number | null;
  topCountry: string;
  topCountrySharePct: number | null;
}

export interface BniComtradeSignal {
  latestYear: string;
  rows: number;
  latestRows: number;
  worldPartnerRows: number;
  hsCodes: string[];
}

export interface BniCommoditySignal {
  key: string;
  name: string;
  englishName: string;
  hsCodes: string[];
  stance: string;
  riskLevel: BniRiskLevel;
  signalScore: number;
  bniReview: string;
  bniOutlook: string;
  customerMessage: string;
  price: BniPriceSignal;
  customs: BniCustomsSignal;
  comtrade: BniComtradeSignal;
}

export interface BniSupplementaryMarket {
  name: string;
  englishName: string;
  status: string;
  latestSignal: string;
  watch: string;
}

export interface BniRiskRadarItem {
  factor: string;
  level: BniRiskLevel;
  affected: string[];
  evidence: string;
  action: string;
}

export interface BniApiCoverage {
  source: string;
  status: string;
  usage: string;
}

export interface BniReportArchiveItem {
  date: string;
  file: string;
  pages: number | null;
  sourcePath: string;
}

export interface BniGlobalDashboardData {
  meta: {
    title: string;
    audience: string;
    status: 'STATIC';
    syncDate: string;
    source: string;
    method: string;
    reportDir: string;
    agriPipelineRoot: string;
    generatedAt: string;
    version: string;
  };
  latestReport: BniReportArchiveItem & {
    headline: string;
  };
  coverage: {
    reportCount: number;
    dateRange: string;
    commodityCount: number;
    structuredCommodityCount: number;
  };
  thesis: {
    headline: string;
    body: string;
    posture: string;
  };
  summaryKpis: Array<{
    label: string;
    value: string;
    note: string;
  }>;
  commodities: BniCommoditySignal[];
  supplementaryMarkets: BniSupplementaryMarket[];
  riskRadar: BniRiskRadarItem[];
  apiCoverage: BniApiCoverage[];
  reportArchive: BniReportArchiveItem[];
  nextBuild: string[];
}

export function getBniGlobalDashboard(): BniGlobalDashboardData {
  return rawDashboard as BniGlobalDashboardData;
}
