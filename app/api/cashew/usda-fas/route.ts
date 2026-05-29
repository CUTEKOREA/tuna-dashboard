import { NextResponse } from "next/server";
import { fetchPSDCommodity } from "../../_shared/usda-fas-client";

export const runtime = 'nodejs';
export const revalidate = 3600;

/**
 * USDA FAS PSD — cashew PSD
 * GET /api/cashew/usda-fas?year=2024&country=US
 *
 * commodityCode: 0577400 (Almonds, Shelled Basis (캐슈 직접 코드 미존재 → Almonds 대체))
 */

const FALLBACK_DATA = {
  source: "USDA FAS PSD cashew (0577400) fallback",
  isLive: false,
  lastUpdated: "2026-05-29",
  marketYear: "2024",
  commodityCode: "0577400",
  records: [],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "2024", 10);
  const country = searchParams.get("country") || undefined;

  const result = await fetchPSDCommodity({
    commodityCode: "0577400",
    marketYear: year,
    countryCode: country,
  });

  if (!result.isLive) {
    return NextResponse.json({
      ...FALLBACK_DATA,
      marketYear: String(year),
      apiHealth: result.apiHealth,
    });
  }

  return NextResponse.json({
    source: result.source,
    isLive: true,
    lastUpdated: new Date().toISOString(),
    marketYear: String(year),
    commodityCode: "0577400",
    records: result.records.slice(0, 100),
    totalCount: result.totalCount,
    apiHealth: result.apiHealth,
  }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
