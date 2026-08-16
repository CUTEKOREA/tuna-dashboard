#!/usr/bin/env python3
"""참치 **해역별 선사** 집계 — 어느 회사가 어느 바다에 배를 두는가.

선단 페이지에는 해역별 척수와 선적국까지만 있었다. 「어느 회사」가 빠져 있었다.
지역수산관리기구(RFMO)의 인가선박 등록부에는 소유사 이름이 붙어 있어 그걸로 채운다.

**다섯 기구 전부**다.
  · IOTC   — 인도양          (`Name_Owner`)
  · ICCAT  — 대서양          (`OwName`)
  · CCSBT  — 남방참다랑어    (`Owner Name`)
  · WCPFC  — 서·중부태평양   (상세페이지 `Vessel Owner Name(s)`)
  · IATTC  — 동부태평양      (상세 모달 `Owner(s) [registered]`)

뒤 둘은 처음에 실패했다. curl 로는 WCPFC 가 403, IATTC 는 표가 자바스크립트로 그려져
빈 페이지만 왔다. 브라우저 자동화로 다시 붙어 둘 다 받았다. 수집 방법은 아카이브 README 에 적었다.

⚠ **WCPFC·IATTC 파일은 한국 선적만 담았다.** 전체 등록부가 아니므로 그 둘의
   「소유사 수」·「상위5 집중도」는 세계 기준이 아니라 한국 기준이다. 산출물에 그렇게 표시한다.

⚠ 이 자료의 함정 넷. 넷 다 코드로 막는다.

  1. **기구 간 합산 금지.** 한 배가 두 기구에 동시 인가된 사례가 12% 수준이다.
     해역별 척수를 더하면 실제 선단보다 커진다. 이 스크립트는 합계를 내지 않는다.
  2. **표기가 흔들린다.** 같은 회사가 `DONGWON INDUSTRIES CO., LTD.` ·
     `Dongwon Industries Co., Ltd. `(뒤 공백) · `Dongwon Industires`(원본 오타)로 적혀 있다.
     정규화하지 않으면 한 회사가 셋으로 갈린다.
  3. **ICCAT 은 소유사 이름이 절반쯤 비어 있다.** 이름 있는 행만 세고 그 비율을 함께 낸다.
  4. **IOTC 는 연도 누적 파일이다.** `Year_Active` 로 최신 연도만 걸러야 한다.
     안 그러면 2008년 배가 지금 있는 것처럼 잡힌다.

사용법:
    python3 scripts/build_tuna_ocean_operators.py
"""
from __future__ import annotations

import collections
import csv
import datetime
import json
import re
import unicodedata
from pathlib import Path

BASE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/tuna/00_참치_관련자료/00_참치_자원·조업관리"
)
REGISTRY = BASE / "RFMO_선박등록부/2026-08-17"
IOTC = REGISTRY / "IOTC_active_vessels_20250228.xlsx"
ICCAT = REGISTRY / "ICCAT_vessels_active_2026-08-17.tsv"
CCSBT = BASE / "RFMO_어획통계_원본/all_vessels_2026-05-04.csv"
WCPFC = REGISTRY / "WCPFC_RFV_korea_2026-08-17.json"
IATTC = REGISTRY / "IATTC_RVR_korea_2026-08-17.json"

OUT_PATH = Path(__file__).resolve().parent.parent / "public/data/tuna_ocean_operators_v1.json"

# 등록부 기준일. 「지금」이 아니라 이 날짜로 유효한 인가를 센다.
AS_OF = datetime.date(2026, 8, 17)

# 회사 이름 정규화 — 접미사·구두점·표기 흔들림을 걷어낸다.
SUFFIX = re.compile(
    r"\b(CO|COMPANY|CORP|CORPORATION|LTD|LIMITED|INC|S\s?A|SA|SL|SRL|PTE|PTY|PLC|GMBH|BV|NV|AS)\b",
    re.I,
)

# 정규화만으로 안 붙는 것. 원본 오타와 상호 변경이 여기 들어간다.
ALIAS = {
    "DONGWON INDUSTIRES": "DONGWON INDUSTRIES",   # 원본 오타
    "DONG WON INDUSTRIES": "DONGWON INDUSTRIES",
    "DONG WON FISHERIES": "DONGWON FISHERIES",
    "DAE HAE FISHERIES": "DAEHAE FISHERIES",
    "JI SUNG SHIPPING": "JISUNG SHIPPING",
    "SAJO SEAFOOD": "SAJO SEAFOOD",
}

