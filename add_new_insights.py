import json

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widgets = [
  {
    "id": "w36_spain_vulnerability",
    "title": "유럽 가공 제국의 아킬레스건: 스페인 원자재 종속성",
    "subtitle": "연간 31.5만 톤을 가공하지만, 원어의 70% 이상을 수입에 의존하는 거대한 하청 공장",
    "chartType": "pie",
    "source": "Eurostat (Landings & COMEXT 2024)",
    "logic": "스페인의 총 가공 물량 대비 자국 어획량(Landings)과 원어 수입량(Frozen Imports)의 비율 분석",
    "desc_tooltip": "스페인은 유럽 내 압도적 1위 참치 가공 국가지만, 그 이면에는 심각한 원자재 수입 종속성이 자리 잡고 있습니다.",
    "data": [
      { "name": "자국 어획 (자급)", "value": 93000 },
      { "name": "원어 수입 (세이셸, 에콰도르 등)", "value": 222000 }
    ],
    "sit": "스페인은 연간 31.5만 톤의 참치를 가공하여 거대한 부를 창출합니다. 그러나 자체 선단(Fleet)이 어획하는 물량은 약 9.3만 톤(30%)에 불과하며, 나머지 22.2만 톤(70%)은 세이셸과 에콰도르 등으로부터 수입한 냉동 원어에 전적으로 의존합니다.",
    "tak": "당사는 이러한 스페인의 '원자재 갈증(Raw Material Thirst)'을 역이용해야 합니다. 스페인의 거대 가공 팩토리들을 상대로 장기 원어 공급(B2B) 계약을 체결하여 안정적인 캐시카우를 확보할 수 있습니다."
  },
  {
    "id": "w37_china_dumping",
    "title": "보이지 않는 위협: 중국의 초저가 통조림 폭격",
    "subtitle": "시장 평균가(EUR 5.0)를 붕괴시키는 EUR 3.92의 덤핑 전략",
    "chartType": "composed",
    "xAxis": "origin",
    "unit": "",
    "source": "Eurostat (COMEXT 2024)",
    "logic": "2024년 EU 참치 통조림 주요 수입국별 물량(막대)과 단가(선) 크로스 분석",
    "desc_tooltip": "중국이 유독 비정상적인 저가(EUR 3.92/kg)로 연간 4.3만 톤의 통조림을 유럽에 쏟아내며 시장을 교란하고 있습니다.",
    "bars": [
      { "key": "volume", "name": "통조림 수출량 (만 톤)", "color": "#f59e0b", "yAxisId": "left" }
    ],
    "lines": [
      { "key": "price", "name": "수출 단가 (EUR/kg)", "color": "#ef4444", "yAxisId": "right" }
    ],
    "data": [
      { "origin": "에콰도르", "volume": 17.2, "price": 4.81 },
      { "origin": "스페인(역내)", "volume": 12.3, "price": 6.82 },
      { "origin": "PNG", "volume": 4.45, "price": 5.10 },
      { "origin": "중국", "volume": 4.38, "price": 3.92 },
      { "origin": "네덜란드", "volume": 4.27, "price": 5.49 }
    ],
    "sit": "에콰도르와 PNG가 EUR 4.8~5.1의 정상적인 판가로 대중성 통조림을 공급하고, 스페인이 EUR 6.8의 프리미엄을 유지하는 가운데, 중국이 홀로 EUR 3.92라는 비정상적인 저가로 4.3만 톤을 밀어내고 있습니다.",
    "tak": "중국의 덤핑(Dumping) 리스크를 피하기 위해, 당사는 단순 가다랑어 통조림 경쟁을 지양하고 올리브 오일·유기농 등 프리미엄 첨가물이 들어간 하이엔드 시장으로 제품군을 상향 조정(Up-selling)해야 합니다."
  }
]

for new_widget in new_widgets:
    if not any(w.get('id') == new_widget['id'] for w in data['widgets']):
        data['widgets'].append(new_widget)

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Widgets w36, w37 appended successfully.")
