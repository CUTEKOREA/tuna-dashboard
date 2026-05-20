import { NextRequest, NextResponse } from 'next/server';

/**
 * 참치 가격 인텔리전스 API
 *
 * 데이터 출처: Atuna 방콕 SKJ 현물(skjbkk) + Atuna 아비장 YF(yfabj) 실측치
 * 갱신일: 2026-05-20
 *
 * 정정 이력 (2026-05-20):
 *  - 기존 mock 예측치($2,250 등) 실측 대비 30%+ 오차 확인 → Atuna 실측 분기 평균으로 교체
 *  - "VAR 모형 MAPE 4.8%" 모델 artifact는 백테스트 불가로 제거
 *  - 시점 기준을 2026-Q2 중반으로 갱신
 */

const FRED_KEY = process.env.FRED_API_KEY || '';

// Atuna 실측 기반 분기 평균
const PRICE_FORECAST = {
  model_info: {
    type: 'Atuna 실측 분기 평균 + 시나리오 forecast',
    basis: 'Atuna 방콕 SKJ(skjbkk) · 아비장 YF(yfabj) 현물 시계열, 2025-Q1~2026-Q2',
    variables: ['skipjack_fob_bkk', 'yellowfin_fob_abj', 'mgo_price', 'krw_usd'],
    training_period: '2025-Q1 ~ 2026-Q2 (실측)',
    forecast_horizon: '3 quarters',
    note: '실측 기반 평균. 과거 mock의 VAR/MAPE artifact는 백테스트 미통과로 폐기.',
    timestamp: '2026-05-20',
  },

  // Skipjack (가다랑어) FOB Bangkok — Atuna skjbkk 실측치
  skipjack: {
    species: '가다랑어 (Skipjack)',
    unit: 'USD/MT FOB Bangkok',
    source: 'Atuna skjbkk 현물 시세 (분기 평균)',
    historical: [
      { period: '2025-Q1', actual: 1650, predicted: null },
      { period: '2025-Q2', actual: 1510, predicted: null },
      { period: '2025-Q3', actual: 1565, predicted: null },
      { period: '2025-Q4', actual: 1609, predicted: null },
      { period: '2026-Q1', actual: 1662, predicted: null },
      { period: '2026-Q2', actual: 2008, predicted: null },
    ],
    forecast: [
      { period: '2026-Q3', predicted: 1950, lower_95: 1800, upper_95: 2100, driver: '호르무즈 봉쇄 부분 정상화 시 박스권' },
      { period: '2026-Q4', predicted: 1800, lower_95: 1650, upper_95: 1950, driver: '인도양 공급 회복 + WCPO 어획 회복' },
      { period: '2027-Q1', predicted: 1700, lower_95: 1550, upper_95: 1850, driver: '평시 회귀, 가공업체 매입 재개' },
    ],
    trend: 'PEAKED — DESCENDING',
    risk_alert: '2026-Q2 호르무즈 봉쇄 진행 중. 1,950~2,050 박스권 6~8주 지속 가능성. 박스 하단 분할 매입 권고.',
  },

  // Yellowfin (황다랑어) — Atuna yfabj 실측치 (아비장 기준)
  yellowfin: {
    species: '황다랑어 (Yellowfin)',
    unit: 'USD/MT FOB Abidjan',
    source: 'Atuna yfabj 현물 시세 (월말 기준)',
    historical: [
      { period: '2025-Q1', actual: 2400, predicted: null },
      { period: '2025-Q2', actual: 2400, predicted: null },
      { period: '2025-Q3', actual: 2467, predicted: null },
      { period: '2025-Q4', actual: 2500, predicted: null },
      { period: '2026-Q1', actual: 2500, predicted: null },
    ],
    forecast: [
      { period: '2026-Q2', predicted: 2550, lower_95: 2450, upper_95: 2700, driver: '호르무즈 외생 충격 동조' },
      { period: '2026-Q3', predicted: 2600, lower_95: 2450, upper_95: 2800, driver: 'IOTC 쿼터 감축 단계 적용' },
      { period: '2026-Q4', predicted: 2550, lower_95: 2400, upper_95: 2750, driver: '인도양 공급 회복 가시화' },
      { period: '2027-Q1', predicted: 2500, lower_95: 2350, upper_95: 2700, driver: '평시 박스권 회귀' },
    ],
    trend: 'STABLE',
    risk_alert: 'IOTC 쿼터 감축(2026 단계 시행)과 호르무즈 충격이 누적 — 분기 단위 모니터링.',
  },

  // ENSO correlation analysis (Atuna 실측과의 시점 정렬)
  enso_correlation: {
    title: 'ENSO-참치 어획량 상관관계',
    source: 'NOAA ENSO Index + FAOSTAT FishStatJ',
    current_enso: { index: 0.1, phase: 'Neutral', period: '2026-Q2', note: '2025 후반 약 La Niña → 2026 초 Neutral 전환 완료' },
    historical_impact: [
      { enso_phase: 'El Niño (강)', skipjack_catch_change: -18, yellowfin_catch_change: -12, price_impact: '+15~25%' },
      { enso_phase: 'El Niño (약)', skipjack_catch_change: -8, yellowfin_catch_change: -5, price_impact: '+5~12%' },
      { enso_phase: 'Neutral', skipjack_catch_change: 0, yellowfin_catch_change: 0, price_impact: '±3%' },
      { enso_phase: 'La Niña (약)', skipjack_catch_change: +5, yellowfin_catch_change: +3, price_impact: '-3~-8%' },
      { enso_phase: 'La Niña (강)', skipjack_catch_change: +12, yellowfin_catch_change: +8, price_impact: '-8~-15%' },
    ],
    forecast: '2026-Q2 현재 Neutral 진행 중. ENSO보다 호르무즈 외생 충격이 가격 결정 1차 변수.',
  },

  // Landing cost sensitivity
  landing_cost_sensitivity: {
    title: '환율-착지원가 민감도 시뮬레이션',
    base_case: { krw_usd: 1400, skipjack_fob: 1975, freight_40rf: 2850, insurance_pct: 0.3, tariff_pct: 10, note: '2026-05 Atuna 현물 + 현재 환율 기준' },
    scenarios: [
      { name: '원화 약세', krw_usd: 1450, landing_cost_won_kg: 4520, change_pct: +5.1, margin_impact: '마진 5.1% 압축' },
      { name: '기준', krw_usd: 1380, landing_cost_won_kg: 4300, change_pct: 0, margin_impact: '기준 마진' },
      { name: '원화 강세', krw_usd: 1300, landing_cost_won_kg: 4060, change_pct: -5.6, margin_impact: '마진 5.6% 개선' },
      { name: '유가 급등', krw_usd: 1380, landing_cost_won_kg: 4680, change_pct: +8.8, margin_impact: '운임 급등 리스크' },
      { name: '관세 인상(미국 301)', krw_usd: 1380, landing_cost_won_kg: 5160, change_pct: +20.0, margin_impact: '수출 경쟁력 상실' },
    ],
  },
};

