import { NextResponse } from 'next/server';

export const revalidate = 3600;

// 정직 STATIC: agri_data 갈치 착지원가(USDA GAIN 2024 Table 6) — 원산지별 검역·비관세 비용($/MT).
// 기존: 실호출 결과를 버리고 demo 적발건수 반환 → 실측 검역 비용으로 교체.
const DATA = {
  source: "USDA GAIN Korea Seafood 2024 Table 6 (검역·비관세 비용)",
  isLive: false,
  data: [
    { country: "중국", "검역·비관세비용($/MT)": 150 },
    { country: "세네갈", "검역·비관세비용($/MT)": 250 },
  ],
};

export async function GET() {
  return NextResponse.json(DATA);
}
