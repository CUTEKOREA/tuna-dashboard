import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export const revalidate = 86400; // FAO Data updates less frequently (daily/weekly cache)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'production';
  
  try {
    const jsonDirectory = path.join(process.cwd(), 'data', 'carrot', 'carrot_fao');
    let filename = '';
    
    switch (type) {
      case 'production':
        filename = 'carrot_fao_w1_production.json';
        break;
      case 'trade':
        filename = 'carrot_fao_w2_trade.json';
        break;
      case 'price':
        filename = 'carrot_fao_w3_price.json';
        break;
      case 'loss':
        filename = 'carrot_fao_w4_loss.json';
        break;
      default:
        filename = 'carrot_fao_w1_production.json';
    }

    const fileContents = await fs.readFile(path.join(jsonDirectory, filename), 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json({
      isLive: false,
      source: "FAOSTAT static snapshot",
      data,
      _metadata: {
        isLive: false,
        status: "STATIC",
        source: `data/carrot/carrot_fao/${filename}`,
        syncDate: "2026-06-06",
        method: "local FAOSTAT extract",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch FAOSTAT data" }, { status: 500 });
  }
}
