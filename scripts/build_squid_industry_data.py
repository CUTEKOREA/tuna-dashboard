#!/usr/bin/env python3
"""FAO FishStat 원본에서 「시장 이해 > 오징어」 페이지용 경량 집계 JSON을 만든다.

참치 페이지의 `build_tuna_industry_data.py` 와 같은 골격이다. 원본은 26,905행
(1950~2024, 국가×어종×FAO해역×연도)이라 그대로 커밋할 수 없다(L-08).
집계해 public/data/squid_industry_v1.json 한 개(<1MB)만 남긴다.

원본은 Google Drive 아카이브다. 드라이브가 없는 환경(CI·Vercel)에서는 돌리지 않는다 —
산출 JSON 이 저장소에 커밋돼 있다. 데이터를 갱신할 때만 로컬에서 수동 실행한다.

⚠ 바스켓 규칙 — 아카이브 자체 규칙 5번이다.
  **오징어·갑오징어·문어를 자동으로 합산하지 않는다.** 원본 추출은 ISSCAAP
  "Squids, cuttlefishes, octopuses" 그룹에서 문어를 이미 뺐지만(실측 확인),
  갑오징어(cuttlefish)와 「두족류 미분류(CEP)」가 남는다. 이 스크립트는 셋을
  갈라 각각 집계하고, 합산치를 쓸 때는 그 사실이 화면에 드러나게 한다.

사용법:
    python3 scripts/build_squid_industry_data.py [--source <FishStat 추출 폴더>]
"""
from __future__ import annotations

import argparse
import collections
import csv
import json
from pathlib import Path

DEFAULT_SOURCE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/squid/update_2026-07-06/fishstat"
)

CAPTURE = "FishStat_2026.1.0_capture_squid.csv"
AQUACULTURE = "FishStat_2026.1.0_aquaculture_squid.csv"

# 이 연도보다 최신이 없으면 원본이 낡은 것이다.
# 참치에서 사전필터 추출본을 써서 두 릴리스 뒤처진 적이 있다. 같은 실수를 막는다.
MIN_EXPECTED_YEAR = 2024

OUT_PATH = Path(__file__).resolve().parent.parent / "public/data/squid_industry_v1.json"

# ── 어종 한글명 ────────────────────────────────────────────────────
# 화면에 나가는 문자열은 100% 한글이어야 한다(L-01). 여기서 한 번에 매핑한다.
SPECIES_KO = {
    "SQJ": "살오징어",
    "SQU": "다랑어형오징어",       # Various squids nei
    "GIS": "대왕오징어",           # Jumbo flying squid (페루 pota)
    "SQA": "아르헨티나오징어",     # Argentine shortfin (Illex)
    "CEP": "두족류 미분류",
    "CTL": "갑오징어류",
    "SQC": "유럽오징어",           # Common squids nei
    "SQP": "파타고니아오징어",     # Patagonian squid (포클랜드 Loligo)
    "SQI": "북방오징어",
    "OMZ": "붉은대공오징어",
    "CTC": "참갑오징어",
    "CTP": "파라오갑오징어",
    "SQE": "캘리포니아오징어",
}

# 원본 영문명 → 한글. 코드 매핑이 비었을 때 이름으로 잡는다.
NAME_KO = {
    "Japanese flying squid": "살오징어",
    "Various squids nei": "오징어류 미분류",
    "Various squids NEI": "오징어류 미분류",
    "Jumbo flying squid": "대왕오징어",
    "Argentine shortfin squid": "아르헨티나오징어",
    "Cephalopods nei": "두족류 미분류",
    "Cephalopods NEI": "두족류 미분류",
    "Cuttlefish, bobtail squids nei": "갑오징어류 미분류",
    "Cuttlefish, bobtail squids NEI": "갑오징어류 미분류",
    "Common squids nei": "유럽오징어류",
    "Common squids NEI": "유럽오징어류",
    "Schoolmaster gonate squid": "북방대왕오징어",
    "Patagonian squid": "파타고니아오징어",
    "Opalescent inshore squid": "캘리포니아오징어",
    "Common cuttlefish": "참갑오징어",
    "Pharaoh cuttlefish": "파라오갑오징어",
    "Broadtail shortfin squid": "짧은지느러미오징어",
    "European flying squid": "유럽날개오징어",
    "European squid": "유럽오징어",
    "Wellington flying squid": "웰링턴오징어",
    "Cape Hope squid": "희망봉오징어",
    "Indian squids nei": "인도오징어류",
    "Indian squids NEI": "인도오징어류",
    "Bigfin reef squid": "흰오징어",
    "Cuttlefishes nei": "갑오징어류",
    "Cuttlefishes NEI": "갑오징어류",
    "Neon flying squid": "빨강오징어",
    "Longfin squid": "긴지느러미오징어",
    "Japanese sharptail squid": "화살오징어",
    "Sepiolite cuttlefishes nei": "꼬마갑오징어류",
    "Sepiolite cuttlefishes NEI": "꼬마갑오징어류",
}

