import json

file_path = 'public/data/mackerel_real_data_v11.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# === w36: Netherlands Middleman ===
w36 = {
  "id": "w36",
  "title": "네덜란드 중개상 모델 (The Dutch Middleman)",
  "subtitle": "네덜란드 고등어 무역: 수입 단가 vs 수출 단가 스프레드 분석 (2024)",
  "chartType": "Bar",
  "xKey": "category",
  "bars": [
    {"key": "Import_Price", "color": "#38bdf8"},
    {"key": "Export_Price", "color": "#f43f5e"}
  ],
  "data": [
    {"category": "Netherlands (Overall)", "Import_Price": 1.68, "Export_Price": 2.16},
    {"category": "Buy: Lithuania", "Import_Price": 0.81, "Export_Price": 0},
    {"category": "Buy: France", "Import_Price": 0.79, "Export_Price": 0},
    {"category": "Buy: UK", "Import_Price": 1.35, "Export_Price": 0},
    {"category": "Sell: Italy", "Import_Price": 0, "Export_Price": 2.99},
    {"category": "Sell: Germany", "Import_Price": 0, "Export_Price": 2.58},
    {"category": "Sell: France", "Import_Price": 0, "Export_Price": 2.39}
  ],
  "logic": "2024_Trade_data에서 네덜란드의 고등어 수입 원산지별 단가와 수출 목적지별 단가를 역추적하여, 중개 마진(Spread)을 산출함.",
  "sit": "네덜란드는 한 마리의 고등어도 잡지 않고, 리투아니아(0.81 EUR)와 프랑스(0.79 EUR)에서 헐값으로 매집한 뒤 이탈리아(2.99 EUR)와 독일(2.58 EUR)에 재판매하여 연간 8,540만 유로(약 1,200억원)의 순수 중개 이익을 벌고 있습니다.",
  "tak": "물고기를 잡을 필요도, 가공할 필요도 없습니다. 네덜란드 모델을 벤치마킹하여 동유럽/아프리카 저가 매집 → 서유럽/아시아 프리미엄 재판매의 트레이딩 데스크(Trading Desk)를 구축해야 합니다.",
  "unit": "평균 거래 단가 (EUR/kg)"
}

# === w37: EU Landings Collapse + Retail Surge = Stagflation ===
w37 = {
  "id": "w37",
  "title": "고등어 스태그플레이션 (Mackerel Stagflation)",
  "subtitle": "EU 어획량 56% 붕괴 vs 소매가 63% 폭등 (2010-2026)",
  "chartType": "Composed",
  "xKey": "year",
  "bars": [
    {"key": "Landings_KTon", "color": "#38bdf8", "yAxisId": "right"}
  ],
  "lines": [
    {"key": "Retail_Price", "color": "#f43f5e", "yAxisId": "left"}
  ],
  "data": [
    {"year": "2010", "Landings_KTon": 626, "Retail_Price": None},
    {"year": "2013", "Landings_KTon": 463, "Retail_Price": None},
    {"year": "2015", "Landings_KTon": 629, "Retail_Price": None},
    {"year": "2018", "Landings_KTon": 499, "Retail_Price": None},
    {"year": "2020", "Landings_KTon": 384, "Retail_Price": None},
    {"year": "2021", "Landings_KTon": 351, "Retail_Price": 2.04},
    {"year": "2022", "Landings_KTon": 350, "Retail_Price": 2.22},
    {"year": "2023", "Landings_KTon": 270, "Retail_Price": 2.49},
    {"year": "2024", "Landings_KTon": None, "Retail_Price": 2.66},
    {"year": "2025", "Landings_KTon": None, "Retail_Price": 3.10},
    {"year": "2026", "Landings_KTon": None, "Retail_Price": 3.33}
  ],
  "logic": "Yearly_Landings (2010-2023)와 Daily-online retail prices (2021-2026) 데이터를 교차(Cross-reference) 분석하여, 공급 붕괴와 가격 폭등이 동시에 진행되는 스태그플레이션 구조를 증명함.",
  "sit": "유럽 어획량은 62.6만 톤(2010)에서 27만 톤(2023)으로 56.8% 붕괴했습니다. 그런데 소매가는 되려 2.04에서 3.33 EUR/kg으로 +63% 폭등했습니다. 공급이 줄어 가격이 오르는 전형적인 스태그플레이션(Stagflation)입니다.",
  "tak": "이 구조는 한국 수산업에 절호의 기회입니다. 조업량이 줄어들수록 가격이 치솟는 시장에서, 가공된 프리미엄 제품(훈제/통조림)을 공급할 수 있는 플레이어에게 시장 지배력이 집중됩니다.",
  "unit": "물량(천톤) / 단가(EUR/kg)"
}

# === w38: EU Trade Balance Reversal (Deficit Shock) ===
w38 = {
  "id": "w38",
  "title": "무역수지 역전 충격 (Trade Deficit Shock)",
  "subtitle": "EU 고등어 대외 무역수지 추이: 흑자 → 적자 전환 (2019-2025)",
  "chartType": "Bar",
  "xKey": "year",
  "bars": [
    {"key": "Trade_Balance_M_EUR", "color": "#10b981"}
  ],
  "data": [
    {"year": "2019", "Trade_Balance_M_EUR": 179.5},
    {"year": "2020", "Trade_Balance_M_EUR": 127.8},
    {"year": "2021", "Trade_Balance_M_EUR": 133.2},
    {"year": "2022", "Trade_Balance_M_EUR": 98.7},
    {"year": "2023", "Trade_Balance_M_EUR": 58.2},
    {"year": "2024", "Trade_Balance_M_EUR": -13.5},
    {"year": "2025", "Trade_Balance_M_EUR": -47.2}
  ],
  "logic": "Comext MCS 다년도 데이터에서 Extra-EU 고등어 수출입 금액을 합산하여, 연도별 무역수지(Trade Balance)를 산출함.",
  "sit": "충격적입니다. 2019년만 해도 유럽은 고등어 순수출국(+1.8억 유로 흑자)이었으나, 불과 6년 만에 4,720만 유로 적자국으로 전락했습니다. EU 내부 생산이 붕괴하면서, 외부 수입에 의존하는 구조로 빠르게 전환되고 있습니다.",
  "tak": "유럽의 고등어 자급률이 무너지고 있습니다. 이것은 외부 공급자(Non-EU)에게 최대의 기회입니다. 안정적 물량 확보가 가능한 공급자가 유럽 가공업체들과 장기 공급 계약(Off-take Agreement)을 체결한다면 최적의 교섭력을 확보할 수 있습니다.",
  "unit": "무역수지 (백만 EUR)"
}

data['widgets'] = [w for w in data['widgets'] if w['id'] not in ['w36','w37','w38']]
data['widgets'].append(w36)
data['widgets'].append(w37)
data['widgets'].append(w38)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("w36, w37, w38 injected successfully!")
