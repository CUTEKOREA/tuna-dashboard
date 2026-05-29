import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const timestamp = new Date().toISOString();
  
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'whelk_real_data_v1.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // Telemetry 메타데이터 (정직 표기 — L-09 룰북 준수)
    data._metadata = {
      source: "정적 JSON (public/data/whelk_real_data_v1.json)",
      isLive: false,
      status: "STATIC",
      lastUpdated: timestamp,
      pipeline: "정적 JSON 직접 로드. 라이브 API 미구축 (1차 출처: KCS/FAOSTAT/KFAS/aT 수동 갱신).",
      syncDate: "2026-05-29"
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error reading whelk data:', err);
    return NextResponse.json({ 
      error: 'Failed to load whelk data',
      status: "🔴 OFFLINE" 
    }, { status: 500 });
  }
}
