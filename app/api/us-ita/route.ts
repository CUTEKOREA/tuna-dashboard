import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// U.S. ITA Data Services API Pipeline
// POST /api/us-ita — Fetch U.S. trade events, market intelligence, and tariff info
// GET  /api/us-ita — Health check
// Docs: https://developer.trade.gov/
// Auth: ITA_API_KEY (Bearer or Query parameter)

const ITA_BASE = 'https://api.trade.gov';
const ITA_TIMEOUT = 10000;

// Curated Fallback: Market Intelligence for key seafood markets
const FALLBACK_DATA: Record<string, any> = {
  'seafood': [
    { title: 'Global Seafood Market Overview', date: '2023-11-15', url: 'https://trade.gov', tags: ['Seafood', 'Export'] },
    { title: 'U.S. Seafood Import Requirements (FDA)', date: '2024-01-10', url: 'https://trade.gov', tags: ['FDA', 'Compliance', 'Seafood'] }
  ],
  'korea': [
    { title: 'South Korea Market Intelligence: Food & Beverage', date: '2023-09-05', url: 'https://trade.gov', tags: ['South Korea', 'F&B'] },
    { title: 'KORUS FTA Tariff Phase-outs', date: '2022-08-20', url: 'https://trade.gov', tags: ['FTA', 'South Korea'] }
  ]
};

export async function GET() {
  const hasKey = !!process.env.ITA_API_KEY;
  return NextResponse.json({
    service: 'U.S. ITA Data Services Pipeline',
    status: hasKey ? 'operational' : 'fallback_only',
    tokenConfigured: hasKey,
    fallbackKeywords: Object.keys(FALLBACK_DATA)
  });
}

export async function POST(req: Request) {
  try {
    const { keyword = 'seafood', endpoint = 'market_intelligence' } = await req.json();
    let source: 'ITA_LIVE' | 'ITA_FALLBACK' = 'ITA_FALLBACK';
    
    // 1) Try Live API
    if (process.env.ITA_API_KEY) {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), ITA_TIMEOUT);
        
        const url = `${ITA_BASE}/gateway/v1/${endpoint}/search?q=${encodeURIComponent(keyword)}&api_key=${process.env.ITA_API_KEY}`;
        
        const resp = await fetch(url, { signal: ctrl.signal });
        clearTimeout(tid);

        if (resp.ok) {
          const liveData = await resp.json();
          source = 'ITA_LIVE';
          return NextResponse.json({
            meta: { source, keyword, endpoint, timestamp: new Date().toISOString(), reliability: { score: 98, grade: 'S' } },
            data: liveData
          });
        }
      } catch (e: any) {
        console.warn(`[US ITA API] Failed to fetch live data: ${e.message}`);
      }
    }

    // 2) Fallback
    const searchKey = keyword.toLowerCase();
    let fallback = FALLBACK_DATA[searchKey];
    
    // Fuzzy match
    if (!fallback) {
      const match = Object.keys(FALLBACK_DATA).find(k => searchKey.includes(k) || k.includes(searchKey));
      if (match) fallback = FALLBACK_DATA[match];
    }

    if (fallback) {
      return NextResponse.json({
        meta: { 
          source, 
          keyword,
          timestamp: new Date().toISOString(), 
          reliability: { score: 85, grade: 'A', label: 'ITA Curated Knowledge Base' },
          note: 'Register ITA_API_KEY for real-time market intelligence searches'
        },
        data: fallback
      });
    }

    return NextResponse.json({ error: `No U.S. ITA fallback data available for keyword: ${keyword}` }, { status: 404 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
