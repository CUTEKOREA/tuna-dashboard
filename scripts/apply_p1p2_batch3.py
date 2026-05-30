#!/usr/bin/env python3
"""
P1/P2 신규 위젯 Batch 3 — jukkumi 3 (JSON widgets append) + whelk 3 (data 배열 append, 인라인 TSX).
jukkumi: PILLAR_WIDGET_IDS 화이트리스트 패치 별도. 렌더러 series 필수(pie/bar/composed).
whelk: 인라인 TSX 구조 → 여기선 JSON 데이터 배열만 추가, 구조분해+WidgetCard JSX는 별도 Edit.
수치: artifacts enrichment + KCS/KMI/FAO 검증치만. 날조 없음.
"""
import json, shutil, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JUKKUMI = [
    {
        "id": "w32_kcs_hs_import_price_volume", "title": "한국 두족류 수입 단가·물량 (KCS HS별)",
        "pillar": "S2", "chartType": "composed", "xAxis": "HS형태",
        "subtitle": "관세청 HS별 통관 2024 · 주꾸미 단독 아닌 두족류(낙지·문어) 묶음",
        "unit": "천톤 / $/kg", "reliability": 90, "isLiveApi": False,
        "series": [
            {"dataKey": "수입물량(천톤)", "type": "bar", "color": "#a78bfa", "yAxisId": "left"},
            {"dataKey": "CIF단가($/kg)", "type": "line", "color": "#f472b6", "yAxisId": "right"},
        ],
        "data": [
            {"HS형태": "냉동(030752)", "수입물량(천톤)": 112.0, "CIF단가($/kg)": 6.68},
            {"HS형태": "활·신선(030751)", "수입물량(천톤)": 17.3, "CIF단가($/kg)": 13.6},
        ],
        "source": "관세청(KCS) HS별 통관 2020-2024",
        "sit": "관세청 통관 기준 냉동 두족류(030752)는 2024년 약 112,000톤·$748M으로 CIF $6.68/kg, 활·신선(030751)은 17,280톤·약 $13.6/kg을 기록했습니다. 냉동이 물량의 절대다수를 차지하며, 주꾸미 전용세번(0307512000) 단독 수입은 2024년 12.7톤으로 사실상 0이라 이 수치는 낙지·문어를 포함한 두족류 묶음통계입니다.",
        "strat": "kg당 $6.68의 냉동 묶음세번 물량을 가공원물 베이스로 활용하되, 활·신선($13.6/kg) 고단가 라인은 국내산 프리미엄과 경쟁시키지 말고 분리 운용해 평균 조달단가를 낮춰야 합니다.",
    },
    {
        "id": "w34_form_mix_frozen_live", "title": "통관 형태 구성 — 냉동 대 활·신선 (2026Q1)",
        "pillar": "S3", "chartType": "bar", "xAxis": "통관형태",
        "subtitle": "KMI 2026Q1 통관형태 구성비 — 냉동 86.5% 대 활·신선 13.5%",
        "unit": "%", "reliability": 85, "isLiveApi": False,
        "series": [{"dataKey": "비중(%)", "type": "bar", "color": "#a78bfa", "yAxisId": "left"}],
        "data": [{"통관형태": "냉동", "비중(%)": 86.5}, {"통관형태": "활·신선·냉장", "비중(%)": 13.5}],
        "source": "KMI FTA 분기 수입동향(2026Q1)",
        "sit": "2026년 1분기 두족류 통관 형태는 냉동이 86.5%, 활·신선·냉장이 13.5%로 냉동이 절대 비중을 차지합니다. 장거리 수입 두족류가 냉동 중심으로 유통되고 활·신선은 국내산·근거리 물량에 한정됩니다.",
        "strat": "냉동 86.5% 비중을 전제로 콜드체인·해상 MAP 물류에 투자를 집중하고, 활·신선 13.5% 고단가 세그먼트는 별도 프리미엄 채널로 분리 운용해야 합니다.",
    },
    {
        "id": "w35_import_dependency", "title": "수입 의존도 심화 — 국내생산 급감 대 수입 정체",
        "pillar": "S3", "chartType": "composed", "xAxis": "연도",
        "subtitle": "KMI — 국내생산(1~11월) -24.7% vs 수입 정체",
        "unit": "천톤", "reliability": 85, "isLiveApi": False,
        "series": [
            {"dataKey": "국내생산(천톤)", "type": "bar", "color": "#f472b6", "yAxisId": "left"},
            {"dataKey": "수입(천톤)", "type": "bar", "color": "#a78bfa", "yAxisId": "left"},
        ],
        "data": [
            {"연도": "2024", "국내생산(천톤)": 2.2, "수입(천톤)": 30.5},
            {"연도": "2025", "국내생산(천톤)": 1.6, "수입(천톤)": 30.7},
        ],
        "source": "KMI FTA 분기·국내생산 통계",
        "sit": "국내 두족류 생산은 2024년 1~11월 2.2천톤에서 2025년 동기 1.6천톤으로 -24.7% 급감한 반면, 수입은 2024년 30.5천톤에서 2025년 30.7천톤으로 정체했습니다. 국내 공급 붕괴가 수입 의존 구조를 심화시키는 국면입니다.",
        "strat": "국내 생산 -24.7% 급감이 구조적임을 전제로 수입 소싱 다변화와 장기 오프테이크 계약을 선제 확보해 단일 공급원 리스크를 헷지해야 합니다.",
    },
]

