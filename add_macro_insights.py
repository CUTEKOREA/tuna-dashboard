import json

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widgets = [
  {
    "id": "w39_nl_tollgate",
    "title": "로테르담 효과: 네덜란드 물류 톨게이트",
    "subtitle": "역외 수입 6.5만 톤 중 88.3%를 역내로 재수출하는 유럽의 허브",
    "chartType": "bar",
    "xAxis": "category",
    "unit": "",
    "source": "Eurostat (COMEXT 2024)",
    "logic": "네덜란드의 Extra-EU 수입량과 Intra-EU 수출량 교차 분석",
    "desc_tooltip": "네덜란드는 자체 소비나 가공을 위해서가 아니라, 유럽 전역으로 물량을 뿌려주는 '물류 허브(Logistics Hub)' 역할을 수행하고 있습니다.",
    "bars": [
      { "key": "volume", "name": "물량 (만 톤)", "color": "#14b8a6" }
    ],
    "data": [
      { "category": "역외 수입 (Extra-EU)", "volume": 6.50 },
      { "category": "역내 수출 (Intra-EU)", "volume": 5.74 }
    ],
    "sit": "네덜란드는 2024년 기준 유럽 외부에서 약 6.5만 톤의 참치를 수입한 뒤, 그중 88.3%에 달하는 5.74만 톤을 독일, 벨기에, 프랑스 등 유럽 내부로 다시 수출했습니다.",
    "tak": "당사는 네덜란드(로테르담 항구)에 위치한 거대 물류·유통 기업들과 B2B 파트너십을 체결하여, 네덜란드의 촘촘한 내륙 운송망을 레버리지(Leverage) 삼아 유럽 전역으로 제품을 침투시켜야 합니다."
  },
  {
    "id": "w40_french_cannery_decline",
    "title": "유럽 가공 제국의 통폐합: 스페인 vs 프랑스",
    "subtitle": "프랑스 가공 물량 30% 증발, 스페인으로의 완벽한 쏠림 현상",
    "chartType": "composed",
    "xAxis": "country",
    "unit": "",
    "source": "Eurostat (Processing 2018-2022)",
    "logic": "국가별 참치 가공(Processing) 물량의 5개년 연평균 증감률(CAGR) 분석",
    "desc_tooltip": "프랑스의 전통적인 캔 공장들이 인건비와 규모의 경제에 밀려 폐쇄되고, 스페인으로 생산 기지가 블랙홀처럼 빨려 들어가고 있습니다.",
    "bars": [
      { "key": "v2018", "name": "2018 가공량 (만 톤)", "color": "#cbd5e1" },
      { "key": "v2022", "name": "2022 가공량 (만 톤)", "color": "#8b5cf6" }
    ],
    "data": [
      { "country": "스페인 (Spain)", "v2018": 28.28, "v2022": 31.51 },
      { "country": "이탈리아 (Italy)", "v2018": 7.93, "v2022": 8.28 },
      { "country": "프랑스 (France)", "v2018": 1.70, "v2022": 1.19 }
    ],
    "sit": "2018년부터 2022년까지 프랑스의 자체 참치 가공 물량은 30%나 증발(1.7만 톤 ➡️ 1.19만 톤)한 반면, 스페인은 11.4% 급증(28.2만 톤 ➡️ 31.5만 톤)하며 유럽 전체 생산량의 80% 이상을 독식하고 있습니다.",
    "tak": "프랑스는 이제 '제조국'이 아닌 '순수 소비국'으로 전락했습니다. 당사는 쇠퇴하는 프랑스 가공업체에 원어를 공급할 것이 아니라, 프랑스 하이엔드 완제품(Retail) 시장을 직접 타격하는 B2C 전략을 취해야 합니다."
  }
]

for new_widget in new_widgets:
    if not any(w.get('id') == new_widget['id'] for w in data['widgets']):
        data['widgets'].append(new_widget)

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Widgets w39, w40 appended successfully.")
