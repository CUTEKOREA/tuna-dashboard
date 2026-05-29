/**
 * USDA FAS (Foreign Agricultural Service) 공유 클라이언트
 *
 * 미국 농무부 해외 농산물 PSD·GAIN·ESR (Export Sales Reporting) 데이터.
 * 룰북 V4.2 L-10 (Fallback 키 패턴) 준수.
 *
 * ⚠️ 인증 헤더: API_KEY (대문자, 표준 X-Api-Key 아님)
 * ⚠️ 2026-05-29 검증 시점 endpoint 응답 패턴 확인 필요 (키 재발급 검토 권장)
 *
 * 사용:
 *   import { fetchESRExports } from "@/app/api/_shared/usda-fas-client";
 */

export const USDA_FAS_API_KEY = process.env.USDA_FAS_API_KEY || '';

const FAS_BASE = "https://api.fas.usda.gov/api";

/**
 * ESR commodity codes (해당 commodity의 weekly export 보고서).
 * 참고: USDA FAS ESR commodity catalog
 */
export const ESR_COMMODITY_CODES = {
  salmon: "0312",       // Atlantic salmon (대표 코드 — 검증 필요)
  shrimp: "0306",       // Shrimps
  tuna: "0303",         // Tuna
  beef: "0201",         // Beef
  pork: "0203",         // Pork
  chicken: "0207",      // Chicken
} as const;

export type ESRResult = {
  isLive: boolean;
  records: any[];
  totalCount: number;
  source: string;
  apiHealth: { ok: boolean; reason?: string };
};

/**
 * ESR Export Sales Reporting (주별 수출 실적).
 * @param commodityCode FAS commodity 코드
 * @param marketYear 시장 연도 (예: 2024)
 * @param timeout 타임아웃 ms
 */
export async function fetchESRExports(params: {
  commodityCode: string;
  marketYear: string;
  timeout?: number;
}): Promise<ESRResult> {
  const { commodityCode, marketYear, timeout = 8000 } = params;

  if (!USDA_FAS_API_KEY) {
    return {
      isLive: false,
      records: [],
      totalCount: 0,
      source: "USDA FAS API key not set",
      apiHealth: { ok: false, reason: "USDA_FAS_API_KEY not set" },
    };
  }

  const url = `${FAS_BASE}/esr/exports/commodityCode/${commodityCode}/marketYear/${marketYear}`;

  try {
    const res = await fetch(url, {
      headers: { "API_KEY": USDA_FAS_API_KEY },
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) {
      return {
        isLive: false,
        records: [],
        totalCount: 0,
        source: `USDA FAS HTTP ${res.status}`,
        apiHealth: { ok: false, reason: `HTTP ${res.status}` },
      };
    }
    const data = await res.json();
    if (data?.error) {
      return {
        isLive: false,
        records: [],
        totalCount: 0,
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
      isLive: false,
      records: [],
      totalCount: 0,
      source: `USDA FAS Fallback (${e?.name === 'TimeoutError' ? 'timeout' : 'error'})`,
      apiHealth: { ok: false, reason: e?.message || 'unknown' },
    };
  }
}
