#!/usr/bin/env python3
"""FCF 조사보고서 HTML → `public/data/companies/fcf_v1.json`.

원자료는 사내 조사보고서다 (`docs/evidence/company-fcf-2026-08/보고서.html`).
9개 절에서 화면이 쓸 표만 골라 옮긴다.

**수치는 손으로 옮기되 대조는 기계가 한다.** 값은 여기 적고, 내보내기 전에 핵심 수치
문자열이 원문에 그대로 있는지 확인한다 — 옮겨 적다 자릿수를 틀리는 것이 실패 모드다.

⚠ 이 회사는 **2002년 발행정지된 비상장사**라 감사받은 재무제표가 없다. 매출 600억 NT$는
   회장 발언이고, 취급 물량 50만~65만 톤은 외부 추정이다 — 표마다 기준을 명기한다.
⚠ **한국 관점이 이 회사의 핵심이다.** 신라교역 매출의 32~46%를 사는 단일 최대 고객이고,
   그 거래는 선상·환적항 인도라 **무역통계에 잡히지 않는다.**
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/evidence/company-fcf-2026-08/보고서.html"
OUT = ROOT / "public/data/companies/fcf_v1.json"


def corpus() -> str:
    s = SRC.read_text(encoding="utf8", errors="replace")
    s = re.sub(r"data:[^\"')]+", "IMG", s)
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)))


PROFILE = [
    ["정식 상호", "豐群水產股份有限公司 · FCF Co., Ltd."],
    ["統一編號", "82007494 — 1972년 설립 · 등기 8월 16일"],
    ["본사", "高雄市前鎮區民權二路8號28樓"],
    ["지위", "비상장 · 발행정지(2002년 9월 23일) — 감사 재무제표가 공개되지 않는다"],
    ["자본", "NT$36.0억 납입 · 360,001,649주"],
    ["경영", "회장 李文宏(W.H. Lee) · 사장 겸 CEO 周昌毅(Max Chou, 창업 총경리 周俊雄의 차남)"],
    ["인력", "3,977명 (2024년 말) — 보고경계 5개사 합계이지 그룹 전체가 아니다"],
    ["자사 어선", "0척 — 잡지도 사지도 않고, 조업 패키지를 판다"],
]

# 3사가 아니라 5사 좌표계. 이 회사가 왜 「최대 고객」인지가 여기서 갈린다.
COMPARE = [
    {"항목": "정체", "frinsa": "사는 회사 (PL의 왕)", "albacora": "잡는 회사", "fcf": "대는 회사 (트레이더)"},
    {"항목": "자사 어선", "frinsa": "0척", "albacora": "선망 18척", "fcf": "0척 · 협력 600척+"},
    {"항목": "규모 축", "frinsa": "매출 741 M€", "albacora": "어획 20만 톤", "fcf": "취급 50만~65만 톤"},
    {"항목": "브랜드", "frinsa": "PL 위탁", "albacora": "Campos", "fcf": "Bumble Bee 100%"},
    {"항목": "신라교역에게", "frinsa": "고객 후보", "albacora": "직접 경쟁자", "fcf": "매출 46%를 사는 최대 고객"},
]

# 08절 — 이 대시보드에서 가장 중요한 표
SILLA_DEP = [
    {"연도": "FY2019", "비중": 42.5},
    {"연도": "FY2020", "비중": 44.9},
    {"연도": "FY2021", "비중": 35.2},
    {"연도": "FY2022", "비중": 32.1},
    {"연도": "FY2023", "비중": 41.9},
    {"연도": "FY2024", "비중": 46.3},
    {"연도": "FY2025", "비중": 39.8},
]

# 03절 — 어종·어법 구성
SPECIES = [
    {"어종": "가다랑어", "비중": 70.5, "비고": "2023년 61.6 → 2024년 70.5"},
    {"어종": "황다랑어", "비중": 19.3, "비고": "2023년 25.6 → 2024년 19.3"},
    {"어종": "날개다랑어", "비중": 8.9, "비고": "연승 어획"},
    {"어종": "눈다랑어", "비중": 1.3, "비고": "사시미 등급"},
]

GEAR = [
    {"어법": "선망", "비중": 90, "용도": "통조림용"},
    {"어법": "연승", "비중": 10, "용도": "사시미 · 날개다랑어"},
]

# 02절 — 이름과 실권이 갈린다
OWNERSHIP = [
    {"법인": "信勝投資", "지분": 14.54, "대표": "柯勝峯 (光陽 제1가문)"},
    {"법인": "豐群投資控股", "지분": 15.40, "대표": "張宏嘉 — 창업회장 張國安의 아들"},
    {"법인": "泓瀛投資", "지분": 10.77, "대표": "周昌毅 — 現 사장 겸 CEO"},
    {"법인": "海沃控股", "지분": 5.98, "대표": "黃一茂 — 華偉漁業집단 회장"},
    {"법인": "光洲投資", "지분": 5.32, "대표": "柯俊斌 (現 光陽 회장)"},
    {"법인": "昭冠投資", "지분": 4.97, "대표": "李文宏 — 現 회장"},
    {"법인": "弘光投資", "지분": 3.24, "대표": "柯王淑媛"},
]

GROUP = [
    {"국가": "대만", "법인": "FCF Co., Ltd.", "분류": "본사", "비고": "가오슝"},
    {"국가": "미국", "법인": "Bumble Bee Foods, LLC (· Anova Food, LLC)", "분류": "자회사 · Anova는 손자회사", "비고": "2020년 인수 · 중간지주 4개를 거친다"},
    {"국가": "캐나다", "법인": "Clover Leaf Seafood", "분류": "자회사", "비고": "Bumble Bee 그룹 하위"},
    {"국가": "파나마", "법인": "Thalassic Tuna Team", "분류": "자회사", "비고": "공식 거점 목록에 없던 법인"},
    {"국가": "일본", "법인": "F.C.N. International Co., Ltd.", "분류": "자회사 (FCF 100%)", "비고": "시미즈 · 보고경계 5개사"},
    {"국가": "싱가포르", "법인": "F.C.S. Trading & Fishery (Pte) Ltd", "분류": "자회사 (FCF 100%)", "비고": "보고경계 5개사"},
]

STATS = {
    "설립": 1972,
    "매출_억NT": 600,
    "인력": 3977,
    "협력선": 600,
    "자사선": 0,
    "취급하한_만톤": 50,
    "취급상한_만톤": 65,
    "실명매출_FY2024_억원": 2296,
    "silla_max": 46.3,
    "bumblebee_억달러": 9.28,
}

META = {
    "회사": "FCF Co., Ltd. (豐群水產)",
    "국가": "대만 (가오슝)",
    "업종": "참치 원료 트레이딩 + 조업 패키지 + 브랜드(Bumble Bee)",
    "출처": "FCF 조사 아카이브 (agri_data …/대만/FCF, 2026-08) — 보고서 9절 + 신라교역 사업보고서",
    "출처한계": "2002년 발행정지 비상장사라 감사 재무제표가 없다. 매출은 회장 발언, 물량은 외부 추정이다.",
    "측정경계": "그룹 보고경계는 5개사. 파푸아뉴기니·가나 법인은 자회사와 구분된 범주에 묶인다.",
    "갱신방법": "python3 scripts/build_company_fcf.py",
}


def main() -> int:
    text = corpus()
    must = [
        "82007494", "豐群水產股份有限公司", "高雄市前鎮區民權二路8號28樓",
        "3,977", "360,001,649", "NT$36.0억",
        "600척", "70.5", "19.3", "8.9", "1.3",
        "42.5", "44.9", "35.2", "32.1", "41.9", "46.3", "39.8",
        "2,296억원", "9.25", "9.28", "14.54", "15.40", "10.77", "5.98", "5.32", "4.97", "3.24",
        "李文宏", "周昌毅", "張國安", "Bumble Bee", "Clover Leaf", "Thalassic Tuna Team",
        "FCN International", "1972",
    ]
    missing = [m for m in must if m not in text]
    if missing:
        print("원문에 없는 수치:", missing, file=sys.stderr)
        return 1

    # 산술 재검증 — 옮겨 적다 틀리는 것을 잡는다
    if abs(sum(r["비중"] for r in SPECIES) - 100.0) > 0.1:
        print("어종 구성 합이 100이 아니다:", sum(r["비중"] for r in SPECIES), file=sys.stderr)
        return 1
    if sum(r["비중"] for r in GEAR) != 100:
        print("어법 구성 합이 100이 아니다", file=sys.stderr)
        return 1
    if max(r["비중"] for r in SILLA_DEP) != STATS["silla_max"]:
        print("신라교역 최대 의존도 불일치", file=sys.stderr)
        return 1

    payload = {
        "_meta": META,
        "profile": PROFILE,
        "compare": COMPARE,
        "sillaDependency": SILLA_DEP,
        "species": SPECIES,
        "gear": GEAR,
        "ownership": OWNERSHIP,
        "group": GROUP,
        "stats": STATS,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(f"{OUT.relative_to(ROOT)}: {len(must)}개 문자열 대조 통과 · {OUT.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
