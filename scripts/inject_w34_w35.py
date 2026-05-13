import json

file_path = 'public/data/mackerel_real_data_v11.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

w34 = {
  "id": "w34",
  "title": "콜드체인 아비트라지 (Cold Chain Arbitrage)",
  "subtitle": "유럽 주간 위판가(First Sale) 계절성: 덤핑(여름) vs 숏스퀴즈(겨울)",
  "chartType": "Composed",
  "xKey": "week",
  "bars": [
    {"key": "Volume_Tons", "color": "#38bdf8", "yAxisId": "right"}
  ],
  "lines": [
    {"key": "Price_EUR", "color": "#f43f5e", "yAxisId": "left"}
  ],
  "data": [
    {"week": "W02(Jan)", "Volume_Tons": 4094, "Price_EUR": 1.60},
    {"week": "W12(Mar)", "Volume_Tons": 59371, "Price_EUR": 1.17},
    {"week": "W22(May)", "Volume_Tons": 16498, "Price_EUR": 1.10},
    {"week": "W30(Jul)", "Volume_Tons": 17436, "Price_EUR": 0.79},
    {"week": "W38(Sep)", "Volume_Tons": 18651, "Price_EUR": 0.78},
    {"week": "W50(Dec)", "Volume_Tons": 4715, "Price_EUR": 1.33}
  ],
  "logic": "First_sale_weekly_by_ERS 데이터를 통해, 주차별 고등어 어획량과 단가 역의 상관관계(Inverse Correlation)를 도출함.",
  "sit": "놀라운 계절성입니다. 여름(W30~W38)에는 물량이 쏟아지며 가격이 0.78 EUR/kg로 '덤핑'되지만, 겨울(W01~W05)에는 조업이 줄며 1.60 EUR/kg 이상으로 '숏스퀴즈'가 발생합니다. (변동폭 +105%)",
  "tak": "단순 어획을 넘어 '시간(Time)을 파는 전략'이 필요합니다. 여름철 덤핑 시즌에 원물을 대거 매입/비축하고, 겨울철 숏스퀴즈 시즌에 방출하는 초저온 콜드스토리지(Cold Storage) 아비트라지 거래를 시작해야 합니다.",
  "unit": "물량(Tons), 단가(EUR)"
}

w35 = {
  "id": "w35",
  "title": "가치 진화 폭발: 냉동의 덫 (The Frozen Trap)",
  "subtitle": "보존 상태(Preservation)별 고등어 수출입 평균 단가 (2024년)",
  "chartType": "Bar",
  "xKey": "preservation",
  "bars": [
    {"key": "Avg_Price_EUR", "color": "#10b981"}
  ],
  "data": [
    {"preservation": "Frozen (냉동)", "Avg_Price_EUR": 1.84},
    {"preservation": "Fresh (생물)", "Avg_Price_EUR": 2.10},
    {"preservation": "Smoked (훈제)", "Avg_Price_EUR": 5.41},
    {"preservation": "Canned (통조림/보존)", "Avg_Price_EUR": 5.62}
  ],
  "logic": "2024_Trade_data_reported_by_EU_countries의 보존 상태(Preservation)별 거래량/금액을 분석하여 부가가치 사다리(Value Ladder)를 증명함.",
  "sit": "유럽 시장의 명확한 시그널입니다. 냉동(Frozen) 상태로는 아무리 잘 팔아도 1.84 EUR의 한계에 갇힙니다. 하지만 훈제(Smoked)나 통조림(Canned)으로 변환하는 순간 가치는 5.62 EUR로 300% 이상 펌핑됩니다.",
  "tak": "한국 수산업계는 여전히 '냉동(Frozen) 원물' 수출의 덫에 빠져있습니다. 조업량을 늘리기보다, 원물을 훈제/통조림으로 전환하는 '스마트 프로세싱(Smart Processing)' 설비 투자만이 살 길입니다.",
  "unit": "평균 거래 단가 (EUR/kg)"
}

data['widgets'] = [w for w in data['widgets'] if w['id'] not in ['w34', 'w35']]
data['widgets'].append(w34)
data['widgets'].append(w35)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("w34, w35 injected successfully.")
