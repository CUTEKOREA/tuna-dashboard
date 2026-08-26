#!/usr/bin/env python3
"""PANOFI 주간동향 docx -> public/data/panofi/panofi_weekly.json

원자료: Google Drive 신라그룹/11_Panofi_Cosmo_GGL /11. PANOFI/Panofi/PANOFI 주간동향/PANOFI 주간동향YYYYMMDD.docx
docx 는 라벨-값 표 구조가 31주 내내 안정적이다. 섹션 제목은 주마다 흔들리므로
(운항정보 / 금어기 중 선박 동향 / 선박 동향) 위치가 아니라 **라벨**로 잡는다.

파싱 실패는 조용히 넘기지 않는다 — 필드별 커버리지를 stderr 로 보고해
포맷이 바뀐 주차를 즉시 드러낸다.
"""
from __future__ import annotations

import json
import os
import re
import sys
import unicodedata
import zipfile
from datetime import date
from hashlib import sha256
from pathlib import Path

# 원자료가 2026-08 Google Drive 로 이관되고 주간동향은 전용 하위폴더로 모였다.
SRC_DIR = Path(
    os.environ.get(
        "PANOFI_SRC",
        str(
            Path.home()
            / "Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/신라그룹"
            / "11_Panofi_Cosmo_GGL /11. PANOFI/Panofi/PANOFI 주간동향"
        ),
    )
)
OUT = Path(__file__).resolve().parents[1] / "public/data/panofi/panofi_weekly.json"

# 자사 선망선. 주간동향은 P/QUEEN·P/GRACE 로 쓰고 전략보고는 P/QUE·P/GRA 로 줄인다.
VESSELS = {
    "P/QUEEN": "P/QUE",
    "P/GRACE": "P/GRA",
    "P/FORE": "P/FORE",
    "P/DIS": "P/DIS",
    "P/MAS": "P/MAS",
    "P/PATH": "P/PATH",
    "P/COMM": "P/COMM",
}
PROCESSORS = ["COSMO", "PFC", "SCODI", "SCASA", "AIRONE"]


def docx_text(path: Path) -> str:
    """표 셀을 탭, 행을 개행으로 살려 평문화한다."""
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml").decode("utf8")
    xml = re.sub(r"</w:p>", "\n", xml)
    xml = re.sub(r"</w:tc>", "\t", xml)
    xml = re.sub(r"</w:tr>", "\n", xml)
    text = re.sub(r"<[^>]+>", "", xml)
    text = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    return re.sub(r"[  ]+", " ", text)


def num(s: str | None) -> float | None:
    if not s:
        return None
    s = s.replace(",", "").strip()
    m = re.search(r"-?\d+(?:\.\d+)?", s)
    return float(m.group()) if m else None


def section(text: str, start: str, *stops: str) -> str:
    """start 라벨부터 다음 stop 라벨 직전까지."""
    i = text.find(start)
    if i < 0:
        return ""
    rest = text[i + len(start):]
    end = len(rest)
    for stop in stops:
        j = rest.find(stop)
        if 0 <= j < end:
            end = j
    return rest[:end]


def parse_temps(text: str) -> dict:
    """수온 연안/대양 범위와 조류 방향."""
    out = {"coastalMin": None, "coastalMax": None, "oceanMin": None, "oceanMax": None,
           "coastalCurrent": None, "oceanCurrent": None}
    blk = section(text, "어장상황", "조업선 동향", "어가동향")
    pairs = re.findall(r"(\d+\.\d+)\s*~\s*(\d+\.\d+)\s*℃", blk)
    if len(pairs) >= 1:
        out["coastalMin"], out["coastalMax"] = float(pairs[0][0]), float(pairs[0][1])
    if len(pairs) >= 2:
        out["oceanMin"], out["oceanMax"] = float(pairs[1][0]), float(pairs[1][1])
    cur = re.findall(r"조류[^\n]*?연\s*안:\s*([^\n\t]+)", blk)
    if cur:
        out["coastalCurrent"] = cur[0].strip()
    cur2 = re.findall(r"대\s*양:\s*(동류|서류|[가-힣]+류)", blk)
    if cur2:
        out["oceanCurrent"] = cur2[-1].strip()
    return out


