import { NextResponse } from "next/server";
import { fetchSinglAcnt, extractKeyFinancials, fetchDartList } from "../../_shared/dart-client";

export const runtime = 'nodejs';
export const revalidate = 3600;

/**
 * 새우 관련 한국 상장사 DART 재무·공시 라이브 데이터
 * GET /api/shrimp/dart?year=2024
 *
 * 대상 회사: CJ제일제당, 동원홈푸드
 */

const COMPANIES = [
  { name: "CJ제일제당", code: "00635134" }, // DART corpCode.xml 검증 (stock: 097950)
  { name: "동원F&B", code: "00340917" },    // 동원홈푸드 비상장·비공시 → 상장 모회사 동원F&B (stock: 049770)
];

const FALLBACK_DATA = {
  source: "DART 새우 관련사 fallback (재무 데이터 미보유)",
  isLive: false,
  lastUpdated: "2026-06-05",
  companies: COMPANIES.map(c => ({
    corp_name: c.name,
    corp_code: c.code,
    revenue: null,
    operatingIncome: null,
    netIncome: null,
  })),
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || "2024";

  try {
    const results = await Promise.all(
      COMPANIES.map(async (c) => {
        const acnt = await fetchSinglAcnt({
          corp_code: c.code,
          bsns_year: year,
          reprt_code: "11011",
        });
        if (!acnt.ok || acnt.list.length === 0) {
          return {
            corp_name: c.name,
            corp_code: c.code,
            revenue: null,
            operatingIncome: null,
            netIncome: null,
          };
        }
        const fin = extractKeyFinancials(acnt.list);
        return {
          corp_name: c.name,
          corp_code: c.code,
          ...fin,
        };
      })
    );

    const allOk = results.every(r => r.revenue !== null);
    return NextResponse.json({
      source: `DART 사업보고서 ${year} 실시간 (${COMPANIES.length}사 ${allOk ? '전체 조회' : '일부 조회 실패'})`,
      isLive: allOk,
      lastUpdated: new Date().toISOString(),
      year,
      companies: results,
      apiHealth: { ok: allOk, queried: COMPANIES.length, fetched: results.filter(r => r.revenue !== null).length },
    }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
  } catch (e) {
    console.error("DART API error:", e);
    return NextResponse.json(FALLBACK_DATA);
  }
}
