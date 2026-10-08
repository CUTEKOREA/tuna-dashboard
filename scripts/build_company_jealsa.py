#!/usr/bin/env python3
"""Jealsa 조사보고서 HTML → `public/data/companies/jealsa_v1.json`.

원자료는 사내 조사보고서다 (`docs/evidence/company-jealsa-2026-09/보고서.html`).
카드가 쓰는 핵심 수치만 옮긴다. 절별 표와 서술은 `build_report_tables.py`·
`build_report_prose.py` 가 같은 HTML 에서 따로 뽑는다.

**수치는 손으로 옮기되 대조는 기계가 한다.**

⚠ **이익률을 통조림 업황 지표로 쓰지 마라.** 2022년 연결이익 약 5,000만 € 는 풍력단지 지분
   매각에서 나왔고, 같은 해에 화재 보험금 약 94 M€ 도 들어왔다. 비영업 요인이 둘이다.
⚠ **개별법인과 그룹 연결을 접합하지 마라.** Jealsa Foods 553.4 + Escurís 526.9 = 1,080.3 M€ 는
   내부거래 상계 전 수치이고 연결은 781 M€ 다. 매체가 연결 수치를 「Jealsa Foods」 명의로
   적는 관행이 있어 특히 위험하다.
⚠ **자사 MSC 어장 인증은 현재 없다.** MSC-F-30011 은 2022-11-22 철회됐고 현행 커버리지는
   AGAC 집단 인증이다. 같은 인증서에 Albacora·Bolton 선박이 함께 있다.
⚠ **Albacora 지분율은 어디에도 없다.** 확인된 것은 ALONSO ESCURIS, S.L. 의 부회장석(등록부)과
   통신사 1건의 주주 언급뿐이다. GLEIF 신고로 「지배지분은 아니다」까지만 말할 수 있다.
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/evidence/company-jealsa-2026-09/보고서.html"
OUT = ROOT / "public/data/companies/jealsa_v1.json"


def corpus() -> str:
    s = SRC.read_text(encoding="utf8", errors="replace")
    s = re.sub(r"data:[^\"')]+", "IMG", s)
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)))


META = {
    "회사": "Jealsa (Corporación Empresarial Jesús Alonso, S.L.)",
    "국가": "스페인 (Boiro · A Coruña)",
    "업종": "수산 통조림 · 어분·어유 · 펫푸드 · 열병합·풍력·수력 발전",
    "출처": "Jealsa 조사 아카이브 (agri_data …/스페인/Jealsa, 2026-09) — 8축 조사노트 + 반증 렌즈 + 보완조사",
    "출처한계": (
        "비상장 가족그룹이다. 상업등기소에 연결계정을 예치하고 비재무보고서를 웹에 올리지만 "
        "법인별 재무제표·내부거래·주주 구성은 공개하지 않는다. 스페인어판 보고서는 텍스트층이 "
        "없는 스캔본이라 광학인식을 거쳐야 읽힌다."
    ),
    "측정경계": (
        "연결(Corporación Empresarial Jesús Alonso, S.L.)과 개별법인(Jealsa Foods·Escurís)을 "
        "섞지 마라. 매체가 연결 수치를 개별법인명으로 적는 관행이 있다. "
        "ICCAT 상태코드 DELI·OPVE 의 공식 정의는 공개 문서에 없어 해석하지 않는다."
    ),
    "갱신방법": "python3 scripts/build_company_jealsa.py + build_report_tables.py + build_report_prose.py",
}

# 3절 — 연결 시계열. 예치 주체는 Corporación Empresarial Jesús Alonso, S.L.
FINANCIALS = [
    {"연도": 2020, "매출": 712.8, "영업이익": None, "순이익": 11.4},
    {"연도": 2021, "매출": 704.0, "영업이익": None, "순이익": 4.0},
    {"연도": 2022, "매출": 814.8, "영업이익": 58.8, "순이익": 50.0},
    {"연도": 2023, "매출": 778.5, "영업이익": 35.0, "순이익": 2.13},
    {"연도": 2024, "매출": 781.0, "영업이익": 48.17, "순이익": 10.6},
    {"연도": 2025, "매출": 825.7, "영업이익": 51.8, "순이익": 26.4},
]

# 8절 — 갈리시아 3사 그룹 연결 대비
GALICIA = [
    {"연도": 2020, "jealsa": 712.8, "nauterra": 578.0, "frinsa": 588.0},
    {"연도": 2023, "jealsa": 778.5, "nauterra": 697.0, "frinsa": 712.8},
    {"연도": 2024, "jealsa": 781.0, "nauterra": 727.0, "frinsa": 741.0},
    {"연도": 2025, "jealsa": 825.7, "nauterra": 765.0, "frinsa": None},
]

# 1절 — CNAE 10.22 개별법인 2024년 매출. **연결과 접합 금지.**
ENTITIES = [
    {"순위": 1, "법인": "Frinsa del Noroeste, S.A.", "그룹": "Frinsa", "매출": 625.9},
    {"순위": 2, "법인": "Jealsa Foods, S.A.U.", "그룹": "Jealsa", "매출": 553.4},
    {"순위": 3, "법인": "Escurís, S.L.", "그룹": "Jealsa", "매출": 526.9},
]

# 5절 — ICCAT 선박등록부. 세 척 다 활성 목록 밖이다.
FLEET = [
    {"선명": "SANT YAGO UNO", "imo": "8919439", "구선명": "Arowana", "구기국": "일본",
     "상태": "DELI", "소유": "Atunera Nacional, S.A."},
    {"선명": "Sant Yago Tres", "imo": "8919427", "구선명": "Cap Coz", "구기국": "벨리즈",
     "상태": "DELI", "소유": "Atunera Sant Yago, S.A."},
    {"선명": "SANT YAGO DOS", "imo": "8919491", "구선명": None, "구기국": None,
     "상태": "OPVE", "소유": "Atunera Sant Yago, S.A."},
]

# 6절 — 2024년 처리 참치의 조달 구성. 합이 100 이어야 한다.
SOURCING = [
    {"구분": "MSC 인증 어장", "비중": 58},
    {"구분": "MSC 인증 종합 평가 진행 중", "비중": 14},
    {"구분": "MSC 개선 프로그램", "비중": 9},
    {"구분": "공개 FIP 참여 선박", "비중": 15},
    {"구분": "어느 범주에도 들지 않음", "비중": 4},
]

# 6절 — 인력. 회사는 11월 30일 기준으로 센다.
HEADCOUNT = [
    {"연도": 2021, "상시": None, "연간총창출": 6834},
    {"연도": 2022, "상시": 4421, "연간총창출": 7786},
    {"연도": 2023, "상시": 3459, "연간총창출": 6346},
    {"연도": 2024, "상시": 3667, "연간총창출": 5756},
]

# 7절 — Albacora 자본 교차. 층위를 나눠 적는다.
ALBACORA = [
    {"층위": "지배구조", "확인된 것": "ALONSO ESCURIS, S.L.이 Albacora 부회장. Juan Luis Alonso Escurís가 이사이자 Salica 두 회사 이사", "등급": "A"},
    {"층위": "조업·인증", "확인된 것": "MSC AGAC 인증서 한 장 아래 Jealsa·Albacora·Bolton 선박이 함께 등재", "등급": "A"},
    {"층위": "자본", "확인된 것": "통신사 한 건이 「Jealsa」를 Albacora 주주로 적는다. 주체와 비율은 나오지 않는다", "등급": "B"},
    {"층위": "지배지분", "확인된 것": "Albacora가 GLEIF에 NON_CONSOLIDATING 신고 — 어느 주주도 연결편입하지 않는다", "등급": "A"},
]

STATS = {
    "연결매출_2025": 825.7,
    "연결매출_정점": 814.8,
    "정점연도": 2022,
    "순이익_2025": 26.4,
    "순이익_2023": 2.13,
    "mercadona_매출": 454.0,
    "mercadona_비중": 55,
    "유럽_비중": 85,
    "계열_법인수": 21,
    "에너지_법인수": 9,
    "산업공장": 7,
    "선단_회사표기": 2,
    "선단_등록부": 3,
    "iccat_활성_과테말라": 0,
    "msc_인증어장_비중": 58,
    "상시인력_2024": 3667,
    "상시인력_2022": 4421,
    "판매국": 49,
    "albacora_자본금": 11748240,
    "albacora_발행주식": 317520,
    "albacora_액면": 37,
    "화재_보험금": 94,
}

CARD = {
    "numeral": "Ⅸ",
    "name": "Jealsa",
    "country": "스페인",
    "tagline": "매출의 55%가 고객 한 곳 · 경쟁 그룹 이사회의 부회장석",
    "stats": [
        {"label": "2025 연결매출", "value": "825,7 M€"},
        {"label": "Mercadona 향 비중", "value": "55%"},
        {"label": "자체 선망선", "value": "2척"},
    ],
}


def main() -> int:
    if not SRC.exists():
        print(f"보고서가 없다: {SRC}", file=sys.stderr)
        return 1
    text = corpus()

    # 화면에 나갈 핵심 수치 전부. 보고서는 유럽식 표기다(소수점 쉼표, 천단위 마침표).
    must = [
        "825,7", "814,8", "778,5", "781", "712,8", "704",
        "51,8", "48,17", "58,8", "26,4", "10,6", "2,13", "454", "55%",
        "553,4", "526,9", "625,9", "1.080,3",
        "B70304316", "A11902269", "11.748.240", "317.520",
        "8919439", "8919427", "8919491", "2.109", "79,8",
        "4.421", "7.786", "6.346", "5.756", "3.667",
        "96%", "58%", "14%", "9%", "15%", "4%", "85%", "49",
        "765", "727", "741", "697", "588", "578",
        "MSC-F-30011", "2022-11-22", "NON_CONSOLIDATING",
        "Arowana", "Cap Coz", "AGAC",
    ]
    missing = [m for m in must if m not in text]
    if missing:
        print("원문에 없는 수치:", missing, file=sys.stderr)
        return 1

    # 산술 재검증 — 옮겨 적다 자릿수를 틀리는 것이 이 작업의 주된 실패 모드다
    y2025 = next(r for r in FINANCIALS if r["연도"] == 2025)
    if y2025["매출"] != STATS["연결매출_2025"]:
        print("2025년 매출이 STATS와 다르다:", y2025["매출"], file=sys.stderr)
        return 1
    peak = max(FINANCIALS, key=lambda r: r["매출"] if r["연도"] < 2025 else 0)
    if peak["연도"] != STATS["정점연도"] or peak["매출"] != STATS["연결매출_정점"]:
        print("2025년 이전 정점 불일치:", peak["연도"], peak["매출"], file=sys.stderr)
        return 1
    # Mercadona 비중은 계산으로 맞아야 한다
    calc = round(STATS["mercadona_매출"] / STATS["연결매출_2025"] * 100)
    if calc != STATS["mercadona_비중"]:
        print("Mercadona 비중 계산 불일치:", calc, file=sys.stderr)
        return 1
    # 개별법인 합산이 연결을 넘는다는 것이 1절의 요지다
    pair = sum(e["매출"] for e in ENTITIES if e["그룹"] == "Jealsa")
    y2024 = next(r for r in FINANCIALS if r["연도"] == 2024)
    if round(pair, 1) != 1080.3 or pair <= y2024["매출"]:
        print("개별 합산 검증 실패:", pair, file=sys.stderr)
        return 1
    if sum(s["비중"] for s in SOURCING) != 100:
        print("조달 구성 합이 100이 아니다:", sum(s["비중"] for s in SOURCING), file=sys.stderr)
        return 1
    # 96% 는 「어느 범주에도 들지 않음」 4% 의 여집합이다
    off = next(s["비중"] for s in SOURCING if s["구분"].startswith("어느"))
    if 100 - off != 96:
        print("96% 와 잔여 4% 가 어긋난다", file=sys.stderr)
        return 1
    if len(FLEET) != STATS["선단_등록부"]:
        print("등록부 선체 수 불일치:", len(FLEET), file=sys.stderr)
        return 1
    if STATS["albacora_발행주식"] * STATS["albacora_액면"] != STATS["albacora_자본금"]:
        print("Albacora 자본금 = 발행주식 × 액면 이 아니다", file=sys.stderr)
        return 1
    h22 = next(r for r in HEADCOUNT if r["연도"] == 2022)["상시"]
    h24 = next(r for r in HEADCOUNT if r["연도"] == 2024)["상시"]
    if h22 != STATS["상시인력_2022"] or h24 != STATS["상시인력_2024"] or h24 >= h22:
        print("인력 시계열 불일치", file=sys.stderr)
        return 1

    payload = {
        "_meta": META,
        "card": CARD,
        "financials": FINANCIALS,
        "galicia": GALICIA,
        "entities": ENTITIES,
        "fleet": FLEET,
        "sourcing": SOURCING,
        "headcount": HEADCOUNT,
        "albacora": ALBACORA,
        "stats": STATS,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(f"{OUT.relative_to(ROOT)}: {len(must)}개 문자열 대조 통과 · {OUT.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
