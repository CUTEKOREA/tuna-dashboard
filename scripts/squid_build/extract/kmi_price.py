"""Extract the verified one-row KMI consumer-price snapshot."""

from __future__ import annotations

import csv
import re
from datetime import datetime
from pathlib import Path

from ..spec import WidgetSpec


_OBSERVATION_RE = re.compile(r"^price_(\d{4})_(\d{2})_(\d{2})_krw$")


def _integer(value: str) -> int:
    if not value.strip():
        raise ValueError("required KMI integer is blank")
    return int(value.replace(",", ""))


def _decimal(value: str) -> float:
    if not value.strip():
        raise ValueError("required KMI comparison is blank")
    return float(value)


def _date8(value: str, label: str) -> str:
    try:
        return datetime.strptime(value.strip(), "%Y%m%d").date().isoformat()
    except ValueError as exc:
        raise ValueError(f"invalid KMI {label}: {value!r}") from exc


def _retrieved_at(path: Path) -> str:
    match = re.search(r"(20\d{6})", path.name)
    if not match:
        raise ValueError(f"KMI archive filename has no retrieval date: {path.name}")
    return _date8(match.group(1), "retrieval date")


def _raw_snapshot_payload(row: dict[str, str], path: Path) -> dict:
    """2026-08-19 이후 resultList 원문 키를 의미가 섞이지 않게 편다."""
    observations = [
        {
            "date": _date8(row["twoDate"], "twoDate"),
            "price_krw": _integer(row["twoDateD09"]),
        },
        {
            "date": _date8(row["oneDate"], "oneDate"),
            "price_krw": _integer(row["oneDateD09"]),
        },
    ]
    comparison_snapshot = {
        "date": _date8(row["sDate"], "sDate"),
        "price_krw": _integer(row["d09"]),
    }
    comparisons = [
        {
            "basis": "5년 평균",
            "price_krw": _integer(row["fiveYearAvg"]),
            "difference_pct": _decimal(row["pct_vs_five_year"]),
        },
        {
            "basis": "전년 평균",
            "price_krw": _integer(row["prevYearAvg"]),
            "difference_pct": _decimal(row["pct_vs_prev_year"]),
        },
        {
            "basis": "전월 평균",
            "price_krw": _integer(row["preMonthAvg"]),
            "difference_pct": _decimal(row["pct_vs_prev_month"]),
        },
        {
            "basis": "전주 가격",
            "price_krw": _integer(row["d13"]),
            "difference_pct": _decimal(row["pct_vs_prev_week"]),
        },
    ]
    return {
        "product": {
            "fish_name": row["fish_name"],
            "condition": row["kind"],
            "grade": row["rank"],
            "unit": row["unit"],
            "weight": float(row["weight"]),
        },
        "observations": observations,
        "comparison_snapshot": comparison_snapshot,
        "comparisons": comparisons,
        "coverage_start": observations[0]["date"],
        "coverage_end": observations[-1]["date"],
        "published_at": comparison_snapshot["date"],
        "retrieved_at": _retrieved_at(path),
    }


def extract_kmi_price(archive_root: Path, spec: WidgetSpec) -> dict:
    if len(spec.archive_paths) != 1:
        raise ValueError("KMI price widget must name exactly one CSV")
    path = Path(archive_root) / spec.archive_paths[0]
    with path.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    if len(rows) != 1:
        raise ValueError(f"KMI price CSV must contain one data row; got {len(rows)}")
    row = rows[0]

    if row.get("oneDate"):
        payload = _raw_snapshot_payload(row, path)
    else:
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
        payload = {
            "product": {
                "fish_name": row["fish_name"],
                "condition": row["condition"],
                "grade": row["grade"],
                "unit": row["unit"],
                "weight": float(row["weight"]),
            },
            "observations": observations,
            "comparisons": [
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
            ],
            "coverage_start": observations[0]["date"],
            "coverage_end": observations[-1]["date"],
            "published_at": row["source_date"],
            "retrieved_at": _retrieved_at(path),
        }
    return {
        "chartType": spec.chart_type,
        "data": {
            key: value
            for key, value in payload.items()
            if key not in {"coverage_start", "coverage_end", "published_at", "retrieved_at"}
        },
        "xAxis": "date",
        "series": ["price_krw"],
        "unit": "원/마리",
        "methodology": (
            "한국해양수산개발원 보관 자료의 날짜 확정 관측과 화면 비교기준을 분리하고, "
            "네 비교율은 화면 비교기준에만 귀속"
        ),
        "basis": {
            "product_form": (
                f"{payload['product']['condition']} {payload['product']['grade']} "
                f"{payload['product']['unit']}"
            ),
            "coverage_start": payload["coverage_start"],
            "coverage_end": payload["coverage_end"],
            "published_at": payload["published_at"],
            "retrieved_at": payload["retrieved_at"],
            "metrics": list(spec.metrics),
        },
    }
