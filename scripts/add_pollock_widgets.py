import json
import os

file_path = 'public/data/pollock_real_data_v3.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widgets = [
    {
        "id": "w24_opex_spread",
        "title": "[원물] 조업 원가(MGO) vs 판가 스프레드 차트",
        "chartType": "composed",
        "data": [
            {"Month": "Jan", "명태 도매가 (USD/t)": 1400, "MGO 유가 (USD/t)": 750},
            {"Month": "Feb", "명태 도매가 (USD/t)": 1420, "MGO 유가 (USD/t)": 770},
            {"Month": "Mar", "명태 도매가 (USD/t)": 1450, "MGO 유가 (USD/t)": 810},
            {"Month": "Apr", "명태 도매가 (USD/t)": 1430, "MGO 유가 (USD/t)": 840},
            {"Month": "May", "명태 도매가 (USD/t)": 1410, "MGO 유가 (USD/t)": 890},
            {"Month": "Jun", "명태 도매가 (USD/t)": 1420, "MGO 유가 (USD/t)": 920}
        ],
        "xAxis": "Month",
        "series": [
            {"dataKey": "명태 도매가 (USD/t)", "type": "bar", "yAxisId": "left", "color": "#06b6d4"},
            {"dataKey": "MGO 유가 (USD/t)", "type": "line", "yAxisId": "right", "color": "#ef4444"}
        ],
        "situation": "최근 6개월간 선박유(MGO) 가격이 급등하며 명태 판매 단가 상승폭을 상회하는 '데드 크로스' 징후가 관측되었습니다.",
        "takeaway": "MGO 가격이 톤당 900달러를 돌파할 경우 어획 마진율 급감이 예상되므로, 단기 조업일수를 축소하고 기 확보된 냉동창고 비축 물량을 시장에 방출하는 전략적 헷징이 필요합니다.",
        "methodology": "가상의 실시간 MGO 유가 지표와 B2B 도매가 매핑 (Synthetic Data)"
    },
    {
        "id": "w25_processing_bottleneck",
        "title": "[가공] 글로벌 가공 병목 지표 (다롄/베트남)",
        "chartType": "composed",
        "data": [
            {"Quarter": "23.Q1", "필렛 수율 (%)": 65, "공장 가동률 (%)": 92},
            {"Quarter": "23.Q2", "필렛 수율 (%)": 64, "공장 가동률 (%)": 89},
            {"Quarter": "23.Q3", "필렛 수율 (%)": 61, "공장 가동률 (%)": 85},
            {"Quarter": "23.Q4", "필렛 수율 (%)": 58, "공장 가동률 (%)": 78},
            {"Quarter": "24.Q1", "필렛 수율 (%)": 55, "공장 가동률 (%)": 72},
            {"Quarter": "24.Q2", "필렛 수율 (%)": 54, "공장 가동률 (%)": 65}
        ],
        "xAxis": "Quarter",
        "series": [
            {"dataKey": "공장 가동률 (%)", "type": "bar", "yAxisId": "left", "color": "#38bdf8"},
            {"dataKey": "필렛 수율 (%)", "type": "line", "yAxisId": "right", "color": "#f59e0b"}
        ],
        "situation": "어체 소형화로 인한 필렛(Fillet) 원물 수율이 65%에서 54%로 급감하였으며, 이에 따라 중국 다롄 주요 가공 공장의 가동률이 65%까지 떨어지는 병목 현상이 발생했습니다.",
        "takeaway": "수율 하락에 따른 글로벌 B2B 공급 물량 쇼크가 예상됩니다. 신속히 베트남 가공 라인으로 물량을 분산하고, 3분기분 수리미/필렛 선도 거래(선물) 물량을 15% 추가 확보할 것을 권고합니다.",
        "methodology": "가상의 가공 공장 수율 및 가동률 추적 (Synthetic Data)"
    },
    {
        "id": "w26_inventory_freight",
        "title": "[물류] 콜드체인 재고-운임 매트릭스",
        "chartType": "composed",
        "data": [
            {"Month": "M-5", "항만 재고율 (%)": 85, "Reefer 운임 지수": 150},
            {"Month": "M-4", "항만 재고율 (%)": 80, "Reefer 운임 지수": 140},
            {"Month": "M-3", "항만 재고율 (%)": 72, "Reefer 운임 지수": 125},
            {"Month": "M-2", "항만 재고율 (%)": 65, "Reefer 운임 지수": 105},
            {"Month": "M-1", "항만 재고율 (%)": 50, "Reefer 운임 지수": 95},
            {"Month": "Current", "항만 재고율 (%)": 45, "Reefer 운임 지수": 88}
        ],
        "xAxis": "Month",
        "series": [
            {"dataKey": "항만 재고율 (%)", "type": "bar", "yAxisId": "left", "color": "#f59e0b"},
            {"dataKey": "Reefer 운임 지수", "type": "line", "yAxisId": "right", "color": "#10b981"}
        ],
        "situation": "아시아-유럽 리퍼(Reefer) 운임 지수가 전고점 대비 40% 이상 하락하여 물류비 안정권에 접어들었으나, 부산/다롄 거점의 냉동창고 재고율이 45%로 최저치에 근접했습니다.",
        "takeaway": "운임이 낮고 재고가 부족한 현 시점이 '강력 매수(Buy)' 타이밍입니다. 장기 운송 계약(SC)을 현재 운임 베이스로 체결하여 연말 성수기 물류 대란 리스크를 원천 봉쇄해야 합니다.",
        "methodology": "가상의 재고율 및 운임 지수 역상관관계 모델링 (Synthetic Data)"
    },
    {
        "id": "w27_substitute_spread",
        "title": "[판매] 백색육 대체재 가격 스프레드 (Tipping Point)",
        "chartType": "composed",
        "data": [
            {"Week": "W1", "명태 (USD)": 1500, "대구 (USD)": 1850, "틸라피아 (USD)": 1100},
            {"Week": "W2", "명태 (USD)": 1550, "대구 (USD)": 1830, "틸라피아 (USD)": 1120},
            {"Week": "W3", "명태 (USD)": 1620, "대구 (USD)": 1810, "틸라피아 (USD)": 1110},
            {"Week": "W4", "명태 (USD)": 1700, "대구 (USD)": 1800, "틸라피아 (USD)": 1130},
            {"Week": "W5", "명태 (USD)": 1750, "대구 (USD)": 1820, "틸라피아 (USD)": 1150},
            {"Week": "W6", "명태 (USD)": 1810, "대구 (USD)": 1800, "틸라피아 (USD)": 1180}
        ],
        "xAxis": "Week",
        "series": [
            {"dataKey": "명태 (USD)", "type": "line", "yAxisId": "left", "color": "#06b6d4"},
            {"dataKey": "대구 (USD)", "type": "line", "yAxisId": "left", "color": "#94a3b8"},
            {"dataKey": "틸라피아 (USD)", "type": "line", "yAxisId": "left", "color": "#facc15"}
        ],
        "situation": "명태 톤당 가격이 급격히 상승하며 상위 프리미엄 어종인 대구(Cod) 가격의 100% 임계점을 돌파하는 '가격 역전' 현상이 발발했습니다.",
        "takeaway": "명태 단가가 대구를 넘어서는 순간 B2B 프랜차이즈 식자재 시장에서 심리적 저항선이 붕괴됩니다. HMR 라인업의 원료를 즉각 틸라피아(Tilapia) 또는 메기 등 저가 대체재로 스위칭하는 레시피 R&D 플랜 가동이 필수적입니다.",
        "methodology": "가상의 백색육 3종 가격 스프레드 (Synthetic Data)"
    },
    {
        "id": "w28_esg_premium",
        "title": "[ESG] 기후 이변(SST) & MSC 프리미엄 마진율",
        "chartType": "composed",
        "data": [
            {"Year": "2019", "수온이변(SST) 지수": 1.1, "MSC 프리미엄 (%)": 4.5},
            {"Year": "2020", "수온이변(SST) 지수": 1.3, "MSC 프리미엄 (%)": 5.2},
            {"Year": "2021", "수온이변(SST) 지수": 1.8, "MSC 프리미엄 (%)": 6.8},
            {"Year": "2022", "수온이변(SST) 지수": 2.1, "MSC 프리미엄 (%)": 8.5},
            {"Year": "2023", "수온이변(SST) 지수": 2.6, "MSC 프리미엄 (%)": 11.2},
            {"Year": "2024", "수온이변(SST) 지수": 3.2, "MSC 프리미엄 (%)": 15.0}
        ],
        "xAxis": "Year",
        "series": [
            {"dataKey": "수온이변(SST) 지수", "type": "bar", "yAxisId": "left", "color": "#ef4444"},
            {"dataKey": "MSC 프리미엄 (%)", "type": "line", "yAxisId": "right", "color": "#10b981"}
        ],
        "situation": "북태평양 표층수온(SST) 상승 이변 횟수 증가로 친환경 조업 규제가 강화됨에 따라, 합법적이고 지속 가능한 MSC 인증 명태의 시장 가격 프리미엄(가산금)이 15% 수준까지 급등했습니다.",
        "takeaway": "단순 어획량 증대가 아닌 '친환경 인증' 자체가 핵심 자산가치로 변모했습니다. 비인증 러시아산 쿼터를 감축하고, MSC 프리미엄을 독식할 수 있는 친환경 어법 선단에 대한 공격적인 M&A 및 투자가 시급합니다.",
        "methodology": "가상의 수온 이변 지수와 ESG 인증 가산율 (Synthetic Data)"
    }
]

# Remove older versions if they exist to prevent duplicates
existing_ids = [w['id'] for w in data['widgets']]
for w in new_widgets:
    if w['id'] not in existing_ids:
        data['widgets'].append(w)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Widgets added successfully.")
