import { NextResponse } from 'next/server';

// 정직 STATIC: KCS TRQ 실시간 API 미연동. 아래 수치는 2024년 기준 정적 추정값.
// 실제 TRQ 소진율은 관세청(KCS) 수입통관 실적에서만 확인 가능.
export const revalidate = 3600;

export async function GET() {
  try {
    // 정적 기준값 — 2024년 연간 평균 소진율 추정 (KREI 자료 기반)
    const totalQuota_MT = 50000;
    const consumed_MT = 34500; // 2024년 연평균 소진 추정 (약 69%)
    const remaining_MT = totalQuota_MT - consumed_MT;
    const exhaustionRate_percent = +( (consumed_MT / totalQuota_MT) * 100 ).toFixed(1);

    let alertLevel = "INFO";
    let alertMessage = "TRQ 잔여 쿼터 안정적 (정적 기준값, 실시간 미연동).";

    if (exhaustionRate_percent >= 95) {
      alertLevel = "CRITICAL";
      alertMessage = "TRQ 쿼터 소진 임박 - 베트남(VKFTA 0%) 전환 검토 필요.";
    } else if (exhaustionRate_percent >= 80) {
      alertLevel = "WARNING";
      alertMessage = `TRQ 소진율 ${exhaustionRate_percent}% - 30% 쿼터 외 관세 적용 위험.`;
    }

    const response = {
      isLive: false,
      itemCode: "0706101000",
      itemName: "당근 (신선/냉장)",
      trqStatus: {
        totalQuota_MT,
        consumed_MT,
        remaining_MT,
        exhaustionRate_percent
      },
      alerts: [
        { level: alertLevel, message: alertMessage }
      ],
      apiStatus: {
        KCS: "static"
      },
      source: "KREI WTO TRQ 분석 (2024 기준 정적 추정값)"
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Failed to fetch TRQ data" }, { status: 500 });
  }
}
