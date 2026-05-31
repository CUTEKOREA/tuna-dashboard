import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 정직 STATIC: jukkumi_real_data_v1.json (P0 ground-truth 검증 데이터)을 그대로 반환.
// 기존: API 키 존재 시 실제 외부 호출 없이 무작위 노이즈를 정적 데이터에 입히고
//       라이브로 표기했음(허위 LIVE) → 해당 블록 전면 제거.
// 실 KCS/KAMIS 라이브 연동은 별도 라우트(예: w32_kcs_hs_import_price_volume)에서 수행.
export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'jukkumi_real_data_v1.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Jukkumi intelligence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Jukkumi intelligence data' },
      { status: 500 }
    );
  }
}
