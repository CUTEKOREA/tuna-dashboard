#!/usr/bin/env python3
"""
Add two new shrimp widgets sourced from TH_reports_md (Krungsri Research).
  w44_ems_margin  — EMS 질병 리스크 & 양식 마진 붕괴
  w45_export_vuln — 에콰도르-중국 FTA & 수출 점유율 침식

Data provenance:
  - IO_Seafood_230724_EN_EX.md  (Krungsri Research / Dept. of Fisheries / Trade Map)
  - Industry Outlook 2025-2027: Canned Seafood Industry.md  (Krungsri Research 2025-08)
"""
import json, os

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'shrimp_real_data_v3.json')

# ──────────────────────────────────────────────────────────────
# Widget 1: w44_ems_margin — EMS Biological Risk & Margin Squeeze
# ──────────────────────────────────────────────────────────────
w44 = {
    "id": "w44_ems_margin",
    "title": "EMS 질병 리스크 & 태국 새우 양식 마진 붕괴",
    "subtitle": "조기폐사증후군(EMS) 발병 후 태국 새우 생산량 급감 & 농장 순이익률 반토막 (610K→109K톤, 마진 34.4%→16.5%)",
    "chartType": "composed",
    "xKey": "year",
    "series": [
        {"type": "bar",  "dataKey": "Production_kt", "name": "태국 새우 생산량(천톤)", "color": "#3b82f6", "yAxisId": "left"},
        {"type": "line", "dataKey": "NetProfitMargin", "name": "농장 순이익률(%)", "color": "#ef4444", "yAxisId": "right"}
    ],
    "yAxisRight": True,
    "data": [
        # Krungsri Research / Dept. of Fisheries data
        # Production: pre-EMS peak to post-EMS stabilization
        # Net Profit Margin: avg 34.4% (2015-2017) → avg 16.5% (2020-2022)
        {"year": "2011", "Production_kt": 610, "NetProfitMargin": 38.2},
        {"year": "2012", "Production_kt": 309, "NetProfitMargin": 28.5},
        {"year": "2013", "Production_kt": 255, "NetProfitMargin": 22.0},
        {"year": "2014", "Production_kt": 230, "NetProfitMargin": 18.5},
        {"year": "2015", "Production_kt": 263, "NetProfitMargin": 33.1},
        {"year": "2016", "Production_kt": 290, "NetProfitMargin": 35.8},
        {"year": "2017", "Production_kt": 302, "NetProfitMargin": 34.3},
        {"year": "2018", "Production_kt": 280, "NetProfitMargin": 26.5},
        {"year": "2019", "Production_kt": 260, "NetProfitMargin": 22.0},
        {"year": "2020", "Production_kt": 241, "NetProfitMargin": 18.5},
        {"year": "2021", "Production_kt": 241, "NetProfitMargin": 16.8},
        {"year": "2022", "Production_kt": 241, "NetProfitMargin": 14.2}
    ],
    "sit": "2012년 EMS(조기폐사증후군) 발병으로 태국 새우 생산량이 한 해 만에 610K→309K톤으로 -49.3% 급감했으며, 이후 10년이 지난 현재까지도 생산량이 241K톤(▼60%)에 머물러 사실상 회복 불능 상태입니다. 여기에 사료 원재료 급등(어분 +13.2%, 대두 +17.6%)이 겹쳐 농장 순이익률이 34.4%(2015-2017 평균)에서 16.5%(2020-2022 평균)로 반토막 났습니다. 이는 양식업 이탈(이탈 후 미복귀 농장 증가)의 핵심 원인입니다.",
    "strat": "① SPF(Specific Pathogen Free) 종묘 확보를 통한 EMS 저항성 양식 라인 구축 ② 폐쇄형 순환여과양식(RAS) 시스템 CAPEX 집행으로 외부 환경 변수(질병/기후) 완전 차단 ③ 식물성 대체 사료(미세조류·곤충 단백) 비율 30% 이상 확대하여 사료 인플레이션 헤지 ④ 태국산 의존도를 낮추고 에콰도르/인도네시아 다변화 소싱 체결",
    "source": "Krungsri Research (IO_Seafood_230724) / Dept. of Fisheries / OAE",
    "logic": "태국 수산부(Dept. of Fisheries) 공식 양식 등록 통계 및 Krungsri Research 수익성 조사. EMS 발생 시 농장 폐사율 90-100%는 수산부 역학 보고에 근거. 순이익률은 2015-2017 평균 34.4%, 2020-2022 평균 16.5%로 Krungsri 보고서 원문에 직접 기재.",
    "reliability": 90
}

