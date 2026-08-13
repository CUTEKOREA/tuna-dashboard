"""Expose only the spec-authorized UN Comtrade coverage matrix."""

from __future__ import annotations

import csv
from collections import Counter
from pathlib import Path

from ..spec import WidgetSpec


REPORTERS = {
    "156": "중국",
    "392": "일본",
    "410": "한국",
    "604": "페루",
    "724": "스페인",
    "764": "태국",
    "842": "미국",
}
YEARS = ("2021", "2022", "2023")


def extract_comtrade(archive_root: Path, spec: WidgetSpec) -> dict:
    if len(spec.archive_paths) != 1:
        raise ValueError("Comtrade widget must name exactly one CSV")
    path = Path(archive_root) / spec.archive_paths[0]
    with path.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    counts: Counter[tuple[str, str]] = Counter(
        (row["_reporter"], row["_y"]) for row in rows
    )
    unknown_reporters = {code for code, _year in counts} - set(REPORTERS)
    if unknown_reporters:
        raise ValueError(f"unexpected Comtrade reporters: {sorted(unknown_reporters)}")

    # 있음/없음 이진표시는 사실과 다르다 — 21개 reporter×year 조합에 모두 행이 있다.
    # 실제 한계는 밀도 차이다 (페루 5·2·9행 vs 스페인 1501·960·1562행).
    # 행수를 그대로 보여주고, 판단은 보는 사람에게 맡긴다.
    peak = max(counts.values()) if counts else 0
    data = [
        {
            "reporter_code": code,
            "reporter": reporter,
            "year": year,
            "row_count": counts.get((code, year), 0),
            "density_pct": round(100 * counts.get((code, year), 0) / peak, 1) if peak else 0.0,
        }
        for code, reporter in REPORTERS.items()
        for year in YEARS
    ]
    THIN = 30  # 이 아래는 사실상 품목 몇 줄뿐이라 시계열로 쓸 수 없다
    thin = sorted(
        (d["reporter"], d["year"], d["row_count"])
        for d in data
        if d["row_count"] < THIN
    )
    return {
        "chartType": spec.chart_type,
        "data": data,
        "xAxis": "year",
        "series": ["row_count"],
        "methodology": (
            "reporter×year 원본 행수. 21개 조합 모두 행이 존재하므로 결측이 아니라 밀도 불균등이 한계다. "
            f"{THIN}행 미만 조합 {len(thin)}개: "
            + ", ".join(f"{r} {y} {n}행" for r, y, n in thin)
            + ". 이 불균등 때문에 G-005 가 총액·점유율·CAGR 산출을 차단한다"
        ),
        "basis": {
            "coverage_start": "2021",
            "coverage_end": "2023",
            "published_at": "2026",
            "retrieved_at": "2026",
            "metrics": ["coverage"],
        },
    }