def parse_prices(text: str) -> dict:
    """어가 4채널. 'PFC 어가 확인 중' 처럼 값이 없는 주가 실제로 있다 -> null."""
    blk = section(text, "어가동향", "(일)가공상황", "현안 업무")
    tema = section(blk, "TEMA", "ABIDJAN")
    abj = section(blk, "ABIDJAN", "MARKET")
    mkt = section(blk, "MARKET", "환율")

    def dollar(s: str, after: str) -> float | None:
        m = re.search(re.escape(after) + r"[^\$\n]{0,12}\$\s*([\d,]+)", s)
        return num(m.group(1)) if m else None

    return {
        "pfcTema": dollar(tema, "PFC"),
        "cosmoTema": dollar(tema, "COSMO"),
        "scodiAbidjan": num(m.group(1)) if (m := re.search(r"\$\s*([\d,]+)", abj)) else None,
        "marketTemaCedi": num(m.group(1)) if (m := re.search(r"[￠¢]\s*([\d,]+)", mkt)) else None,
        "marketTemaUsd": num(m.group(1)) if (m := re.search(r"[￠¢][\d,]+\s*\(\$\s*([\d,]+)", mkt)) else None,
        "marketAbidjanCfa": num(m.group(1)) if (m := re.search(r"([\d,]+)\s*CFA", mkt)) else None,
        "marketAbidjanUsd": num(m.group(1)) if (m := re.search(r"CFA\s*\(?\$?\s*\(?\$\s*([\d,]+)", mkt)) else None,
    }


def parse_fx(text: str) -> dict:
    blk = section(text, "환율", "(일)가공상황")
    return {
        "cediPerUsd": num(m.group(1)) if (m := re.search(r"([\d.]+)\s*CEDI", blk)) else None,
        "cfaPerUsd": num(m.group(1)) if (m := re.search(r"([\d,]+)\s*CFA", blk)) else None,
    }


def parse_processing(text: str) -> dict:
    """(일)가공상황 — 가공사별 일일 처리 톤."""
    blk = section(text, "(일)가공상황", "현안 업무", "AIRONE SHUT")
    out = {}
    for p in PROCESSORS:
        m = re.search(re.escape(p) + r"\s*\(\s*([\d,.]+)\s*톤", blk)
        out[p] = num(m.group(1)) if m else None
    return out


def parse_receivables(text: str) -> dict:
    """아비장 미수금 — 표에 전주/금주가 나란히 온다. 마지막(=금주) 값을 쓴다."""
    blk = section(text, "아비장 마켓 미수금", "INTER OCEAN 법적", "유가")
    out: dict = {"buyers": [], "totalCfa": None, "totalUsd": None}
    for buyer in ["INTER OCEAN", "ETS BADARA", "SDMG"]:
        row = section(blk, buyer, "\n\n")
        line = row.split("\n")[0] if row else ""
        cfa = re.findall(r"([\d,]{7,})\s*CFA", line)
        usd = re.findall(r"\$\s*([\d,]+)", line)
        if buyer == "INTER OCEAN":
            # 미수금/독점판매상환/잔액 3행 구조 -> '잔 액' 행을 쓴다
            bal = section(blk, "잔 액", "ETS BADARA")
            cfa = re.findall(r"([\d,]{7,})\s*CFA", bal) or cfa
            usd = re.findall(r"\$\s*([\d,]+)", bal) or usd
        out["buyers"].append({
            "buyer": buyer,
            "cfa": num(cfa[-1]) if cfa else None,
            "usd": num(usd[-1]) if usd else None,
        })
    tot = section(blk, "합 계", "환율변동")
    tcfa = re.findall(r"([\d,]{7,})\s*CFA", tot)
    tusd = re.findall(r"\$\s*([\d,]+)", tot)
    out["totalCfa"] = num(tcfa[-1]) if tcfa else None
    out["totalUsd"] = num(tusd[-1]) if tusd else None
    return out


FUEL_LABELS = [("ABIDJAN", "abidjan"), ("TEMA", "tema"), ("DAKAR", "dakar"),
               ("양상", "tanker"), ("탱커", "tanker")]


def parse_fuel(text: str) -> dict:
    """유가($/KL). 유류는 생산원가의 39.6%라 위젯 핵심 축이다.

    표가 **라벨 행 → 값 행** 2단으로 오므로 라벨 옆에서 값을 찾으면 실패한다
    (라벨과 값 사이에 개행·탭이 끼어 있다). 라벨 등장 순서와 `$N/KL` 등장 순서를
    각각 뽑아 위치로 짝짓는다. 초기 주차는 '유가 : $957/KL' 단일값 형태다.
    """
    blk = section(text, "유가", "선박 동향", "기타사항")
    out = {"abidjan": None, "tema": None, "dakar": None, "tanker": None, "single": None}

    seen, keys = set(), []
    for m in re.finditer(r"ABIDJAN|TEMA|DAKAR|양상|탱커", blk):
        key = next(k for lab, k in FUEL_LABELS if lab == m.group())
        if key not in seen:
            seen.add(key)
            keys.append(key)
    values = [num(v) for v in re.findall(r"\$\s*([\d,]+)\s*/\s*KL", blk)]

    if keys and len(values) >= len(keys):
        for key, val in zip(keys, values):
            out[key] = val
    elif values:
        out["single"] = values[0]
    return out


