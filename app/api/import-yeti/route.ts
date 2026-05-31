import { NextResponse } from 'next/server';

// ============================================================================
// 공급국 집중도 (Supplier Concentration)
// 정직 STATIC: agri_data mackerel_trade_comtrade.csv 실측 (UN Comtrade 2024,
// 한국 냉동고등어 수입 HS 030354 공급국별 수입액). 기존 하드코딩 시뮬 데이터를 실측으로 교체.
// ============================================================================

// 2024 한국 냉동고등어 수입 공급국 (USD M, 비중%). World total ≈ $108.4M.
const SUPPLIER_DB: Record<string, any> = {
  'mackerel': [
    { origin: '노르웨이', valueUsdM: 83.1, share: 76.7, alternative: false },
    { origin: '베트남', valueUsdM: 11.2, share: 10.3, alternative: true },
    { origin: '중국', valueUsdM: 6.3, share: 5.8, alternative: true },
    { origin: '인도네시아', valueUsdM: 2.4, share: 2.2, alternative: true },
    { origin: '네덜란드', valueUsdM: 1.9, share: 1.8, alternative: true },
    { origin: '태국', valueUsdM: 1.4, share: 1.3, alternative: true },
  ],
};

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }
    const keyword = query.toLowerCase().trim();
    const result = SUPPLIER_DB[keyword] || [];

    return NextResponse.json({
      meta: {
        query: keyword,
        reliability: { score: 90, grade: 'A', label: 'UN Comtrade 2024 실측 (HS 030354)' },
        source: 'UN_COMTRADE_2024',
        isLive: false,
      },
      data: result,
    });
  } catch (error: any) {
    console.error('[Supplier API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
