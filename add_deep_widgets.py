import json

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widgets = [
  {
    "id": "w41_geopolitical_shift",
    "title": "지정학적 공급망 재편: 중국 +27% 급증, 모리셔스 -41% 폭락",
    "subtitle": "5년 사이 EU의 참치 공급국 판도가 완전히 뒤집혔다",
    "chartType": "composed",
    "xAxis": "country",
    "unit": "",
    "source": "Eurostat (COMEXT Extra-EU Import 2019 vs 2024)",
    "logic": "EU의 역외(Extra-EU) 참치 수입 물량 Top 8 국가의 2019년 vs 2024년 비교 분석",
    "desc_tooltip": "유럽이 전통적으로 의존하던 모리셔스, 필리핀 등의 공급량이 급감하고, 그 자리를 중국·인도네시아·베트남이 빠르게 채우고 있습니다.",
    "bars": [
      { "key": "v2019", "name": "2019년 (만 톤)", "color": "#cbd5e1", "yAxisId": "left" },
      { "key": "v2024", "name": "2024년 (만 톤)", "color": "#f59e0b", "yAxisId": "left" }
    ],
    "data": [
      { "country": "에콰도르", "v2019": 17.1, "v2024": 19.0 },
      { "country": "세이셸", "v2019": 5.7, "v2024": 5.1 },
      { "country": "필리핀", "v2019": 6.7, "v2024": 4.9 },
      { "country": "중국", "v2019": 3.8, "v2024": 4.8 },
      { "country": "PNG", "v2019": 4.5, "v2024": 4.6 },
      { "country": "모리셔스", "v2019": 6.1, "v2024": 3.6 },
      { "country": "인도네시아", "v2019": 1.2, "v2024": 2.4 },
      { "country": "베트남", "v2019": 0.8, "v2024": 2.3 }
    ],
    "sit": "EU는 2019년부터 2024년까지 기존 공급국인 모리셔스(-41%)와 필리핀(-27%)에 대한 의존도가 급감했습니다. 반면 중국(+27%), 인도네시아(+100%), 베트남(+188%)이 빠르게 유럽 시장에 진입하며 공급망 판도를 뒤흔들고 있습니다.",
    "tak": "당사는 이 '지정학적 재편(Geopolitical Shift)'을 반드시 읽어야 합니다. 모리셔스와 필리핀의 쇠퇴는 조업 비용 상승과 IUU(불법어업) 규제 강화가 원인입니다. 당사가 이들을 대체하여 EU에 합법적이고 안정적인 원어를 공급하는 '신뢰할 수 있는 공급자(Trusted Supplier)' 포지션을 선점해야 합니다."
  },
  {
    "id": "w42_first_sale_cascade",
    "title": "스페인 경매장(First Sale) 어종별 가격 캐스케이드",
    "subtitle": "참다랑어 €9.0 → 황다랑어 €2.7 → 가다랑어 €1.6: 5.6배의 가격 격차",
    "chartType": "bar",
    "xAxis": "species",
    "unit": "EUR/kg",
    "source": "Eurostat (Spain First Sale 2024)",
    "logic": "스페인 산지 경매(First Sale) 시장에서 어종별 평균 낙찰가 비교 분석",
    "desc_tooltip": "같은 '참치'라도 어종에 따라 산지 가격이 최대 5.6배 차이납니다. 이것이 밸류체인의 출발점입니다.",
    "bars": [
      { "key": "price", "name": "산지 경매가 (EUR/kg)", "color": "#8b5cf6" }
    ],
    "data": [
      { "species": "참다랑어 (Bluefin)", "price": 8.98 },
      { "species": "보니토 (Bonito)", "price": 3.45 },
      { "species": "황다랑어 (Yellowfin)", "price": 2.68 },
      { "species": "눈다랑어 (Bigeye)", "price": 2.45 },
      { "species": "불렛 (Bullet)", "price": 1.72 },
      { "species": "가다랑어 (Skipjack)", "price": 1.60 },
      { "species": "프리깃 (Frigate)", "price": 1.40 }
    ],
    "sit": "2024년 스페인 산지 경매(First Sale) 시장에서 참다랑어(Bluefin Tuna)는 EUR 8.98/kg에 낙찰되는 반면, 통조림 원료인 가다랑어(Skipjack)는 EUR 1.60/kg에 불과합니다. 같은 '참치(Tuna)'라는 이름 아래 5.6배의 산지가 격차가 존재합니다.",
    "tak": "통조림 원료인 가다랑어(€1.60/kg)의 마진은 극도로 얇습니다. 당사는 단가가 높은 황다랑어(€2.68/kg)와 눈다랑어(€2.45/kg)를 중심으로 원어 포트폴리오를 재편하여 산지 수매 단계에서부터 마진을 극대화해야 합니다."
  },
  {
    "id": "w43_retail_price_map",
    "title": "유럽 14개국 온라인 소매 참치 캔 가격 지도",
    "subtitle": "그리스 €9.76 vs 스웨덴 €2.34: 같은 EU인데 4.2배 차이",
    "chartType": "bar",
    "xAxis": "country",
    "unit": "EUR/unit",
    "source": "Eurostat (Daily Online Retail Prices 2024)",
    "logic": "2024년 EU 14개국 온라인 마켓에서 판매되는 참치 캔 평균 판매가 비교",
    "desc_tooltip": "같은 유럽연합(EU) 내에서도 국가별로 참치 캔 소매가가 4.2배 이상 차이납니다. 이 가격 격차는 곧 차익거래(Arbitrage) 기회입니다.",
    "bars": [
      { "key": "price", "name": "캔 평균 소매가 (EUR)", "color": "#0ea5e9" }
    ],
    "data": [
      { "country": "그리스", "price": 9.76 },
      { "country": "루마니아", "price": 5.40 },
      { "country": "포르투갈", "price": 5.40 },
      { "country": "네덜란드", "price": 4.92 },
      { "country": "폴란드", "price": 4.27 },
      { "country": "스페인", "price": 3.54 },
      { "country": "프랑스", "price": 3.41 },
      { "country": "이탈리아", "price": 3.38 },
      { "country": "벨기에", "price": 3.17 },
      { "country": "덴마크", "price": 3.15 },
      { "country": "독일", "price": 3.05 },
      { "country": "핀란드", "price": 2.61 },
      { "country": "스웨덴", "price": 2.34 }
    ],
    "sit": "동일한 EU 단일시장(Single Market) 내에서 참치 캔 소매 가격이 그리스(€9.76)에서 스웨덴(€2.34)까지 4.2배의 격차를 보입니다. 이것은 각국의 물류비, 유통 마진, 소비자 구매력의 차이가 만들어낸 구조적 가격 불균형입니다.",
    "tak": "당사는 스페인(€3.54)에서 생산·조달한 캔을 그리스(€9.76)·루마니아(€5.40)·포르투갈(€5.40) 등 고가 소매 시장으로 직접 수출(Cross-border Arbitrage)하여 유닛당 €2~6의 순수 차익을 확보해야 합니다. 이것이 유럽 내 참치 캔 무역의 핵심 수익 모델입니다."
  }
]

for new_widget in new_widgets:
    if not any(w.get('id') == new_widget['id'] for w in data['widgets']):
        data['widgets'].append(new_widget)

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/tuna_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Widgets w41, w42, w43 appended successfully.")
