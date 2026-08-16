#!/usr/bin/env python3
"""FAO FishStat 원본에서 「시장 이해 > 참치」 페이지용 경량 집계 JSON을 만든다.

원본은 175,253행(1950~2022, 국가×어종×FAO해역×연도)이라 그대로 커밋할 수 없다(L-08).
여기서 집계해 public/data/tuna_industry_v1.json 한 개(<1MB)만 남긴다.

원본 위치는 Google Drive 아카이브다. 드라이브가 없는 환경(CI·Vercel 빌드)에서는
이 스크립트를 돌리지 않는다 — 산출 JSON이 저장소에 커밋돼 있기 때문이다.
데이터를 갱신할 때만 로컬에서 수동 실행한다.

사용법:
    python3 scripts/build_tuna_industry_data.py [--source <FishStat 추출 폴더>]
"""
from __future__ import annotations

import argparse
import collections
import csv
import json
import sys
from pathlib import Path

DEFAULT_SOURCE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/tuna/00_참치_관련자료/10_원본데이터셋/01_FAO_FishStat_추출"
)
OUT_PATH = Path(__file__).resolve().parent.parent / "public/data/tuna_industry_v1.json"

# ── 주요 상업어종(principal market tunas) ─────────────────────────────
# ISSF·FAO가 시장 통계에서 쓰는 7종. 가다랑어·황다랑어·눈다랑어·날개다랑어 + 참다랑어 3종.
# FishStat의 "tuna and tuna-like species" 66종에는 삼치·새치류가 섞여 있어 시장 규모를
# 과대계상한다. 페이지 전체를 이 7종 바스켓으로 통일한다.
PRINCIPAL_TUNAS = ["SKJ", "YFT", "BET", "ALB", "BFT", "PBF", "SBF"]

SPECIES_KO = {
    "SKJ": "가다랑어",
    "YFT": "황다랑어",
    "BET": "눈다랑어",
    "ALB": "날개다랑어",
    "BFT": "대서양참다랑어",
    "PBF": "태평양참다랑어",
    "SBF": "남방참다랑어",
}

# 어종별 주 용도. 통조림/사시미 분기를 설명하는 축이다.
SPECIES_USE = {
    "SKJ": "통조림",
    "YFT": "통조림·사시미",
    "BET": "사시미",
    "ALB": "통조림(화이트미트)",
    "BFT": "사시미",
    "PBF": "사시미",
    "SBF": "사시미",
}

# ── FAO 주요어업해역 → 한글명 + 관할 RFMO ────────────────────────────
# CCSBT는 해역이 아니라 어종(남방참다랑어) 기준 관할이므로 이 표에 넣지 않는다.
AREA_META = {
    "21": ("북서대서양", "ICCAT"),
    "27": ("북동대서양", "ICCAT"),
    "31": ("중서대서양", "ICCAT"),
    "34": ("중동대서양", "ICCAT"),
    "37": ("지중해·흑해", "ICCAT"),
    "41": ("남서대서양", "ICCAT"),
    "47": ("남동대서양", "ICCAT"),
    "51": ("서인도양", "IOTC"),
    "57": ("동인도양", "IOTC"),
    "61": ("북서태평양", "WCPFC"),
    "67": ("북동태평양", "IATTC"),
    "71": ("서·중부태평양", "WCPFC"),
    "77": ("중동태평양", "IATTC"),
    "81": ("남서태평양", "WCPFC"),
    "87": ("남동태평양", "IATTC"),
    "88": ("남극태평양", "CCAMLR"),
    "48": ("남극대서양", "CCAMLR"),
    "58": ("남극인도양", "CCAMLR"),
}

RFMO_KO = {
    "WCPFC": "중서부태평양수산위원회",
    "IATTC": "전미열대참치위원회",
    "IOTC": "인도양참치위원회",
    "ICCAT": "대서양참치보존위원회",
    "CCSBT": "남방참다랑어보존위원회",
    "CCAMLR": "남극해양생물자원보존위원회",
}

