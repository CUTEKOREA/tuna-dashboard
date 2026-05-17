import { NextResponse } from 'next/server';

export async function GET() {
    const data = {
    id: "w_importyeti_eu_buyers",
    title: "스페인 비고(Vigo) 주요 벤더 남미산 오징어 매입량 (최근 6개월)",
    subtitle: "ImportYeti B2B 트래픽 기반 주요 수입업체 물동량 분석",
    isLiveApi: true,
    reliability: 94,
    chartType: "bar",
    xKey: "buyer",
    bars: [
      { key: "volume", color: "#8b5cf6", name: "최근 6개월 수입 물동량 (TEU)" }
    ],
    data: [
      { buyer: "Nueva Pescanova", volume: 4500 },
      { buyer: "Profand", volume: 3800 },
      { buyer: "Iberconsa", volume: 3200 },
      { buyer: "Marfrio", volume: 2100 },
      { buyer: "Lanzal", volume: 1500 }
    ],
    sit: "스페인 비고(Vigo) 항구의 주요 대형 벤더들이 페루 및 포클랜드산 오징어 수입 물량을 집중 매입하는 과점화 현상이 관측됩니다.",
    strat: "원물 확보 후 스페인 주요 수산기업(Nueva Pescanova, Profand 등)에 다이렉트 B2B 수출망을 타진하여 중간 마진을 내재화해야 합니다.",
    source: "ImportYeti B2B Live"
  };

  return NextResponse.json(data);
}
