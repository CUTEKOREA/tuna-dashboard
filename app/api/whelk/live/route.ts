import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const revalidate = 3600;

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const [legacyContents, v2Contents] = await Promise.all([
      readFile(path.join(dataDir, 'whelk_real_data_v1.json'), 'utf8'),
      readFile(path.join(dataDir, 'whelk_v2.json'), 'utf8'),
    ]);
    const legacyData = JSON.parse(legacyContents);
    const v2 = JSON.parse(v2Contents);

    // Telemetry 메타데이터 (정직 표기 — L-09 룰북 준수)
    const metadata = {
      source: "정적 JSON (public/data/whelk_real_data_v1.json)",
      isLive: false,
      status: "STATIC",
      lastUpdated: timestamp,
      pipeline: "정적 JSON 직접 로드. 라이브 API 미구축 (1차 출처: KCS/FAOSTAT/KFAS/aT 수동 갱신).",
      syncDate: "2026-05-29"
    };

    return NextResponse.json({
      ...legacyData,
      isLive: false,
      _metadata: metadata,
      v2,
    });
  } catch (err) {
    console.error('Error reading whelk data:', err);
    return NextResponse.json({
      error: '골뱅이 데이터를 불러오지 못했습니다.',
      isLive: false,
      status: 'OFFLINE',
      _metadata: {
        isLive: false,
        status: 'STATIC',
      },
    }, { status: 500 });
  }
}
