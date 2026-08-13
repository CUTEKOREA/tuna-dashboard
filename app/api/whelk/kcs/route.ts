import { NextResponse } from "next/server";
import { HS_CODES } from "../../_shared/hs-codes";
import { fetchKCSNitemtrade, aggregateByCountry } from "../../_shared/kcs-client";

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 골뱅이 (Whelk, Buccinum undatum) 관세청 수입 데이터
 * GET /api/whelk/kcs?hs=prepared&year=2024
 *
 * HS Codes (광의 바다고둥·조제 연체동물 코드):
 *   - 030791 (활·신선·냉장 바다고둥)
 *   - 030792 (냉동 바다고둥)
 *   - 160559 (조제·보존 골뱅이, 통조림 포함)
 *
 * 주요 수입국: 영국 (북해), 캐나다 (3Ps 대서양), 한국 자체 어획 일부
 */

const WHELK_HS = {
  live_fresh: HS_CODES.whelk_live_fresh.hsSgn,
  frozen: HS_CODES.whelk_frozen.hsSgn,
  prepared: HS_CODES.whelk_prepared.hsSgn,
  canned: HS_CODES.whelk_prepared.hsSgn,
};

// fallback 은 HS 코드별로 분리한다.
// 단일 상수를 전 키에 돌려주면 hs=frozen(030792) 요청에 1605.59 조제품 수치가
// hs:'160559' 라벨로 반환돼 요청 코드와 응답 품목이 어긋난다.
//
// share·gbPct 는 aggregateByCountry 와 동일하게 **중량(volume) 기준**이다.
// 금액 기준 점유율(영국 52.1% 등)과 다른 축이므로 위젯 문구에서 혼용 금지.
// 정렬도 라이브 경로(volume 내림차순)와 일치시켜 fallback/live shape 를 동일하게 유지한다.
// 단위: volume=톤, value=천USD (aggregateByCountry 와 동일).
const FALLBACKS: Record<string, {
  source: string; isLive: boolean; lastUpdated: string; hs: string;
  summary: Record<string, number>;
  byOrigin: { origin: string; volume: number; value: number; share: number }[];
}> = {
  // HS 1605.59 조제·보존 — 관세청 2024 연간 실측 (아카이브 kcs_HS160559_2024.xml, 상세행 합산)
  '160559': {
    source: "관세청 골뱅이 HS 160559 (2024 실측 fallback)",
    isLive: false,
    lastUpdated: "2026-08-13",
    hs: "160559",
    summary: {
      totalWgt: 6215.357, totalDlr: 58504.76,
      gbWgt: 2388.238, gbDlr: 30455.407, gbPct: 38.4, cifPerKg: 9.41,
    },
    byOrigin: [
      { origin: "영국", volume: 2388.238, value: 30455.407, share: 38.4 },
      { origin: "세네갈", volume: 768.498, value: 3634.888, share: 12.4 },
      { origin: "중국", volume: 766.588, value: 4884.764, share: 12.3 },
      { origin: "아일랜드", volume: 617.04, value: 7574.115, share: 9.9 },
      { origin: "튀르키예", volume: 311.3, value: 4169.468, share: 5.0 },
      { origin: "기타", volume: 1363.693, value: 7786.118, share: 21.9 },
    ],
  },
  // HS 0307.91 활·신선·냉장 — 관세청 2024 연간 실측 (아카이브 kcs_HS030791_2024.xml)
  // 조제품과 달리 중국 단일 의존(99.1%)이고 단가도 $1.34/kg 로 완전히 다른 시장이다.
  '030791': {
    source: "관세청 바다고둥 HS 030791 (2024 실측 fallback)",
    isLive: false,
    lastUpdated: "2026-08-13",
    hs: "030791",
    summary: {
      totalWgt: 1268.806, totalDlr: 1705.049,
      gbWgt: 0, gbDlr: 0, gbPct: 0, cifPerKg: 1.34,
    },
    byOrigin: [
      { origin: "중국", volume: 1256.773, value: 1641.897, share: 99.1 },
      { origin: "러시아 연방", volume: 10.0, value: 26.56, share: 0.8 },
      { origin: "인도네시아", volume: 1.53, value: 2.602, share: 0.1 },
    ],
  },
  // HS 0307.92 냉동 — 2024 연간 아카이브 미보유. 수치를 지어내지 않고 503 을 반환한다.
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // 골뱅이 수입의 실질은 HS 1605.59 조제품이므로 기본 키를 prepared 로 둔다.
  const hsKey = (searchParams.get("hs") || "prepared") as keyof typeof WHELK_HS;
  const hsSgn = WHELK_HS[hsKey] || WHELK_HS.prepared;
  const year = searchParams.get("year") || "2024";
  const month = searchParams.get("month") || undefined;

  const result = await fetchKCSNitemtrade({ hsSgn, year, month });
  if (!result.isLive || result.items.length === 0) {
    const fallback = FALLBACKS[hsSgn];
    if (!fallback) {
      // 해당 HS 의 아카이브 실측이 없다. 다른 코드 수치를 빌려오지 않고 정직하게 실패한다.
      return NextResponse.json({
        isLive: false,
        hs: hsSgn,
        source: `관세청 라이브 실패. HS ${hsSgn} 는 아카이브 fallback 실측을 보유하지 않는다.`,
        lastUpdated: new Date().toISOString(),
      }, { status: 503 });
    }
    return NextResponse.json(fallback);
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