NOMINAL = "각 선 특이사항 없이"


def parse_own_vessels(text: str) -> tuple[list[dict], str]:
    """자사 선망선 상태. 섹션명이 주마다 달라(운항정보 / 금어기 중 선박 동향 /
    선박 동향) 위치가 아니라 선명으로 훑는다.

    31주 중 7주는 선박별 항목 대신 "각 선 특이사항 없이 안전 조업 중" 한 줄만 온다.
    이건 결측이 아니라 **정상 신호**다. null 로 두면 화면이 '데이터 없음'으로
    거짓말하므로 fleetStatus 로 구분해 내보낸다.
    """
    head = text[: text.find("조업 동향")] if "조업 동향" in text else text[:2000]
    out = []
    for name, short in VESSELS.items():
        i = head.find(name)
        if i < 0:
            continue
        line = head[i + len(name):].split("\n")[0].strip(" \t:")
        out.append({"vessel": name, "code": short, "status": line[:200] or None})
    if out:
        return out, "detailed"
    if NOMINAL in head:
        return [], "nominal"
    return [], "missing"


def parse_senegal(text: str) -> list[dict]:
    """세네갈·EU 선단 입출항 표 — 선단/선박명/입항일/출항일/입항톤수/비고."""
    blk = section(text, "조업선 동향", "어가동향")
    # docx_text 는 셀 내부 문단 끝(</w:p>)을 \n, 셀 끝(</w:tc>)을 \t 로 살리므로
    # 표 한 행이 "셀\n\t셀\n\t…" 로 줄바꿈돼 buried 된다. \n\t 를 \t 로 접어
    # 행 단위 한 줄로 복원해야 입항일·입항톤수 열이 같은 줄에서 잡힌다.
    # (이 버그로 31주 내내 tons 가 전부 null 이었다 — 2026-08-15 수정)
    blk = blk.replace("\n\t", "\t")
    rows = []
    fleet = None
    for line in blk.split("\n"):
        cells = [c.strip() for c in line.split("\t") if c.strip()]
        if not cells:
            continue
        if cells[0] in ("캅센", "그랑블루", "그랑", "EU 선단", "운반선", "블루"):
            fleet = cells[0]
            cells = cells[1:]
        if not cells:
            continue
        name = cells[0]
        if not re.match(r"^[A-Z][A-Z0-9 .\-]{2,}$", name):
            continue
        tons = None
        for c in cells:
            if "톤" in c:
                tons = num(c)
        rows.append({
            "fleet": fleet,
            "vessel": name,
            "arrive": cells[1] if len(cells) > 1 and re.match(r"\d+/\d+", cells[1]) else None,
            "depart": cells[2] if len(cells) > 2 and re.match(r"\d+/\d+|미정", cells[2]) else None,
            "tons": tons,
            "note": cells[-1] if len(cells) > 4 else None,
        })
    return rows


def parse_week(path: Path) -> dict:
    text = docx_text(path)
    stamp = re.search(r"(\d{8})", path.name).group(1)
    d = date(int(stamp[:4]), int(stamp[4:6]), int(stamp[6:8]))
    author = None
    m = re.search(r"작성자\s*\t?\s*([^\n\t]+)", text)
    if m:
        author = m.group(1).strip()

    # 원문 '일자'가 파일명과 어긋나는 주가 있다(2026년 보고에 2025년으로 오타).
    # 파일명 스탬프를 정본으로 쓰고 불일치는 플래그로 남겨 나중에 원본 대조를 돕는다.
    stated_year = None
    my = re.search(r"(\d{4})년\s*\d+월\s*\d+일", text)
    if my:
        stated_year = int(my.group(1))
    year_mismatch = stated_year is not None and stated_year != d.year

    vessels, fleet_status = parse_own_vessels(text)
    return {
        "reportDate": d.isoformat(),
        "isoWeek": d.isocalendar()[1],
        "source": unicodedata.normalize("NFC", path.name),
        "sha256": sha256(path.read_bytes()).hexdigest(),
        "author": author,
        "statedYearMismatch": year_mismatch,
        "fleetStatus": fleet_status,
        "ownVessels": vessels,
        "fishingGround": parse_temps(text),
        "senegalFleet": parse_senegal(text),
        "prices": parse_prices(text),
        "fx": parse_fx(text),
        "dailyProcessing": parse_processing(text),
        "receivables": parse_receivables(text),
        "fuel": parse_fuel(text),
    }


