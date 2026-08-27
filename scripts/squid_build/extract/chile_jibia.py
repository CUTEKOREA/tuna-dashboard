"""Extract Chile jibia quota consumption from SUBPESCA Markdown and SERNAPESCA XLSX."""

from __future__ import annotations

import re
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

from ..spec import WidgetSpec


MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS = {"m": MAIN_NS, "r": REL_NS}


def _local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _column_index(reference: str) -> int:
    letters = "".join(char for char in reference if char.isalpha())
    index = 0
    for char in letters:
        index = index * 26 + ord(char.upper()) - ord("A") + 1
    return index - 1


def _shared_strings(book: ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in book.namelist():
        return []
    root = ET.fromstring(book.read("xl/sharedStrings.xml"))
    return [
        "".join(node.text or "" for node in item.iter() if _local_name(node.tag) == "t")
        for item in root.findall(f"{{{MAIN_NS}}}si")
    ]


def _cell_value(cell: ET.Element, shared: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        return "".join(
            node.text or "" for node in cell.iter() if _local_name(node.tag) == "t"
        )
    value = cell.find(f"{{{MAIN_NS}}}v")
    raw = "" if value is None else value.text or ""
    if cell_type == "s" and raw:
        return shared[int(raw)]
    return raw


def _sheet_target(book: ZipFile, sheet_name: str) -> str:
    workbook = ET.fromstring(book.read("xl/workbook.xml"))
    relationships = ET.fromstring(book.read("xl/_rels/workbook.xml.rels"))
    targets = {
        relation.attrib["Id"]: relation.attrib["Target"]
        for relation in relationships
    }
    for sheet in workbook.findall(".//m:sheet", NS):
        if sheet.attrib.get("name") != sheet_name:
            continue
        target = targets[sheet.attrib[f"{{{REL_NS}}}id"]]
        if target.startswith("/"):
            return target.lstrip("/")
        return "xl/" + target.lstrip("/")
    raise ValueError(f"XLSX sheet missing: {sheet_name}")


def _read_xlsx_matrix(path: Path, sheet_name: str) -> list[dict[int, str]]:
    """Read worksheet cells by zero-based column using only the standard library."""
    with ZipFile(path) as book:
        shared = _shared_strings(book)
        root = ET.fromstring(book.read(_sheet_target(book, sheet_name)))
    matrix: list[dict[int, str]] = []
    for row in root.findall(".//m:sheetData/m:row", NS):
        values = {
            _column_index(cell.attrib["r"]): _cell_value(cell, shared)
            for cell in row.findall("m:c", NS)
        }
        matrix.append(values)
    return matrix


def read_xlsx_rows(path: Path, sheet_name: str) -> list[dict[str, str]]:
    """Read a simple worksheet table using only the Python standard library."""
    matrix = _read_xlsx_matrix(path, sheet_name)
    if not matrix:
        return []
    header_row = next(
        values for values in matrix if any(value == "unidad" for value in values.values())
    )
    headers = {column: value for column, value in header_row.items() if value}
    header_position = matrix.index(header_row)
    return [
        {header: values.get(column, "") for column, header in headers.items()}
        for values in matrix[header_position + 1 :]
        if any(values.get(column, "") for column in headers)
    ]


def _decimal(value: str, label: str) -> Decimal:
    try:
        return Decimal(value)
    except InvalidOperation as exc:
        raise ValueError(f"invalid Chile {label}: {value!r}") from exc


def _number(value: Decimal, places: int | None = None) -> int | float:
    if places is not None:
        value = round(value, places)
    if value == value.to_integral_value():
        return int(value)
    return float(value)


def _legal_quota(markdown: str) -> Decimal:
    patterns = (
        r"Cuota\s+Global\s+de\s+Captura\s+([0-9][0-9.\s]+)",
        r"cuota\s+global\s+de\s+captura.*?ascendente\s+a\s+([0-9][0-9.\s]+)\s+toneladas",
    )
    for pattern in patterns:
        match = re.search(pattern, markdown, flags=re.IGNORECASE | re.DOTALL)
        if match:
            digits = re.sub(r"\D", "", match.group(1))
            if digits:
                return Decimal(digits)
    raise ValueError("SUBPESCA Markdown is missing the 2026 global quota")


def _excel_date(value: str) -> str:
    try:
        serial = int(Decimal(value))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f"invalid Chile preliminary date: {value!r}") from exc
    return (date(1899, 12, 30) + timedelta(days=serial)).isoformat()


def _sidecar_field(path: Path, field: str, fallback: str) -> str:
    sidecar = path.with_suffix(".md")
    if not sidecar.exists():
        return fallback
    match = re.search(rf"^- {re.escape(field)}:\s*([^\n]+)$", sidecar.read_text(encoding="utf-8"), re.M)
    return match.group(1).strip() if match else fallback


def _summary_rows(path: Path) -> tuple[str, dict[str, Decimal], list[dict[str, Decimal | str]]]:
    matrix = _read_xlsx_matrix(path, "RESUMEN")
    header_position = next(
        index
        for index, values in enumerate(matrix)
        if "FRACCIONAMIENTO" in values.values() and "CAPTURA (TON)" in values.values()
    )
    header = matrix[header_position]

    def column(label: str) -> int:
        return next(column for column, value in header.items() if value == label)

    segment_column = column("FRACCIONAMIENTO")
    allocation_column = column("CUOTA ASIGNADA (TON)")
    effective_column = column("CUOTA EFECTIVA (TON)")
    capture_column = column("CAPTURA (TON)")
    balance_column = column("SALDO (TON)")
    consumption_column = column("CONSUMO %")

    date_value = next(
        value
        for values in matrix[:header_position]
        for value in values.values()
        if re.fullmatch(r"4\d{4}(?:\.0+)?", value or "")
    )
    as_of = _excel_date(date_value)

    segment_names = {"FA": "FAUNA ACOMPAÑANTE"}
    breakdown: list[dict[str, Decimal | str]] = []
    total: dict[str, Decimal] | None = None
    for values in matrix[header_position + 1 :]:
        segment = values.get(segment_column, "").strip()
        if not segment:
            continue
        row = {
            "allocation": _decimal(values.get(allocation_column, ""), "allocation"),
            "effective": _decimal(values.get(effective_column, ""), "effective quota"),
            "capture": _decimal(values.get(capture_column, ""), "capture"),
            "balance": _decimal(values.get(balance_column, ""), "balance"),
            "consumption": _decimal(values.get(consumption_column, ""), "consumption"),
        }
        if segment == "TOTAL":
            total = row
            break
        breakdown.append({"segment": segment_names.get(segment, segment), **row})

    if total is None:
        raise ValueError("Chile RESUMEN sheet is missing TOTAL")
    if len(breakdown) != 4:
        raise ValueError(f"expected four Chile RESUMEN segments; got {len(breakdown)}")
    return as_of, total, breakdown


def extract_chile_jibia(archive_root: Path, spec: WidgetSpec) -> dict:
    xlsx_rel = next(path for path in spec.archive_paths if path.lower().endswith(".xlsx"))
    markdown_rel = next(path for path in spec.archive_paths if path.lower().endswith(".md"))
    xlsx_path = Path(archive_root) / xlsx_rel
    markdown_path = Path(archive_root) / markdown_rel
    legal_quota = _legal_quota(markdown_path.read_text(encoding="utf-8", errors="replace"))
    as_of, total, summary_breakdown = _summary_rows(xlsx_path)
    if total["allocation"] != legal_quota or total["effective"] != legal_quota:
        raise ValueError(
            "Chile RESUMEN total quota disagrees with SUBPESCA legal quota: "
            f"{total['allocation']} / {total['effective']} vs {legal_quota}"
        )
    if abs(total["balance"] - (legal_quota - total["capture"])) > Decimal("0.0001"):
        raise ValueError("Chile RESUMEN capture and balance do not reconcile to legal quota")
    breakdown = [
        {
            "segment": str(row["segment"]),
            "allocation_tonnes": _number(Decimal(row["allocation"]), 4),
            "capture_tonnes": _number(Decimal(row["capture"]), 4),
            "balance_tonnes": _number(Decimal(row["balance"]), 4),
            "consumption_pct": _number(Decimal(row["consumption"]) * Decimal(100), 4),
        }
        for row in summary_breakdown
    ]
    data = {
        "as_of": as_of,
        "legal_quota_tonnes": _number(legal_quota),
        "recorded_capture_tonnes": _number(total["capture"], 4),
        "quota_minus_recorded_capture_tonnes": _number(total["balance"], 4),
        "consumption_pct": _number(total["consumption"] * Decimal(100), 4),
        "denominator_source": markdown_rel,
        "numerator_source": xlsx_rel,
        "breakdown": breakdown,
    }
    return {
        "chartType": spec.chart_type,
        "data": data,
        "series": ["recorded_capture_tonnes", "quota_minus_recorded_capture_tonnes"],
        "unit": "톤·%",
        "methodology": "칠레 수산차관부 법정 총쿼터를 분모로, 칠레 수산청 엑셀 요약 시트의 합계 포획·잔량·소진율과 4개 배분행을 직접 적재",
        "basis": {
            "coverage_start": "2026-01-01",
            "coverage_end": as_of,
            "published_at": _sidecar_field(xlsx_path, "publication_date", "2026-08-20"),
            "retrieved_at": _sidecar_field(xlsx_path, "retrieved_at", "2026-08-27"),
            "metrics": list(spec.metrics),
        },
    }
