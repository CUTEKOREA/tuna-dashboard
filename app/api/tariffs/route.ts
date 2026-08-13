import { NextResponse } from 'next/server';
import { hasEnv } from '../_shared/env';

export const dynamic = 'force-dynamic';

// Tariffs.io API Pipeline — Global Tariff Stacking & Landed Cost
// POST /api/tariffs — Fetch complex tariff stacking (Section 301/232)
// GET  /api/tariffs — Health check
// Docs: https://tariffs.io/docs
// Auth: TARIFFS_API_KEY

const TARIFFS_BASE = 'https://api.tariffs.io/v1';
const TARIFFS_TIMEOUT = 10000;

// Curated Fallback: Tariff models for key seafood/processing scenarios
const FALLBACK_DATA: Record<string, any> = {
  'US_CN_0304': { 
    origin: 'CN', destination: 'US', hsCode: '0304',
    mfnDuty: 0.0, 
    additionalDuties: [{ type: 'Section 301', rate: 25.0 }],
    totalDutyRate: 25.0,
    impact: 'High impact due to Section 301. Sourcing from Vietnam or Indonesia recommended.'
  },
  'US_KR_1604': { 
    origin: 'KR', destination: 'US', hsCode: '1604',
    mfnDuty: 6.0, 
    additionalDuties: [{ type: 'KORUS FTA', rate: -6.0 }],
    totalDutyRate: 0.0,
    impact: 'Duty-free access under KORUS FTA.'
  },
  'EU_KR_0302': { 
    origin: 'KR', destination: 'EU', hsCode: '0302',
    mfnDuty: 15.0, 
    additionalDuties: [{ type: 'Korea-EU FTA', rate: -15.0 }],
    totalDutyRate: 0.0,
    impact: 'Duty-free access under Korea-EU FTA. TRQ may apply.'
  },
  'KR_NO_0303': { 
    origin: 'NO', destination: 'KR', hsCode: '0303',
    mfnDuty: 10.0, 
    additionalDuties: [{ type: 'Korea-EFTA', rate: -10.0 }],
    totalDutyRate: 0.0,
    impact: 'Duty-free access under Korea-EFTA FTA. Origin certificate required.'
  },
  'KR_CN_0304': { 
    origin: 'CN', destination: 'KR', hsCode: '0304',
    mfnDuty: 10.0, 
    additionalDuties: [{ type: 'Korea-China FTA', rate: -10.0 }],
    totalDutyRate: 0.0,
    impact: 'Duty-free access under Korea-China FTA.'
  }
};

export async function GET() {
  const hasKey = hasEnv('DATA_GO_KR_NEW_KEY');
  return NextResponse.json({
    service: 'Tariffs.io Pipeline',
    status: hasKey ? 'operational' : 'fallback_only',
    tokenConfigured: hasKey,
    fallbackModels: Object.keys(FALLBACK_DATA)
  });
}

export async function POST(req: Request) {
  try {
    const { origin, destination, hsCode } = await req.json();
    if (!origin || !destination || !hsCode) {
      return NextResponse.json({ error: 'origin, destination, and hsCode required' }, { status: 400 });
    }

    const code = hsCode.substring(0, 4);
    let source: 'TARIFFS_LIVE' | 'TARIFFS_FALLBACK' = 'TARIFFS_FALLBACK';
    
    // 1) Try Live API
    if (hasEnv('DATA_GO_KR_NEW_KEY')) {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), TARIFFS_TIMEOUT);
        
        // Example Tariffs.io endpoint
        const url = `${TARIFFS_BASE}/calculate?origin=${origin}&destination=${destination}&hs_code=${hsCode}`;
        const resp = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${process.env.DATA_GO_KR_NEW_KEY}`,
            'Accept': 'application/json'
          },
          signal: ctrl.signal
        });
        clearTimeout(tid);

        if (resp.ok) {
          const liveData = await resp.json();
          source = 'TARIFFS_LIVE';
          return NextResponse.json({
            meta: { source, origin, destination, hsCode, timestamp: new Date().toISOString(), reliability: { score: 95, grade: 'S' } },
            data: liveData
          });
        }
      } catch (e: any) {
        console.warn(`[Tariffs API] Failed to fetch live data: ${e.message}`);
      }
    }

    // 2) Fallback
    const searchKey = `${destination}_${origin}_${code}`; // e.g. US_CN_0304
    const fallback = FALLBACK_DATA[searchKey];

    if (fallback) {
      return NextResponse.json({
        meta: { 
          source, 
          origin, destination, hsCode: code,
          timestamp: new Date().toISOString(), 
          reliability: { score: 85, grade: 'A', label: 'Curated Tariff Models' },
          note: 'Register TARIFFS_API_KEY for dynamic Section 301/232 stacking calculations'
        },
        data: fallback
      });
    }

    return NextResponse.json({ error: `No tariff fallback data available for route: ${searchKey}` }, { status: 404 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
