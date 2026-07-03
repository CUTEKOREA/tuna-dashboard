import { NextResponse } from 'next/server';

export const revalidate = 3600;

// 정직 STATIC: 갈치(HS 0303)는 한-중·한-아세안 FTA 양허 제외 품목 — 전 공급국 MFN 10% 동일 적용.
// 기존: 실호출 결과를 버리고 무작위 노이즈를 더한 가상 데이터 반환 → 실측 관세 구조로 교체.
const DATA = {
  source: "USDA GAIN Korea Seafood 2024 Table 6 + WITS (갈치 HS 0303 MFN 10%, FTA 양허제외)",
  isLive: false,
  data: [
    { country: "중국", "기본관세율(%)": 10 },
    { country: "세네갈", "기본관세율(%)": 10 },
    { country: "오만", "기본관세율(%)": 10 },
    { country: "대만", "기본관세율(%)": 10 },
    { country: "모리타니아", "기본관세율(%)": 10 },
  ],
};

export async function GET() {
  return NextResponse.json(DATA);
}
