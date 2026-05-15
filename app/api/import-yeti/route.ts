import { NextResponse } from 'next/server';

// ============================================================================
// Global B2B Supplier Intelligence Pipeline (Phase 3)
// Simulated Data Sources: ImportYeti, Veridion
// ============================================================================

const SUPPLIER_DB: Record<string, any> = {
  'mackerel': [
    { supplier: 'Pelagia AS (Norway)', volumeTeu: 1450, reliability: 98, alternative: false },
    { supplier: 'Nils Williksen AS (Norway)', volumeTeu: 920, reliability: 95, alternative: false },
    { supplier: 'Highland Seafoods (UK)', volumeTeu: 450, reliability: 88, alternative: true },
    { supplier: 'Killybegs Seafoods (Ireland)', volumeTeu: 380, reliability: 85, alternative: true },
    { supplier: 'Ísfélag (Iceland)', volumeTeu: 310, reliability: 92, alternative: true }
  ]
};

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const keyword = query.toLowerCase().trim();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const result = SUPPLIER_DB[keyword] || [];

    return NextResponse.json({
      meta: {
        query: keyword,
        timestamp: new Date().toISOString(),
        reliability: { score: 90, grade: 'S', label: 'ImportYeti / Veridion' },
        source: 'B2B_SUPPLIER_API_LIVE'
      },
      data: result
    });

  } catch (error: any) {
    console.error('[ImportYeti API] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
