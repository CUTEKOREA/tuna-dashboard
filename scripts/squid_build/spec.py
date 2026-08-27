"""Load the canonical squid v5 widget work list and build safe link cards."""

from __future__ import annotations

import csv
import copy
import re
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path
from typing import Iterable, Mapping


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SPEC_PATH = REPO_ROOT / "docs/squid_v5_widget_spec.csv"
DEFAULT_ARCHIVE_ROOT = Path(
    "/Users/idong-geon/Library/CloudStorage/"
    "GoogleDrive-cutekorea@gmail.com/내 드라이브/agri_data/"
    "01_수산물(Seafood)/squid"
)
ARCHIVE_SNAPSHOT_DATE = "2026-08-27"

_GRADE_ORDER = {"A": 0, "B": 1, "C": 2}
_DATE8_RE = re.compile(r"(?<!\d)(20\d{2})(\d{2})(\d{2})(?!\d)")
_DATE_DASH_RE = re.compile(r"(?<!\d)(20\d{2})-(\d{2})-(\d{2})(?!\d)")
_YEAR_RANGE_RE = re.compile(r"(?<!\d)(20\d{2})-(20\d{2})(?!\d)")


@dataclass(frozen=True)
class WidgetSpec:
    widget_id: str
    section: str
    title: str
    chart_type: str
    disposition: str
    legacy_ids: tuple[str, ...]
    species: tuple[str, ...]
    taxon_scope: str
    weight_basis: str
    market_stage: str
    quota_semantics: str
    metrics: tuple[str, ...]
    claim_type: str
    currency: str
    source_ids: tuple[str, ...]
    archive_paths: tuple[str, ...]
    restrictions: tuple[str, ...]
    extractor: str
    owner: str
    note: str


def _split(value: str) -> tuple[str, ...]:
    return tuple(part.strip() for part in value.split("|") if part.strip())


def load_spec(path: Path = DEFAULT_SPEC_PATH) -> list[WidgetSpec]:
    """Read exactly 39 unique rows from the BOM-aware canonical CSV."""
    with Path(path).open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))

    specs = [
        WidgetSpec(
            widget_id=row["widget_id"].strip(),
            section=row["section"].strip(),
            title=row["title"].strip(),
            chart_type=row["chartType"].strip(),
            disposition=row["disposition"].strip(),
            legacy_ids=_split(row["legacy_ids"]),
            species=_split(row["species"]) or ("n/a",),
            taxon_scope=row["taxon_scope"].strip(),
            weight_basis=row["weight_basis"].strip(),
            market_stage=row["market_stage"].strip(),
            quota_semantics=row["quota_semantics"].strip() or "n/a",
            metrics=_split(row["metrics"]) or ("coverage",),
            claim_type=row["claim_type"].strip(),
            currency=row["currency"].strip() or "n/a",
            source_ids=_split(row["source_ids"]),
            archive_paths=tuple(
                part.strip() for part in row["archive_path"].split(";") if part.strip()
            ),
            restrictions=_split(row["restrictions"]),
            extractor=row["extractor"].strip(),
            owner=row["owner"].strip(),
            note=row["note"].strip(),
        )
        for row in rows
    ]
    ids = [spec.widget_id for spec in specs]
    if len(specs) != 39 or len(set(ids)) != 39:
        raise ValueError(
            f"widget spec must contain 39 unique rows; rows={len(specs)} unique={len(set(ids))}"
        )
    return specs


def specs_by_id(specs: Iterable[WidgetSpec]) -> dict[str, WidgetSpec]:
    return {spec.widget_id: spec for spec in specs}


def _date_value(year: int, month: int, day: int) -> str:
    if month == 0:
        return f"{year:04d}"
    if day == 0:
        return f"{year:04d}-{month:02d}"
    return f"{year:04d}-{month:02d}-{day:02d}"


def _date_edges(value: str) -> tuple[date, date]:
    parts = [int(part) for part in value.split("-")]
    year = parts[0]
    if len(parts) == 1:
        return date(year, 1, 1), date(year, 12, 31)
    month = parts[1]
    if len(parts) == 2:
        if month == 12:
            end = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end = date(year, month + 1, 1) - timedelta(days=1)
        return date(year, month, 1), end
    point = date(year, month, parts[2])
    return point, point


