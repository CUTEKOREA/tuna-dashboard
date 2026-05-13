import json

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widget = {
  "id": "w30_spain_arbitrage",
  "title": "스페인 허브 기반 'Tuna Washing' 차익거래",
  "subtitle": "저가 수입(에콰도르/중국) ➔ 스페인산 재포장 ➔ EU 프리미엄 수출",
  "chartType": "composed",
  "xAxis": "year",
  "unit": "€/kg, 만 톤",
  "source": "Eurostat COMEXT (2019-2025)",
  "logic": "스페인의 Prepared/Preserved Tuna 전체 수입액/수입량 vs 전체 수출액/수출량 비교. 에콰도르/중국산 수입 단가와 이탈리아/프랑스 수출 단가 간의 스프레드 산출.",
  "desc_tooltip": "스페인이 저가 참치를 수입하여 프리미엄 EU 통조림으로 라벨링(세탁)함으로써 얻는 차익 규모를 시각화했습니다.",
  "bars": [
    { "key": "import_vol", "name": "수입 물량(만 톤)", "color": "#64748b", "yAxisId": "right" },
    { "key": "export_vol", "name": "수출 물량(만 톤)", "color": "#94a3b8", "yAxisId": "right" }
  ],
  "lines": [
    { "key": "export_price", "name": "수출 단가(€/kg)", "color": "#ec4899", "yAxisId": "left" },
    { "key": "import_price", "name": "수입 단가(€/kg)", "color": "#38bdf8", "yAxisId": "left" }
  ],
  "data": [
    { "year": "2019", "import_vol": 16.6, "export_vol": 13.4, "import_price": 4.07, "export_price": 5.07 },
    { "year": "2020", "import_vol": 14.5, "export_vol": 15.5, "import_price": 3.86, "export_price": 5.08 },
    { "year": "2021", "import_vol": 14.7, "export_vol": 14.1, "import_price": 3.88, "export_price": 5.10 },
    { "year": "2022", "import_vol": 17.8, "export_vol": 13.2, "import_price": 4.94, "export_price": 5.95 },
    { "year": "2023", "import_vol": 15.0, "export_vol": 13.3, "import_price": 5.23, "export_price": 6.62 },
    { "year": "2024", "import_vol": 18.6, "export_vol": 13.8, "import_price": 4.84, "export_price": 6.74 },
    { "year": "2025", "import_vol": 19.3, "export_vol": 14.1, "import_price": 4.80, "export_price": 6.56 }
  ],
  "sit": "스페인이 에콰도르/중국 등지에서 저가 가공 참치를 수입(€4.80/kg)해 '스페인산 프리미엄 캔'으로 이탈리아/프랑스 등에 재수출(€6.56/kg)하며 42.6%의 차익을 독식하고 있습니다.",
  "tak": "당사(Silla)는 스페인 중개상을 거치지 않고 이탈리아/프랑스로 직납하는 B2B 우회 루트를 개척하거나, 스페인 통조림 공장을 인수하여 연 2.5억 유로 규모의 차익 풀(Pool)을 직접 흡수해야 합니다."
}

# check if it's already there
if not any(w.get('id') == 'w30_spain_arbitrage' for w in data['widgets']):
    data['widgets'].append(new_widget)

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Widget appended successfully.")
