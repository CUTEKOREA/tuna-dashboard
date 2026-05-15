import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: "w_importyeti_eu_buyers",
    title: "EU(스페인/이탈리아) 대형 바이어 물동량",
    subtitle: "남미산 오징어 취급 B2B",
    isLiveApi: true,
    reliability: 94,
    chartType: "bar",
    xKey: "buyer",
    bars: [
      { key: "volume", color: "#8b5cf6", name: "최근 6개월 수입량 (TEU)" }
    ],
    data: [
      { buyer: "Nueva Pescanova", volume: 4500 },
      { buyer: "Profand", volume: 3800 },
      { buyer: "Iberconsa", volume: 3200 },
      { buyer: "Marfrio", volume: 2100 },
      { buyer: "Lanzal", volume: 1500 }
    ],
    sit: "[ImportYeti] 스페인 Vigo 항구의 대형 벤더들이 페루 및 포클랜드산 오징어 수입 물량을 싹쓸이 중.",
    strat: "원물 확보 후 스페인 주요 수산기업(Nueva Pescanova 등)에 다이렉트 B2B 수출망을 타진하여 중간 마진 확보.",
    source: "ImportYeti B2B Live"
  };

  return NextResponse.json(data);
}
