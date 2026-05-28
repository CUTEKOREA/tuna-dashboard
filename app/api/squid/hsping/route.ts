import { NextResponse } from 'next/server';

export async function GET() {
  // Live API First: HS Ping API Mock Data for Squid
  const data = {
    id: "w_squid_hs_tariff_sim",
    title: "HS/Tariff 랜딩 코스트 시뮬레이터",
    subtitle: "남미산 원양 오징어 MFN/FTA",
    isLiveApi: false,  // Mock data: API 파싱 미구현, 정직 라벨링
    reliability: 96,
    chartType: "composed",
    xKey: "origin",
    bars: [
      { key: "mfn", color: "#3b82f6", name: "MFN 관세율 (%)" },
      { key: "fta", color: "#10b981", name: "FTA 관세율 (%)" }
    ],
    lines: [
      { key: "cost", color: "#f59e0b", name: "최종 랜딩 코스트 ($)", yAxisId: "right" }
    ],
    data: [
      { origin: "페루 (Tube)", mfn: 20, fta: 0, cost: 3200 },
      { origin: "아르헨 (원어)", mfn: 20, fta: 20, cost: 3800 },
      { origin: "포클랜드 (원어)", mfn: 20, fta: 20, cost: 4100 },
      { origin: "중국 (진미채)", mfn: 20, fta: 12, cost: 4500 }
    ],
    sit: "[HS Ping] 페루산(FTA 체결)과 아르헨산(미체결)간의 관세 격차가 랜딩 코스트에 직결됨.",
    strat: "가공용(Tube/Ring)은 페루산 무관세 쿼터를 적극 활용하고, 아르헨산은 해상 전재를 통한 우회 전략 검토.",
    source: "HS Ping & Tariffs.io (Mock fallback)"
  };

  return NextResponse.json(data);
}
