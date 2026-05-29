import { NextResponse } from "next/server";
import { fetchESRExports } from "../../_shared/usda-fas-client";

export const runtime = 'nodejs';
export const revalidate = 3600;

/**
 * USDA FAS ESR (Export Sales Reporting) — 연어 미국 수입 데이터
 * GET /api/salmon/usda-fas?year=2024
 *
 * FAS commodity code: 0312
 * 주요 원산지: 칠레·노르웨이
 */

const FALLBACK_DATA = {
  source: "USDA FAS ESR 연어 (commodity 0312) fallback",
  isLive: false,
  lastUpdated: "2026-05-29",
  marketYear: "2024",
  commodityCode: "0312",
  records: [],
  note: "USDA FAS API 키 검증·재발급 후 자동 라이브 전환. cutekorea@gmail.com 계정 확인.",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || "2024";

  const result = await fetchESRExports({
    commodityCode: "0312",
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
    commodityCode: "0312",
    records: result.records,
    totalCount: result.totalCount,
    apiHealth: result.apiHealth,
  }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
