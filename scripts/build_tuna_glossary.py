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
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✅ {OUT_PATH}")
    print(f"   약어 {len(glossary)}개 (한글 붙은 것 {sum(1 for g in glossary if g['한글'])})")
    print(f"   어종 프로필 {len(profiles)} · 자원상태 {len(stocks)}행 · 평가연도 {years}")
    for p in profiles[:6]:
        print(f"     {p['어종']:<12} {p.get('일반 크기', '')}")


if __name__ == "__main__":
    main()
