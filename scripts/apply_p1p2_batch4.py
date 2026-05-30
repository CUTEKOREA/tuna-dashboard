#!/usr/bin/env python3
"""
P1/P2 신규 위젯 Batch 4 — 참치 value-chain 2건 (JSON append).
정찰: 명시 5건 중 4건 이미 존재(RFMO bar w104·SKJ w105·reefer 컴포넌트·EU소매 w43·가공패권 w15) → 중복 회피.
신규: w106(냉동0303 vs 통조림160414 단가갭, S3) + w107(5대 RFMO Kobe 레이더, S1 — 사용자가 명시한 'radar'는 현재 bar뿐이라 신규).
telemetry: reliability/badges/apiSource 생략·source에 'LIVE' 미포함 → 렌더러가 STATIC 표기(정직). 수치 전부 1차 검증치, 날조 0.
"""
import json, shutil, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TUNA = [
    {
        "id": "w106_kr_frozen_canned_gap",
        "title": "한국 냉동 원물(0303) vs 통조림(160414) 단가 갭",
        "subtitle": "관세청 통관 5년 — 가공 부가가치 입증(냉동 원물 대비 통조림 프리미엄)",
        "category": "part3",
        "chartType": "composed", "xAxis": "Year",
        "data": [
            {"Year": "2022", "냉동 원물(0303) 단가": 4.47, "통조림(160414) 단가": 5.00, "가공 부가가치 갭(USD/kg)": 0.52},
            {"Year": "2023", "냉동 원물(0303) 단가": 3.84, "통조림(160414) 단가": 4.92, "가공 부가가치 갭(USD/kg)": 1.08},
            {"Year": "2024", "냉동 원물(0303) 단가": 3.28, "통조림(160414) 단가": 4.71, "가공 부가가치 갭(USD/kg)": 1.44},
            {"Year": "2025", "냉동 원물(0303) 단가": 4.50, "통조림(160414) 단가": 4.66, "가공 부가가치 갭(USD/kg)": 0.16},
        ],
        "bars": [{"dataKey": "가공 부가가치 갭(USD/kg)", "fill": "#06b6d4"}],
        "lines": [
            {"dataKey": "냉동 원물(0303) 단가", "name": "냉동 원물(0303) 수입단가", "stroke": "#10b981"},
            {"dataKey": "통조림(160414) 단가", "name": "통조림(160414) 수입단가", "stroke": "#f59e0b"},
        ],
        "unit": "USD/kg",
        "source": "관세청(KCS) 참치 통관 5년 (KCS_tuna_5y.csv, HS0303 냉동 7세번 합산 vs HS160414 통조림, 2022-2025)",
        "sit": "한국의 참치 수입은 냉동 원물(HS0303)과 가공품(통조림 HS160414)의 단가 격차로 가공 부가가치를 입증합니다. 통조림 단가는 2022~2025년 $4.66~5.00/kg로 안정적인 반면 냉동 원물은 $3.28~4.50/kg로 변동이 커, 가공 부가가치 갭이 2022년 +$0.52에서 2024년 +$1.44로 확대됐습니다(2025년은 냉동 원물 단가 급등으로 +$0.16로 축소).",
        "strat": "냉동 원물 단가가 낮은 구간(2024)에는 직수입·국내 가공 내재화로 통조림 대비 마진을 캡처하고, 원물 단가가 통조림에 수렴하는 구간(2025)에는 완제품 직수입으로 전환하는 가공 차익 스위칭 전략을 운용해야 합니다.",
        "telemetry": "STATIC",
    },
    {
        "id": "w107_rfmo_kobe_radar",
        "title": "5대 RFMO 어획강도 신호등 레이더 (F/FMSY)",
        "subtitle": "IOTC·IATTC·WCPFC·CCSBT·ICCAT 자원평가 — 전 해역 F/FMSY<1(과도어획 없음)",
        "category": "part1",
        "chartType": "radar", "format": "new", "radarKey": "subject",
        "radars": [
            {"key": "어획강도", "name": "어획강도(F/FMSY)", "color": "#06b6d4"},
            {"key": "한계선", "name": "MSY 한계선(=1.0)", "color": "#ef4444"},
        ],
        "data": [
            {"subject": "IOTC(인도양)", "어획강도": 0.75, "한계선": 1.0},
            {"subject": "IATTC(동태평양)", "어획강도": 0.54, "한계선": 1.0},
            {"subject": "WCPFC(중서태평양)", "어획강도": 0.35, "한계선": 1.0},
            {"subject": "CCSBT(남방참치)", "어획강도": 0.46, "한계선": 1.0},
            {"subject": "ICCAT(대서양)", "어획강도": 0.89, "한계선": 1.0},
        ],
        "unit": "비율(F/FMSY)",
        "source": "IOTC SC27(2024)·IATTC SAC-16·WCPFC SC2025·CCSBT ESC28(2023)·ICCAT YFT(2024) 자원평가",
        "sit": "5대 RFMO 자원평가 결과 어획강도(F/FMSY)는 전 해역에서 1.0 미만으로 과도어획이 없습니다(WCPFC 중서부태평양 가다랑어 0.35 최저 ~ ICCAT 대서양 황다랑어 0.89 한계 근접). 자원량은 IOTC(SB/SBMSY 1.32)·IATTC(1.78)·ICCAT(1.37)가 BMSY를 상회(녹색)하나, CCSBT 남방참다랑어는 TRO/TROMSY 0.85로 여전히 BMSY 미만(회복 중)입니다.",
        "strat": "어획강도는 전 해역 안정적이나 ICCAT 대서양(0.89)이 한계에 근접하고 CCSBT는 자원량 회복 단계이므로, 대서양·남방 원물 비중 확대 시 쿼터 감축 리스크를 선반영하고 녹색 해역(인도양·태평양) 원물로 조달 안정성을 확보해야 합니다.",
        "telemetry": "STATIC",
    },
]

def inject(rel, widgets):
    path = os.path.join(ROOT, rel)
    shutil.copy(path, path + ".bak_p1p2")
    d = json.load(open(path, encoding="utf-8"))
    ws = d["widgets"]; existing = {w.get("id") for w in ws}; added = []
    for w in widgets:
        if w["id"] in existing: print(f"   SKIP dup {w['id']}"); continue
        ws.append(w); added.append(w["id"])
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    json.load(open(path, encoding="utf-8"))
    print(f"[{rel}] +{len(added)} → total {len(ws)}: {', '.join(added)}")

if __name__ == "__main__":
    inject("public/data/tuna_real_data_v3.json", TUNA)
    print("\n다음: TunaDashboard 화이트리스트(S1 770행·S3 911행) id 추가 → build → 배포")
