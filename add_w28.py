import json

path = 'public/data/mackerel_real_data_v11.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

w28 = {
  "id": "w28",
  "title": "유럽 고등어 아비트리지 맵 (EU Arbitrage Map)",
  "subtitle": "2025 유로스타트 기준: 경제적 목적에 따른 고등어 평균 단가 차이",
  "chartType": "Bar",
  "xKey": "name",
  "unit": "€",
  "logic": "Data: Eurostat (2025) Trade Data reported by EU countries. 추출 조건: main_commercial_species='Mackerel'. 국가별 거래대금/물량을 연산하여 단가 도출.",
  "bars": [
    { "key": "Price (€/kg)", "color": "#ec4899" }
  ],
  "data": [
    { "name": "몰타 (수입/참치사료)", "Price (€/kg)": 0.78 },
    { "name": "네덜란드 (수입/도매)", "Price (€/kg)": 2.43 },
    { "name": "네덜란드 (수출/환적)", "Price (€/kg)": 2.76 },
    { "name": "폴란드 (수입/원물)", "Price (€/kg)": 2.96 },
    { "name": "폴란드 (수출/가공)", "Price (€/kg)": 5.49 },
    { "name": "이탈리아 (수입/소비)", "Price (€/kg)": 5.74 }
  ],
  "takeaway": {
    "title": "💡 Value-Add & Arbitrage",
    "desc": "고등어는 단일 상품이 아닙니다. 몰타는 고급 참치 양식 사료용으로 0.78€에 수입하며, 폴란드는 원물을 수입해 가공(필렛/훈제) 후 85%의 프리미엄(5.49€)을 붙여 수출합니다. 가공 인프라와 시장 포지셔닝에 따라 가격이 최대 7배(0.78€ ➔ 5.74€) 벌어집니다."
  }
}

# Add w28 if it doesn't exist
if not any(w['id'] == 'w28' for w in data['widgets']):
    data['widgets'].append(w28)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("w28 added successfully.")
else:
    print("w28 already exists.")

