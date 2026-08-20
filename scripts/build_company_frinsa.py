#!/usr/bin/env python3
"""Frinsa 조사보고서 HTML → `public/data/companies/frinsa_v1.json`.

원자료는 사내 조사보고서다 (`docs/evidence/company-frinsa-2026-08/보고서.html`).
표 29개·본문 2.8만자에서 화면이 쓸 표만 골라 옮긴다.

**수치는 손으로 옮기되 대조는 기계가 한다.** 보고서가 서술형이라 표 파서를 붙이면
문장 속 수치를 놓친다. 값은 여기 적되, 내보내기 전에 모든 수치 문자열이 원문에
그대로 있는지 확인한다 — 옮겨 적다 자릿수를 틀리는 것이 이 작업의 실패 모드다.

⚠ 출처 표기 — 원본 보고서는 「확인불가」·「추정」 표기가 0회이고 출처 언급도 5회뿐이다.
   대시보드는 칸마다 출처·등급을 다는 규율로 운영하므로, 원본에 근거가 없는 표는
   `출처: '보고서 미표기'` 로 남긴다. **추정으로 메우지 않는다.**
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/evidence/company-frinsa-2026-08/보고서.html"
OUT = ROOT / "public/data/companies/frinsa_v1.json"


def corpus() -> str:
    s = SRC.read_text(encoding="utf8", errors="replace")
    s = re.sub(r"data:image/[^\"')]+", "IMG", s)          # base64 이미지 제거
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)))


PROFILE = [
    ["정식 상호", "Frinsa del Noroeste, S.A."],
    ["설립", "1961년 9월 27일, Ribeira (산업용 냉동창고로 출발)"],
    ["소유", "가문 100% — 비상장"],
    ["선단", "0척 — 보유하지 않는다"],
]

PRICE_LADDER = [
    {"층": "5 · 한정판", "제품": "Ventresca de atún rojo", "규격": "120 g", "소비자가": 26.50, "eurPerKg": 220.83, "채널": "자사몰"},
    {"층": "4 · 뱃살", "제품": "Ventresca de Bonito del Norte", "규격": "120 g", "소비자가": 11.95, "eurPerKg": 99.58, "채널": "자사몰 · 전문점"},
    {"층": "3 · 백참치", "제품": "Bonito del Norte 몸살", "규격": "111 / 200 g", "소비자가": 12.50, "eurPerKg": 39.47, "채널": "자사몰 · 전문점"},
    {"층": "2 · 황다랑어", "제품": "Atún claro en aceite de oliva", "규격": "200 g", "소비자가": 4.25, "eurPerKg": 21.25, "채널": "자사몰"},
    {"층": "1 · 대중", "제품": "Ribeira Atún claro", "규격": "3×52 g", "소비자가": 2.96, "eurPerKg": 18.97, "채널": "대형마트"},
]

FINANCIALS = [
    {"연도": 2019, "매출": 524, "순이익": 31.1, "비고": ""},
    {"연도": 2020, "매출": 588, "순이익": 33.0, "비고": "사상 처음 Calvo 추월"},
    {"연도": 2021, "매출": 546, "순이익": 34.1, "비고": "코로나 기저 반락 · 배당 22 M€"},
    {"연도": 2022, "매출": 609.6, "순이익": 23.7, "비고": "인플레로 마진 압박"},
    {"연도": 2023, "매출": 712.8, "순이익": 30.1, "비고": "첫 700 M€ 돌파"},
    {"연도": 2024, "매출": 741, "순이익": 39.1, "비고": "EBIT 55.3 M€ · EBITDA 77 M€+"},
]

GALICIA_THREE = [
    {"기업": "Jealsa (Rianxeira·Escurís)", "y2020": 712.8, "y2023": 778.5, "y2024": 781, "y2025": 825},
    {"기업": "Frinsa", "y2020": 588, "y2023": 712.8, "y2024": 741, "y2025": None},
    {"기업": "Nauterra (구 Grupo Calvo)", "y2020": 578, "y2023": 697, "y2024": 727, "y2025": 765},
]

SOURCING = [
    {"구분": "참치 — 스페인 법인", "톤": 105_559},
    {"구분": "참치 — 포르투갈 법인", "톤": 29_730},
    {"구분": "그룹 참치 원어 합계", "톤": 135_289},
    {"구분": "그룹 수산물 전체", "톤": 144_696},
]

# 2025년 참치 구매 출처. 「어디에도 해당 없음」이 어업 21% · 공급사 70.8% 다 —
# 이 두 칸이 이 표의 요지라 빼지 않는다.
SUSTAINABILITY = [
    {"축": "어업 출처", "구분": "MSC 인증 어업", "비중": 68.0},
    {"축": "어업 출처", "구분": "종합 FIP", "비중": 11.0},
    {"축": "어업 출처", "구분": "어디에도 해당 없음", "비중": 21.0},
    {"축": "공급사 출처", "구분": "ISSF 참여기업", "비중": 19.0},
    {"축": "공급사 출처", "구분": "ISSF Data Check", "비중": 9.0},
    {"축": "공급사 출처", "구분": "선박 직접구매", "비중": 1.2},
    {"축": "공급사 출처", "구분": "어디에도 해당 없음", "비중": 70.8},
]

KOREA_EXPORT = [
    {"연도": 2023, "kg": 1_976_909, "usd": 10_329_805},
    {"연도": 2024, "kg": 5_508_610, "usd": 20_229_994},
    {"연도": 2025, "kg": 1_953_993, "usd": 9_627_560},
]

TARIFF = [
    {"품목": "캔가공용 냉동 통마리 참치", "코드": "0303 42 20 00", "mfn": "0%", "조건": "end-use 면세 · 원산지 불문"},
    {"품목": "그 외 용도 통마리 참치", "코드": "0303 42 90 00", "mfn": "22%", "조건": "1990년~ ERGA OMNES"},
    {"품목": "냉동 필렛", "코드": "0304.2", "mfn": "18%", "조건": "한-EU FTA 특혜 적용 여부가 손익을 가름"},
    {"품목": "로인 · 통조림", "코드": "1604", "mfn": "24%", "조건": "ATQ 09.2790 로인 35,000 t 0% (2024~26)"},
]

SUBSIDIARY_PROFIT = [
    {"국가": "싱가포르", "법인": "Frinsa Singapore Pte. Ltd. — 참치 구매", "세전이익": 5_012_317},
    {"국가": "이탈리아", "법인": "Frinsa Italia S.R.L.", "세전이익": 1_668_674},
]

META = {
    "회사": "Frinsa del Noroeste, S.A.",
    "국가": "스페인 (갈리시아 Ribeira)",
    "업종": "캔참치 가공",
    "출처": "신라교역 사내 조사보고서 — Frinsa 해부 (2026-08)",
    "출처한계": (
        "원본 보고서는 「확인불가」·「추정」 표기가 없고 출처 언급도 5회뿐이다. "
        "칸별 근거가 필요한 수치는 원문 표를 다시 확인해야 하며, 이 인테이크는 "
        "원본에 없는 근거를 만들어 넣지 않는다."
    ),
    "측정경계": (
        "매출·순이익은 회계연도 기준 그룹 연결이고 통화는 유로다. 한국→스페인 수출은 "
        "관세청 통관 기준이라 회사 구매량과 직접 견줄 수 없다."
    ),
    "갱신방법": "python3 scripts/build_company_frinsa.py",
}


def numbers(obj) -> list:
    out = []
    if isinstance(obj, dict):
        for v in obj.values():
            out += numbers(v)
    elif isinstance(obj, list):
        for v in obj:
            out += numbers(v)
    elif isinstance(obj, (int, float)) and not isinstance(obj, bool):
        out.append(obj)
    return out


def variants(n) -> list[str]:
    if isinstance(n, float):
        return [f"{n:g}", f"{n:,.2f}", f"{n:.1f}", f"{n:.2f}"]
    return [str(n), f"{n:,}"]


def main() -> int:
    if not SRC.exists():
        print(f"원본 보고서 없음: {SRC}", file=sys.stderr)
        return 1
    text = corpus()

    payload = {
        "_meta": META,
        "profile": PROFILE,
        "priceLadder": PRICE_LADDER,
        "financials": FINANCIALS,
        "galiciaThree": GALICIA_THREE,
        "sourcing": SOURCING,
        "sustainability": SUSTAINABILITY,
        "koreaExport": KOREA_EXPORT,
        "tariff": TARIFF,
        "subsidiaryProfit": SUBSIDIARY_PROFIT,
    }

    missing = []
    for n in numbers(payload):
        if isinstance(n, int) and (n < 10 or 1900 < n < 2100):
            continue  # 연도·한 자리 수는 대조가 무의미하다
        if not any(v in text for v in variants(n)):
            missing.append(n)
    if missing:
        print(f"⚠ 보고서에 없는 수치 {len(missing)}건: {missing[:12]}", file=sys.stderr)
        return 1

    # 지속가능성 두 축은 각각 100% 가 되어야 한다. 되면 옮겨 적기가 온전한 것이다.
    for axis in ("어업 출처", "공급사 출처"):
        tot = sum(r["비중"] for r in SUSTAINABILITY if r["축"] == axis)
        if abs(tot - 100) > 0.05:
            print(f"⚠ {axis} 합계 {tot}% — 100 이 아니다", file=sys.stderr)
            return 1

    # 스페인 + 포르투갈 = 그룹 참치 합계
    esp = next(r["톤"] for r in SOURCING if "스페인" in r["구분"])
    prt = next(r["톤"] for r in SOURCING if "포르투갈" in r["구분"])
    grp = next(r["톤"] for r in SOURCING if r["구분"] == "그룹 참치 원어 합계")
    if esp + prt != grp:
        print(f"⚠ 참치 구매 합 {esp + prt:,} ≠ 선언 {grp:,}", file=sys.stderr)
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf8")
    print(
        f"-> {OUT} ({OUT.stat().st_size // 1024}KB) · 수치 {len(numbers(payload))}개 원문 대조 통과",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
