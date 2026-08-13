"""Load the archived squid/cuttlefish HS product-form matrix."""

from __future__ import annotations

import csv
from pathlib import Path

from ..spec import WidgetSpec


def extract_hs_map(archive_root: Path, spec: WidgetSpec) -> dict:
    csv_paths = [path for path in spec.archive_paths if path.lower().endswith(".csv")]
    if len(csv_paths) != 1:
        raise ValueError("HS map widget must name exactly one CSV")
    path = Path(archive_root) / csv_paths[0]
    with path.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    data = [
        {
            "hs6": row["hs6"],
            "stage": row["stage"],
            "description": row["description"],
        }
        for row in rows
    ]
    if len(data) != 5 or len({row["hs6"] for row in data}) != 5:
        raise ValueError(f"HS matrix must contain five unique rows; got {len(data)}")
    hs_codes = [row["hs6"] for row in data]
    return {
        "chartType": spec.chart_type,
        "data": data,
        "xAxis": "stage",
        "series": ["hs6"],
        "methodology": "보관 HS matrix의 5개 코드·제품형태·영문 설명을 원문 그대로 적재",
        "basis": {
            "coverage_start": "2026-06-02",
            "coverage_end": "2026-07-06",
            "published_at": "2026-07-06",
            "retrieved_at": "2026-08-12",
            "metrics": ["coverage"],
            "hs_codes": hs_codes,
            "taxon_note": (
                f"포함 HS: {'·'.join(hs_codes)}. "
                "각 분류는 오징어와 갑오징어를 함께 포함한다."
            ),
        },
    }
