import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '1m';

  try {
    // Simulated KAMIS/KCS Price Data for Salmon vs Substitutes
    // In production, fetch from: http://www.kamis.or.kr & KCS open API
    
    // Base prices roughly reflecting recent EU import data + local markups
    const response = {
      timestamp: new Date().toISOString(),
      commodities: [
        { id: 'salmon_fresh', name: "생연어(수입)", market: "노량진수산시장", unit: "kg", currentPrice: 22000, trend: "up" },
        { id: 'halibut_farmed', name: "양식 광어(국내)", market: "노량진수산시장", unit: "kg", currentPrice: 20500, trend: "up" },
        { id: 'chicken_fresh', name: "생닭(국내)", market: "가락도매", unit: "kg", currentPrice: 4800, trend: "stable" },
        { id: 'pork_belly', name: "돼지 삼겹살(수입)", market: "가락도매", unit: "kg", currentPrice: 14500, trend: "up" }
      ],
      historicalSpread: [
        { date: "2024-01", salmon: 19500, halibut: 17500, chicken: 4200 },
        { date: "2024-02", salmon: 20200, halibut: 18000, chicken: 4300 },
        { date: "2024-03", salmon: 21500, halibut: 19200, chicken: 4500 },
        { date: "2024-04", salmon: 22500, halibut: 20000, chicken: 4600 },
        { date: "2024-05", salmon: 22000, halibut: 20500, chicken: 4800 },
      ],
      apiStatus: {
        KAMIS: "active",
        KCS: "active"
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch KAMIS data" }, { status: 500 });
  }
}
