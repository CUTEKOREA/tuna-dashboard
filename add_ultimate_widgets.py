import json

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widgets = [
  {
    "id": "w44_italy_retail_explosion",
    "title": "이탈리아 소매가 2년 만에 +72% 폭발",
    "subtitle": "2024년 €3.38 → 2026년 €5.82: 유럽에서 가장 급격한 참치 캔 인플레이션",
    "chartType": "composed",
    "xAxis": "country",
    "unit": "",
    "source": "Eurostat (Daily Online Retail Prices 2024 vs 2026)",
    "logic": "EU 14개국 온라인 소매 채널에서 '참치 캔(Canned Tuna)' 평균 판매가의 2개년 변동률 분석",
    "desc_tooltip": "실시간 온라인 소매 가격 추적 결과, 이탈리아의 참치 캔 가격이 2년 만에 72% 폭등한 반면, 그리스(-18%)·오스트리아(-16%)는 오히려 하락하는 극단적 양극화가 발생하고 있습니다.",
    "bars": [
      { "key": "p2024", "name": "2024년 소매가 (EUR)", "color": "#cbd5e1", "yAxisId": "left" },
      { "key": "p2026", "name": "2026년 소매가 (EUR)", "color": "#f43f5e", "yAxisId": "left" }
    ],
    "data": [
      { "country": "이탈리아", "p2024": 3.38, "p2026": 5.82 },
      { "country": "포르투갈", "p2024": 5.40, "p2026": 6.34 },
      { "country": "핀란드", "p2024": 2.61, "p2026": 2.93 },
      { "country": "독일", "p2024": 3.05, "p2026": 3.32 },
      { "country": "벨기에", "p2024": 3.17, "p2026": 3.35 },
      { "country": "스페인", "p2024": 3.54, "p2026": 3.51 },
      { "country": "프랑스", "p2024": 3.41, "p2026": 3.33 },
      { "country": "스웨덴", "p2024": 2.34, "p2026": 2.09 },
      { "country": "그리스", "p2024": 9.76, "p2026": 8.01 }
    ],
    "sit": "이탈리아의 참치 캔 소매 가격이 2024년 €3.38에서 2026년 €5.82로 불과 2년 만에 72% 폭등했습니다. 반면 그리스(-18%), 오스트리아(-16%)는 기존 고가에서 오히려 하락하는 가격 조정기에 접어들었습니다. 유럽 내 참치 캔 시장이 극심한 양극화(Polarization)에 빠져있습니다.",
    "tak": "이탈리아는 유럽에서 가장 격렬한 가격 인플레이션 전쟁이 벌어지고 있는 시장이자, 동시에 가격 인상을 '수용'하는 시장입니다. 당사는 이 인플레이션 파도에 올라타 프리미엄 제품을 이탈리아에 집중 투하하여 마진을 극대화해야 합니다."
  },
  {
    "id": "w45_skipjack_collapse",
    "title": "가다랑어 붕괴: 산지가 +34% 올라도 물량은 -51% 증발",
    "subtitle": "EU First Sale 경매장에서 목격되는 가다랑어 공급 위기 (2019 vs 2024)",
    "chartType": "composed",
    "xAxis": "species",
    "unit": "",
    "source": "Eurostat (First Sale Yearly 2019 vs 2024)",
    "logic": "EU 산지 경매(First Sale)에서 주요 어종별 가격 변동률과 물량 변동률의 교차 분석",
    "desc_tooltip": "가다랑어(Skipjack)의 산지 경매 물량이 5년 만에 반토막(-51%)났음에도 가격은 34% 올랐다는 것은, 공급이 수요를 따라가지 못하는 구조적 품귀 현상을 의미합니다.",
    "bars": [
      { "key": "vol_change", "name": "물량 변동률 (%)", "color": "#f43f5e", "yAxisId": "left" }
    ],
    "lines": [
      { "key": "price_change", "name": "가격 변동률 (%)", "color": "#0ea5e9", "yAxisId": "right" }
    ],
    "data": [
      { "species": "가다랑어 (Skipjack)", "vol_change": -51.0, "price_change": 33.6 },
      { "species": "황다랑어 (Yellowfin)", "vol_change": -13.8, "price_change": 28.3 },
      { "species": "참다랑어 (Bluefin)", "vol_change": 37.7, "price_change": -9.0 }
    ],
    "sit": "가다랑어(Skipjack)는 통조림의 절대적 원료이지만, EU 산지 경매 물량이 5년 사이 27,448톤에서 13,457톤으로 반토막(-51%)났습니다. 공급이 급감하니 가격은 €1.19에서 €1.59로 34% 상승했습니다. 반면, 참다랑어(Bluefin)는 축양(Ranching) 덕분에 물량이 38% 증가하며 오히려 가격이 9% 하락했습니다.",
    "tak": "통조림 산업의 원가 기반인 가다랑어가 구조적으로 귀해지고 있습니다. 이는 당사의 가다랑어 원어 확보 물량 자체가 곧 '전략 자산(Strategic Asset)'이 된다는 의미입니다. 장기 조업권·쿼터(Quota)를 확보하여 가격 상승기에 공급자 우위(Seller's Market)를 점유해야 합니다."
  },
  {
    "id": "w46_seasonal_arbitrage",
    "title": "주간 경매 시계열: 가다랑어 계절 스프레드 47%",
    "subtitle": "2월(€1.07) 매집 → 7월(€1.58) 매도: 연간 47.2%의 차익거래 기회",
    "chartType": "bar",
    "xAxis": "period",
    "unit": "EUR/kg",
    "source": "Eurostat (Weekly First Sale 2025)",
    "logic": "주간(Weekly) 산지 경매 가격의 52주 시계열 분석을 통한 계절성(Seasonality) 패턴 도출",
    "desc_tooltip": "가다랑어 산지 경매가는 매년 2월에 최저점(€1.07)을 찍고, 7~8월에 최고점(€1.58)에 도달합니다. 이 47%의 계절 스프레드는 매수-매도 타이밍만으로 확보 가능한 차익입니다.",
    "bars": [
      { "key": "skipjack", "name": "가다랑어 (EUR/kg)", "color": "#f59e0b" },
      { "key": "yellowfin", "name": "황다랑어 (EUR/kg)", "color": "#8b5cf6" }
    ],
    "data": [
      { "period": "2월 (최저)", "skipjack": 1.07, "yellowfin": 1.79 },
      { "period": "4월", "skipjack": 1.22, "yellowfin": 2.35 },
      { "period": "6월", "skipjack": 1.41, "yellowfin": 2.78 },
      { "period": "7월 (최고)", "skipjack": 1.58, "yellowfin": 3.02 },
      { "period": "10월", "skipjack": 1.35, "yellowfin": 2.55 },
      { "period": "12월", "skipjack": 1.18, "yellowfin": 2.10 }
    ],
    "sit": "가다랑어의 산지 경매가는 매년 겨울(1~2월)에 €1.07/kg까지 하락하고, 여름(7~8월)에 €1.58/kg으로 치솟습니다. 황다랑어도 동일한 패턴으로 €1.79에서 €3.02까지 움직이며, 계절 스프레드가 69%에 달합니다.",
    "tak": "이것은 '금융 트레이딩'과 동일한 패턴입니다. 2월에 냉동 원어를 대량 매집(Buy Low)하고, 7월에 가공 공장에 프리미엄을 붙여 납품(Sell High)하면 47~69%의 시즌 차익을 확보할 수 있습니다. 냉동 창고(Cold Storage) 확보가 핵심입니다."
  },
  {
    "id": "w47_korea_thailand_pipeline",
    "title": "한국 원어 → 태국 가공 → EU 수출: 숨겨진 파이프라인",
    "subtitle": "한국산 원어 10.7만 톤이 태국으로 흘러들어, €3.97 완제품으로 EU에 재수출",
    "chartType": "bar",
    "xAxis": "destination",
    "unit": "",
    "source": "Eurostat (TDM 2024, non-EU Trade Reports)",
    "logic": "한국(KR)의 참치 수출 목적지와 태국(TH)의 완제품 수출량 교차 분석",
    "desc_tooltip": "한국 선단이 잡은 원어가 €1.10/kg에 태국으로 넘어간 뒤, 태국 공장에서 캔으로 가공되어 €3.97/kg에 유럽으로 재수출되는 거대한 '숨겨진 파이프라인'이 존재합니다.",
    "bars": [
      { "key": "volume", "name": "수출량 (만 톤)", "color": "#14b8a6" },
      { "key": "price", "name": "수출 단가 (EUR/kg)", "color": "#f59e0b" }
    ],
    "data": [
      { "destination": "한국→태국 (원어)", "volume": 10.72, "price": 1.10 },
      { "destination": "한국→중국 (원어)", "volume": 4.20, "price": 1.84 },
      { "destination": "한국→일본 (원어)", "volume": 1.97, "price": 6.89 },
      { "destination": "태국→EU (완제품)", "volume": 57.95, "price": 3.97 }
    ],
    "sit": "한국 원양 선단은 2024년 10.7만 톤의 참치 원어를 €1.10/kg에 태국으로 수출합니다. 태국은 이 원어를 가공하여 €3.97/kg의 완제품(Prepared)으로 변환한 뒤, 연간 57.9만 톤을 EU에 수출합니다. 부가가치의 261%가 태국 가공 공장에 귀속되고 있습니다.",
    "tak": "한국 선단이 잡은 원어의 부가가치를 태국이 독식하고 있습니다. 당사는 '한국 원어 → 태국 가공 → EU 수출'의 3단 파이프라인 중간에 직접 개입하거나, 자체 가공 역량을 확보하여 €1.10에서 €3.97로 올라가는 261%의 부가가치 마진을 내재화(Internalize)해야 합니다."
  }
]

for new_widget in new_widgets:
    if not any(w.get('id') == new_widget['id'] for w in data['widgets']):
        data['widgets'].append(new_widget)

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Widgets w44, w45, w46, w47 appended successfully.")
