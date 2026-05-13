import json

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widget = {
  "id": "w31_italy_multiplier",
  "title": "이탈리아 프리미엄 소매 시장: 10x 가치 증폭 파이프라인",
  "subtitle": "원어 조업부터 이탈리아 최종 소비자 식탁까지의 단계별 부가가치 창출(EUR/kg)",
  "chartType": "bar",
  "xAxis": "stage",
  "unit": "€/kg",
  "source": "Eurostat (COMEXT, Processing, Consumption 2024-2025)",
  "logic": "1.글로벌 원어가격 -> 2.스페인 1차 수입가(에콰도르산) -> 3.스페인->이탈리아 수출가 -> 4.이탈리아 가공 출하가 -> 5.이탈리아 최종 소매가 추적",
  "desc_tooltip": "각 밸류체인 단계를 거칠 때마다 참치의 킬로그램당 가격(EUR)이 어떻게 폭발적으로 상승하는지 보여줍니다.",
  "bars": [
    { "key": "price", "name": "단가 (€/kg)", "color": "#f59e0b" }
  ],
  "data": [
    { "stage": "1. 원어 (Raw)", "price": 2.00 },
    { "stage": "2. 1차 수입 (입항)", "price": 4.60 },
    { "stage": "3. 2차 수입 (이탈리아)", "price": 6.93 },
    { "stage": "4. 이탈리아 가공", "price": 9.18 },
    { "stage": "5. 이탈리아 소매", "price": 21.62 }
  ],
  "sit": "바다에서 잡힌 원어(€2.00)가 이탈리아 소비자의 식탁(€21.62)에 오르기까지 10.8배의 가치 폭발이 발생하며, 특히 '가공 출하 ➔ 최종 소매' 구간에서 135%의 막대한 프리미엄이 붙습니다.",
  "tak": "당사(Silla)는 원어 중심의 B2B 납품을 넘어, 궁극적으로 이탈리아 등 남유럽의 '프리미엄 통조림 브랜드'를 인수하여 킬로그램당 €20 이상의 하이엔드 소비재 마진을 직접 창출해야 합니다."
}

if not any(w.get('id') == 'w31_italy_multiplier' for w in data['widgets']):
    data['widgets'].append(new_widget)

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Widget appended successfully.")
