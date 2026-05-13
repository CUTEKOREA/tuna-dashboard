import json

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widgets = [
  {
    "id": "w32_species_margin",
    "title": "주요 어종별 마진 비교: 가다랑어 vs 황다랑어",
    "subtitle": "글로벌 원어 수입가 대비 가공(Prepared) 수출가의 3배 마진 증폭 (2024)",
    "chartType": "bar",
    "xAxis": "species",
    "unit": "€/kg",
    "source": "Eurostat (COMEXT 2024)",
    "logic": "1.어종별 Frozen 수입가 산출 -> 2.어종별 Prepared 수출가 산출 -> 3.가격 상승 배수 비교",
    "desc_tooltip": "가다랑어(Skipjack)와 황다랑어(Yellowfin)가 가공을 거쳤을 때 가치가 얼마나 폭발적으로 상승하는지 비교합니다.",
    "bars": [
      { "key": "raw_price", "name": "원어 수입가 (€)", "color": "#94a3b8" },
      { "key": "prep_price", "name": "가공 수출가 (€)", "color": "#f59e0b" }
    ],
    "data": [
      { "species": "가다랑어 (Skipjack)", "raw_price": 1.67, "prep_price": 5.94 },
      { "species": "황다랑어 (Yellowfin)", "raw_price": 2.83, "prep_price": 8.82 }
    ],
    "sit": "대중성 어종인 가다랑어는 €1.67에서 €5.94로 3.55배 마진 폭발을 일으키며 물량을 견인하고, 고급 어종인 황다랑어는 €2.83에서 €8.82로 3.12배 뛰어오르며 절대 수익금을 극대화합니다.",
    "tak": "단순 어획량(Volume) 경쟁에서 벗어나, 황다랑어 가공 라인을 확장하여 병/파우치 형태의 프리미엄 제품군으로 포트폴리오를 다각화해야 합니다."
  },
  {
    "id": "w33_spain_vs_france",
    "title": "EU 가공 마진 비교: 스페인 vs 프랑스",
    "subtitle": "수입 원어의 단가와 가공 출하 규모(Volume)의 양극화 (2022)",
    "chartType": "composed",
    "xAxis": "country",
    "unit": "€/kg | 만 톤",
    "source": "Eurostat (Processing & COMEXT 2022)",
    "logic": "1.국가별 Frozen 원어 수입 단가 -> 2.국가별 가공물량(Volume)",
    "desc_tooltip": "스페인의 거대한 볼륨(Volume) 기반 통조림 가공 산업과 프랑스의 하이엔드(High-end) 생식/프리미엄 원어 소비 시장의 차이를 보여줍니다.",
    "bars": [
      { "key": "raw_import_price", "name": "원어 수입가 (€)", "color": "#ec4899", "yAxisId": "left" }
    ],
    "lines": [
      { "key": "processing_volume", "name": "가공 물량 (만 톤)", "color": "#3b82f6", "yAxisId": "right" }
    ],
    "data": [
      { "country": "스페인 (Spain)", "raw_import_price": 3.39, "processing_volume": 31.5 },
      { "country": "프랑스 (France)", "raw_import_price": 8.99, "processing_volume": 1.19 }
    ],
    "sit": "스페인은 저가 원어를 대량 수입(€3.39)하여 31.5만 톤의 거대한 통조림 가공을 주도하는 반면, 프랑스는 초고가 원어(€8.99)를 수입하여 가공보다는 생식(Sashimi)과 하이엔드 다이닝 소비에 집중하고 있습니다.",
    "tak": "당사는 '가공/유통의 허브'인 스페인과 '하이엔드 다이닝 시장'인 프랑스의 투트랙(Two-track) 시장 특성을 이해하고, 각각 통조림 B2B와 프리미엄 원어 B2C 납품 전략을 분리하여 접근해야 합니다."
  }
]

for new_widget in new_widgets:
    if not any(w.get('id') == new_widget['id'] for w in data['widgets']):
        data['widgets'].append(new_widget)

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("2 Widgets appended successfully.")