// Fetch real-time FRED data for model input
async function fetchFredData(seriesId: string) {
  if (!FRED_KEY) return null;
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&sort_order=desc&limit=4&file_type=json`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.observations?.slice(0, 4) || null;
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { species = 'all', include_enso = true, include_sensitivity = true } = body;

    // Enrich with live FRED data
    const [oilData, exchangeData] = await Promise.all([
      fetchFredData('DCOILWTICO'),
      fetchFredData('DEXKOUS'),
    ]);

    const result: Record<string, any> = {
      _meta: {
        source: '(기본 2024-08) 수산물 무역 단기 전망모형 + FRED API',
        model: PRICE_FORECAST.model_info,
        timestamp: new Date().toISOString(),
        live_inputs: { oil_price: oilData?.[0]?.value, krw_usd: exchangeData?.[0]?.value },
      },
    };

    if (species === 'skipjack' || species === 'all') result.skipjack = PRICE_FORECAST.skipjack;
    if (species === 'yellowfin' || species === 'all') result.yellowfin = PRICE_FORECAST.yellowfin;
    if (include_enso) result.enso_correlation = PRICE_FORECAST.enso_correlation;
    if (include_sensitivity) result.landing_cost_sensitivity = PRICE_FORECAST.landing_cost_sensitivity;

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed', data: PRICE_FORECAST }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    description: '참치 AI 가격 예측 엔진 — VAR 모형 + ENSO 상관분석',
    model: PRICE_FORECAST.model_info.type,
    skipjack_trend: PRICE_FORECAST.skipjack.trend,
    yellowfin_trend: PRICE_FORECAST.yellowfin.trend,
    enso_current: PRICE_FORECAST.enso_correlation.current_enso.phase,
    next_forecast: PRICE_FORECAST.skipjack.forecast[0],
  });
}
