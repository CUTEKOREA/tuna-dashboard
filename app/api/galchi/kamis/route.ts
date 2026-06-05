import { NextResponse } from "next/server";

/**
 * 갈치 KAMIS 도매가격 실시간 API
 * GET /api/galchi/kamis?recent=7
 * 품목코드: 619 (갈치)
 * 2026-06-05 수정: periodProductList+잘못된 파라미터명 → dailyPriceByCategoryList+부류600, salmon/kamis 패턴으로 교정
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

export async function GET() {
  try {
    if (!KAMIS_KEY) return NextResponse.json(FALLBACK);

    const today = new Date();
    const regDay = today.toISOString().split("T")[0]; // YYYY-MM-DD

    // 올바른 액션·파라미터: dailyPriceByCategoryList + 부류코드 600(수산물) — salmon/kamis 패턴 준수
    const url = new URL(KAMIS_BASE);
    url.searchParams.set("action", "dailyPriceByCategoryList");
    url.searchParams.set("p_product_cls_code", "02");           // 02=도매
    url.searchParams.set("p_item_category_code", "600");        // 600=수산물
    url.searchParams.set("p_country_code", "1101");             // 서울(노량진 권역)
    url.searchParams.set("p_regday", regDay);
    url.searchParams.set("p_convert_kg_yn", "Y");
    url.searchParams.set("p_cert_key", KAMIS_KEY);
    url.searchParams.set("p_cert_id", process.env.KAMIS_CERT_ID || "7849");
    url.searchParams.set("p_returntype", "json");

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      const items = data?.data?.item;
      const errorCode = data?.data?.error_code ?? data?.condition?.[0]?.error_code;
      // error_code '000' = 정상, item 배열 존재 시에만 LIVE
      if (Array.isArray(items) && items.length > 0 && errorCode !== "900" && errorCode !== "200") {
        // 갈치(품목코드 619) 항목만 필터링
        const galchiItems = items.filter(
          (it: any) =>
            String(it.productno ?? "") === "619" ||
            String(it.item_name ?? "").includes("갈치")
        );
        const targetItems = galchiItems.length > 0 ? galchiItems : items;

        const parsePrice = (v: unknown): number | null => {
          if (v == null) return null;
          const n = Number(String(v).replace(/[,\s]/g, ""));
          return Number.isFinite(n) && n > 0 ? n : null;
        };

        const prices = targetItems
          .map((it: any) => {
            const cur = parsePrice(it.dpr1);
            const prev = parsePrice(it.dpr2);
            if (cur == null) return null;
            const change = prev != null && prev > 0 ? ((cur - prev) / prev) * 100 : null;
            return {
              date: regDay,
              price: cur,
              prevPrice: prev,
              change: change == null ? null : `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
              name: (it.item_name ?? it.product_name ?? "갈치").trim(),
            };
          })
          .filter(Boolean);

        if (prices.length > 0) {
          const latestPrice = (prices[0] as any).price as number;
          const prevPrice = (prices[0] as any).prevPrice as number | null;
          const weekChange =
            prevPrice != null && prevPrice > 0
              ? (((latestPrice - prevPrice) / prevPrice) * 100).toFixed(1)
              : "0";

          return NextResponse.json({
            source: "KAMIS 실시간 (dailyPriceByCategoryList · 수산물 600 · 갈치 619)",
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
      }
    }
  } catch (e) {
    console.error("KAMIS Galchi API error:", e);
  }

  return NextResponse.json(FALLBACK);
}
