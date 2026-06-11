import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 단일 데이터 빈티지 (SSOT): public/data/cassava_real_data_v1.json 최종 갱신일
// (git e10359e 2026-06-06 — agri_data 파이프라인 연동, w04 UN Comtrade 2024 재산정과 일치)
const LAST_SYNCED = '2026-06-06';

export async function GET() {
  try {
    // 1. Read base static data
    const dataPath = path.join(process.cwd(), 'public', 'data', 'cassava_real_data_v1.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const baseData = JSON.parse(fileContents);

    // 2. W05: 정적 JSON 그대로 반환 (TTTA 실시간 API 미연동 — 난수 기반 라이브 시뮬레이션 제거)
    // L-09: Math.random() 기반 가짜 실시간 데이터 주입 금지. 실제 TTTA fetch 연동 시에만 Live 표기 허용.

    // 3. 위젯별 syncDate 단일화: 개별 명시가 없으면 파일 빈티지(LAST_SYNCED)를 사용 (패턴 E 정정)
    const widgets = (baseData.widgets || []).map((w: any) => ({
      ...w,
      syncDate: w.syncDate ?? LAST_SYNCED,
    }));

    // Merge and return (isLive:false — 정적 JSON 파일 기반)
    const apiPayload = {
      ...baseData,
      widgets,
      isLive: false,
      _metadata: {
        status: 'STATIC',
        lastSynced: LAST_SYNCED,
        source: '정적 JSON 파일 (TTTA·FAOSTAT·NOAA 실시간 API 미연동)'
      }
    };

    return NextResponse.json(apiPayload);
  } catch (error) {
    console.error('Error in /api/cassava:', error);
    return NextResponse.json({ error: 'Failed to fetch Cassava Intelligence Data' }, { status: 500 });
  }
}