# whelk: data 객체에 추가할 신규 배열 키 (인라인 WidgetCard는 TSX Edit로 별도)
WHELK_DATA = {
    "koreaGlobalShareData": [
        {"name": "멕시코", "value": 17782}, {"name": "영국", "value": 14091},
        {"name": "프랑스", "value": 10117}, {"name": "러시아", "value": 9229},
        {"name": "한국", "value": 9062}, {"name": "아일랜드", "value": 4803},
    ],
    "feedstockYoyData": [
        {"year": "2023", "volumeT": 8251, "valueM": 68.98, "unitPrice": 8.36},
        {"year": "2024", "volumeT": 6215, "valueM": 58.50, "unitPrice": 9.41},
    ],
    "originCifGapData": [
        {"name": "튀르키예", "value": 13.39}, {"name": "영국", "value": 12.75},
        {"name": "아일랜드", "value": 12.27}, {"name": "중국", "value": 6.37}, {"name": "세네갈", "value": 4.73},
    ],
}

def inject_widgets(rel, widgets):
    path = os.path.join(ROOT, rel)
    shutil.copy(path, path + ".bak_p1p2")
    d = json.load(open(path, encoding="utf-8"))
    ws = d["widgets"]; existing = {w.get("id") for w in ws}; added = []
    for w in widgets:
        if w["id"] in existing: print(f"   SKIP dup {w['id']}"); continue
        ws.append(w); added.append(w["id"])
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    json.load(open(path, encoding="utf-8"))
    print(f"[{rel}] +{len(added)} widgets → total {len(ws)}: {', '.join(added)}")

def inject_data_keys(rel, keys):
    path = os.path.join(ROOT, rel)
    shutil.copy(path, path + ".bak_p1p2")
    d = json.load(open(path, encoding="utf-8"))
    added = []
    for k, v in keys.items():
        if k in d: print(f"   SKIP existing key {k}"); continue
        d[k] = v; added.append(k)
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    json.load(open(path, encoding="utf-8"))
    print(f"[{rel}] +{len(added)} data keys: {', '.join(added)}")

if __name__ == "__main__":
    inject_widgets("public/data/jukkumi_real_data_v1.json", JUKKUMI)
    inject_data_keys("public/data/whelk_real_data_v1.json", WHELK_DATA)
    print("\n다음: jukkumi PILLAR_WIDGET_IDS 패치 + whelk 구조분해/WidgetCard JSX 삽입(Edit) → build → 배포")
