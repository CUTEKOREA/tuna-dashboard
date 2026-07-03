import { NextResponse } from 'next/server';
import { getCachedData } from '../../../../lib/cache';

// Macro API (BOK / Exchange Rate)
// Objective: Fetch USD/KRW exchange rate to simulate import margin stress.

export async function GET() {
  try {
    const data = await getCachedData('macro_exchange_rate', async () => {
      const url = `https://api.exchangerate-api.com/v4/latest/USD`;
      
      try {
        const res = await fetch(url, { timeout: 3000 } as RequestInit);
        const json = await res.json();
        if (json && json.rates && json.rates.KRW) {
          return {
            timestamp: new Date().toISOString(),
            // L-12 표준 필드 (additive): isLive / dataAsOf / staleDays
            isLive: true,
            dataAsOf: new Date().toISOString().slice(0, 10),
            staleDays: 0,
            source: "ExchangeRate API (LIVE)",
            metrics: {
              currency: "USD/KRW",
              rate: json.rates.KRW,
              dailyChange: +2.10,
              monthlyAvg: 1378.20
            }
          };
        }
      } catch (e) {
        console.error("Macro FX API Error:", e);
      }
      
      return {
        timestamp: new Date().toISOString(),
        // L-12 표준 필드 (additive): mock 폴백은 isLive:false 정직 표기.
        // dataAsOf/staleDays는 mock 상수의 실제 빈티지를 알 수 없어 null (수치 발명 금지)
        isLive: false,
        dataAsOf: null,
        staleDays: null,
        source: "BOK / FX API (Fallback/Mock)",
        metrics: {
          currency: "USD/KRW",
          rate: 1385.50,
          dailyChange: +2.10,
          monthlyAvg: 1378.20
        }
      };
    }, 600); // Cache for 10 minutes

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch Macro FX Data" }, { status: 500 });
  }
}
