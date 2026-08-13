"""Build the four-species FAO FishStat capture-production series."""

from __future__ import annotations

import csv
import logging
from collections import defaultdict
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Iterable

from ..spec import WidgetSpec


SPECIES_ORDER = (
    "Todarodes pacificus",
    "Illex argentinus",
    "Dosidicus gigas",
    "Doryteuthis gahi",
)
SPECIES_WHITELIST = set(SPECIES_ORDER)


def filter_species_rows(rows: Iterable[dict[str, str]]) -> list[dict[str, str]]:
    """Allow only exact scientific names; genus and NEI rows cannot pass."""
    filtered = []
    for row in rows:
        scientific_name = row.get("Scientific_Name") or row.get("SPECIES.Scientific_Name")
        if scientific_name in SPECIES_WHITELIST:
            filtered.append(row)
    return filtered


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def _json_number(value: Decimal) -> int | float:
    if value == value.to_integral_value():
        return int(value)
    return float(value)


def extract_fishstat(
    archive_root: Path,
    spec: WidgetSpec,
    logger: logging.Logger | None = None,
) -> dict:
    logger = logger or logging.getLogger(__name__)
    if len(spec.archive_paths) != 2:
        raise ValueError("FishStat widget must name capture and species-code CSVs")
    capture_path = Path(archive_root) / spec.archive_paths[0]
    species_path = Path(archive_root) / spec.archive_paths[1]

    species_rows = _read_csv(species_path)
    allowed_species_rows = filter_species_rows(species_rows)
    logger.info(
        "FishStat species filter rows_before=%d rows_after=%d",
        len(species_rows),
        len(allowed_species_rows),
    )
    observed_species = {row["Scientific_Name"] for row in allowed_species_rows}
    if observed_species != SPECIES_WHITELIST:
        raise ValueError(
            f"FishStat whitelist rows missing: {sorted(SPECIES_WHITELIST - observed_species)}"
        )
    allowed_codes = {row["3A_Code"] for row in allowed_species_rows}

    capture_rows = _read_csv(capture_path)
    filtered_capture = [
        row
        for row in filter_species_rows(capture_rows)
        if row["SPECIES.ALPHA_3_CODE"] in allowed_codes
        and row["MEASURE"] == "Q_tlw"
        and row["PERIOD"].isdigit()
        and 1980 <= int(row["PERIOD"]) <= 2024
    ]
    logger.info(
        "FishStat capture filter rows_before=%d rows_after=%d",
        len(capture_rows),
        len(filtered_capture),
    )

    totals: dict[tuple[int, str], Decimal] = defaultdict(Decimal)
    for row in filtered_capture:
        try:
            value = Decimal(row["VALUE"])
        except (InvalidOperation, KeyError) as exc:
            raise ValueError(f"invalid FishStat VALUE in row {row}") from exc
        totals[(int(row["PERIOD"]), row["SPECIES.Scientific_Name"])] += value

    order = {name: index for index, name in enumerate(SPECIES_ORDER)}
    data = [
        {
            "year": year,
            "scientific_name": scientific_name,
            "tonnes_live_weight": _json_number(value),
        }
        for (year, scientific_name), value in sorted(
            totals.items(), key=lambda item: (item[0][0], order[item[0][1]])
        )
    ]
    if not data:
        raise ValueError("FishStat filter produced no capture observations")

    return {
        "chartType": spec.chart_type,
        "data": data,
        "xAxis": "year",
        "series": [
            {"key": "tonnes_live_weight", "groupBy": "scientific_name", "name": name}
            for name in SPECIES_ORDER
        ],
        "unit": "톤(활중량)",
        "methodology": "Scientific_Name 4종 화이트리스트 적용 후 Q_tlw 국가·해역 행을 연도·종별 합산",
        "basis": {
            "coverage_start": "1980",
            "coverage_end": "2024",
            "published_at": "2026",
            "retrieved_at": "2026",
            "metrics": list(spec.metrics),
        },
    }

