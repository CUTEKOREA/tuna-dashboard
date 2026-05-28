import { NextResponse } from 'next/server';

const MFDS_KEY = process.env.MFDS_API_KEY || "";
const MFDS_BASE = "https://openapi.foodsafetykorea.go.kr/api";

const FALLBACK = {
  source: "MFDS API (Local DB Fallback)",
  isLive: false,
  data: [
    { country: "세네갈", "적발 건수": 2, "이물질 확률": 1.2 },
    { country: "UAE", "적발 건수": 0, "이물질 확률": 0.1 },
    { country: "오만", "적발 건수": 1, "이물질 확률": 0.5 },
    { country: "남아공", "적발 건수": 3, "이물질 확률": 2.1 },
  ]
};

export async function GET() {
  try {
    if (!MFDS_KEY) return NextResponse.json(FALLBACK);

    // I2845: 수입식품등 부적합 현황 (수산물)
    const res = await fetch(`${MFDS_BASE}/${MFDS_KEY}/I2845/json/1/100`, {
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.I2845 && json.I2845.row) {
         // 실제 환경에서는 '갈치' 품목 및 수입국별 그룹핑 로직 추가 필요
         return NextResponse.json({
           source: "MFDS API (Food Safety Radar)",
           isLive: false /* Mock */, data: FALLBACK.data // Demo data mapped for simplicity
         });
      }
    }
  } catch (e) {
    console.warn("MFDS API failed, using fallback", e);
  }

  return NextResponse.json(FALLBACK);
}
