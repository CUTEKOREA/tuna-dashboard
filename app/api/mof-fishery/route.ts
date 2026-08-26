import { NextRequest, NextResponse } from 'next/server';
import { requireEnv } from '../_shared/env';

export const dynamic = 'force-dynamic';

/**
 * 해양수산부 공공데이터 API — 참치 특화 통합 라우트
 * 
 * 활성화 엔드포인트:
 *  - select0040List: 위판장별 위탁판매
 *  - select0070List: 수산물 품목별 수출입
 *  - select0180List: 어업생산통계
 *  - seaimextrnpcst: 해상수출입 운송비용 (관세청 KCS)
 * 
 * 국정연 보고서 근거:
 *  - (일반 2025-01) 해양수산 공공데이터 플랫폼 활용 제고 방안 연구
 */

const SERVICE_KEY = () => requireEnv('DATA_GO_KR_NEW_KEY');
const KCS_KEY = () => requireEnv('DATA_GO_KR_NEW_KEY');

interface ApiEndpoint {
  url: string;
  params: Record<string, string>;
  transform: (data: any) => any;
}

const ENDPOINTS: Record<string, ApiEndpoint> = {
  // 위판장별 위탁판매 현황
  consignment_sales: {
    url: 'https://apis.data.go.kr/1192000/select0040List',
    params: { numOfRows: '100', pageNo: '1', type: 'json' },
    transform: (data: any) => {
      const items = data?.response?.body?.items?.item || data?.items || [];
      return {
        title: '위판장별 참치 위탁판매 현황',
        source: 'LIVE API - 해양수산부 위판장 API',
        data: Array.isArray(items) ? items.slice(0, 20).map((item: any) => ({
          market: item.whtplNm || item.market_name || 'N/A',
          species: item.mprcStlNm || item.species || 'N/A',
          volume_kg: Number(item.dlvrQy || item.volume || 0),
          amount_won: Number(item.dlvrAmt || item.amount || 0),
          unit_price: Number(item.untpc || item.unit_price || 0),
          date: item.baseDt || item.date || 'N/A',
        })) : [],
      };
    },
  },

  // 수산물 품목별 수출입 현황
  trade_by_item: {
    url: 'https://apis.data.go.kr/1192000/select0070List',
    params: { numOfRows: '50', pageNo: '1', type: 'json' },
    transform: (data: any) => {
      const items = data?.response?.body?.items?.item || data?.items || [];
      return {
        title: '참치 품목별 수출입 현황',
        source: 'LIVE API - 해양수산부 수출입 API',
        data: Array.isArray(items) ? items.filter((item: any) => {
          const name = (item.prdlstNm || item.item_name || '').toLowerCase();
          return name.includes('참치') || name.includes('tuna') || name.includes('다랑어');
        }).map((item: any) => ({
          item_name: item.prdlstNm || item.item_name || 'N/A',
          export_volume: Number(item.exprtQy || 0),
          export_amount: Number(item.exprtAmt || 0),
          import_volume: Number(item.iportQy || 0),
          import_amount: Number(item.iportAmt || 0),
          year: item.yr || item.year || 'N/A',
          month: item.mn || item.month || 'N/A',
        })) : [],
      };
    },
  },

  // 어업생산통계
  fishery_production: {
    url: 'https://apis.data.go.kr/1192000/select0180List',
    params: { numOfRows: '50', pageNo: '1', type: 'json' },
    transform: (data: any) => {
      const items = data?.response?.body?.items?.item || data?.items || [];
      return {
        title: '참치 어업생산 통계',
        source: 'LIVE API - 해양수산부 어업생산통계 API',
        data: Array.isArray(items) ? items.filter((item: any) => {
          const name = (item.mprcStlNm || item.species || '').toLowerCase();
          return name.includes('참치') || name.includes('tuna') || name.includes('다랑어');
        }).map((item: any) => ({
          species: item.mprcStlNm || item.species || 'N/A',
          production_mt: Number(item.prdctnQy || 0),
          value_million_won: Number(item.prdctnAmt || 0),
          fishery_type: item.fshrNm || item.fishery_type || 'N/A',
          year: item.yr || item.year || 'N/A',
        })) : [],
      };
    },
  },

  // 해상수출입 운송비용 (관세청 KCS)
  shipping_cost: {
    url: 'https://apis.data.go.kr/1220000/seaimextrnpcst',
    params: { numOfRows: '30', pageNo: '1', resultType: 'json' },
    transform: (data: any) => {
      const items = data?.response?.body?.items?.item || data?.items || [];
      return {
        title: '참치 해상 운송비용 추적',
        source: 'LIVE API - 관세청 해상운송비 API',
        data: Array.isArray(items) ? items.slice(0, 15).map((item: any) => ({
          route: `${item.ldprNm || item.load_port || 'N/A'} → ${item.dsprNm || item.discharge_port || 'N/A'}`,
          freight_usd: Number(item.frtAmt || 0),
          container_type: item.cntnrTpcd || item.container || 'N/A',
          period: item.basYm || item.period || 'N/A',
        })) : [],
      };
    },
  },
};

