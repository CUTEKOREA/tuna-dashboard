import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const SEAFOOD_COMPANIES = [
  { name: '신라교역', symbol: '004970.KS' },
  { name: '동원산업', symbol: '006040.KS' },
  { name: '사조산업', symbol: '007160.KS' },
  { name: '한성기업', symbol: '003680.KS' },
  { name: '동원수산', symbol: '030720.KS' },
  { name: 'CJ씨푸드', symbol: '011150.KS' },
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
