import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Try exchangerate-api (free tier)
    const res = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (res.ok) {
      const data = await res.json();
      const krwRate = data.rates?.KRW;
      const jpyRate = data.rates?.JPY;
      const eurRate = data.rates?.EUR;
      const nokRate = data.rates?.NOK;

      if (krwRate) {
        return NextResponse.json({
          usd_krw: Math.round(krwRate * 100) / 100,
          usd_jpy: jpyRate ? Math.round(jpyRate * 100) / 100 : null,
          eur_krw: eurRate ? Math.round((krwRate / eurRate) * 100) / 100 : 1600.50,
          nok_krw: nokRate ? Math.round((krwRate / nokRate) * 100) / 100 : 135.20,
          date: data.time_last_update_utc
            ? new Date(data.time_last_update_utc).toISOString().slice(0, 10).replace(/-/g, '.')
            : new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
          source: 'er-api',
        });
      }
    }

    // Fallback
    return NextResponse.json({
      usd_krw: 1455.75,
      usd_jpy: 152.50,
      eur_krw: 1600.50,
      nok_krw: 135.20,
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      source: 'fallback',
    });
  } catch (err) {
    return NextResponse.json({
      usd_krw: 1455.75,
      usd_jpy: 152.50,
      eur_krw: 1600.50,
      nok_krw: 135.20,
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      source: 'fallback',
    });
  }
}
