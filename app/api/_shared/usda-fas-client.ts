import { requireEnv } from './env';
/**
 * USDA FAS (Foreign Agricultural Service) 공유 클라이언트
 *
 * 미국 농무부 해외 농산물 PSD·GAIN·ESR (Export Sales Reporting) 데이터.
 * 룰북 V4.2 L-10 (Fallback 키 패턴) 준수.
 *
 * 인증: X-Api-Key 헤더 (api.data.gov 표준).
 * 신키 발급: 2026-05-29 (cutekorea@gmail.com via api.data.gov).
 *
 * ⚠️ ESR (Export Sales Reporting)은 미국 수출 농산물 (Beef·Pork·곡물·면화 등) 위주.
 *    수산물(salmon/tuna/shrimp)은 ESR 대상이 아님 (NOAA Fisheries 별도).
 * → 수산물은 PSD (글로벌 Production·Supply·Distribution) 활용 권장.
 */

export const USDA_FAS_API_KEY = () => requireEnv('USDA_FAS_API_KEY');

const FAS_BASE = "https://api.fas.usda.gov/api";

/**
 * ESR commodity codes (44건만 존재, 수산물 미포함).
 * 1701: Fresh, Chilled, or Frozen Muscle Cuts of Beef
 * 1702: Fresh, Chilled, or Frozen Muscle Cuts of Pork
 */
export const ESR_COMMODITY_CODES = {
  beef: "1701",
  pork: "1702",
} as const;

/**
 * PSD commodity codes (수산물·축산물·농산물 글로벌 데이터).
 * 직접 조회 endpoint: /api/psd/commodities
 */
export const PSD_COMMODITY_CODES = {
  cattle: "0011000",       // Animal Numbers, Cattle
  swine: "0013000",        // Animal Numbers, Swine
  almonds: "0577400",      // Almonds, Shelled Basis
  apples: "0574000",       // Apples, Fresh
  barley: "0430000",
  corn: "0440000",         // Corn (사료 영향)
  cherries: "0579305",
  coffee: "0711100",
  cocoa: "0741000",        // Cocoa
} as const;

export type ESRResult = {
  isLive: boolean;
  records: any[];
  totalCount: number;
  source: string;
  apiHealth: { ok: boolean; reason?: string };
};

/**
 * ESR Export Sales Reporting (주별 수출 실적, 미국 농산물 수출만).
 */
export async function fetchESRExports(params: {
  commodityCode: string;
  marketYear: string;
  timeout?: number;
}): Promise<ESRResult> {
  const { commodityCode, marketYear, timeout = 8000 } = params;
  // 정확한 endpoint: /api/esr/exports/commodityCode/{code}/allCountries/marketYear/{year}
  const url = `${FAS_BASE}/esr/exports/commodityCode/${commodityCode}/allCountries/marketYear/${marketYear}`;

  try {
    const res = await fetch(url, {
      headers: { "X-Api-Key": USDA_FAS_API_KEY() },
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) {
      return {
        isLive: false, records: [], totalCount: 0,
        source: `USDA FAS HTTP ${res.status}`,
        apiHealth: { ok: false, reason: `HTTP ${res.status}` },
      };
    }
    const data = await res.json();
    if (data?.error) {
      return {
        isLive: false, records: [], totalCount: 0,
        source: `USDA FAS error: ${data.error.code}`,
        apiHealth: { ok: false, reason: data.error.message },
      };
    }
    const records = Array.isArray(data) ? data : (data?.records || data?.data || []);
    return {
      isLive: records.length > 0,
      records,
      totalCount: records.length,
      source: `USDA FAS ESR commodity ${commodityCode} marketYear ${marketYear}`,
      apiHealth: { ok: records.length > 0 },
    };
  } catch (e: any) {
    return {
      isLive: false, records: [], totalCount: 0,
      source: `USDA FAS Fallback (${e?.name === 'TimeoutError' ? 'timeout' : 'error'})`,
      apiHealth: { ok: false, reason: e?.message || 'unknown' },
    };
  }
}

/**
 * PSD (Production, Supply, Distribution) — 글로벌 commodity 수급 통계.
 */
export async function fetchPSDCommodity(params: {
  commodityCode: string;
  countryCode?: string;     // 예: KS (South Korea), CH (China), US, BR, AR
  marketYear?: number;      // 예: 2024
  timeout?: number;
}): Promise<ESRResult> {
  const { commodityCode, countryCode = "US", marketYear = 2024, timeout = 8000 } = params;
  // 정확한 endpoint: /api/psd/commodity/{code}/country/{cc}/year/{y}
  const url = `${FAS_BASE}/psd/commodity/${commodityCode}/country/${countryCode}/year/${marketYear}`;

  try {
    const res = await fetch(url, {
      headers: { "X-Api-Key": USDA_FAS_API_KEY() },
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) {
      return {
        isLive: false, records: [], totalCount: 0,
        source: `USDA FAS PSD HTTP ${res.status}`,
        apiHealth: { ok: false, reason: `HTTP ${res.status}` },
      };
    }
    const data = await res.json();
    const records = Array.isArray(data) ? data : (data?.records || data?.data || []);
    return {
      isLive: records.length > 0,
      records,
      totalCount: records.length,
      source: `USDA FAS PSD commodity ${commodityCode}${countryCode ? ` country ${countryCode}` : ''}`,
      apiHealth: { ok: records.length > 0 },
    };
  } catch (e: any) {
    return {
      isLive: false, records: [], totalCount: 0,
      source: `USDA FAS PSD Fallback (${e?.name === 'TimeoutError' ? 'timeout' : 'error'})`,
      apiHealth: { ok: false, reason: e?.message || 'unknown' },
    };
  }
}
