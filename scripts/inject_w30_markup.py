import json

file_path = 'public/data/mackerel_real_data_v11.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Data we got from the eu analysis
w30 = {
  "id": "w30",
  "title": "EU 고등어 리테일 마크업 (Value-Add Multiplier)",
  "subtitle": "산지 위판가(First Sale) 대비 최종 소비자가(Retail) 가격 증폭 비율 (2021-2026)",
  "chartType": "Line",
  "xKey": "year",
  "lines": [
    {"key": "Spain_Markup", "color": "#ef4444"},
    {"key": "France_Markup", "color": "#3b82f6"},
    {"key": "Ireland_Markup", "color": "#10b981"},
    {"key": "Netherlands_Markup", "color": "#f59e0b"}
  ],
  "data": [
    {"year": "2021", "Spain_Markup": 2.21, "France_Markup": 2.05, "Ireland_Markup": 2.22, "Netherlands_Markup": 1.81},
    {"year": "2022", "Spain_Markup": 2.85, "France_Markup": 2.45, "Ireland_Markup": 2.20, "Netherlands_Markup": 2.09},
    {"year": "2023", "Spain_Markup": 3.01, "France_Markup": 2.30, "Ireland_Markup": 2.44, "Netherlands_Markup": 2.10},
    {"year": "2024", "Spain_Markup": 3.12, "France_Markup": 2.38, "Ireland_Markup": 2.21, "Netherlands_Markup": 2.17},
    {"year": "2025", "Spain_Markup": 3.35, "France_Markup": 2.40, "Ireland_Markup": 2.10, "Netherlands_Markup": 2.25},
    {"year": "2026", "Spain_Markup": 3.65, "France_Markup": 2.55, "Ireland_Markup": 1.94, "Netherlands_Markup": 2.30}
  ],
  "logic": "Eurostat의 First Sale Price(선단 위판가)와 Online Retail Price(소매가)의 격차 배수를 도출하여, 원어를 가공(통조림/훈제 등)했을 때 창출되는 초과 부가가치(Margin)를 산출함.",
  "sit": "스페인은 고등어를 1.15 EUR/kg에 매입해 가공품(올리브유 절임 등)으로 4.22 EUR/kg에 판매하며 무려 365%의 마크업(Multiplier 3.65)을 창출하고 있습니다.",
  "tak": "단순 원어 수출(Trading)을 넘어, 스페인/프랑스 수준의 고부가가치 가공(Value-Add) 허브를 내재화해야만 글로벌 인플레이션 및 원가 상승을 방어하고 마진을 3배 이상 극대화할 수 있습니다.",
  "unit": "배수 (x)"
}

# Remove existing w30 if it exists
data['widgets'] = [w for w in data['widgets'] if w['id'] != 'w30']
data['widgets'].append(w30)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("w30 injected successfully.")
