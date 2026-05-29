import { NextResponse } from "next/server";
import { fetchKCSNitemtrade, aggregateByCountry } from "../../_shared/kcs-client";

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 캐슈너트 관세청 수입 데이터 API
 * GET /api/cashew/kcs?hs=in-shell&year=2024
 *
 * HS Codes:
 *   - 0801320000 (kernel, 까놓은 캐슈)
 *   - 0801310000 (in-shell, 껍질 있는 캐슈)
 *
 * 공유 KCS 클라이언트 사용 (룰북 L-11 mackerel 패턴 통일).
 */

const HS_CODES = {
  kernel: "0801320000",   // 까놓은 캐슈 (한국 대다수 수입 형태)
  inshell: "0801310000",  // 껍질 있는 캐슈
};

const FALLBACK_DATA = {
  source: "캐슈 HS 0801320000 (2024 fallback, VINACAS·관세청 cross-check)",
  isLive: false,
  lastUpdated: "2026-05-29",
  hs: "0801320000",
  summary: {
    totalWgt: 12500,      // 톤
    totalDlr: 92000,      // 천USD
    vnWgt: 9800,
    vnDlr: 73000,
    vnPct: 78.4,
    cifPerKg: 7.36,
  },
  byOrigin: [
    { origin: "베트남", volume: 9800, value: 73000, share: 78.4 },
    { origin: "인도", volume: 1900, value: 13500, share: 15.2 },
    { origin: "기타", volume: 800, value: 5500, share: 6.4 },
  ],
  yearly: [
    { year: "2021", totalWgt: 10200, vnPct: 75.1, cifPerKg: 6.85 },
    { year: "2022", totalWgt: 11300, vnPct: 76.5, cifPerKg: 7.10 },
    { year: "2023", totalWgt: 12100, vnPct: 77.2, cifPerKg: 7.25 },
    { year: "2024", totalWgt: 12500, vnPct: 78.4, cifPerKg: 7.36 },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hsKey = (searchParams.get("hs") || "kernel") as keyof typeof HS_CODES;
  const hsSgn = HS_CODES[hsKey] || HS_CODES.kernel;
  const year = searchParams.get("year") || "2024";
  const month = searchParams.get("month") || undefined;

  const result = await fetchKCSNitemtrade({ hsSgn, year, month });

  if (!result.isLive || result.items.length === 0) {
    return NextResponse.json(FALLBACK_DATA);
  }

  // 베트남(VN) 점유율 추적
  const agg = aggregateByCountry(result.items, "VN");

  return NextResponse.json({
    source: result.source,
    isLive: true,
    lastUpdated: new Date().toISOString(),
    hs: hsSgn,
    summary: {
      totalWgt: agg.totalWgt,
      totalDlr: agg.totalDlr,
      vnWgt: agg.majorWgt,
      vnDlr: agg.majorDlr,
      vnPct: agg.majorPct,
      cifPerKg: agg.cifPerKg,
    },
    byOrigin: agg.byOrigin,
    yearly: FALLBACK_DATA.yearly,
    apiHealth: result.apiHealth,
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