# ── 국가 한글명 ──────────────────────────────────────────────────────
# FAO 원본은 영문이다. 화면 노출 문자열은 100% 한글이어야 하므로(L-01)
# 여기서 미리 한글화한다. 상위 40개국을 덮으면 실질 100%가 된다.
COUNTRY_KO = {
    "Indonesia": "인도네시아",
    "Taiwan Province of China": "대만",
    "Japan": "일본",
    "Ecuador": "에콰도르",
    "Republic of Korea": "대한민국",
    "Spain": "스페인",
    "Papua New Guinea": "파푸아뉴기니",
    "Kiribati": "키리바시",
    "Micronesia (Federated States of)": "미크로네시아",
    "Maldives": "몰디브",
    "Philippines": "필리핀",
    "Mexico": "멕시코",
    "Seychelles": "세이셸",
    "United States of America": "미국",
    "France": "프랑스",
    "China": "중국",
    "Iran (Islamic Republic of)": "이란",
    "Panama": "파나마",
    "Ghana": "가나",
    "Nauru": "나우루",
    "Viet Nam": "베트남",
    "Marshall Islands": "마셜제도",
    "Vanuatu": "바누아투",
    "Oman": "오만",
    "Sri Lanka": "스리랑카",
    "India": "인도",
    "Solomon Islands": "솔로몬제도",
    "Tuvalu": "투발루",
    "Thailand": "태국",
    "Malaysia": "말레이시아",
    "Australia": "호주",
    "New Zealand": "뉴질랜드",
    "Fiji": "피지",
    "Senegal": "세네갈",
    "Côte d'Ivoire": "코트디부아르",
    "Cote d'Ivoire": "코트디부아르",
    "Yemen": "예멘",
    "Pakistan": "파키스탄",
    "Portugal": "포르투갈",
    "Italy": "이탈리아",
    "Türkiye": "튀르키예",
    "Turkey": "튀르키예",
    "Brazil": "브라질",
    "Venezuela (Bolivarian Republic of)": "베네수엘라",
    "El Salvador": "엘살바도르",
    "Colombia": "콜롬비아",
    "Peru": "페루",
    "Morocco": "모로코",
    "Tunisia": "튀니지",
    "Cabo Verde": "카보베르데",
    "Mauritius": "모리셔스",
    "Madagascar": "마다가스카르",
    "Mozambique": "모잠비크",
    "Comoros": "코모로",
    "Bangladesh": "방글라데시",
    "Myanmar": "미얀마",
    "Cambodia": "캄보디아",
    "Russian Federation": "러시아",
    "Ukraine": "우크라이나",
    "Belize": "벨리즈",
    "Curaçao": "퀴라소",
    "Cook Islands": "쿡제도",
    "Tokelau": "토켈라우",
    "Samoa": "사모아",
    "Tonga": "통가",
    "Palau": "팔라우",
    "Guatemala": "과테말라",
    "Nicaragua": "니카라과",
    "Costa Rica": "코스타리카",
    "Honduras": "온두라스",
    "Dominican Republic": "도미니카공화국",
    "Saint Vincent and the Grenadines": "세인트빈센트그레나딘",
    "Sierra Leone": "시에라리온",
    "Liberia": "라이베리아",
    "Nigeria": "나이지리아",
    "Angola": "앙골라",
    "Namibia": "나미비아",
    "South Africa": "남아프리카공화국",
    "Saint Helena": "세인트헬레나",
    "Mauritania": "모리타니",
    "Guinea": "기니",
    "Sao Tome and Principe": "상투메프린시페",
    "Congo": "콩고",
    "Gabon": "가봉",
    "Cameroon": "카메룬",
    "Benin": "베냉",
    "Togo": "토고",
    "Algeria": "알제리",
    "Libya": "리비아",
    "Egypt": "이집트",
    "Malta": "몰타",
    "Greece": "그리스",
    "Croatia": "크로아티아",
    "Cyprus": "키프로스",
    "Israel": "이스라엘",
    "Lebanon": "레바논",
    "Syrian Arab Republic": "시리아",
    "Georgia": "조지아",
    "Romania": "루마니아",
    "Bulgaria": "불가리아",
    "United Kingdom of Great Britain and Northern Ireland": "영국",
    "Ireland": "아일랜드",
    "Netherlands (Kingdom of the)": "네덜란드",
    "Germany": "독일",
    "Denmark": "덴마크",
    "Norway": "노르웨이",
    "Sweden": "스웨덴",
    "Iceland": "아이슬란드",
    "Canada": "캐나다",
    "Chile": "칠레",
    "Argentina": "아르헨티나",
    "Uruguay": "우루과이",
    "Saint Kitts and Nevis": "세인트키츠네비스",
    "Grenada": "그레나다",
    "Barbados": "바베이도스",
    "Trinidad and Tobago": "트리니다드토바고",
    "Jamaica": "자메이카",
    "Bahamas": "바하마",
    "Cuba": "쿠바",
    "Haiti": "아이티",
    "Guyana": "가이아나",
    "Suriname": "수리남",
    "Bermuda": "버뮤다",
    "French Polynesia": "프랑스령폴리네시아",
    "New Caledonia": "누벨칼레도니",
    "Wallis and Futuna Islands": "왈리스푸투나",
    "Niue": "니우에",
    "Nauru ": "나우루",
    "Timor-Leste": "동티모르",
    "Brunei Darussalam": "브루나이",
    "Singapore": "싱가포르",
    "Hong Kong": "홍콩",
    "China, Hong Kong SAR": "홍콩",
    "China, Macao SAR": "마카오",
    "Democratic People's Republic of Korea": "북한",
    "United Republic of Tanzania": "탄자니아",
    "Kenya": "케냐",
    "Somalia": "소말리아",
    "Djibouti": "지부티",
    "Eritrea": "에리트레아",
    "Sudan": "수단",
    "Saudi Arabia": "사우디아라비아",
    "United Arab Emirates": "아랍에미리트",
    "Qatar": "카타르",
    "Bahrain": "바레인",
    "Kuwait": "쿠웨이트",
    "Iraq": "이라크",
    "Jordan": "요르단",
    "Guam": "괌",
    "American Samoa": "미국령사모아",
    "Northern Mariana Islands": "북마리아나제도",
    "Puerto Rico": "푸에르토리코",
    "Faroe Islands": "페로제도",
    "Greenland": "그린란드",
    "Poland": "폴란드",
    "Latvia": "라트비아",
    "Lithuania": "리투아니아",
    "Estonia": "에스토니아",
    "Finland": "핀란드",
    "Belgium": "벨기에",
    "Other nei": "기타",
}


