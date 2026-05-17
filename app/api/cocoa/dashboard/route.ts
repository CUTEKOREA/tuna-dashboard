import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export const revalidate = 0; // Disable cache for live simulation

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data');
    const fileContents = await fs.readFile(path.join(jsonDirectory, 'cocoa_market_data.json'), 'utf8');
    const baseData = JSON.parse(fileContents);
    
    const now = new Date();
    
    // 1. W2 Price Shock (Simulate ICE Cocoa Futures live variance)
    // Add a live data point or perturb the forecast points
    if (baseData.w2_price_shock) {
      baseData.w2_price_shock = baseData.w2_price_shock.map((row: any) => {
        if (row.month.includes('(F)')) {
          // VIX-level variance: +/- 500 for forecast
          const variance = Math.floor(Math.random() * 1000) - 500;
          row.Price = Math.max(2000, row.Price + variance);
        }
        return row;
      });
    }

    // 2. W4 Derivative Spread (Live ICE/Bloomberg margin variance)
    if (baseData.w4_derivative_spread) {
      baseData.w4_derivative_spread = baseData.w4_derivative_spread.map((row: any) => {
        // Butter margins fluctuate wildly (+/- 15%), Mass/Powder (+/- 5%)
        const variance = row.type.includes('버터') 
          ? Math.floor(Math.random() * 30) - 15
          : Math.floor(Math.random() * 10) - 5;
        row.margin = Math.max(0, row.margin + variance);
        return row;
      });
    }

    // 3. W6 Inventory Burn Rate (Live DIO vs Critical Line)
    if (baseData.w6_inventory_burn_rate) {
      baseData.w6_inventory_burn_rate = baseData.w6_inventory_burn_rate.map((row: any) => {
        if (row.timeline === '2025.Q4(F)' || row.timeline === '2026.Q1(F)') {
          const variance = Math.floor(Math.random() * 10) - 5;
          row.DIO = Math.max(10, row.DIO + variance); // Don't go below 10 days
        }
        return row;
      });
    }

    // 4. W10 EUDR Compliance (Live Trase.earth simulation)
    if (baseData.w10_eudr_compliance) {
      baseData.w10_eudr_compliance = baseData.w10_eudr_compliance.map((row: any) => {
        // Registration rates crawl up slowly
        const up = Math.floor(Math.random() * 3);
        if (row.CMS_Registration < 100) row.CMS_Registration = Math.min(100, row.CMS_Registration + up);
        if (row.Polygon_Mapped < 100) row.Polygon_Mapped = Math.min(100, row.Polygon_Mapped + up);
        
        // Export block risk dynamically drops as registration goes up
        row.Export_Block_Risk = Math.max(5, 100 - ((row.CMS_Registration + row.Polygon_Mapped) / 2));
        return row;
      });
    }

    // 5. W13 Dual Trap (MFDS Cadmium vs EUDR Tracking Risk)
    if (baseData.w13_dual_trap) {
      baseData.w13_dual_trap = baseData.w13_dual_trap.map((row: any) => {
        // Cadmium levels fluctuate slightly per inspection batch (+/- 0.05)
        const variance = (Math.random() * 0.1) - 0.05;
        row.cadmiumLevel = Math.max(0.1, +(row.cadmiumLevel + variance).toFixed(2));
        
        // Rejection rate scales with cadmium passing the 0.8 mark
        if (row.cadmiumLevel > 0.8) {
           row.rejectionRate = Math.min(100, row.rejectionRate + (row.cadmiumLevel - 0.8) * 100 + Math.random() * 10);
        }
        return row;
      });
    }

    // 6. W8 Shrinkflation
    if (baseData.w8_shrinkflation) {
      baseData.w8_shrinkflation = baseData.w8_shrinkflation.map((row: any) => {
        if (row.name === '최종 B2B 단가') {
          // Final price slightly bounces due to daily KAMIS updates
          row.value = row.value + Math.floor(Math.random() * 6) - 3;
        }
        return row;
      });
    }

    // 7. W20 Local Confectionery Margin
    if (baseData.w20_local_confectionery_margin) {
      baseData.w20_local_confectionery_margin = baseData.w20_local_confectionery_margin.map((row: any) => {
        const variance = (Math.random() * 0.4) - 0.2;
        row.opMargin = +(row.opMargin + variance).toFixed(1);
        return row;
      });
    }

    // 8. W21 Futures Curve Structure
    if (baseData.w21_futures_curve_structure) {
      baseData.w21_futures_curve_structure = baseData.w21_futures_curve_structure.map((row: any) => {
        // M1(근월)은 변동성이 큼, M12는 작음
        const volatility = row.contract.includes('M1(') ? 100 : 20;
        const variance = Math.floor(Math.random() * volatility) - (volatility / 2);
        row.Price2026 = Math.max(2000, row.Price2026 + variance);
        return row;
      });
    }

    const response = {
      timestamp: now.toISOString(),
      apiStatus: "active_live_sim",
      data: baseData
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch Cocoa live data" }, { status: 500 });
  }
}
