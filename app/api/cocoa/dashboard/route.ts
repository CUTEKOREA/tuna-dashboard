import { NextResponse } from 'next/server';
import { getCocoaDashboardData } from '@/lib/data/cocoa-dashboard';

export const revalidate = 3600;

// 코코아 시장 데이터 — 정적 스냅샷(빌드 타임 import → 항상 번들, 런타임 파일부재 불가).
// 실시간 API 미연동(L-09/L-12 정직 표기). 과거 버전은 난수 지터로 라이브를 흉내냈으나 전면 제거.
export async function GET() {
  return NextResponse.json({
    isLive: false,
    status: 'STATIC',
    source:
      '위젯별 정적 스냅샷 - USDA GAIN(코트디부아르·가나·콜롬비아 2025)·Cocoa Barometer·ICCO 실측 앵커 + 시나리오 추정. 실시간 피드 미연동.',
    syncDate: '2026-05-31',
    data: getCocoaDashboardData(),
  });
}