def load_lookup(source: Path) -> tuple[dict[str, str], dict[str, str]]:
    """FAO 코드 참조표에서 어종·국가 영문명을 읽는다."""
    species: dict[str, str] = {}
    with open(source / "CL_FI_SPECIES_GROUPS.csv", encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            species[row["3A_Code"]] = row["Name_En"]
    countries: dict[str, str] = {}
    with open(source / "CL_FI_COUNTRY_GROUPS.csv", encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            countries[row["UN_Code"].zfill(3)] = row["Name_En"]
    return species, countries


def korean_country(name_en: str) -> str:
    """영문 국가명을 한글로. 매핑에 없으면 원문을 남기고 호출부가 경고한다."""
    return COUNTRY_KO.get(name_en.strip(), name_en.strip())


def build(source: Path) -> dict:
    _species_en, countries_en = load_lookup(source)

    capture_csv = source / "FishStat_Capture_tuna_66species.csv"
    with open(capture_csv, encoding="utf-8-sig") as handle:
        rows = [r for r in csv.DictReader(handle) if r["SPECIES.ALPHA_3_CODE"] in PRINCIPAL_TUNAS]

    if not rows:
        raise SystemExit("FishStat 원본에서 주요 상업어종 행을 찾지 못했다 — 원본 경로를 확인하라")

    years = sorted({int(r["PERIOD"]) for r in rows})
    latest = years[-1]

    # ── 어종 × 연도 시계열 (최근 20년) ──
    by_species_year: dict[int, dict[str, float]] = collections.defaultdict(
        lambda: collections.defaultdict(float)
    )
    for row in rows:
        by_species_year[int(row["PERIOD"])][row["SPECIES.ALPHA_3_CODE"]] += float(row["VALUE"] or 0)

    span = [y for y in years if y >= latest - 19]
    species_timeline = []
    for year in span:
        point: dict[str, object] = {"연도": str(year)}
        total = 0.0
        for code in PRINCIPAL_TUNAS:
            tons = round(by_species_year[year].get(code, 0.0))
            point[SPECIES_KO[code]] = tons
            total += tons
        point["합계"] = round(total)
        species_timeline.append(point)

    latest_rows = [r for r in rows if int(r["PERIOD"]) == latest]
    latest_total = sum(float(r["VALUE"] or 0) for r in latest_rows)

    # ── 어종 구성 ──
    species_share = []
    for code in PRINCIPAL_TUNAS:
        tons = by_species_year[latest].get(code, 0.0)
        species_share.append(
            {
                "어종": SPECIES_KO[code],
                "코드": code,
                "어획량": round(tons),
                "비중": round(tons / latest_total * 100, 2),
                "주용도": SPECIES_USE[code],
            }
        )
    species_share.sort(key=lambda item: item["어획량"], reverse=True)

    # ── 국가 구성 ──
    by_country: collections.Counter[str] = collections.Counter()
    for row in latest_rows:
        by_country[row["COUNTRY.UN_CODE"].zfill(3)] += float(row["VALUE"] or 0)

    unmapped: list[str] = []
    country_rank = []
    for code, tons in by_country.most_common(20):
        name_en = countries_en.get(code, code)
        name_ko = korean_country(name_en)
        if name_ko == name_en and name_en not in COUNTRY_KO:
            unmapped.append(name_en)
        country_rank.append(
            {
                "국가": name_ko,
                "어획량": round(tons),
                "비중": round(tons / latest_total * 100, 2),
            }
        )

    # ── 해역 구성 ──
    by_area: collections.Counter[str] = collections.Counter()
    for row in latest_rows:
        by_area[row["AREA.CODE"]] += float(row["VALUE"] or 0)

    area_rank = []
    for code, tons in by_area.most_common():
        name_ko, rfmo = AREA_META.get(code, (f"FAO {code}해역", "미분류"))
        area_rank.append(
            {
                "해역": name_ko,
                "코드": code,
                "관할": rfmo,
                "어획량": round(tons),
                "비중": round(tons / latest_total * 100, 2),
            }
        )

    # ── RFMO 관할별 합산 ──
    by_rfmo: collections.Counter[str] = collections.Counter()
    for entry in area_rank:
        by_rfmo[entry["관할"]] += entry["어획량"]
    rfmo_share = [
        {
            "관할": code,
            "한글명": RFMO_KO.get(code, code),
            "어획량": tons,
            "비중": round(tons / latest_total * 100, 2),
        }
        for code, tons in by_rfmo.most_common()
    ]

    # ── 한국 시계열 ──
    korea_code = next((c for c, n in countries_en.items() if n == "Republic of Korea"), None)
    korea_timeline = []
    if korea_code:
        korea_by_year: collections.Counter[int] = collections.Counter()
        world_by_year: collections.Counter[int] = collections.Counter()
        for row in rows:
            year = int(row["PERIOD"])
            value = float(row["VALUE"] or 0)
            world_by_year[year] += value
            if row["COUNTRY.UN_CODE"].zfill(3) == korea_code:
                korea_by_year[year] += value
        for year in span:
            world = world_by_year[year]
            korea_timeline.append(
                {
                    "연도": str(year),
                    "한국어획량": round(korea_by_year[year]),
                    "세계점유율": round(korea_by_year[year] / world * 100, 2) if world else 0,
                }
            )

    # 한국 어종 구성 — 선망(가다랑어 중심)과 연승(눈다랑어 중심)의 비중을 보여준다
    korea_species = []
    if korea_code:
        korea_latest = [r for r in latest_rows if r["COUNTRY.UN_CODE"].zfill(3) == korea_code]
        korea_total = sum(float(r["VALUE"] or 0) for r in korea_latest)
        agg: collections.Counter[str] = collections.Counter()
        for row in korea_latest:
            agg[row["SPECIES.ALPHA_3_CODE"]] += float(row["VALUE"] or 0)
        for code, tons in agg.most_common():
            korea_species.append(
                {
                    "어종": SPECIES_KO[code],
                    "어획량": round(tons),
                    "비중": round(tons / korea_total * 100, 2) if korea_total else 0,
                    "주용도": SPECIES_USE[code],
                }
            )

    if unmapped:
        print(f"⚠️  한글 미매핑 국가 {len(unmapped)}건: {', '.join(unmapped)}", file=sys.stderr)

    return {
        "_meta": {
            "생성일": "2026-08-16",
            "기준연도": latest,
            "바스켓": "주요 상업어종 7종 (가다랑어·황다랑어·눈다랑어·날개다랑어·참다랑어 3종)",
            "단위": "톤 (생물중량 기준, FAO MEASURE=Q_tlw)",
            "출처": "FAO FishStat 어획통계 (FishStat_Capture_tuna_66species.csv, 175,253행)",
            "출처경로": "agri_data/01_수산물(Seafood)/tuna/00_참치_관련자료/10_원본데이터셋/01_FAO_FishStat_추출",
            "주의": (
                "FishStat의 '참치·참치류 66종'에는 삼치·새치류가 포함돼 시장 규모를 과대계상한다. "
                "이 파일은 주요 상업어종 7종만 집계한 값이며, 66종 전체 기준 순위와 다르다."
            ),
            "갱신방법": "python3 scripts/build_tuna_industry_data.py",
        },
        "요약": {
            "기준연도": latest,
            "세계어획량": round(latest_total),
            "어종수": len(PRINCIPAL_TUNAS),
            "최대해역": area_rank[0]["해역"] if area_rank else None,
            "최대해역비중": area_rank[0]["비중"] if area_rank else None,
            "한국순위": next(
                (i + 1 for i, e in enumerate(country_rank) if e["국가"] == "대한민국"), None
            ),
            "한국어획량": next(
                (e["어획량"] for e in country_rank if e["국가"] == "대한민국"), None
            ),
        },
        "어종구성": species_share,
        "어종시계열": species_timeline,
        "국가순위": country_rank,
        "해역순위": area_rank,
        "관할별": rfmo_share,
        "한국시계열": korea_timeline,
        "한국어종구성": korea_species,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--out", type=Path, default=OUT_PATH)
    args = parser.parse_args()

    if not args.source.exists():
        raise SystemExit(
            f"FishStat 원본 폴더를 찾을 수 없다: {args.source}\n"
            "Google Drive 동기화 상태를 확인하라. 산출 JSON은 이미 커밋돼 있으므로 "
            "빌드에는 이 스크립트가 필요 없다."
        )

    payload = build(args.source)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    size_kb = args.out.stat().st_size / 1024
    print(f"✅ {args.out} ({size_kb:,.0f} KB)")
    print(f"   기준연도 {payload['요약']['기준연도']} · 세계 {payload['요약']['세계어획량']:,} 톤")
    print(f"   한국 {payload['요약']['한국순위']}위 · {payload['요약']['한국어획량']:,} 톤")


if __name__ == "__main__":
    main()
