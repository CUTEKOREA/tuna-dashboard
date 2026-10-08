#!/usr/bin/env python3
"""참치(5개 기구)·오징어(남태평양) 선박 단위 선단 DB 를 아카이브 등록부에서 만든다.

집계가 아니라 **선박 한 척이 한 행**이다. 화면의 선단 탐색기가 이 파일을 런타임에
받아 필터·검색한다 (정적 import 로 번들에 넣기엔 크다 — 그래서 fetch 다).

⚠ 개인(자연인) 소유·운영자는 실명을 남기지 않는다 — 「개인 소유」로 묶는다.
⚠ 기구마다 기준이 다르다. 같은 배가 여러 기구에 등록될 수 있으므로 **행 합계는
  실제 척수가 아니다**. 화면에도 이 경고를 실어야 한다.
⚠ ICCAT 은 20m 미만 소형선까지 담아 행이 많다(레저 낚시선 포함). 선종 코드로
  구분해 내보내되 걸러내지 않는다 — 무엇을 뺐는지 설명할 수 없는 필터는 두지 않는다.

사용법:
    python3 scripts/build_fleet_db.py
"""
from __future__ import annotations

import csv
import datetime
import json
import re
from pathlib import Path

BASE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)"
)
TUNA = BASE / "tuna/00_참치_관련자료/00_참치_자원·조업관리"
REGISTRY = TUNA / "RFMO_선박등록부/2026-08-17"
WCPFC = REGISTRY / "WCPFC_RFV_all_2026-08-17.json"
IATTC = REGISTRY / "IATTC_RVR_all_2026-08-17.json"
ICCAT = REGISTRY / "ICCAT_vessels_active_2026-08-17.tsv"
IOTC = REGISTRY / "IOTC_active_vessels_20250228.xlsx"
CCSBT = TUNA / "RFMO_어획통계_원본/all_vessels_2026-05-04.csv"
SPRFMO = (
    BASE / "squid/00_오징어_관련자료/01_생산·자원"
    "/SPRFMO_ROV/2026-08-17/SPRFMO_ROV_all_2026-08-17.csv"
)
NPFC_DIR = BASE / "squid/00_오징어_관련자료/01_생산·자원/NPFC_등록부/2026-08-17"
NPFC_VESSELS = NPFC_DIR / "npfc_vessels.csv"
NPFC_AUTH = NPFC_DIR / "npfc_auth.csv"

OUT_DIR = Path(__file__).resolve().parent.parent / "public/data"
AS_OF = datetime.date(2026, 8, 17)

# ── 개인 판별 ──
#
# 규율: 개인 실명은 절대 기록하지 않는다. **법인 표지가 단어 단위로 잡히지 않으면
# 전부 「개인 소유(추정)」이다** — 표지 없는 소규모 법인 몇을 잃는 비용이
# 개인정보 노출보다 싸다.
#
# 처음 두 번의 시도가 남긴 교훈:
#  1. 확실한 인명 패턴만 개인 처리 → 모로코·이란 소형선 개인 실명 1만 행이 남았다.
#  2. 부분 일치 표지(" CO"·" AB") → CORBIN·ABDELKADER 같은 인명을 법인으로 오판했다.
# 그래서 표지는 **단어 경계**로만 잡고, 붙여 쓰는 표지(KAISHA 등)만 부분 일치를 쓴다.
CORPORATE_WORDS = re.compile(
    r"\b(CO|LTD|LTDA|LIMITED|LIMITADA|INC|INCORPORATED|CORP|CORPORATION|COMPANY|"
    r"SA|S\.A|SL|S\.L|SRL|S\.R\.L|LLC|PLC|PTY|PTE|LDA|SCA|S\.C\.A|CIA|HNOS|HERMANOS|"
    r"GMBH|AG|KG|BV|B\.V|NV|N\.V|AB|AS|A/S|APS|OY|EHF|HF|KFT|SNC|GIE|EURL|EIRL|E\.I\.R\.L|"
    r"PT|SDN|BHD|ENTERPRISE|ENTERPRISES|INDUSTRIAL|INDUSTRIES|INTERNATIONAL|GROUP|GRUPO|"
    r"HOLDING|HOLDINGS|SHIPPING|MARINE|FISHERY|FISHERIES|FISHING|SEAFOOD|SEAFOODS|"
    r"PESCA|PESQUERA|PESQ|ARMADORA|ARMEMENT|NAVIERA|COOPERATIVE|COOP|TRADING|PRODUCTS|"
    r"OCEAN|PACIFIC|ATLANTIC|GLOBAL|TUNA|CONSTRUCTION|VENTURES|CORPORATIVO|"
    r"SP|Z\s?O\.?O)\b"
)
CORPORATE_SUBSTRINGS = ("KAISHA", "KAISYA", "GAISHA", "GAISYA", "KABUSHIKI", "GYOGYO",
                        "SUISAN", "협회", "수산", "조합", "산업", "교역")


