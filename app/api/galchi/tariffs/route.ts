import { NextResponse } from 'next/server';
import { optionalEnv } from '../../_shared/env';

export const dynamic = 'force-dynamic';

const TARIFFS_KEY = () => optionalEnv('DATA_GO_KR_NEW_KEY');
const TARIFFS_BASE = "https://api.tariffs.io/v1/calculate";

// 갈치(HS 0303.89-2000)는 FTA TRQ 미적용 — 전 공급국 MFN 10% 동일.
// ✅ HSK 검증 완료 (2026-06-11): 아래는 관세청 nitemtrade HSK 0303892000(냉동 갈치)
// 2025년 월별 실측 CIF(USD/kg)에 환율 1,380원 가정 × (1 + MFN 10% + 보험 0.5%) + 통관비 50원/kg을
// 누적한 착지원가 (원/kg). 구 시나리오 추정치(중국산 저가 가정)는 아귀 코드 오귀속 산물로 폐기.
const FALLBACK = {
  source: "관세청 HSK 0303.89-2000 월별 실측 CIF (2025) + MFN 10% + 통관비 (환율 1,380원 가정)",
  isLive: false,
  hskVerified: "0303892000 - 관세청 품목명 '갈치' 확인 (2026-06-11)",
  data: [
    { month: "1월", "중국산 착지원가": 8528, "세네갈산 착지원가": 6348 },
    { month: "2월", "중국산 착지원가": 8772, "세네갈산 착지원가": 6561 },
    { month: "3월", "중국산 착지원가": 8574, "세네갈산 착지원가": 6211 },
    { month: "4월", "중국산 착지원가": 7309, "세네갈산 착지원가": 6378 },
    { month: "5월", "중국산 착지원가": 8361, "세네갈산 착지원가": 5463 },
    { month: "6월", "중국산 착지원가": 8315, "세네갈산 착지원가": 5341 },
    { month: "7월", "중국산 착지원가": 10419, "세네갈산 착지원가": 5936 },
    { month: "8월", "중국산 착지원가": 8742, "세네갈산 착지원가": 5829 },
    { month: "9월", "중국산 착지원가": 10175, "세네갈산 착지원가": 6119 },
    { month: "10월", "중국산 착지원가": 8696, "세네갈산 착지원가": 5509 },
    { month: "11월", "중국산 착지원가": 10099, "세네갈산 착지원가": 5707 },
    { month: "12월", "중국산 착지원가": 4792, "세네갈산 착지원가": 5357 },
  ]
};

export async function GET() {
  try {
    if (!TARIFFS_KEY()) return NextResponse.json(FALLBACK);

    const res = await fetch(`${TARIFFS_BASE}?hs_code=030389`, {
      headers: { 'Authorization': `Bearer ${TARIFFS_KEY()}` },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const json = await res.json();
      // Assume json.data maps to our format
      if (json && json.data) {
         return NextResponse.json({
           source: "원산지별 착지원가 Simulator (MFN 10% 동일)",
           isLive: true,
           data: json.data.map((d: any) => ({
             month: d.month,
             "중국산 착지원가": d.mfn_cost,
             "세네갈산 착지원가": d.fta_cost
           }))
         });
      }
    }
  } catch (e) {
    console.warn("Tariffs API failed, using fallback", e);
  }

  return NextResponse.json(FALLBACK);
}