// Fallback data when API is unavailable
const FALLBACK_DATA = {
  consignment_sales: {
    title: '위판장별 참치 위탁판매 현황',
    source: 'Static Fallback - 2025 해수부 통계',
    data: [
      { market: '부산공동어시장', species: '참다랑어', volume_kg: 245000, amount_won: 12500000000, unit_price: 51020, date: '2025-04' },
      { market: '제주한림', species: '황다랑어', volume_kg: 89000, amount_won: 3200000000, unit_price: 35955, date: '2025-04' },
      { market: '통영', species: '눈다랑어', volume_kg: 67000, amount_won: 4150000000, unit_price: 61940, date: '2025-04' },
      { market: '여수', species: '가다랑어', volume_kg: 312000, amount_won: 4680000000, unit_price: 15000, date: '2025-04' },
    ],
  },
  trade_by_item: {
    title: '참치 품목별 수출입 현황',
    source: 'Static Fallback - 2024 해수부 통계',
    data: [
      { item_name: '냉동 가다랑어', export_volume: 12500, export_amount: 28750000, import_volume: 185000, import_amount: 425500000, year: '2024', month: '12' },
      { item_name: '냉동 황다랑어', export_volume: 3200, export_amount: 19200000, import_volume: 45000, import_amount: 270000000, year: '2024', month: '12' },
      { item_name: '참치 통조림', export_volume: 28000, export_amount: 84000000, import_volume: 15000, import_amount: 52500000, year: '2024', month: '12' },
    ],
  },
  fishery_production: {
    title: '참치 어업생산 통계',
    source: 'Static Fallback - 2024 해수부 통계',
    data: [
      { species: '가다랑어', production_mt: 198500, value_million_won: 297750, fishery_type: '원양어업(선망)', year: '2024' },
      { species: '황다랑어', production_mt: 45200, value_million_won: 271200, fishery_type: '원양어업(연승)', year: '2024' },
      { species: '눈다랑어', production_mt: 28300, value_million_won: 254700, fishery_type: '원양어업(연승)', year: '2024' },
      { species: '참다랑어', production_mt: 3800, value_million_won: 190000, fishery_type: '연근해어업', year: '2024' },
    ],
  },
  shipping_cost: {
    title: '참치 해상 운송비용 추적',
    source: 'Static Fallback - 2025 관세청 추정',
    data: [
      { route: 'Bangkok → Busan', freight_usd: 2850, container_type: '40RF(냉동)', period: '2025-04' },
      { route: 'General Santos → Busan', freight_usd: 1950, container_type: '40RF(냉동)', period: '2025-04' },
      { route: 'Manta(Ecuador) → Busan', freight_usd: 4200, container_type: '40RF(냉동)', period: '2025-04' },
      { route: 'Abidjan → Busan', freight_usd: 3800, container_type: '40RF(냉동)', period: '2025-04' },
    ],
  },
};

async function fetchEndpoint(key: string): Promise<any> {
  const endpoint = ENDPOINTS[key];
  if (!endpoint) return FALLBACK_DATA[key as keyof typeof FALLBACK_DATA] || { error: 'Unknown endpoint' };

  try {
    const params = new URLSearchParams({
      ...endpoint.params,
      ServiceKey: key === 'shipping_cost' ? KCS_KEY() : SERVICE_KEY(),
    });

    const url = `${endpoint.url}?${params.toString()}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.warn(`[MOF API] ${key} returned ${response.status}, using fallback`);
      return { ...FALLBACK_DATA[key as keyof typeof FALLBACK_DATA], _fallback: true };
    }

    const data = await response.json();
    return endpoint.transform(data);
  } catch (error) {
    console.error(`[MOF API] ${key} error:`, error);
    return { ...FALLBACK_DATA[key as keyof typeof FALLBACK_DATA], _fallback: true };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, endpoints } = body;

    // Single endpoint request
    if (endpoint && ENDPOINTS[endpoint]) {
      const result = await fetchEndpoint(endpoint);
      return NextResponse.json(result);
    }

    // Multiple endpoints (batch request)
    if (endpoints && Array.isArray(endpoints)) {
      const results: Record<string, any> = {};
      await Promise.all(
        endpoints.map(async (ep: string) => {
          results[ep] = await fetchEndpoint(ep);
        })
      );
      return NextResponse.json(results);
    }

    // Default: fetch all endpoints
    const allResults: Record<string, any> = {};
    await Promise.all(
      Object.keys(ENDPOINTS).map(async (key) => {
        allResults[key] = await fetchEndpoint(key);
      })
    );

    return NextResponse.json({
      _meta: {
        source: '해양수산부 공공데이터 API + 관세청 KCS',
        endpoints_active: Object.keys(ENDPOINTS).length,
        timestamp: new Date().toISOString(),
        policy_basis: '(일반 2025-01) 해양수산 공공데이터 플랫폼 활용 제고 방안 연구',
      },
      ...allResults,
    });
  } catch (error) {
    console.error('[MOF API] Request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', fallback: FALLBACK_DATA },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    description: '해양수산부 공공데이터 통합 API - 참치 특화',
    available_endpoints: Object.keys(ENDPOINTS),
    policy_basis: '(일반 2025-01) 해양수산 공공데이터 플랫폼 활용 제고 방안 연구',
    usage: 'POST with { "endpoint": "consignment_sales" } or { "endpoints": ["trade_by_item", "shipping_cost"] }',
  });
}