# 한글 상호. 화면에 영문 상호가 그대로 나가면 안 된다(L-01).
KO_NAME = {
    "DONGWON INDUSTRIES": "동원산업",
    "DONGWON FISHERIES": "동원수산",
    "SAJO INDUSTRIES": "사조산업",
    "SAJO SEAFOOD": "사조씨푸드",
    "GREEN WORLD": "그린월드",
    "BOYANG": "보양",
    "SILLA": "신라교역",
    "DAEHAE FISHERIES": "대해수산",
    "KYUNG YANG FISHERIES": "경양수산",
    "SEA SKY MULSAN": "씨스카이물산",
    "HANSUNG ENTERPRISE": "한성기업",
    "KHD KOREA": "케이에이치디코리아",
    "NAMGUNG TUNA": "남궁참치",
    "OYANG": "오양수산",
    "AGNES FISHERIES": "아그네스수산",
    "JISUNG SHIPPING": "지성해운",
    "SEIN SHIPPING": "세인해운",
}

# 기구마다 한국을 다르게 적는다. 하나라도 빠뜨리면 그 해역의 한국 선사가 0으로 나온다.
# ⚠ 법인이 아닌 **개인 소유자**는 실명을 기록하지 않는다.
#   등록부에는 `PARK, CHUNHWA` 처럼 개인명이 그대로 적혀 있는 행이 있다.
#   개인정보이므로 화면에도 산출물에도 남기지 않고 「개인 소유」 한 칸으로 모은다.
INDIVIDUAL_KEY = "개인 소유"


def is_individual(name: str) -> bool:
    """법인 표지가 없고 사람 이름 꼴이면 개인으로 본다.

    ⚠ **원표기로 판정해야 한다.** 접미사를 떼어낸 뒤에 보면 `SILLA CO., LTD` 가
      `SILLA` 가 되어 개인으로 잡힌다. 실제로 한 번 그렇게 잡혀 신라교역·그린월드가
      「개인 소유」로 뭉개졌다.

    회사명에는 거의 항상 CO/LTD/CORP/FISHERIES/SHIPPING 같은 말이 붙는다.
    그런 표지가 하나도 없고 세 낱말 이하이면 개인으로 본다.
    """
    text = (name or "").upper()
    marks = (
        "CO", "LTD", "CORP", "INC", "COMPANY", "FISHER", "FISHING", "SHIPPING",
        "SUSAN", "MULSAN", "ENTERPRISE", "INTERNATIONAL", "S.A", "SA", "PESQUER",
        "TUNA", "MARINE", "SEAFOOD", "INDUSTR", "TRADING", "GROUP", "HOLDING",
    )
    if any(m in text for m in marks):
        return False
    words = [w for w in re.split(r"[\s,]+", text) if w]
    return 1 <= len(words) <= 3


KOREAN_FLAGS = {
    "Republic of Korea",   # CCSBT
    "KOR",                 # ICCAT
    "Korea_Republic of",   # IOTC
    "Korea, Republic of",
    "Korea",
}


def normalize(name: str) -> str:
    """비교용 열쇠. 대소문자·구두점·법인 접미사를 걷어 같은 회사를 한 칸에 모은다."""
    if not name:
        return ""
    text = unicodedata.normalize("NFKC", name).upper()
    text = re.sub(r"[.,'’\"()]", " ", text)
    text = SUFFIX.sub(" ", text)
    text = re.sub(r"\s+", " ", text).strip()

    # ⚠ 별칭표에 있으면 무조건 법인이다. 원본 오타(`Dongwon Industires`)는 법인 표지가
    #   깨져 있어 개인 판정에 걸린다 — 실제로 한 번 그렇게 익명화됐다.
    if text in ALIAS:
        return ALIAS[text]
    if text in KO_NAME:
        return text

    # 개인 여부는 **접미사를 떼기 전** 원표기로 본다.
    # 떼고 나면 `SILLA CO., LTD` 가 `SILLA` 가 되어 개인으로 잡힌다.
    return INDIVIDUAL_KEY if is_individual(name) else text


