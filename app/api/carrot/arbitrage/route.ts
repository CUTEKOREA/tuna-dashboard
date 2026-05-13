import { NextResponse } from 'next/server';

export const revalidate = 0; // Disable cache for live telemetry

export async function GET() {
  try {
    const now = new Date();
    
    // 1. Live KAMIS Price Simulation (Base: 2800, variance: +/- 300)
    const baseKamis = 2800;
    const kamisVariance = Math.floor(Math.random() * 600) - 300;
    const domesticWholesalePrice_KRW_per_kg = baseKamis + kamisVariance;

    // 2. Live Exchange Rates Simulation
    const baseVnd = 0.054;
    const vndVariance = (Math.random() * 0.004) - 0.002;
    const VND_to_KRW = +(baseVnd + vndVariance).toFixed(4);

    const baseUsd = 1380;
    const usdVariance = Math.floor(Math.random() * 40) - 20;
    const USD_to_KRW = baseUsd + usdVariance;

    // 3. Dynamic Landed Costs
    // Vietnam: Ocean Freight + 0% Tariff (FTA) + Processing
    const vietnamFobUsd = 1.05; // $1.05 / kg
    const vietnamOceanFreightUsd = 0.15;
    const vietnamIQF_KRW_per_kg = Math.round((vietnamFobUsd + vietnamOceanFreightUsd) * USD_to_KRW);

    // China: Ocean Freight + 30% Tariff (Base or TRQ exhausted)
    const chinaFobUsd = 0.95; // Cheaper FOB
    const chinaOceanFreightUsd = 0.08; // Closer
    const chinaIQF_KRW_per_kg = Math.round((chinaFobUsd + chinaOceanFreightUsd) * USD_to_KRW * 1.30); // 30% tariff applied

    // 4. Arbitrage Calculation
    const savingsPerKg = domesticWholesalePrice_KRW_per_kg - vietnamIQF_KRW_per_kg;
    let action = "Hold";
    if (savingsPerKg > 1000) action = "Strong Buy (Immediate Hedging)";
    else if (savingsPerKg > 500) action = "Accumulate (Build Inventory)";

    const response = {
      timestamp: now.toISOString(),
      domesticWholesalePrice_KRW_per_kg,
      exchangeRates: {
        THB_to_KRW: 37.5,
        VND_to_KRW,
        USD_to_KRW
      },
      sources: {
        vietnamIQF_KRW_per_kg,
        chinaIQF_KRW_per_kg,
      },
      recommendation: {
        bestSourcing: "Vietnam IQF (베트남산 냉동 다이스)",
        savingsPerKg, 
        action
      },
      apiStatus: {
        KAMIS: "active_live_sim",
        BOT: "active_live_sim",
        KCS: "active_live_sim"
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch arbitrage data" }, { status: 500 });
  }
}
