import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * [DEPRECATED 2026-06-11] 패턴 C (A-01 위반) 정정.
 *
 * 기존 구현은 KCS(관세청) HS 1604.14 월별 수입 총량(국가 전체)을
 * 발명된 고정 점유율(FCF 35% / 직거래 30% / TRI MARINE 15% /
 * ITOCHU 12% / 몰디브 8%)로 기계 분배해 "트레이더별 월 실적"을 합성
 * 생성하면서 'S-Grade (Empirical) / Direct KCS Integration'으로
 * 표기했다. 국가 통관 총량과 자사 트레이더별 반입량은 모수 자체가
 * 다르므로 산식을 전면 제거한다.
 *
 * 소비 컴포넌트(TraderImportChart)는 어디에도 렌더되지 않는 죽은
 * 코드였으며, /logistics의 트레이더 위젯(TraderStatus)은 사내 집계
 * 정적 데이터(2026-05 기준, STATIC 표기)를 사용한다.
 */
export async function GET() {
  return NextResponse.json(
    {
      isLive: false,
      deprecated: true,
      reason:
        'KCS 국가 통관 총량에 발명 고정 점유율을 곱해 트레이더별 실적을 합성하던 산식이 데이터 무결성 원칙(A-01)에 위배되어 2026-06-11 비활성화. 트레이더별 반입은 사내 집계(TraderStatus, STATIC) 참조.',
    },
    { status: 410 },
  );
}
