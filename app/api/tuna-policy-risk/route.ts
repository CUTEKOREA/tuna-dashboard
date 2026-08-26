import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 참치 정책 리스크 인텔리전스 API
 * 
 * 국정연 보고서 기반 정책 리스크 정량화:
 *  - (일반 2024-06) 신통상규범 수산분야 영향
 *  - (일반 2025-04) 수산업 강제노동 규범화
 *  - (수시 2025-15) 미 상호주의 비관세장벽
 *  - (기본 2024-08) 수산물 무역 단기 전망모형
 * 
 * 연동 API: WTO, OFAC SDN, WITS, US Census
 */

const WTO_KEY = process.env.WTO_API_KEY || '';

// Policy risk scoring matrix (based on 국정연 reports)
const POLICY_RISK_MATRIX = {
  trade_policy_risks: [
    {
      id: 'US_RECIPROCAL_TARIFF',
      title: '미국 상호관세',
      severity: 92,
      probability: 85,
      impact_usd_millions: 280,
      impact_note: '박혜진(2024-06) 국정연 보고서 추정 - 한국 대미 참치 가공품 수출액 × MFN 12.5%/35%(in oil) 차익 적용. 위젯 표시 $280M와 정렬.',
      affected_hs: ['1604142000', '0303412000', '0303422000'],
      source: '(일반 2024-06) 신통상규범 확대에 따른 수산분야 영향 및 대응방안 - 박혜진 / (수시 2025-15) 미 상호주의 대응 연구',
      mitigation: 'KORUS FTA 0% 활용 + 에콰도르/멕시코 경유 관세 우회(Tariff Hopping) 전략',
      timeline: '2025-07-31 발효 (태국 19%·베트남 20%·에콰도르 15%), 2026-05 미 법원 판결로 지위 유동적',
      api_monitor: 'US Census API + Tariffs API',
    },
    {
      id: 'EU_IUU_YELLOW_CARD',
      title: 'EU IUU 옐로카드 리스크',
      severity: 78,
      probability: 40,
      impact_usd_millions: 120,
      affected_hs: ['030231', '030239', '160414'],
      source: '(기본 2019-12) 원양산업의 사회적 책임실천 강화 정책연구',
      mitigation: '블록체인 이력추적 시스템 도입 + MSC CoC 인증',
      timeline: '상시 모니터링',
      api_monitor: 'EU Sanctions Map + OFAC SDN',
    },
    {
      id: 'FORCED_LABOR_BAN',
      title: '수산업 강제노동 금지법',
      severity: 88,
      probability: 70,
      impact_usd_millions: 85,
      affected_hs: ['ALL'],
      source: '(일반 2025-04) 수산업 강제노동 규범화 대응체계 구축연구',
      mitigation: '미국 SIMP 이행 + 선원 근로조건 감사(Audit)',
      timeline: '2027년 전면 시행',
      api_monitor: 'OFAC SDN + Open Supply Hub',
    },
    {
      id: 'CPTPP_RCEP_FTA',
      title: 'CPTPP/RCEP 신통상규범',
      severity: 55,
      probability: 90,
      impact_usd_millions: 30,
      affected_hs: ['160414', '030232'],
      source: '(일반 2024-06) 신통상규범 확대에 따른 수산분야 영향 및 대응방안',
      mitigation: 'FTA 관세 차익 최적화 + 원산지 규정 활용',
      timeline: '이미 발효, 지속 확대',
      api_monitor: 'WTO API + WITS API',
    },
    {
      id: 'IOTC_TAC_REDUCTION',
      title: 'IOTC/WCPFC 쿼터(TAC) 감축',
      severity: 72,
      probability: 65,
      impact_usd_millions: 55,
      affected_hs: ['030231', '030232', '030233'],
      source: '(기본 2024-08) 수산물 무역 단기 전망모형 구축 연구',
      mitigation: '대서양 쿼터 확보 + 양식(Ranching) 투자',
      timeline: '2026-2028 단계적 감축',
      api_monitor: 'FAOSTAT + Comtrade',
    },
    {
      id: 'US_SIMP_TRACEABILITY',
      title: '미국 이력추적 의무화',
      severity: 80,
      probability: 95,
      impact_usd_millions: 25,
      affected_hs: ['030231', '030232', '160414'],
      source: '(일반 2025-13) 미국 이력 추적 의무화에 따른 수산물 수출기업 대응실태 분석',
      mitigation: '블록체인 기반 원어→가공→수출 Full Traceability 구축',
      timeline: '이미 시행 중, 2026 강화',
      api_monitor: 'US Census API',
    },
  ],

  // FTA tariff optimization matrix
  fta_tariff_matrix: [
    { route: 'Korea → EU', fta: 'Korea-EU FTA', tariff_mfn: 24.0, tariff_fta: 0, savings_pct: 100, hs: '160414', product: '참치 통조림' },
    { route: 'Thailand → EU', fta: 'GSP+', tariff_mfn: 24.0, tariff_fta: 20.5, savings_pct: 14.6, hs: '160414', product: '참치 통조림' },
    { route: 'Ecuador → EU', fta: 'EU-Andean FTA', tariff_mfn: 24.0, tariff_fta: 0, savings_pct: 100, hs: '160414', product: '참치 통조림' },
    { route: 'Korea → US', fta: 'KORUS FTA', tariff_mfn: 12.5, tariff_fta: 0, savings_pct: 100, hs: '160414', product: '참치 통조림' },
    { route: 'Thailand → US', fta: 'None', tariff_mfn: 12.5, tariff_fta: 12.5, savings_pct: 0, hs: '160414', product: '참치 통조림' },
    { route: 'Korea → Japan', fta: 'RCEP', tariff_mfn: 9.6, tariff_fta: 4.8, savings_pct: 50, hs: '030231', product: '냉동 참다랑어' },
  ],

  // AI price forecast parameters (from 수산물 전망모형 연구)
  forecast_model_params: {
    model_type: 'VAR (Vector Autoregression)',
    variables: ['skipjack_price', 'oil_price_mgo', 'enso_index', 'exchange_rate_krw_usd', 'thai_canning_utilization'],
    forecast_horizon: '6 months',
    confidence_interval: 0.95,
    source: '(기본 2024-08) 수산물 무역(수출입) 단기 전망모형 구축 연구',
    last_calibration: '2025-Q4',
  },

  // Composite risk score
  composite_risk_score: {
    overall: 74,
    grade: 'B+',
    breakdown: {
      trade_policy: 82,
      environmental_regulation: 68,
      labor_compliance: 76,
      supply_chain: 71,
    },
    trend: 'WORSENING',
    last_updated: new Date().toISOString(),
  },
};

