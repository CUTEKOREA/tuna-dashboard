import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const fileMap: Record<string, string> = {
  w1: 'garlic_w1_hegemony.json',
  w2: 'garlic_w2_price.json',
  kamis_monthly: 'garlic_w2_kamis_monthly.json',
  w3: 'garlic_w3_utilization.json',
  w4: 'garlic_w4_margin.json',
  w5: 'garlic_w5_sankey.json',
  w6: 'garlic_w6_arbitrage.json',
  w7: 'garlic_w7_scatter.json',
  w8: 'garlic_w8_waterfall.json',
  w9: 'garlic_w9_yield.json',
  w10: 'garlic_w10_volatility.json',
  w11: 'garlic_w11_valuation.json',
  w12: 'garlic_w12_redsea_hedging.json',
  insight_w2: 'garlic_insight_w2_gpr.json',
  insight_w4: 'garlic_insight_w4_blackgarlic.json',
  insight_w6: 'garlic_insight_w6_redsea.json',
  insight_w8: 'garlic_insight_w8_packaging.json',
  insight_w10: 'garlic_insight_w10_circular.json'
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !fileMap[id]) {
      return NextResponse.json({ error: 'Invalid or missing id parameter' }, { status: 400 });
    }

    const filename = fileMap[id];
    const filePath = path.join(process.cwd(), 'data', filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `File not found: ${filename}` }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API /api/garlic/widget error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
