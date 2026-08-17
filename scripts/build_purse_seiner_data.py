#!/usr/bin/env python3
"""선망선 DB 탭의 데이터를 5개 기구 등록부에서 다시 만든다.

기존 `data/purseSeinerData.ts` 의 155척 큐레이션은 등록부와 대조되지 않는 선박
(「Kumasi Explorer」 등)이 섞여 있었다 — 실제 가나 파노피 선단(선망 7척)은 한 척도
없으면서 등록부에 없는 이름이 들어 있었다. 그래서 손으로 만든 목록을 버리고
**등록부에서 선망선만 걸러 파생**한다. 재현 가능한 것만 화면에 올린다.

출력: public/data/tuna_purse_seiners_v1.json — 기존 패널 API 와 맞는 필드
      (name, imo, operator, gt, flag[영문 패널 표기], rfmos[]).
      IMO 는 등록부가 주는 경우(주로 ICCAT)에만 있다 — 검증이 아니라 등록부 전사다.

⚠ 개인 소유는 operator 'N/A' 로 눕힌다 (실명 금지 규율).

사용법:
    python3 scripts/build_purse_seiner_data.py
"""
from __future__ import annotations

import csv
import datetime
import json
import re
from pathlib import Path

BASE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/tuna/00_참치_관련자료/00_참치_자원·조업관리"
)
REGISTRY = BASE / "RFMO_선박등록부/2026-08-17"
WCPFC = REGISTRY / "WCPFC_RFV_all_2026-08-17.json"
IATTC = REGISTRY / "IATTC_RVR_all_2026-08-17.json"
ICCAT = REGISTRY / "ICCAT_vessels_active_2026-08-17.tsv"
IOTC = REGISTRY / "IOTC_active_vessels_20250228.xlsx"
CCSBT = BASE / "RFMO_어획통계_원본/all_vessels_2026-05-04.csv"
OUT = Path(__file__).resolve().parent.parent / "public/data/tuna_purse_seiners_v1.json"
AS_OF = datetime.date(2026, 8, 17)