def coverage(weeks: list[dict]) -> dict:
    """필드별 결측률. 포맷 드리프트를 조용히 넘기지 않기 위한 자기점검."""
    probes = {
        "prices.cosmoTema": lambda w: w["prices"]["cosmoTema"],
        "prices.scodiAbidjan": lambda w: w["prices"]["scodiAbidjan"],
        "fx.cediPerUsd": lambda w: w["fx"]["cediPerUsd"],
        "dailyProcessing.COSMO": lambda w: w["dailyProcessing"]["COSMO"],
        "receivables.totalUsd": lambda w: w["receivables"]["totalUsd"],
        # 원문이 2026-03-17 부터 단일값 -> 4지점 표로 바뀐다. 'any' 로 재면 4지점을
        # single 로 잘못 떨어뜨린 주차를 못 잡고, 4지점만 재면 초기 9주가 실패로 뜬다.
        # 두 형식 중 하나를 **온전히** 갖췄는지로 잰다.
        "fuel(형식 온전)": lambda w: True if (
            all(w["fuel"][k] is not None for k in ("abidjan", "tema", "dakar", "tanker"))
            or w["fuel"]["single"] is not None
        ) else None,
        # 'nominal'(특이사항 없음)도 유효한 관측이다 — 결측은 'missing' 뿐.
        "fleetStatus(관측됨)": lambda w: w["fleetStatus"] if w["fleetStatus"] != "missing" else None,
        "senegalFleet": lambda w: len(w["senegalFleet"]) or None,
        "fishingGround.coastalMax": lambda w: w["fishingGround"]["coastalMax"],
    }
    return {k: sum(1 for w in weeks if f(w) is not None) for k, f in probes.items()}


def main() -> int:
    # Google Drive 가 한글 파일명을 NFD(자모 분해)로 올리는 경우가 있어 NFC glob 이
    # 조용히 빠뜨린다(월간보고 8월분이 실제로 그랬다). 이름을 NFC 로 정규화해 고른다.
    files = sorted(
        f for f in SRC_DIR.iterdir()
        if re.fullmatch(r"PANOFI 주간동향\d{8}\.docx",
                        unicodedata.normalize("NFC", f.name))
        and not f.name.startswith("~$")
    )
    if not files:
        print(f"원자료 없음: {SRC_DIR}", file=sys.stderr)
        return 1

    weeks = [parse_week(f) for f in files]
    weeks.sort(key=lambda w: w["reportDate"])

    # 연속 주간 시계열은 2025-12-23 부터다. 폴더에는 그보다 1년 전 단발 보고
    # (PANOFI 주간동향20250107.docx)가 섞여 있는데, 이걸 넣으면 헤드라인
    # «N주 (start~end)» 가 연속 커버리지인 척 거짓말한다 — 시계열 밖은 뺀다.
    SERIES_START = "2025-12-23"
    weeks = [w for w in weeks if w["reportDate"] >= SERIES_START]

    cov = coverage(weeks)
    total = len(weeks)
    print(f"주차 {total}건 ({weeks[0]['reportDate']} ~ {weeks[-1]['reportDate']})", file=sys.stderr)
    weak = []
    for k, hit in cov.items():
        pct = hit * 100 // total
        flag = "  " if pct >= 80 else "!!"
        print(f"{flag} {k:32s} {hit:3d}/{total} ({pct}%)", file=sys.stderr)
        if pct < 80:
            weak.append(k)

    payload = {
        "meta": {
            "generatedFrom": str(SRC_DIR),
            "weekCount": total,
            "rangeStart": weeks[0]["reportDate"],
            "rangeEnd": weeks[-1]["reportDate"],
            "coverage": cov,
            "vessels": VESSELS,
            "processors": PROCESSORS,
        },
        "weeks": weeks,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf8")
    print(f"-> {OUT} ({OUT.stat().st_size // 1024}KB)", file=sys.stderr)

    if weak:
        print(f"\n커버리지 80% 미만: {', '.join(weak)} — 파서 확인 필요", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
