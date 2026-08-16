#!/usr/bin/env python3
"""새우 밸류체인 집계 — 축은 **양식 대 자연산**과 **단일종 지배**다.

참치·오징어는 어법이, 고등어는 크기 등급이, 골뱅이는 종 구분이 축이었다.
새우는 또 다르다. **양식이 이긴 유일한 주요 수산 품목**이라는 점이 축이다.

1950년 양식은 세계 생산의 0.3%였다. 2024년에는 73.8%다. 자연산은 1990년대 이후
사실상 정체했고 늘어난 수요를 양식이 전부 흡수했다. 참치·오징어는 양식이 없거나
(오징어) 축양에 그치는데(참치) 새우는 뒤집혔다.

둘째 축은 **단일종 모노컬처**다. 흰다리새우 한 종이 세계 생산의 64%다.
질병 한 방이 세계 공급의 3분의 2를 동시에 때릴 수 있다는 뜻이다.

⚠ 한국은 세계와 정반대다.
  세계는 양식 73.8%인데 한국은 자연산 77.2%다. 게다가 한국 1위 품목은
  젓새우류로 새우젓이라는 소비 형태가 통계에 그대로 찍힌다.

원본: FAO FishStat 2026.1.0 (아카이브 snapshot_2026-07-06)
  Google Drive 스트리밍이 자주 멈춰 /tmp 로 복사해 읽는다.

사용법:
    python3 scripts/build_shrimp_industry_data.py
"""
from __future__ import annotations

import collections
import csv
import json
from pathlib import Path

# Drive 직독이 자주 멈춘다. 복사본을 먼저 보고, 없으면 원본을 본다.
CACHE = Path("/tmp/shrimp-fao")
ARCHIVE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/shrimp/00_새우_관련자료/10_원본데이터셋"
    "/FAO_FishStat/snapshot_2026-07-06"
)
CAPTURE = "FishStat_2026.1.0_capture_shrimp.csv"
AQUA = "FishStat_2026.1.0_aquaculture_shrimp.csv"

OUT_PATH = Path(__file__).resolve().parent.parent / "public/data/shrimp_industry_v1.json"
MIN_EXPECTED_YEAR = 2024

# 학명까지 확인해 붙였다. 「새우」로 뭉뚱그리면 젓새우와 흰다리새우가 같은 칸에 들어간다.
SPECIES_KO = {
    "PNV": "흰다리새우",            # Penaeus vannamei — 세계 생산의 60%
    "GIT": "블랙타이거",            # Penaeus monodon
    "AKS": "젓새우",               # Acetes japonicus — 한국 1위, 새우젓 원료
    "DCP": "십각류 미분류",         # Natantia
    "SHI": "중하",                 # Metapenaeus joyneri
    "PEN": "대하류 미분류",         # Penaeus spp
    "ASH": "아르헨티나젓새우",       # Artemesia longinaris
    "PRA": "북방새우",             # Pandalus borealis
    "PAL": "징거미새우류",          # Palaemonidae
    "MET": "중하류 미분류",         # Metapenaeus spp
    "SHS": "곤쟁이류",             # Sergestidae
    "TIP": "얼룩새우",             # Penaeus semisulcatus
    "ARA": "붉은새우",             # Aristeus antennatus
    "KUP": "보리새우",             # Penaeus japonicus
}

COUNTRY_KO = {
    "China": "중국",
    "Viet Nam": "베트남",
    "India": "인도",
    "Ecuador": "에콰도르",
    "Indonesia": "인도네시아",
    "Thailand": "태국",
    "Republic of Korea": "대한민국",
    "Mexico": "멕시코",
    "Argentina": "아르헨티나",
    "Bangladesh": "방글라데시",
    "Philippines": "필리핀",
    "Myanmar": "미얀마",
    "Malaysia": "말레이시아",
    "Brazil": "브라질",
    "United States of America": "미국",
    "Canada": "캐나다",
    "Greenland": "그린란드",
    "Norway": "노르웨이",
    "Iran (Islamic Republic of)": "이란",
    "Saudi Arabia": "사우디아라비아",
    "Japan": "일본",
    "Nigeria": "나이지리아",
}


