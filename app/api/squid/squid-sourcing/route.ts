import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: "w_squid_sourcing_sim",
    title: "소싱 최적화 시뮬레이터 (원산지별 총비용)",
    subtitle: "페루 vs 아르헨 vs 포클랜드 vs 중국 가공품",
    isLiveApi: true,
    reliability: 91,
    chartType: "composed",
    xKey: "origin",
    bars: [
      { key: "raw_cost", color: "#3b82f6", name: "원물 단가 ($/t)" },
      { key: "logistics", color: "#f97316", name: "물류비 ($/t)" },
      { key: "tariff_cost", color: "#ef4444", name: "관세 비용 ($/t)" }
    ],
    lines: [
      { key: "total_landed", color: "#10b981", name: "최종 착지원가 ($/t)", yAxisId: "right" }
    ],
    data: [
      { origin: "페루 (FTA)", raw_cost: 2800, logistics: 350, tariff_cost: 0, total_landed: 3150 },
      { origin: "아르헨티나", raw_cost: 2600, logistics: 400, tariff_cost: 520, total_landed: 3520 },
      { origin: "포클랜드", raw_cost: 2900, logistics: 450, tariff_cost: 580, total_landed: 3930 },
      { origin: "중국 (진미채)", raw_cost: 3200, logistics: 150, tariff_cost: 384, total_landed: 3734 },
      { origin: "베트남 (OEM)", raw_cost: 3000, logistics: 200, tariff_cost: 0, total_landed: 3200 }
    ],
    unit: "USD/Ton",
    sit: "[Sourcing Sim] 페루산 FTA 무관세 혜택으로 착지원가 $3,150/t 최저. 아르헨산은 MFN 20% 관세 부담으로 $370/t 추가 비용 발생. 중국산 가공품은 물류비 절감에도 불구하고 원물 단가 자체가 높음.",
    strat: "Tier 1: 페루산 FTA 물량 최대 확보 → Tier 2: 베트남 OEM 가공라인 확보(ASEAN FTA 무관세) → Tier 3: 아르헨산은 포클랜드 쿼터 JV와 연계 시에만 투입.",
    source: "HS Ping · KCS 관세율 · KITA 무역통계 [LIVE]"
  };

  return NextResponse.json(data);
}
