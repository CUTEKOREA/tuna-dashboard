"""Extract the verified one-row KMI consumer-price snapshot."""

from __future__ import annotations

import csv
import re
from pathlib import Path

from ..spec import WidgetSpec


_OBSERVATION_RE = re.compile(r"^price_(\d{4})_(\d{2})_(\d{2})_krw$")


def _integer(value: str) -> int:
    if not value.strip():
        raise ValueError("required KMI integer is blank")
    return int(value)


def _decimal(value: str) -> float:
    if not value.strip():
        raise ValueError("required KMI comparison is blank")
    return float(value)


def extract_kmi_price(archive_root: Path, spec: WidgetSpec) -> dict:
    if len(spec.archive_paths) != 1:
        raise ValueError("KMI price widget must name exactly one CSV")
    path = Path(archive_root) / spec.archive_paths[0]
    with path.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    if len(rows) != 1:
        raise ValueError(f"KMI price CSV must contain one data row; got {len(rows)}")
    row = rows[0]

    observations = []
    for key, value in row.items():
        match = _OBSERVATION_RE.match(key)
        if not match or not value.strip():
            continue
        observations.append(
            {
                "date": "-".join(match.groups()),
                "price_krw": _integer(value),
            }
        )
    observations.sort(key=lambda item: item["date"])
    if not observations:
        raise ValueError("KMI price CSV has no dated observations")

    comparisons = [
        {
            "basis": "5년 평균",
            "price_krw": _integer(row["five_year_avg_krw"]),
            "difference_pct": _decimal(row["vs_five_year_pct"]),
        },
        {
            "basis": "전년 평균",
            "price_krw": _integer(row["previous_year_avg_krw"]),
            "difference_pct": _decimal(row["vs_previous_year_pct"]),
        },
        {
            "basis": "전월 평균",
            "price_krw": _integer(row["previous_month_avg_krw"]),
            "difference_pct": _decimal(row["vs_previous_month_pct"]),
        },
        {
            "basis": "전주 가격",
            "price_krw": _integer(row["one_week_ago_krw"]),
            "difference_pct": _decimal(row["vs_previous_week_pct"]),
        },
    ]
    return {
        "chartType": spec.chart_type,
        "data": {
            "product": {
                "fish_name": row["fish_name"],
                "condition": row["condition"],
                "grade": row["grade"],
                "unit": row["unit"],
                "weight": float(row["weight"]),
            },
            "observations": observations,
            "comparisons": comparisons,
        },
        "xAxis": "date",
        "series": ["price_krw"],
        "unit": "원/마리",
        "methodology": "KMI FishData 보관 CSV 1행의 관측일 가격과 네 비교기준을 그대로 적재",
        "basis": {
            "product_form": f"{row['condition']} {row['grade']} {row['unit']}",
            "coverage_start": observations[0]["date"],
            "coverage_end": observations[-1]["date"],
            "published_at": row["source_date"],
            "retrieved_at": "2026-08-12",
            "metrics": list(spec.metrics),
        },
    }

