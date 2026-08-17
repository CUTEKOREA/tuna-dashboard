#!/usr/bin/env python3
"""Atuna 참조 페이지에서 **용어와 분류**를 뽑아 대시보드용 산출물을 만든다.

⚠ 수치는 여기서 가져오지 않는다.
  Atuna 의 어획 통계 페이지는 출처를 `FISHSTAT FAO 2026` 이라고 스스로 밝힌다.
  이 저장소가 이미 그 원본을 직접 집계하므로, 재인용하면 한 다리 건넌 값이 될 뿐이다.
  여기서 가져오는 것은 **다른 데 흩어져 있어 모으기 번거로운 것** 셋이다.

    1. 약어 대조표 — 기관·어법·규격 약자 112개
    2. 어종 프로필 — 학명·크기·성숙·주요 어장·가공국·제품 형태
    3. 어종별 자원상태 — 기구가 평가한 계군 상태. **FAO 어획통계에는 없는 항목이다**

⚠ 자원상태는 평가 시점이 낡을 수 있다. 원문에 적힌 `Last Updated` 를 그대로 들고 온다.
  화면에서도 그 연도를 함께 보여야 한다 — 2022년 평가를 오늘 상태로 읽으면 안 된다.

원본: 아카이브 `_레퍼런스_ATUNA/2026-08-17/pages/`

사용법:
    python3 scripts/build_tuna_glossary.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

SRC = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/tuna/00_참치_관련자료/_레퍼런스_ATUNA/2026-08-17/pages"
)
OUT_PATH = Path(__file__).resolve().parent.parent / "public/data/tuna_glossary_v1.json"

# 화면에 영문 상호·기관명이 그대로 나가면 안 된다(L-01). 자주 쓰는 것부터 한글을 붙인다.
KO_TERM = {
    "BET": "눈다랑어", "SKJ": "가다랑어", "YFT": "황다랑어", "ALB": "날개다랑어",
    "BFT": "참다랑어", "SBT": "남방참다랑어",
    "WCPO": "서·중부태평양", "EPO": "동부태평양", "IO": "인도양", "AO": "대서양",
    "IOTC": "인도양참치위원회", "IATTC": "미주열대참치위원회",
    "WCPFC": "중서부태평양수산위원회", "ICCAT": "대서양참치보존위원회",
    "CCSBT": "남방참다랑어보존위원회", "RFMO": "지역수산관리기구",
    "FAD": "집어장치", "PS": "선망", "LL": "연승", "PL": "채낚기",
    "MSC": "해양관리협의회", "IUU": "불법·비보고·비규제 어업", "VDS": "조업일수제도",
    "AIS": "선박자동식별장치", "VMS": "선박모니터링시스템", "TAC": "총허용어획량",
    "MT": "미터톤", "CFR": "운임·보험료 포함 인도", "FOB": "본선 인도",
    "AIDCP": "국제돌고래보존계획 협정", "CITES": "멸종위기종 국제거래협약",
    "CMM": "보존관리조치", "CDS": "어획증명제도", "CFP": "유럽연합 공동어업정책",
    "EEZ": "배타적경제수역", "FAO": "국제연합 식량농업기구", "MCS": "감시·통제·감독",
    "MSY": "최대지속생산량", "NGO": "비정부기구", "PNA": "나우루협정 당사국",
    "ROV": "선박기록부", "SPRFMO": "남태평양 공해 관리기구", "TCC": "기술이행위원회",
    "WTO": "세계무역기구", "HS": "국제통일상품분류", "GT": "총톤수", "LOA": "전장",
    "IMO": "국제해사기구", "ISSF": "국제수산지속가능성재단", "FIP": "어업개선사업",
    "ITLOS": "국제해양법재판소", "SIDS": "군소도서개발국", "VME": "취약해양생태계",
}

# 어종 한글명. 원문은 영문이라 대조표를 둔다.
SPECIES_KO = {
    "Skipjack Tuna": "가다랑어",
    "Yellowfin Tuna": "황다랑어",
    "Bigeye Tuna": "눈다랑어",
    "Albacore Tuna": "날개다랑어",
    "Bluefin Tuna": "참다랑어",
    "Atlantic Bluefin Tuna": "대서양참다랑어",
    "Pacific Bluefin Tuna": "태평양참다랑어",
    "Southern Bluefin Tuna": "남방참다랑어",
    "Northern Bluefin Tuna": "북방참다랑어",
    "Atlantic Bonito": "대서양가다랑어",
    "Tongol": "몰다랑어",
    "Longtail Tuna": "몰다랑어",
}

# 어종 프로필에서 옮길 항목과 한글 이름
FIELD_KO = {
    "English:": "영문명",
    "Latin:": "학명",
    "Common Size:": "일반 크기",
    "Maximum:": "최대",
    "Maturity:": "성숙",
    "Catching Area:": "주요 어장",
    "Catching Methods:": "주요 어법",
    "Share of all Tuna Caught:": "참치 어획 중 비중",
    "Main Processing Nations:": "주요 가공국",
    "Flags of Main Fleets:": "주요 선적국",
    "Life Cycle:": "생활사",
    "Major Markets:": "주요 시장",
    "Popular Product Forms:": "주요 제품 형태",
}

# 계군 상태 판정. 원문 표기를 그대로 옮긴다 — 등급을 임의로 합치거나 순서를 매기지 않는다.
STOCK_KO = {
    "Healthy": "양호",
    "Intermediate": "중간",
    "Subject To Overfishing": "남획 압력 있음",
    "Overfished": "남획됨",
    "Overfishing": "남획 중",
    "Not overfished": "남획 아님",
    "Unknown": "미상",
    "Depleted": "고갈",
}

OCEAN_KO = {
    "Indian Ocean": "인도양",
    "Eastern Pacific Ocean": "동부태평양",
    "Western and Central Pacific Ocean": "서·중부태평양",
    "Eastern Atlantic Ocean": "동대서양",
    "Western Atlantic Ocean": "서대서양",
    "Atlantic Ocean": "대서양",
    "Mediterranean": "지중해",
    "Southern Ocean": "남빙양",
    "Pacific Ocean": "태평양",
    "North Atlantic Ocean": "북대서양",
    "South Atlantic Ocean": "남대서양",
    "North Pacific Ocean": "북태평양",
    "South Pacific Ocean": "남태평양",
    "Eastern & Mediterranean": "동대서양·지중해",
}


def md_tables(path: Path) -> list[list[list[str]]]:
    """마크다운 표를 셀 배열로 되돌린다."""
    if not path.exists():
        raise SystemExit(f"원본을 찾을 수 없다: {path}\n아카이브 INDEX.md 를 보라.")
    tables: list[list[list[str]]] = []
    current: list[list[str]] = []
    for line in path.read_text(encoding="utf-8").split("\n"):
        if line.startswith("|"):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if all(set(c) <= set("- ") for c in cells):   # 구분선
                continue
            current.append(cells)
        elif current:
            tables.append(current)
            current = []
    if current:
        tables.append(current)
    return tables


def build_glossary() -> list[dict]:
    rows = []
    for table in md_tables(SRC / "tuna-abbreviations.md"):
        for cells in table:
            if len(cells) < 3 or cells[1] != "=":
                continue
            abbr, full = cells[0].strip(), cells[2].strip()
            if not abbr or not full:
                continue
            rows.append({"약어": abbr, "영문": full, "한글": KO_TERM.get(abbr, "")})
    seen, out = set(), []
    for r in rows:
        if r["약어"] in seen:
            continue
        seen.add(r["약어"])
        out.append(r)
    return sorted(out, key=lambda r: r["약어"])


def build_species() -> tuple[list[dict], list[dict]]:
    """어종 프로필과 자원상태. 원문이 표 두 개를 번갈아 낸다."""
    tables = md_tables(SRC / "tuna-species-guide.md")
    profiles, stocks = [], []
    current_species = ""
    for table in tables:
        head = [c.strip() for c in table[0]]
        # 자원상태 표
        if head[:2] == ["Ocean", "Regional Management Organization"]:
            for cells in table[1:]:
                if len(cells) < 4:
                    continue
                stocks.append({
                    "어종": current_species,
                    "해역": OCEAN_KO.get(cells[0].strip(), cells[0].strip()),
                    "기구": cells[1].strip(),
                    "상태": STOCK_KO.get(cells[2].strip(), cells[2].strip()),
                    "평가연도": cells[3].strip(),
                })
            continue
        # 프로필 표 — 첫 칸이 라벨이다
        labels = {c[0].strip(): (c[1].strip() if len(c) > 1 else "") for c in table}
        if "English:" not in labels:
            continue
        english = labels["English:"]
        # 「Skipjack Tuna (stripe-bellied Bonito)」 → 앞부분만
        base = re.sub(r"\s*\(.*", "", english).strip()
        current_species = SPECIES_KO.get(base, base)
        entry = {"어종": current_species, "원문명": english}
        for key, ko in FIELD_KO.items():
            if key in labels and labels[key]:
                entry[ko] = labels[key]
        profiles.append(entry)
    return profiles, stocks


# ── 인증 제도 ────────────────────────────────────────────────────────────
#
# 원문이 산문이라 표로 뽑히지 않는다. **제도 이름과 성격만** 옮긴다 —
# 이 자료의 값은 서술이 아니라 「어떤 제도가 있고 무엇을 보는가」라는 분류다.
# 조문 내용이 필요하면 각 인증기관 공식 문서를 봐야 한다.
CERTIFICATIONS = [
    {"구분": "전제조건", "이름": "위생표준운영절차", "약어": "SSOP",
     "무엇": "가공장 청소·소독 절차를 문서로 정한 것. 다른 모든 인증의 바닥이다"},
    {"구분": "전제조건", "이름": "우수제조기준", "약어": "GMP",
     "무엇": "위생적 환경에서 제조하기 위한 요건과 지침"},
    {"구분": "식품안전", "이름": "위해요소 중점관리기준", "약어": "HACCP",
     "무엇": "완제품 검사가 아니라 공정 중 위해를 예방하는 체계. 7원칙 기반"},
    {"구분": "식품안전", "이름": "국제표준화기구 식품안전경영", "약어": "ISO 22000",
     "무엇": "여러 나라 식품안전 표준을 아우르는 국제 규격. 취득하면 아래 둘도 충족한다"},
    {"구분": "유통사 요구", "이름": "영국소매협회 규격", "약어": "BRC",
     "무엇": "영국 유통사가 납품 조건으로 요구하는 규격"},
    {"구분": "유통사 요구", "이름": "국제식품규격", "약어": "IFS",
     "무엇": "독일·프랑스 유통사가 요구하는 규격"},
    {"구분": "사회책임", "이름": "사회적 책임 인증", "약어": "SA8000",
     "무엇": "아동노동·강제노동·안전·결사의 자유 등 8개 항목을 본다"},
]

# 사회적 책임 인증이 보는 8개 항목. 원문 표를 그대로 옮긴다.
SOCIAL_CRITERIA = [
    ("아동노동", "아동노동을 쓰지 않는다"),
    ("강제노동", "직업을 바꿀 권리가 있고 강제로 일하게 하지 않는다"),
    ("안전·보건", "일하다 위험에 놓이지 않는다"),
    ("결사의 자유", "단체교섭을 통해 조직하고 목소리를 낼 권리가 있다"),
    ("차별 금지", "차별받지 않는다"),
    ("징계 관행", "체벌·정신적 강압을 받지 않는다"),
    ("근로시간", "정해진 한도를 넘겨 일하지 않는다"),
    ("보수", "생활이 되는 임금을 받는다"),
]

# ── 식품안전 기준 ─────────────────────────────────────────────────────────
#
# ⚠ 이 수치들은 **규제 기준과 관측값이 섞여 있다.** 무엇인지 칸을 나눠 적는다.
#   기준을 조달·품질 판단에 쓰려면 해당 규제기관 원문을 확인해야 한다.
FOOD_SAFETY = [
    {"항목": "수은", "구분": "관측", "값": "평균 0.391 ppm",
     "설명": "참치 평균 함량. 나라 대부분의 허용 상한은 1.0 ppm 이다"},
    {"항목": "수은", "구분": "규제", "값": "상한 1.0 ppm",
     "설명": "대부분 국가의 참치 수은 허용 상한"},
    {"항목": "수은", "구분": "참고", "값": "독성 수준 2.3 ppm",
     "설명": "주 여러 번 먹는 사람도 평균의 7배까지 오를 뿐 이 수준에는 미치지 않는다"},
    {"항목": "수은", "구분": "완화 요인", "값": "셀레늄 대 수은 약 10배",
     "설명": "가다랑어·황다랑어는 수은보다 셀레늄이 10배 가까이 많다. 다른 어떤 바닷물고기보다 높은 비다"},
    {"항목": "히스타민", "구분": "관측", "값": "캔참치 1~30 ppm",
     "설명": "현재 통상 수준. 이 범위는 안전하다"},
    {"항목": "히스타민", "구분": "규제", "값": "유럽연합 평균 100 · 최대 200 mg/kg",
     "설명": "출고 후 유통기한 중 기준. 평균이 100 아래여야 하고 두 시료까지 100~200 을 허용한다"},
    {"항목": "히스타민", "구분": "업계 관행", "값": "원료 입고 30 ppm",
     "설명": "규제 기준은 개체 분석 50 ppm 이나, 가열·세척에서 오를 것을 감안해 업계가 30 으로 조인다"},
    {"항목": "히스타민", "구분": "발생 조건", "값": "어획 직후 4℃ 미만",
     "설명": "잡은 뒤 바로 냉각·동결하지 않으면 생성된다. 질병 사례는 대개 200 ppm 이상이었다"},
    {"항목": "비스페놀", "구분": "규제", "값": "일일섭취허용량 체중 kg당 50 µg",
     "설명": "캔 코팅에서 나오는 물질. 코팅 자체 기준은 면적당 7.7 mg/dm² 이다"},
]


def main() -> None:
    glossary = build_glossary()
    profiles, stocks = build_species()

    if len(glossary) < 80:
        raise SystemExit(f"약어가 너무 적다({len(glossary)}). 원문 표 구조가 바뀌었는지 확인하라.")
    if not profiles or not stocks:
        raise SystemExit("어종 프로필이나 자원상태를 뽑지 못했다. 원문 구조를 확인하라.")

    # 옮기지 못한 상태값이 화면에 영문으로 나가는 것을 막는다(L-01).
    def missing(values: set[str]) -> list[str]:
        return sorted(v for v in values if not any("가" <= c <= "힣" for c in v))

    bad_state = missing({s["상태"] for s in stocks})
    bad_area = missing({s["해역"] for s in stocks})
    if bad_state or bad_area:
        raise SystemExit(
            "화면에 영문이 그대로 나갈 값이 있다(L-01).\n"
            + (f"  상태: {', '.join(bad_state)} → STOCK_KO 에 추가\n" if bad_state else "")
            + (f"  해역: {', '.join(bad_area)} → OCEAN_KO 에 추가\n" if bad_area else "")
            + "임의로 다른 항목에 합치지는 마라."
        )

    years = sorted({s["평가연도"] for s in stocks if s["평가연도"]})

    payload = {
        "_meta": {
            "생성일": "2026-08-17",
            "출처": "Atuna 참조 페이지",
            "등급": "B",
            "수치제외": (
                "어획·교역 수치는 이 자료에서 가져오지 않는다. 쓸 수 없어서가 아니라 "
                "**원문이 출처를 FAO FishStat 2026 이라고 스스로 밝히고 이 저장소가 그 원본을 "
                "직접 집계하기 때문**이다. 재인용하면 한 다리 건넌 값이 될 뿐이다. "
                "여기서 가져오는 것은 다른 데 흩어져 있어 모으기 번거로운 용어·분류다."
            ),
            "자원상태주의": (
                f"자원상태는 기구가 평가한 것이고 평가 시점이 있다(수록 연도 {', '.join(years)}). "
                "오늘 상태가 아니라 **그 해에 그렇게 평가했다**는 뜻이다. 화면에 연도를 함께 낸다."
            ),
            "갱신방법": "python3 scripts/build_tuna_glossary.py",
        },
        "약어": glossary,
        "어종프로필": profiles,
        "자원상태": stocks,
        "인증": {
            "_meta": {
                "주의": (
                    "제도 이름과 성격만 옮겼다. 원문이 산문이라 조문을 표로 뽑을 수 없고, "
                    "조문 내용이 필요하면 각 인증기관 공식 문서를 봐야 한다."
                ),
            },
            "rows": CERTIFICATIONS,
            "사회책임항목": [{"항목": a, "내용": b} for a, b in SOCIAL_CRITERIA],
        },
        "식품안전": {
            "_meta": {
                "주의": (
                    "**규제 기준과 관측값이 섞여 있어 칸을 나눴다.** 규제 기준을 조달·품질 판단에 "
                    "쓰려면 해당 규제기관 원문을 확인해야 한다 — 여기 값은 2차 인용이다."
                ),
            },
            "rows": FOOD_SAFETY,
        },
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✅ {OUT_PATH}")
    print(f"   약어 {len(glossary)}개 (한글 붙은 것 {sum(1 for g in glossary if g['한글'])})")
    print(f"   어종 프로필 {len(profiles)} · 자원상태 {len(stocks)}행 · 평가연도 {years}")
    print(f"   인증 {len(CERTIFICATIONS)}개 · 사회책임 항목 {len(SOCIAL_CRITERIA)} · 식품안전 {len(FOOD_SAFETY)}행")


if __name__ == "__main__":
    main()
