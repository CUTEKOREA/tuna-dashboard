import { NextResponse } from "next/server";
import { fetchKCSNitemtrade, aggregateByCountry } from "../../_shared/kcs-client";

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 가자미·광어 (Flatfish, Olive Flounder) 관세청 수출입 데이터
 * GET /api/flatfish/kcs?hs=fresh&year=2024
 *
 * HS Codes:
 *   - 0302230000 (가자미 신선)
 *   - 0303330000 (가자미 냉동)
 *   - 0304310000 (가자미 필렛 신선)
 *
 * 한국 광어 양식 → 일본 수출 핵심. 제주 60% 집중.
 */

const HS_CODES = {
  fresh: "0302230000",
  frozen: "0303330000",
  fillet: "0304310000",
};

const FALLBACK_DATA = {
  source: "가자미 HS 0303330000 (2024 fallback)",
  isLive: false,
  lastUpdated: "2026-05-29",
  hs: "0303330000",
  summary: {
    totalWgt: 8500,
    totalDlr: 32000,
    cnWgt: 5100,
    cnDlr: 18500,
    cnPct: 60.0,
    cifPerKg: 3.76,
  },
  byOrigin: [
    { origin: "중국", volume: 5100, value: 18500, share: 60.0 },
    { origin: "러시아", volume: 1700, value: 6800, share: 20.0 },
    { origin: "노르웨이", volume: 850, value: 3500, share: 10.0 },
    { origin: "미국", volume: 510, value: 2200, share: 6.0 },
    { origin: "기타", volume: 340, value: 1000, share: 4.0 },
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
