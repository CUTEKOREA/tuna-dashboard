import raw from '@/public/data/market-regime.v1.json';

/** 시장 국면 JSON 한 지표 행(수집기 스키마 v1). */
export type MarketRegimeBaseline = {
  type: string;
  label?: string;
  value: number;
  unit: string;
  years: number | null;
};

export type MarketRegimeDelta = {
  type: string;
  value: number;
  unit: string;
};

export type MarketRegimeIndicator = {
  id: string;
  label: string;
  value: number | null;
  unit: string | null;
  asof: string | null;
  baseline: MarketRegimeBaseline | null;
  delta: MarketRegimeDelta | null;
  source_url: string;
  status: string;
};

type MarketRegimeRoot = {
  schema_version: string;
  generated_at: string;
  collection_interval_days: number;
  commodities: Record<string, MarketRegimeIndicator[]>;
  common: MarketRegimeIndicator[];
};

const DATA = raw as unknown as MarketRegimeRoot;

export function marketRegimeCommodityKeys(): string[] {
  return Object.keys(DATA.commodities);
}

/** 대시보드 품목 키에 맞는 시장 국면 지표. 없으면 빈 배열. */
export function marketRegimeFor(commodityKey: string): MarketRegimeIndicator[] {
  return DATA.commodities[commodityKey] ?? [];
}

/** ENSO 등 품목 공통 지표. */
export function marketRegimeCommon(): MarketRegimeIndicator[] {
  return DATA.common ?? [];
}

/** JSON 갱신 시각(ISO). */
export function marketRegimeGeneratedAt(): string {
  return DATA.generated_at;
}
