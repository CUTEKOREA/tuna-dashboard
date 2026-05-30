#!/usr/bin/env python3
"""
P1/P2 신규 위젯 Batch 1 — pollock 5 + salmon 7 (검증완료·JSON 주입형).
JSON widgets[]에 append (id 중복 시 skip) + 백업(.bak_p1p2).
화이트리스트(PILLARS / cat* 배열) 패치는 별도 Edit로 수행.
수치는 artifacts/*_agri_enrichment + seafood_p1p2_widget_backlog 검증치만. 날조 없음.
"""
import json, shutil, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ─────────────────────────── POLLOCK (OLD 포맷: xAxis + series) ───────────────────────────
POLLOCK = [
    {
        "id": "w_pollock_tac_matrix_2026",
        "title": "2026 명태 TAC 매트릭스 — 미국(베링해) vs 러시아(극동)",
        "subtitle": "Seafoodnews 2026 TAC + 유니언포씨 러 극동 고시 · 글로벌 공급 상한 고정",
        "chartType": "composed",
        "xAxis": "어장",
        "data": [
            {"어장": "미국 베링해", "TAC(백만톤)": 1.394, "전년대비 증감(%)": 0},
            {"어장": "러시아 극동", "TAC(백만톤)": 2.00, "전년대비 증감(%)": 2},
        ],
        "series": [
            {"dataKey": "TAC(백만톤)", "type": "bar", "color": "#0891b2"},
            {"dataKey": "전년대비 증감(%)", "type": "line", "color": "#ef4444", "yAxisId": "right"},
        ],
        "unit": "백만 톤", "yUnit": "백만 톤", "reliability": 88,
        "source": "Seafoodnews 2026 Pollock TAC + 유니언포씨 러 극동 TAC 고시 (1차)",
        "isLiveApi": False, "syncDate": "2026.05",
        "sit": "2026년 미국 베링해 명태 TAC는 1.394백만 톤으로 전년 수준에서 동결됐고, 러시아 극동은 약 2.00백만 톤으로 2% 상향 고시됐습니다. 양국 합계 약 3.4백만 톤이 글로벌 명태 공급 상한을 사실상 고정하며, 러시아 실어획률은 87~88%로 약 12%의 미충족 갭이 존재합니다.",
        "strat": "공급 상한이 양국 정책 쿼터로 고정돼 가격 하방경직성이 강합니다. 러시아 증쿼터분(약 4만 톤)의 우회 가공 물량을 선점하고, 미국 동결 구간에서는 러시아산 차익 포지션을 확대해야 합니다.",
    },
    {
        "id": "w_pollock_frozen_import_price_monthly",
        "title": "한국 냉동명태 원산지별 수입단가 (2025 8월 누계)",
        "subtitle": "2025 냉동명태 수입동향 · 러시아 97% 단일 의존 · 단가↑물량↓ 공급 타이트",
        "chartType": "bar",
        "xAxis": "원산지",
        "data": [
            {"원산지": "러시아", "평균 수입단가(USD/kg)": 1.04},
            {"원산지": "미국", "평균 수입단가(USD/kg)": 1.62},
            {"원산지": "중국", "평균 수입단가(USD/kg)": 1.73},
        ],
        "series": [{"dataKey": "평균 수입단가(USD/kg)", "type": "bar", "color": "#2563eb"}],
        "unit": "USD/kg", "yUnit": "USD/kg", "reliability": 90,
        "source": "2025년 8월까지 냉동 명태 수입 동향 (KMI·관세청 누계)",
        "isLiveApi": False, "syncDate": "2025.09",
        "sit": "2025년 8월 누계 냉동명태 평균 수입단가는 1.06 USD/kg로 전년 대비 9% 올랐으나 물량은 77,997톤으로 11% 줄었습니다. 원산지별로는 러시아 1.04, 미국 1.62, 중국 1.73 USD/kg이며 러시아가 단가를 끌어내리며 비중 97%를 차지합니다.",
        "strat": "물량 감소 속 단가 상승은 공급 타이트 신호입니다. 러시아 단일국 97% 의존은 제재·환율 충격에 그대로 노출되므로, 미·중 단가 프리미엄(+0.6 USD/kg)을 감수해도 분기 단위 소싱 분산 비중을 확보해야 합니다.",
    },
    {
        "id": "w_pollock_processing_form_surimi_roe",
        "title": "글로벌 명태 가공형태 구성 (2023) — 필렛 후퇴·연육 중국 독점",
        "subtitle": "FAO FishStatJ 1976-2023 · 한국 연육은 냉동연육+조제품 합산 기준",
        "chartType": "bar",
        "xAxis": "형태",
        "data": [
            {"형태": "냉동원물", "생산량(톤)": 833140},
            {"형태": "필렛", "생산량(톤)": 204552},
            {"형태": "냉동알(명란)", "생산량(톤)": 24558},
            {"형태": "다짐육", "생산량(톤)": 21467},
            {"형태": "절임알(명란)", "생산량(톤)": 13783},
        ],
        "series": [{"dataKey": "생산량(톤)", "type": "bar", "color": "#0284c7"}],
        "unit": "톤", "yUnit": "톤", "reliability": 90,
        "source": "FAO FishStatJ 명태가공·수리미 1976-2023 (CC-BY-4.0)",
        "isLiveApi": False,
        "sit": "2023년 글로벌 명태 가공은 냉동원물 833,140톤·필렛 204,552톤으로 2013년 대비 필렛이 41% 급감하며 저부가 원물 중심으로 후퇴했습니다. 연육(수리미)은 중국이 1,580,128톤으로 글로벌 2,060,311톤의 76.7%를 독점했고, 한국은 냉동연육+조제품 합산 10,274톤에 그칩니다.",
        "strat": "중국 연육 76.7% 단일 독점은 한국 가공업의 구조적 종속 리스크입니다. 필렛 -41% 공백을 노려 명란(절임알) 고부가 전환을 가속하고, 러시아 냉동알 소멸로 비는 명란 원물을 미국산(19,001톤)으로 선제 대체 계약해야 합니다.",
    },
    {
        "id": "w_pollock_sst_climate_collapse",
        "title": "한국 연근해 표층수온 상승 & 명태 자원 소멸 (기후)",
        "subtitle": "국립수산과학원 1차 실측 · w32 조업리스크·k5 부화수온과 각도 분리",
        "chartType": "bar",
        "xAxis": "해역",
        "data": [
            {"해역": "전국 평균", "수온상승(℃)": 1.58},
            {"해역": "동해", "수온상승(℃)": 2.04},
            {"해역": "서해", "수온상승(℃)": 1.44},
            {"해역": "남해", "수온상승(℃)": 1.27},
        ],
        "series": [{"dataKey": "수온상승(℃)", "type": "bar", "color": "#0ea5e9"}],
        "unit": "℃", "yUnit": "℃", "reliability": 95,
        "source": "국립수산과학원 해양수산분야 기후변화 영향 브리핑 북 2025",
        "isLiveApi": False,
        "sit": "국립수산과학원 실측에 따르면 한국 연근해 표층수온은 1968~2024년 +1.58℃ 올라 전지구 평균의 2배 속도이며, 동해는 +2.04℃ 상승했습니다. 같은 기간 연근해 어획량은 151만 톤에서 91만 톤으로 급감하고 기초생산력은 21.6% 떨어졌으며, 한국산 명태는 사실상 어획이 사라졌습니다.",
        "strat": "명태 자원 소멸은 일시 변동이 아닌 동해 +2.04℃ 온난화의 구조적 결과이므로 국내 자원 회복 베팅은 폐기해야 합니다. 수입 의존(러 97%)을 상수로 두고, 기후 내성이 높은 대체 백색육 포트폴리오와 탄소 라벨링을 ESG 조달 기준으로 선제 내재화해야 합니다.",
    },
    {
        "id": "w_pollock_eu_tariff_atq_hsk",
        "title": "EU 명태 필렛 관세·ATQ 매트릭스 + HSK 통관 게이트",
        "subtitle": "ASMI/McKinley 2025-06 · HSK 10자리·MFDS 100 Bq/kg SPS 병기 (L-04)",
        "chartType": "bar",
        "xAxis": "원산지",
        "data": [
            {"원산지": "미국(ATQ 적용)", "관세율(%)": 0},
            {"원산지": "미국(MFN)", "관세율(%)": 13.7},
            {"원산지": "러시아(ATQ 배제)", "관세율(%)": 13.7},
        ],
        "series": [{"dataKey": "관세율(%)", "type": "bar", "color": "#3b82f6"}],
        "unit": "%", "yUnit": "%", "reliability": 85,
        "source": "ASMI/McKinley Comparative Seafood Tariff Rates Analysis (2025-06)",
        "isLiveApi": False,
        "sit": "EU 시장에서 미국산 명태 필렛은 자율관세쿼터(ATQ)로 0~13.7% 관세를 적용받는 반면, 러시아산은 ATQ에서 배제돼 일률 13.7% 관세를 부담합니다. 한국 통관에서는 HSK 10자리 코드와 MFDS 방사능 100 Bq/kg 기준이 동시 적용되는 SPS 게이트가 존재합니다.",
        "strat": "EU의 러시아 ATQ 배제는 미국산·제3국 가공품에 최대 13.7%p 관세 차익 기회를 엽니다. 러시아 원물을 ATQ 적용국에서 1차 가공해 원산지를 전환하는 관세 엔지니어링 루트를 설계하고, HSK 10자리 기준으로 KCS 통관 단가를 단일출처 관리해야 합니다.",
    },
]

