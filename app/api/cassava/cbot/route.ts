import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    // Static CBOT Corn Futures snapshot (실시간 API 미연동)
    // A-01: Math.random 기반 가짜 실시간 변동 생성 금지 — 정적 기준가만 반환
    const currentPrice = 298.5; // historicalTrends 마지막 관측치(2026-05-04)와 일치하는 정적 스냅샷

    const response = {
      isLive: false,
      asOf: '2026-05-04',
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
        CBOT: "static" // 실시간 미연동 — L-09 정직 표기
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch CBOT data" }, { status: 500 });
  }
}
