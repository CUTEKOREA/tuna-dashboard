#!/usr/bin/env python3
"""ITOCHU 조사보고서 HTML → `public/data/companies/itochu_v1.json`.

원자료는 사내 조사보고서다 (`docs/evidence/company-itochu-2026-08/보고서.html`).
9개 절에서 화면이 쓸 표만 골라 옮긴다.

**수치는 손으로 옮기되 대조는 기계가 한다.**

⚠ 이 회사는 **수산·참치 실적을 숫자로 공시하지 않는다.** 유가증권보고서·결산단신·경영계획
   전문 검색 결과 0건이다. 규모의 상한선은 生鮮食品 부문 순이익 166억엔뿐이고,
   그 안에 축산(프리마햄·HyLife)과 농산(Dole)이 전부 들어 있다 — 수산 단독은 그보다 훨씬 작다.
⚠ **한국 관점이 이 회사의 반전이다.** MSC 인증 선단(2025-02 기준 26척, 선명 확인분 25척) 중 11척이 사조그룹이다.
   ITOCHU가 인증 보유자로서 신청·유지 비용을 지는 구조적 조달관계다.
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/evidence/company-itochu-2026-08/보고서.html"
OUT = ROOT / "public/data/companies/itochu_v1.json"


def corpus() -> str:
    s = SRC.read_text(encoding="utf8", errors="replace")
    s = re.sub(r"data:[^\"')]+", "IMG", s)
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)))


PROFILE = [
    ["정식 상호", "伊藤忠商事株式会社 · ITOCHU Corporation"],
    ["창업 · 설립", "1858년 초대 伊藤忠兵衛의 마포 행상 → 1949-12-01 법인"],
    ["본점 · 본사", "등기 본점 오사카 우메다 · 도쿄 본사 기타아오야마"],
    ["상장", "도쿄증권거래소 프라임 · 8001"],
    ["자본금 · 거점", "2,534억엔 · 국내 7 · 해외 85 (60개국)"],
    ["대표", "会長CEO 岡藤正広 · 社長COO 石井敬太 · 이사 9명(사외 4)"],
    ["최대주주", "Berkshire Hathaway 10.07% — 2026-03 공시"],
    ["참치 조직", "食料カンパニー › 生鮮食品部門 › 農産・水産部 — 단독 水産部는 없다"],
]

COMPARE = [
    {"항목": "정체", "frinsa": "사는 회사", "albacora": "잡는 회사", "fcf": "대는 회사", "itochu": "대는 회사 (종합상사)"},
    {"항목": "자사 어선", "frinsa": "0척", "albacora": "선망 23척", "fcf": "0척", "itochu": "0척 · 인증 선단 26척"},
    {"항목": "가공 자산", "frinsa": "Ribeira 등 3곳", "albacora": "Salica 3공장", "fcf": "PNG·가나", "itochu": "ATI 1곳 (47%)"},
    {"항목": "브랜드", "frinsa": "PL 위탁", "albacora": "Campos", "fcf": "Bumble Bee", "itochu": "그룹 밖 (하고로모)"},
    {"항목": "신라교역에게", "frinsa": "고객 후보", "albacora": "직접 경쟁자", "fcf": "최대 고객", "itochu": "사조가 이미 들어간 조달망"},
]

# 04절 — 이 대시보드에서 가장 중요한 표
FLEET = [
    {"기국": "Chinese Taipei", "척수": 12, "비중": 48, "선주": "JIH YU(4) · CHERN LUNG(2) · FAIR WELL · FAIR BRAVO · FAIR DISCOVERY · WIN RICH · WIN FOREVER · VIVA FAFA"},
    {"기국": "KOREA", "척수": 6, "비중": 24, "선주": "SAJO INDUSTRIES(4) · OYANG CORPORATION · SAJO SEAFOOD"},
    {"기국": "Kiribati", "척수": 3, "비중": 12, "선주": "KIRIBATI & SAJO FISHERIES"},
    {"기국": "Tuvalu", "척수": 2, "비중": 8, "선주": "Q.T.I. · TUSA FISHING"},
    {"기국": "Vanuatu", "척수": 2, "비중": 8, "선주": "SAJO VANUATU"},
]

SI_VESSELS = [
    {"선명": "SAJO ALEXANDRIA", "선사": "SAJO INDUSTRIES", "imo": "9683635", "gt": 1016},
    {"선명": "SAJO COLUMBIA", "선사": "SAJO INDUSTRIES", "imo": "9618379", "gt": 1014},
    {"선명": "SAJO CONCORDIA", "선사": "SAJO INDUSTRIES", "imo": "9699593", "gt": 1105},
    {"선명": "SAJO FAMILIA", "선사": "SAJO INDUSTRIES", "imo": "9619323", "gt": 1014},
    {"선명": "SAJO POSEDONIA", "선사": "OYANG CORPORATION", "imo": "9683623", "gt": 1016},
    {"선명": "SAJO POTENTIA", "선사": "SAJO SEAFOOD", "imo": "9587063", "gt": 1061},
]

SEGMENTS = [
    {"세그먼트": "機械", "fy2024": 1365, "fy2025": 1556},
    {"세그먼트": "金属", "fy2024": 1784, "fy2025": 1435},
    {"세그먼트": "情報・金融", "fy2024": 832, "fy2025": 930},
    {"세그먼트": "食料", "fy2024": 851, "fy2025": 921},
    {"세그먼트": "エネルギー・化学品", "fy2024": 786, "fy2025": 693},
    {"세그먼트": "住生活", "fy2024": 697, "fy2025": 608},
    {"세그먼트": "第8", "fy2024": 651, "fy2025": 450},
    {"세그먼트": "繊維", "fy2024": 738, "fy2025": 433},
]

FOOD_DIV = [
    {"부문": "食糧", "fy2024": 333, "fy2025": 418},
    {"부문": "生鮮食品", "fy2024": 180, "fy2025": 166},
    {"부문": "食品流通", "fy2024": 338, "fy2025": 336},
]

ATI = [
    {"항목": "설립", "값": "1991년 10월 · 상업생산 1992년 11월"},
    {"항목": "지분", "값": "ITOCHU 47.0% + はごろもフーズ 33.0% + 외국계 1사 20.0%"},
    {"항목": "자본금", "값": "US$25백만"},
    {"항목": "소재 · 브랜드", "값": "동자바 Pasuruan 2공장 · SunBell"},
    {"항목": "처리능력", "값": "250 t/일 (2016년 현장 확인) — 105,000 t/년은 공칭능력을 넘는다"},
    {"항목": "하고로모 매입", "값": "연 62.08억엔 — 전량 ITOCHU를 거친다"},
]

KOREA = [
    {"항목": "인증 선단 중 사조", "값": "11척 (44%)", "기준": "SI 6 + 키리바시&사조 3 + 사조바누아투 2"},
    {"항목": "일본 냉동참치 공급국", "값": "5위", "기준": "2025 · $58.27M · 9,901 t"},
    {"항목": "한국산 단가", "값": "$5.89/kg", "기준": "세계 평균 $4.17의 1.41배 — 사시미용"},
    {"항목": "가다랑어 비중", "값": "0.6%", "기준": "한국 대일 수출 금액 기준 — ITOCHU가 사는 어종을 안 판다"},
    {"항목": "관세", "값": "WTO 3.5%", "기준": "Korea(RCEP) 열은 0303.41~46 전 행 공란"},
    {"항목": "한국이토추", "값": "수수료 87%", "기준": "총매출 171.9억원 중 149.7억 — 대리 법인"},
]

STATS = {
    "연결순이익_억엔": 9002,
    "식료_억엔": 921,
    "생선식품_억엔": 166,
    "인증선단": 25,
    "인증선단_현행": 26,
    "사조선단": 11,
    "대만선단": 12,
    "ati지분": 47.0,
    "수산공시건수": 0,
    "버크셔": 10.07,
    "세그먼트합_억엔": 7026,
}

META = {
    "회사": "ITOCHU Corporation (伊藤忠商事)",
    "국가": "일본 (오사카 · 도쿄)",
    "업종": "종합상사 — 참치는 食料カンパニー 農産・水産部 소관",
    "출처": "ITOCHU 조사 아카이브 (agri_data …/일본/ITOCHU, 2026-08) — 유가증권보고서 제102기 + MSC 인증 선박목록",
    "출처한계": "수산·참치 실적을 숫자로 공시하지 않는다. 규모 상한선은 生鮮食品 부문 166억엔뿐이다.",
    "측정경계": "선명·기국이 확인된 25척은 2022~2023년 인증 문서 기준이다. 현행 체제는 ESG레포트 2025 기준 26척(2025-02 +1척)이고, 추가 1척의 기국·선주는 미확인이라 표에 넣지 않았다.",
    "갱신방법": "python3 scripts/build_company_itochu.py",
}


def main() -> int:
    text = corpus()
    must = [
        "伊藤忠商事", "8001", "1858", "1949-12-01", "岡藤正広", "石井敬太",
        "10.07%", "農産・水産部", "9,002", "921", "166",
        "SAJO ALEXANDRIA", "SAJO COLUMBIA", "SAJO CONCORDIA", "SAJO FAMILIA",
        "SAJO POSEDONIA", "SAJO POTENTIA", "OYANG CORPORATION", "SAJO SEAFOOD",
        "KIRIBATI & SAJO FISHERIES", "SAJO VANUATU", "9683635", "9618379", "9699593",
        "9619323", "9683623", "9587063",
        "47.0%", "33.0%", "US$25백만", "62.08억엔", "250 t/일",
        "58,271,997", "5.89", "0.6%", "3.5%", "87.1%",
        "1,365", "1,556", "1,784", "1,435", "851", "418", "180", "336",
    ]
    missing = [m for m in must if m not in text]
    if missing:
        print("원문에 없는 수치:", missing, file=sys.stderr)
        return 1

    # 산술 재검증
    if sum(r["척수"] for r in FLEET) != STATS["인증선단"]:
        print("선단 합계 불일치:", sum(r["척수"] for r in FLEET), file=sys.stderr)
        return 1
    sajo = sum(r["척수"] for r in FLEET if "SAJO" in r["선주"])
    if sajo != STATS["사조선단"]:
        print("사조 선단 합계 불일치:", sajo, file=sys.stderr)
        return 1
    if len(SI_VESSELS) != 6:
        print("SI 선박 수 불일치", file=sys.stderr)
        return 1
    # 회사 공시 자체가 부문 합(920)과 세그먼트 합계(921)를 1억엔 차이로 싣는다 — 반올림이다.
    # 옮겨 적기 오류와 구분하려고 허용 오차를 1로 두고 그 이상은 잡는다.
    div_sum = sum(r["fy2025"] for r in FOOD_DIV)
    if abs(div_sum - STATS["식료_억엔"]) > 1:
        print("食料 부문 합이 세그먼트 값과 다르다:", div_sum, file=sys.stderr)
        return 1
    if sum(r["fy2025"] for r in SEGMENTS) != STATS["세그먼트합_억엔"]:
        print("세그먼트 합계 불일치:", sum(r["fy2025"] for r in SEGMENTS), file=sys.stderr)
        return 1

    payload = {
        "_meta": META,
        "profile": PROFILE,
        "compare": COMPARE,
        "fleet": FLEET,
        "siVessels": SI_VESSELS,
        "segments": SEGMENTS,
        "foodDivisions": FOOD_DIV,
        "ati": ATI,
        "korea": KOREA,
        "stats": STATS,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(f"{OUT.relative_to(ROOT)}: {len(must)}개 문자열 대조 통과 · {OUT.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
