#!/usr/bin/env python3
"""Thai Union 브랜드 SKU 카탈로그 인테이크.

원자료는 2026-08-20 조사에서 이미 확보돼 있다 (`…/ThaiUnion/02_출처원본/브랜드카탈로그/`).
보고서에는 브랜드별 개수와 가격 표본만 실렸고 SKU 목록은 들어가지 않았다 — Frinsa 보고서가
제품 하나하나를 규격·가격까지 적은 것과 대비된다.

여기서는 **손으로 옮기지 않고 원자료에서 그대로 읽는다.** 아홉 브랜드가 여섯 갈래 형식으로
들어와 필드 이름만 맞춰 준다.

  공식 카탈로그 (규격·인증·설명 확보)
    John West          ex_jw.json + WP API 분류   87
    Chicken of the Sea ex_cots.json               68
    Petit Navire       ex_eu.json                 68
    Rügen Fisch        ex_eu.json                 31   학명 포함
    Hawesta            ex_eu.json                 31
    King Oscar         ko_gql.json                29   GTIN 포함
  Open Food Facts (전용 사이트 부재·차단)
    Mareblu / Parmentier / Sealect  off2/        153

⚠ OFF 계열 셋은 **회사 공개자료가 아니라 소비자 데이터베이스**다. 규격·인증이 비어 있는 칸이
   있고 표기도 제각각이다 — 등급을 나눠 붙이고 화면에도 그대로 밝힌다.
⚠ 빈 칸은 「—」로 두고 채우지 않는다. 없는 값을 만들어 내면 그때부터 거짓말이다.
"""
from __future__ import annotations

import html as H
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/tuna/00_참치_관련자료/02_참치_가공·유통·기업"
    "/태국/ThaiUnion/02_출처원본/브랜드카탈로그"
)
OUT = ROOT / "public/data/companies/thaiunion_skus_v1.json"

# 어종 슬러그 → 한글. 화면에 슬러그를 그대로 내보내지 않는다.
FISH = {
    "tuna": "참치", "skipjack": "가다랑어", "yellowfin": "황다랑어", "albacore": "날개다랑어",
    "salmon": "연어", "pink-salmon": "연어(핑크)", "red-salmon": "연어(레드)",
    "sardines": "정어리", "sardine": "정어리", "mackerel": "고등어", "anchovy": "안초비",
    "herring": "청어", "kipper": "훈제청어", "sild": "실드", "skippers": "스키퍼스",
    "mussels": "홍합", "crab": "게", "shrimp": "새우", "oysters": "굴", "clams": "조개",
    "cod": "대구", "sprat": "스프래트",
}


# 제품명 자체가 어종을 적고 있는 브랜드가 있다(프랑스·독일·노르웨이). 지어내는 것이 아니라
# 그 이름을 읽는 것이다. 긴 낱말부터 맞춰야 «Thunfisch» 가 «Thun» 에 먼저 걸리지 않는다.
TITLE_FISH = [
    ("thunfisch", "참치"), ("thun-no", "식물성 대체"), ("yellowfin", "황다랑어"),
    ("skipjack", "가다랑어"), ("albacore", "날개다랑어"), ("thon", "참치"),
    ("sardine", "정어리"), ("sardinen", "정어리"), ("sprotten", "스프래트"),
    ("maquereau", "고등어"), ("makrele", "고등어"), ("mackerel", "고등어"),
    ("hering", "청어"), ("herring", "청어"), ("kipper", "훈제청어"),
    ("saumon", "연어"), ("lachs", "연어"), ("salmon", "연어"),
    ("anchois", "안초비"), ("anchovy", "안초비"), ("anchovies", "안초비"),
    ("crabe", "게"), ("crevette", "새우"), ("muscheln", "홍합"), ("mussels", "홍합"),
    ("dorschleber", "대구간"), ("végétal", "식물성 대체"), ("vegetal", "식물성 대체"),
    # 이탈리아어(Mareblu) · 태국어(Sealect)
    ("tonno", "참치"), ("sgombro", "고등어"), ("salmone", "연어"), ("alici", "안초비"),
    ("tuna", "참치"), ("ทูน่า", "참치"), ("ปลาทูน่า", "참치"),
]


def fish_from_title(title: str) -> str:
    t = str(title).lower()
    for key, ko in TITLE_FISH:
        if key in t:
            return ko
    return ""


# Rügen Fisch 는 학명을 싣는다. 버리지 않고 한글명 뒤에 괄호로 남긴다.
LATIN = {
    "clupea harengus": "청어", "scomber japonicus": "고등어", "scomber scombrus": "고등어",
    "gadus morhua": "대구", "sprattus sprattus": "스프래트", "salmo salar": "연어",
    "thunnus albacares": "황다랑어", "katsuwonus pelamis": "가다랑어",
}


