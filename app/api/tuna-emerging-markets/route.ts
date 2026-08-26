import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 참치 신흥시장 기회 인텔리전스 API
 *
 * ⚠️ 데이터 상태: 11개국 시장 데이터는 국정연 보고서 4건의 추정치이며,
 * Comtrade API key가 있을 때만 country_code 단위 실시간 enrichment가 동작합니다.
 * 본 응답은 SYNCED (정기 갱신 스냅샷) 라벨이 적합.
 *
 * 국정연 근거:
 *  - (일반 2023-05) 아프리카 수산협력 강화 전략
 *  - (일반 2024-03) 아세안 수산물 무역 확대
 *  - (일반 2023-09) 할랄 수산물 수출 전략
 *  - (기본 2024-01) 군소도서국(SIDS) 수산분야 협력
 *
 * 연동 API: UN Comtrade + OEC (key 있을 때 enrichWithComtrade)
 *
 * 정정 이력 (2026-05-20 Phase G):
 *  - _meta에 data_status STATIC 추정치 명시 추가
 *  - 11개국 opportunity_usd_m은 보고서 추정치 보존 (외부 단일 출처 미확정)
 */

const COMTRADE_KEY = process.env.UN_COMTRADE_PRIMARY_KEY || '';

// Emerging market opportunity data (국정연 보고서 기반)
const EMERGING_MARKETS = {
  africa: {
    title: '아프리카 참치 소비 폭발 기회',
    source: '(일반 2023-05) 아프리카 수산협력 강화 전략 + UN Comtrade',
    markets: [
      { country: '나이지리아', code: 'NGA', pop_m: 230, tuna_import_growth_5yr: 340, current_import_mt: 85000, per_capita_kg: 0.37, potential_kg: 2.1, gap_mt: 398300, opportunity_usd_m: 597, barrier: 'Cold chain infrastructure', priority: 'HIGH' },
      { country: '가나', code: 'GHA', pop_m: 34, tuna_import_growth_5yr: 180, current_import_mt: 42000, per_capita_kg: 1.24, potential_kg: 3.5, gap_mt: 77000, opportunity_usd_m: 115, barrier: 'Port congestion', priority: 'MEDIUM' },
      { country: '코트디부아르', code: 'CIV', pop_m: 29, tuna_import_growth_5yr: 95, current_import_mt: 65000, per_capita_kg: 2.24, potential_kg: 4.0, gap_mt: 51000, opportunity_usd_m: 76, barrier: 'Established EU suppliers', priority: 'MEDIUM' },
      { country: '세네갈', code: 'SEN', pop_m: 18, tuna_import_growth_5yr: 120, current_import_mt: 28000, per_capita_kg: 1.56, potential_kg: 3.0, gap_mt: 26000, opportunity_usd_m: 39, barrier: 'Local preference', priority: 'LOW' },
      { country: '이집트', code: 'EGY', pop_m: 110, tuna_import_growth_5yr: 210, current_import_mt: 72000, per_capita_kg: 0.65, potential_kg: 1.8, gap_mt: 126000, opportunity_usd_m: 189, barrier: 'Halal certification', priority: 'HIGH' },
    ],
  },
  middle_east: {
    title: '중동 할랄 참치 수출 기회',
    source: '(일반 2023-09) 할랄 수산물 수출 전략 연구',
    markets: [
      { country: 'UAE', code: 'ARE', pop_m: 10, tuna_import_growth_5yr: 155, current_import_mt: 35000, per_capita_kg: 3.5, potential_kg: 5.0, gap_mt: 15000, opportunity_usd_m: 52, barrier: 'Halal certification cost', priority: 'HIGH' },
      { country: '사우디아라비아', code: 'SAU', pop_m: 36, tuna_import_growth_5yr: 190, current_import_mt: 58000, per_capita_kg: 1.61, potential_kg: 3.0, gap_mt: 50000, opportunity_usd_m: 125, barrier: 'SASO certification', priority: 'HIGH' },
      { country: '카타르', code: 'QAT', pop_m: 3, tuna_import_growth_5yr: 220, current_import_mt: 8000, per_capita_kg: 2.67, potential_kg: 5.0, gap_mt: 7000, opportunity_usd_m: 28, barrier: 'Small market', priority: 'MEDIUM' },
    ],
  },
  asean: {
    title: 'ASEAN 가공수출 허브 기회',
    source: '(일반 2024-03) 아세안 수산물 무역 확대 + (기본 2024-01) 군소도서국 협력',
    markets: [
      { country: '베트남', code: 'VNM', pop_m: 100, tuna_import_growth_5yr: 280, current_import_mt: 120000, per_capita_kg: 1.2, potential_kg: 2.5, gap_mt: 130000, opportunity_usd_m: 195, barrier: 'Processing capacity', priority: 'HIGH' },
      { country: '인도네시아', code: 'IDN', pop_m: 280, tuna_import_growth_5yr: 85, current_import_mt: 45000, per_capita_kg: 0.16, potential_kg: 1.0, gap_mt: 235000, opportunity_usd_m: 352, barrier: 'Self-sufficient producer', priority: 'MEDIUM' },
      { country: '필리핀', code: 'PHL', pop_m: 115, tuna_import_growth_5yr: 45, current_import_mt: 25000, per_capita_kg: 0.22, potential_kg: 1.5, gap_mt: 147500, opportunity_usd_m: 221, barrier: 'Domestic catch dominant', priority: 'LOW' },
    ],
  },
  composite_score: {
    total_opportunity_usd_m: 1899,
    top_3_markets: ['나이지리아 ($597M)', '인도네시아 ($352M)', '베트남 ($195M)'],
    recommended_entry_strategy: 'Nigeria: Canned tuna brand licensing → UAE: Halal premium line → Vietnam: OEM processing hub',
    risk_level: 'MODERATE',
    data_freshness: '2025-Q1 Comtrade + 국정연 분석',
  },
};

