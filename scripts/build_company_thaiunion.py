#!/usr/bin/env python3
"""Thai Union 조사보고서 HTML → `public/data/companies/thaiunion_v1.json`.

원자료는 사내 조사보고서다 (`docs/evidence/company-thaiunion-2026-08/보고서.html`).
9개 절·감사 재무제표 OCR·Comtrade 실측에서 화면이 쓸 표만 골라 옮긴다.

**수치는 손으로 옮기되 대조는 기계가 한다.** 값은 여기 적고, 내보내기 전에 핵심 수치
문자열이 원문에 그대로 있는지 확인한다 — 옮겨 적다 자릿수를 틀리는 것이 실패 모드다.

⚠ 이 회사 수치의 4층 함정 — 연결/개별, 당기순이익/지배주주 귀속. 개별 순이익(102.6억 밧)이
   연결(56.5억 밧)보다 크다(모회사 배당수익 125.1억 밧). 표마다 기준을 명기한다.
⚠ 원본이 «⚠️미확인» 으로 남긴 칸은 그대로 남긴다. **추정으로 메우지 않는다.**
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/evidence/company-thaiunion-2026-08/보고서.html"
OUT = ROOT / "public/data/companies/thaiunion_v1.json"


def corpus() -> str:
    s = SRC.read_text(encoding="utf8", errors="replace")
    s = re.sub(r"data:image/[^\"')]+", "IMG", s)          # base64 이미지 제거
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)))


PROFILE = [
    ["정식 상호", "Thai Union Group Public Company Limited (SET: TU)"],
    ["설립 · 상장", "1977년 창업 · 1994-11-22 SET 상장"],
    ["본사·주력공장", "태국 사뭇사콘 · 제2거점 송클라"],
    ["지배구조", "창업 3가문 합계 26.85% — Chansiri 17.65% · Niruttinanon 7.44% · Boonmechote 1.76%"],
    ["선단", "0척 — 프린사처럼 사들이는 회사다"],
]

# FY2025 카테고리. 매출 단위: 십억 밧. 브랜드비중 = 자사 브랜드 매출 비중(%).
SEGMENTS = [
    {"카테고리": "Ambient", "매출": 64.28, "비중": 48.4, "yoy": -6.0, "gpm": 19.8, "브랜드비중": 55.7},
    {"카테고리": "Frozen", "매출": 41.15, "비중": 31.0, "yoy": -2.5, "gpm": 13.2, "브랜드비중": 45.9},
    {"카테고리": "PetCare", "매출": 17.88, "비중": 13.5, "yoy": 2.8, "gpm": 25.6, "브랜드비중": 1.2},
    {"카테고리": "Value-Added", "매출": 9.42, "비중": 7.1, "yoy": -9.5, "gpm": 25.4, "브랜드비중": None},
]

# 연결 3개년. 매출·EBITDA 단위: 백만 밧. EPS: 밧.
FINANCIALS = [
    {"연도": 2023, "매출": None, "gpm": 17.10, "ebitda": None, "지배주주순이익": None, "eps": None,
     "비고": "매출·EBITDA 는 보고서 표에 미수록 — 추정으로 메우지 않는다"},
    {"연도": 2024, "매출": 138433, "gpm": 18.50, "ebitda": 13361, "지배주주순이익": 4985, "eps": 1.08, "비고": ""},
    {"연도": 2025, "매출": 132719, "gpm": 18.90, "ebitda": 12217, "지배주주순이익": 4609, "eps": 1.16,
     "비고": "GPM 사상 최고 · EPS 상승은 자사주 소각 효과"},
]

# 감사 재무제표(문서 p357) — 연결 vs 개별. 단위: 천 밧.
CON_VS_SEP = [
    {"항목": "매출", "연결": 132718579, "개별": 19131182},
    {"항목": "배당수익", "연결": 6152, "개별": 12509668},
    {"항목": "법인세차감전이익", "연결": 5628526, "개별": 10258473},
    {"항목": "당기순이익", "연결": 5645032, "개별": 10256365},
    {"항목": "지배주주 귀속", "연결": 4609416, "개별": 10256365},
]

# TC25 어장 상태 추이(%). 출처: SeaChange 2024 보고서 Table 1.
MSC_TREND = [
    {"연도": 2022, "msc": 31.0, "심사중": 14.0, "fip": 36.0, "무관계": 19.0},
    {"연도": 2023, "msc": 39.4, "심사중": 14.6, "fip": 31.4, "무관계": 14.5},
    {"연도": 2024, "msc": 71.4, "심사중": 14.1, "fip": 13.4, "무관계": 1.3},
]

# TC25 6대 약속 2024 실적(%). 목표는 전부 2025년 100%.
TC25 = [
    {"약속": "C1 어장 상태(MSC/심사/FIP)", "실적": 98.9},
    {"약속": "C2 공급자 감사(VCoC/VIP)", "실적": 87.6},
    {"약속": "C3 옵서버·EM 커버리지", "실적": 96.98},
    {"약속": "C4 ISSF 보존조치", "실적": 100.0},
    {"약속": "C5 RFMO 블랙리스트 배제", "실적": 100.0},
    {"약속": "C6 선박 단위 추적성", "실적": 100.0},
]

# 그룹 캐파(연간 톤). One Report p.46. PetCare 는 서술 221k vs 표 195k 모순 — 서술값 채택·비고 명기.
CAPACITY = [
    {"품목": "참치", "톤": 570000},
    {"품목": "PetCare 완제품", "톤": 221000},
    {"품목": "정어리", "톤": 150000},
    {"품목": "냉동새우", "톤": 60000},
    {"품목": "연어", "톤": 20000},
]

# 한국→태국 냉동참치 수출 (Comtrade, 한국 신고, HS 030342+030343+030344 합계).
KOREA_EXPORT = [
    {"연도": 2024, "톤": 107150.7, "usd": 127267171},
    {"연도": 2025, "톤": 86514.3, "usd": 117710911},
]

# 참치조제품(HS 1604.14) 대한 수입 상위 + 관세율. 2024 금액 US$.
KOREA_IMPORT = [
    {"원산지": "베트남", "usd": 23900139, "비중": 74.3, "관세": "0% (한·베 FTA)"},
    {"원산지": "태국", "usd": 4107161, "비중": 12.8, "관세": "20% (AKFTA·RCEP 양허 제외)"},
    {"원산지": "이탈리아", "usd": 2494961, "비중": 7.8, "관세": "0% (한·EU)"},
    {"원산지": "세이셸", "usd": 204584, "비중": 0.6, "관세": "20% — Mareblu 캔 (IOT 제조)"},
]

# 미국 관세 (2025-08-01 확정). 실효 부담.
US_TARIFF = [
    {"품목": "수침 캔참치 (Ambient)", "부담": "약 31.5%", "비고": "기존 관세 + 신규 19% 중첩"},
    {"품목": "냉동 제품", "부담": "19%", "비고": "Frozen 매출의 51.2% 가 미국"},
    {"품목": "펫케어", "부담": "19%", "비고": "PetCare 매출의 58.9% 가 북미"},
]

META = {
    "회사": "Thai Union Group PCL",
    "국가": "태국 (사뭇사콘)",
    "업종": "수산 가공 (상온·냉동·펫케어)",
    "출처": "신라교역 사내 조사보고서 — 타이유니온 해부 (2026-08). 1차: 56-1 One Report FY2025 478쪽 · SeaChange 2024 · Comtrade · DOJ(Wayback)",
    "출처한계": "Part 3 감사 재무제표는 스캔 이미지라 OCR 로 옮겼다. 종업원 수는 공시끼리 어긋난다(7.5절 12,529명 vs ISSF 프로필 47,000명+) — 어느 쪽도 단독 인용 금지.",
    "측정경계": "연결/개별·당기순이익/지배주주 귀속 4층을 표마다 명기한다. 개별 순이익이 연결보다 크다(모회사 배당수익). 한국→태국 수출은 관세청·Comtrade 통관 기준이라 회사 매입량과 직접 견줄 수 없다.",
    "갱신방법": "python3 scripts/build_company_thaiunion.py",
}


def main() -> int:
    text = corpus()
    # 옮겨 적은 핵심 수치가 원문에 실재하는지 — 자릿수 오타를 기계로 잡는다.
    must = [
        "132,718,579", "138,433,059", "12,509,668", "10,256,365", "4,609,416",
        "107,150.7", "127,267,171", "86,514.3",
        "71.4", "96.98", "87.6", "98.9",
        "570,000", "221,000",
        "23,900,139", "4,107,161",
        "31.5%", "17.65%", "26.85%",
        "1.08", "1.16", "18.9",
    ]
    missing = [m for m in must if m not in text]
    if missing:
        print("원문에 없는 수치:", missing, file=sys.stderr)
        return 1

    OUT.write_text(
        json.dumps(
            {
                "_meta": META,
                "profile": PROFILE,
                "segments": SEGMENTS,
                "financials": FINANCIALS,
                "conVsSep": CON_VS_SEP,
                "mscTrend": MSC_TREND,
                "tc25": TC25,
                "capacity": CAPACITY,
                "koreaExport": KOREA_EXPORT,
                "koreaImport": KOREA_IMPORT,
                "usTariff": US_TARIFF,
            },
            ensure_ascii=False,
            indent=1,
        )
        + "\n",
        encoding="utf8",
    )
    print("wrote", OUT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
