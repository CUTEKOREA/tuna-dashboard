import { NextResponse } from "next/server";
import { fetchSinglAcnt, extractKeyFinancials } from "../../_shared/dart-client";

export const runtime = 'nodejs';
export const revalidate = 3600;

/**
 * 참치 관련 한국 상장사 DART 재무·공시 라이브 데이터
 * GET /api/tuna/dart?year=2024
 *
 * 대상 회사: 동원산업, 사조산업, 신라교역
 */

const COMPANIES = [
  { name: "동원산업", code: "00118026" },  // 2026-06-05 정정: 00128524는 오류(DART CORPCODE 검증, stock:006040)
  { name: "사조산업", code: "00237717" },
  { name: "신라교역", code: "00857727" },  // 비상장 가능성 — CFS/OFS 미작성 시 graceful skip
];

const FALLBACK_DATA = {
  source: "DART 참치 관련사 fallback (재무 데이터 미보유)",
  isLive: false,
  lastUpdated: "2026-05-29",
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
        // CFS(연결재무제표) 우선 조회 — 없으면 OFS(별도재무제표) 폴백
        // 신라교역 등 중소 가공·유통사는 CFS 미작성으로 list:[] 반환 → isLive=false 원인
        let acnt = await fetchSinglAcnt({
          corp_code: c.code,
          bsns_year: year,
          reprt_code: "11011",
          fs_div: "CFS",
        });
        if (!acnt.ok || acnt.list.length === 0) {
          // CFS 실패 → OFS 재시도
          acnt = await fetchSinglAcnt({
            corp_code: c.code,
            bsns_year: year,
            reprt_code: "11011",
            fs_div: "OFS",
          });
        }
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

    const fetched = results.filter(r => r.revenue !== null).length;
    const allOk = fetched === COMPANIES.length;
    const anyOk = fetched > 0;
    return NextResponse.json({
      // isLive: 1사 이상 실재무 조회 성공 시 LIVE(신라교역 등 비상장사 부재는 정직 graceful). 전체 조회 여부는 라벨로 구분.
      source: `DART 사업보고서 ${year} 실시간 (${COMPANIES.length}사 중 ${fetched}사 조회${allOk ? '·전체' : ''})`,
      isLive: anyOk,
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
