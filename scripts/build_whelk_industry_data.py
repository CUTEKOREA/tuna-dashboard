#!/usr/bin/env python3
"""「골뱅이」라는 이름에 무엇이 섞였는지 갈라 집계한다.

참치는 어법(선망/연승)이, 오징어도 어법(채낚기/트롤)이 축이었다. 골뱅이는 다르다.
**종 구분이 축**이다 — 「골뱅이」 한 이름에 네 개 과(科)가 섞여 있고,
세계 생산의 83%가 한국인이 통조림으로 먹는 그 종이 아니다.

⚠ 아카이브가 직접 못박은 규칙이 있다.
  `species_groups/README.md`: "Do not add groups together as 'world whelk'."
  이 스크립트는 그 규칙을 코드로 강제한다 — 그룹 합계를 「세계 골뱅이」로 부르지 않는다.

⚠ 한국은 FAO 에 종을 보고하지 않는다.
  1970~2024년 전 연도가 단일 코드 GAS(고둥류 미분류)다. 그래서 한국 어획을
  종별로 가를 수 없고, **한국의 참골뱅이 어획은 0**이다 — 통조림 원료는 전량 수입이다.

원본: FAO FishStat 2026.1.0 파생 CSV (아카이브 11_분석·가공데이터)

사용법:
    python3 scripts/build_whelk_industry_data.py
"""
from __future__ import annotations

import csv
import json
from pathlib import Path

BASE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/whelk/00_골뱅이_관련자료/11_분석·가공데이터"
    "/FAO_FishStat/updates/2026-08-16/species_groups"
)
KCS = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/whelk/00_골뱅이_관련자료/11_분석·가공데이터"
    "/KCS_trade/updates/2026-08-16/KCS_2024_160559_import_by_partner.csv"
)
KOSIS = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/whelk/00_골뱅이_관련자료/11_분석·가공데이터"
    "/KOSIS/KOSIS_DT_1EW0004_whelk_gastropoda_sora_annual.csv"
)

OUT_PATH = Path(__file__).resolve().parent.parent / "public/data/whelk_industry_v1.json"

MIN_EXPECTED_YEAR = 2024

# 과(科) 한글명. 이 표가 이 페이지의 중심이다 — 네 과가 한 이름에 섞여 있다.
GROUP_KO = {
    "rapana": {"한글": "피뿔고둥류", "과": "뿔소라과", "학명": "Rapana"},
    "buccinum": {"한글": "참골뱅이류", "과": "물레고둥과", "학명": "Buccinum"},
    "residual_nei": {"한글": "고둥류 미분류", "과": "혼합", "학명": "—"},
    "babylonia": {"한글": "동풍라류", "과": "동풍라과", "학명": "Babylonia"},
    "busycon": {"한글": "미국고둥류", "과": "물레고둥붙이과", "학명": "Busycon"},
}

COUNTRY_KO = {
    "United Kingdom of Great Britain and Northern Ireland": "영국",
    "France": "프랑스",
    "Canada": "캐나다",
    "Ireland": "아일랜드",
    "Norway": "노르웨이",
    "Republic of Korea": "대한민국",
    "China": "중국",
    "Türkiye": "튀르키예",
    "Turkey": "튀르키예",
    "Mexico": "멕시코",
    "Russian Federation": "러시아",
    "Pakistan": "파키스탄",
    "United States of America": "미국",
    "Japan": "일본",
    "Netherlands (Kingdom of the)": "네덜란드",
    "Iceland": "아이슬란드",
    "Portugal": "포르투갈",
    "Spain": "스페인",
    "Italy": "이탈리아",
    "Ukraine": "우크라이나",
}


