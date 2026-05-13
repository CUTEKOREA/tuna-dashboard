import json

file_path = 'public/data/mackerel_real_data_v11.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

w31 = {
  "id": "w31",
  "title": "EU 수입 단가 양극화: 아프리카 오프쇼어 가공 마진",
  "subtitle": "비(非)EU 국가별 고등어 수입 단가 추이 비교 (2021-2026, EUR/kg)",
  "chartType": "Line",
  "xKey": "year",
  "lines": [
    {"key": "Cape_Verde", "color": "#ec4899"},
    {"key": "Morocco", "color": "#f59e0b"},
    {"key": "UK", "color": "#94a3b8"},
    {"key": "Korea", "color": "#ef4444"}
  ],
  "data": [
    {"year": "2021", "Cape_Verde": 6.42, "Morocco": 3.01, "UK": 1.63, "Korea": 1.77},
    {"year": "2022", "Cape_Verde": 6.57, "Morocco": 4.53, "UK": 1.84, "Korea": 1.64},
    {"year": "2023", "Cape_Verde": 7.62, "Morocco": 4.17, "UK": 2.17, "Korea": 0.85},
    {"year": "2024", "Cape_Verde": 7.29, "Morocco": 4.50, "UK": 1.98, "Korea": 1.39},
    {"year": "2025", "Cape_Verde": 7.88, "Morocco": 4.04, "UK": 2.79, "Korea": 1.10},
    {"year": "2026", "Cape_Verde": 7.20, "Morocco": 5.47, "UK": 4.30, "Korea": 1.73}
  ],
  "logic": "Eurostat의 제3국 수입 데이터(Third Country Imports)를 분석하여, 원어(한국/영국)와 가공품(카보베르데/모로코) 간의 수입 단가 스프레드를 시각화함.",
  "sit": "스페인 등 EU 거대 식품기업들은 인건비가 싼 카보베르데와 모로코에 통조림/가공 공장(Offshore)을 구축하고 역수입하여 7~8 EUR/kg의 초고도 단가를 누리고 있습니다. 반면 한국산 고등어는 1.15 EUR/kg 수준의 단순 원물 취급을 벗어나지 못하고 있습니다.",
  "tak": "단순 원물 판매의 시대는 끝났습니다. 카보베르데 모델을 벤치마킹하여, 아프리카 또는 동남아 등 저비용 제조 기지(Offshore Hub)를 활용한 캔/필렛 가공 우회 수출 파이프라인을 구축해야 합니다.",
  "unit": "수입 단가 (EUR/kg)"
}

data['widgets'] = [w for w in data['widgets'] if w['id'] != 'w31']
data['widgets'].append(w31)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("w31 injected successfully.")
