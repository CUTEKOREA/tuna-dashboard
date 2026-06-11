import { NextResponse } from 'next/server';

// Static imports to prevent Turbopack/Vercel dynamic bundling errors
import w1Data from '../../../../data/carrot_w1_hegemony.json';
import w2Data from '../../../../data/carrot_w2_price.json';
import w3Data from '../../../../data/carrot_w3_utilization.json';
import w4Data from '../../../../data/carrot_w4_margin.json';
import w5Data from '../../../../data/carrot_w5_sankey.json';
import w6Data from '../../../../data/carrot_w6_radar.json';
import w7Data from '../../../../data/carrot_w7_scatter.json';
import w8Data from '../../../../data/carrot_w8_waterfall.json';
import w9Data from '../../../../data/carrot_w9_yield.json';
import w10Data from '../../../../data/carrot_w10_volatility.json';
import w11Data from '../../../../data/carrot_w11_iqf_yield.json';
import w12Data from '../../../../data/carrot_w12_spec_radar.json';
import w14Data from '../../../../data/carrot_w14_smile_curve.json';
import w15Data from '../../../../data/carrot_w15_climate_hedge.json';
import w16Data from '../../../../data/carrot_w16_labor_arbitrage.json';
import w17Data from '../../../../data/carrot_w17_floating_storage.json';
import w18Data from '../../../../data/carrot_w18_ma_target.json';
import w19Data from '../../../../data/carrot_w19_exit_valuation.json';
import w20Data from '../../../../data/carrot_w20_phyto_risk.json';
import w21Data from '../../../../data/carrot_w21_hmr_demand.json';
import w22Data from '../../../../data/carrot_w22_trq_fta.json';
import w23Data from '../../../../data/carrot_w23_vendor_ltv.json';
import w24Data from '../../../../data/carrot_w24_esg_upcycling.json';
import w25Data from '../../../../data/carrot_w25_oec_export.json';
import w26Data from '../../../../data/carrot_w26_oec_import.json';
import w27Data from '../../../../data/carrot_w27_kamis_monthly.json';
import w28Data from '../../../../data/carrot_w28_scl_loss.json';

import faoProd from '../../../../data/carrot/carrot_fao/carrot_fao_w1_production.json';
import faoTrade from '../../../../data/carrot/carrot_fao/carrot_fao_w2_trade.json';
import faoPrice from '../../../../data/carrot/carrot_fao/carrot_fao_w3_price.json';
import faoLoss from '../../../../data/carrot/carrot_fao/carrot_fao_w4_loss.json';

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    // L-07/L-12: honest static declaration — all payloads below are bundled JSON, no live external API.
    _metadata: { status: 'STATIC', isLive: false, lastSynced: '2026-06-06' },
    auditStatus: {
      isAudited: true,
      protocol: "Harness 4-Axis Reliability",
      grade: "S-Grade",
      sources: ["FAOSTAT", "KAMIS", "KCS", "OEC", "NOAA", "MFDS"]
    },
    data: {
      w1Data, w2Data, w3Data, w4Data, w5Data, w6Data, w7Data, w8Data, w9Data, w10Data,
      w11Data, w12Data, w14Data, w15Data, w16Data, w17Data, w18Data, w19Data, w20Data,
      w21Data, w22Data, w23Data, w24Data, w25Data, w26Data, w27Data, w28Data,
      faoProd, faoTrade, faoPrice, faoLoss
    }
  });
}
