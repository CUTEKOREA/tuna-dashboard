import { NextResponse } from 'next/server';

export const revalidate = 3600;

// 정직 STATIC: agri_data squid_unit_price.json 실측(2023). 기존 mock fallback 제거.
export async function GET() {
  const data = {
    id: "w_squid_sourcing_sim",
    title: "오징어 원물 소싱 단가 비교 (원산지별)",
    subtitle: "2023년 원산지별 수입단가 — 원물(남미) vs 가공품(중국·스페인)",
    isLiveApi: false,
    isLive: false,
    reliability: 85,
    chartType: "bar",
    xKey: "origin",
    bars: [
      { key: "price", color: "#3b82f6", name: "수입단가 ($/t)" }
    ],
    data: [
      { origin: "페루", price: 2060 },
      { origin: "아르헨티나", price: 2269 },
      { origin: "한국", price: 4583 },
      { origin: "스페인", price: 4847 },
      { origin: "중국", price: 6901 }
    ],
    unit: "USD/Ton",
    sit: "[소싱 단가 맵] 2023년 기준 페루($2,060/t)·아르헨티나($2,269/t)가 최저가 원물 소싱처이며, 중국($6,901/t)·스페인($4,847/t)은 가공품 비중이 높아 단가가 높습니다. 한국 자체 조달은 $4,583/t로 남미산 원물의 2배 이상입니다.",
    strat: "가공용(진미채·튜브·링) 원물은 페루·아르헨티나 트롤 원물로 직소싱해 원가 우위를 확보하고, 고단가 중국 가공품 의존도를 단계적으로 축소하십시오.",
    source: "FAO/UN Comtrade 수입단가 실측 2023 (agri_data squid_unit_price.json)"
  };
  return NextResponse.json(data);
}
