import { NextResponse } from 'next/server';

export const revalidate = 3600;

// 정직 STATIC: UN Comtrade 글로벌 갈치(HS 030389) 수출액 실측 (galchi_data w25 교차).
// 기존: 실호출 결과를 버리고 demo 복잡성지수 반환 → 실측 수출 경쟁 데이터로 교체.
const DATA = {
  source: "UN Comtrade 글로벌 갈치(HS 030389) 수출 (galchi_data w25 교차)",
  isLive: false,
  data: [
    { target: "중국", "수출액($M)": 185 },
    { target: "세네갈", "수출액($M)": 55 },
    { target: "대만", "수출액($M)": 35 },
    { target: "한국", "수출액($M)": 20 },
    { target: "일본", "수출액($M)": 15 },
  ],
};

export async function GET() {
  return NextResponse.json(DATA);
}