# 패널이 쓰는 영문 선적 표기로 정규화한다 (FLAG_EMOJI·CONTINENT_MAP 키와 일치해야 한다)
FLAG_EN = {
    "EU (SPAIN)": "Spain", "SPAIN (EU)": "Spain", "FRANCE (EU)": "France",
    "ITALY (EU)": "Italy", "GIN": "Guinea", "SYR": "Syria",
    "KOREA (REPUBLIC OF)": "South Korea", "REPUBLIC OF KOREA": "South Korea",
    "KOREA": "South Korea", "KOR": "South Korea", "KOREA REPUBLIC OF": "South Korea",
    "CHINESE TAIPEI": "Chinese Taipei", "FISHING ENTITY OF TAIWAN": "Chinese Taipei",
    "TAI": "Chinese Taipei", "TWN": "Chinese Taipei", "TAIWAN,PROVINCE OF CHINA": "Chinese Taipei",
    "CHINA": "China", "CHN": "China", "JAPAN": "Japan", "JPN": "Japan",
    "SPAIN": "Spain", "ESP": "Spain", "FRANCE": "France", "FRA": "France",
    "ECUADOR": "Ecuador", "ECU": "Ecuador", "MEXICO": "Mexico", "MEX": "Mexico",
    "SEYCHELLES": "Seychelles", "SYC": "Seychelles", "MAURITIUS": "Mauritius", "MUS": "Mauritius",
    "IRAN": "Iran", "IRAN (ISLAMIC REPUBLIC OF)": "Iran", "IRN": "Iran",
    "INDONESIA": "Indonesia", "IDN": "Indonesia", "PHILIPPINES": "Philippines", "PHL": "Philippines",
    "THAILAND": "Thailand", "THA": "Thailand", "GHANA": "Ghana", "GHA": "Ghana",
    "COLOMBIA": "Colombia", "COL": "Colombia", "PANAMA": "Panama", "PAN": "Panama",
    "ITALY": "Italy", "ITA": "Italy", "OMAN": "Oman", "OMN": "Oman",
    "KENYA": "Kenya", "KEN": "Kenya", "TANZANIA": "Tanzania", "TZA": "Tanzania",
    "VENEZUELA": "Venezuela", "VEN": "Venezuela", "TURKEY": "Turkey", "TÜRKIYE": "Turkey", "TUR": "Turkey",
    "SENEGAL": "Senegal", "SEN": "Senegal", "BRAZIL": "Brazil", "BRA": "Brazil",
    "COTE D'IVOIRE": "Côte d'Ivoire", "CÔTE D'IVOIRE": "Côte d'Ivoire", "CIV": "Côte d'Ivoire",
    "MICRONESIA (FEDERATED STATES OF)": "FSM (Micronesia)",
    "FEDERATED STATES OF MICRONESIA": "FSM (Micronesia)", "FSM": "FSM (Micronesia)",
    "MARSHALL ISLANDS": "Marshall Islands", "MHL": "Marshall Islands",
    "PAPUA NEW GUINEA": "Papua New Guinea", "PNG": "Papua New Guinea",
    "SOLOMON ISLANDS": "Solomon Islands", "SLB": "Solomon Islands",
    "KIRIBATI": "Kiribati", "KIR": "Kiribati", "VANUATU": "Vanuatu", "VUT": "Vanuatu",
    "TUVALU": "Tuvalu", "NAURU": "Nauru", "COOK ISLANDS": "Cook Islands",
    "EL SALVADOR": "El Salvador", "SLV": "El Salvador",
    "GUATEMALA": "Guatemala", "GTM": "Guatemala", "NICARAGUA": "Nicaragua", "NIC": "Nicaragua",
    "UNITED STATES OF AMERICA": "United States", "USA": "United States", "UNITED STATES": "United States",
    "PERU": "Peru", "PER": "Peru", "PORTUGAL": "Portugal", "PRT": "Portugal",
    "CURACAO": "Curaçao", "CURAÇAO": "Curaçao", "CUW": "Curaçao",
    "BELIZE": "Belize", "BLZ": "Belize", "CAPE VERDE": "Cape Verde", "CABO VERDE": "Cape Verde", "CPV": "Cape Verde",
    "SAINT VINCENT AND THE GRENADINES": "St. Vincent", "VCT": "St. Vincent",
    "MOROCCO": "Morocco", "MAR": "Morocco", "ALGERIA": "Algeria", "DZA": "Algeria",
    "TUNISIA": "Tunisia", "TUN": "Tunisia", "LIBYA": "Libya", "LBY": "Libya",
    "EGYPT": "Egypt", "EGY": "Egypt", "GABON": "Gabon", "GAB": "Gabon",
    "MALTA": "Malta", "MLT": "Malta", "CROATIA": "Croatia", "HRV": "Croatia",
    "GREECE": "Greece", "GRC": "Greece", "CYPRUS": "Cyprus", "CYP": "Cyprus",
    "ALBANIA": "Albania", "ALB": "Albania", "NORWAY": "Norway", "NOR": "Norway",
    "RUSSIA": "Russia", "RUSSIAN FEDERATION": "Russia", "RUS": "Russia",
    "AUSTRALIA": "Australia", "AUS": "Australia", "NEW ZEALAND": "New Zealand", "NZL": "New Zealand",
    "SOUTH AFRICA": "South Africa", "ZAF": "South Africa",
    "SRI LANKA": "Sri Lanka", "LKA": "Sri Lanka", "MALDIVES": "Maldives", "MDV": "Maldives",
    "INDIA": "India", "IND": "India", "MADAGASCAR": "Madagascar", "MDG": "Madagascar",
    "MOZAMBIQUE": "Mozambique", "MOZ": "Mozambique",
    "VIET NAM": "Vietnam", "VIETNAM": "Vietnam", "VNM": "Vietnam",
    "LIBERIA": "Liberia", "LBR": "Liberia", "BAHAMAS": "Bahamas", "BHS": "Bahamas",
    "HONDURAS": "Honduras", "HND": "Honduras", "COSTA RICA": "Costa Rica", "CRI": "Costa Rica",
    "BOLIVIA": "Bolivia", "BOL": "Bolivia", "GUYANA": "Guyana", "GUY": "Guyana",
    "FIJI": "Fiji", "FJI": "Fiji", "SAMOA": "Samoa", "WSM": "Samoa", "TONGA": "Tonga",
    "NEW CALEDONIA": "New Caledonia", "FRENCH POLYNESIA": "French Polynesia",
}

