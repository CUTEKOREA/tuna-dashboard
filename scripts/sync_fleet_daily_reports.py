#!/usr/bin/env python3
"""Build the bounded fleet-daily intake JSON from daily DOCX reports."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
import unicodedata
import zipfile
from collections import Counter
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any, Iterable, Sequence
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "lib/data/generated/fleet-daily-private.json"
DEFAULT_PUBLIC_OUTPUT = ROOT / "lib/data/generated/fleet-daily-public.json"
DEFAULT_DETAIL_OUTPUT = ROOT / "artifacts/fleet-daily-detail.json"
FLEET_DAILY_COVERAGE_START = "2026-01-16"
# 2026-08-19 사용자 지시: 원문 정본 폴더를 「001. (매일)해양수산본부일일업무보고」로 병합
DEFAULT_SOURCE_COMPONENTS = (
    "Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/11. 태국/"
    "001. (매일)해양수산본부일일업무보고"
).split("/")
FILENAME_DATE = re.compile(r"일일\s*업무보고\s*-?\s*(\d{6})(?:\D|$)", re.IGNORECASE)
NUMBER = re.compile(r"[-+]?\d[\d,]*(?:\.\d+)?")
COORDINATE = re.compile(r"^[NS]\d{4}\s+[EW]\d{5}(?:\s+\([A-Z]+\))?$")
WORD = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


class FleetDailySyncError(RuntimeError):
    """The source documents do not meet the daily fleet intake contract."""


@dataclass(frozen=True)
class Amount:
    raw: str
    value: float | None
    parenthetical: float | None


def nfc(value: str) -> str:
    return unicodedata.normalize("NFC", value)


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()


def compact_amount(value: str) -> str:
    compacted = normalize_text(value)
    compacted = re.sub(r"(?<=\d)\s+(?=\d)", "", compacted)
    compacted = re.sub(r"\s*([,().])\s*", r"\1", compacted)
    return compacted


def number(value: str) -> float | None:
    match = NUMBER.search(value.replace(" ", ""))
    return float(match.group(0).replace(",", "")) if match else None


def display_number(value: float | None) -> int | float | None:
    if value is None:
        return None
    return int(value) if value.is_integer() else value


def parse_amount(value: str) -> Amount:
    raw = compact_amount(value)
    # 원문 `-`는 미기입이 아니라 0톤(당일 무어획·무선적).
    if raw in {"", "-"}:
        return Amount(raw=raw or "-", value=0, parenthetical=None)
    base_match = re.match(r"^\(?([-+]?\d[\d,]*(?:\.\d+)?)", raw)
    approximate_match = re.match(r"^\(약\s*([-+]?\d[\d,]*(?:\.\d+)?)톤?\)$", raw)
    numeric = base_match.group(1) if base_match else approximate_match.group(1) if approximate_match else None
    base = float(numeric.replace(",", "")) if numeric else None
    parenthetical_match = re.match(r"^[-+]?\d[\d,]*(?:\.\d+)?\(([-+]?\d[\d,]*(?:\.\d+)?)\)", raw)
    parenthetical = float(parenthetical_match.group(1).replace(",", "")) if parenthetical_match else None
    return Amount(raw=raw, value=display_number(base), parenthetical=display_number(parenthetical))


def filename_report_date(path: Path) -> str:
    name = nfc(path.name)
    match = FILENAME_DATE.search(name)
    if not match:
        raise FleetDailySyncError(f"보고일을 파일명에서 읽을 수 없습니다: {name}")
    raw = match.group(1)
    try:
        return date(2000 + int(raw[:2]), int(raw[2:4]), int(raw[4:6])).isoformat()
    except ValueError as error:
        raise FleetDailySyncError(f"파일명의 보고일이 유효하지 않습니다: {name}") from error


def default_source_dir() -> Path:
    base = Path.home()
    candidates = [base.joinpath(*DEFAULT_SOURCE_COMPONENTS)]
    candidates.extend(Path(unicodedata.normalize(form, str(candidates[0]))) for form in ("NFD", "NFC"))
    for candidate in candidates:
        if candidate.is_dir():
            return candidate
    parent = base.joinpath(*DEFAULT_SOURCE_COMPONENTS[:-1])
    for normalized_parent in (parent, Path(unicodedata.normalize("NFD", str(parent))), Path(unicodedata.normalize("NFC", str(parent)))):
        if not normalized_parent.is_dir():
            continue
        expected = nfc(DEFAULT_SOURCE_COMPONENTS[-1])
        for candidate in normalized_parent.iterdir():
            if candidate.is_dir() and nfc(candidate.name) == expected:
                return candidate
    return candidates[0]


def report_entry(candidate: Path, *, required: bool) -> tuple[str, Path] | None:
    if not candidate.is_file() or candidate.suffix.casefold() != ".docx":
        if required:
            raise FleetDailySyncError(f"추가 원문 DOCX를 찾을 수 없습니다: {candidate}")
        return None
    compact_name = re.sub(r"\s+", "", nfc(candidate.stem))
    if "해양수산본부일일업무보고" not in compact_name:
        if required:
            raise FleetDailySyncError(f"추가 원문이 해양수산본부 일일업무보고가 아닙니다: {nfc(candidate.name)}")
        return None
    report_date = filename_report_date(candidate)
    if report_date < FLEET_DAILY_COVERAGE_START:
        if required:
            raise FleetDailySyncError(
                f"추가 원문이 공개 범위 시작일({FLEET_DAILY_COVERAGE_START})보다 이전입니다: {report_date}"
            )
        return None
    return report_date, candidate


def iter_reports(
    source_dir: Path,
    additional_reports: Iterable[Path] = (),
) -> list[tuple[str, Path]]:
    if not source_dir.is_dir():
        raise FleetDailySyncError(f"원문 폴더를 찾을 수 없습니다: {source_dir}")
    reports: list[tuple[str, Path]] = []
    for candidate in source_dir.iterdir():
        entry = report_entry(candidate, required=False)
        if entry is not None:
            reports.append(entry)
    for candidate in additional_reports:
        entry = report_entry(candidate, required=True)
        if entry is not None:
            reports.append(entry)
    if not reports:
        raise FleetDailySyncError(f"DOCX 원문이 없습니다: {source_dir}")
    reports.sort(key=lambda item: item[0])
    duplicate_dates = [report_date for report_date, count in Counter(item[0] for item in reports).items() if count > 1]
    if duplicate_dates:
        raise FleetDailySyncError(f"파일명 보고일이 중복됩니다: {', '.join(sorted(duplicate_dates))}")
    return reports


def text_of(element: ElementTree.Element) -> str:
    return normalize_text("".join(element.itertext()))


def read_docx_blocks(path: Path) -> list[tuple[str, Any]]:
    try:
        with zipfile.ZipFile(path) as archive:
            xml = archive.read("word/document.xml")
    except (OSError, KeyError, zipfile.BadZipFile) as error:
        raise FleetDailySyncError(f"DOCX 본문을 읽을 수 없습니다: {nfc(path.name)}") from error
    try:
        root = ElementTree.fromstring(xml)
    except ElementTree.ParseError as error:
        raise FleetDailySyncError(f"DOCX XML이 올바르지 않습니다: {nfc(path.name)}") from error

    body = root.find(f"{WORD}body")
    if body is None:
        raise FleetDailySyncError(f"DOCX 본문이 없습니다: {nfc(path.name)}")
    blocks: list[tuple[str, Any]] = []
    for child in body:
        if child.tag == f"{WORD}p":
            value = text_of(child)
            if value:
                blocks.append(("paragraph", value))
        elif child.tag == f"{WORD}tbl":
            rows: list[list[str]] = []
            for row in child.findall(f"{WORD}tr"):
                values: list[str] = []
                for index, cell in enumerate(row.findall(f"{WORD}tc")):
                    vertical_merge = cell.find(f"{WORD}tcPr/{WORD}vMerge")
                    is_continuation = vertical_merge is not None and vertical_merge.get(f"{WORD}val") != "restart"
                    values.append(rows[-1][index] if is_continuation and len(rows) > 1 and index < len(rows[-1]) else text_of(cell))
                rows.append(values)
            if rows:
                blocks.append(("table", rows))
    return blocks


def compact(value: str) -> str:
    return re.sub(r"\s+", "", value.replace("\xa0", " "))


def section_from_heading(value: str) -> str | None:
    normalized = compact(value)
    if "연승" in normalized:
        return "longline"
    if "태평양" in normalized and "선망" in normalized:
        return "pacific"
    if "대서양" in normalized and "선망" in normalized:
        return "atlantic"
    if "운반선" in normalized:
        return "carrier"
    return None


def parse_summary(value: str, report_date: str) -> tuple[str, dict[str, int | float]] | None:
    section = section_from_heading(value)
    if section not in {"pacific", "atlantic"}:
        return None
    normalized = compact(value)
    values: dict[str, int | float] = {}
    for key, label in (("dailyMt", "일간"), ("monthlyMt", "월간"), ("annualMt", "연간")):
        match = re.search(label + r"(?:누계)?[:：]?([\d,.]+)톤", normalized)
        if not match:
            raise FleetDailySyncError(f"{report_date} {section} {label} 수치를 읽을 수 없습니다")
        parsed = number(match.group(1))
        if parsed is None:
            raise FleetDailySyncError(f"{report_date} {section} {label} 수치가 올바르지 않습니다")
        values[key] = display_number(parsed)
    as_of = re.search(r"선망[:：]?(\d{1,2})/(\d{1,2})", normalized)
    if not as_of:
        raise FleetDailySyncError(f"{report_date} {section} 조업 기준일을 읽을 수 없습니다")
    report_year = int(report_date[:4])
    try:
        values["asOf"] = date(report_year, int(as_of.group(1)), int(as_of.group(2))).isoformat()
    except ValueError as error:
        raise FleetDailySyncError(f"{report_date} {section} 조업 기준일이 올바르지 않습니다") from error
    return section, values


def header_index(header: list[str], label: str) -> int | None:
    for index, value in enumerate(header):
        if compact(value) == label:
            return index
    return None


def table_section(header: list[str], active_section: str | None) -> str | None:
    normalized = [compact(value) for value in header]
    if "예상잔량" in normalized:
        return "carrier"
    if "위치" in normalized and "어획량" in normalized:
        return active_section if active_section in {"pacific", "atlantic"} else None
    if "선적량" in normalized and active_section == "longline":
        return "longline"
    return None


def cell_at(row: list[str], index: int | None) -> str:
    return row[index] if index is not None and index < len(row) else ""


def parse_vessels(rows: list[list[str]]) -> list[dict[str, Any]]:
    header = rows[0]
    name_index = header_index(header, "선박")
    position_index = header_index(header, "위치")
    catch_index = header_index(header, "어획량")
    loaded_index = header_index(header, "선적량")
    note_index = header_index(header, "비고")
    vessels: list[dict[str, Any]] = []
    for row in rows[1:]:
        name = normalize_text(cell_at(row, name_index))
        if not name or compact(name) in {"합계", "총계"}:
            continue
        catch = parse_amount(cell_at(row, catch_index))
        loaded = parse_amount(cell_at(row, loaded_index))
        vessel: dict[str, Any] = {
            "name": name,
            "position": normalize_text(cell_at(row, position_index)),
            "catchMt": catch.value,
            "catchMtRaw": catch.raw,
            "catchMtParenthetical": catch.parenthetical,
            "loadedMt": loaded.value,
            "loadedMtRaw": loaded.raw,
            "loadedMtParenthetical": loaded.parenthetical,
            "note": normalize_text(cell_at(row, note_index)),
        }
        vessels.append(vessel)
    return vessels


def parse_carrier(rows: list[list[str]]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    header = rows[0]
    name_index = header_index(header, "선박")
    loaded_index = header_index(header, "선적량")
    remaining_index = header_index(header, "예상잔량")
    plan_index = header_index(header, "선적현황")
    note_index = header_index(header, "비고")
    total: dict[str, Any] = {}
    vessels: list[dict[str, Any]] = []
    for row in rows[1:]:
        name = normalize_text(cell_at(row, name_index))
        loaded = parse_amount(cell_at(row, loaded_index))
        remaining = parse_amount(cell_at(row, remaining_index))
        if compact(name) in {"합계", "총계"} or (not name and (loaded.value is not None or remaining.value is not None)):
            total = {
                "loadedTotalMt": loaded.value,
                "loadedTotalMtRaw": loaded.raw,
                "loadedTotalParentheticalMt": loaded.parenthetical,
                "expectedRemainingMt": remaining.value,
                "expectedRemainingMtRaw": remaining.raw,
                "expectedRemainingParentheticalMt": remaining.parenthetical,
            }
            continue
        if not name:
            continue
        vessels.append({
            "name": name,
            "entityType": "container" if "컨테이너" in name else "vessel",
            "loadedMt": loaded.value,
            "loadedMtRaw": loaded.raw,
            "loadedMtParenthetical": loaded.parenthetical,
            "expectedRemainingMt": remaining.value,
            "expectedRemainingMtRaw": remaining.raw,
            "expectedRemainingParentheticalMt": remaining.parenthetical,
            "loadPlan": normalize_text(cell_at(row, plan_index)),
            "note": normalize_text(cell_at(row, note_index)),
        })
    if not total:
        raise FleetDailySyncError("운반선 표의 합계 행을 읽을 수 없습니다")
    return total, vessels


def parse_longline(rows: list[list[str]]) -> list[dict[str, Any]]:
    header = rows[0]
    name_index = header_index(header, "선박")
    loaded_index = header_index(header, "선적량")
    note_index = header_index(header, "비고")
    vessels: list[dict[str, Any]] = []
    for row in rows[1:]:
        name = normalize_text(cell_at(row, name_index))
        if not name or compact(name) in {"합계", "총계"}:
            continue
        loaded = parse_amount(cell_at(row, loaded_index))
        vessels.append({
            "name": name,
            "loadedMt": loaded.value,
            "loadedMtRaw": loaded.raw,
            "loadedMtParenthetical": loaded.parenthetical,
            "note": normalize_text(cell_at(row, note_index)),
        })
    return vessels


def reconciliation_check(
    report_date: str,
    field: str,
    reported: float | int | None,
    values: Iterable[float | int | None],
) -> dict[str, Any]:
    row_values = list(values)
    known_rows_mt = display_number(float(sum(value for value in row_values if value is not None)))
    missing_count = sum(value is None for value in row_values)
    if reported is None:
        status = "reportedMissing"
    elif missing_count == 0:
        status = "completeMatch" if abs(float(reported) - float(known_rows_mt)) < 0.001 else "completeMismatch"
    elif float(known_rows_mt) - float(reported) >= 0.001:
        status = "knownRowsExceedReported"
    elif abs(float(reported) - float(known_rows_mt)) >= 0.001:
        status = "incompletePartialDifference"
    else:
        status = "incompleteUnavailable"
    return {
        "reportDate": report_date,
        "field": field,
        "reportedMt": reported,
        "knownRowsMt": known_rows_mt,
        "missingCount": missing_count,
        "status": status,
    }


def validate_position(value: str) -> bool:
    normalized = normalize_text(value)
    return not re.match(r"^[NS]\d", normalized) or bool(COORDINATE.fullmatch(normalized))


def parse_report(report_date: str, path: Path) -> tuple[dict[str, Any], dict[str, list[Any]]]:
    summaries: dict[str, dict[str, Any]] = {}
    tables: dict[str, list[list[str]]] = {}
    active_section: str | None = None
    for kind, value in read_docx_blocks(path):
        if kind == "paragraph":
            active_section = section_from_heading(value) or active_section
            summary = parse_summary(value, report_date)
            if summary:
                summaries[summary[0]] = summary[1]
            continue
        section = table_section(value[0], active_section)
        if section:
            tables[section] = value

    missing = [section for section in ("pacific", "atlantic", "carrier") if section not in summaries and section != "carrier"]
    missing.extend(section for section in ("pacific", "atlantic", "carrier") if section not in tables)
    if missing:
        raise FleetDailySyncError(f"{report_date} 필수 구역이 없습니다: {', '.join(sorted(set(missing)))}")

    pacific_vessels = parse_vessels(tables["pacific"])
    atlantic_vessels = parse_vessels(tables["atlantic"])
    carrier, carrier_vessels = parse_carrier(tables["carrier"])
    longline_vessels = parse_longline(tables["longline"]) if "longline" in tables else []
    issues: dict[str, list[Any]] = {"reconciliationChecks": [], "duplicateVessel": [], "coordinate": [], "longlineMissing": []}
    for field, reported, values in (
        ("pacific.dailyMt", summaries["pacific"]["dailyMt"], (vessel["catchMt"] for vessel in pacific_vessels)),
        ("atlantic.dailyMt", summaries["atlantic"]["dailyMt"], (vessel["catchMt"] for vessel in atlantic_vessels)),
        ("carrier.loadedMt", carrier["loadedTotalMt"], (vessel["loadedMt"] for vessel in carrier_vessels)),
        ("carrier.expectedRemainingMt", carrier["expectedRemainingMt"], (vessel["expectedRemainingMt"] for vessel in carrier_vessels)),
    ):
        issues["reconciliationChecks"].append(reconciliation_check(report_date, field, reported, values))
    if any(count > 1 for count in Counter(vessel["name"] for vessel in pacific_vessels + atlantic_vessels).values()):
        issues["duplicateVessel"].append(report_date)
    if any(not validate_position(vessel["position"]) for vessel in pacific_vessels + atlantic_vessels if vessel["position"]):
        issues["coordinate"].append(report_date)
    if "longline" not in tables:
        issues["longlineMissing"].append(report_date)

    as_of = summaries["pacific"]["asOf"]
    if summaries["atlantic"]["asOf"] != as_of:
        raise FleetDailySyncError(f"{report_date} 태평양/대서양 조업 기준일이 다릅니다")
    return {
        "reportDate": report_date,
        "asOf": as_of,
        "pacific": {**summaries["pacific"], "vessels": pacific_vessels},
        "atlantic": {**summaries["atlantic"], "vessels": atlantic_vessels},
        "carrier": {**carrier, "vessels": carrier_vessels},
        "longline": {"vessels": longline_vessels},
    }, issues


def compact_summary(report: dict[str, Any]) -> dict[str, Any]:
    return {
        "reportDate": report["reportDate"],
        "asOf": report["asOf"],
        "pacific": {key: report["pacific"][key] for key in ("dailyMt", "monthlyMt", "annualMt")},
        "atlantic": {key: report["atlantic"][key] for key in ("dailyMt", "monthlyMt", "annualMt")},
        "carrier": {key: report["carrier"][key] for key in ("loadedTotalMt", "loadedTotalMtRaw", "loadedTotalParentheticalMt", "expectedRemainingMt", "expectedRemainingMtRaw", "expectedRemainingParentheticalMt")},
    }


def build_payload(
    source_dir: Path,
    additional_reports: Iterable[Path] = (),
) -> dict[str, Any]:
    parsed: list[dict[str, Any]] = []
    quality = {
        "reconciliationChecks": [],
        "duplicateVesselRows": [],
        "coordinateFormatIssues": [],
        "longlineSectionMissing": [],
    }
    for report_date, path in iter_reports(source_dir, additional_reports):
        report, issues = parse_report(report_date, path)
        parsed.append(report)
        checks = issues["reconciliationChecks"]
        quality["reconciliationChecks"].extend(checks)
        quality["duplicateVesselRows"].extend(issues["duplicateVessel"])
        quality["coordinateFormatIssues"].extend(issues["coordinate"])
        quality["longlineSectionMissing"].extend(issues["longlineMissing"])
    latest, previous = parsed[-1], parsed[-2]
    reconciliation_checks = quality["reconciliationChecks"]
    reconciliation_issues = [
        check
        for check in reconciliation_checks
        if check["status"] in {"completeMismatch", "knownRowsExceedReported"}
    ]
    reconciliation_partial_differences = [
        check
        for check in reconciliation_checks
        if check["status"] in {"completeMismatch", "knownRowsExceedReported", "incompletePartialDifference"}
    ]
    reconciliation_unavailable = [
        check
        for check in reconciliation_checks
        if check["status"] not in {"completeMatch", "completeMismatch"}
    ]
    quality["counts"] = {
        "reconciliationChecks": len(reconciliation_checks),
        "reconciliationCompleteChecks": len(reconciliation_checks) - len(reconciliation_unavailable),
        "reconciliationUnavailableChecks": len(reconciliation_unavailable),
        "reconciliationUnavailableDocuments": len({check["reportDate"] for check in reconciliation_unavailable}),
        "reconciliationIssues": len(reconciliation_issues),
        "reconciliationDocuments": len({issue["reportDate"] for issue in reconciliation_issues}),
        "reconciliationPartialDifferences": len(reconciliation_partial_differences),
        "reconciliationPartialDifferenceDocuments": len({difference["reportDate"] for difference in reconciliation_partial_differences}),
        "duplicateVesselRows": len(quality["duplicateVesselRows"]),
        "coordinateFormatIssues": len(quality["coordinateFormatIssues"]),
        "longlineSectionMissing": len(quality["longlineSectionMissing"]),
    }
    return {
        "_meta": {"schemaVersion": 1, "reportCount": len(parsed), "firstReportDate": parsed[0]["reportDate"], "latestReportDate": latest["reportDate"], "latestAsOf": latest["asOf"]},
        "latest": latest,
        "previous": compact_summary(previous),
        "daily": [compact_summary(report) for report in parsed],
        "quality": quality,
    }


def public_reconciliation_result(check: dict[str, Any]) -> dict[str, Any]:
    reported = check["reportedMt"]
    missing_count = check["missingCount"]
    if reported is None or missing_count > 0:
        rows_mt = None
        matches = None
    else:
        rows_mt = check["knownRowsMt"]
        matches = abs(float(reported) - float(rows_mt)) < 0.001
    return {
        "reportedMt": reported,
        "rowsMt": rows_mt,
        "matches": matches,
        "missingCount": missing_count,
    }


def build_public_payload(payload: dict[str, Any], detail_sha256: str) -> dict[str, Any]:
    latest = payload["latest"]
    previous = payload["previous"]
    latest_checks = {
        check["field"]: check
        for check in payload["quality"]["reconciliationChecks"]
        if check["reportDate"] == latest["reportDate"]
    }
    expected_fields = {
        "pacific.dailyMt",
        "atlantic.dailyMt",
        "carrier.loadedMt",
        "carrier.expectedRemainingMt",
    }
    if set(latest_checks) != expected_fields:
        raise FleetDailySyncError("최신 공개 검산 필드가 완전하지 않습니다")

    reconciliation = {
        "pacificDaily": public_reconciliation_result(latest_checks["pacific.dailyMt"]),
        "atlanticDaily": public_reconciliation_result(latest_checks["atlantic.dailyMt"]),
        "carrierLoaded": public_reconciliation_result(latest_checks["carrier.loadedMt"]),
        "carrierExpectedRemaining": public_reconciliation_result(latest_checks["carrier.expectedRemainingMt"]),
    }
    latest_issue_count = sum(
        check["status"] in {"completeMismatch", "knownRowsExceedReported"}
        for check in latest_checks.values()
    )
    reconciliation.update({
        "valid": latest_issue_count == 0 and all(result["matches"] is True for result in reconciliation.values()),
        "unavailableCount": sum(result["matches"] is None for result in reconciliation.values()),
        "issueCount": latest_issue_count,
    })

    incomplete_checks = [
        check
        for check in payload["quality"]["reconciliationChecks"]
        if check["status"] == "incompletePartialDifference"
    ]
    pacific_delta = latest["pacific"]["dailyMt"] - previous["pacific"]["dailyMt"]
    atlantic_delta = latest["atlantic"]["dailyMt"] - previous["atlantic"]["dailyMt"]
    return {
        "_meta": {**payload["_meta"], "detailSha256": detail_sha256},
        "latest": {
            "reportDate": latest["reportDate"],
            "asOf": latest["asOf"],
            "pacific": {key: latest["pacific"][key] for key in ("asOf", "dailyMt", "monthlyMt", "annualMt")},
            "atlantic": {key: latest["atlantic"][key] for key in ("asOf", "dailyMt", "monthlyMt", "annualMt")},
            "carrier": {
                "loadedTotalMt": latest["carrier"]["loadedTotalMt"],
                "expectedRemainingMt": latest["carrier"]["expectedRemainingMt"],
            },
        },
        "deltas": {
            "pacificDailyMt": display_number(float(pacific_delta)),
            "atlanticDailyMt": display_number(float(atlantic_delta)),
            "totalDailyMt": display_number(float(pacific_delta + atlantic_delta)),
        },
        "reconciliation": reconciliation,
        "quality": {
            "counts": payload["quality"]["counts"],
            "incompletePartialDifferences": len(incomplete_checks),
            "incompletePartialDifferenceDocuments": len({check["reportDate"] for check in incomplete_checks}),
        },
    }


def parse_carrier_display_name(name: str) -> tuple[str, int | None]:
    match = re.match(r"^(.*?)\s*\(([\d,]+)\)(.*)$", name)
    if not match:
        return name, None
    display_name = " ".join(part.strip() for part in (match.group(1), match.group(3)) if part.strip())
    return display_name, int(match.group(2).replace(",", ""))


def build_detail_payload(payload: dict[str, Any]) -> dict[str, Any]:
    latest = payload["latest"]

    def fishing_region(region: dict[str, Any]) -> dict[str, Any]:
        return {
            **{key: region[key] for key in ("asOf", "dailyMt", "monthlyMt", "annualMt")},
            "vessels": [
                {key: vessel[key] for key in ("name", "position", "catchMt", "loadedMt", "note")}
                for vessel in region["vessels"]
            ],
        }

    carrier_vessels = []
    for vessel in latest["carrier"]["vessels"]:
        display_name, capacity_mt = parse_carrier_display_name(vessel["name"])
        carrier_vessels.append({
            "name": vessel["name"],
            "displayName": display_name,
            "capacityMt": capacity_mt,
            "entityType": vessel["entityType"],
            "loadedMt": vessel["loadedMt"],
            "expectedRemainingMt": vessel["expectedRemainingMt"],
            "loadPlan": vessel["loadPlan"],
            "note": vessel["note"],
        })

    return {
        "reportDate": latest["reportDate"],
        "asOf": latest["asOf"],
        "pacific": fishing_region(latest["pacific"]),
        "atlantic": fishing_region(latest["atlantic"]),
        "carrier": {
            "loadedTotalMt": latest["carrier"]["loadedTotalMt"],
            "expectedRemainingMt": latest["carrier"]["expectedRemainingMt"],
            "vessels": carrier_vessels,
        },
        "longline": {
            "vessels": [
                {key: vessel[key] for key in ("name", "loadedMt", "note")}
                for vessel in latest["longline"]["vessels"]
            ],
        },
    }


def serialized(payload: dict[str, Any]) -> str:
    return json.dumps(payload, ensure_ascii=False, indent=2) + "\n"


def canonical_sha256(payload: dict[str, Any]) -> str:
    canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, prefix=f".{path.name}.", suffix=".tmp", delete=False) as temporary:
            temporary_path = Path(temporary.name)
            temporary.write(content)
            temporary.flush()
            os.fsync(temporary.fileno())
        os.replace(temporary_path, path)
    except OSError:
        if temporary_path:
            temporary_path.unlink(missing_ok=True)
        raise


def argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="해양수산본부 일일 DOCX 보고를 fleet intake JSON으로 동기화합니다.")
    parser.add_argument("--source-dir", type=Path, help="DOCX 원문 폴더")
    parser.add_argument(
        "--additional-report",
        type=Path,
        action="append",
        default=[],
        help="기존 이력에 합칠 신규 DOCX 원문(여러 번 지정 가능)",
    )
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="로컬 전용 원문 파생 JSON 경로")
    parser.add_argument("--public-output", type=Path, help="커밋 가능한 공개 집계 JSON 경로")
    parser.add_argument("--detail-output", type=Path, help="서버 환경변수용 최신 상세 DTO 경로")
    parser.add_argument("--check", action="store_true", help="세 출력 JSON이 결정적 동기화 결과와 같은지 검사")
    return parser


def companion_output(output: Path, kind: str) -> Path:
    if output == DEFAULT_OUTPUT.resolve():
        return (DEFAULT_PUBLIC_OUTPUT if kind == "public" else DEFAULT_DETAIL_OUTPUT).resolve()
    return output.with_name(f"{output.stem}-{kind}.json")


def main(argv: Sequence[str] | None = None) -> int:
    args = argument_parser().parse_args(argv)
    try:
        output = args.output.resolve()
        public_output = args.public_output.resolve() if args.public_output else companion_output(output, "public")
        detail_output = args.detail_output.resolve() if args.detail_output else companion_output(output, "detail")
        payload = build_payload(
            args.source_dir or default_source_dir(),
            args.additional_report,
        )
        detail_payload = build_detail_payload(payload)
        content = serialized(payload)
        public_content = serialized(build_public_payload(payload, canonical_sha256(detail_payload)))
        detail_content = serialized(detail_payload)
        if args.check:
            expected_outputs = (
                (output, content, "로컬 원문 파생"),
                (public_output, public_content, "공개 집계"),
                (detail_output, detail_content, "서버 상세"),
            )
            for path, expected, label in expected_outputs:
                if not path.is_file() or path.read_text(encoding="utf-8") != expected:
                    raise FleetDailySyncError(f"{label} JSON이 현재 원문 동기화 결과와 다릅니다")
            print("fleet daily 동기화 검사 통과")
            return 0
        atomic_write(output, content)
        atomic_write(public_output, public_content)
        atomic_write(detail_output, detail_content)
        print(f"fleet daily 동기화 완료: {public_output} ({payload['_meta']['reportCount']}건)")
        return 0
    except (FleetDailySyncError, OSError) as error:
        print(f"fleet daily 동기화 실패: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