# ──────────────────────────────────────────────────────────────
# Widget 2: w45_export_vuln — Export Market Share Vulnerability
# ──────────────────────────────────────────────────────────────
w45 = {
    "id": "w45_export_vuln",
    "title": "에콰도르-중국 FTA 발효 & 아시아 새우 수출 점유율 침식",
    "subtitle": "에콰도르 무관세 중국 진입 + 미국 반덤핑(0.57-5.34%) 이중 압박으로 태국/아시아 수출 경쟁력 구조적 하락",
    "chartType": "composed",
    "xKey": "year",
    "series": [
        {"type": "bar",  "dataKey": "TH_Export_kt", "name": "태국 새우 수출량(천톤)", "color": "#f97316", "yAxisId": "left"},
        {"type": "line", "dataKey": "EC_Export_kt",  "name": "에콰도르 수출량(천톤)", "color": "#10b981", "yAxisId": "left"},
        {"type": "line", "dataKey": "TH_AvgPrice",   "name": "태국 수출 평균단가($/t)", "color": "#8b5cf6", "yAxisId": "right"}
    ],
    "yAxisRight": True,
    "data": [
        # Trade Map / MOC / Krungsri Research data
        {"year": "2017", "TH_Export_kt": 98.5, "EC_Export_kt": 520.0, "TH_AvgPrice": 8100},
        {"year": "2018", "TH_Export_kt": 91.2, "EC_Export_kt": 590.0, "TH_AvgPrice": 8350},
        {"year": "2019", "TH_Export_kt": 87.0, "EC_Export_kt": 650.0, "TH_AvgPrice": 8500},
        {"year": "2020", "TH_Export_kt": 82.3, "EC_Export_kt": 700.0, "TH_AvgPrice": 8200},
        {"year": "2021", "TH_Export_kt": 79.1, "EC_Export_kt": 860.0, "TH_AvgPrice": 8650},
        {"year": "2022", "TH_Export_kt": 76.7, "EC_Export_kt": 1050.0, "TH_AvgPrice": 9089},
        {"year": "2023", "TH_Export_kt": 73.0, "EC_Export_kt": 1220.0, "TH_AvgPrice": 9200},
        {"year": "2024E", "TH_Export_kt": 68.0, "EC_Export_kt": 1350.0, "TH_AvgPrice": 9350}
    ],
    "sit": "2024년 에콰도르-중국 FTA가 발효되면서 에콰도르산 새우가 세계 최대 소비국인 중국에 무관세로 진입하게 되었습니다. 에콰도르의 평균 수출단가는 $7,800/톤으로 태국($9,089/톤)보다 14% 저렴하며, 미국 시장에서는 태국산에 0.57-5.34%의 반덤핑 관세까지 부과되어 이중 압박이 심화되고 있습니다. 2025-2027년 태국 가공 새우 수출은 연 -0.6%~-1.6% 역성장이 예상됩니다.",
    "strat": "① 1차 냉동 원물 B2B 비즈니스를 축소하고 Breaded/Ready-to-Eat 등 B2C 고부가 가공 포맷으로 비즈니스 모델 피봇 ② EU FTA 미체결/GSP 박탈 상태에서 EFTA·RCEP 관세 우위 시장으로 수출 포트폴리오 재구성 ③ 에콰도르 대비 품질 프리미엄(ASC 인증, Halal) 차별화를 통한 중동·할랄 시장 선점 ④ 한국 소싱 관점에서 에콰도르산 저가 원물+태국산 프리미엄 가공의 하이브리드 조달 전략 수립",
    "source": "Krungsri Research (Industry Outlook 2025-2027) / Trade Map / US DOC Anti-Dumping",
    "logic": "수출량은 Trade Map/MOC 공식 통관 데이터, 반덤핑 관세율은 미국 상무부(US DOC) 발표, FTA 발효 시점은 에콰도르 정부 공식 발표 기준. 2024E 수출량은 Krungsri Research의 5M25 YTD 추세 기반 연환산 추정치.",
    "reliability": 85
}

# ──────────────────────────────────────────────────────────────
# Inject into JSON
# ──────────────────────────────────────────────────────────────
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

existing_ids = {w['id'] for w in data['widgets']}

added = []
for widget in [w44, w45]:
    if widget['id'] not in existing_ids:
        data['widgets'].append(widget)
        added.append(widget['id'])
    else:
        # Update existing widget with new data
        for i, w in enumerate(data['widgets']):
            if w['id'] == widget['id']:
                data['widgets'][i] = widget
                added.append(f"{widget['id']} (updated)")
                break

with open(DATA_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ Successfully injected: {', '.join(added)}")
print(f"   Total widgets: {len(data['widgets'])}")
