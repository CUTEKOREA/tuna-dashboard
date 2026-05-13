import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    // Simulated CBOT Corn Futures Data
    // In production, fetch from CME/CBOT API or financial data provider
    
    // Simulate real-time price fluctuation around the critical $300 threshold
    const basePrice = 295;
    const currentPrice = basePrice + Math.random() * 10 - 2; // Returns a value between 293 and 303
    
    const response = {
      timestamp: new Date().toISOString(),
      commodity: "Corn Futures (ZCc1)",
      exchange: "CBOT",
      unit: "USd/bu",
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      thresholdAlert: currentPrice >= 300,
      historicalTrends: [
        { date: "2026-05-01", price: 280.50 },
        { date: "2026-05-02", price: 285.20 },
        { date: "2026-05-03", price: 292.00 },
        { date: "2026-05-04", price: 298.50 },
      ],
      apiStatus: {
        CBOT: "active"
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch CBOT data" }, { status: 500 });
  }
}
