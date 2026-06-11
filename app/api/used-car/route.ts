import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * /api/used-car — 서아프리카 중고차 수출 인텔리전스 (정적 스냅샷).
 *
 * 정직 표기 원칙 (L-09 / L-12 / A-01):
 * - 난수(Math.random) 기반 가짜 "실시간" 환율·운임·유가 생성 금지 — 전부 정적 기준값.
 * - networksStatus 'Online' 하드코딩 위장 제거.
 * - isLive: false + dataAsOf 기준일을 표준 필드로 출력.
 * - 환율 LIVE가 필요하면 컴포넌트에서 /api/exchange(isLive 포함)를 별도 소비.
 */

// 기준일: Jiji 가나 스크래핑·달러 환산 환율의 실측 수집일 (cardDesc와 동일 출처).
const DATA_AS_OF = '2026-04-27';

// 정적 기준값 — 발명 금지, 기존 페이지 데이터와 동일 출처의 값만 사용.
const GHS_USD_BASELINE = 14.5; // Jiji 매물 달러 환산에 적용된 환율 (1 USD = 14.5 GHS, 2026-04-27)
const FREIGHT_TEMA_40FT = 4500; // 인천→테마 40ft HC 포워더 견적 (shippingCostChart 동일값, 2026.04)

export async function GET() {
  try {
    // Read base static data (used_car_dashboard.json — 2026.04 스냅샷)
    const dataPath = path.join(process.cwd(), 'public', 'data', 'used_car_dashboard.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const baseData = JSON.parse(fileContents);

    // 차익거래 레이더 — FOB·소매가·세금은 2026.04 시세 기반 추정 예시 (정적).
    const arbitrageRadar = {
      asOf: DATA_AS_OF,
      exchangeRates: {
        GHS_USD: GHS_USD_BASELINE,
      },
      freightRates: {
        Tema_40ft: FREIGHT_TEMA_40FT,
      },
      arbitrageOpportunities: [
        { model: 'Hyundai Tucson 2018', fobKorea: 5000, retailGhana: 11500, estTaxes: 2800, netMargin: 11500 - 5000 - FREIGHT_TEMA_40FT - 2800 },
        { model: 'Kia Morning 2019', fobKorea: 2200, retailGhana: 6500, estTaxes: 800, netMargin: 6500 - 2200 - FREIGHT_TEMA_40FT / 6 - 800 }, // 40ft HC 6대 혼적 기준
        { model: 'Hyundai Porter II', fobKorea: 3500, retailGhana: 9500, estTaxes: 1800, netMargin: 9500 - 3500 - FREIGHT_TEMA_40FT / 2 - 1800 }, // 40ft HC 2대 기준
      ],
    };

    const apiPayload = {
      ...baseData,
      arbitrageRadar,
      // L-12 표준 필드 — 전 데이터가 정적 스냅샷이므로 정직하게 false.
      isLive: false,
      dataAsOf: DATA_AS_OF,
      _metadata: {
        isLive: false,
        dataAsOf: DATA_AS_OF,
        source:
          '정적 스냅샷 — Jiji 가나 스크래핑(2026-04-27) · 포워더 운임 견적(2026.04) · GlobalPetrolPrices 유가(2026.04) · 시장조사 보고서(2025)',
      },
    };

    return NextResponse.json(apiPayload);
  } catch (error) {
    console.error('Error in /api/used-car:', error);
    return NextResponse.json(
      { error: '중고차 인텔리전스 데이터를 불러오지 못했습니다', isLive: false },
      { status: 500 }
    );
  }
}
