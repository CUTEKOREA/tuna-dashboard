import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * [DEPRECATED 2026-06-11] 패턴 C (A-01 위반) 정정.
 *
 * 기존 구현은 FRED 화물 TSI(TSIFRGHT) 지수에 발명 계수를 적용해
 * 방콕항 체선 지표를 합성 생성했다:
 *   체선율 = (TSI - 110) x 1.8, 평균 대기일 = TSI / 35,
 *   묘박지 대기 척수 = TSI / 15, 백로그 = 척수 x 2,500MT.
 * 미국 내륙 물류 지수와 방콕항 체선 간 인과·비례 관계의 근거가
 * 없으므로 산식을 전면 제거한다.
 *
 * 유일한 소비처(ReeferMovement)는 2026-06-11 정직화 수정에서 본
 * 라우트 의존을 제거하고 WEEK 22 주간 보고 정적 데이터로 전환했다.
 */
export async function GET() {
  return NextResponse.json(
    {
      isLive: false,
      deprecated: true,
      reason:
        '미국 물류 TSI 지수에 발명 계수를 곱해 방콕항 체선율·대기일·대기 척수를 합성하던 산식이 데이터 무결성 원칙(A-01)에 위배되어 2026-06-11 비활성화. 실측 항만 데이터 연동 후 재개 예정.',
    },
    { status: 410 },
  );
}