def read(name: str) -> list[dict]:
    path = BASE / name
    if not path.exists():
        raise SystemExit(f"원본을 찾을 수 없다: {path}\nGoogle Drive 동기화를 확인하라.")
    with open(path, encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def ko_country(name: str) -> str:
    return COUNTRY_KO.get(name.strip(), name.strip())


def main() -> None:
    prod = read("global_production_2024_by_group.csv")
    cap = read("capture_2024_by_group.csv")
    aqua = read("aquaculture_2024_by_group.csv")
    cap_country = read("capture_2024_by_group_country.csv")
    aqua_country = read("aquaculture_2024_by_group_country.csv")

    years = {int(r["year"]) for r in prod}
    latest = max(years)
    if latest < MIN_EXPECTED_YEAR:
        raise SystemExit(f"원본이 낡았다: 최신 {latest} < {MIN_EXPECTED_YEAR}")

    cap_by = {r["species_group"]: float(r["tonnes_live_weight"]) for r in cap}
    aqua_by = {r["species_group"]: float(r["tonnes_live_weight"]) for r in aqua}

    total = sum(float(r["tonnes_live_weight"]) for r in prod)
    groups = []
    for row in sorted(prod, key=lambda r: -float(r["tonnes_live_weight"])):
        g = row["species_group"]
        v = float(row["tonnes_live_weight"])
        meta = GROUP_KO.get(g, {"한글": g, "과": "—", "학명": "—"})
        groups.append(
            {
                "그룹": meta["한글"],
                "과": meta["과"],
                "학명": meta["학명"],
                "생산량": round(v),
                "어획": round(cap_by.get(g, 0)),
                "양식": round(aqua_by.get(g, 0)),
                "비중": round(v / total * 100, 2),
            }
        )

    # 참골뱅이 어획 상위국 — 한국이 없다는 것이 이 표의 핵심이다
    bucc = sorted(
        (r for r in cap_country if r["species_group"] == "buccinum"),
        key=lambda r: -float(r["tonnes_live_weight"]),
    )[:10]
    buccinum_top = [
        {"국가": ko_country(r["country"]), "어획량": round(float(r["tonnes_live_weight"]))}
        for r in bucc
    ]

    # 피뿔고둥 양식 상위국 — 세계 생산의 대부분이 여기서 나온다
    rap = sorted(
        (r for r in aqua_country if r["species_group"] == "rapana"),
        key=lambda r: -float(r["tonnes_live_weight"]),
    )[:5]
    rapana_top = [
        {"국가": ko_country(r["country"]), "양식량": round(float(r["tonnes_live_weight"]))}
        for r in rap
    ]

    # ── 한국 수입 (조제저장 고둥류 HS 1605.59) ──
    imports = []
    if KCS.exists():
        with open(KCS, encoding="utf-8-sig") as handle:
            for r in csv.DictReader(handle):
                usd = float(r.get("imp_usd") or 0)
                kg = float(r.get("imp_kg") or 0)
                if usd <= 0:
                    continue
                imports.append(
                    {
                        "국가": r["partner_kr"].strip(),
                        "통관코드": r["hs10"],
                        "수입액": round(usd / 1e6, 2),
                        "수입량": round(kg / 1000, 1),
                        "단가": round(usd / (kg / 1000)) if kg else 0,
                    }
                )
        imports.sort(key=lambda r: -r["수입액"])
    imports = imports[:10]
    import_total = sum(r["수입액"] for r in imports)

    # ── 국내 생산 — 코드가 두 번 갈린다 ──
    # 130303 골뱅이(1990~2009) 와 130311 고둥류(2010~2025) 는 다른 코드다.
    # 한 선으로 그으면 안 되므로 계열을 나눠 담는다.
    korea_series: dict[str, list[dict]] = {"골뱅이": [], "고둥류": [], "소라": []}
    if KOSIS.exists():
        with open(KOSIS, encoding="utf-8-sig") as handle:
            for r in csv.DictReader(handle):
                if not r.get("value") or "qty" not in (r.get("series_id") or ""):
                    continue
                name = (r.get("species_kr") or "").strip()
                if name not in korea_series:
                    continue
                try:
                    korea_series[name].append(
                        {"연도": r["prd_de"], "생산량": round(float(r["value"]))}
                    )
                except ValueError:
                    continue
    for rows in korea_series.values():
        rows.sort(key=lambda r: r["연도"])

    payload = {
        "_meta": {
            "생성일": "2026-08-17",
            "출처": "FAO FishStat 2026.1.0 (아카이브 파생 CSV)",
            "단위": "톤(생중량)",
            "기준연도": latest,
            "합산금지": (
                "아카이브 원본 README 가 직접 못박았다 — 이 그룹들을 더해 「세계 골뱅이」라고 "
                "부르지 마라. 네 개 과(科)가 섞여 있고 어획과 양식의 성격도 다르다."
            ),
            "한국주의": (
                "한국은 FAO 에 종을 보고하지 않는다. 1970~2024년 전 연도가 단일 코드 "
                "GAS(고둥류 미분류)다. 그래서 한국 어획은 종별로 가를 수 없다."
            ),
            "갱신방법": "python3 scripts/build_whelk_industry_data.py",
        },
        "요약": {
            "기준연도": latest,
            "세계생산합계": round(total),
            "최대그룹": groups[0]["그룹"],
            "최대그룹비중": groups[0]["비중"],
            "참골뱅이비중": next((g["비중"] for g in groups if g["그룹"] == "참골뱅이류"), 0),
            "양식비중": round(sum(aqua_by.values()) / total * 100, 2),
            "한국참골뱅이어획": 0,
        },
        "종구성": groups,
        "참골뱅이상위국": buccinum_top,
        "피뿔고둥양식상위국": rapana_top,
        "한국수입": {
            "_meta": {
                "기준연도": 2024,
                "출처": "관세청 통관 (조제저장 고둥류 HS 1605.59)",
                "등급": "A",
                "합계": round(import_total, 1),
                "주의": (
                    "조제저장품 코드라 원물이 아니다. 상대국이 원산지와 다를 수 있고, "
                    "이 코드에는 골뱅이 아닌 고둥류도 들어온다."
                ),
            },
            "rows": imports,
        },
        "한국생산": {
            "_meta": {
                "출처": "국가통계포털 어업생산동향조사",
                "등급": "A",
                "코드단절": (
                    "130303 골뱅이는 1990~2009년, 130311 고둥류는 2010~2025년이다. "
                    "**두 계열을 한 선으로 이으면 안 된다.** 130310 소라는 또 다른 종이라 합산 금지다."
                ),
            },
            "계열": korea_series,
        },
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✅ {OUT_PATH} ({OUT_PATH.stat().st_size / 1024:,.0f} KB)")
    print(f"   기준연도 {latest} · 다섯 그룹 합계 {round(total):,} t (이것을 「세계 골뱅이」라 부르지 않는다)")
    for g in groups:
        print(f"     {g['그룹']:12} {g['생산량']:>9,} t  {g['비중']:5.2f}%  (어획 {g['어획']:,} · 양식 {g['양식']:,})")
    print(f"   참골뱅이 어획 상위: " + " · ".join(f"{r['국가']} {r['어획량']:,}" for r in buccinum_top[:4]))
    print("   한국 참골뱅이 어획 0 — 통조림 원료는 전량 수입이다")
    if imports:
        print(f"   한국 수입 {import_total:.1f}백만USD · 상위: " +
              " · ".join(f"{r['국가']} {r['수입액']}" for r in imports[:4]))
    for k, rows in korea_series.items():
        if rows:
            print(f"   국내 {k}: {rows[0]['연도']}~{rows[-1]['연도']} ({len(rows)}년)")


if __name__ == "__main__":
    main()
