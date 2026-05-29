import { NextResponse } from "next/server";
import { fetchKCSNitemtrade, aggregateByCountry } from "../../_shared/kcs-client";

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 골뱅이 (Whelk, Buccinum undatum) 관세청 수입 데이터
 * GET /api/whelk/kcs?hs=frozen&year=2024
 *
 * HS Codes:
 *   - 0307600000 (산·신선·냉장 골뱅이/패류 fucinum)
 *   - 1605550000 (조제·보존 골뱅이 통조림)
 *
 * 주요 수입국: 영국 (북해), 캐나다 (3Ps 대서양), 한국 자체 어획 일부
 */

const HS_CODES = {
  frozen: "0307600000",
  canned: "1605550000",
};

const FALLBACK_DATA = {
  source: "골뱅이 HS 0307600000 (2024 fallback, Defra FMP cross-check)",
  isLive: false,
  lastUpdated: "2026-05-29",
  hs: "0307600000",
  summary: {
    totalWgt: 6800,
    totalDlr: 18500,
    gbWgt: 4080,
    gbDlr: 12200,
    gbPct: 60.0,
    cifPerKg: 2.72,
  },
  byOrigin: [
    { origin: "영국", volume: 4080, value: 12200, share: 60.0 },
    { origin: "캐나다", volume: 1700, value: 4500, share: 25.0 },
    { origin: "아일랜드", volume: 680, value: 1300, share: 10.0 },
    { origin: "기타", volume: 340, value: 500, share: 5.0 },
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

  const agg = aggregateByCountry(result.items, "GB");
  return NextResponse.json({
    source: result.source,
    isLive: true,
    lastUpdated: new Date().toISOString(),
    hs: hsSgn,
    summary: {
      totalWgt: agg.totalWgt, totalDlr: agg.totalDlr,
      gbWgt: agg.majorWgt, gbDlr: agg.majorDlr,
      gbPct: agg.majorPct, cifPerKg: agg.cifPerKg,
    },
    byOrigin: agg.byOrigin,
    apiHealth: result.apiHealth,
  }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