def ko(name_key: str, fallback: str) -> str:
    """한글 상호가 있으면 그것을, 없으면 원본 표기를 쓴다.

    개인 소유자는 실명 대신 「개인 소유」로 나간다.
    """
    if name_key == INDIVIDUAL_KEY:
        return INDIVIDUAL_KEY
    return KO_NAME.get(name_key, fallback.strip())


def parse_ccsbt_date(value: str) -> datetime.date | None:
    try:
        return datetime.datetime.strptime((value or "").strip(), "%d %b %Y").date()
    except ValueError:
        return None


def read_ccsbt() -> tuple[list[tuple[str, str, str]], dict]:
    """(소유사키, 원표기, 선적) 목록. 기준일에 인가가 살아 있는 것만."""
    if not CCSBT.exists():
        raise SystemExit(f"원본을 찾을 수 없다: {CCSBT}")
    rows = list(csv.DictReader(open(CCSBT, encoding="utf-8-sig", errors="replace")))
    live = [r for r in rows if (d := parse_ccsbt_date(r["Authorisation End Date"])) and d >= AS_OF]
    out = [
        (normalize(r["Owner Name"]), (r["Owner Name"] or "").strip(), (r["Flag"] or "").strip())
        for r in live
    ]
    meta = {
        "기구": "CCSBT",
        "해역": "남방참다랑어",
        "기준": f"{AS_OF} 시점 인가 유효",
        "전체행": len(rows),
        "유효척수": len(live),
        "출처": "남방참다랑어보존위원회 승인선박 등록부",
        "등급": "A",
        "주의": "어종 단위 승인 목록이다. 참치 선단 전체가 아니라 남방참다랑어를 잡아도 되는 배들이다.",
    }
    return out, meta


def read_iccat() -> tuple[list[tuple[str, str, str]], dict]:
    if not ICCAT.exists():
        raise SystemExit(f"원본을 찾을 수 없다: {ICCAT}")
    rows = list(csv.DictReader(open(ICCAT, encoding="latin-1", errors="replace"), delimiter="\t"))
    named = [r for r in rows if (r.get("OwName") or "").strip()]
    out = [
        (normalize(r["OwName"]), r["OwName"].strip(), (r.get("FlagVesCode") or "").strip())
        for r in named
    ]
    meta = {
        "기구": "ICCAT",
        "해역": "대서양",
        "기준": "2026-08-17 내려받은 활성 목록",
        "전체행": len(rows),
        "유효척수": len(named),
        "소유사표기율": round(len(named) / len(rows) * 100, 1),
        "출처": "대서양참치보존위원회 선박기록부",
        "등급": "A",
        "주의": (
            f"전체 {len(rows):,}행 중 소유사 이름이 적힌 것은 {len(named):,}행"
            f"({round(len(named) / len(rows) * 100, 1)}%)뿐이다. 소유사 집계는 이 안에서만 유효하다."
        ),
    }
    return out, meta


def read_iotc() -> tuple[list[tuple[str, str, str]], dict]:
    if not IOTC.exists():
        raise SystemExit(f"원본을 찾을 수 없다: {IOTC}")
    import openpyxl

    book = openpyxl.load_workbook(IOTC, read_only=True)
    sheet = book["Active_Vessels"]
    stream = sheet.iter_rows(values_only=True)
    header = [str(h) if h is not None else "" for h in next(stream)]
    rows = [dict(zip(header, r)) for r in stream]

    years = [int(y) for r in rows if str(y := r.get("Year_Active")).isdigit()]
    latest = max(years)
    current = [r for r in rows if str(r.get("Year_Active")) == str(latest)]
    named = [r for r in current if str(r.get("Name_Owner") or "").strip()]
    out = [
        (
            normalize(str(r["Name_Owner"])),
            str(r["Name_Owner"]).strip(),
            str(r.get("Flag") or "").strip(),
        )
        for r in named
    ]
    meta = {
        "기구": "IOTC",
        "해역": "인도양",
        "기준": f"{latest}년 활성",
        "전체행": len(rows),
        "유효척수": len(named),
        "출처": "인도양참치위원회 활성선박 목록",
        "등급": "A",
        "주의": (
            f"원본은 연도 누적 파일이라 {len(rows):,}행이다. 최신 {latest}년만 걸러 "
            f"{len(current):,}척을 봤다. 걸르지 않으면 십몇 년 전 배가 지금 있는 것처럼 잡힌다."
        ),
    }
    return out, meta


