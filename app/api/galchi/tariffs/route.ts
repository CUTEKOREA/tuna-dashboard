import { NextResponse } from 'next/server';

const TARIFFS_KEY = process.env.DATA_GO_KR_NEW_KEY || "fdbf3eb58f1157a1db7c9156e8ce7f88ed9fa2d996116d9079dddb5232133f7c";
const TARIFFS_BASE = "https://api.tariffs.io/v1/calculate";

// 갈치(HS 030389)는 FTA TRQ 미적용 — 전 공급국 MFN 10% 동일. 아래는 원산지별 FOB·운임 차이 기반 착지원가 시나리오 추정치.
const FALLBACK = {
  source: "원산지별 착지원가 추정 (Local DB Fallback)",
  isLive: false,
  data: [
    { month: "Jan", "중국산 착지원가": 3500, "세네갈산 착지원가": 3200 },
    { month: "Feb", "중국산 착지원가": 3550, "세네갈산 착지원가": 3250 },
    { month: "Mar", "중국산 착지원가": 3600, "세네갈산 착지원가": 3200 },
    { month: "Apr", "중국산 착지원가": 3650, "세네갈산 착지원가": 3150 },
    { month: "May", "중국산 착지원가": 3700, "세네갈산 착지원가": 3100 },
  ]
};

export async function GET() {
  try {
    if (!TARIFFS_KEY) return NextResponse.json(FALLBACK);

    const res = await fetch(`${TARIFFS_BASE}?hs_code=030389`, {
      headers: { 'Authorization': `Bearer ${TARIFFS_KEY}` },
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
