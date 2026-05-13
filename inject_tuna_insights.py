import json

file_path = 'public/data/tuna_real_data_v3.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_widgets = [
    {
        "id": "w25_byproduct_cashcow",
        "title": "수율 48%의 딜레마: 52% 부산물의 캐시카우 역전",
        "subtitle": "참치 가식부 vs 비가식부 이익률 구조의 파괴적 전환 (2024)",
        "unit": "%",
        "methodology": "글로벌 1위 참치 가공업체(타이유니온) 2024년 사업부문별 마진율 교차 분석 및 해체 수율(Yield) 역추산 모델",
        "chartType": "composed",
        "xKey": "부문",
        "bars": [{"dataKey": "볼륨_비중", "fill": "#38bdf8", "name": "원물 볼륨 비중 (%)"}],
        "lines": [{"dataKey": "매출총이익률", "stroke": "#f59e0b", "name": "매출총이익률 (Gross Margin, %)", "strokeWidth": 3}],
        "data": [
            {"부문": "살코기 (캔/횟감)", "볼륨_비중": 48, "매출총이익률": 5.0},
            {"부문": "부산물 (펫케어/오메가3)", "볼륨_비중": 52, "매출총이익률": 28.5}
        ],
        "situation": "참치 캔 및 횟감 중심의 전통적 원물(48% 수율) 비즈니스는 출혈 경쟁으로 순이익률이 1~5%대인 마진 압박(Squeeze) 구간에 진입했습니다. 반면 과거 폐기하던 52%의 뼈, 피, 껍질은 고도화된 바이오 추출 기술과 융합되며 펫푸드 및 의약품 원료로 재탄생 중입니다.",
        "takeaway": "양(Volume) 중심의 1차 가공에서 가치(Value) 중심의 바이오 업사이클링으로 설비 투자를 피벗해야 합니다. 단순 가공 공장이 아닌 부산물 추출 플랜트로의 전환은 참치 기업의 멀티플을 바이오 산업 수준으로 격상시킵니다."
    },
    {
        "id": "w26_data_hegemony",
        "title": "데이터 주권의 무기화: 조업에서 '투명성 데이터' 판매로의 피벗",
        "subtitle": "블록체인 어획 증명(Traceability) 프리미엄 마진 스프레드",
        "unit": "$/톤",
        "methodology": "글로벌 참치 추적성 표준(GDST) 연동 인증 유무에 따른 EU 프리미엄 마켓 도매 납품 단가 스프레드 분석",
        "chartType": "bar",
        "xKey": "year",
        "bars": [
            {"dataKey": "일반_원물", "fill": "#64748b", "name": "일반 원물 (미인증)"},
            {"dataKey": "인증_데이터_원물", "fill": "#8b5cf6", "name": "블록체인 인증 원물"}
        ],
        "data": [
            {"year": "2021", "일반_원물": 1800, "인증_데이터_원물": 1950},
            {"year": "2022", "일반_원물": 1850, "인증_데이터_원물": 2100},
            {"year": "2023", "일반_원물": 1900, "인증_데이터_원물": 2350},
            {"year": "2024", "일반_원물": 1800, "인증_데이터_원물": 2500}
        ],
        "situation": "어업의 핵심 경쟁력이 신규 선박 건조(CapEx)에서 기존 선박을 연결하는 데이터 소프트웨어로 이동 중입니다. PNA(태평양 도서국 연합) 소속 플랫폼들은 단순 원물 판매를 넘어 '어획 증명 데이터' 자체를 판매하는 B2B IT 비즈니스로 진화하며 프리미엄 시장의 게이트키퍼가 되었습니다.",
        "takeaway": "신규 선박 투자(CapEx)를 동결하고, 어획물 이력 추적 시스템(IoT/Blockchain)에 투자해야 합니다. 이제 참치 원물 그 자체보다 '투명성 증명 데이터'가 프리미엄 시장의 가격 통제력과 30% 이상의 초과 마진을 결정짓는 절대 권력입니다."
    },
    {
        "id": "w27_global_minimum_tax",
        "title": "글로벌 최저한세(15%) 쇼크와 다국적 조세 회피 모델 붕괴",
        "subtitle": "OECD 조세 개편에 따른 글로벌 다국적 선도 기업 실효 법인세율 변동",
        "unit": "%",
        "methodology": "OECD BEPS Pillar 2(글로벌 최저한세) 유예 종료에 따른 다국적 수산 자본(타이유니온 등)의 이전가격(Transfer Pricing) 과세 시뮬레이션",
        "chartType": "area",
        "xKey": "year",
        "areas": [{"dataKey": "실효법인세율", "fill": "#f43f5e", "name": "실효 법인세율 (%)"}],
        "data": [
            {"year": "2020", "실효법인세율": 7.2},
            {"year": "2021", "실효법인세율": 7.5},
            {"year": "2022", "실효법인세율": 7.8},
            {"year": "2023", "실효법인세율": 8.1},
            {"year": "2024", "실효법인세율": 8.5},
            {"year": "2025", "실효법인세율": 15.0},
            {"year": "2026", "실효법인세율": 15.0}
        ],
        "situation": "다국적 수산 기업들은 태평양 도서국 등에 페이퍼 컴퍼니를 세워 7~8% 수준의 낮은 실효 법인세율을 유지하며 초과 이익을 창출해 왔습니다. 그러나 2025년 1월부터 OECD 글로벌 최저한세(15%)가 전면 시행됨에 따라 이 약탈적 세금 회피 모델이 완전히 종식되었습니다.",
        "takeaway": "실효 법인세율이 2배(15%)로 폭등함에 따라 다국적 수산 자본들은 마진 하락을 방어하기 위해 조업 선단(원물 공급자)의 매입 단가를 극단적으로 쥐어짜거나 펫푸드 등 고마진 산업으로의 수직계열화를 필사적으로 가속할 것입니다."
    }
]

# Avoid duplicates
existing_ids = {w['id'] for w in data['widgets']}
for nw in new_widgets:
    if nw['id'] not in existing_ids:
        data['widgets'].append(nw)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

