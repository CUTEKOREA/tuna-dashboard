import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// 흰다리새우(수입/냉동) 국내 도매가 — agri_data 월간 파이프라인 SYNCED.
// 데이터: public/data/agri/shrimp_kamis.json
//   (KAMIS periodProductList item 654/kind01/rank01/cls02, kg 환산, 2026-06-06 코드 검증)
//   생성기: scripts/agri_to_dashboard/agri_convert.py — 매월 agri_data 갱신 후 재실행으로 동기화.
// 룰북 L-09/L-12: 정적 SYNCED 데이터이므로 isLive:false (LIVE 라벨 금지).

const FALLBACK = {
  isLive: false,
  status: 'SYNCED',
  syncDate: null as string | null,
  source: 'KAMIS (Fallback)',
  metrics: {
    item: '흰다리새우 (수입/냉동)',
    wholesalePrice_KRW_per_KG: 12050,
    latestDate: null,
    momChangePercent: null,
    trend: '보합',
  },
  series: [],
};

export async function GET() {
  try {
    const file = path.join(process.cwd(), 'public', 'data', 'agri', 'shrimp_kamis.json');
    const raw = await fs.readFile(file, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch (error) {
    console.error('shrimp/kamis agri_data read failed:', error);
    return NextResponse.json(FALLBACK);
  }
}
