import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

  // Method 1: Try Yahoo Finance for Brent Crude (BZ=F) as MGO proxy
  try {
    const res = await fetch(
      'https://query2.finance.yahoo.com/v8/finance/chart/BZ%3DF?range=5d&interval=1d',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        next: { revalidate: 3600 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const result = data?.chart?.result?.[0];
      const closes: number[] = result?.indicators?.quote?.[0]?.close || [];
      const validCloses = closes.filter((c: number | null) => c !== null && c > 0);

      if (validCloses.length >= 1) {
        const latestClose = validCloses[validCloses.length - 1];
        const previousClose = validCloses.length > 1 ? validCloses[validCloses.length - 2] : latestClose;

        // MGO typically trades at ~15-20% premium over Brent crude
        // 1 Metric Ton = ~7.45 barrels
        const mgoMultiplier = 1.18 * 7.45;
        const mgoPrice = Math.round(latestClose * mgoMultiplier * 100) / 100;
        const mgoPrev = Math.round(previousClose * mgoMultiplier * 100) / 100;
        const change = Math.round((mgoPrice - mgoPrev) * 100) / 100;

        return NextResponse.json({
          price: mgoPrice,
          change: change,
          date: today,
          source: 'yahoo-finance-brent',
          status: 'live',
        });
      }
    }
  } catch (err) {
    console.error('Yahoo Finance fetch failed:', err);
  }

  // Method 2: Try ExchangeRate.host commodities endpoint (backup)
  try {
    const res = await fetch(
      'https://api.exchangerate.host/latest?base=USD&symbols=BRENTOIL',
      { next: { revalidate: 3600 } }
    );

    if (res.ok) {
      const data = await res.json();
      const brent = data?.rates?.BRENTOIL;

      if (brent && brent > 0) {
        const mgoPrice = Math.round(brent * 1.18 * 7.45 * 100) / 100;
        return NextResponse.json({
          price: mgoPrice,
          change: 0,
          date: today,
          source: 'exchangerate-host',
          status: 'live',
        });
      }
    }
  } catch (err) {
    console.error('ExchangeRate.host fetch failed:', err);
  }

  // Method 3: Fallback to hardcoded recent price
  return NextResponse.json({
    price: 2050.00,
    change: 1200,
    date: today,
    source: 'fallback',
    status: 'cached',
  });
}