def clean_owner(name: str | None) -> str | None:
    text = (name or "").strip().replace("&AMP;", "&").replace("&amp;", "&")
    if not text or text in {"-", "N/A", "NA"}:
        return None
    upper = re.sub(r"[.,()]", " ", text.upper())
    if any(mark in upper for mark in CORPORATE_SUBSTRINGS):
        return text
    if CORPORATE_WORDS.search(upper):
        return text
    return "개인 소유(추정)"


# ── 선적 한글 ──
FLAG_KO = {
    "UK-SHN": "세인트헬레나(영국령)",
    "KOREA REPUBLIC OF": "대한민국", "LITHUANIA": "리투아니아", "LTU": "리투아니아",
    "EU (PORTUGAL)": "포르투갈(EU)", "EU (SPAIN)": "스페인(EU)",
    "FRANCE (EU)": "프랑스(EU)", "ITALY (EU)": "이탈리아(EU)",
    "PORTUGAL (EU)": "포르투갈(EU)", "SPAIN (EU)": "스페인(EU)",
    "FRA (FRENCH POLYNESIA)": "프랑스령폴리네시아", "UK (FALKLAND ISLANDS)": "포클랜드",
    # 이름 표기
    "KOREA (REPUBLIC OF)": "대한민국", "REPUBLIC OF KOREA": "대한민국", "KOREA": "대한민국",
    "SOUTH KOREA": "대한민국", "KOREA_REPUBLIC OF": "대한민국",
    "JAPAN": "일본", "CHINA": "중국", "CHINESE TAIPEI": "대만",
    "FISHING ENTITY OF TAIWAN": "대만", "TAIWAN,PROVINCE OF CHINA": "대만",
    "PHILIPPINES": "필리핀", "INDONESIA": "인도네시아", "PANAMA": "파나마",
    "VANUATU": "바누아투", "BAHAMAS": "바하마", "LIBERIA": "라이베리아",
    "UNITED STATES OF AMERICA": "미국", "USA": "미국", "UNITED STATES": "미국",
    "NEW ZEALAND": "뉴질랜드", "AUSTRALIA": "호주", "SPAIN": "스페인",
    "PORTUGAL": "포르투갈", "FRANCE": "프랑스", "SOUTH AFRICA": "남아공",
    "ECUADOR": "에콰도르", "PERU": "페루", "CHILE": "칠레", "MEXICO": "멕시코",
    "VENEZUELA": "베네수엘라", "COLOMBIA": "콜롬비아", "NICARAGUA": "니카라과",
    "GUATEMALA": "과테말라", "EL SALVADOR": "엘살바도르", "COSTA RICA": "코스타리카",
    "BELIZE": "벨리즈", "HONDURAS": "온두라스", "CURACAO": "퀴라소", "CURAÇAO": "퀴라소",
    "SEYCHELLES": "세이셸", "MAURITIUS": "모리셔스", "MALDIVES": "몰디브",
    "SRI LANKA": "스리랑카", "INDIA": "인도", "IRAN": "이란",
    "IRAN (ISLAMIC REPUBLIC OF)": "이란", "OMAN": "오만", "KENYA": "케냐",
    "TANZANIA": "탄자니아", "MADAGASCAR": "마다가스카르", "MOZAMBIQUE": "모잠비크",
    "THAILAND": "태국", "VIET NAM": "베트남", "VIETNAM": "베트남",
    "MALAYSIA": "말레이시아", "SINGAPORE": "싱가포르",
    "PAPUA NEW GUINEA": "파푸아뉴기니", "SOLOMON ISLANDS": "솔로몬제도",
    "KIRIBATI": "키리바시", "TUVALU": "투발루", "NAURU": "나우루",
    "MARSHALL ISLANDS": "마셜제도", "MICRONESIA (FEDERATED STATES OF)": "미크로네시아",
    "FEDERATED STATES OF MICRONESIA": "미크로네시아", "FIJI": "피지",
    "COOK ISLANDS": "쿡제도", "SAMOA": "사모아", "TONGA": "통가",
    "NEW CALEDONIA": "누벨칼레도니", "FRENCH POLYNESIA": "프랑스령폴리네시아",
    "RUSSIA": "러시아", "RUSSIAN FEDERATION": "러시아", "NORWAY": "노르웨이",
    "UNITED KINGDOM": "영국", "FALKLAND ISLANDS": "포클랜드",
    "SAINT VINCENT AND THE GRENADINES": "세인트빈센트그레나딘",
    "SAINT KITTS AND NEVIS": "세인트키츠네비스", "BRAZIL": "브라질",
    "URUGUAY": "우루과이", "ARGENTINA": "아르헨티나", "GHANA": "가나",
    "SENEGAL": "세네갈", "CABO VERDE": "카보베르데", "CAPE VERDE": "카보베르데",
    "COTE D'IVOIRE": "코트디부아르", "CÔTE D'IVOIRE": "코트디부아르",
    "MOROCCO": "모로코", "TUNISIA": "튀니지", "ALGERIA": "알제리",
    "TURKEY": "튀르키예", "TÜRKIYE": "튀르키예", "EGYPT": "이집트",
    "LIBYA": "리비아", "GABON": "가봉", "ANGOLA": "앙골라", "NAMIBIA": "나미비아",
    "GUINEA": "기니", "SIERRA LEONE": "시에라리온", "NIGERIA": "나이지리아",
    "CAMEROON": "카메룬", "SAO TOME AND PRINCIPE": "상투메프린시페",
    "CANADA": "캐나다", "ITALY": "이탈리아", "GREECE": "그리스", "MALTA": "몰타",
    "CYPRUS": "키프로스", "CROATIA": "크로아티아", "IRELAND": "아일랜드",
    "NETHERLANDS": "네덜란드", "GERMANY": "독일", "POLAND": "폴란드",
    "ISRAEL": "이스라엘", "SYRIA": "시리아", "LEBANON": "레바논", "ALBANIA": "알바니아",
    "BARBADOS": "바베이도스", "TRINIDAD AND TOBAGO": "트리니다드토바고",
    "GRENADA": "그레나다", "GUYANA": "가이아나", "SURINAME": "수리남",
    # ISO3 (ICCAT)
    "KOR": "대한민국", "JPN": "일본", "CHN": "중국", "TAI": "대만", "TWN": "대만",
    "MAR": "모로코", "TUN": "튀니지", "DZA": "알제리", "TUR": "튀르키예",
    "NOR": "노르웨이", "ZAF": "남아공", "BRA": "브라질", "URY": "우루과이",
    "VEN": "베네수엘라", "MEX": "멕시코", "CAN": "캐나다", "GBR": "영국",
    "RUS": "러시아", "SEN": "세네갈", "GHA": "가나", "CIV": "코트디부아르",
    "CPV": "카보베르데", "GAB": "가봉", "AGO": "앙골라", "NAM": "나미비아",
    "EGY": "이집트", "LBY": "리비아", "SYR": "시리아", "LBN": "레바논",
    "ISR": "이스라엘", "ALB": "알바니아", "PAN": "파나마", "BLZ": "벨리즈",
    "CUW": "퀴라소", "SLV": "엘살바도르", "GTM": "과테말라", "HND": "온두라스",
    "NIC": "니카라과", "CRI": "코스타리카", "ECU": "에콰도르", "PER": "페루",
    "CHL": "칠레", "COL": "콜롬비아", "BOL": "볼리비아", "VCT": "세인트빈센트그레나딘",
    "KNA": "세인트키츠네비스", "BRB": "바베이도스", "TTO": "트리니다드토바고",
    "GRD": "그레나다", "GUY": "가이아나", "SUR": "수리남", "SLE": "시에라리온",
    "GIN": "기니", "NGA": "나이지리아", "CMR": "카메룬", "STP": "상투메프린시페",
    "GNQ": "적도기니", "COG": "콩고", "VUT": "바누아투", "PHL": "필리핀",
    "IDN": "인도네시아", "THA": "태국", "VNM": "베트남", "MYS": "말레이시아",
    "SGP": "싱가포르", "LKA": "스리랑카", "MDV": "몰디브", "IND": "인도",
    "IRN": "이란", "OMN": "오만", "KEN": "케냐", "TZA": "탄자니아",
    "MDG": "마다가스카르", "MOZ": "모잠비크", "SYC": "세이셸", "MUS": "모리셔스",
    "AUS": "호주", "NZL": "뉴질랜드", "USA_": "미국", "FRA": "프랑스", "ESP": "스페인",
    "PRT": "포르투갈", "ITA": "이탈리아", "GRC": "그리스", "MLT": "몰타",
    "CYP": "키프로스", "HRV": "크로아티아", "IRL": "아일랜드", "NLD": "네덜란드",
    "DEU": "독일", "POL": "폴란드", "LBR": "라이베리아", "BHS": "바하마",
    "FSM": "미크로네시아", "KIR": "키리바시", "MHL": "마셜제도", "PNG": "파푸아뉴기니",
    "SLB": "솔로몬제도", "FJI": "피지", "COK": "쿡제도", "WSM": "사모아", "TON": "통가",
}