def infer_archive_dates(archive_paths: Iterable[str]) -> tuple[str, str, str, str]:
    """Use only dates encoded in archive paths; do not invent publication days."""
    values: list[str] = []
    for archive_path in archive_paths:
        for match in _YEAR_RANGE_RE.finditer(archive_path):
            for year in match.groups():
                if year not in values:
                    values.append(year)
        matches = list(_DATE8_RE.finditer(archive_path)) + list(_DATE_DASH_RE.finditer(archive_path))
        for match in matches:
            value = _date_value(*(int(group) for group in match.groups()))
            if value not in values:
                values.append(value)

    if not values:
        values = [ARCHIVE_SNAPSHOT_DATE]
    coverage_start = min(values, key=lambda value: _date_edges(value)[0])
    coverage_end = max(values, key=lambda value: _date_edges(value)[1])
    published_at = coverage_end
    retrieved_at = ARCHIVE_SNAPSHOT_DATE
    if _date_edges(published_at)[1] > _date_edges(retrieved_at)[1]:
        # A source dated only to the current month/year is retrieved at that same
        # honest granularity; choosing an exact day would manufacture precision.
        retrieved_at = published_at
    return coverage_start, coverage_end, published_at, retrieved_at


def source_grade(source_ids: Iterable[str], sources: Mapping[str, Mapping[str, str]]) -> str:
    grades = []
    for source_id in source_ids:
        if source_id not in sources:
            raise ValueError(f"source registry is missing {source_id}")
        grades.append(sources[source_id]["grade"])
    if not grades:
        raise ValueError("widget source_ids must not be empty")
    return max(grades, key=lambda grade: _GRADE_ORDER[grade])


def _taxon_note(scope: str) -> str | None:
    if scope == "incl_cuttlefish":
        return "HS 분류에 갑오징어가 포함될 수 있어 4종 오징어 단독 총계로 사용할 수 없다."
    if scope == "cephalopods_nei":
        return "원문이 두족류 또는 미분류 오징어류를 포함해 4종 단독 시장으로 해석할 수 없다."
    return None


def make_basis(
    spec: WidgetSpec,
    sources: Mapping[str, Mapping[str, str]],
    gates: Mapping[str, Mapping[str, str]],
    *,
    link_card: bool = False,
) -> dict:
    coverage_start, coverage_end, published_at, retrieved_at = infer_archive_dates(
        spec.archive_paths
    )
    restrictions = list(spec.restrictions)
    if (
        "SQ-TRD-KCS" in spec.source_ids
        and _date_edges(coverage_end)[1] >= date(2026, 1, 1)
        and "G-004" not in restrictions
    ):
        restrictions.append("G-004")
    quota_semantics = spec.quota_semantics
    if "SQ-MGT-PRODUCE" in spec.source_ids and quota_semantics == "n/a":
        quota_semantics = "closure_notice"
    blocked_use = [
        gates[gate_id]["blocked_use"]
        for gate_id in restrictions
        if gate_id in gates
    ]
    if "MANUAL-TARIFF" in restrictions:
        blocked_use.append("수기 관세율을 검증된 법정 세율로 재사용")

    basis = {
        "species": list(spec.species),
        "taxon_scope": spec.taxon_scope,
        "weight_basis": spec.weight_basis,
        "market_stage": spec.market_stage,
        "aggregation": "none",
        "quota_semantics": quota_semantics,
        "metrics": ["coverage"] if link_card else list(spec.metrics),
        "claim_type": spec.claim_type,
        "currency": spec.currency,
        "currency_converted": False,
        "fx_date": None,
        "nominal_real": "nominal" if spec.currency != "n/a" else "n/a",
        "coverage_start": coverage_start,
        "coverage_end": coverage_end,
        "published_at": published_at,
        "retrieved_at": retrieved_at,
        "source_ids": list(spec.source_ids),
        "source_grade": source_grade(spec.source_ids, sources),
        "archive_path": ";".join(spec.archive_paths),
        "restrictions": restrictions,
        "blocked_use": blocked_use,
    }
    note = _taxon_note(spec.taxon_scope)
    if note:
        basis["taxon_note"] = note
    return basis


def make_link_card(
    spec: WidgetSpec,
    sources: Mapping[str, Mapping[str, str]],
    gates: Mapping[str, Mapping[str, str]],
    *,
    reason: str = "원문에서 표시값을 확정하지 못해 링크 카드로 강등",
) -> dict:
    """Create the only permitted fallback: empty data, card, archive links."""
    return {
        "section": spec.section,
        "title": spec.title,
        "chartType": "card",
        "data": [],
        "methodology": reason,
        "basis": make_basis(spec, sources, gates, link_card=True),
    }


def apply_widget_patch(widget: Mapping, patch: Mapping) -> dict:
    """Merge an extractor result without allowing it to drop basis fields."""
    merged = copy.deepcopy(dict(widget))
    patch_values = copy.deepcopy(dict(patch))
    basis_patch = patch_values.pop("basis", {})
    merged.update(patch_values)
    merged["basis"].update(basis_patch)
    return merged
