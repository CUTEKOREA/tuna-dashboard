import { NextResponse } from "next/server";
import { fetchPSDCommodity } from "../../_shared/usda-fas-client";

export const runtime = 'nodejs';
export const revalidate = 3600;

/**
 * USDA FAS PSD — chicken PSD
 * GET /api/chicken/usda-fas?year=2024&country=US
 *
 * commodityCode: 0014000 (Animal Numbers, Poultry)
 */

const FALLBACK_DATA = {
  source: "USDA FAS PSD chicken (0014000) fallback",
  isLive: false,
  lastUpdated: "2026-05-29",
  marketYear: "2024",
  commodityCode: "0014000",
  records: [],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "2024", 10);
  const country = searchParams.get("country") || undefined;

  const result = await fetchPSDCommodity({
    commodityCode: "0014000",
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
    commodityCode: "0014000",
    records: result.records.slice(0, 100),
    totalCount: result.totalCount,
    apiHealth: result.apiHealth,
  }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
