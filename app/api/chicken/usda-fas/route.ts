import { NextResponse } from "next/server";
import { fetchPSDCommodity } from "../../_shared/usda-fas-client";

export const runtime = 'nodejs';
export const revalidate = 3600;

/**
 * USDA FAS PSD — chicken PSD
 * GET /api/chicken/usda-fas?year=2024&country=US
 *
 * commodityCode: 0115000 (Meat, Chicken) — PSD API 실존 코드
 * 이전 0014000 (Animal Numbers, Poultry)은 PSD에 미존재 → 빈 배열 반환 → isLive=false 버그
 */

const FALLBACK_DATA = {
  source: "USDA FAS PSD chicken (0115000) fallback",
  isLive: false,
  lastUpdated: "2026-05-29",
  marketYear: "2024",
  commodityCode: "0115000",
  records: [],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "2024", 10);
  const country = searchParams.get("country") || undefined;

  const result = await fetchPSDCommodity({
    commodityCode: "0115000",
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
    commodityCode: "0115000",
    records: result.records.slice(0, 100),
    totalCount: result.totalCount,
    apiHealth: result.apiHealth,
  }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
