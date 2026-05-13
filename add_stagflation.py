import json

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widget = {
  "id": "w38_italy_stagflation",
  "title": "이탈리아 소매 시장 스태그플레이션 타격",
  "subtitle": "2021년 대비 2024년: 소비량 20% 급감, 소비자가는 21% 폭등",
  "chartType": "composed",
  "xAxis": "year",
  "unit": "",
  "source": "Eurostat (Monthly Consumption 2021-2024)",
  "logic": "이탈리아 소매(Retail) 시장의 연도별 소비자가(EUR/kg)와 소비 물량(Volume) 추이 교차 분석",
  "desc_tooltip": "인플레이션으로 인해 참치 캔 소매 가격이 폭등하자, 실제 유럽 소비자들의 소비 물량이 20% 이상 급감한 전형적인 스태그플레이션(Stagflation) 현상입니다.",
  "bars": [
    { "key": "volume", "name": "소매 소비량 지수 (2021=100)", "color": "#f43f5e", "yAxisId": "left" }
  ],
  "lines": [
    { "key": "price", "name": "소매 단가 (EUR/kg)", "color": "#0ea5e9", "yAxisId": "right" }
  ],
  "data": [
    { "year": "2021", "volume": 100, "price": 17.87 },
    { "year": "2022", "volume": 91, "price": 19.30 },
    { "year": "2023", "volume": 85, "price": 20.80 },
    { "year": "2024", "volume": 79.6, "price": 21.62 }
  ],
  "sit": "유럽에서 참치를 가장 비싸게 먹는 이탈리아(Retail 평균 €21.62/kg)마저도 글로벌 인플레이션을 견디지 못하고 있습니다. 가격이 21% 오르는 동안 실제 시장에서 팔린 참치 캔의 부피는 20% 증발했습니다.",
  "tak": "시장이 '슈링크플레이션(Shrinkflation)'에 진입했습니다. 당사는 캔의 용량을 줄이고 올리브 오일 함량을 늘려 '1인 가구용 프리미엄 스몰 캔'으로 포트폴리오를 전면 전환해야 마진을 방어할 수 있습니다."
}

if not any(w.get('id') == new_widget['id'] for w in data['widgets']):
    data['widgets'].append(new_widget)

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Widget w38 appended successfully.")
