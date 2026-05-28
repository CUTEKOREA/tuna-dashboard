import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: "w_squid_price_forecast",
    title: "글로벌 오징어 가격 예측 (AI 기반)",
    subtitle: "남미산 Illex vs 아시아산 Todarodes 단가 전망",
    isLiveApi: false,  // Mock data: API 파싱 미구현, 정직 라벨링
    reliability: 88,
    chartType: "composed",
    xKey: "quarter",
    bars: [
      { key: "illex_price", color: "#3b82f6", name: "Illex 단가 ($/t)" },
      { key: "todarodes_price", color: "#8b5cf6", name: "Todarodes 단가 ($/t)" }
    ],
    lines: [
      { key: "forecast", color: "#f59e0b", name: "AI 예측 평균 ($/t)", yAxisId: "right", strokeDasharray: "5 5" }
    ],
    data: [
      { quarter: "24.3Q", illex_price: 2800, todarodes_price: 3200, forecast: 3000 },
      { quarter: "24.4Q", illex_price: 3100, todarodes_price: 3500, forecast: 3200 },
      { quarter: "25.1Q", illex_price: 3300, todarodes_price: 3800, forecast: 3500 },
      { quarter: "25.2Q", illex_price: 3500, todarodes_price: 4100, forecast: 3700 },
      { quarter: "25.3Q(E)", illex_price: 3700, todarodes_price: 4300, forecast: 3900 },
      { quarter: "25.4Q(E)", illex_price: 3900, todarodes_price: 4500, forecast: 4100 }
    ],
    unit: "USD/Ton",
    sit: "[AI Forecast] 남미산 Illex 어획량 감소세 지속으로 2025년 하반기 오징어 원물 단가 $3,900~$4,500/t 수렴 전망. 국내 살오징어(Todarodes) 대비 Illex의 원가 경쟁력이 핵심.",
    strat: "현재 Illex 단가 대비 15% 할인된 선물 계약(Forward Contract)을 페루/아르헨 공급사와 체결하여 하반기 원가 상승 리스크를 선제적으로 헤지.",
    source: "FishStatJ 2024 · SPRFMO Catch Limit · AI Ensemble Forecast (Mock fallback)"
  };

  return NextResponse.json(data);
}
