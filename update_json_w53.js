const fs = require('fs');
const path = './public/data/tuna_real_data_v3.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const newWidgets = [
  {
    "id": "w53_enso_radar",
    "title": "ENSO Catch Redistribution Radar",
    "subtitle": "엘니뇨 기후 패턴에 따른 스킵잭 어획 핫스팟 중심 이동 및 선단 재배치",
    "unit": "Catch Probability (%) / Longitude",
    "chartType": "composed",
    "xKey": "Longitude",
    "data": [
      { "Longitude": "130°E", "La Niña (Normal)": 85, "El Niño (Heat)": 20 },
      { "Longitude": "150°E", "La Niña (Normal)": 95, "El Niño (Heat)": 40 },
      { "Longitude": "170°E", "La Niña (Normal)": 50, "El Niño (Heat)": 85 },
      { "Longitude": "170°W", "La Niña (Normal)": 20, "El Niño (Heat)": 95 },
      { "Longitude": "150°W", "La Niña (Normal)": 5, "El Niño (Heat)": 75 }
    ],
    "bars": [
      { "key": "La Niña (Normal)", "color": "#38bdf8" },
      { "key": "El Niño (Heat)", "color": "#ef4444" }
    ],
    "sit": "ENSO 기후 모델링(Wang et al.) 분석 결과, 엘니뇨 발달 시 서부 태평양의 어획 중심축이 동경 150도에서 서경 170도 부근(중서부)으로 대거 이동하는 현상 포착.",
    "strat": "엘니뇨 예보 시 PNA 서부 해역의 입어권 비중을 축소하고, 키리바시 및 적도 동부 수역 조업권 선제 확보 및 유류 보급선 궤도 수정 필수.",
    "source": "Wang et al. (Modeling Skipjack Fishery Distribution under ENSO)",
    "methodology": "해수면 온도 변동에 따른 참치 군집 이동 위도/경도 확률 통계 모델 차용."
  },
  {
    "id": "w54_mega_cannery_opex",
    "title": "Mega-Cannery OPEX Benchmark Simulator",
    "subtitle": "글로벌 1위 타이유니온 'Cost Reset' 자동화 투입 대비 마진 격차",
    "unit": "USD Millions & Margin %",
    "chartType": "composed",
    "xKey": "Quarter",
    "data": [
      { "Quarter": "Q1", "Cost (Traditional)": 80, "Cost (Automated)": 65, "Traditional Margin": 10.5, "TU Margin": 16.2 },
      { "Quarter": "Q2", "Cost (Traditional)": 82, "Cost (Automated)": 63, "Traditional Margin": 10.0, "TU Margin": 17.5 },
      { "Quarter": "Q3", "Cost (Traditional)": 85, "Cost (Automated)": 60, "Traditional Margin": 9.2, "TU Margin": 18.9 },
      { "Quarter": "Q4", "Cost (Traditional)": 83, "Cost (Automated)": 58, "Traditional Margin": 9.5, "TU Margin": 19.5 }
    ],
    "bars": [
      { "key": "Cost (Traditional)", "color": "#94a3b8", "yAxisId": "left" },
      { "key": "Cost (Automated)", "color": "#10b981", "yAxisId": "left" }
    ],
    "lines": [
      { "key": "Traditional Margin", "color": "#64748b", "yAxisId": "right" },
      { "key": "TU Margin", "color": "#f59e0b", "yAxisId": "right", "strokeWidth": 3 }
    ],
    "sit": "Thai Union이 6천만 달러 규모의 자동화(Cost Reset) 투자를 통해 인건비를 대폭 절감하며 18.9%라는 역대 최대 매출총이익률을 달성함.",
    "strat": "단순 노무에 의존하는 재래식 가공 공정 유지 시 글로벌 원가 경쟁력 상실 위험. 즉각적인 VSD 설비 등 로보틱스 CAPEX 예산 편성 요망.",
    "source": "Thai Union Group Financial Results 2025",
    "methodology": "실제 분기별 가공 비용과 공시된 영업 이익률(GPM) 궤적을 중첩 비교."
  },
  {
    "id": "w55_emerging_route",
    "title": "Emerging Market Trade Route Arbitrage",
    "subtitle": "베트남 가공 공장 경유 중동/아프리카 우회 수출 운임-관세 차익",
    "unit": "USD / Container",
    "chartType": "bar",
    "xKey": "Route",
    "data": [
      { "Route": "Direct to EU (Korea)", "Freight Cost": 4500, "Tariff Penalty": 2400, "Net Margin": 1200 },
      { "Route": "Direct to US (Korea)", "Freight Cost": 3800, "Tariff Penalty": 1500, "Net Margin": 1800 },
      { "Route": "Via VN to Middle East", "Freight Cost": 1500, "Tariff Penalty": 0, "Net Margin": 3500 },
      { "Route": "Via VN to Egypt", "Freight Cost": 1800, "Tariff Penalty": 500, "Net Margin": 2900 }
    ],
    "bars": [
      { "key": "Freight Cost", "color": "#ef4444" },
      { "key": "Tariff Penalty", "color": "#f97316" },
      { "key": "Net Margin", "color": "#10b981" }
    ],
    "sit": "EU/US 직접 수출 시 운임(SCFI)과 비관세 장벽으로 인한 수익성 훼손이 큼. 반면 베트남을 경유한 이집트, 중동(MENA) 수출 루트의 마진율이 2배 이상 높게 나타남.",
    "strat": "동남아시아(베트남) 거점 가공 물량을 EU 대신 중동 및 북아프리카 신흥 소비 시장으로 전면 전환(Pivot)하는 무역 우회 전략 실행.",
    "source": "Vietnam Seafood Export Statistics 2024-25 / Middle East Seafood Market",
    "methodology": "해상 운임, 관세, 통관 후 도매 차익을 합산한 항로별 최종 Net Margin 도출."
  },
  {
    "id": "w56_eu_oligopsony",
    "title": "European Oligopsony Market Power Index",
    "subtitle": "EU 소매 유통사의 구매 독과점 권력 및 납품가 마진 흡수율 진단",
    "unit": "Price Index (Base=100)",
    "chartType": "area",
    "xKey": "Year",
    "data": [
      { "Year": "2020", "Ex-Vessel Price": 100, "Wholesale Price": 105, "Retail Price": 110 },
      { "Year": "2022", "Ex-Vessel Price": 115, "Wholesale Price": 112, "Retail Price": 140 },
      { "Year": "2024", "Ex-Vessel Price": 108, "Wholesale Price": 110, "Retail Price": 165 },
      { "Year": "2025", "Ex-Vessel Price": 110, "Wholesale Price": 115, "Retail Price": 195 }
    ],
    "areas": [
      { "key": "Retail Price", "color": "#ec4899" },
      { "key": "Wholesale Price", "color": "#38bdf8" },
      { "key": "Ex-Vessel Price", "color": "#94a3b8" }
    ],
    "sit": "유럽 대형 소매 체인의 독과점(Oligopsony) 지배력 강화로, 원어(Ex-vessel) 및 도매 납품가 상승분은 철저히 억제되나 최종 소매가만 폭등하는 비대칭 가격 전가(Asymmetric transmission) 발생.",
    "strat": "EU 대형 유통 채널(Tesco, Carrefour 등) PB 납품 비중 축소. D2C 자사몰 중심의 프리미엄 브랜드 현지 직접 진출로 마진 탈환 시급.",
    "source": "MARKET POWER AND THE EUROPEAN TUNA OLIGOPSONY",
    "methodology": "어획가, 도매가, 소매가 3단계의 시계열 지수(Index) 스프레드를 구조적 I.O. 모델로 역산."
  },
  {
    "id": "w57_alt_protein",
    "title": "Alternative Protein & Pet Care Cannibalization",
    "subtitle": "식물성 참치 및 프리미엄 펫푸드의 전통 인간용 캔 시장 잠식률 추적",
    "unit": "Market Share (%)",
    "chartType": "composed",
    "xKey": "Year",
    "data": [
      { "Year": "2020", "Traditional Canned (Human)": 92, "Premium Pet Food": 6, "Vegan Tuna": 2 },
      { "Year": "2022", "Traditional Canned (Human)": 85, "Premium Pet Food": 10, "Vegan Tuna": 5 },
      { "Year": "2024", "Traditional Canned (Human)": 76, "Premium Pet Food": 15, "Vegan Tuna": 9 },
      { "Year": "2026(E)", "Traditional Canned (Human)": 65, "Premium Pet Food": 21, "Vegan Tuna": 14 }
    ],
    "bars": [
      { "key": "Premium Pet Food", "color": "#10b981", "stackId": "a" },
      { "key": "Vegan Tuna", "color": "#ec4899", "stackId": "a" },
      { "key": "Traditional Canned (Human)", "color": "#94a3b8", "stackId": "a" }
    ],
    "sit": "영국 Tesco 등 주요 리테일에서 Good Catch 등 식물성 참치 입점 및 매출이 14% 상승. MSC 인증 프리미엄 고양이 참치캔 지출액도 2,500만 파운드를 돌파하며 전통 캔 시장을 맹렬히 잠식 중.",
    "strat": "전통적인 저가 인간용 캔(Chunk/Flake) 생산 라인을 고수익 펫푸드(Pet Care) 라인으로 긴급 전환(Retrofit)하고, 대체육 원천 기술 기업 지분 투자 검토.",
    "source": "UK and Ireland Market Report 2025 / Vegan Tuna Market Size",
    "methodology": "엔드유저 소비 세그먼트별 CAGR(연평균 성장률)을 적용한 100% Stacked 영역 시뮬레이션."
  }
];

const existIds = new Set(data.widgets.map(w => w.id));
let addedCount = 0;
newWidgets.forEach(w => {
  if (!existIds.has(w.id)) {
    data.widgets.push(w);
    addedCount++;
  }
});

if (addedCount > 0) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Added ${addedCount} widgets successfully.`);
} else {
  console.log('Widgets already exist.');
}
