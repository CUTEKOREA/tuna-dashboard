"""Build source-faithful GMTS monthly dashboard data from Monthly Report pptx files.

Stdlib only: pptx is a ZIP of XML; tables, charts, and text frames are parsed
directly. Numbers keep the source's parenthesis-negative convention; blanks
stay null. Subtotal mismatches are flagged, never corrected (rulebook: the
printed source wins).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

DEFAULT_SOURCE_DIR = (
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/"
    "내 드라이브/신라그룹/GMTS/GMTS Weekly Report"
)
DEFAULT_OUTPUT = Path(__file__).resolve().parent.parent / "data" / "gmts_monthly.json"

A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
C = "{http://schemas.openxmlformats.org/drawingml/2006/chart}"

COMPANIES = ("GMTS", "KFC", "NFDC")
PROFIT_ROWS = (
    "매출액",
    "매출원가",
    "매출총이익",
    "판매관리비",
    "영업이익",
    "금융손익",
    "기타손익",
    "법인세차감전이익",
)
ASSET_ROWS = ("현금", "예금", "채권", "소계")
DEBT_ROWS = ("신라교역", "GMTS", "기타업체", "소계")
FUND_FIELDS = (
    "cash",
    "deposit",
    "receivable",
    "assetSubtotal",
    "toSilla",
    "toGmts",
    "toOthers",
    "debtSubtotal",
    "netBalance",
)


def parse_amount(raw: str | None) -> float | None:
    """Parse a source amount; '(x)' is negative, blank/dash stays null."""
    text = (raw or "").strip()
    if not text or text in {"-", "–"}:
        return None
    negative = text.startswith("(") and text.endswith(")")
    digits = re.sub(r"[^0-9.]", "", text)
    if not digits:
        return None
    value = float(digits)
    return -value if negative else value


def cell_text(tc: ET.Element) -> str:
    return "".join(t.text or "" for t in tc.iter(f"{A}t")).strip()


def visible_rows(tbl: ET.Element) -> list[list[str]]:
    """Table rows with merged-away (hMerge) cells dropped — their stale text is not displayed."""
    rows = []
    for tr in tbl.findall(f"{A}tr"):
        cells = [cell_text(tc) for tc in tr.findall(f"{A}tc") if tc.get("hMerge") != "1"]
        rows.append(cells)
    return rows


def sorted_tables(root: ET.Element, axis: str) -> list[ET.Element]:
    """Tables in visual order: axis='x' for side-by-side, 'y' for stacked layouts."""
    frames = []
    for gf in root.iter(f"{P}graphicFrame"):
        tbl = gf.find(f".//{A}tbl")
        if tbl is None:
            continue
        off = gf.find(f"{P}xfrm/{A}off")
        pos = int(off.get(axis, "0")) if off is not None else 0
        frames.append((pos, tbl))
    frames.sort(key=lambda pair: pair[0])
    return [tbl for _, tbl in frames]


def slide_texts(root: ET.Element) -> list[str]:
    texts = []
    for sp in root.iter(f"{P}sp"):
        body = sp.find(f"{P}txBody")
        if body is None:
            continue
        for para in body.findall(f"{A}p"):
            text = "".join(t.text or "" for t in para.iter(f"{A}t")).strip()
            if text:
                texts.append(text)
    return texts


def read_slide(zf: zipfile.ZipFile, index: int) -> ET.Element:
    return ET.fromstring(zf.read(f"ppt/slides/slide{index}.xml"))


def parse_charts(zf: zipfile.ZipFile) -> dict[str, dict[str, list[float | None]]]:
    """barChart = catch volume (M/T), lineChart = Gensan price (USD/MT)."""
    result: dict[str, dict[str, list[float | None]]] = {}
    for name in sorted(n for n in zf.namelist() if re.match(r"ppt/charts/chart\d+\.xml$", n)):
        root = ET.fromstring(zf.read(name))
        kinds = {
            child.tag.split("}")[1]
            for plot in root.iter(f"{C}plotArea")
            for child in plot
            if child.tag.endswith("Chart")
        }
        key = "catch" if "barChart" in kinds else "price" if "lineChart" in kinds else None
        if key is None:
            continue
        series: dict[str, list[float | None]] = {}
        for ser in root.iter(f"{C}ser"):
            tx = ser.find(f".//{C}tx//{C}v")
            label = tx.text if tx is not None else ""
            match = re.fullmatch(r"(\d{4})년", label or "")
            if not match:
                continue
            values = [parse_amount(v.text) for v in ser.findall(f".//{C}val//{C}pt/{C}v")]
            series[match.group(1)] = values
        result[key] = series
    return result


def parse_profit(root: ET.Element, flags: list[dict], report_label: str) -> dict:
    tables = sorted_tables(root, 'x')
    if len(tables) != 3:
        raise ValueError(f"{report_label}: expected 3 profit tables, found {len(tables)}")
    texts = slide_texts(root)
    period = next((t for t in texts if re.fullmatch(r"20\d{2}년 .*손익", t)), "")
    companies: dict[str, dict[str, list[float | None]]] = {}
    for company, tbl in zip(COMPANIES, tables):
        rows = visible_rows(tbl)
        data_rows = [row for row in rows if len(row) >= 2 and row[-2:] != ["2025", "2026"] and row[-1] != "2026"]
        if len(data_rows) != len(PROFIT_ROWS):
            raise ValueError(f"{report_label}: {company} profit rows {len(data_rows)} != {len(PROFIT_ROWS)}")
        labeled = [row for row in rows if row and row[0] in PROFIT_ROWS]
        if labeled and [row[0] for row in labeled] != list(PROFIT_ROWS):
            raise ValueError(f"{report_label}: {company} profit row labels diverge from schema")
        y2025 = [parse_amount(row[-2]) for row in data_rows]
        y2026 = [parse_amount(row[-1]) for row in data_rows]
        companies[company] = {"y2025": y2025, "y2026": y2026}
        for year_key, values in (("y2025", y2025), ("y2026", y2026)):
            check_profit_identity(values, flags, f"{report_label} {company} {year_key}")
    return {"periodLabel": period, "rows": list(PROFIT_ROWS), "companies": companies}


def check_profit_identity(v: list[float | None], flags: list[dict], where: str) -> None:
    def diff(expected: float | None, actual: float | None, name: str) -> None:
        if expected is None or actual is None:
            return
        if abs(expected - actual) > 1.5:
            flags.append({
                "code": "PROFIT_IDENTITY_MISMATCH",
                "where": f"{where} {name}",
                "expected": expected,
                "printed": actual,
            })

    sales, cogs, gross, sga, op, fin, other, pretax = v
    if sales is not None and cogs is not None:
        diff(sales - cogs, gross, "매출총이익")
    if gross is not None and sga is not None:
        diff(gross - sga, op, "영업이익")
    if op is not None:
        diff(op + (fin or 0) + (other or 0), pretax, "법인세차감전이익")


def parse_funds(root: ET.Element, flags: list[dict], report_label: str) -> dict:
    tables = sorted_tables(root, 'y')
    if len(tables) < 4:
        raise ValueError(f"{report_label}: expected 4 funds tables, found {len(tables)}")
    texts = slide_texts(root)
    as_of = next((t for t in texts if "채권/채무 내역" in t), "")

    asset_rows = [row for row in visible_rows(tables[0]) if row and row[0] in ASSET_ROWS]
    debt_rows = [row for row in visible_rows(tables[1]) if row and row[0] in DEBT_ROWS]
    net_rows = [row for row in visible_rows(tables[2]) if row and "잔액" in row[0]]
    note_rows = [row for row in visible_rows(tables[3]) if row and row[0].replace(" ", "") == "비고"]
    if [row[0] for row in asset_rows] != list(ASSET_ROWS):
        raise ValueError(f"{report_label}: asset rows diverge from schema")
    if [row[0] for row in debt_rows] != list(DEBT_ROWS):
        raise ValueError(f"{report_label}: debt rows diverge from schema")
    if not net_rows:
        raise ValueError(f"{report_label}: net balance row missing")

    companies: dict[str, dict[str, float | None]] = {}
    for idx, company in enumerate(COMPANIES):
        col = idx + 1
        record = {
            "cash": parse_amount(asset_rows[0][col]),
            "deposit": parse_amount(asset_rows[1][col]),
            "receivable": parse_amount(asset_rows[2][col]),
            "assetSubtotal": parse_amount(asset_rows[3][col]),
            "toSilla": parse_amount(debt_rows[0][col]),
            "toGmts": parse_amount(debt_rows[1][col]),
            "toOthers": parse_amount(debt_rows[2][col]),
            "debtSubtotal": parse_amount(debt_rows[3][col]),
            "netBalance": parse_amount(net_rows[0][col]),
        }
        companies[company] = record
        check_funds_identity(record, flags, f"{report_label} {company}")
    notes = {}
    if note_rows:
        row = note_rows[0]
        for idx, company in enumerate(COMPANIES):
            col = idx + 1
            if col < len(row) and row[col].strip():
                notes[company] = row[col].strip()
    return {"asOfLabel": as_of, "companies": companies, "notes": notes}


def check_funds_identity(rec: dict[str, float | None], flags: list[dict], where: str) -> None:
    def total(*keys: str) -> float:
        return sum(rec[k] or 0 for k in keys)

    checks = (
        ("assetSubtotal", total("cash", "deposit", "receivable"), "자산 소계"),
        ("debtSubtotal", total("toSilla", "toGmts", "toOthers"), "채무 소계"),
        ("netBalance", total("assetSubtotal") - total("debtSubtotal"), "채권/채무 잔액"),
    )
    for key, expected, name in checks:
        printed = rec[key]
        if printed is None:
            continue
        if abs(expected - printed) > 1.5:
            flags.append({
                "code": "FUNDS_IDENTITY_MISMATCH",
                "where": f"{where} {name}",
                "expected": expected,
                "printed": printed,
            })


def parse_briefing(root: ET.Element) -> tuple[list[str], list[str]]:
    texts = slide_texts(root)
    body = [
        t for t in texts
        if not re.fullmatch(r"\d+\.\s*업무 보고", t) and t != "업무 및 동향"
    ]
    bullets = [t for t in body if not t.startswith("*")]
    footnotes = [t for t in body if t.startswith("*")]
    return bullets, footnotes


def parse_report(path: Path) -> dict:
    match = re.search(r"\((\d{1,2})월\)", path.name)
    if not match:
        raise ValueError(f"cannot read report month from {path.name}")
    report_month = int(match.group(1))
    digest = hashlib.sha256(path.read_bytes()).hexdigest()

    with zipfile.ZipFile(path) as zf:
        cover = slide_texts(read_slide(zf, 1))
        date_text = next((t for t in cover if re.fullmatch(r"20\d{2}\.\s*\d{1,2}\.\s*\d{1,2}", t)), None)
        if date_text is None:
            raise ValueError(f"{path.name}: report date missing on cover slide")
        year, month, day = (int(part) for part in re.split(r"\.\s*", date_text))
        report_date = f"{year:04d}-{month:02d}-{day:02d}"

        catch_root = read_slide(zf, 2)
        price_note = next((t for t in slide_texts(catch_root) if "어가" in t and "Level" in t), "")

        flags: list[dict] = []
        label = f"{path.name}"
        profit = parse_profit(read_slide(zf, 3), flags, label)
        funds = parse_funds(read_slide(zf, 4), flags, label)
        bullets, footnotes = parse_briefing(read_slide(zf, 5))
        charts = parse_charts(zf)

    return {
        "reportMonth": report_month,
        "reportDate": report_date,
        "priceNote": price_note,
        "profit": profit,
        "funds": funds,
        "briefing": bullets,
        "briefingFootnotes": footnotes,
        "charts": charts,
        "qualityFlags": flags,
        "source": {"fileName": path.name, "reportDate": report_date, "sha256": digest},
    }


def build(source_dir: Path) -> dict:
    paths = sorted(source_dir.glob("GMTS 월간보고 (*월).pptx"))
    if not paths:
        raise SystemExit(f"no monthly pptx found in {source_dir}")
    reports = sorted((parse_report(p) for p in paths), key=lambda r: r["reportDate"])
    latest = reports[-1]
    charts = latest.pop("charts")
    flags = [flag for report in reports for flag in report.pop("qualityFlags")]
    for report in reports[:-1]:
        report.pop("charts", None)

    def trend(key: str, unit: str) -> dict:
        series = charts.get(key, {})
        years = sorted(series)
        return {
            "unit": unit,
            "years": years,
            "series": {year: series[year] for year in years},
            "sourceReportDate": latest["reportDate"],
        }

    return {
        "schemaVersion": 1,
        "metadata": {
            "status": "STATIC",
            "reportCount": len(reports),
            "firstReportDate": reports[0]["reportDate"],
            "latestReportDate": latest["reportDate"],
            "reportMonths": [r["reportMonth"] for r in reports],
        },
        "catchTrend": trend("catch", "M/T"),
        "priceTrend": trend("price", "USD/MT"),
        "reports": reports,
        "qualityFlags": flags,
        "sources": [r["source"] for r in reports],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", default=DEFAULT_SOURCE_DIR)
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    args = parser.parse_args()

    payload = build(Path(args.source_dir))
    output = Path(args.output)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    meta = payload["metadata"]
    print(
        f"wrote {output} — {meta['reportCount']} reports, "
        f"months {meta['reportMonths']}, latest {meta['latestReportDate']}, "
        f"{len(payload['qualityFlags'])} quality flags"
    )


if __name__ == "__main__":
    main()
