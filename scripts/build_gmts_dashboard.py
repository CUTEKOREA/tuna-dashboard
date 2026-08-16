"""Build compact, source-faithful GMTS weekly dashboard data from PDF reports."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import math
from collections.abc import Iterable
from datetime import date
from pathlib import Path

import pdfplumber


DEFAULT_SOURCE_DIR = (
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/"
    "내 드라이브/신라그룹/GMTS/GMTS Weekly Report"
)
MONTH_KEYS = tuple(f"{month:02d}" for month in range(1, 13))
REQUIRED_VOLUME_YEARS = tuple(str(year) for year in range(2019, 2027))
CANNERY_NAMES = (
    "Gentuna/Century",
    "Philbest",
    "Alliance",
    "Celebes",
    "Foodsphere",
    "Sea Trade",
    "R&R",
    "Total",
)
CANNERY_FIELDS = (
    "maximumProductionMt",
    "currentProductionMt",
    "productionUtilizationPercent",
    "maximumCapacityMt",
    "currentStockMt",
    "storageUtilizationPercent",
    "processingDays",
)


def parse_measure(raw: str | None) -> float | None:
    """Parse a source measure without converting blank or non-numeric text to zero."""
    text = (raw or "").strip()
    if not text or text.upper() in {"TBA", "N/A", "EMPTY", "NONE", "-"}:
        return None
    match = re.search(r"\d[\d,\.]*", text)
    if not match:
        return None
    value = match.group(0).replace(",", "")
    if value.count(".") > 1:
        whole, fraction = value.rsplit(".", 1)
        value = whole.replace(".", "") + "." + fraction
    try:
        return float(value)
    except ValueError:
        return None


def parse_integer(raw: str | None) -> int | None:
    measure = parse_measure(raw)
    return None if measure is None else int(measure)


def parse_iso_date(raw: str | None) -> str | None:
    """Normalize an ISO-like source date and leave unparseable text unknown."""
    text = (raw or "").strip()
    match = re.search(r"(20\d{2})[/-](\d{1,2})[/-](\d{1,2})", text)
    if not match:
        return None
    year, month, day = (int(part) for part in match.groups())
    try:
        return date(year, month, day).isoformat()
    except ValueError:
        return None


def parse_declared_count(raw: str | None) -> int | None:
    match = re.search(r":\s*(\d+)\s*$", (raw or "").strip())
    return int(match.group(1)) if match else None


def parse_price(raw: str | None) -> dict[str, object]:
    text = (raw or "").strip()
    lowered = text.lower()
    if "no price" in lowered:
        qualifier = "no-price"
    elif "no offer" in lowered:
        qualifier = "no-offer"
    elif "no transaction" in lowered or "no deal" in lowered:
        qualifier = "no-transaction"
    elif "around" in lowered:
        qualifier = "around"
    elif "under" in lowered:
        qualifier = "under"
    elif "old contract" in lowered:
        qualifier = "old-contract"
    elif "level" in lowered:
        qualifier = "level"
    else:
        qualifier = "quoted"
    amount = None if qualifier in {"no-price", "no-offer"} else parse_integer(text)
    return {
        "amount": amount,
        "currencySymbol": "$",
        "basisUnit": None,
        "qualifier": qualifier,
        "rawText": text,
    }


def extract_pdf_text(path: Path) -> tuple[str, int]:
    with pdfplumber.open(path) as pdf:
        pages = [page.extract_text(layout=True, x_tolerance=3) or "" for page in pdf.pages]
    return "\n\f\n".join(pages), len(pages)


def section(text: str, start: str, end: str) -> str:
    match = re.search(re.escape(start) + r"(.*?)" + re.escape(end), text, re.DOTALL)
    if not match:
        raise ValueError(f"Source section not found: {start} through {end}")
    return match.group(1)


def heading(text: str, pattern: str) -> dict[str, object]:
    match = re.search(pattern, text, re.MULTILINE)
    if not match:
        raise ValueError(f"Source heading not found: {pattern}")
    raw_text = match.group(0).strip()
    return {"declaredCount": parse_declared_count(raw_text), "recordCount": 0, "records": [], "rawText": raw_text}


def parse_canneries(text: str) -> list[dict[str, object]]:
    table = section(text, "2. Gensan Cannery Status", "3. Gensan Tuna Fish Price")
    rows: list[dict[str, object]] = []
    for name in CANNERY_NAMES:
        match = re.search(rf"^\s*{re.escape(name)}\s+(.+?)\s*$", table, re.MULTILINE)
        if not match:
            raise ValueError(f"Cannery row not found: {name}")
        raw_text = f"{name} {match.group(1).strip()}"
        values = re.findall(r"\d[\d,]*(?:\.\d+)?", match.group(1))
        if len(values) != len(CANNERY_FIELDS):
            raise ValueError(f"Unexpected {name} field count: {len(values)}")
        row: dict[str, object] = {"name": name, "rawText": raw_text, "rawValues": dict(zip(CANNERY_FIELDS, values))}
        row.update(
            {field: parse_measure(value) for field, value in zip(CANNERY_FIELDS, values)}
        )
        rows.append(row)
    return rows


def parse_prices(text: str) -> dict[str, dict[str, object]]:
    table = section(text, "3. Gensan Tuna Fish Price", "4. Other")
    values = re.findall(r"Price\s*:\s*([^\n]+)", table)
    if len(values) < 2:
        raise ValueError("Price rows not found")
    return {"nonGsp": parse_price(values[0]), "gsp": parse_price(values[1])}


def parse_volume(text: str) -> dict[str, object]:
    table = text[text.rfind("Tuna Volume Brought into Gensan(Excluding Fresh Tuna)") :]
    header = next((line for line in table.splitlines() if "Jan" in line and "TOTAL" in line), None)
    if header is None:
        raise ValueError("Volume header not found")
    header_positions = [header.find(month) for month in ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "TOTAL")]
    if any(position < 0 for position in header_positions):
        raise ValueError("Volume header is incomplete")
    annual: dict[str, object] = {}
    for row in table.splitlines():
        year_match = re.match(r"^\s*(20\d{2})(?:\s+.*)?$", row)
        if not year_match:
            continue
        values: dict[str, float | None] = {month: None for month in MONTH_KEYS}
        total: float | None = None
        for match in list(re.finditer(r"\d[\d,\.]*", row))[1:]:
            nearest = min(range(len(header_positions)), key=lambda index: abs(match.start() - header_positions[index]))
            if nearest == 12:
                total = parse_measure(match.group(0))
            else:
                values[MONTH_KEYS[nearest]] = parse_measure(match.group(0))
        annual[year_match.group(1)] = {"months": values, "total": total, "rawText": row.strip()}
    if "2026" not in annual:
        raise ValueError("2026 volume row not found")
    return {"unit": None, "excludesFreshTuna": True, "annual": annual, "rawText": table.strip()}


def parse_volume_pdf(path: Path) -> dict[str, object]:
    annual: dict[str, object] = {}
    raw_rows: list[str] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            words = page.extract_words()
            jan = next((word for word in words if word["text"] == "Jan"), None)
            if not jan:
                continue
            header_y = jan["top"]
            headers = [(word["x0"], word["text"]) for word in words if abs(word["top"] - header_y) < 2 and word["text"] in {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "TOTAL"}]
            if len(headers) != 13:
                continue
            for year_word in [word for word in words if re.fullmatch(r"20\d{2}", word["text"]) and word["top"] > header_y]:
                row_words = sorted([word for word in words if abs(word["top"] - year_word["top"]) < 2], key=lambda word: word["x0"])
                merged_words = []
                for word in row_words:
                    if merged_words and word["x0"] - merged_words[-1]["x1"] < 0.2:
                        merged_words[-1] = {**merged_words[-1], "text": merged_words[-1]["text"] + word["text"], "x1": word["x1"]}
                    else:
                        merged_words.append(word)
                values = {month: None for month in MONTH_KEYS}
                total = None
                for word in merged_words:
                    if word is year_word:
                        continue
                    number = parse_measure(word["text"])
                    if number is None:
                        continue
                    key = min(headers, key=lambda item: abs(word["x0"] - item[0]))[1]
                    if key == "TOTAL":
                        total = number
                    else:
                        values[f"{('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec').index(key)+1:02d}"] = number
                annual[year_word["text"]] = {"months": values, "total": total, "rawText": " ".join(word["text"] for word in merged_words)}
                raw_rows.append(" ".join(word["text"] for word in merged_words))
    if "2026" not in annual:
        raise ValueError("2026 volume row not found")
    return {"unit": None, "excludesFreshTuna": True, "annual": annual, "rawText": "\n".join(raw_rows)}


def normalize_cell(raw: object) -> str | None:
    text = re.sub(r"\s+", " ", str(raw or "")).strip()
    return text or None


def split_cell_lines(raw: object) -> list[str]:
    return [line for part in str(raw or "").splitlines() if (line := part.strip())]


def empty_date_observation() -> dict[str, str | None]:
    return {"value": None, "rawText": None}


def date_observation(raw: object) -> dict[str, str | None]:
    text = normalize_cell(raw)
    return {"value": parse_iso_date(text), "rawText": text}


def parse_eta_range(raw: object) -> tuple[dict[str, str | None], dict[str, str | None]]:
    text = normalize_cell(raw)
    if text is None:
        return empty_date_observation(), empty_date_observation()
    start = date_observation(text)
    end = empty_date_observation()
    match = re.search(
        r"(20\d{2})[/-](\d{1,2})[/-](\d{1,2})\s*-\s*(\d{1,2})(?![/-])",
        text,
    )
    if match:
        year, month, _, end_day = (int(part) for part in match.groups())
        try:
            end = {"value": date(year, month, end_day).isoformat(), "rawText": text}
        except ValueError:
            end = {"value": None, "rawText": text}
    return start, end


def extract_port_tables(path: Path) -> list[list[list[str | None]]]:
    tables: list[list[list[str | None]]] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                if not table:
                    continue
                header = " ".join(normalize_cell(cell) or "" for cell in table[0])
                if all(label in header for label in ("Shipping", "Vessel", "Consignee")):
                    tables.append(table)
    if len(tables) != 3:
        raise ValueError(f"Expected three port lane tables, found {len(tables)}: {path.name}")
    return tables


def parse_lane_records(
    lane: dict[str, object], table: list[list[str | None]]
) -> None:
    rows = [list(row) + [None] * (5 - len(row)) for row in table[1:]]
    record_starts = [index for index, row in enumerate(rows) if normalize_cell(row[1])]
    records: list[dict[str, object]] = []

    for position, start in enumerate(record_starts):
        end = record_starts[position + 1] if position + 1 < len(record_starts) else len(rows)
        group = rows[start:end]
        identifier = normalize_cell(group[0][1])
        if identifier is None:
            raise ValueError("Vessel identifier is missing from a source table row")

        raw_fields: dict[str, str] = {}
        fields: dict[str, float | None] = {
            "cargo": None,
            "discharged": None,
            "short": None,
            "gensanAllocation": None,
        }
        dates = {
            "arrived": empty_date_observation(),
            "unloadingStarted": empty_date_observation(),
            "etd": empty_date_observation(),
            "etaStart": empty_date_observation(),
            "etaEnd": empty_date_observation(),
        }
        eta_raw: str | None = None

        for row in group:
            label = normalize_cell(row[2])
            raw_value = normalize_cell(row[3])
            if label is None:
                continue
            normalized_label = label.lower().replace(" ", "")
            if normalized_label == "totalcargo":
                if raw_value is not None:
                    raw_fields["cargo"] = raw_value
                fields["cargo"] = parse_measure(raw_value)
            elif normalized_label == "totaldischarged":
                if raw_value is not None:
                    raw_fields["discharged"] = raw_value
                fields["discharged"] = parse_measure(raw_value)
            elif normalized_label == "short":
                if raw_value is not None:
                    raw_fields["short"] = raw_value
                fields["short"] = parse_measure(raw_value)
            elif normalized_label == "forgensan":
                if raw_value is not None:
                    raw_fields["gensanAllocation"] = raw_value
                fields["gensanAllocation"] = parse_measure(raw_value)
            elif normalized_label == "arrived":
                dates["arrived"] = date_observation(raw_value)
            elif normalized_label == "unloadingstarted":
                dates["unloadingStarted"] = date_observation(raw_value)
            elif normalized_label == "etd":
                dates["etd"] = date_observation(raw_value)
            elif normalized_label.startswith("eta"):
                eta_raw = raw_value
                dates["etaStart"], dates["etaEnd"] = parse_eta_range(raw_value)

        if fields["cargo"] is not None and not raw_fields.get("cargo"):
            raise ValueError(f"Cargo value is missing source text: {identifier}")

        raw_rows = [
            " | ".join(value for cell in row if (value := normalize_cell(cell)))
            for row in group
        ]
        records.append(
            {
                "sourceIdentifier": identifier,
                "displayName": re.sub(r"^(?:MV|FV)\s+", "", identifier),
                "traders": split_cell_lines(group[0][0]),
                **fields,
                "etaOrUnloadingDate": eta_raw,
                "consignees": split_cell_lines(group[0][4]),
                "dates": dates,
                "rawFields": raw_fields,
                "rawText": "\n".join(raw_rows),
            }
        )

    lane["records"] = records
    lane["recordCount"] = len(records)


def parse_report(path: Path) -> dict[str, object]:
    text, page_count = extract_pdf_text(path)
    date_match = re.search(r"\bDate\s+(20\d{2}[/-]\d{1,2}[/-]\d{1,2})", text)
    report_date = parse_iso_date(date_match.group(1) if date_match else None)
    if report_date is None:
        raise ValueError(f"Report date not found: {path.name}")
    source = {
        "reportDate": report_date,
        "fileName": path.name,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "pages": page_count,
    }
    unloading = heading(text, r"^\s*A\.\s*Unloading Vessels\s*:\s*\d*\s*$")
    completed = heading(text, r"^\s*A-1\.\s*Completed Discharging Vessels\s*:\s*\d*\s*$")
    incoming = heading(text, r"^\s*B\.\s*Incoming Vessel\s*:\s*\d*\s*$")
    port_tables = extract_port_tables(path)
    parse_lane_records(unloading, port_tables[0])
    parse_lane_records(completed, port_tables[1])
    parse_lane_records(incoming, port_tables[2])
    return {
        "reportDate": report_date,
        "operationalAsOf": None,
        "unloading": unloading,
        "completedDischarging": completed,
        "incoming": incoming,
        "canneries": parse_canneries(text),
        "prices": parse_prices(text),
        "volume": parse_volume_pdf(path),
        "source": source,
    }


def validate_weekly_sequence(reports: Iterable[dict[str, object]]) -> None:
    dates = [str(report["reportDate"]) for report in reports]
    if len(dates) != len(set(dates)):
        raise ValueError("duplicate weekly report date")
    parsed = [date.fromisoformat(value) for value in sorted(dates)]
    if any((later - earlier).days != 7 for earlier, later in zip(parsed, parsed[1:])):
        raise ValueError("missing weekly report date")


def detect_volume_revisions(reports: list[dict[str, object]]) -> list[dict[str, object]]:
    latest_by_month: dict[str, tuple[str, float]] = {}
    revisions: list[dict[str, object]] = []
    for report in reports:
        for year in sorted(report["volume"]["annual"], key=int):
            for month in MONTH_KEYS:
                value = report["volume"]["annual"][year]["months"].get(month)
                if value is None:
                    continue
                month_key = f"{year}-{month}"
                previous = latest_by_month.get(month_key)
                if previous and previous[1] != value:
                    revisions.append(
                        {
                            "month": month_key,
                            "previousReportDate": previous[0],
                            "previousValue": previous[1],
                            "reportDate": report["reportDate"],
                            "value": value,
                        }
                    )
                latest_by_month[month_key] = (
                    str(report["reportDate"]),
                    float(value),
                )
    return revisions


def validate_report(report: dict[str, object]) -> None:
    """Validate one parsed report before it can enter the emitted contract."""
    rows = report["canneries"]
    if len(rows) != len(CANNERY_NAMES) or tuple(row["name"] for row in rows) != CANNERY_NAMES:
        raise ValueError(f"expected seven named canneries plus Total: {report['reportDate']}")

    individuals = rows[:-1]
    total = rows[-1]
    for field in (
        "maximumProductionMt",
        "currentProductionMt",
        "maximumCapacityMt",
        "currentStockMt",
    ):
        values = [row[field] for row in individuals]
        if any(value is None for value in values) or total[field] is None:
            raise ValueError(f"cannery total field missing: {report['reportDate']} {field}")
        if not math.isclose(
            sum(float(value) for value in values),
            float(total[field]),
            rel_tol=0,
            abs_tol=0.001,
        ):
            raise ValueError(f"cannery total mismatch: {report['reportDate']} {field}")

    for row in rows:
        utilization_pairs = (
            (
                row["currentProductionMt"],
                row["maximumProductionMt"],
                row["productionUtilizationPercent"],
                "production",
            ),
            (
                row["currentStockMt"],
                row["maximumCapacityMt"],
                row["storageUtilizationPercent"],
                "storage",
            ),
        )
        for actual, capacity, displayed, label in utilization_pairs:
            if actual is None or capacity in (None, 0) or displayed is None:
                raise ValueError(
                    f"utilization field missing: {report['reportDate']} {row['name']} {label}"
                )
            expected = math.floor(float(actual) / float(capacity) * 100 + 0.5)
            if not math.isclose(
                float(displayed), float(expected), rel_tol=0, abs_tol=0.001
            ):
                raise ValueError(
                    f"utilization mismatch: {report['reportDate']} {row['name']} {label}"
                )

    annual = report["volume"]["annual"]
    if tuple(sorted(annual, key=int)) != REQUIRED_VOLUME_YEARS:
        raise ValueError(f"required annual rows 2019 through 2026 missing: {report['reportDate']}")
    for year in REQUIRED_VOLUME_YEARS:
        values = [
            annual[year]["months"].get(month)
            for month in MONTH_KEYS
            if annual[year]["months"].get(month) is not None
        ]
        if annual[year]["total"] is not None and not math.isclose(
            sum(float(value) for value in values),
            float(annual[year]["total"]),
            rel_tol=0,
            abs_tol=0.001,
        ):
            raise ValueError(f"annual total mismatch: {report['reportDate']} {year}")


def month_array(months: dict[str, float | None]) -> list[float | None]:
    return [months.get(month) for month in MONTH_KEYS]


def annual_array(annual: dict[str, dict[str, object]]) -> list[dict[str, object]]:
    return [
        {
            "year": int(year),
            "months": month_array(annual[year]["months"]),
            "total": annual[year]["total"],
            "rawText": annual[year]["rawText"],
        }
        for year in REQUIRED_VOLUME_YEARS
    ]


def build_quality_flags(
    reports: list[dict[str, object]], revisions: list[dict[str, object]]
) -> list[dict[str, object]]:
    flags: list[dict[str, object]] = []
    flags.extend(
        {
            "code": "blank_declared_count",
            "reportDate": report["reportDate"],
            "lane": lane,
        }
        for report in reports
        for lane in ("unloading", "completedDischarging", "incoming")
        if report[lane]["declaredCount"] is None
    )
    flags.extend(
        {
            "code": "price_qualifier",
            "reportDate": report["reportDate"],
            "price": {"nonGsp": "nonGspNonMsc", "gsp": "gspNonMsc"}[key],
            "qualifier": price["qualifier"],
        }
        for report in reports
        for key, price in report["prices"].items()
        if price["qualifier"] != "quoted"
    )
    flags.extend({"code": "volume_revision", **revision} for revision in revisions)
    flags.extend(
        {
            "code": "capacity_exceeded",
            "reportDate": report["reportDate"],
            "name": row["name"],
            "storageUtilizationPercent": row["storageUtilizationPercent"],
        }
        for report in reports
        for row in report["canneries"]
        if row["storageUtilizationPercent"] is not None
        and row["storageUtilizationPercent"] > 100
    )
    flags.extend(
        (
            {
                "code": "price_basis_unit_missing",
                "field": "price_basis_unit_missing",
            },
            {"code": "volume_unit_missing", "field": "volume_unit_missing"},
        )
    )
    return flags


def build_dashboard(source_dir: Path) -> dict[str, object]:
    reports = sorted((parse_report(path) for path in source_dir.glob("*.pdf")), key=lambda report: report["reportDate"])
    if not reports:
        raise ValueError(f"No PDF reports found: {source_dir}")
    validate_weekly_sequence(reports)
    source_hashes = [report["source"]["sha256"] for report in reports]
    if len(source_hashes) != len(set(source_hashes)):
        raise ValueError("duplicate source SHA-256")
    for report in reports:
        filename_match = re.search(r"(20\d{2})(\d{2})(\d{2})", report["source"]["fileName"])
        if not filename_match or "-".join(filename_match.groups()) != report["reportDate"]:
            raise ValueError("filename/report date mismatch")
        if date.fromisoformat(report["reportDate"]).weekday() != 2:
            raise ValueError("report date is not Wednesday")
        validate_report(report)
    revisions = detect_volume_revisions(reports)
    sources = [report["source"] for report in reports]
    def total(report: dict[str, object]) -> dict[str, object]:
        row = next(item for item in report["canneries"] if item["name"] == "Total")
        return {"maxDailyProductionMt": row["maximumProductionMt"], "currentDailyProductionMt": row["currentProductionMt"], "productionUtilizationPct": row["productionUtilizationPercent"], "storageCapacityMt": row["maximumCapacityMt"], "currentStockMt": row["currentStockMt"], "storageUtilizationPct": row["storageUtilizationPercent"], "reportedProcessingDays": row["processingDays"]}
    def prices(report: dict[str, object]) -> dict[str, object]:
        return {"nonGspNonMsc": report["prices"]["nonGsp"], "gspNonMsc": report["prices"]["gsp"]}
    def port(report: dict[str, object], details: bool) -> dict[str, object]:
        lanes = {"active": report["unloading"], "completed": report["completedDischarging"], "incoming": report["incoming"]}
        return {key: (value if details else {"declaredCount": value["declaredCount"], "recordCount": value["recordCount"]}) for key, value in lanes.items()}
    latest_report = reports[-1]
    latest = {"reportDate": latest_report["reportDate"], "operationalAsOf": None, "port": port(latest_report, True), "canneries": latest_report["canneries"], "canneryTotal": total(latest_report), "prices": prices(latest_report), "source": latest_report["source"]}
    return {
        "schemaVersion": 1,
        "metadata": {
            "status": "STATIC",
            "reportCount": len(reports),
            "pageCount": sum(int(source["pages"]) for source in sources),
            "firstReportDate": reports[0]["reportDate"],
            "coverageStart": reports[0]["reportDate"],
            "coverageEnd": reports[-1]["reportDate"],
            "latestReportDate": reports[-1]["reportDate"],
        },
        "weekly": [{"reportDate": report["reportDate"], "operationalAsOf": None, "port": port(report, False), "canneryTotal": total(report), "prices": prices(report), "volume2026": {"year": 2026, "months": month_array(report["volume"]["annual"]["2026"]["months"]), "total": report["volume"]["annual"]["2026"]["total"]}} for report in reports],
        "latest": latest,
        "volumeHistory": {"excludesFreshTuna": True, "unit": None, "annual": annual_array(latest_report["volume"]["annual"]), "snapshots": [{"reportDate": report["reportDate"], "volume2026": {"months": month_array(report["volume"]["annual"]["2026"]["months"]), "total": report["volume"]["annual"]["2026"]["total"]}} for report in reports], "revisions": revisions},
        "sources": sources,
        "qualityFlags": build_quality_flags(reports, revisions),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path)
    parser.add_argument("--output", type=Path, default=Path(__file__).parents[1] / "data/gmts_dashboard.json")
    args = parser.parse_args()
    source_dir = args.source_dir or Path(os.environ.get("GMTS_SOURCE_DIR", DEFAULT_SOURCE_DIR))
    dashboard = build_dashboard(source_dir)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(dashboard, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"GMTS dashboard generated: {args.output} ({dashboard['metadata']['reportCount']} reports, latest {dashboard['metadata']['latestReportDate']})")


if __name__ == "__main__":
    main()
