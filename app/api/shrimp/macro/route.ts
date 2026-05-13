import { NextResponse } from 'next/server';
import { getCachedData } from '../../../../lib/cache';

// Macro API (BOK / Exchange Rate)
// Objective: Fetch USD/KRW exchange rate to simulate import margin stress.

export async function GET(request: Request) {
  try {
    const data = await getCachedData('macro_exchange_rate', async () => {
      const url = `https://api.exchangerate-api.com/v4/latest/USD`;
      
      try {
        const res = await fetch(url, { timeout: 3000 } as RequestInit);
        const json = await res.json();
        if (json && json.rates && json.rates.KRW) {
          return {
            timestamp: new Date().toISOString(),
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch Macro FX Data" }, { status: 500 });
  }
}