def ko_flag(raw: str | None, warn: set[str]) -> str:
    text = (raw or "").strip()
    if not text:
        return "미상"
    key = text.upper()
    if key.startswith("EU-"):
        inner = FLAG_KO.get(key[3:])
        return f"{inner}(EU)" if inner else text
    hit = FLAG_KO.get(key)
    if hit:
        return hit
    warn.add(text)
    return text


# ── 어법·선종 한글 ──
GEAR_KO = {
    "FACTORY MOTHERSHIP (HSF)": "공모선", "TW": "트롤", "UN": "미지정", "UNCL": "미분류", "STERN": "선미식 트롤",
    "LHM": "기계식 손낚시", "LL,BB": "연승·채낚기", "LL,TROL": "연승·끌낚시",
    "MULT": "다목적", "MWT": "중층 트롤", "NK": "미지정", "SB": "선망(소형)",
    "TROL": "끌낚시", "TROL,MWT": "끌낚시·트롤", "HARVESTING MACHINES": "기계식 채취",
    "PS1": "선망(단선)", "PS2": "선망(쌍선)", "SPR": "그 밖", "SUR": "미지정",
    "12.0.0 - FISH CARRIERS": "운반선", "99.0.0 - NON-FISHING VESSELS NEI": "비조업선",
    "DRIFTING LONGLINE": "연승(흘림)", "FREEZER LONGLINER": "냉동 연승",
    "BOTTOM TRAWLS": "저층 트롤", "BOTTOM TRAWLS (NOT SPECIFIED)": "저층 트롤",
    "MIDWATER TRAWLS": "중층 트롤", "MIDWATER TRAWLS (NOT SPECIFIED)": "중층 트롤",
    "FISHERY TRAINING VESSEL": "실습선", "BB,RR": "채낚기류",
    "FIXED GILLNETS (NO STAKES)": "고정 자망", "FPN": "정치망",
    "HAND LINES AND HAND-OPERATED POLE-AND-LINES": "손줄낚시",
    "MECHANIZED LINES AND POLE-AND-LINES": "기계식 채낚기",
    "SQUID JIGGER": "오징어 채낚기", "JIG": "채낚기", "JIGGING": "채낚기",
    # 이름 표기 (WCPFC·CCSBT·IATTC·IOTC·SPRFMO)
    "TUNA LONGLINER": "참치 연승", "LONGLINER": "연승", "LONGLINE": "연승",
    "TUNA PURSE SEINER": "참치 선망", "PURSE SEINER": "선망", "PURSE SEINE": "선망",
    "POLE AND LINE": "채낚기(장대)", "TROLLER": "끌낚시", "TROLL": "끌낚시",
    "FISH CARRIER": "운반선", "TRANSHIPMENT/CARRIER VESSELS": "운반선",
    "BUNKER": "급유선", "SUPPORT VESSEL": "지원선", "FISHERY RESEARCH VESSEL": "조사선",
    "MULTI-PURPOSE": "다목적", "MULTI": "다목적", "OTHER LINERS": "그 밖 낚시류",
    "GILL NETTERS": "자망", "GILLNET": "자망", "TRAWLER": "트롤", "TRAWL": "트롤",
    "BAIT BOAT": "채낚기(미끼)", "HANDLINE": "손낚시", "HARPOON": "작살",
    "RECREATIONAL FISHING": "레저 낚시",
    # ICCAT ISSCFG 코드
    "LL": "연승", "LLS": "표층 연승", "LLD": "심해 연승", "PS": "선망",
    "BB": "채낚기(미끼)", "TB": "채낚기(미끼)", "LHP": "손낚시", "LX": "낚시류",
    "LTL": "끌낚시", "RG": "레저 낚시", "NAP": "미지정", "TM": "중층 트롤",
    "MIS": "그 밖", "GN": "자망", "HAR": "작살", "TX": "트롤", "SV": "지원선",
}


