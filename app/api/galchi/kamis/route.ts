import { NextResponse } from "next/server";

/**
 * 갈치 KAMIS 도매가격 실시간 API
 * GET /api/galchi/kamis?recent=7
 * 품목코드: 619 (갈치)
 */

const KAMIS_KEY = process.env.KAMIS_API_KEY || "";
const KAMIS_BASE = "https://www.kamis.or.kr/service/price/xml.do";

const FALLBACK = {
  source: "KAMIS 품목 619 갈치 (Forensic 파싱 1,386건)",
  isLive: false,
  lastUpdated: "2026-05-13",
  current: { avgPrice: 28500, weekChange: "+4.2%", monthChange: "+8.1%" },
  monthly: [
    { month: "2025-08", wholesale: 21200 },
    { month: "2025-09", wholesale: 24800 },
    { month: "2025-10", wholesale: 28100 },
    { month: "2025-11", wholesale: 30200 },
    { month: "2025-12", wholesale: 27500 },
    { month: "2026-01", wholesale: 25800 },
    { month: "2026-02", wholesale: 24300 },
    { month: "2026-03", wholesale: 26100 },
    { month: "2026-04", wholesale: 27400 },
    { month: "2026-05", wholesale: 28500 },
  ],
  spread: {
    auctionPrice: 10300,
    wholesalePrice: 28500,
    spreadPct: 176.7,
    interpretation: "위판가 대비 도매가 2.77배 — 중간 유통 마진 과다"
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recent = parseInt(searchParams.get("recent") || "30");

  try {
    if (!KAMIS_KEY) return NextResponse.json(FALLBACK);

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - recent);

    const fmt = (d: Date) => d.toISOString().split("T")[0].replace(/-/g, "");

    const params = new URLSearchParams({
      action: "periodProductList",
      p_productclscode: "02",  // 수산물
      p_itemcategorycode: "600", // 수산물
      p_itemcode: "619",  // 갈치
      p_kindcode: "01",
      p_productrankcode: "04", // 상품
      p_startday: fmt(startDate),
      p_endday: fmt(today),
      p_cert_key: KAMIS_KEY,
      p_cert_id: process.env.KAMIS_CERT_ID || "7849",
      p_returntype: "json",
    });

    const res = await fetch(`${KAMIS_BASE}?${params}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const text = await res.text();
      if (text && !text.includes("error")) {
        try {
          const json = JSON.parse(text);
          const items = json?.data?.item || json?.items || [];

          if (items.length > 0) {
            const prices = items
              .filter((i: any) => i.countyname === "평균" || !i.countyname)
              .map((i: any) => ({
                date: i.yyyy + "-" + (i.regday || "").replace("/", "-"),
                price: parseInt((i.price || "0").replace(/,/g, "")),
              }))
              .filter((p: any) => p.price > 0);

            const latestPrice = prices.length > 0 ? prices[prices.length - 1].price : 0;
            const weekAgo = prices.length >= 7 ? prices[prices.length - 7].price : latestPrice;
            const weekChange = weekAgo > 0 ? ((latestPrice - weekAgo) / weekAgo * 100).toFixed(1) : "0";

            return NextResponse.json({
              source: "KAMIS 실시간 (품목 619 갈치)",
              isLive: true,
              lastUpdated: new Date().toISOString(),
              current: {
                avgPrice: latestPrice,
                weekChange: `${parseFloat(weekChange) >= 0 ? "+" : ""}${weekChange}%`,
                dataPoints: prices.length,
              },
              prices,
              spread: {
                auctionPrice: 10300,
                wholesalePrice: latestPrice,
                spreadPct: Math.round((latestPrice / 10300 - 1) * 1000) / 10,
              },
            });
          }
        } catch { /* parse error */ }
      }
    }
  } catch (e) {
    console.error("KAMIS Galchi API error:", e);
  }

  return NextResponse.json(FALLBACK);
}
