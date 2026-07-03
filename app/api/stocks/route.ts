import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

export const dynamic = 'force-dynamic';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const SEAFOOD_COMPANIES = [
  { name: '신라교역', symbol: '004970.KS' },
  { name: '동원산업', symbol: '006040.KS' },
  { name: '사조산업', symbol: '007160.KS' },
  { name: '한성기업', symbol: '003680.KS' },
  { name: 'Thai Union (태국)', symbol: 'TU.BK' },
  { name: 'Mowi (노르웨이 연어)', symbol: 'MOWI.OL' },
  { name: '마루하니치로 (일본)', symbol: '1333.T' },
  { name: 'Nomad Foods (미국)', symbol: 'NOMD' },
];

export async function GET() {
  try {
    const symbols = SEAFOOD_COMPANIES.map(c => c.symbol);
    const quotes = await Promise.allSettled(
      symbols.map(sym => yahooFinance.quote(sym))
    );

    const data = SEAFOOD_COMPANIES.map((company, i) => {
      const result = quotes[i];
      if (result.status === 'fulfilled' && result.value) {
        const q = result.value;
        return {
          name: company.name,
          symbol: company.symbol,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePercent: q.regularMarketChangePercent,
          currency: q.currency || 'KRW',
        };
      }
      return {
        name: company.name,
        symbol: company.symbol,
        error: 'Failed to fetch'
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Stock fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
