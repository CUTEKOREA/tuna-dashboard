import json

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widgets = [
  {
    "id": "w34_germany_blackhole",
    "title": "독일 수입 시장: 통조림 수요 블랙홀",
    "subtitle": "가공 인프라 없이 연간 8.7만 톤의 완제품을 흡수하는 순수 소비 시장",
    "chartType": "bar",
    "xAxis": "origin",
    "unit": "만 톤",
    "source": "Eurostat (COMEXT 2024)",
    "logic": "1.독일의 Prepared Tuna 수입량 -> 2.주요 수입국(Origin) 분석",
    "desc_tooltip": "독일은 자체 가공 공장 없이 에콰도르, 네덜란드(환적), 파푸아뉴기니 등으로부터 완제품 통조림을 대거 수입하는 소비 블랙홀입니다.",
    "bars": [
      { "key": "volume", "name": "통조림 수입량 (만 톤)", "color": "#f43f5e" }
    ],
    "data": [
      { "origin": "에콰도르 (Ecuador)", "volume": 1.75 },
      { "origin": "네덜란드 (Netherlands)", "volume": 1.57 },
      { "origin": "파푸아뉴기니 (PNG)", "volume": 1.26 },
      { "origin": "필리핀 (Philippines)", "volume": 0.85 },
      { "origin": "스페인 (Spain)", "volume": 0.72 }
    ],
    "sit": "독일은 유럽 내 최대 경제 대국임에도 참치 가공 인프라가 부재하여, 연간 약 8.7만 톤의 참치 통조림 완제품을 전량 수입에 의존하는 거대한 소비 시장입니다.",
    "tak": "당사는 독일에 원어를 납품하려 할 것이 아니라, 완제품(OEM/ODM) 파트너십을 통해 파푸아뉴기니, 에콰도르가 장악한 독일 소매 시장 체인을 직접 공략해야 합니다."
  },
  {
    "id": "w35_species_channels",
    "title": "어종별 유통 채널 양극화 현상",
    "subtitle": "가다랑어(통조림) vs 참다랑어(생식)의 완벽한 시장 분리",
    "chartType": "bar",
    "xAxis": "species",
    "unit": "%",
    "source": "Eurostat (COMEXT 2024)",
    "logic": "1.어종별 총 수입량 산출 -> 2.보존 상태별(Prepared/Frozen/Fresh) 비율 분석",
    "desc_tooltip": "어종별로 통조림(Prepared), 냉동 블록(Frozen), 횟감용 생식(Fresh)으로 유통되는 비율을 보여줍니다.",
    "bars": [
      { "key": "canned", "name": "통조림 (Canned) %", "color": "#10b981" },
      { "key": "frozen", "name": "냉동 (Frozen) %", "color": "#3b82f6" },
      { "key": "fresh", "name": "생식 (Fresh/Sashimi) %", "color": "#ec4899" }
    ],
    "data": [
      { "species": "가다랑어", "canned": 92.6, "frozen": 6.9, "fresh": 0.6 },
      { "species": "황다랑어", "canned": 57.1, "frozen": 40.3, "fresh": 2.6 },
      { "species": "참다랑어", "canned": 0.0, "frozen": 2.5, "fresh": 97.5 }
    ],
    "sit": "가다랑어는 92.6%가 통조림으로 소비되는 전형적인 대중재인 반면, 참다랑어는 97.5%가 횟감(Fresh)으로 소비됩니다. 황다랑어는 통조림과 냉동 필렛 시장을 양분하고 있습니다.",
    "tak": "당사의 선단 운영 시 어종별로 바이어(Canning Factory vs High-end Restaurant Supplier)를 완전히 분리하는 '타겟 마케팅'이 필수적입니다."
  }
]

for new_widget in new_widgets:
    if not any(w.get('id') == new_widget['id'] for w in data['widgets']):
        data['widgets'].append(new_widget)

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("2 Widgets appended successfully.")