COUNTRY_KO = {
    "China": "중국",
    "Viet Nam": "베트남",
    "India": "인도",
    "Peru": "페루",
    "Argentina": "아르헨티나",
    "Chile": "칠레",
    "Taiwan Province of China": "대만",
    "Indonesia": "인도네시아",
    "Russian Federation": "러시아",
    "Republic of Korea": "대한민국",
    "Thailand": "태국",
    "United States of America": "미국",
    "Japan": "일본",
    "Spain": "스페인",
    "Morocco": "모로코",
    "Malaysia": "말레이시아",
    "Philippines": "필리핀",
    "Mexico": "멕시코",
    "Falkland Islands (Malvinas)": "포클랜드제도",
    "Mauritania": "모리타니",
    "Pakistan": "파키스탄",
    "Portugal": "포르투갈",
    "France": "프랑스",
    "Italy": "이탈리아",
    "Democratic People's Republic of Korea": "북한",
    "Türkiye": "튀르키예",
    "Turkey": "튀르키예",
    "Ecuador": "에콰도르",
    "Brazil": "브라질",
    "Egypt": "이집트",
    "Yemen": "예멘",
    "Oman": "오만",
    "Senegal": "세네갈",
    "Nigeria": "나이지리아",
    "United Kingdom of Great Britain and Northern Ireland": "영국",
    "New Zealand": "뉴질랜드",
    "Australia": "호주",
}

# FAO 주요 어장. 오징어가 실제로 잡히는 곳만 한글명을 둔다.
AREA_KO = {
    "61": "북서태평양",
    "71": "중서태평양",
    "87": "남동태평양",
    "41": "남서대서양",
    "51": "서인도양",
    "57": "동인도양",
    "34": "중동대서양",
    "77": "중동태평양",
    "27": "북동대서양",
    "37": "지중해·흑해",
    "67": "북동태평양",
    "81": "남서태평양",
    "47": "남동대서양",
    "21": "북서대서양",
    "31": "중서대서양",
    "88": "남극태평양",
}


def kind_of(name: str) -> str:
    """오징어 / 갑오징어 / 두족류 미분류 로 가른다. 자동 합산을 막기 위한 축이다."""
    low = (name or "").lower()
    if "cuttlefish" in low or "bobtail" in low or "sepiolite" in low:
        return "갑오징어"
    if "cephalopod" in low:
        return "두족류 미분류"
    if "octopus" in low:
        return "문어"
    return "오징어"


def ko_species(row: dict) -> str:
    name = row.get("SPECIES.Name_En") or ""
    if name in NAME_KO:
        return NAME_KO[name]
    code = row.get("SPECIES.ALPHA_3_CODE") or ""
    if code in SPECIES_KO:
        return SPECIES_KO[code]
    # 매핑이 없으면 코드를 그대로 두지 않는다 — 화면에 영문이 나가면 L-01 위반이다.
    return f"기타 두족류({code})"


