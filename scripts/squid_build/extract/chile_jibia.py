"""Extract Chile jibia quota consumption from SUBPESCA Markdown and SERNAPESCA XLSX."""

from __future__ import annotations

import re
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


def read_xlsx_rows(path: Path, sheet_name: str) -> list[dict[str, str]]:
    """Read a simple worksheet table using only the Python standard library."""
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


def extract_chile_jibia(archive_root: Path, spec: WidgetSpec) -> dict:
    xlsx_rel = next(path for path in spec.archive_paths if path.lower().endswith(".xlsx"))
    markdown_rel = next(path for path in spec.archive_paths if path.lower().endswith(".md"))
    xlsx_path = Path(archive_root) / xlsx_rel
    markdown_path = Path(archive_root) / markdown_rel
    legal_quota = _legal_quota(markdown_path.read_text(encoding="utf-8", errors="replace"))
    rows = read_xlsx_rows(xlsx_path, "Página web")
    selected = [
        row
        for row in rows
        if (
            row.get("organizacion_titular_area") == "OBJETIVO"
            and row.get("tipo_asignatario") in {"ARTESANAL", "INDUSTRIAL"}
        )
        or (
            row.get("organizacion_titular_area") == "FAUNA ACOMPAÑANTE"
            and row.get("tipo_asignatario") == "ARTESANAL-INDUSTRIAL"
        )
    ]
    if len(selected) != 3:
        raise ValueError(f"expected three non-duplicate Chile capture rows; got {len(selected)}")

    captured = sum((_decimal(row["captura"], "captura") for row in selected), Decimal(0))
    breakdown = [
        {
            "segment": row["tipo_asignatario"],
            "allocation_tonnes": _number(_decimal(row["cuota"], "cuota"), 4),
            "capture_tonnes": _number(_decimal(row["captura"], "captura"), 4),
            "balance_tonnes": _number(_decimal(row["saldo"], "saldo"), 4),
            "consumption_pct": _number(
                _decimal(row["consumo_porcentaje"], "consumo_porcentaje") * Decimal(100),
                4,
            ),
        }
        for row in selected
    ]
    data = {
        "as_of": "2026-08-06",
        "legal_quota_tonnes": _number(legal_quota),
        "recorded_capture_tonnes": _number(captured, 4),
        "quota_minus_recorded_capture_tonnes": _number(legal_quota - captured, 4),
        "consumption_pct": _number(captured / legal_quota * Decimal(100), 4),
        "denominator_source": markdown_rel,
        "numerator_source": xlsx_rel,
        "breakdown": breakdown,
    }
    return {
        "chartType": spec.chart_type,
        "data": data,
        "series": ["recorded_capture_tonnes", "quota_minus_recorded_capture_tonnes"],
        "unit": "톤·%",
        "methodology": "SUBPESCA 법정 총쿼터를 분모로, SERNAPESCA XLSX의 중복 없는 3개 OBJETIVO 포획행 합계를 분자로 계산",
        "basis": {
            "coverage_start": "2026-01-01",
            "coverage_end": "2026-08-06",
            "published_at": "2026-08-06",
            "retrieved_at": "2026-08-12",
            "metrics": list(spec.metrics),
        },
    }