def fish_label(raw: str) -> str:
    """학명이면 «한글 (학명)», 아니면 그대로."""
    t = " ".join(str(raw or "").split())
    ko = LATIN.get(t.lower())
    return f"{ko} ({t})" if ko else t


def clean(s) -> str:
    return " ".join(H.unescape(re.sub(r"<[^>]+>", " ", str(s or ""))).split())


def row(brand, country, name, fish, size, kind, cert, grade, source, url=""):
    return {
        "브랜드": brand, "국가": country, "제품명": clean(name),
        "어종": clean(fish) or "—", "규격": clean(size) or "—", "타입": clean(kind) or "—",
        "인증": clean(cert) or "—", "등급": grade, "출처": source, "url": url,
    }


def load(p):
    return json.load(open(SRC / p, encoding="utf8"))


def john_west():
    """WP API 분류에서 어종·규격·담금을, 추출본에서 인증을 가져온다."""
    ex = {}
    for r in load("tu_work/ex_jw.json"):
        ex[r["url"].rstrip("/")] = r
    out = []
    for r in load("johnwest_products_p1_wpapi.json"):
        cls = r.get("class_list", [])

        def pick(pre):
            return [c[len(pre):] for c in cls if c.startswith(pre)]

        fish = " · ".join(FISH.get(f, f) for f in pick("fish-type-"))
        # 슬러그가 순수 숫자인 것은 단위가 빠진 그램값이다 — 「80」은 연어 필레 80 g 이다.
        size = " · ".join(f"{s} g" if s.isdigit() else s for s in pick("pack-size-"))
        kind = " · ".join(s.replace("-", " ") for s in pick("packed-in-"))
        link = r.get("link", "")
        e = ex.get(link.rstrip("/"), {})
        cert = " · ".join(e.get("labels") or [])
        out.append(row("John West", "영국", (r.get("title") or {}).get("rendered", ""),
                       fish, size, kind, cert, "A", "공식 브랜드 카탈로그", link))
    return out


def chicken_of_the_sea():
    out = []
    for r in load("tu_work/ex_cots.json"):
        cat = r.get("category", "")
        out.append(row("Chicken of the Sea", "미국", r.get("title"), FISH.get(cat, cat),
                       " · ".join(r.get("sizes") or []), "", "", "A",
                       "공식 브랜드 카탈로그", r.get("url", "")))
    return out


def eu_brands():
    eu = load("tu_work/ex_eu.json")
    meta = {"petitnavire": ("Petit Navire", "프랑스"),
            "ruegenfisch": ("Rügen Fisch", "독일"),
            "hawesta": ("Hawesta", "독일")}
    out = []
    for key, (brand, country) in meta.items():
        for r in eu.get(key, []):
            fish = fish_label(clean(r.get("species", ""))) or fish_from_title(r.get("title", ""))
            out.append(row(brand, country, r.get("title"), fish,
                           r.get("size", ""), "", " · ".join(r.get("certs") or []),
                           "A", "공식 제품 카탈로그", r.get("url", "")))
    return out


def king_oscar():
    ko = load("tu_work/ko_gql.json")
    out = []
    for e in ko["data"]["products"]["edges"]:
        n = e["node"]
        edges = (n.get("variants") or {}).get("edges") or []
        gtin = edges[0]["node"].get("sku", "") if edges else ""
        out.append(row("King Oscar", "노르웨이", n.get("title"),
                       fish_from_title(n.get("title", "")), "", "",
                       f"GTIN {gtin}" if gtin else "", "A", "공식 제품 카탈로그(Shopify)",
                       f"https://www.kingoscar.com/product/{n.get('handle', '')}"))
    return out


OFF_META = {"mareblu_1.json": ("Mareblu", "이탈리아"),
            "parmentier_1.json": ("Parmentier", "프랑스"),
            "sealect_1.json": ("Sealect", "태국")}


def off_brands():
    out = []
    for f, (brand, country) in OFF_META.items():
        d = load(f"tu_work/off2/{f}")
        prods = d.get("products", d) if isinstance(d, dict) else d
        for p in prods:
            name = (p.get("product_name") or p.get("product_name_it")
                    or p.get("product_name_fr") or p.get("product_name_en")
                    or p.get("generic_name") or "")
            # OFF 에는 바코드와 용량만 있고 이름이 없는 항목이 있다. 지어내지 않는다.
            if not name.strip():
                name = f"(제품명 미기재 · 바코드 {p.get('code', '')})"
            out.append(row(brand, country, name, fish_from_title(name),
                           p.get("quantity", ""), "",
                           p.get("labels", ""), "B", "Open Food Facts",
                           f"https://world.openfoodfacts.org/product/{p.get('code', '')}"))
    return out