def ko_country(name: str) -> str:
    return COUNTRY_KO.get(name, name)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--out", type=Path, default=OUT_PATH)
    args = parser.parse_args()

    cap_path = args.source / CAPTURE
    if not cap_path.exists():
        raise SystemExit(
            f"어획 원본을 찾을 수 없다: {cap_path}\n"
            "Google Drive 동기화를 확인하라. 산출 JSON 은 커밋돼 있으므로 빌드에는 필요 없다."
        )

    rows = [
        r
        for r in csv.DictReader(open(cap_path, encoding="utf-8-sig"))
        if r.get("MEASURE") == "Q_tlw" and (r.get("VALUE") or "").strip()
    ]
    if not rows:
        raise SystemExit("생중량(Q_tlw) 행이 없다 — 원본 형식을 확인하라")

    years = sorted({int(r["PERIOD"]) for r in rows})
    latest = years[-1]
    if latest < MIN_EXPECTED_YEAR:
        raise SystemExit(
            f"원본이 낡았다: {cap_path.name} 의 최신 연도가 {latest}인데 "
            f"{MIN_EXPECTED_YEAR} 이상이어야 한다. FishStat 최신 릴리스를 받아라."
        )

    cur = [r for r in rows if int(r["PERIOD"]) == latest]
    world = sum(float(r["VALUE"]) for r in cur)

    # ── 바스켓 구성 — 합산해 쓰기 전에 무엇이 섞였는지 먼저 보여준다 ──
    kind_agg: collections.Counter = collections.Counter()
    for r in cur:
        kind_agg[kind_of(r.get("SPECIES.Name_En"))] += float(r["VALUE"])
    basket = [
        {"구분": k, "어획량": round(v), "비중": round(v / world * 100, 2)}
        for k, v in kind_agg.most_common()
    ]

    # ── 어종 구성 (최신연도 상위 10 + 기타) ──
    sp_agg: collections.Counter = collections.Counter()
    sp_kind: dict[str, str] = {}
    for r in cur:
        ko = ko_species(r)
        sp_agg[ko] += float(r["VALUE"])
        sp_kind[ko] = kind_of(r.get("SPECIES.Name_En"))
    top_sp = sp_agg.most_common(10)
    rest = world - sum(v for _, v in top_sp)
    species_mix = [
        {
            "어종": n,
            "어획량": round(v),
            "비중": round(v / world * 100, 2),
            "구분": sp_kind[n],
        }
        for n, v in top_sp
    ]
    if rest > 0:
        species_mix.append(
            {"어종": "그 밖의 종", "어획량": round(rest), "비중": round(rest / world * 100, 2), "구분": "혼합"}
        )

    # ── 어종 시계열 (상위 5종, 1990~) ──
    focus = [n for n, _ in top_sp[:5]]
    ts_rows: dict[int, dict[str, float]] = collections.defaultdict(dict)
    for r in rows:
        y = int(r["PERIOD"])
        if y < 1990:
            continue
        ko = ko_species(r)
        if ko not in focus:
            continue
        ts_rows[y][ko] = ts_rows[y].get(ko, 0) + float(r["VALUE"])
    species_timeline = [
        {"연도": str(y), **{k: round(v) for k, v in sorted(ts_rows[y].items())}}
        for y in sorted(ts_rows)
    ]

    # ── 살오징어(SQJ) 붕괴 — 이 페이지의 중심 서사 ──
    sqj_world: collections.Counter = collections.Counter()
    sqj_korea: collections.Counter = collections.Counter()
    for r in rows:
        if r.get("SPECIES.ALPHA_3_CODE") != "SQJ":
            continue
        y = int(r["PERIOD"])
        v = float(r["VALUE"])
        sqj_world[y] += v
        if r.get("COUNTRY.Name_En") == "Republic of Korea":
            sqj_korea[y] += v
    peak_world = max(sqj_world.items(), key=lambda kv: kv[1])
    peak_korea = max(sqj_korea.items(), key=lambda kv: kv[1])
    collapse = [
        {
            "연도": str(y),
            "세계": round(sqj_world.get(y, 0)),
            "한국": round(sqj_korea.get(y, 0)),
        }
        for y in sorted(sqj_world)
        if y >= 1970
    ]

    # ── 국가 순위 ──
    ct_agg: collections.Counter = collections.Counter()
    for r in cur:
        ct_agg[ko_country(r.get("COUNTRY.Name_En") or "")] += float(r["VALUE"])
    ranking = [
        {"국가": n, "어획량": round(v), "비중": round(v / world * 100, 2)}
        for n, v in ct_agg.most_common(15)
    ]
    order = [n for n, _ in ct_agg.most_common()]
    korea_catch = ct_agg.get("대한민국", 0)
    korea_rank = order.index("대한민국") + 1 if "대한민국" in order else None

    # ── 해역 순위 ──
    ar_agg: collections.Counter = collections.Counter()
    for r in cur:
        ar_agg[AREA_KO.get(r.get("AREA.CODE") or "", f"해역 {r.get('AREA.CODE')}")] += float(r["VALUE"])
    areas = [
        {"해역": n, "어획량": round(v), "비중": round(v / world * 100, 2)}
        for n, v in ar_agg.most_common(8)
    ]

    # ── 한국 시계열·어종구성 ──
    kr_ts: collections.Counter = collections.Counter()
    world_ts: collections.Counter = collections.Counter()
    for r in rows:
        y = int(r["PERIOD"])
        v = float(r["VALUE"])
        world_ts[y] += v
        if r.get("COUNTRY.Name_En") == "Republic of Korea":
            kr_ts[y] += v
    korea_timeline = [
        {
            "연도": str(y),
            "어획량": round(kr_ts.get(y, 0)),
            "세계점유율": round(kr_ts.get(y, 0) / world_ts[y] * 100, 2) if world_ts.get(y) else 0,
        }
        for y in sorted(kr_ts)
        if y >= 1990
    ]
    kr_sp: collections.Counter = collections.Counter()
    for r in cur:
        if r.get("COUNTRY.Name_En") == "Republic of Korea":
            kr_sp[ko_species(r)] += float(r["VALUE"])
    kr_total = sum(kr_sp.values()) or 1
    korea_species = [
        {"어종": n, "어획량": round(v), "비중": round(v / kr_total * 100, 2)}
        for n, v in kr_sp.most_common(8)
    ]

    # ── 양식 — 사실상 0 이라는 것이 교육 포인트다 ──
    aq_path = args.source / AQUACULTURE
    aq_rows = (
        [
            r
            for r in csv.DictReader(open(aq_path, encoding="utf-8-sig"))
            if r.get("MEASURE") == "Q_tlw" and (r.get("VALUE") or "").strip()
        ]
        if aq_path.exists()
        else []
    )
    aq_total = sum(float(r["VALUE"]) for r in aq_rows)
    aq_last = max((int(r["PERIOD"]) for r in aq_rows), default=None)

    payload = {
        "_meta": {
            "생성일": "2026-08-16",
            "출처": "FAO FishStat 2026.1.0 어획통계 (Capture, 1950–2024)",
            "원본": str(cap_path),
            "단위": "톤(생중량 Q_tlw)",
            "기준연도": latest,
            "바스켓": (
                "ISSCAAP 'Squids, cuttlefishes, octopuses' 그룹에서 오징어·갑오징어 계열만 "
                "추린 230개 ASFIS 코드. 문어는 제외돼 있다(실측 확인). "
                "갑오징어와 두족류 미분류가 남아 있어 합산치를 쓸 때는 구성을 함께 밝힌다."
            ),
            "주의": (
                "오징어·갑오징어·문어를 자동 합산하지 않는다. "
                "TAC·허용노력량과 실제 어획량도 구분한다."
            ),
            "갱신방법": "python3 scripts/build_squid_industry_data.py",
        },
        "요약": {
            "기준연도": latest,
            "세계어획량": round(world),
            "최대어종": species_mix[0]["어종"],
            "최대어종비중": species_mix[0]["비중"],
            "최대국": ranking[0]["국가"],
            "최대국비중": ranking[0]["비중"],
            "최대해역": areas[0]["해역"],
            "최대해역비중": areas[0]["비중"],
            "한국어획량": round(korea_catch),
            "한국순위": korea_rank,
            "한국비중": round(korea_catch / world * 100, 2),
            "살오징어세계정점연도": peak_world[0],
            "살오징어세계정점": round(peak_world[1]),
            "살오징어세계최신": round(sqj_world.get(latest, 0)),
            "살오징어한국정점연도": peak_korea[0],
            "살오징어한국정점": round(peak_korea[1]),
            "살오징어한국최신": round(sqj_korea.get(latest, 0)),
            "양식누적": round(aq_total, 3),
            "양식최종연도": aq_last,
        },
        "바스켓구성": basket,
        "어종구성": species_mix,
        "어종시계열": species_timeline,
        "살오징어붕괴": collapse,
        "국가순위": ranking,
        "해역순위": areas,
        "한국시계열": korea_timeline,
        "한국어종구성": korea_species,
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    size = args.out.stat().st_size / 1024
    print(f"✅ {args.out} ({size:,.0f} KB)")
    print(f"   기준연도 {latest} · 세계 {round(world):,} t")
    print(f"   바스켓: " + " · ".join(f"{b['구분']} {b['비중']}%" for b in basket))
    print(f"   최대어종 {species_mix[0]['어종']} {species_mix[0]['비중']}% · 최대국 {ranking[0]['국가']} {ranking[0]['비중']}%")
    print(f"   한국 {round(korea_catch):,} t · {korea_rank}위 · {round(korea_catch / world * 100, 2)}%")
    print(
        f"   살오징어 세계 {peak_world[0]}년 {round(peak_world[1]):,} t "
        f"→ {latest}년 {round(sqj_world.get(latest, 0)):,} t "
        f"({sqj_world.get(latest, 0) / peak_world[1] * 100:.1f}%)"
    )
    print(
        f"   살오징어 한국 {peak_korea[0]}년 {round(peak_korea[1]):,} t "
        f"→ {latest}년 {round(sqj_korea.get(latest, 0)):,} t "
        f"({sqj_korea.get(latest, 0) / peak_korea[1] * 100:.1f}%)"
    )
    print(f"   양식 누적 {aq_total:.3f} t (최종 {aq_last}년) — 사실상 0")


if __name__ == "__main__":
    main()
