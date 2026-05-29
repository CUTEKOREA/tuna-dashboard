import { NextResponse } from "next/server";
import { fetchKCSNitemtrade, aggregateByCountry } from "../../_shared/kcs-client";

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 주꾸미 (Webfoot Octopus, Amphioctopus fangsiao) 관세청 수입 데이터
 * GET /api/jukkumi/kcs?hs=frozen&year=2024
 *
 * HS Codes:
 *   - 0307599000 (냉동 주꾸미·문어류)
 *
 * 주요 수입: 베트남·중국·태국·인도네시아·모리타니아 등
 */

const HS_CODES = {
  frozen: "0307599000",
};

const FALLBACK_DATA = {
  source: "주꾸미 HS 0307599000 (2024 fallback)",
  isLive: false,
  lastUpdated: "2026-05-29",
  hs: "0307599000",
  summary: {
    totalWgt: 12500,
    totalDlr: 78000,
    cnWgt: 5000,
    cnDlr: 32000,
    cnPct: 40.0,
    cifPerKg: 6.24,
  },
  byOrigin: [
    { origin: "중국", volume: 5000, value: 32000, share: 40.0 },
    { origin: "베트남", volume: 3750, value: 23000, share: 30.0 },
    { origin: "태국", volume: 1875, value: 11500, share: 15.0 },
    { origin: "인도네시아", volume: 1250, value: 8000, share: 10.0 },
    { origin: "기타", volume: 625, value: 3500, share: 5.0 },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hsKey = (searchParams.get("hs") || "frozen") as keyof typeof HS_CODES;
  const hsSgn = HS_CODES[hsKey] || HS_CODES.frozen;
  const year = searchParams.get("year") || "2024";
  const month = searchParams.get("month") || undefined;

  const result = await fetchKCSNitemtrade({ hsSgn, year, month });
  if (!result.isLive || result.items.length === 0) {
    return NextResponse.json(FALLBACK_DATA);
  }

  const agg = aggregateByCountry(result.items, "CN");
  return NextResponse.json({
    source: result.source,
    isLive: true,
    lastUpdated: new Date().toISOString(),
    hs: hsSgn,
    summary: {
      totalWgt: agg.totalWgt, totalDlr: agg.totalDlr,
      cnWgt: agg.majorWgt, cnDlr: agg.majorDlr,
      cnPct: agg.majorPct, cifPerKg: agg.cifPerKg,
    },
    byOrigin: agg.byOrigin,
    apiHealth: result.apiHealth,
  }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