CORPORATE_WORDS = re.compile(
    r"\b(CO|LTD|LTDA|LIMITED|LIMITADA|INC|INCORPORATED|CORP|CORPORATION|COMPANY|"
    r"SA|SL|SRL|LLC|PLC|PTY|PTE|LDA|SCA|CIA|HNOS|HERMANOS|GMBH|AG|KG|BV|NV|AB|AS|APS|OY|"
    r"KFT|SNC|GIE|EURL|PT|SDN|BHD|ENTERPRISE|ENTERPRISES|INDUSTRIAL|INDUSTRIES|"
    r"INTERNATIONAL|GROUP|GRUPO|HOLDING|HOLDINGS|SHIPPING|MARINE|FISHERY|FISHERIES|FISHING|"
    r"SEAFOOD|SEAFOODS|PESCA|PESQUERA|PESQ|ARMADORA|ARMEMENT|NAVIERA|COOPERATIVE|COOP|"
    r"TRADING|PRODUCTS|OCEAN|PACIFIC|ATLANTIC|GLOBAL|TUNA|VENTURES|SP)\b"
)
CORPORATE_SUBSTRINGS = ("KAISHA", "KAISYA", "GAISHA", "GAISYA", "KABUSHIKI", "GYOGYO", "SUISAN")


def operator_of(name: str | None) -> str:
    text = (name or "").strip().replace("&AMP;", "&").replace("&amp;", "&")
    if not text or text in {"-", "N/A", "NA"}:
        return "N/A"
    upper = re.sub(r"[.,()]", " ", text.upper())
    if any(m in upper for m in CORPORATE_SUBSTRINGS) or CORPORATE_WORDS.search(upper):
        return text
    return "N/A"  # 개인 추정 — 실명 금지


def flag_en(raw: str | None, warn: set[str]) -> str:
    text = (raw or "").strip()
    key = text.upper()
    if key.startswith("EU-"):
        return FLAG_EN.get(key[3:], text)
    hit = FLAG_EN.get(key)
    if hit:
        return hit
    warn.add(text)
    return text.title()


def to_int(value) -> int | None:
    try:
        number = float(str(value).replace(",", "").strip())
        return round(number) if number > 0 else None
    except (TypeError, ValueError):
        return None


def is_purse(text: str | None) -> bool:
    t = (text or "").upper()
    return "PURSE" in t or t in {"PS", "PS1", "PS2", "SP", "SB"}