BRAND_KEY = {"rugen-fisch": "Rügen Fisch", "petit-navire": "Petit Navire",
             "hawesta": "Hawesta", "john-west": "John West", "parmentier": "Parmentier",
             "king-oscar": "King Oscar", "chicken-of-the-sea": "Chicken of the Sea"}


def prices():
    """소매 실판매가. Open Prices 정연분과 Morrisons 실측을 한 표로 세운다.

    Open Prices 는 소매처·국가·날짜가 붙어 있고, Morrisons 는 JSON-LD 를 서버사이드로
    내보내는 유일한 영국 소매처라 UK 가격이 여기서만 뚫렸다(조사노트 F-1).
    """
    out = []
    for key, rows in load("tu_work/price_tbl.json").items():
        brand = BRAND_KEY[key]
        for r in rows:
            out.append({
                "브랜드": brand, "제품명": clean(r.get("name")),
                "규격": clean(r.get("qty")) or "—",
                "가격": f"{r.get('price')} {r.get('cur')}",
                "단가": clean(r.get("per")) or "—",
                "소매처": clean(r.get("loc")) or "—",
                "국가": clean(r.get("country")) or "—",
                "기준일": clean(r.get("date")) or "—",
                "출처": "Open Prices",
            })
    for url, r in load("tu_work/morrisons.json").items():
        out.append({
            "브랜드": "John West", "제품명": clean(r.get("name")), "규격": "—",
            "가격": f"{r.get('price')} GBP", "단가": "—",
            "소매처": "Morrisons", "국가": "영국", "기준일": "2026-08-20",
            "출처": "소매처 JSON-LD 실측",
        })
    return out


EXPECT = {"John West": 87, "Chicken of the Sea": 68, "Petit Navire": 68,
          "Rügen Fisch": 31, "Hawesta": 31, "King Oscar": 29,
          "Mareblu": 85, "Parmentier": 54, "Sealect": 14}


def main() -> int:
    rows = john_west() + chicken_of_the_sea() + eu_brands() + king_oscar() + off_brands()

    got: dict[str, int] = {}
    for r in rows:
        got[r["브랜드"]] = got.get(r["브랜드"], 0) + 1
    if got != EXPECT:
        print("브랜드별 SKU 수가 기대와 다르다", file=sys.stderr)
        for b in sorted(set(got) | set(EXPECT)):
            if got.get(b) != EXPECT.get(b):
                print(f"  {b}: 기대 {EXPECT.get(b)} · 실제 {got.get(b)}", file=sys.stderr)
        return 1
    blank = [r for r in rows if not r["제품명"]]
    if blank:
        print(f"제품명이 빈 행 {len(blank)}건 — {[r['브랜드'] for r in blank][:5]}", file=sys.stderr)
        return 1
    # OFF 에 이름이 없는 항목이 셋 있다. 늘어나면 원자료가 바뀐 것이므로 여기서 잡는다.
    unnamed = [r for r in rows if r["제품명"].startswith("(제품명 미기재")]
    if len(unnamed) != 3:
        print(f"제품명 미기재 항목이 3건이 아니라 {len(unnamed)}건이다", file=sys.stderr)
        for r in unnamed:
            print(f"  {r['브랜드']} · {r['url']}", file=sys.stderr)
        return 1

    pr = prices()
    if len(pr) != 186:
        print(f"소매가 행이 186건이 아니라 {len(pr)}건이다", file=sys.stderr)
        return 1

    first = {b: next(r for r in rows if r["브랜드"] == b) for b in EXPECT}
    payload = {
        "_meta": {
            "회사": "Thai Union Group",
            "출처": "ThaiUnion 조사 아카이브 (2026-08-20) — 공식 브랜드 카탈로그 6곳 + Open Food Facts 3곳",
            "등급": "A=회사 공개 카탈로그 · B=Open Food Facts(소비자 데이터베이스)",
            "한계": "OFF 계열은 규격·인증이 비어 있는 칸이 있고 표기가 제각각이다. 빈 칸은 채우지 않고 「—」로 둔다.",
            "갱신방법": "python3 scripts/build_thaiunion_skus.py",
        },
        "brands": [{"브랜드": b, "국가": first[b]["국가"], "수": n,
                    "등급": first[b]["등급"], "출처": first[b]["출처"]}
                   for b, n in EXPECT.items()],
        "skus": rows,
        "prices": pr,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf8")
    print(f"{OUT.relative_to(ROOT)}: {len(rows)} SKU · 소매가 {len(pr)}건 · "
          f"{len(EXPECT)}개 브랜드 · {OUT.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