def source_dir() -> Path:
    if (CACHE / CAPTURE).exists() and (CACHE / CAPTURE).stat().st_size > 0:
        return CACHE
    return ARCHIVE


def read(path: Path) -> list[dict]:
    if not path.exists() or path.stat().st_size == 0:
        raise SystemExit(
            f"원본을 읽을 수 없다: {path}\n"
            "Google Drive 스트리밍이 멈추면 먼저 /tmp/shrimp-fao 로 복사하라."
        )
    with open(path, encoding="utf-8-sig") as handle:
        return [
            r
            for r in csv.DictReader(handle)
            if r.get("MEASURE") == "Q_tlw" and (r.get("VALUE") or "").strip()
        ]


def ko_species(row: dict) -> str:
    code = row.get("SPECIES.ALPHA_3_CODE") or ""
    if code in SPECIES_KO:
        return SPECIES_KO[code]
    return f"기타 새우({code})"


def ko_country(name: str) -> str:
    return COUNTRY_KO.get((name or "").strip(), (name or "").strip())


def main() -> None:
    src = source_dir()
    cap = read(src / CAPTURE)
    aqua = read(src / AQUA)

    years = sorted({int(r["PERIOD"]) for r in cap} | {int(r["PERIOD"]) for r in aqua})
    latest = years[-1]
    if latest < MIN_EXPECTED_YEAR:
        raise SystemExit(f"원본이 낡았다: 최신 {latest} < {MIN_EXPECTED_YEAR}")

    def total(rows: list[dict], year: int) -> float:
        return sum(float(r["VALUE"]) for r in rows if int(r["PERIOD"]) == year)

    cap_now, aqua_now = total(cap, latest), total(aqua, latest)
    world = cap_now + aqua_now

    # ── 양식이 자연산을 넘어선 궤적 ──
    timeline = []
    for y in range(1950, latest + 1, 5) if latest >= 1950 else []:
        c, a = total(cap, y), total(aqua, y)
        if c + a <= 0:
            continue
        timeline.append(
            {"연도": str(y), "자연산": round(c), "양식": round(a),
             "양식비중": round(a / (c + a) * 100, 1)}
        )
    if timeline and timeline[-1]["연도"] != str(latest):
        timeline.append(
            {"연도": str(latest), "자연산": round(cap_now), "양식": round(aqua_now),
             "양식비중": round(aqua_now / world * 100, 1)}
        )

    # ── 종 구성 — 한 종이 3분의 2다 ──
    sp = collections.Counter()
    for rows in (cap, aqua):
        for r in rows:
            if int(r["PERIOD"]) == latest:
                sp[ko_species(r)] += float(r["VALUE"])
    top_sp = sp.most_common(8)
    rest = world - sum(v for _, v in top_sp)
    species = [
        {"종": n, "생산량": round(v), "비중": round(v / world * 100, 2)} for n, v in top_sp
    ]
    if rest > 0:
        species.append({"종": "그 밖의 종", "생산량": round(rest), "비중": round(rest / world * 100, 2)})

    # ── 국가별 — 양식 비중으로 나라 성격이 갈린다 ──
    cap_c, aqua_c = collections.Counter(), collections.Counter()
    for r in cap:
        if int(r["PERIOD"]) == latest:
            cap_c[ko_country(r["COUNTRY.Name_En"])] += float(r["VALUE"])
    for r in aqua:
        if int(r["PERIOD"]) == latest:
            aqua_c[ko_country(r["COUNTRY.Name_En"])] += float(r["VALUE"])
    names = sorted(set(cap_c) | set(aqua_c), key=lambda n: -(cap_c[n] + aqua_c[n]))[:12]
    countries = []
    for n in names:
        c, a = cap_c[n], aqua_c[n]
        countries.append(
            {
                "국가": n,
                "자연산": round(c),
                "양식": round(a),
                "합계": round(c + a),
                "양식비중": round(a / (c + a) * 100, 1) if (c + a) else 0,
            }
        )

    # 한국은 상위 12위 밖이라 따로 뽑는다. 세계와 정반대인 구조가 이 페이지의 훅이다.
    kc, ka = cap_c["대한민국"], aqua_c["대한민국"]
    all_names = sorted(set(cap_c) | set(aqua_c), key=lambda n: -(cap_c[n] + aqua_c[n]))
    korea_rank = all_names.index("대한민국") + 1 if "대한민국" in all_names else None
    korea = (
        {
            "국가": "대한민국",
            "자연산": round(kc),
            "양식": round(ka),
            "합계": round(kc + ka),
            "양식비중": round(ka / (kc + ka) * 100, 1) if (kc + ka) else 0,
        }
        if (kc + ka)
        else None
    )
    if korea and not any(r["국가"] == "대한민국" for r in countries):
        countries.append(korea)

    # 한국 종 구성 — 젓새우류가 1위라는 것이 소비 형태를 그대로 보여준다
    korea_sp = collections.Counter()
    for rows in (cap, aqua):
        for r in rows:
            if int(r["PERIOD"]) == latest and ko_country(r["COUNTRY.Name_En"]) == "대한민국":
                korea_sp[ko_species(r)] += float(r["VALUE"])
    korea_total = sum(korea_sp.values()) or 1
    korea_species = [
        {"종": n, "생산량": round(v), "비중": round(v / korea_total * 100, 2)}
        for n, v in korea_sp.most_common(6)
    ]

    payload = {
        "_meta": {
            "생성일": "2026-08-17",
            "출처": "FAO FishStat 2026.1.0 (ISSCAAP 새우류)",
            "단위": "톤(생중량)",
            "기준연도": latest,
            "축": (
                "새우는 **양식이 이긴 유일한 주요 수산 품목**이다. 1950년 양식 비중 0.3%에서 "
                f"{latest}년 {round(aqua_now / world * 100, 1)}% 가 됐다. 참치는 축양에 그치고 "
                "오징어는 양식이 사실상 0인 것과 대조된다."
            ),
            "주의": (
                "양식과 자연산은 종·지리·원가·계절성·리스크가 전부 다르다. 합쳐 「새우 생산량」으로 "
                "부르면 무엇이 늘었는지가 사라진다."
            ),
            "갱신방법": "python3 scripts/build_shrimp_industry_data.py",
        },
        "요약": {
            "기준연도": latest,
            "세계생산": round(world),
            "양식": round(aqua_now),
            "자연산": round(cap_now),
            "양식비중": round(aqua_now / world * 100, 1),
            "최대종": species[0]["종"],
            "최대종비중": species[0]["비중"],
            "한국생산": korea["합계"] if korea else None,
            "한국양식비중": korea["양식비중"] if korea else None,
            "한국순위": korea_rank,
        },
        "양식자연산추이": timeline,
        "종구성": species,
        "국가별": countries,
        "한국종구성": korea_species,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✅ {OUT_PATH} ({OUT_PATH.stat().st_size / 1024:,.0f} KB)")
    print(f"   {latest}년 세계 {round(world):,} t · 양식 {round(aqua_now / world * 100, 1)}% · 자연산 {round(cap_now / world * 100, 1)}%")
    print(f"   최대종 {species[0]['종']} {species[0]['비중']}%")
    if timeline:
        print(f"   양식 비중 {timeline[0]['연도']}년 {timeline[0]['양식비중']}% → {latest}년 {round(aqua_now / world * 100, 1)}%")
    if korea:
        print(f"   한국 {korea['합계']:,} t ({korea_rank}위) · 양식 비중 {korea['양식비중']}% — 세계와 뒤집혀 있다")


if __name__ == "__main__":
    main()
