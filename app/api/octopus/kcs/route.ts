import { NextResponse } from "next/server";
import { fetchKCSNitemtrade, aggregateByCountry } from "../../_shared/kcs-client";

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 낙지 (Octopus minor) 관세청 수입 데이터
 * GET /api/octopus/kcs?hs=frozen&year=2024
 *
 * HS Codes:
 *   - 0307510000 (산 낙지)
 *   - 0307521000 (냉동 낙지/문어)
 *
 * 주요 수입국: 베트남·중국·세네갈·모리타니아·모로코
 */

const HS_CODES = {
  live: "0307510000",
  frozen: "0307521000",
};

const FALLBACK_DATA = {
  source: "낙지 HS 0307521000 (2024 fallback, FAO GLOBEFISH cross-check)",
  isLive: false,
  lastUpdated: "2026-05-29",
  hs: "0307521000",
  summary: {
    totalWgt: 28500,    // 톤
    totalDlr: 245000,   // 천USD
    vnWgt: 11400,
    vnDlr: 98000,
    vnPct: 40.0,
    cifPerKg: 8.60,
  },
  byOrigin: [
    { origin: "베트남", volume: 11400, value: 98000, share: 40.0 },
    { origin: "중국", volume: 6850, value: 56000, share: 24.0 },
    { origin: "모리타니아", volume: 4280, value: 42000, share: 15.0 },
    { origin: "모로코", volume: 3420, value: 35000, share: 12.0 },
    { origin: "세네갈", volume: 1710, value: 14000, share: 6.0 },
    { origin: "기타", volume: 840, value: 0, share: 3.0 },
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

  const agg = aggregateByCountry(result.items, "VN");
  return NextResponse.json({
    source: result.source,
    isLive: true,
    lastUpdated: new Date().toISOString(),
    hs: hsSgn,
    summary: {
      totalWgt: agg.totalWgt, totalDlr: agg.totalDlr,
      vnWgt: agg.majorWgt, vnDlr: agg.majorDlr,
      vnPct: agg.majorPct, cifPerKg: agg.cifPerKg,
    },
    byOrigin: agg.byOrigin,
    apiHealth: result.apiHealth,
  }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
