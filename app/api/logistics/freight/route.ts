import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * [DEPRECATED 2026-06-11] 패턴 C (A-01 위반) 정정.
 *
 * 기존 구현은 FRED 글로벌 화물 TSI(TSIFRGHT) 지수 1개에
 * 발명된 노선별 민감도 계수(JPN 0.5 ~ MEX 2.5)와 2025-05 기준 임의
 * 베이스라인 운임을 곱해 6개 노선의 "실시간 해상 운임($/40'HC)"을
 * 합성 생성하면서 'A-Grade / verifiability High'로 표기했다.
 * 노선별 실측 운임 출처가 없으므로 합성 산식을 전면 제거한다.
 *
 * 소비 컴포넌트(ReeferFreightChart)는 어디에도 렌더되지 않는 죽은
 * 코드였으며, 실측 운임 소스(Freightos/Xeneta 등) 연동 전까지 본
 * 라우트는 비활성 상태를 유지한다.
 */
export async function GET() {
  return NextResponse.json(
    {
      isLive: false,
      deprecated: true,
      reason:
        '합성 산식(글로벌 TSI x 발명 민감도 계수) 기반 노선별 운임 생성이 데이터 무결성 원칙(A-01)에 위배되어 2026-06-11 비활성화. 노선별 실측 운임 소스 연동 후 재개 예정.',
    },
    { status: 410 },
  );
}
