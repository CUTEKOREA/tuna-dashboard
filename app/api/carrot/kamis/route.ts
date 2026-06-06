import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const revalidate = 3600;

// 당근 국내 도매가 — agri_data 월간 파이프라인 SYNCED.
// 데이터: public/data/agri/carrot_kamis.json
//   (KAMIS periodProductList item 258/cls02 도매·무세척 1kg, 단위 원/kg)
//   생성기: scripts/agri_to_dashboard/agri_convert.py — 매월 agri_data 갱신 후 재실행.
// 룰북 L-09/L-12: 정적 SYNCED 데이터이므로 isLive:false.

const FALLBACK = {
  isLive: false,
  status: 'SYNCED',
  syncDate: null as string | null,
  commodity: '당근',
  market: 'KAMIS 도매',
  unit: '원/kg',
  currentPrice: 1580,
  historicalTrends: [] as { date: string; price: number }[],
};

export async function GET() {
  try {
    const file = path.join(process.cwd(), 'public', 'data', 'agri', 'carrot_kamis.json');
    const raw = await fs.readFile(file, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch (error) {
    console.error('carrot/kamis agri_data read failed:', error);
    return NextResponse.json(FALLBACK);
  }
}
