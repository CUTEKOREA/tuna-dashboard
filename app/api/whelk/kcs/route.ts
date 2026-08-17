import { NextResponse } from "next/server";
import { HS_CODES } from "../../_shared/hs-codes";
import { fetchKCSNitemtrade, aggregateByCountry } from "../../_shared/kcs-client";

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 골뱅이 (Whelk, Buccinum undatum) 관세청 수입 데이터
 * GET /api/whelk/kcs?hs=frozen&year=2024
 *
 * HS Codes (2026-08-17 정정 — 기존 0307600000 은 달팽이, 1605550000 은 문어 조제였다):
 *   - 160559 (자숙·조제 골뱅이류. 수입 실체는 자숙 냉동육 — 캔은 국내 생산)
 *
 * 주요 수입국: 영국 (북해), 캐나다 (3Ps 대서양), 한국 자체 어획 일부
 */

const WHELK_HS = {
  // frozen/canned 파라미터는 유지하되 둘 다 실제 골뱅이 코드를 가리킨다 —
  // 예전 코드는 각각 달팽이·문어였다 (hs-codes.ts 정정 주석 참조).
  frozen: HS_CODES.whelk_prepared.hsSgn,
  canned: HS_CODES.whelk_prepared.hsSgn,
};

// 2024년 관세청 실측 (HS 160559, 2026-08-17 API 조회 · 아카이브 KCS_품목별국가별/2026-08-17).
// 예전 fallback 은 달팽이 코드(0307600000)에 근거 없는 값이었다.
const FALLBACK_DATA = {
  source: "골뱅이 HS 160559 (2024년 관세청 실측 fallback)",
  isLive: false,
  lastUpdated: "2026-08-17",
  hs: "160559",
  summary: {
    totalWgt: 6215,
    totalDlr: 58505,
    gbWgt: 2388,
    gbDlr: 30460,
    gbPct: 52.1,
    cifPerKg: 12.76,
  },
  byOrigin: [
    { origin: "영국", volume: 2388, value: 30460, share: 52.1 },
    { origin: "아일랜드", volume: 617, value: 7570, share: 12.9 },
    { origin: "중국", volume: 767, value: 4880, share: 8.3 },
    { origin: "튀르키예", volume: 311, value: 4170, share: 7.1 },
    { origin: "기타", volume: 2132, value: 11425, share: 19.6 },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hsKey = (searchParams.get("hs") || "frozen") as keyof typeof WHELK_HS;
  const hsSgn = WHELK_HS[hsKey] || WHELK_HS.frozen;
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