def read_scraped(path, area, org, source, note) -> tuple[list[tuple[str, str, str]], dict]:
    """브라우저 자동화로 받은 한국 선적 전용 파일.

    ⚠ 전체 등록부가 아니라 **한국 선적만** 담겨 있다. 그래서 이 블록의
      「소유사 수」와 「상위5 집중도」는 세계 기준이 아니라 한국 기준이다.
    """
    if not path.exists():
        raise SystemExit(f"원본을 찾을 수 없다: {path}")
    payload = json.loads(path.read_text(encoding="utf-8"))
    rows = payload["vessels"]
    out = [
        (normalize(r.get("owner", "")), (r.get("owner") or "").strip(), "KOR")
        for r in rows
        if (r.get("owner") or "").strip()
    ]
    meta = {
        "기구": org,
        "해역": area,
        "기준": f"{payload.get('collected')} 수집",
        "전체행": payload.get("registerTotal", len(rows)),
        "유효척수": len(out),
        "출처": source,
        "등급": "A",
        "한국선적만": True,
        "주의": note,
    }
    return out, meta


def summarize(entries: list[tuple[str, str, str]], meta: dict) -> dict:
    """기구 하나의 소유사 집계. 상위 선사와 한국 선사를 따로 낸다."""
    counter = collections.Counter(key for key, _, _ in entries if key)
    display = {}
    for key, raw, _ in entries:
        display.setdefault(key, raw)

    total = sum(counter.values()) or 1
    top = [
        {
            "선사": ko(key, display[key]),
            "원표기": display[key] if key != INDIVIDUAL_KEY else "(개인 소유자 — 실명 미기록)",
            "척수": count,
            "비중": round(count / total * 100, 2),
        }
        for key, count in counter.most_common(10)
    ]

    korean = collections.Counter(
        key for key, _, flag in entries if key and flag in KOREAN_FLAGS
    )
    korea_rows = [
        {
            "_키": key,
            "선사": ko(key, display[key]),
            "원표기": display[key] if key != INDIVIDUAL_KEY else "(개인 소유자 — 실명 미기록)",
            "척수": count,
        }
        for key, count in korean.most_common()
    ]

    top5 = sum(count for _, count in counter.most_common(5))
    return {
        "_meta": {
            **meta,
            "소유사수": len(counter),
            "상위5집중도": round(top5 / total * 100, 2),
            "한국척수": sum(korean.values()),
        },
        "상위선사": top,
        "한국선사": korea_rows,
    }