# 표기 변형이 수십 종이라 정확 일치 뒤에 부분 일치 규칙을 둔다. 순서가 판정이다 —
# 「Hand line and pole and line」은 손낚시보다 채낚기가 먼저 잡히면 안 되므로 HAND 를 앞에 둔다.
GEAR_PATTERNS = [
    ("LONGLIN", "연승"), ("PURSE", "선망"), ("TRAWL", "트롤"),
    ("GILL", "자망"), ("GNS", "자망"), ("GND", "자망(흘림)"),
    ("HAND", "손낚시"), ("POLE", "채낚기"), ("JIG", "채낚기"), ("BAIT", "채낚기(미끼)"),
    ("TROLL", "끌낚시"), ("HARPOON", "작살"), ("CARRIER", "운반선"), ("REEFER", "운반선"),
    ("BUNKER", "급유선"), ("SUPPORT", "지원선"), ("RESEARCH", "조사선"),
    ("TRAINING", "실습선"), ("RECREATION", "레저 낚시"), ("SPORT", "레저 낚시"),
    ("TRAP", "함정어구"), ("POT", "통발"), ("SEINE", "선망류"), ("LINE", "낚시류"),
    ("NOT KNOWN", "미지정"), ("NOT SPECIFIED", "미지정"), ("UNKNOWN", "미지정"),
    ("MULTI", "다목적"), ("NET", "그물류"),
]


