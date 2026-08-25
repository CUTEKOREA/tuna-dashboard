#!/usr/bin/env python3
"""Bolton Group 조사보고서 HTML → `public/data/companies/bolton_v1.json`.

원자료는 사내 조사보고서다 (`docs/evidence/company-bolton-2026-08/보고서.html`).
9개 절에서 화면이 쓸 표만 골라 옮긴다.

**수치는 손으로 옮기되 대조는 기계가 한다.**

⚠ 이 회사는 **참치 단독 매출을 공개하지 않는다.** 공개 최소 단위는 Food 카테고리(2,382 M€)이고
   그 안에 캔참치·수산캔·육류캔·소스가 전부 들어 있다 — 참치 단독은 그보다 작다.
⚠ **조달량 74만 톤은 Bolton Food 원료 + Tri Marine 트레이딩의 합**이다. 브랜드가 쓴 양이 아니다.
   2024년 +26% 급증분의 상당액이 Tri Marine 트레이딩 증가(+144,000 t)다.
⚠ 선단은 **연도와 등록부를 반드시 붙인다.** 공개 선박명단 399척(2024)은 자사선이 아니라
   조달 선단이고, 계열 소유는 WCPFC 10척 · IATTC 4척이다. AURORA B·ROSITA C 의 등록 선주는
   Atunera Dularra SL 이고 그 모회사가 Grupo Conservas Garavilla(Bolton 100%)라 그룹 선박이 맞다.
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/evidence/company-bolton-2026-08/보고서.html"
OUT = ROOT / "public/data/companies/bolton_v1.json"


def corpus() -> str:
    s = SRC.read_text(encoding="utf8", errors="replace")
    s = re.sub(r"data:[^\"')]+", "IMG", s)
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)))


PROFILE = [
    ["산업지주", "Bolton Group S.r.l. · CF/P.IVA 05983890152 · REA MI 1055773"],
    ["최상위 가족지주", "Factor Holding S.r.l. · CF 07224860960 · 2010-11-29 설립"],
    ["이탈리아 식품", "Bolton Food S.p.A. · CF 00197980139 · 1951년 · Cermenate (CO)"],
    ["본점", "Via G.B. Pirelli 19, 20124 Milano"],
    ["자본금", "€20,000,000 전액납입 · 등기 직원 149명"],
    ["구 상호", "Bolton Alimentari S.p.A. — Bolton Food S.p.A. 의 이전 상호 (개칭 시점 미확인)"],
    ["회장", "Marina Nissim — 창업자 Joseph Nissim의 딸"],
    ["그룹 CEO", "Roberto Leopardi · 2024-01-10 취임"],
    ["상장", "비상장 가족기업 — 공시는 발표문과 등기 기탁분뿐"],
]

# 01절 — 앞의 다섯 회사와 나란히 세운다
COMPARE = [
    {"항목": "정체", "thaiunion": "브랜드 수집", "fcf": "대는 회사", "itochu": "종합상사", "bolton": "브랜드 + 상류 통합"},
    {"항목": "수직통합 방향", "thaiunion": "브랜드 인수(수평)", "fcf": "상류 → 하류", "itochu": "중개", "bolton": "하류 → 상류"},
    {"항목": "상장", "thaiunion": "SET 상장", "fcf": "비상장(공개발행 정지)", "itochu": "도쿄 프라임", "bolton": "비상장 가족"},
    {"항목": "참치 외 사업", "thaiunion": "펫케어·수산 소재", "fcf": "벙커링·선용품", "itochu": "8개 컴퍼니", "bolton": "접착제·세제·화장품 32.7%"},
]

# 04절 — 카테고리 구성. 참치 사이클 밖이 3분의 1이다
CATEGORIES = [
    {"카테고리": "Food", "y2024": 2409, "y2025": 2382, "비중": 67.3, "브랜드": 16},
    {"카테고리": "Home Care", "y2024": 375, "y2025": 378, "비중": 10.7, "브랜드": 22},
    {"카테고리": "Adhesives", "y2024": 323, "y2025": 355, "비중": 10.0, "브랜드": 8},
    {"카테고리": "Personal Care", "y2024": 275, "y2025": 291, "비중": 8.2, "브랜드": 12},
    {"카테고리": "Beauty", "y2024": 146, "y2025": 135, "비중": 3.8, "브랜드": 5},
]

# 04절 — 지역별 매출. 이탈리아가 40%에서 29%로 내려온 자리를 남미·기타유럽이 채웠다
REGIONS = [
    {"지역": "이탈리아", "y2019": 39.5, "y2022": 31.0, "y2024": 29.2, "y2025": 28.6},
    {"지역": "기타 유럽", "y2019": 13.7, "y2022": 16.0, "y2024": 18.3, "y2025": 18.5},
    {"지역": "남미", "y2019": None, "y2022": 11.0, "y2024": 12.9, "y2025": 13.9},
    {"지역": "북·중미", "y2019": None, "y2022": 10.0, "y2024": 10.1, "y2025": 10.2},
    {"지역": "아시아", "y2019": None, "y2022": None, "y2024": 9.2, "y2025": 7.8},
    {"지역": "프랑스", "y2019": None, "y2022": 9.0, "y2024": 6.8, "y2025": 7.2},
    {"지역": "스페인", "y2019": None, "y2022": 7.0, "y2024": 5.6, "y2025": 5.6},
    {"지역": "독일", "y2019": 8.7, "y2022": 4.0, "y2024": 4.3, "y2025": 4.3},
    {"지역": "아프리카", "y2019": None, "y2022": None, "y2024": 2.8, "y2025": 3.0},
    {"지역": "오세아니아", "y2019": None, "y2022": None, "y2024": 0.8, "y2025": 0.9},
]

# 06절 — 조달량 시계열. 2024년 +26% 안에 Tri Marine 트레이딩 +144,000 t 이 섞여 있다
SOURCING = [
    {"연도": 2022, "톤": 616006, "전년비": None},
    {"연도": 2023, "톤": 562270, "전년비": -8.7},
    {"연도": 2024, "톤": 708328, "전년비": 26.0},
    {"연도": 2025, "톤": 740310, "전년비": 5.0},
]

# 06절 — 어종. 2025년에 가다랑어가 79%→62% 로 내려앉고 황다랑어가 두 배가 됐다
SPECIES = [
    {"어종": "Skipjack 가다랑어", "y2024": 559209, "y2025": 462406, "비중": 62.0, "증감": -17},
    {"어종": "Yellowfin 황다랑어", "y2024": 112940, "y2025": 215556, "비중": 29.0, "증감": 91},
    {"어종": "Bigeye 눈다랑어", "y2024": 14853, "y2025": 35418, "비중": 5.0, "증감": 138},
    {"어종": "Albacore 날개다랑어", "y2024": 21326, "y2025": 26930, "비중": 4.0, "증감": 26},
]

# 06절 — 어법. 선망이 92%다
GEAR = [
    {"어법": "Purse Seine 선망", "y2024": 657154, "y2025": 679800, "비중": 92.0},
    {"어법": "Pole and Line 봉줄", "y2024": 36520, "y2025": 39113, "비중": 5.0},
    {"어법": "Longline 연승", "y2024": 11331, "y2025": 13659, "비중": 2.0},
    {"어법": "Handline 손낚시", "y2024": 3323, "y2025": 7738, "비중": 1.0},
]

# 08·09절 — 공개 선박명단. 총 척수는 줄고 한국 비중은 올라갔다
VESSEL_LIST = [
    {"연도": 2021, "총척수": 580, "한국선": 12, "비중": 2.1, "구성": "선망 251 · 봉줄 274 · 손낚시 55"},
    {"연도": 2022, "총척수": 496, "한국선": 11, "비중": 2.2, "구성": "선망 283 · 봉줄 188 · 손낚시 25"},
    {"연도": 2023, "총척수": 407, "한국선": 10, "비중": 2.5, "구성": "선망 250 · 봉줄 122 · 손낚시 35"},
    {"연도": 2024, "총척수": 399, "한국선": 14, "비중": 3.5, "구성": "선망 268 · 봉줄 111 · 손낚시 20"},
]

# 03절 — 등기 기탁분에서만 나오는 손익. 매출은 발표문, 이익은 언론 인용이다
FINANCIALS = [
    {"연도": 2016, "매출": "€1.9bn", "ebitda": 736.4, "순이익": 210.8},
    {"연도": 2020, "매출": "€2.79bn", "ebitda": 774.4, "순이익": 473.3},
    {"연도": 2021, "매출": "€2.83bn", "ebitda": 813.4, "순이익": 213.2},
    {"연도": 2022, "매출": "€3.2bn", "ebitda": 756.5, "순이익": 170.0},
    {"연도": 2023, "매출": "€3.24bn", "ebitda": None, "순이익": 174.0},
    {"연도": 2024, "매출": "€3.5bn", "ebitda": None, "순이익": 207.0},
]

# 07절 — 자사 선단. 조달 선단 399척과 혼동하면 안 된다
OWN_FLEET = [
    {"등록부": "WCPFC RFV", "척수": 10, "상태": "활성 · 계열 소유", "내역": "NFD 6(Tri Marine 계열 · MSC 2025-07 부속서로 Solomon Amber·Diamond 추가돼 선망 7척) · Atunera Dularra 2 · Conservas Isabel Ecuatoriana 2"},
    {"등록부": "IATTC", "척수": 4, "상태": "활성 · 계열 소유", "내역": "Aurora B 1,777 t · Rosita C 1,500 t (선주 Atunera Dularra SL → Grupo Conservas Garavilla → Bolton) · Charo 1,600 t · San Andres 1,583 t (Conservas Isabel Ecuatoriana) — 적재능력"},
    {"등록부": "ICCAT", "척수": 3, "상태": "비활성 · Via Alizé는 2025-04 중남미 매각 보도", "내역": "Via Avenir · Via Mistral · Via Alizé (구 Saupiquet 선대)"},
]

# 09절 — 한국 접점
KOREA = [
    {"항목": "명단 속 한국 국적선", "값": "14척 (2024)", "기준": "399척 중 3.5% · SHILLA 두 척 복귀"},
    {"항목": "신라교역 선망선", "값": "2021년 6척 전원 등재 → 2023년 0척 → 2024년 2척", "기준": "Bolton 공개 선박명단"},
    {"항목": "동원산업 어업", "값": "MSC 2건 + CC FIP 1건", "기준": "Bolton 조달 어업 목록에 실명 등재"},
    {"항목": "한국 → 스페인 냉동 황다랑어", "값": "3,743 t · US$9.02백만", "기준": "2024년 HS 030342 · 약 US$2.41/kg"},
    {"항목": "한국 기업 공시 속 Bolton", "값": "0건", "기준": "거래처명을 공시하지 않는다"},
]

STATS = {
    "매출_백만유로": 3541,
    "조달_톤": 740310,
    "food_비중": 67.3,
    "비참치_비중": 32.7,
    "브랜드수": 63,
    "명단선박": 399,
    "한국선": 14,
    "한국선_비중": 3.5,
    "자사선_iattc": 4,
    "자사선_wcpfc": 10,
    "선망_비중": 92.0,
    "green_비중": 98.5,
}

META = {
    "회사": "Bolton Group (Bolton Group S.r.l.)",
    "국가": "이탈리아 (밀라노)",
    "업종": "소비재 그룹 — 참치는 Food 카테고리, 그 밖에 접착제·세제·화장품",
    "출처": "Bolton 조사 아카이브 (agri_data …/이탈리아/Bolton, 2026-08) — Sustainability Report 2025 + 공개 선박명단 + 등기 기탁분",
    "출처한계": "비상장이라 연결재무제표를 공표하지 않는다. 매출은 발표문, 손익은 등기 기탁분의 언론 인용이다.",
    "측정경계": "조달 740,310 t 은 Bolton Food 원료와 Tri Marine 트레이딩의 합이다. 브랜드가 쓴 양이 아니다.",
    "갱신방법": "python3 scripts/build_company_bolton.py",
}


def main() -> int:
    text = corpus()
    must = [
        "05983890152", "07224860960", "00197980139", "1055773", "Marina Nissim",
        "Roberto Leopardi", "Joseph Nissim", "Bolton Alimentari",
        "3,541", "3,528", "2,382", "2,409", "67.3%", "68.3%",
        "375", "378", "323", "355", "275", "291", "146", "135",
        "39.5%", "28.6%", "18.5%", "13.9%", "10.2%",
        "616,006", "562,270", "708,328", "740,310",
        "559,209", "462,406", "112,940", "215,556", "14,853", "35,418",
        "21,326", "26,930", "657,154", "679,800", "36,520", "39,113",
        "11,331", "13,659", "3,323", "7,738",
        "580", "496", "407", "399", "2.1%", "2.2%", "2.5%", "3.5%",
        "6,460", "Aurora B", "Rosita C", "San Andres", "Via Alizé",
        "736.4", "813.4", "756.5", "210.8", "213.2", "207",
        "3,743", "US$9.02백만", "Dongwon",
    ]
    missing = [m for m in must if m not in text]
    if missing:
        print("원문에 없는 수치:", missing, file=sys.stderr)
        return 1

    # 산술 재검증 — 옮겨 적다 자릿수를 틀리는 것이 이 작업의 주된 실패 모드다
    cat_sum = sum(r["y2025"] for r in CATEGORIES)
    if cat_sum != STATS["매출_백만유로"]:
        print("카테고리 합이 순매출과 다르다:", cat_sum, file=sys.stderr)
        return 1
    if sum(r["브랜드"] for r in CATEGORIES) != STATS["브랜드수"]:
        print("브랜드 수 합계 불일치:", sum(r["브랜드"] for r in CATEGORIES), file=sys.stderr)
        return 1
    sp_sum = sum(r["y2025"] for r in SPECIES)
    if sp_sum != STATS["조달_톤"]:
        print("어종 합이 조달량과 다르다:", sp_sum, file=sys.stderr)
        return 1
    # 어법 합계는 회사 공시에서 조달 총량과 미세하게 어긋난다 — 반올림 구간이다.
    gear_sum = sum(r["y2025"] for r in GEAR)
    if abs(gear_sum - STATS["조달_톤"]) > 1000:
        print("어법 합이 조달량과 크게 다르다:", gear_sum, file=sys.stderr)
        return 1
    if SOURCING[-1]["톤"] != STATS["조달_톤"]:
        print("조달 시계열 마지막 값 불일치", file=sys.stderr)
        return 1
    last = VESSEL_LIST[-1]
    if last["총척수"] != STATS["명단선박"] or last["한국선"] != STATS["한국선"]:
        print("선박명단 마지막 값 불일치", file=sys.stderr)
        return 1
    if round(last["한국선"] / last["총척수"] * 1000) / 10 != STATS["한국선_비중"]:
        print("한국선 비중 계산 불일치", file=sys.stderr)
        return 1
    if round(STATS["food_비중"] + STATS["비참치_비중"], 1) != 100.0:
        print("Food/비참치 비중 합이 100이 아니다", file=sys.stderr)
        return 1

    payload = {
        "_meta": META,
        "profile": PROFILE,
        "compare": COMPARE,
        "categories": CATEGORIES,
        "regions": REGIONS,
        "sourcing": SOURCING,
        "species": SPECIES,
        "gear": GEAR,
        "vesselList": VESSEL_LIST,
        "financials": FINANCIALS,
        "ownFleet": OWN_FLEET,
        "korea": KOREA,
        "stats": STATS,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(f"{OUT.relative_to(ROOT)}: {len(must)}개 문자열 대조 통과 · {OUT.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
