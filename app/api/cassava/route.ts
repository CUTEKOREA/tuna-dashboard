import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // 1. Read base static data
    const dataPath = path.join(process.cwd(), 'public', 'data', 'cassava_real_data_v1.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const baseData = JSON.parse(fileContents);

    // 2. W05: 정적 JSON 그대로 반환 (TTTA 실시간 API 미연동 — 난수 기반 라이브 시뮬레이션 제거)
    // L-09: Math.random() 기반 가짜 실시간 데이터 주입 금지. 실제 TTTA fetch 연동 시에만 Live 표기 허용.

    // 3. W04 Sankey: 정적 메타데이터만 유지 (lastUpdated 동적 생성 제거)

    // Merge and return (isLive:false — 정적 JSON 파일 기반)
    const apiPayload = {
      ...baseData,
      isLive: false,
      _metadata: {
        lastSynced: '2026-05-07',
        source: '정적 JSON 파일 (TTTA·FAOSTAT·NOAA 실시간 API 미연동)'
      }
    };

    return NextResponse.json(apiPayload);
  } catch (error) {
    console.error('Error in /api/cassava:', error);
    return NextResponse.json({ error: 'Failed to fetch Cassava Intelligence Data' }, { status: 500 });
  }
}