def ko_gear(raw: str | None, warn: set[str]) -> str:
    text = (raw or "").strip()
    if not text:
        return "미지정"
    upper = text.upper()
    hit = GEAR_KO.get(upper)
    if hit:
        return hit
    for token, name in GEAR_PATTERNS:
        if token in upper:
            return name
    warn.add(text)
    return text


def to_int(value) -> int | None:
    try:
        number = float(str(value).replace(",", "").strip())
        return round(number) if number > 0 else None
    except (TypeError, ValueError):
        return None


def iccat_length_m(value) -> float | None:
    """ICCAT LOAm의 유럽식 소수점 쉼표를 미터 소수로 보존한다."""
    try:
        text = str(value).strip().replace(" ", "")
        number = float(text.replace(",", "."))
        return round(number, 2) if number > 0 else None
    except (TypeError, ValueError):
        return None


def tonnage_from_text(text: str | None) -> int | None:
    m = re.search(r"([\d,.]+)", text or "")
    return to_int(m.group(1)) if m else None


def main() -> None:  # noqa: C901 — 등록부 5개를 그대로 다루는 함수라 길다
    for path in (WCPFC, IATTC, ICCAT, IOTC, CCSBT, SPRFMO, NPFC_VESSELS, NPFC_AUTH):
        if not path.exists():
            raise SystemExit(f"원본을 찾을 수 없다: {path}")

    flag_warn: set[str] = set()
    gear_warn: set[str] = set()
    rows_tuna: list[dict] = []

    # ── WCPFC (서·중부태평양) ──
    doc = json.loads(WCPFC.read_text(encoding="utf-8"))
    for r in doc.get("vessels", []):
        auth_end = (r.get("auth") or "").split(" - ")[-1].strip() or None
        rows_tuna.append({
            "o": "WCPFC", "n": (r.get("name") or "").strip(),
            "f": ko_flag(r.get("flag"), flag_warn),
            "g": ko_gear(r.get("type"), gear_warn),
            "t": tonnage_from_text(r.get("tonnage")),
            "y": to_int(r.get("built")),
            "l": None,
            "w": clean_owner(r.get("owner")),
            "p": None,
            "h": (r.get("port") or "").strip() or None,
            "e": auth_end,
        })

    # ── IATTC (동태평양) ──
    doc = json.loads(IATTC.read_text(encoding="utf-8"))
    for r in (doc.get("vessels") or doc.get("rows") or []):
        rows_tuna.append({
            "o": "IATTC", "n": (r.get("name") or "").strip(),
            "f": ko_flag(r.get("flag"), flag_warn),
            "g": ko_gear(r.get("gear"), gear_warn),
            "t": to_int(r.get("gt")),
            "y": to_int(r.get("built")),
            "l": to_int(r.get("loa")),
            "w": clean_owner(r.get("owner")),
            "p": clean_owner(r.get("operator")),
            "h": (r.get("port") or "").strip() or None,
            "e": None,
        })

    # ── ICCAT (대서양) ──
    with open(ICCAT, encoding="latin-1", errors="replace") as handle:
        for r in csv.DictReader(handle, delimiter="\t"):
            rows_tuna.append({
                "o": "ICCAT", "n": (r.get("VesselName") or "").strip(),
                "f": ko_flag(r.get("FlagVesCode"), flag_warn),
                "g": ko_gear(r.get("IsscfgCode"), gear_warn),
                "t": to_int(r.get("Tonnage")),
                "y": to_int(r.get("YearBuilt")),
                "l": iccat_length_m(r.get("LOAm")),
                "w": clean_owner(r.get("OwName")),
                "p": clean_owner(r.get("OpName")),
                "h": (r.get("HomePort") or "").strip() or None,
                "e": None,
            })

    # ── IOTC (인도양) — 연도 누적이라 최신 연도만 ──
    import openpyxl

    book = openpyxl.load_workbook(IOTC, read_only=True)
    sheet = book["Active_Vessels"]
    stream = sheet.iter_rows(values_only=True)
    header = [str(h) if h is not None else "" for h in next(stream)]
    iotc_rows = [dict(zip(header, r)) for r in stream]
    latest = max(int(y) for r in iotc_rows if str(y := r.get("Year_Active")).isdigit())
    for r in iotc_rows:
        if str(r.get("Year_Active")) != str(latest):
            continue
        rows_tuna.append({
            "o": "IOTC", "n": str(r.get("Name_Ship") or "").strip(),
            "f": ko_flag(str(r.get("Flag") or "").replace("_", " "), flag_warn),
            "g": ko_gear(str(r.get("Type_Gear") or ""), gear_warn),
            "t": to_int(r.get("GT")) or to_int(r.get("GRT")),
            "y": None,
            "l": to_int(r.get("LOA")),
            "w": clean_owner(str(r.get("Name_Owner") or "")),
            "p": clean_owner(str(r.get("Name_Operator") or "")),
            "h": None,
            "e": f"{latest}년 활성",
        })

    # ── CCSBT (남방참다랑어) — 기준일에 인가가 살아 있는 것만 ──
    def ccsbt_date(text: str) -> datetime.date | None:
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%b-%Y", "%d %b %Y"):
            try:
                return datetime.datetime.strptime((text or "").strip(), fmt).date()
            except ValueError:
                continue
        return None

    with open(CCSBT, encoding="utf-8-sig", errors="replace") as handle:
        for r in csv.DictReader(handle):
            end = ccsbt_date(r.get("Authorisation End Date") or "")
            if not end or end < AS_OF:
                continue
            rows_tuna.append({
                "o": "CCSBT", "n": (r.get("Vessel Name") or "").strip(),
                "f": ko_flag(r.get("Flag"), flag_warn),
                "g": ko_gear(r.get("Gear Type") or r.get("Vessel Type"), gear_warn),
                "t": to_int(r.get("Tonnage")),
                "y": None,
                "l": to_int(r.get("Length")),
                "w": clean_owner(r.get("Owner Name")),
                "p": None,
                "h": None,
                "e": (r.get("Authorisation End Date") or "").strip() or None,
            })

    # ── 한국 선박 소유사 보완 — 원양산업 통계연보 2024년말 명부 대조 ──
    #
    # 남태평양 등록부는 소유사를 공개하지 않는다. 한국 선적 51척 중 연보 명부와
    # 선명·건조년이 맞아떨어지는 조업선은 회사를 채운다 (진수년월·톤수 교차 확인,
    # 2026-08-17 수기 대조). 세인쉬핑 계열 대형 운반선(SEIN KASAMA 등)과 DHARA·
    # NOEL·JOCHOH·SOHOH 는 연보(조업선 명부) 밖이라 그대로 빈칸이다.
    KOFA_OWNER = {
        "101 HAE RANG": "동신어업", "AGNES 101": "아그네스수산", "AGNES 102": "아그네스수산",
        "AGNES 103": "아그네스수산", "AGNES 107": "아그네스수산", "AGNES 108": "아그네스수산",
        "AGNES 109": "정일산업", "AGNES 110": "아그네스수산",
        "BLUE OCEAN": "티엔에스산업", "GREENSTAR": "티엔에스산업", "KINGSTAR": "티엔에스산업",
        "SUNSTAR": "티엔에스산업", "CM PARK": "홍진실업", "DREAM PARK": "홍진실업",
        "NO. 103 BADA": "동원해사랑", "NO. 601 DAGAH": "피에이아이", "NO.103 KUMYANG": "가나마린",
        "NO.5 DONG IL": "경태", "NO.7 DONG IL": "경태", "NO.7 DAE YANG": "신해피셔리",
        "No.101 EUN HAE": "선민수산", "No.107 EUN HAE": "선민수산", "No.109 EUN HAE": "선민수산",
        "No.108 EUN HAE": "현원수산", "No.27 HAE IN": "해인수산", "No.801 SEUNG JIN": "승진수산",
        "No.805 TONG YOUNG": "동원해사랑", "No.808 TONG YOUNG": "동원해사랑",
        "SAE IN CHAMPION": "정일산업", "SAE IN LEADER": "정일산업",
        "SAE IN No.1": "정일산업", "SAE IN No.3": "정일산업", "SAE IN No.5": "정일산업",
        "SAE IN No.7": "정일산업", "SAE IN No.9": "정일산업",
        "SKY MAX 101": "씨맥스피셔리", "SEJONG": "동원산업",
    }

    # ── 오징어: SPRFMO (남태평양 공해) ──
    rows_squid: list[dict] = []
    with open(SPRFMO, encoding="utf-8-sig", errors="replace") as handle:
        for r in csv.DictReader(handle):
            rows_squid.append({
                "o": "SPRFMO", "n": (r.get("Vessel Name") or "").strip(),
                "f": ko_flag(r.get("Vessel Flag"), flag_warn),
                "g": ko_gear((r.get("Fishing Methods") or "").split(";")[0].split("-")[-1].strip()
                             or r.get("Vessel Type"), gear_warn),
                "t": to_int(r.get("Gross Tonnage")) or to_int(r.get("Gross Register Tonnage")),
                "y": to_int(r.get("When Built")),
                "l": to_int(r.get("Length")),
                "w": (
                    f"{KOFA_OWNER[(r.get('Vessel Name') or '').strip()]} — 연보 대조"
                    if (r.get("Vessel Name") or "").strip() in KOFA_OWNER else None
                ),  # 등록부는 소유사 미공개 — 한국 조업선만 연보 명부로 보완
                "p": None,
                "h": (r.get("Port of Registry") or "").strip() or None,
                "e": (r.get("Vessel Authorisation End Date") or "").strip() or None,
            })

    legend = {
        "o": "기구", "n": "선명", "f": "선적", "g": "선종·어법", "t": "총톤수",
        "y": "건조년", "l": "전장(m)", "w": "소유사", "p": "운영사", "h": "등록항",
        "e": "인가·비고",
    }

    tuna_payload = {
        "_meta": {
            "생성일": "2026-08-17",
            "출처": "5개 지역수산관리기구 등록부 (아카이브 2026-08-17 수집)",
            "등급": "A",
            "키": legend,
            "행수": len(rows_tuna),
            "주의": (
                "같은 배가 여러 기구에 등록될 수 있어 행 합계는 실제 척수가 아니다. "
                "ICCAT 은 20m 미만 소형·레저 낚시선까지 담아 행이 많다. "
                "IOTC 는 최신 활성 연도 기준이고 건조년이 없다. "
                "법인 표지가 없는 소유·운영자는 실명 보호를 위해 「개인 소유(추정)」으로 묶었다 - 표지 없는 소규모 법인이 일부 섞일 수 있다."
            ),
            "기구별": {},
            "갱신방법": "python3 scripts/build_fleet_db.py",
        },
        "rows": rows_tuna,
    }
    counts: dict[str, int] = {}
    for r in rows_tuna:
        counts[r["o"]] = counts.get(r["o"], 0) + 1
    tuna_payload["_meta"]["기구별"] = counts

    # ── 오징어: NPFC (북태평양) — 기준일에 인가가 살아 있는 오징어(OFJ·SQJ) 선박 ──
    with open(NPFC_AUTH, encoding="utf-8-sig", errors="replace") as handle:
        live_squid_ids = {
            a["npfc_vessel_id"]
            for a in csv.DictReader(handle)
            if ("OFJ" in a["target_species"] or "SQJ" in a["target_species"])
            and (a["authorization_end"] or "9999") >= AS_OF.isoformat()
        }
    with open(NPFC_VESSELS, encoding="utf-8-sig", errors="replace") as handle:
        for r in csv.DictReader(handle):
            if r["npfc_vessel_id"] not in live_squid_ids:
                continue
            rows_squid.append({
                "o": "NPFC", "n": (r.get("vessel_name") or "").strip(),
                "f": ko_flag(r.get("flag_state"), flag_warn),
                "g": ko_gear((r.get("type_of_fishing_method") or "").split(",")[0].split("(")[0].strip()
                             or r.get("vessel_type"), gear_warn),
                "t": to_int(r.get("tonnage")),
                "y": None,  # 이 등록부는 건조년을 싣지 않는다
                "l": to_int(r.get("length")),
                "w": None,  # 소유사 열 자체가 없다
                "p": None,
                "h": (r.get("port_of_registry") or "").strip() or None,
                "e": "빨강·살오징어 인가 유효",
            })

    squid_payload = {
        "_meta": {
            "생성일": "2026-08-17",
            "출처": "남태평양 공해 관리기구 + 북태평양수산위원회(NPFC) 공개 등록부 (아카이브 2026-08-17)",
            "등급": "A",
            "키": legend,
            "행수": len(rows_squid),
            "주의": (
                "이 등록부는 소유사를 공개하지 않는다. 한국 조업선은 원양산업 통계연보 2024년말 "
                "명부와 선명·건조년을 대조해 회사를 보완했다(「— 연보 대조」 표기). 나머지 빈칸은 "
                "결측이 아니라 등록부의 한계다 — 북태평양(NPFC) 등록부도 소유사·건조년이 없다. "
                "아르헨티나·포클랜드는 국가 관할이라 여기 없다. "
                "한국 연근해 개별 선박 명부도 공개 등록부가 없다."
            ),
            "갱신방법": "python3 scripts/build_fleet_db.py",
        },
        "rows": rows_squid,
    }

    for name, payload in (("tuna_fleet_db_v1.json", tuna_payload), ("squid_fleet_db_v1.json", squid_payload)):
        out = OUT_DIR / name
        out.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        print(f"✅ {out} ({out.stat().st_size/1e6:.2f} MB, {payload['_meta']['행수']:,}행)")
    print("   참치 기구별:", counts)
    if flag_warn:
        print(f"   ⚠ 선적 미매핑 {len(flag_warn)}종: {sorted(flag_warn)[:10]}")
    if gear_warn:
        print(f"   ⚠ 어법 미매핑 {len(gear_warn)}종: {sorted(gear_warn)[:10]}")


if __name__ == "__main__":
    main()
