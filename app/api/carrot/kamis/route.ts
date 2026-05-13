import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '1y';

  try {
    // Simulated KAMIS Price Data 
    // In production, fetch from: http://www.kamis.or.kr/service/price/xml.do?action=periodProductList&p_cert_key=f3557f2e-fe2e-4609-9fc7-b01492beb192...
    
    const response = {
      timestamp: new Date().toISOString(),
      commodity: "Carrot (당근)",
      market: "Garak Wholesale (가락도매)",
      unit: "20kg",
      currentPrice: 76000,
      historicalTrends: [
        { date: "2026-05-01", price: 74000 },
        { date: "2026-05-02", price: 75500 },
        { date: "2026-05-03", price: 78000 },
        { date: "2026-05-04", price: 76000 },
      ],
      apiStatus: {
        KAMIS: "active"
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch KAMIS data" }, { status: 500 });
  }
}
