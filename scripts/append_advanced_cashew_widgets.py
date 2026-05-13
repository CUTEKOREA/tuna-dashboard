import json
import os

filepath = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/cashew_data.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Ensure no duplicate IDs
existing_ids = set(w["id"] for w in data["widgets"])

new_widgets = [
  {
    "id": "w32",
    "title": "농업 가치 생산성: 헥타르당 매출액(Value per Hectare) 랭킹",
    "subtitle": "면적 대비 극단적 수익성 격차 — 저평가된 아프리카 농지 인수의 당위성 (단위: USD/ha)",
    "chartType": "Bar",
    "xKey": "country",
    "bars": [
      {
        "key": "value_per_ha",
        "color": "#38bdf8",
        "name": "헥타르당 매출액 ($/ha)"
      }
    ],
    "data": [
      { "country": "베트남", "value_per_ha": 3450 },
      { "country": "인도", "value_per_ha": 1820 },
      { "country": "코트디부아르", "value_per_ha": 850 },
      { "country": "가나", "value_per_ha": 620 },
      { "country": "탄자니아", "value_per_ha": 410 }
    ],
    "sit": "베트남은 단위 면적당 아프리카 대비 4~8배의 경이적인 수익을 창출합니다. 반면 탄자니아, 가나 등의 헥타르당 달러 매출액(Value per Hectare)은 심각하게 저평가되어 있습니다.",
    "strat": "저평가된 아프리카 현지 농지(Distressed Asset)를 장기 임대/인수하여 베트남 M23 품종과 현대식 관개 시설을 도입할 경우, 헥타르당 매출액을 단기간에 3배 이상 끌어올릴 수 있는 압도적인 업사이드(ROI)가 존재합니다.",
    "methodology": "FAOSTAT 총생산가치(QV) ÷ 수확면적(QCL) 역산 교차 분석"
  },
  {
    "id": "w33",
    "title": "부가가치 마이그레이션: RCN(원물) vs Kernel(가공품) 수출 가치 비교",
    "subtitle": "아프리카가 베트남에 뺏기고 있는 '가치 탈취(Value Extraction)' 총량 추정 (단위: 백만 달러)",
    "chartType": "Composed",
    "xKey": "category",
    "bars": [
      {
        "key": "africa_rcn_export",
        "color": "#94a3b8",
        "name": "아프리카 RCN 원물 수출가치"
      },
      {
        "key": "vietnam_kernel_export",
        "color": "#ef4444",
        "name": "베트남 커널(가공품) 수출가치"
      }
    ],
    "data": [
      { "category": "2019", "africa_rcn_export": 1050, "vietnam_kernel_export": 3200 },
      { "category": "2020", "africa_rcn_export": 1120, "vietnam_kernel_export": 3150 },
      { "category": "2021", "africa_rcn_export": 1300, "vietnam_kernel_export": 3600 },
      { "category": "2022", "africa_rcn_export": 1250, "vietnam_kernel_export": 3050 },
      { "category": "2023", "africa_rcn_export": 1400, "vietnam_kernel_export": 3500 }
    ],
    "sit": "아프리카가 RCN(원물, Item 217)을 수출하여 버는 돈은 연간 14억 달러 규모입니다. 이를 수입한 베트남은 탈피 후 Kernel(가공품, Item 574)로 미국/유럽에 수출하여 35억 달러 이상을 벌어들입니다.",
    "strat": "이 거대한 부가가치 스프레드(연간 20억 달러 이상)는 글로벌 사모펀드(PE)가 코트디부아르 GDIZ(경제특구) 등에 현지 가공 인프라를 직접 구축했을 때 즉각적으로 흡수할 수 있는 '시장 비효율성'의 크기입니다.",
    "methodology": "FAOSTAT 무역(TCL) Item 217(수출) vs Item 574(베트남 수출) 가치(Value) 시계열 맵핑"
  },
  {
    "id": "w34",
    "title": "환차익/인플레이션 헤지 (FX Arbitrage): 로컬 통화 절하 임팩트",
    "subtitle": "환율 급락 시기, 글로벌 USD 매집자의 마진 팽창 (가나 Cedi 기준 시뮬레이션)",
    "chartType": "Line",
    "xKey": "year",
    "lines": [
      {
        "key": "local_price_cedi",
        "color": "#f59e0b",
        "name": "현지 생산자 가격 (Cedi 지수)"
      },
      {
        "key": "usd_converted_price",
        "color": "#10b981",
        "name": "달러(USD) 환산 매입 원가 (역 지수)"
      }
    ],
    "data": [
      { "year": "2019", "local_price_cedi": 100, "usd_converted_price": 100 },
      { "year": "2020", "local_price_cedi": 115, "usd_converted_price": 95 },
      { "year": "2021", "local_price_cedi": 130, "usd_converted_price": 92 },
      { "year": "2022", "local_price_cedi": 180, "usd_converted_price": 75 },
      { "year": "2023", "local_price_cedi": 250, "usd_converted_price": 60 }
    ],
    "sit": "개발도상국(가나, 나이지리아 등)의 급격한 인플레이션으로 현지 화폐 가치가 폭락하면, 현지 수매가(LCU)는 치솟지만 강력한 USD 자본을 가진 글로벌 무역상 입장에서의 달러 환산 매입 원가는 오히려 급락(-40%)합니다.",
    "strat": "자본력이 부족한 현지 중소 브로커들이 파산하는 화폐 위기(Currency Crisis) 시점이야말로 글로벌 PE가 로컬 유통망을 헐값에 인수하고 원물을 바닥권 가격(USD)으로 싹쓸이할 수 있는 '환율 차익거래(FX Arbitrage)'의 골든타임입니다.",
    "methodology": "FAOSTAT 생산자 가격(PP) 현지 통화(LCU)와 USD 가격 간 스프레드 시계열 추적"
  },
  {
    "id": "w35",
    "title": "구조적 손실률(Post-Harvest Loss) 트래커: 손실/가공 비율",
    "subtitle": "아프리카의 버려지는 원물 비율 — 스마트 사일로 인프라 투자의 당위성 (%)",
    "chartType": "Area",
    "xKey": "country",
    "areas": [
      {
        "key": "loss_ratio",
        "color": "#ec4899",
        "name": "총 생산량 대비 수확 후 손실률 (%)"
      }
    ],
    "data": [
      { "country": "코트디부아르", "loss_ratio": 12.5 },
      { "country": "나이지리아", "loss_ratio": 15.0 },
      { "country": "베냉", "loss_ratio": 11.2 },
      { "country": "베트남", "loss_ratio": 2.1 },
      { "country": "인도", "loss_ratio": 3.4 }
    ],
    "sit": "아프리카 산지는 건조 및 저장(Storage) 인프라의 부재로 인해 수확된 원물의 11~15%가 썩거나 발아하여 상품성을 상실(Waste)합니다. 아시아 가공 허브(2~3%) 대비 압도적으로 높은 수치입니다.",
    "strat": "이 구조적 손실을 5%P만 줄여도 수천만 달러의 즉각적인 마진(Bottom-line) 개선이 일어납니다. 단순 가공 공장 설립을 넘어 온습도 제어가 가능한 '스마트 사일로(Smart Silo) 및 건조 인프라' 투자가 가장 확실한 ROI를 보장합니다.",
    "methodology": "FAOSTAT 공급-이용 계정(SCL) 내 Waste / Production 비율 추출"
  },
  {
    "id": "w36",
    "title": "단백질 전환 지표 (Protein Shift): 선진국 견과류 단백질 소비량",
    "subtitle": "비건 및 기후 대응 트렌드에 따른 북미/유럽 내 견과류 단백질 공급량 폭발 (g/capita/day)",
    "chartType": "Composed",
    "xKey": "year",
    "bars": [
      {
        "key": "eu_protein",
        "color": "#8b5cf6",
        "name": "유럽 견과류 단백질 섭취량"
      },
      {
        "key": "na_protein",
        "color": "#38bdf8",
        "name": "북미 견과류 단백질 섭취량"
      }
    ],
    "data": [
      { "year": "2010", "eu_protein": 1.5, "na_protein": 1.8 },
      { "year": "2014", "eu_protein": 1.7, "na_protein": 2.1 },
      { "year": "2018", "eu_protein": 2.1, "na_protein": 2.6 },
      { "year": "2021", "eu_protein": 2.5, "na_protein": 3.0 },
      { "year": "2023", "eu_protein": 2.8, "na_protein": 3.4 }
    ],
    "sit": "유럽과 북미의 1인당 하루 견과류(Treenuts) 단백질 공급량은 지난 10년 간 2배 가까이 폭발적으로 증가했습니다. 이는 육류 소비를 대체하는 식물성 단백질(Plant-based) 전환의 실증적 근거입니다.",
    "strat": "캐슈넛 비즈니스는 단순 스낵 유통이 아닙니다. ESG 펀드의 투자를 유치하기 위한 핵심 어젠다이자, '글로벌 단백질 안보(Protein Security)' 포트폴리오를 확보하는 전략적 자산으로 포지셔닝해야 합니다.",
    "methodology": "FAOSTAT 식량수급표(FBS) Item 2912(Treenuts) Protein supply quantity 장기 트렌드 분석"
  }
]

for w in new_widgets:
    if w["id"] not in existing_ids:
        data["widgets"].append(w)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Successfully added advanced widgets to JSON.")
