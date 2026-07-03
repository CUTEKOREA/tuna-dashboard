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
      timestamp: new Date().toISOString(),
      source: "MFDS (식약처) Open API",
      data: data
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch W20 Phyto Risk data" }, { status: 500 });
  }
}
