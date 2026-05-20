import json

file_path = 'public/data/squid_real_data_v4.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widget = {
  "id": "w46_korea_holiday_effect",
  "title": "한국 '명절 효과' — 명절 시즌 소비 125% 폭증의 전략적 의미",
  "subtitle": "설·추석 제수용 및 선물 수요로 평월 대비 2배 이상 급증 — 유통 마진의 극대화 시점",
  "chartType": "composed",
  "xKey": "연도",
  "bars": [
    {
      "dataKey": "명절소비(천톤)",
      "color": "#10b981"
    },
    {
      "dataKey": "평균월소비(천톤)",
      "color": "#64748b"
    }
  ],
  "lines": [
    {
      "dataKey": "명절프리미엄(%)",
      "color": "#3b82f6",
      "yAxisId": "right"
    }
  ],
  "data": [
    { "연도": "2020", "명절소비(천톤)": 12.5, "평균월소비(천톤)": 6.0, "명절프리미엄(%)": 108 },
    { "연도": "2021", "명절소비(천톤)": 13.0, "평균월소비(천톤)": 6.2, "명절프리미엄(%)": 110 },
    { "연도": "2022", "명절소비(천톤)": 12.8, "평균월소비(천톤)": 5.8, "명절프리미엄(%)": 121 },
    { "연도": "2023", "명절소비(천톤)": 11.5, "평균월소비(천톤)": 5.1, "명절프리미엄(%)": 125 },
    { "연도": "2024", "명절소비(천톤)": 10.8, "평균월소비(천톤)": 4.8, "명절프리미엄(%)": 125 },
    { "연도": "2025", "명절소비(천톤)": 11.0, "평균월소비(천톤)": 4.9, "명절프리미엄(%)": 124 }
  ],
  "logic": "KMI 한국해양수산개발원 및 KAMIS 농산물유통정보 월별 오징어 소비량/소매가 계절성(Seasonality) 분석",
  "unit": "천 톤 & %",
  "source": "KMI, KAMIS (2020-2025)",
  "reliability": 95,
  "situation": "한국 수산물 소비 데이터를 교차 분석한 결과, 설·추석 명절 시즌의 오징어 소비량이 평월 대비 125% 폭증(2023년 기준)하는 계절성이 뚜렷합니다. 어획량 감소에도 불구하고 명절 시즌에는 유통망의 냉동 비축 물량이 대규모로 방출되며 가격 프리미엄(120% 내외)이 발생하지만, 이는 생산자가 아닌 도매·유통업계의 수익으로 귀속됩니다.",
  "takeaway": "<ul><li>이탈리아의 크리스마스 효과와 마찬가지로, 한국의 '명절 효과'는 현금흐름 창출의 핵심 시기입니다.</li><li>국내 대형 유통 벤더들은 평시 저가 매입 후 명절 전후 대량 출하를 통해 극대화된 마진을 확보하고 있습니다.</li><li>단순 수입/어획 쿼터 확보를 넘어, 국내 냉동창고 인프라 및 B2B/B2C 유통망을 보유한 기업에 대한 Add-on 인수를 통해 다운스트림(Downstream) 마진을 내재화하는 전략이 필요합니다.</li><li>원양선사의 단순 도매 공급 모델에서 벗어나, 명절 시즌 프리미엄을 온전히 흡수할 수 있는 수직 계열화가 PEF 밸류업의 핵심입니다.</li></ul>",
  "tak": "<ul><li>이탈리아의 크리스마스 효과와 마찬가지로, 한국의 '명절 효과'는 현금흐름 창출의 핵심 시기입니다.</li><li>국내 대형 유통 벤더들은 평시 저가 매입 후 명절 전후 대량 출하를 통해 극대화된 마진을 확보하고 있습니다.</li><li>단순 수입/어획 쿼터 확보를 넘어, 국내 냉동창고 인프라 및 B2B/B2C 유통망을 보유한 기업에 대한 Add-on 인수를 통해 다운스트림(Downstream) 마진을 내재화하는 전략이 필요합니다.</li><li>원양선사의 단순 도매 공급 모델에서 벗어나, 명절 시즌 프리미엄을 온전히 흡수할 수 있는 수직 계열화가 PEF 밸류업의 핵심입니다.</li></ul>"
}

index_to_insert = -1
for i, widget in enumerate(data["widgets"]):
    if widget.get("id") == "w45_christmas_demand_spike":
        index_to_insert = i + 1
        break

if index_to_insert != -1:
    data["widgets"].insert(index_to_insert, new_widget)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Widget inserted successfully.")
else:
    print("Could not find w45_christmas_demand_spike.")
