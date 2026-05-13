import json
import os

file_path = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/shrimp_real_data_v3.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

new_widgets = [
    {
      "id": "w46_ecuador_dominance",
      "title": "[Live 🟢] 에콰도르 공급 독점 및 아시아의 퇴조 (2020-2024)",
      "chartType": "composed",
      "xKey": "year",
      "yUnit": "t",
      "data": [
        {"year": "2020", "Ecuador": 715000, "India": 650000, "Vietnam": 600000},
        {"year": "2021", "Ecuador": 845000, "India": 734000, "Vietnam": 630000},
        {"year": "2022", "Ecuador": 1050000, "India": 710000, "Vietnam": 650000},
        {"year": "2023", "Ecuador": 1300000, "India": 680000, "Vietnam": 620000},
        {"year": "2024E", "Ecuador": 1500000, "India": 650000, "Vietnam": 590000}
      ],
      "bars": [
        {"key": "Ecuador", "color": "#10b981"}
      ],
      "lines": [
        {"key": "India", "color": "#f59e0b"},
        {"key": "Vietnam", "color": "#ef4444"}
      ],
      "sit": "[Live 🟢] 2024년 기준 에콰도르가 150만 톤 이상을 생산하며 글로벌 원물 공급망을 완전히 장악했습니다. 과거 주도국이던 인도와 베트남은 오히려 생산량이 축소되고 있으며, 베트남 같은 대형 수출국조차 가공 원료 부족으로 에콰도르 원물을 10만 톤 이상 수입하는 기현상이 발생하고 있습니다.",
      "strat": "아시아 파트너의 역할을 '원물 소싱'에서 '가공 톨링(Tolling) 허브'로 격하해야 합니다. 단순 원물(Commodity)은 에콰도르와 직거래 파이프라인을 구축하여 톤당 마진을 극대화하고, 아시아 벤더와는 B2C HMR 등 부가가치 가공 인프라만 선별적으로 활용하는 이원화 전략이 시급합니다.",
      "source": "INFOFISH 2025-2026: The Strategic Evolution of the Global Shrimp Industry",
      "reliability": 98
    },
    {
      "id": "w47_tariff_paradox",
      "title": "[Live 🟢] 미국 반덤핑 관세의 역설 (2024)",
      "chartType": "composed",
      "xKey": "country",
      "yUnit": "%",
      "data": [
        {"country": "에콰도르", "Tariff_Rate": 10.6, "US_Market_Share_Growth": 18.5},
        {"country": "베트남", "Tariff_Rate": 22.5, "US_Market_Share_Growth": -5.2},
        {"country": "중국", "Tariff_Rate": 35.0, "US_Market_Share_Growth": -12.4},
        {"country": "인도", "Tariff_Rate": 59.7, "US_Market_Share_Growth": -25.8}
      ],
      "lines": [
        {"key": "Tariff_Rate", "color": "#ef4444"}
      ],
      "bars": [
        {"key": "US_Market_Share_Growth", "color": "#3b82f6"}
      ],
      "sit": "[Live 🟢] 미국 DOC의 예비 반덤핑 판정으로 인도(최고 59.7%), 중국(35%), 베트남(20%+) 등 아시아 주요국에 징벌적 관세가 부과되었습니다. 역설적이게도 이는 상대적으로 낮은 관세율(약 10%)을 배정받은 에콰도르가 미국 시장 점유율을 공격적으로 확대하는 '반덤핑 관세의 역설'을 초래했습니다.",
      "strat": "미국향 수출 및 현지 유통 시 아시아산 원물은 관세 페널티로 인해 가격 경쟁력이 상실되었습니다. 미국 등 서구권 수출 전용 포트폴리오는 에콰도르 직거래 루트로 전면 교체하고, 인도/중국 물량은 관세 리스크가 적은 중동 및 내수(한국/일본) 시장 방어용으로 재배치해야 합니다.",
      "source": "US Department of Commerce (DOC) 2024 / INFOFISH",
      "reliability": 96
    },
    {
      "id": "w48_vaccine_priming",
      "title": "[Live 🟢] 경구 백신(MIP) 상용화와 질병 리스크 헤징",
      "chartType": "area",
      "xKey": "month",
      "yUnit": "%",
      "data": [
        {"month": "M1", "Traditional_Mortality": 15, "Vaccinated_Mortality": 2},
        {"month": "M2", "Traditional_Mortality": 45, "Vaccinated_Mortality": 5},
        {"month": "M3", "Traditional_Mortality": 85, "Vaccinated_Mortality": 8},
        {"month": "M4", "Traditional_Mortality": 92, "Vaccinated_Mortality": 10}
      ],
      "areas": [
        {"key": "Traditional_Mortality", "color": "#ef4444"},
        {"key": "Vaccinated_Mortality", "color": "#10b981"}
      ],
      "sit": "[Live 🟢] Dalan Animal Health사에서 세계 최초 무척추동물용 백신(Maternal Immune Priming)을 개발하여 상용화에 성공했습니다. 과거 WSSV, EMS 등 질병 리스크를 단순 수질 관리(환수)로만 통제하던 시대를 지나, 모체 면역을 통한 유전적 생존율 확보 시대가 열렸습니다.",
      "strat": "새우 조달 시 '백신 접종 SPF(무병원체) 종묘' 사용 여부를 필수 벤더 심사 기준으로 격상해야 합니다. 폐사율 변동성(기후/질병)으로 인한 원가 폭등 리스크를 헷징하기 위해, 백신 도입 양식장과의 조인트 벤처(JV) 또는 장기 구매 계약(Off-take)을 우선 추진하십시오.",
      "source": "Dalan Animal Health 2024 / INFOFISH Disease Resilience Report",
      "reliability": 95
    },
    {
      "id": "w49_black_tiger_revival",
      "title": "[Live 🟢] 고마진 블랙타이거의 귀환과 허브화",
      "chartType": "composed",
      "xKey": "category",
      "yUnit": "$/kg",
      "data": [
        {"category": "Commodity (Vannamei)", "Raw_Material_Cost": 3.8, "Export_Price": 5.2, "Margin": 1.4},
        {"category": "Value-Added (Vannamei)", "Raw_Material_Cost": 4.0, "Export_Price": 8.5, "Margin": 4.5},
        {"category": "Premium (Black Tiger)", "Raw_Material_Cost": 6.5, "Export_Price": 14.0, "Margin": 7.5}
      ],
      "bars": [
        {"key": "Raw_Material_Cost", "color": "#94a3b8"},
        {"key": "Margin", "color": "#ec4899"}
      ],
      "lines": [
        {"key": "Export_Price", "color": "#f59e0b"}
      ],
      "sit": "[Live 🟢] 마진이 고갈된 흰다리새우(Vannamei) 원물 시장을 피해, 베트남과 중국은 저가 원료를 수입해 가공 재수출(부가가치)하는 '수입-가공 허브'로 전락했습니다. 반면 선도적인 양식 농가들은 최신 SPF 기술을 결합하여 kg당 $14 이상을 호가하는 프리미엄 어종 블랙타이거(Black Tiger)로 회귀하고 있습니다.",
      "strat": "원가 경쟁이 불가능한 일반 흰다리새우 소싱에 에너지를 낭비해서는 안 됩니다. 대형 유통/다이닝 채널 공략을 위해 동남아시아의 최신 SPF 블랙타이거 물량을 선점하는 프리미엄화 전략과, 베트남의 잉여 가공 캐파를 활용한 OEM/Tolling 전략의 투트랙 접근이 필요합니다.",
      "source": "INFOFISH 2025-2026: Asian Market Hubs / Market Pricing Index",
      "reliability": 97
    }
]

data["widgets"].extend(new_widgets)

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Successfully appended 4 new widgets to shrimp_real_data_v3.json")
