"""Load the archived KMI FTA quarterly whelk extract without recomputing it."""

from __future__ import annotations

import json
from pathlib import Path

from ..spec import KMI_PATH, WidgetSpec, load_config


def extract_kmi(archive_root: Path, spec: WidgetSpec) -> dict:
    config = load_config(spec.widget_id)
    path = Path(archive_root) / KMI_PATH
    payload = json.loads(path.read_text(encoding="utf-8"))
    missing = [field for field in config["required_fields"] if field not in payload]
    if missing:
        raise ValueError(f"KMI FTA extract is missing fields: {missing}")

    data = {
        field: payload[field]
        for field in config["required_fields"]
    }
    return {
        "chartType": spec.chart_type,
        "data": data,
        "xAxis": "period",
        "series": ["volume", "value", "uk", "ireland"],
        "unit": "천톤·백만USD·USD/kg",
        "methodology": (
            "KMI 2021Q4~2026Q1 원문 21개 분기에서 보관된 골뱅이·고둥 파생 JSON을 "
            "재계산 없이 적재. 2025Q3 이후 주요 품목 서술에서 제외된 공백은 원문 note로 보존"
        ),
        "basis": {
            "coverage_start": "2020",
            "coverage_end": "2026-03",
            "published_at": payload.get("extractedAt", "2026-05-27"),
            "retrieved_at": "2026-08-12",
            "metrics": list(spec.metrics),
        },
    }


__all__ = ["extract_kmi"]
