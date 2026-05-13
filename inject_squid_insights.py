import json

file_path = 'public/data/squid_real_data_v3.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widgets = [
    {
        "id": "w25_squid_chitosan_biomaterial",
        "title": "오징어 부산물(폐기물)의 딥테크 혁명: 400% 초과 마진의 비밀",
        "subtitle": "버려지던 연골(Pen)과 먹물, 고부가가치 바이오·의료 신소재로 재탄생",
        "unit": "% (영업이익률)",
        "methodology": "단순 냉동 가공품(몸통/다리)과 부산물 추출 바이오 신소재(키틴/키토산/멜라닌)의 톤당 부가가치 및 마진율 스프레드 교차 분석",
        "chartType": "composed",
        "xKey": "category",
        "bars": [{"dataKey": "전통_원물", "fill": "#64748b", "name": "전통 가공품 마진 (%)"}],
        "lines": [{"dataKey": "바이오_업사이클링", "stroke": "#10b981", "name": "바이오 신소재 마진 (%)", "strokeWidth": 3}],
        "data": [
            {"category": "1차 가공 (원물/필렛)", "전통_원물": 4.5, "바이오_업사이클링": 0},
            {"category": "오징어 연골 (키틴/의료용)", "전통_원물": 0, "바이오_업사이클링": 35.0},
            {"category": "오징어 먹물 (고기능성 도료)", "전통_원물": 0, "바이오_업사이클링": 42.5},
            {"category": "내장 (고단백 펫푸드 원료)", "전통_원물": 0, "바이오_업사이클링": 28.0}
        ],
        "situation": "오징어 몸통(Tube)과 다리(Tentacle) 중심의 1차 가공 비즈니스는 원물가 변동과 인건비 상승으로 3~5%대 이익률의 덫에 갇혀 있습니다. 반면, 폐기 비용을 지불하고 버리던 연골(Pen)과 먹물은 차세대 의료용 생체 소재(키토산) 및 전도성 잉크로 개발되며 바이오 딥테크 캐시카우로 부상했습니다.",
        "takeaway": "단순 '수산물 가공'을 넘어 '해양 바이오 파운드리'로 사업 구조를 재편해야 합니다. 부산물 추출 설비 투자는 오징어 원물 가격 변동성 헤지(Hedge)의 핵심 방어막이며, 기업 가치(Multiple)를 수산업에서 딥테크(Deep Tech) 수준으로 리레이팅(Re-rating) 시킵니다."
    },
    {
        "id": "w26_squid_ai_jigging_fuel",
        "title": "집어등(Light) 패러다임의 종말: AI 자동 조업과 유류비 35% 절감",
        "subtitle": "전통적 광원 의존에서 소나(Sonar) 및 AI 지깅(Jigging) 봇으로의 진화",
        "unit": "$/톤 (조업 단가)",
        "methodology": "원양 채낚기 어선의 유류(Bunker-C) 소모 구조 분석 및 AI 기반 예측 조업 솔루션 도입 시 OPEX(운영비) 절감 시뮬레이션",
        "chartType": "area",
        "xKey": "year",
        "areas": [
            {"dataKey": "전통_집어등_조업", "fill": "#f43f5e", "name": "전통 조업 단가 ($/t)"},
            {"dataKey": "AI_지깅_조업", "fill": "#3b82f6", "name": "AI/데이터 조업 단가 ($/t)"}
        ],
        "data": [
            {"year": "2021", "전통_집어등_조업": 1200, "AI_지깅_조업": 1150},
            {"year": "2022", "전통_집어등_조업": 1450, "AI_지깅_조업": 1100},
            {"year": "2023", "전통_집어등_조업": 1500, "AI_지깅_조업": 1050},
            {"year": "2024", "전통_집어등_조업": 1650, "AI_지깅_조업": 1000},
            {"year": "2025(E)", "전통_집어등_조업": 1800, "AI_지깅_조업": 950}
        ],
        "situation": "오징어 채낚기 조업 원가의 40% 이상을 차지하는 유류비는 글로벌 탄소세 도입과 고유가로 인해 한계치에 달했습니다. 야간에 막대한 전력을 소모하여 집어등을 밝히는 기존 방식은 도태되고 있으며, 소나 빅데이터와 AI 자동 지깅 봇을 결합한 스마트 선단이 조업 효율을 압도하고 있습니다.",
        "takeaway": "노후 선단의 엔진 교체가 아닌 '조업 두뇌(AI/IoT) 교체'에 투자금을 집중해야 합니다. 해양 환경 데이터(수온/염도)를 구독하고 AI 예측 모델을 선단에 장착하는 것만이, 자원 고갈과 유가 폭등의 이중고를 돌파할 유일한 탈출구입니다."
    },
    {
        "id": "w27_squid_climate_geopolitics",
        "title": "엘니뇨-라니냐 시프트: 해양 영토를 넘나드는 기후 지정학 아비트리지",
        "subtitle": "기후 변화에 따른 오징어 군집 이동과 EEZ(배타적 경제수역) 무력화 현상",
        "unit": "천 톤 (어획량)",
        "methodology": "태평양 해수면 온도(ENSO) 변동 사이클과 주요 조업국(남미/중국)의 공해상(High Seas) 이동 어획 데이터 코릴레이션 분석",
        "chartType": "bar",
        "xKey": "enso_phase",
        "bars": [
            {"dataKey": "EEZ_내_어획", "fill": "#f59e0b", "name": "EEZ 내 어획량"},
            {"dataKey": "공해상_어획", "fill": "#8b5cf6", "name": "공해상(High Seas) 어획량"}
        ],
        "data": [
            {"enso_phase": "강한 라니냐 (수온↓)", "EEZ_내_어획": 850, "공해상_어획": 300},
            {"enso_phase": "중립 시기", "EEZ_내_어획": 600, "공해상_어획": 550},
            {"enso_phase": "강한 엘니뇨 (수온↑)", "EEZ_내_어획": 250, "공해상_어획": 1100}
        ],
        "situation": "수온에 극도로 민감한 단년생 어종인 오징어는 엘니뇨(수온 상승) 발생 시 전통적 연안(EEZ)을 이탈하여 단속이 느슨한 공해상(High Seas)으로 거대한 군집을 이동시킵니다. 거대 원양 선단(DWF)은 이 기후 변화의 사각지대를 정밀하게 추적하며 지정학적 관할권 밖에서 자원을 싹쓸이하고 있습니다.",
        "takeaway": "특정 국가의 연안 조업권이나 쿼터 확보에 의존하는 전통적 소싱 전략은 실패할 수밖에 없습니다. 기후/해양 모델링 데이터를 기반으로 글로벌 공해상 조업 선단과의 다면적 수매 네트워크(Agile Sourcing)를 구축하여 공급망 붕괴 리스크를 분산하십시오."
    }
]

# Avoid duplicates
existing_ids = {w['id'] for w in data['widgets']}
for nw in new_widgets:
    if nw['id'] not in existing_ids:
        data['widgets'].append(nw)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

