import json
import re
import os

JSON_PATH = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/mackerel_real_data_v8.json"
TSX_PATH = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/MackerelDashboard.tsx"

new_widgets = [
    {
        "id": "w_insight_2",
        "title": "기후 적응형 거점 재배치 (Climate-Adaptive Shift)",
        "subtitle": "어장 북상 트렌드에 따른 원초적 수급 인프라 전략",
        "chartType": "Area",
        "xKey": "year",
        "areas": [
            {"key": "남해안_조업비율", "color": "#f87171"},
            {"key": "동서해_북부비율", "color": "#38bdf8"}
        ],
        "data": [
            {"year": "2020", "남해안_조업비율": 85, "동서해_북부비율": 15},
            {"year": "2022", "남해안_조업비율": 78, "동서해_북부비율": 22},
            {"year": "2024", "남해안_조업비율": 65, "동서해_북부비율": 35},
            {"year": "2026", "남해안_조업비율": 50, "동서해_북부비율": 50},
            {"year": "2030", "남해안_조업비율": 30, "동서해_북부비율": 70}
        ],
        "sit": "해수온 상승에 따른 생태계 변화로 고등어의 산란장과 조업 중심이 2050년대까지 기존 남해안에서 동서해 중북부 권역으로 구조적인 북상 이동 중입니다.",
        "strat": "[실행 전략: 기후 적응형 인프라 재배치]\n가공 공장 및 콜드체인 물류 허브의 입지를 중북부로 분산/재배치하고, 칠레 등 남미로 소싱처를 다변화하는 헷징(Hedging) 투자가 시급합니다."
    },
    {
        "id": "w_insight_3",
        "title": "미성어 극복 초정밀 푸드테크 선제 투자",
        "subtitle": "국내산 소형어(300g 이하) 전용 자동화 라인 수율 분석",
        "chartType": "Bar",
        "xKey": "category",
        "bars": [
            {"key": "기존설비_수율", "color": "#94a3b8"},
            {"key": "푸드테크_수율", "color": "#10b981"}
        ],
        "data": [
            {"category": "가시 발골", "기존설비_수율": 65, "푸드테크_수율": 92},
            {"category": "살점 보존", "기존설비_수율": 70, "푸드테크_수율": 95},
            {"category": "소포장 효율", "기존설비_수율": 55, "푸드테크_수율": 88},
            {"category": "부산물 업사이클", "기존설비_수율": 20, "푸드테크_수율": 85}
        ],
        "sit": "어획량의 80%가 소형어로 집중되나, 노르웨이산 대형 규격에 맞춰진 기존 순살 가공 설비에 투입 시 살이 뭉개지는 심각한 기술적 병목이 발생 중입니다.",
        "strat": "[실행 전략: 딥러닝 로봇/초정밀 발골 투자]\n형태가 불규칙한 소형 어종에 특화된 로봇/자동화 라인에 선제 투자하여 가공 마진을 독식하고, 남은 부산물을 어분/사료로 업사이클링해야 합니다."
    },
    {
        "id": "w_insight_1",
        "title": "수산 트릴레마 기반 하이브리드 금융 융합",
        "subtitle": "차익거래(Arbitrage) 및 수산 금융(VMI/ABL) 레버리지 모델",
        "chartType": "Composed",
        "xKey": "quarter",
        "bars": [
            {"key": "VMI_재고물량", "color": "#3b82f6"}
        ],
        "lines": [
            {"key": "ABL_금융레버리지", "color": "#f59e0b"}
        ],
        "data": [
            {"quarter": "Q1", "VMI_재고물량": 120, "ABL_금융레버리지": 50},
            {"quarter": "Q2", "VMI_재고물량": 150, "ABL_금융레버리지": 75},
            {"quarter": "Q3", "VMI_재고물량": 210, "ABL_금융레버리지": 130},
            {"quarter": "Q4", "VMI_재고물량": 280, "ABL_금융레버리지": 200},
            {"quarter": "Next", "VMI_재고물량": 350, "ABL_금융레버리지": 280}
        ],
        "sit": "쿼터 삭감과 고물류비 등 수산 트릴레마 환경에서 단순 도매 모델은 변동성 리스크에 취약하며 역방향 트레이딩(남남 무역)이 증가하고 있습니다.",
        "strat": "[실행 전략: 유통-물류-금융 하이브리드 전환]\n선제적 재고 비축(VMI)으로 고객사를 락인하고, 이 냉동 수산물 자산을 담보로 대출(ABL)을 실행하여 유동성을 폭발시키는 금융 융합 플랫폼 구축이 필요합니다."
    },
    {
        "id": "w_insight_4",
        "title": "스마트 콜드체인 게이트키퍼 선점 (ESG)",
        "subtitle": "소비자 가치 하락 극복을 위한 투명성 프리미엄",
        "chartType": "Line",
        "xKey": "year",
        "lines": [
            {"key": "일반수산물_가치", "color": "#94a3b8"},
            {"key": "ESG스마트콜드체인_가치", "color": "#ec4899"}
        ],
        "data": [
            {"year": "2022", "일반수산물_가치": 100, "ESG스마트콜드체인_가치": 105},
            {"year": "2023", "일반수산물_가치": 95, "ESG스마트콜드체인_가치": 115},
            {"year": "2024", "일반수산물_가치": 88, "ESG스마트콜드체인_가치": 130},
            {"year": "2025", "일반수산물_가치": 82, "ESG스마트콜드체인_가치": 155},
            {"year": "2026", "일반수산물_가치": 75, "ESG스마트콜드체인_가치": 180}
        ],
        "sit": "크기가 작아진 수산물에 대해 소비자가 '품질 저하'로 인식하여 이탈 중입니다. 가격 인하로는 이탈을 방어할 수 없는 구조적 한계에 봉착했습니다.",
        "strat": "[실행 전략: 친환경 프리미엄 브랜딩]\n단순한 가격 할인이 아닌, 정부 지원을 활용한 AI 스마트 콜드체인을 도입해 탄소 저감 및 이력 추적 기반의 '지속가능성 프리미엄'으로 브랜드 가치를 격상하십시오."
    }
]