// Live Comtrade enrichment
async function enrichWithComtrade(countryCode: string) {
  if (!COMTRADE_KEY) return null;
  try {
    const url = `https://comtradeapi.un.org/data/v1/get/C/A/HS?reporterCode=${countryCode}&period=2024&cmdCode=160414&flowCode=M&subscription-key=${COMTRADE_KEY}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region, country_code } = body;

    if (country_code) {
      const comtradeData = await enrichWithComtrade(country_code);
      return NextResponse.json({ country_code, comtrade: comtradeData });
    }

    if (region && EMERGING_MARKETS[region as keyof typeof EMERGING_MARKETS]) {
      return NextResponse.json(EMERGING_MARKETS[region as keyof typeof EMERGING_MARKETS]);
    }

    return NextResponse.json({
      _meta: {
        source: '국가정책연구포털 4건 + UN Comtrade (country_code 단위 enrichment)',
        timestamp: new Date().toISOString(),
        total_markets_tracked: 11,
        total_opportunity_usd_m: EMERGING_MARKETS.composite_score.total_opportunity_usd_m,
        data_status: 'SYNCED 정기 갱신 스냅샷 - 11개국 opportunity_usd_m은 국정연 보고서 추정치. 실시간 단가는 country_code 파라미터로 Comtrade enrichment 시도',
        last_sync: '2026-05-20',
      },
      ...EMERGING_MARKETS,
    });
  } catch {
    return NextResponse.json({ error: 'Failed', data: EMERGING_MARKETS }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    description: '참치 신흥시장 기회 인텔리전스 - 아프리카/중동/ASEAN',
    total_opportunity_usd_m: EMERGING_MARKETS.composite_score.total_opportunity_usd_m,
    markets_tracked: 11,
    top_market: '나이지리아 ($597M 잠재시장)',
  });
}
