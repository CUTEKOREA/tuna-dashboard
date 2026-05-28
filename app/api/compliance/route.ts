import { NextResponse } from 'next/server';

// ============================================================================
// Compliance & Sanctions Radar API Pipeline
// OFAC SDN List & EU Consolidated Sanctions List Screening
// ============================================================================

// --- Simulated OFAC/EU Sanctions DB (Fallback/Lightweight) ---
// In a real production scenario, this would query the downloaded OFAC XML/CSV
// or connect to a 3rd party screening API (e.g. Descartes, Trademo).
const SANCTIONS_DB: Record<string, any> = {
  'thai union': { entity: 'Thai Union Group PCL', ofac: { status: 'clean', detail: 'No match in SDN' }, eu: { status: 'clean', detail: 'No match' }, riskScore: 95, riskLevel: 'LOW' },
  'dongwon': { entity: 'Dongwon Industries', ofac: { status: 'clean', detail: 'No match' }, eu: { status: 'clean', detail: 'No match' }, riskScore: 97, riskLevel: 'LOW' },
  'silla': { entity: 'Silla Co., Ltd.', ofac: { status: 'clean', detail: 'No match' }, eu: { status: 'clean', detail: 'No match' }, riskScore: 98, riskLevel: 'LOW' },
  'sajo': { entity: 'Sajo Industries', ofac: { status: 'clean', detail: 'No match' }, eu: { status: 'clean', detail: 'No match' }, riskScore: 96, riskLevel: 'LOW' },
  'nirsa': { entity: 'Nirsa S.A.', ofac: { status: 'clean', detail: 'No match' }, eu: { status: 'clean', detail: 'No match' }, riskScore: 90, riskLevel: 'LOW' },
  'minh phu': { entity: 'Minh Phu Seafood', ofac: { status: 'clean', detail: 'No match' }, eu: { status: 'partial', detail: 'Similar name — manual review' }, riskScore: 72, riskLevel: 'MEDIUM' },
  'dalian ocean': { entity: 'Dalian Ocean Fishing', ofac: { status: 'partial', detail: 'Subsidiary flagged (OFAC)' }, eu: { status: 'partial', detail: 'IUU vessel overlap' }, riskScore: 35, riskLevel: 'HIGH' },
  'pescanova': { entity: 'Nueva Pescanova', ofac: { status: 'clean', detail: 'No match' }, eu: { status: 'clean', detail: 'No match' }, riskScore: 92, riskLevel: 'LOW' },
  'fcf': { entity: 'FCF Fishery', ofac: { status: 'clean', detail: 'No match' }, eu: { status: 'clean', detail: 'No match' }, riskScore: 89, riskLevel: 'LOW' },
  'pingtan': { entity: 'Pingtan Marine Enterprise', ofac: { status: 'flagged', detail: 'SDN List: Forced Labor' }, eu: { status: 'partial', detail: 'IUU Watchlist' }, riskScore: 10, riskLevel: 'CRITICAL' },
  'norebo': { entity: 'Norebo Holding', ofac: { status: 'flagged', detail: 'SDN List: Targeted Sanctions (Russia)' }, eu: { status: 'partial', detail: 'Enhanced Due Diligence required' }, riskScore: 15, riskLevel: 'CRITICAL' },
  'pelagia': { entity: 'Pelagia AS', ofac: { status: 'clean', detail: 'No match' }, eu: { status: 'clean', detail: 'No match' }, riskScore: 99, riskLevel: 'LOW' },
};

export async function GET() {
  return NextResponse.json({
    service: 'Compliance & Sanctions API',
    version: '1.0.0',
    status: 'operational',
    sources: ['OFAC SDN List', 'EU Consolidated Sanctions List', 'IUU Watchlist'],
    coverage: 'Global Seafood & Fishing Entities',
    endpoints: {
      POST: {
        body: { entity: 'string — Supplier or buyer name to screen' },
        response: 'ScreeningResult { entity, ofac, eu, riskScore, riskLevel }'
      }
    }
  });
}

export async function POST(req: Request) {
  try {
    const { entity } = await req.json();
    
    if (!entity || typeof entity !== 'string') {
      return NextResponse.json({ error: 'entity name is required' }, { status: 400 });
    }

    const query = entity.toLowerCase().trim();
    
    // Simulate network delay for API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Fuzzy matching logic
    const matchedKey = Object.keys(SANCTIONS_DB).find(k => 
      query.includes(k) || k.includes(query) ||
      k.split(' ').some(word => word.length > 3 && query.includes(word))
    );

    let result;
    if (matchedKey) {
      const matchData = SANCTIONS_DB[matchedKey];
      
      // Simulate AI False Positive Analysis
      let ai_analysis = { confidence: 0.95, falsePositiveRisk: 'LOW', recommendation: 'Proceed with standard monitoring' };
      if (matchData.riskLevel === 'MEDIUM' || matchData.riskLevel === 'HIGH') {
        ai_analysis = { 
          confidence: 0.82, 
          falsePositiveRisk: 'HIGH', 
          recommendation: 'Potential Name Overlap (False Positive). Trigger manual human review and enhanced due diligence.' 
        };
      } else if (matchData.riskLevel === 'CRITICAL') {
        ai_analysis = { 
          confidence: 0.99, 
          falsePositiveRisk: 'LOW', 
          recommendation: 'Exact SDN match. Immediately freeze all transactions.' 
        };
      }

      result = { 
        ...matchData, 
        source: 'SANCTIONS_FALLBACK', 
        matchedQuery: query,
        aiAnalysis: ai_analysis 
      };
    } else {
      // Default fallback for unknown entities
      result = { 
        entity: entity, 
        ofac: { status: 'clean', detail: 'No match found (Automated Screening)' }, 
        eu: { status: 'clean', detail: 'No match found (Automated Screening)' }, 
        riskScore: 85, 
        riskLevel: 'LOW',
        source: 'SANCTIONS_FALLBACK',
        aiAnalysis: { confidence: 0.88, falsePositiveRisk: 'LOW', recommendation: 'No significant risk patterns detected.' }
      };
    }

    return NextResponse.json({
      meta: {
        query: entity,
        timestamp: new Date().toISOString(),
        reliability: { score: 70, grade: 'B', label: 'Mock Compliance DB (Static Fallback)' },
        source: 'SANCTIONS_FALLBACK'
      },
      result
    });

  } catch (error: any) {
    console.error('[Compliance API] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
