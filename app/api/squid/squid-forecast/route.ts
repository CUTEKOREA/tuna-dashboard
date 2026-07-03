import { NextResponse } from 'next/server';

export const revalidate = 3600;

// 정직 STATIC: agri_data squid_unit_price.json 실측(2018-2023). 기존 'AI 예측' mock 제거.
export async function GET() {
  const data = {
    id: "w_squid_price_forecast",
    title: "오징어 원물 수입단가 추이 (원산지별)",
    subtitle: "FAO/UN Comtrade 수입단가 실측 — 남미산 원물 vs 한국산",
    isLiveApi: false,
    isLive: false,
    reliability: 88,
    chartType: "composed",
    xKey: "year",
    bars: [
      { key: "peru", color: "#3b82f6", name: "페루 ($/t)" },
      { key: "argentina", color: "#10b981", name: "아르헨티나 ($/t)" }
    ],
    lines: [
      { key: "korea", color: "#f59e0b", name: "한국 ($/t)", yAxisId: "right" }
    ],
    data: [
      { year: "2018", peru: 3010, argentina: 2572, korea: 4139 },
      { year: "2019", peru: 2465, argentina: 2492, korea: 4176 },
      { year: "2020", peru: 2058, argentina: 2669, korea: 5020 },
      { year: "2021", peru: 1727, argentina: 2059, korea: 3545 },
      { year: "2022", peru: 2407, argentina: 2146, korea: 3532 },
      { year: "2023", peru: 2060, argentina: 2269, korea: 4583 }
    ],
    unit: "USD/Ton",
    sit: "[실측 단가] 남미산 원물(페루 $2,060/t·아르헨티나 $2,269/t, 2023)은 한국산($4,583/t)의 절반 이하로, 가공용 원물 소싱의 핵심 원가 레버입니다. 페루산은 2018년 $3,010에서 2021년 $1,727까지 급락 후 반등하는 등 어획량(ENSO)에 따른 변동성이 큽니다.",
    strat: "남미산 단가가 저점(라니냐 풍어기)일 때 선도계약으로 가공용 원물을 선확보하고, 한국산은 프리미엄 활·신선 채널에 집중 배분하여 원가-가치 이원화 전략을 취하십시오.",
    source: "FAO/UN Comtrade 수입단가 실측 2018-2023 (agri_data squid_unit_price.json)"
  };
  return NextResponse.json(data);
}
