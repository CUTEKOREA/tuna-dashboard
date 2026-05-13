import json

file_path = 'public/data/mackerel_real_data_v11.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

w32 = {
  "id": "w32",
  "title": "EU 고등어 애그플레이션 (Agflation Shock)",
  "subtitle": "유럽 평균 고등어 소매가(Retail Price) 인플레이션 추이 (2021-2026)",
  "chartType": "Line",
  "xKey": "year",
  "lines": [
    {"key": "EU_Average_Price", "color": "#f43f5e"},
    {"key": "General_Food_Inflation", "color": "#94a3b8"}
  ],
  "data": [
    {"year": "2021", "EU_Average_Price": 2.04, "General_Food_Inflation": 2.00},
    {"year": "2022", "EU_Average_Price": 2.22, "General_Food_Inflation": 2.18},
    {"year": "2023", "EU_Average_Price": 2.49, "General_Food_Inflation": 2.39},
    {"year": "2024", "EU_Average_Price": 2.66, "General_Food_Inflation": 2.45},
    {"year": "2025", "EU_Average_Price": 3.10, "General_Food_Inflation": 2.50},
    {"year": "2026", "EU_Average_Price": 3.33, "General_Food_Inflation": 2.55}
  ],
  "logic": "Eurostat의 Daily-online retail prices 데이터를 분석하여, 5년간 고등어 소매가가 +63% 폭등한 거시경제(Macro) 트렌드를 도출함.",
  "sit": "고등어는 더 이상 '서민의 생선'이 아닙니다. EU 내 일반 식품 물가 상승률(약 +27%)을 아득히 초과하여, 5년 만에 소매가가 +63% 폭등하는 심각한 애그플레이션(Agflation) 자산으로 변모했습니다.",
  "tak": "원양어업의 조업량(Volume) 경쟁에서 벗어나야 합니다. 인플레이션 헷지(Hedge)가 가능한 프리미엄 가공 제품 포트폴리오를 보유하지 않으면, 치솟는 유가(OPEX)와 인건비를 감당할 수 없습니다.",
  "unit": "소매 단가 (EUR/kg)"
}

w33 = {
  "id": "w33",
  "title": "가공 패권의 이동 (Poland & France)",
  "subtitle": "EU 내 고등어 가공(Processing) 부가가치 창출액 Top 5 국가 (2022년 기준)",
  "chartType": "Bar",
  "xKey": "country",
  "bars": [
    {"key": "Processing_Value_M_EUR", "color": "#8b5cf6"}
  ],
  "data": [
    {"country": "Poland", "Processing_Value_M_EUR": 107.5},
    {"country": "France", "Processing_Value_M_EUR": 103.5},
    {"country": "Portugal", "Processing_Value_M_EUR": 54.8},
    {"country": "Bulgaria", "Processing_Value_M_EUR": 10.5},
    {"country": "Greece", "Processing_Value_M_EUR": 4.1}
  ],
  "logic": "Eurostat의 Yearly Processing 데이터를 기반으로, 수입된 원어가 어느 국가에서 가공되어 부가가치(EUR)로 변환되는지 파이프라인을 역추적함.",
  "sit": "놀랍게도 노르웨이나 영국 같은 주요 '어획 국가'가 아니라, 폴란드(훈제 가공)와 프랑스(통조림 및 고급 필렛)가 연간 1억 유로 이상의 거대한 고등어 가공 패권을 쥐고 있습니다.",
  "tak": "배를 띄워 물고기를 잡는 시대에서, 남의 물고기를 사다가 훈제와 통조림으로 만들어 파는 '가공 독점(Processing Monopoly)' 모델이 최종 승자입니다. 동유럽 훈제 공장 인수를 검토해야 합니다.",
  "unit": "백만 유로 (M EUR)"
}

data['widgets'] = [w for w in data['widgets'] if w['id'] not in ['w32', 'w33']]
data['widgets'].append(w32)
data['widgets'].append(w33)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("w32, w33 injected successfully.")
