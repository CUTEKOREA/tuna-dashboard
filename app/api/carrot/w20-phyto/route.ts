import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export const revalidate = 3600;

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/carrot_w20_phyto_risk.json', 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json({
      isLive: false,
      source: "MFDS static phyto-risk snapshot",
      data,
      _metadata: {
        isLive: false,
        status: "STATIC",
        source: "data/carrot_w20_phyto_risk.json",
        syncDate: "2026-06-06",
        method: "static JSON snapshot",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch W20 Phyto Risk data" }, { status: 500 });
  }
}
