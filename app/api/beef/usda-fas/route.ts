import { NextResponse } from "next/server";
import { fetchESRExports } from "../../_shared/usda-fas-client";

export const runtime = 'nodejs';
export const revalidate = 3600;

/**
 * USDA FAS ESR — beef ESR
 * GET /api/beef/usda-fas?year=2024
 *
 * commodityCode: 1701 (Fresh, Chilled, or Frozen Muscle Cuts of Beef)
 */

const FALLBACK_DATA = {
  source: "USDA FAS ESR beef (1701) fallback",
  isLive: false,
  lastUpdated: "2026-05-29",
  marketYear: "2024",
  commodityCode: "1701",
  records: [],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || "2024";

  const result = await fetchESRExports({
    commodityCode: "1701",
    marketYear: year,
  });

  if (!result.isLive) {
    return NextResponse.json({
      ...FALLBACK_DATA,
      marketYear: year,
      apiHealth: result.apiHealth,
    });
  }

  return NextResponse.json({
    source: result.source,
    isLive: true,
    lastUpdated: new Date().toISOString(),
    marketYear: year,
    commodityCode: "1701",
    records: result.records.slice(0, 100),
    totalCount: result.totalCount,
    apiHealth: result.apiHealth,
  }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
