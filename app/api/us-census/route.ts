import { NextResponse } from 'next/server';

// U.S. Census Bureau International Trade API Pipeline
// POST /api/us-census — Fetch U.S. import/export data for specific HS codes
// GET  /api/us-census — Health check
// Docs: https://www.census.gov/data/developers/data-sets/international-trade.html
// Auth: USCENSUS_API_KEY

const CENSUS_BASE = 'https://api.census.gov/data/timeseries/intltrade';
const CENSUS_TIMEOUT = 10000;

// Top Seafood HS Codes to USA Fallback (2023)
const FALLBACK_DATA: Record<string, any> = {
  '0302': { hsCode: '0302', description: 'Fresh or Chilled Fish', totalImportValue: 1245000000, topSuppliers: ['CL', 'CA', 'NO', 'IS', 'NZ'] },
  '0303': { hsCode: '0303', description: 'Frozen Fish', totalImportValue: 2150000000, topSuppliers: ['CN', 'CL', 'RU', 'ID', 'TW'] },
  '0304': { hsCode: '0304', description: 'Fish Fillets', totalImportValue: 5800000000, topSuppliers: ['CN', 'CL', 'ID', 'VN', 'NO'] },
  '0306': { hsCode: '0306', description: 'Crustaceans (Shrimp/Lobster)', totalImportValue: 9200000000, topSuppliers: ['IN', 'EC', 'ID', 'VN', 'CA'] }
};

export async function GET() {
  const hasKey = !!process.env.USCENSUS_API_KEY;
  return NextResponse.json({
    service: 'U.S. Census Bureau Trade API Pipeline',
    status: hasKey ? 'operational' : 'fallback_only',
    tokenConfigured: hasKey,
    fallbackCoverage: Object.keys(FALLBACK_DATA)
  });
}

export async function POST(req: Request) {
  try {
    const { hsCode, flow = 'imports' } = await req.json();
    if (!hsCode) return NextResponse.json({ error: 'hsCode required (e.g., 0304)' }, { status: 400 });

    const code = hsCode.substring(0, 4);
    let source: 'CENSUS_LIVE' | 'CENSUS_FALLBACK' = 'CENSUS_FALLBACK';
    
    // 1) Try Live API
    if (process.env.USCENSUS_API_KEY) {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), CENSUS_TIMEOUT);
        
        // Example: Fetch imports of HS4 from the world for the latest month
        const endpoint = flow === 'imports' ? 'imports/hs' : 'exports/hs';
        const url = `${CENSUS_BASE}/${endpoint}?get=GEN_VAL_MO,I_COMMODITY_SDESC&I_COMMODITY=${code}&time=2023-12&key=${process.env.USCENSUS_API_KEY}`;
        
        const resp = await fetch(url, { signal: ctrl.signal });
        clearTimeout(tid);

        if (resp.ok) {
          const liveData = await resp.json();
          source = 'CENSUS_LIVE';
          return NextResponse.json({
            meta: { source, hsCode: code, flow, timestamp: new Date().toISOString(), reliability: { score: 98, grade: 'S', label: 'U.S. Govt API' } },
            data: liveData
          });
        }
      } catch (e: any) {
        console.warn(`[US CENSUS API] Failed to fetch live data: ${e.message}`);
      }
    }

    // 2) Fallback
    const fallback = FALLBACK_DATA[code];
    if (fallback) {
      return NextResponse.json({
        meta: { 
          source, 
          hsCode: code,
          timestamp: new Date().toISOString(), 
          reliability: { score: 80, grade: 'A', label: 'U.S. Census Fallback DB (2023)' },
          note: 'Register USCENSUS_API_KEY for live monthly U.S. trade data'
        },
        data: fallback
      });
    }

    return NextResponse.json({ error: `No U.S. Census fallback data available for HS: ${code}` }, { status: 404 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
