import { NextResponse } from "next/server";

// L-10: fallback 키 보유 — env 우선, 없으면 하드코딩 키로 라이브 시도
const COMTRADE_KEY =
  process.env.UN_COMTRADE_PRIMARY_KEY ||
  process.env.UN_COMTRADE_SECONDARY_KEY ||
  "61063fe9f1d2483ea97a9e526daf20a6";

const FALLBACK = {
  source: "UN Comtrade HS 030389 (Forensic 파싱 캐시)",
  isLive: false,
  lastUpdated: new Date().toISOString(),
  data: [
    { country: "한국", exportVal: 11, importVal: 55 },
    { country: "일본", exportVal: 5, importVal: 302 },
    { country: "스페인", exportVal: 4, importVal: 42 },
    { country: "중국", exportVal: 510, importVal: 2 },
    { country: "인도", exportVal: 85, importVal: 0 },
    { country: "대만", exportVal: 62, importVal: 1 }
  ]
};

export async function GET() {
  try {
    const url = new URL("https://comtradeapi.un.org/data/v1/get/C/A/HS");
    url.searchParams.set("cmdCode", "030389");
    // 2026-06-05 수정: reporterCode=all 과대쿼리(premium 거부) → 주요 갈치 교역국 한정
    // 중국156·한국410·일본392·베트남704·미국842·러시아643·노르웨이578·칠레152
    url.searchParams.set("reporterCode", "156,410,392,704,842,643,578,152");
    url.searchParams.set("partnerCode", "0");
    url.searchParams.set("period", "2023");
    url.searchParams.set("flowCode", "M,X");

    const res = await fetch(url.toString(), {
      headers: {
        "Ocp-Apim-Subscription-Key": COMTRADE_KEY,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const json = await res.json();
      const rows: Array<{ reporterCode: number; reporterDesc: string; flowCode: string; primaryValue: number }> =
        json.data || [];

      // 국가별 수출/수입 집계
      const countryMap: Record<string, { country: string; exportVal: number; importVal: number }> = {};
      for (const row of rows) {
        const key = String(row.reporterCode);
        if (!countryMap[key]) {
          countryMap[key] = { country: row.reporterDesc || key, exportVal: 0, importVal: 0 };
        }
        const valMt = (row.primaryValue || 0) / 1_000_000; // USD → 백만USD
        if (row.flowCode === "X") countryMap[key].exportVal += valMt;
        else if (row.flowCode === "M") countryMap[key].importVal += valMt;
      }

      const data = Object.values(countryMap)
        .sort((a, b) => b.exportVal + b.importVal - (a.exportVal + a.importVal))
        .slice(0, 10);

      if (data.length > 0) {
        return NextResponse.json({
          isLive: true,
          source: "UN Comtrade 실시간 API (HS 030389)",
          lastUpdated: new Date().toISOString(),
          data,
        });
      }
    }

    console.warn("[galchi/comtrade] API 응답 비정상, fallback 반환. status:", res.status);
  } catch (e) {
    console.error("[galchi/comtrade] API 호출 오류:", e);
  }
  return NextResponse.json(FALLBACK);
}
