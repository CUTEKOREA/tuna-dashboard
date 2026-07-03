import { NextResponse } from 'next/server';

// 정직 STATIC: 베트남/중국산 냉동 다이스 당근 착지원가 비교 모델(정적 기준값).
// 기존: 무작위 노이즈로 KAMIS 가격·환율 변동을 생성해 라이브로 위장 → 정적 기준값으로 교체, isLive:false.
export async function GET() {
  try {
    // 정적 기준값 (KAMIS 도매가·환율 — 추정/스냅샷, 실시간 미연동)
    const domesticWholesalePrice_KRW_per_kg = 2800; // KAMIS 국내 도매가 기준 (원/kg)
    const VND_to_KRW = 0.054;
    const USD_to_KRW = 1380;

    // 착지원가 모델
    const vietnamFobUsd = 1.05; // $/kg
    const vietnamOceanFreightUsd = 0.15;
    const vietnamIQF_KRW_per_kg = Math.round((vietnamFobUsd + vietnamOceanFreightUsd) * USD_to_KRW);

    const chinaFobUsd = 0.95;
    const chinaOceanFreightUsd = 0.08;
    const chinaIQF_KRW_per_kg = Math.round((chinaFobUsd + chinaOceanFreightUsd) * USD_to_KRW * 1.30); // 30% 관세

    const savingsPerKg = domesticWholesalePrice_KRW_per_kg - vietnamIQF_KRW_per_kg;
    let action = "관망";
    if (savingsPerKg > 1000) action = "선제 매입·헤징 검토";
    else if (savingsPerKg > 500) action = "재고 점진 확보";

    const response = {
      isLive: false,
      domesticWholesalePrice_KRW_per_kg,
      exchangeRates: { THB_to_KRW: 37.5, VND_to_KRW, USD_to_KRW },
      sources: { vietnamIQF_KRW_per_kg, chinaIQF_KRW_per_kg },
      recommendation: {
        bestSourcing: "Vietnam IQF (베트남산 냉동 다이스)",
        savingsPerKg,
        action,
      },
      apiStatus: { KAMIS: "static", BOT: "static", KCS: "static" },
      source: "KAMIS 도매가·환율·KCS 관세 기반 착지원가 모델 (정적 기준값)",
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Failed to fetch arbitrage data" }, { status: 500 });
  }
}