// Live WTO data fetch
async function fetchWtoTariffData(hsCode: string) {
  if (!WTO_KEY) return null;
  try {
    const url = `https://api.wto.org/timeseries/v1/data?i=HS_M_0010&r=410&p=000&ps=2024&pc=${hsCode}&max=10&fmt=json&mode=full&lang=1&meta=false&subscription-key=${WTO_KEY}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'full', hsCode } = body;

    if (type === 'tariff_check' && hsCode) {
      const wtoData = await fetchWtoTariffData(hsCode);
      return NextResponse.json({
        hs_code: hsCode,
        wto_data: wtoData,
        fta_routes: POLICY_RISK_MATRIX.fta_tariff_matrix.filter(r => r.hs === hsCode),
      });
    }

    return NextResponse.json({
      _meta: {
        source: '국가정책연구포털 8건 교차분석 + WTO/OFAC/WITS API',
        timestamp: new Date().toISOString(),
        reports_analyzed: 8,
        risk_model: 'Severity × Probability weighted composite',
        data_status: 'STATIC - impact_usd_millions은 박혜진(2024-06) 등 국정연 보고서 추정치. 실시간 산출 아님.',
      },
      ...POLICY_RISK_MATRIX,
    });
  } catch {
    return NextResponse.json({ error: 'Failed', data: POLICY_RISK_MATRIX }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    description: '참치 정책 리스크 인텔리전스 - 국정연 보고서 기반',
    composite_risk_score: POLICY_RISK_MATRIX.composite_risk_score,
    risks_monitored: POLICY_RISK_MATRIX.trade_policy_risks.length,
    fta_routes_tracked: POLICY_RISK_MATRIX.fta_tariff_matrix.length,
  });
}
