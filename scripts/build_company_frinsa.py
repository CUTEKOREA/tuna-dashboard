#!/usr/bin/env python3
"""Frinsa 조사 아카이브 → `public/data/companies/frinsa_v1.json`.

원자료는 Frinsa 조사 아카이브의 통합프로필이다 (2026-08-19~20, deep-research 워크플로 +
메인 교차검증). 초판이 쓰던 사내 조사보고서 HTML(출처 언급 5회)을 대체한다 — 아카이브는
칸별 출처·등급(A/B/C)이 달려 있고 인증서·EINF·등기 원본이 `02_출처원본/`에 보존돼 있다.

**수치는 손으로 옮기되 대조는 기계가 한다.** 값은 여기 적되, 내보내기 전에 모든 수치
문자열이 통합프로필 원문에 그대로 있는지 확인한다 — 옮겨 적다 자릿수를 틀리는 것이
이 작업의 실패 모드다. 법인별 BAI 는 합계까지 산술 대조한다.

출처 등급 규율(아카이브 §12): A = 공식·등기·관보·인증서 원본 / B = 주요매체·신용정보DB.
「확인 못 한 것은 확인 못 했다」— 추정으로 메우지 않는다.
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = Path.home() / (
    "Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/agri_data/"
    "01_수산물(Seafood)/tuna/00_참치_관련자료/02_참치_가공·유통·기업/스페인/Frinsa"
)
PROFILE_SRC = ARCHIVE / "03_통합/10_Frinsa_통합프로필.md"
OUT = ROOT / "public/data/companies/frinsa_v1.json"


def corpus() -> str:
    candidates = [PROFILE_SRC]
    candidates += [Path(unicodedata.normalize(form, str(PROFILE_SRC))) for form in ("NFC", "NFD")]
    for path in candidates:
        if path.is_file():
            return re.sub(r"\s+", " ", path.read_text(encoding="utf8", errors="replace"))
    raise SystemExit(f"아카이브 통합프로필을 찾을 수 없다: {PROFILE_SRC}")


PROFILE = [
    ["정식 상호", "Frinsa del Noroeste, S.A. (CIF A15010564)"],
    ["설립", "1961년 9월 27일, Ribeira — 산업용 냉동창고로 출발"],
    ["소유", "가문 100% 비상장 — 창업자 Ramiro Carregal 64.10% · 아들 Jorge Carregal Varela 35.90%"],
    ["거버넌스", "이사회 없음 — 단독이사(administrador único) 1인 체제 (2019~2024 전 기간)"],
    ["종업원", "그룹 약 1,300명 (2024)"],
    ["감사인", "PricewaterhouseCoopers (2018년~, 연결재무제표)"],
    ["선단", "0척 — 보유하지 않는다 (OPAGAC 미등재, 선박 직접구매 1.2%)"],
    ["자체 제조 범위", "용기(캔) 자체 제조 — ISO 14001 범위 «FABRICACIÓN DE ENVASES» · 자체 물류 운영"],
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
    {"연도": 2023, "매출": 712.8, "순이익": 30.1, "비고": "첫 700 M€ 돌파 · 갈리시아어 원문 2건으로 실재 확정"},
    {"연도": 2024, "매출": 741, "순이익": 39.1, "비고": "EBIT 55.3 M€ · EBITDA 77 M€+ · 순이익 3사 1위"},
]

# FY2024 지역별 매출 분해 (M€) — 합 740.4 가 보도치 741 과 정합해
# 「741 = 그룹 연결」임을 산술로 입증하는 표다.
REGIONAL_2024 = [
    {"시장": "이베리아 (스페인+포르투갈)", "매출": 314.0, "비고": "2023년 321 에서 감소"},
    {"시장": "유럽 나머지", "매출": 320.4, "비고": "이베리아를 추월"},
    {"시장": "그 외 국가", "매출": 106.0, "비고": "중동·아시아·미주 — 싱가포르·두바이 거점"},
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

# 2025년 참치 구매 출처 (Marine Sustainability Policy 2026, 2025-01-01~12-31).
# 「어디에도 해당 없음」이 어업 21% · 공급사 70.8% 다 — 이 두 칸이 요지라 빼지 않는다.
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
    {"품목": "캔가공용 냉동 통마리 참치", "코드": "0303 42 20 00", "mfn": "0%", "조건": "end-use 면세 · 원산지 불문 (2026 TARIC 원문 확정)"},
    {"품목": "그 외 용도 통마리 참치", "코드": "0303 42 90 00", "mfn": "22%", "조건": "1990년~ ERGA OMNES"},
    {"품목": "냉동 필렛", "코드": "0304.2", "mfn": "18%", "조건": "한국 수출의 금액 절반 — 한-EU FTA 특혜 적용 여부가 손익을 가름"},
    {"품목": "로인 · 통조림", "코드": "1604", "mfn": "24%", "조건": "ATQ 09.2790 로인 35,000 t 0% (2024~26) — 냉동 통참치는 미포함"},
]

# 법인·국가별 세전이익(BAI) FY2024 — 회사 EINF «Beneficios obtenidos país por país».
# 2024년판부터 법인명이 삭제되고 국가 집계다. 합계 54,572,385 는 열 합과 정확히 맞는다.
BAI_2024 = [
    {"국가": "스페인 (본체+열병합+Lago Paganini)", "세전이익": 40_603_727},
    {"국가": "포르투갈 (A Poveira)", "세전이익": 5_774_755},
    {"국가": "싱가포르 (참치 구매본부)", "세전이익": 5_012_317},
    {"국가": "이탈리아", "세전이익": 1_668_674},
    {"국가": "영국", "세전이익": 991_440},
    {"국가": "독일", "세전이익": 397_868},
    {"국가": "프랑스", "세전이익": 91_837},
    {"국가": "UAE", "세전이익": 17_853},
    {"국가": "루마니아", "세전이익": 9_729},
    {"국가": "폴란드", "세전이익": 4_185},
]
BAI_2024_TOTAL = 54_572_385

BRANDS = [
    {"브랜드": "Frinsa “La Conservera”", "시장": "스페인", "포지션": "프리미엄 — 갈리시아 조개·칸타브리아 bonito", "채널": "자사몰 · 직영매장(12→6곳 축소)"},
    {"브랜드": "Ribeira", "시장": "스페인", "포지션": "대중·업소용(HORECA) — 자사몰 0건, 750g~3kg 업소 규격", "채널": "Alcampo · DIA · 업소"},
    {"브랜드": "Seaside", "시장": "수출", "포지션": "Pole & Line 어법 소구 (IPNLF)", "채널": "독일 유통 확인"},
    {"브랜드": "The Nice Fisherman", "시장": "수출", "포지션": "MSC 인증 참치 전용 — 소매 미확인, 유통사 제안용", "채널": "Frinsa UK · Kibu"},
    {"브랜드": "SOLO", "시장": "스페인", "포지션": "기능성 영양 (2026-02) — Proteína Natural 라인의 전환", "채널": "Carrefour + 자사 D2C"},
    {"브랜드": "Private Label", "시장": "유럽", "포지션": "5대 사업축 — El Corte Inglés·Carrefour·Alcampo·Lidl·DIA PB", "채널": "대형 유통"},
    {"브랜드": "Minerva 외 (A Poveira)", "시장": "포르투갈", "포지션": "정어리·고등어 9브랜드 — Minerva 프리미엄 · Galeão 미국 전담", "채널": "Continente · D2C"},
]

CERTS = [
    {"인증": "BRC Food Safety", "번호": "C0082801-BRC7", "상태": "B+ (Unannounced)", "유효": "~2027-02-21"},
    {"인증": "IFS Food v8", "번호": "C0082801/2025", "상태": "Foundation 92.68%", "유효": "~2027-03-07"},
    {"인증": "IFS Broker v3.2", "번호": "C0082801/2025", "상태": "Higher 100% — ⚠ 만료", "유효": "2026-06-01 만료 · 갱신본 미확보"},
    {"인증": "ISO 14001:2015", "번호": "ES147804-1", "상태": "Frinsa+열병합 통합 · 범위에 용기 제조", "유효": "~2027-08-29"},
    {"인증": "MSC CoC", "번호": "MSC-C-51214", "상태": "2009년~ 17년째 유지", "유효": "~2027-10-07"},
    {"인증": "Friend of the Sea", "번호": "—", "상태": "가다랑어·황다랑어·눈다·날개 + 고등어·정어리", "유효": "~2028-11-12"},
    {"인증": "EII Dolphin Safe", "번호": "—", "상태": "Processor + Trader 두 유형 등재", "유효": "2026-08-18판 명부"},
    {"인증": "ISSF 참여기업", "번호": "—", "상태": "24개사 중 하나 — 티어 「스페인 지역 메이저」", "유효": "개별 준수등급 미공개"},
]

# 열병합발전소 발전량 (MWh) — 2023년부터 사실상 정지. −99.8%.
COGEN = [
    {"연도": 2022, "발전MWh": 66_447},
    {"연도": 2023, "발전MWh": 254},
    {"연도": 2024, "발전MWh": 117},
]

META = {
    "회사": "Frinsa del Noroeste, S.A.",
    "국가": "스페인 (갈리시아 Ribeira)",
    "업종": "캔참치 가공 (+가금류 통조림·시리얼 샐러드·냉동 로인 트레이딩)",
    "출처": "Frinsa 조사 아카이브 (agri_data …/스페인/Frinsa, 2026-08-19~20) — 통합프로필 + 출처원본 50여 건",
    "출처한계": (
        "칸별 출처·등급(A/B)이 아카이브에 있다. A = 인증서·EINF·등기 원본, B = 주요매체 교차확인. "
        "2025 회계연도 매출·PL 매출 비중·ISSF 개별 준수등급·지분참여사 지분율은 미확인으로 남았고 "
        "추정으로 메우지 않았다."
    ),
    "측정경계": (
        "매출·순이익은 회계연도 그룹 연결 유로. 참치 구매 톤수는 회사 EINF SAP 구매등록(2024). "
        "한국→스페인 수출은 UN Comtrade 스페인 신고 기준(2025년은 미완연도)이라 회사 구매량과 "
        "직접 견줄 수 없다. 「연 18만 톤 처리·15만 톤 판매」는 회사 자기신고이며 산정 근거 미공개."
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
        return [f"{n:g}", f"{n:,.2f}", f"{n:.1f}", f"{n:.2f}", f"{n:g}".replace(".", ",")]
    return [str(n), f"{n:,}"]


def main() -> int:
    text = corpus()

    payload = {
        "_meta": META,
        "profile": PROFILE,
        "priceLadder": PRICE_LADDER,
        "financials": FINANCIALS,
        "regional2024": REGIONAL_2024,
        "galiciaThree": GALICIA_THREE,
        "sourcing": SOURCING,
        "sustainability": SUSTAINABILITY,
        "koreaExport": KOREA_EXPORT,
        "tariff": TARIFF,
        "bai2024": BAI_2024,
        "bai2024Total": BAI_2024_TOTAL,
        "brands": BRANDS,
        "certs": CERTS,
        "cogen": COGEN,
    }

    missing = []
    for n in numbers(payload):
        if isinstance(n, int) and (n < 10 or 1900 < n < 2100):
            continue  # 연도·한 자리 수는 대조가 무의미하다
        if not any(v in text for v in variants(n)):
            missing.append(n)
    if missing:
        print(f"⚠ 아카이브 원문에 없는 수치 {len(missing)}건: {missing[:12]}", file=sys.stderr)
        return 1

    # 산술 게이트 — 옮겨 적기가 온전해야 통과한다
    if sum(r["세전이익"] for r in BAI_2024) != BAI_2024_TOTAL:
        print("⚠ BAI 국가별 합이 EINF 합계와 다르다", file=sys.stderr)
        return 1
    for axis in ("어업 출처", "공급사 출처"):
        tot = sum(r["비중"] for r in SUSTAINABILITY if r["축"] == axis)
        if abs(tot - 100) > 0.05:
            print(f"⚠ {axis} 합계 {tot}% — 100 이 아니다", file=sys.stderr)
            return 1
    esp = next(r["톤"] for r in SOURCING if "스페인" in r["구분"])
    prt = next(r["톤"] for r in SOURCING if "포르투갈" in r["구분"])
    grp = next(r["톤"] for r in SOURCING if r["구분"] == "그룹 참치 원어 합계")
    if esp + prt != grp:
        print(f"⚠ 참치 구매 합 {esp + prt:,} ≠ 선언 {grp:,}", file=sys.stderr)
        return 1
    regional_total = sum(r["매출"] for r in REGIONAL_2024)
    if abs(regional_total - 740.4) > 0.05:
        print(f"⚠ 지역분해 합 {regional_total} ≠ 740.4", file=sys.stderr)
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf8")
    print(
        f"-> {OUT} ({OUT.stat().st_size // 1024}KB) · 수치 {len(numbers(payload))}개 아카이브 대조 통과",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