def main() -> None:
    warn: set[str] = set()
    merged: dict[str, dict] = {}

    def add(name: str, flag_raw: str | None, rfmo: str, owner: str | None,
            gt, imo: str = "") -> None:
        vessel = (name or "").strip()
        if not vessel:
            return
        flag = flag_en(flag_raw, warn)
        key = re.sub(r"[^A-Z0-9]", "", vessel.upper()) + "|" + flag
        entry = merged.setdefault(key, {
            "name": vessel.title() if vessel.isupper() else vessel,
            "imo": "", "operator": "N/A", "gt": None, "flag": flag, "rfmos": [],
        })
        if rfmo not in entry["rfmos"]:
            entry["rfmos"].append(rfmo)
        if not entry["imo"] and imo:
            entry["imo"] = imo
        if entry["operator"] == "N/A":
            entry["operator"] = operator_of(owner)
        if entry["gt"] is None:
            entry["gt"] = to_int(gt)

    doc = json.loads(WCPFC.read_text(encoding="utf-8"))
    for r in doc.get("vessels", []):
        if is_purse(r.get("type")):
            m = re.search(r"([\d,.]+)", r.get("tonnage") or "")
            add(r.get("name"), r.get("flag"), "WCPFC", r.get("owner"), m.group(1) if m else None)

    doc = json.loads(IATTC.read_text(encoding="utf-8"))
    for r in (doc.get("vessels") or []):
        if is_purse(r.get("gear")):
            add(r.get("name"), r.get("flag"), "IATTC", r.get("owner") or r.get("operator"), r.get("gt"))

    with open(ICCAT, encoding="latin-1", errors="replace") as handle:
        for r in csv.DictReader(handle, delimiter="\t"):
            if is_purse(r.get("IsscfgCode")):
                imo = (r.get("IntRegNo") or "").strip() if (r.get("IRNoTypeCode") or "").strip().upper() == "IMO" else ""
                add(r.get("VesselName"), r.get("FlagVesCode"), "ICCAT", r.get("OwName") or r.get("OpName"),
                    r.get("Tonnage"), imo)

    import openpyxl

    book = openpyxl.load_workbook(IOTC, read_only=True)
    sheet = book["Active_Vessels"]
    stream = sheet.iter_rows(values_only=True)
    header = [str(h) if h is not None else "" for h in next(stream)]
    rows = [dict(zip(header, r)) for r in stream]
    latest = max(int(y) for r in rows if str(y := r.get("Year_Active")).isdigit())
    for r in rows:
        if str(r.get("Year_Active")) == str(latest) and is_purse(str(r.get("Type_Gear") or "")):
            imo = str(r.get("IMO_no") or "").strip()
            add(str(r.get("Name_Ship") or ""), str(r.get("Flag") or "").replace("_", " "), "IOTC",
                str(r.get("Name_Owner") or ""), r.get("GT") or r.get("GRT"),
                imo if imo.isdigit() else "")

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
            if end and end >= AS_OF and is_purse(r.get("Gear Type") or r.get("Vessel Type")):
                imo = (r.get("IMO") or "").strip()
                add(r.get("Vessel Name"), r.get("Flag"), "CCSBT", r.get("Owner Name"),
                    r.get("Tonnage"), imo if imo.isdigit() else "")

    vessels = sorted(merged.values(), key=lambda v: (-(v["gt"] or 0), v["name"]))
    payload = {
        "_meta": {
            "생성일": "2026-08-17",
            "출처": "5개 지역수산관리기구 등록부에서 선망선만 파생 (아카이브 2026-08-17)",
            "주의": (
                "손으로 만든 이전 155척 목록은 등록부와 대조되지 않는 선박이 섞여 있어 폐기했다. "
                "이 목록은 등록부 전사라 재현 가능하다. IMO 는 등록부가 주는 경우에만 있고 "
                "(주로 대서양·인도양), 개인 소유는 N/A 로 눕혔다. 같은 배가 여러 기구에 "
                "등록되면 한 행으로 합치고 rfmos 에 나열했다."
            ),
            "척수": len(vessels),
            "다중기구": sum(1 for v in vessels if len(v["rfmos"]) >= 2),
            "갱신방법": "python3 scripts/build_purse_seiner_data.py",
        },
        "vessels": vessels,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"✅ {OUT} ({OUT.stat().st_size/1e6:.2f} MB)")
    print(f"   선망선 {len(vessels):,}척 · 다중 기구 {payload['_meta']['다중기구']}척 · IMO 보유 {sum(1 for v in vessels if v['imo'])}척")
    gh = [v for v in vessels if v["flag"] == "Ghana"]
    print(f"   가나 {len(gh)}척: " + ", ".join(v["name"] for v in gh[:10]))
    if warn:
        print(f"   ⚠ 선적 미매핑 {len(warn)}종: {sorted(warn)[:8]}")


if __name__ == "__main__":
    main()