def main() -> None:
    readers = [
        read_iotc,
        read_iccat,
        read_ccsbt,
        lambda: read_scraped(
            WCPFC,
            "서·중부태평양",
            "WCPFC",
            "중서부태평양수산위원회 어선기록부 (공개 열람)",
            "이 파일은 한국 선적만 담았다. 등록부 전체는 3,039척이고 그중 한국이 174척이다. "
            "소유사는 목록 표에 없고 선박별 상세 페이지에만 있다.",
        ),
        lambda: read_scraped(
            IATTC,
            "동부태평양",
            "IATTC",
            "미주열대참치위원회 지역선박등록부 (공개 열람)",
            "이 파일은 한국 선적만 담았다. 등록부 전체는 4,725척이고 그중 한국이 101척이다. "
            "소유사는 목록에 없고 선박별 상세에만 있다.",
        ),
    ]
    oceans = {}
    for reader in readers:
        entries, meta = reader()
        oceans[str(meta["해역"])] = summarize(entries, meta)

    # 한국 선사 해역 교차표 — 어느 회사가 어느 바다에 있는가.
    # ⚠ 행 합계를 「그 회사 총 선단」으로 읽으면 안 된다. 한 배가 두 기구에 인가될 수 있고,
    #   받지 못한 두 기구(서·중부태평양·동부태평양)가 빠져 있다.
    # ⚠ 표시명이 아니라 **정규화 키**로 묶는다. 같은 회사가 등록부마다 다르게 적혀 있어
    #   표시명으로 묶으면 한 회사가 여러 줄로 갈린다(SNB International 사례).
    areas = list(oceans)
    keys: list[str] = []
    label: dict[str, str] = {}
    for area in areas:
        for row in oceans[area]["한국선사"]:
            key = row["_키"]
            if key not in keys:
                keys.append(key)
            # 한글 상호가 잡힌 표기를 우선한다
            if key not in label or (not re.search(r"[가-힣]", label[key]) and re.search(r"[가-힣]", row["선사"])):
                label[key] = row["선사"]
    # 한글 상호를 확인한 회사만 이름으로 내보낸다.
    # 영문 상호를 임의로 음역하면 등록되지 않은 이름이 화면에 나가므로, 확인 못 한 곳은
    # 「그 밖의 선사」로 모은다(L-01). 해역별 상세 블록에는 원표기가 그대로 남아 있다.
    OTHERS = "그 밖의 선사"
    matrix_map: dict[str, dict] = {}
    other_keys: set[str] = set()
    for key in keys:
        name = label[key]
        named = bool(re.search(r"[가-힣]", name))
        bucket = name if named else OTHERS
        if not named:
            other_keys.add(key)
        row = matrix_map.setdefault(bucket, {"선사": bucket, **{a: 0 for a in areas}})
        for area in areas:
            hit = next((r for r in oceans[area]["한국선사"] if r["_키"] == key), None)
            if hit:
                row[area] += hit["척수"]
    matrix = list(matrix_map.values())
    matrix.sort(
        key=lambda r: (r["선사"] in (OTHERS, INDIVIDUAL_KEY), -sum(v for k, v in r.items() if k != "선사"))
    )

    payload = {
        "_meta": {
            "생성일": "2026-08-17",
            "주제": "참치 해역별 선사 — 어느 회사가 어느 바다에 배를 두는가",
            "확보": (
                "다섯 기구 전부 — 인도양(IOTC) · 대서양(ICCAT) · 남방참다랑어(CCSBT) · "
                "서·중부태평양(WCPFC) · 동부태평양(IATTC)"
            ),
            "수집주의": (
                "서·중부태평양과 동부태평양은 목록에 소유사가 없어 선박별 상세를 하나씩 확인했고 "
                "**한국 선적만** 담았다. 그래서 두 해역의 「소유사 수」와 「상위5 집중도」는 "
                "세계 기준이 아니라 한국 기준이라, 앞의 세 해역과 나란히 비교하면 안 된다."
            ),
            "합산금지": (
                "해역별 척수를 더하지 마라. 한 배가 두 기구에 동시 인가된 사례가 12% 수준이고, "
                "받지 못한 두 기구가 빠져 있어 어느 쪽으로도 실제 선단과 맞지 않는다."
            ),
            "개인정보": (
                "법인이 아닌 개인 소유자는 실명을 기록하지 않는다. 등록부에 개인명이 적힌 행은 "
                "「개인 소유」 한 칸으로 모았고 원표기도 남기지 않았다."
            ),
            "정규화": (
                "같은 회사가 등록부마다 다르게 적혀 있다(뒤 공백·법인 접미사·원본 오타). "
                "대소문자·구두점·접미사를 걷어 한 칸에 모았고, 오타는 별칭표로 따로 이었다."
            ),
            "갱신방법": "python3 scripts/build_tuna_ocean_operators.py",
        },
        "해역": oceans,
        "한국선사해역": {
            "_meta": {
                "해역목록": areas,
                "그밖의선사": (
                    f"한글 상호를 확인하지 못한 {len(other_keys)}개사를 「그 밖의 선사」로 모았다. "
                    "영문 상호를 임의로 음역하면 등록되지 않은 이름이 화면에 나간다. "
                    "원표기는 해역별 상세에 그대로 있다."
                ),
                "주의": (
                    "행을 더해 「그 회사의 총 선단」으로 읽으면 안 된다. 중복 인가가 있고 "
                    "서·중부태평양·동부태평양이 빠져 있다. 공시 기준 선단 규모는 조업 단계 자료를 보라."
                ),
            },
            "rows": matrix,
        },
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✅ {OUT_PATH} ({OUT_PATH.stat().st_size / 1024:,.0f} KB)")
    for area, data in oceans.items():
        m = data["_meta"]
        print(
            f"   {area:10} {m['유효척수']:>6,}척 · 소유사 {m['소유사수']:,}개 · "
            f"상위5 {m['상위5집중도']}% · 한국 {m['한국척수']}척"
        )
    print("   한국 선사 해역 분포 (더하지 않는다):")
    for row in matrix:
        cells = " · ".join(f"{a} {row[a]}" for a in areas if row[a])
        print(f"     {row['선사']:10} {cells}")


if __name__ == "__main__":
    main()