# ─────────────────────────── SALMON (NEW 포맷: xKey + bars/lines) ───────────────────────────
SALMON = [
    {
        "id": "w46_proc_form_shift", "title": "글로벌 가공유형 전환 — 정점 후 수축, 조제 비중 상승",
        "chartType": "line", "xKey": "year",
        "data": [
            {"year": "2018", "가공량(톤)": 256177},
            {"year": "2022", "가공량(톤)": 232048},
            {"year": "2023", "가공량(톤)": 215266},
        ],
        "lines": [{"key": "가공량(톤)", "color": "#fb7185"}],
        "methodology": "FAO FishStat Global Processed Production 1990-2023 (salmon_processed_split.json) 실측. 보간 없음.",
        "reliability": 90, "telemetry": "static", "syncDate": "2026-05", "unit": "톤", "yUnit": "톤",
        "source": "FAO FishStat 글로벌 가공생산 1990-2023 (CC-BY-4.0)",
        "subtitle": "FAO FishStatJ · 2023 내역 냉동 114,815 + 조제 100,451톤",
        "sit": "글로벌 연어 가공생산은 2018년 256,177톤으로 정점을 찍은 뒤 2023년 215,266톤으로 후퇴했으며, 2023년 내역은 냉동 114,815톤과 조제 100,451톤으로 양분돼 조제(2차가공) 비중이 46.7%까지 상승했습니다.",
        "strat": "조제 비중 확대는 한국이 단순 신선·냉동 수입을 넘어 훈제·양념 등 2차가공 내재화로 마진을 캡처할 구조적 창임을 시사하므로, 폴란드형 재수출 가공 모델 진입을 검토해야 합니다.",
    },
    {
        "id": "w47_feed_fifo", "title": "지속가능 사료 전환 — FIFO 1.05→0.77, 대체원료 35%",
        "chartType": "composed", "xKey": "단계",
        "data": [
            {"단계": "과거", "FIFO 비율": 1.05, "대체원료 비중(%)": 10},
            {"단계": "현재", "FIFO 비율": 0.77, "대체원료 비중(%)": 35},
        ],
        "bars": [{"key": "FIFO 비율", "color": "#fb7185"}],
        "lines": [{"key": "대체원료 비중(%)", "color": "#10b981"}],
        "methodology": "salmonInsightFeedBio.json (FIFO·대체원료 전환율) 실측.",
        "reliability": 85, "telemetry": "synced", "syncDate": "2026-05", "unit": "배수 / %", "yUnit": "",
        "source": "salmonInsightFeedBio.json (FIFO·대체원료 전환율)",
        "subtitle": "FIFO = 어획 투입 대비 산출 · <1 = 순 단백질 생산자",
        "sit": "연어 양식 사료의 FIFO(어획 투입 대비 산출) 비율은 1.05에서 0.77로 개선돼 어획 1톤당 사료 투입이 1톤 미만으로 떨어졌고, 곤충·단세포단백 등 대체원료 비중이 10%에서 35%까지 확대됐습니다.",
        "strat": "FIFO<1 달성은 연어가 순(net) 단백질 생산자로 전환됐음을 의미하므로, 대체원료 비중이 높은 사료를 쓰는 양식사 물량을 ESG 프리미엄 채널(EU·북미 리테일)에 매칭해 단가 우위를 확보해야 합니다.",
    },
    {
        "id": "w48_eu_import_price", "title": "노르웨이·페로 EU 수입단가 — 원물 동반 약세",
        "chartType": "line", "xKey": "기간",
        "data": [
            {"기간": "직전", "노르웨이": 8.41, "페로": 9.10},
            {"기간": "현재", "노르웨이": 7.11, "페로": 7.60},
        ],
        "lines": [{"key": "노르웨이", "color": "#3b82f6"}, {"key": "페로", "color": "#f59e0b"}],
        "methodology": "EUMOFA Monthly Highlights 1/2026 (MH 1 2026 L1541) 실측.",
        "reliability": 88, "telemetry": "synced", "syncDate": "2026-01", "unit": "€/kg", "yUnit": "€/kg",
        "source": "EUMOFA Monthly Highlights 1/2026",
        "subtitle": "EUMOFA MH 1/2026 · 노르웨이·페로 EU 수입단가",
        "sit": "노르웨이산 EU 수입단가는 €8.41/kg에서 €7.11/kg로, 페로산은 €9.10/kg에서 €7.60/kg로 동반 하락하며 원물 가격이 약 15% 조정됐습니다. 양대 공급원이 동시에 약세를 보이는 가격 사이클 진입 신호입니다.",
        "strat": "EU 원물 단가 하락은 한국 수입 바이어에게 매입 타이밍 우위를 주므로, 단가 저점 구간에 노르웨이·페로 듀얼 소싱으로 선물성 물량을 확보해 착지원가를 낮춰야 합니다.",
    },
    {
        "id": "w49_duopoly_crack", "title": "칠레 감산 vs 노르웨이 안정 — 복점 균열",
        "chartType": "bar", "xKey": "year",
        "data": [
            {"year": "2023", "노르웨이": 1542480, "칠레": 768784},
            {"year": "2024", "노르웨이": 1552887, "칠레": 702768},
        ],
        "bars": [{"key": "노르웨이", "color": "#3b82f6"}, {"key": "칠레", "color": "#f59e0b"}],
        "methodology": "FAO FishStatJ 대서양 연어 양식 2024 (raw_data/3) CSV Totals/NOR/CHL 검증.",
        "reliability": 95, "telemetry": "synced", "syncDate": "2026-03", "unit": "톤", "yUnit": "톤",
        "source": "FAO FishStatJ 대서양 연어 양식 1950-2024",
        "subtitle": "Totals 2,704,464톤 기준 노르웨이 57.4% + 칠레 26.0%",
        "sit": "2024년 칠레 양식 생산은 702,768톤으로 전년 대비 8.6% 감소한 반면 노르웨이는 1,552,887톤으로 안정세를 유지해, 복점 점유율이 노르웨이(57.4%) 쪽으로 더 쏠렸습니다. Totals 2,704,464톤 기준 노르웨이 57.4%+칠레 26.0%로 양강 균형이 깨졌습니다.",
        "strat": "칠레 HAB·SRS 발 감산이 구조화되면 노르웨이 쏠림이 가격 협상력을 약화시키므로, 페로·영국·아이슬란드 등 제3 산지 비중을 의도적으로 키워 단일 산지 쇼크 노출을 분산해야 합니다.",
    },
    {
        "id": "w50_smoked_value_chain", "title": "EU 훈제 밸류체인 가격구조 (프랑스 2022)",
        "chartType": "bar", "xKey": "단계",
        "data": [
            {"단계": "원물(양식)", "가격(€/kg)": 8.19},
            {"단계": "공장 출고가", "가격(€/kg)": 25.34},
            {"단계": "소매가(VAT포함)", "가격(€/kg)": 38.54},
        ],
        "bars": [{"key": "가격(€/kg)", "color": "#fb7185"}],
        "methodology": "EUMOFA PTAT Smoked salmon FR/DE/PL (L972-979) 프랑스 2022 실측.",
        "reliability": 90, "telemetry": "synced", "syncDate": "2026-05", "unit": "€/kg", "yUnit": "€/kg",
        "source": "EUMOFA PTAT Smoked salmon FR/DE/PL (2022)",
        "subtitle": "프랑스 2022 · w38(국가비교)과 역할분리: 단계별 마진분해",
        "sit": "프랑스 훈제연어는 원물 8.19€/kg에서 공장 출고가 25.34€/kg, 소매가 38.54€/kg로 형성돼 원물 대비 소매 4.7배 마진이 가공·유통 단계에 적재됩니다. 부가가치의 79%가 원물 이후 단계에서 발생하는 구조입니다.",
        "strat": "원물 비중이 21%에 불과한 마진 구조는 한국 가공사가 훈제 단계 내재화 시 캡처 가능한 부가가치 폭을 정량적으로 보여주므로, 노르웨이 원물 직수입+자체 훈제 라인 투자를 마진 방어 전략으로 추진해야 합니다.",
    },
    {
        "id": "w51_yield_ladder", "title": "가공 표준수율 사다리 — 어체→필렛 60%",
        "chartType": "bar", "xKey": "단계",
        "data": [
            {"단계": "내장 제거(GWT)", "수율(%)": 84},
            {"단계": "머리·내장 제거", "수율(%)": 77},
            {"단계": "필렛(C-Trim)", "수율(%)": 60},
        ],
        "bars": [{"key": "수율(%)", "color": "#be123c"}],
        "methodology": "EUMOFA PTAT Organic salmon (L286-290) 표준수율표 실측.",
        "reliability": 88, "telemetry": "static", "syncDate": "2026-05", "unit": "%", "yUnit": "%",
        "source": "EUMOFA PTAT Organic salmon 표준수율표",
        "subtitle": "어체 100% 기준 · 필렛 1톤 = 원물 약 1.67톤",
        "sit": "연어 가공 표준수율은 내장제거(GWT) 84%, 머리·내장제거 77%, 최종 필렛(C-Trim) 60%로 단계마다 손실이 누적돼 어체의 40%가 부산물로 전환됩니다. 즉 필렛 1톤 확보에 원물 약 1.67톤이 필요합니다.",
        "strat": "필렛 수율 60%는 부산물 40%(어유·어분·콜라겐)의 가치화가 마진을 좌우함을 의미하므로, 수율 손실분을 폐기물이 아닌 업사이클 원료로 회수하는 부산물 밸류체인을 병행 구축해야 합니다.",
    },
    {
        "id": "w54_asia_price_bench", "title": "아시아 수입단가 벤치마크 — 한국 최고가",
        "chartType": "bar", "xKey": "국가",
        "data": [
            {"국가": "한국", "수입단가($/kg)": 8.35},
            {"국가": "일본", "수입단가($/kg)": 7.47},
            {"국가": "베트남", "수입단가($/kg)": 7.38},
        ],
        "bars": [{"key": "수입단가($/kg)", "color": "#fb7185"}],
        "methodology": "salmon_asia_benchmark.json (2023-12) 실측.",
        "reliability": 85, "telemetry": "synced", "syncDate": "2024-01", "unit": "$/kg", "yUnit": "$/kg",
        "source": "salmon_asia_benchmark.json (2023-12)",
        "subtitle": "한국 0.88$/kg 프리미엄 부담 · 아시아 최고가 수입국",
        "sit": "한국의 연어 수입단가는 8.35 $/kg로 일본 7.47·베트남 7.38 $/kg 대비 약 12% 높아 아시아 최고가 수입국입니다. 동일 노르웨이 원물에 대해 한국이 구조적 프리미엄을 지불하고 있습니다.",
        "strat": "한국의 0.88 $/kg 단가 열위는 구매력 분산·소량 분할발주에서 기인할 가능성이 크므로, 공동구매·대량 장기계약으로 일본 수준 단가로 수렴시켜 연 수입액 기준 의미 있는 원가를 절감해야 합니다.",
    },
]

def inject(rel_path, new_widgets):
    path = os.path.join(ROOT, rel_path)
    shutil.copy(path, path + ".bak_p1p2")
    d = json.load(open(path, encoding="utf-8"))
    ws = d["widgets"]
    existing = {w.get("id") for w in ws}
    added, skipped = [], []
    for w in new_widgets:
        if w["id"] in existing:
            skipped.append(w["id"]); continue
        ws.append(w); added.append(w["id"])
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    # validate round-trip
    json.load(open(path, encoding="utf-8"))
    print(f"[{rel_path}] +{len(added)} added, {len(skipped)} skipped (dup) → total {len(ws)}")
    if added: print("   added:", ", ".join(added))
    if skipped: print("   skipped:", ", ".join(skipped))

if __name__ == "__main__":
    inject("public/data/pollock_real_data_v4.json", POLLOCK)
    inject("public/data/salmon_real_data_v4.json", SALMON)
    print("\n다음: PILLARS / cat* 화이트리스트에 id 추가 (Edit) → npm run build → 배포")