def update_json():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Avoid duplicates
    existing_ids = {w["id"] for w in data["widgets"]}
    for nw in new_widgets:
        if nw["id"] not in existing_ids:
            data["widgets"].append(nw)
            
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def update_tsx():
    with open(TSX_PATH, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Replace the ID arrays
    content = content.replace("['w01', 'w02', 'w03', 'w04']", "['w01', 'w02', 'w03', 'w04', 'w_insight_2']")
    content = content.replace("['w08', 'w16']", "['w08', 'w16', 'w_insight_3']")
    content = content.replace("['w07', 'w10', 'w11', 'w13', 'w15', 'w17', 'w18']", "['w07', 'w10', 'w11', 'w13', 'w15', 'w17', 'w18', 'w_insight_1']")
    content = content.replace("['w05', 'w12']", "['w05', 'w12', 'w_insight_4']")
    
    # Update the exclusion lists
    old_exclude = "['w01', 'w02', 'w03', 'w04', 'w08', 'w16', 'w06', 'w09', 'w14', 'w07', 'w10', 'w11', 'w13', 'w15', 'w17', 'w18', 'w05', 'w12']"
    new_exclude = "['w01', 'w02', 'w03', 'w04', 'w_insight_2', 'w08', 'w16', 'w_insight_3', 'w06', 'w09', 'w14', 'w07', 'w10', 'w11', 'w13', 'w15', 'w17', 'w18', 'w_insight_1', 'w05', 'w12', 'w_insight_4']"
    
    content = content.replace(old_exclude, new_exclude)
    
    with open(TSX_PATH, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    update_json()
    update_tsx()
    print("Mackerel Dashboard updated successfully with 4 new insights.")
