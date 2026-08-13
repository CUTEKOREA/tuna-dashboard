"""Extract the legally distinct Peru pota limit, landing, and closure events."""

from __future__ import annotations

import re
from decimal import Decimal
from pathlib import Path

from ..spec import WidgetSpec


def _tonnes(value: str) -> int | float:
    number = Decimal(value.replace(",", "").replace(" ", ""))
    if number == number.to_integral_value():
        return int(number)
    return float(number)


def _read_sources(archive_root: Path, spec: WidgetSpec) -> dict[str, tuple[str, str]]:
    sources = {}
    for relative in spec.archive_paths:
        path = Path(archive_root) / relative
        if path.suffix.lower() == ".pdf":
            twin = path.with_suffix(".md")
            if not twin.exists():
                raise ValueError(f"PDF Markdown twin missing: {relative}")
            path = twin
        text = path.read_text(encoding="utf-8", errors="replace")
        sources[path.name] = (relative, text)
    return sources


def _required_match(pattern: str, text: str, label: str) -> re.Match[str]:
    match = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
    if not match:
        raise ValueError(f"Peru source is missing {label}")
    return match


def extract_peru_pota(archive_root: Path, spec: WidgetSpec) -> dict:
    sources = _read_sources(archive_root, spec)
    lmctp_rel, lmctp_text = next(
        value for name, value in sources.items() if "RM00191" in name
    )
    progress_rel, progress_text = next(
        value for name, value in sources.items() if "Catch_Progress" in name
    )
    closure_rel, closure_text = next(
        value for name, value in sources.items() if "Suspension" in name
    )

    lmctp_match = _required_match(
        r"1\.1\s+Establecer\s+el\s+L[ií]mite\s+M[aá]ximo.*?"
        r"\(([0-9][0-9\s]+)\)\s+toneladas",
        lmctp_text,
        "2026 LMCTP",
    )
    progress_match = _required_match(
        r"registra\s+un\s+total\s+de\s+([0-9,]+(?:\.[0-9]+)?)\s+toneladas\s+"
        r"\(Avance\s+([0-9.]+)%\)",
        progress_text,
        "cumulative landings",
    )
    small_closure = _required_match(
        r"menores\s+a\s+10\s*m3.*?suspendidas\s+desde\s+las\s+00:00\s+horas\s+del\s+"
        r"(22\s+de\s+julio\s+de\s+2026)",
        closure_text,
        "under-10m3 closure",
    )
    large_closure = _required_match(
        r"10\s*m3\s+hasta\s+32\.6\s*m3.*?suspendidas\s+desde\s+las\s+00:00\s+horas\s+del\s+"
        r"(18\s+de\s+julio\s+de\s+2026)",
        closure_text,
        "10-32.6m3 closure",
    )

    events = [
        {
            "date": "2026-07-04",
            "event": "LMCTP 조정",
            "quota_semantics": "legal_limit",
            "tonnes": _tonnes(lmctp_match.group(1)),
            "source_path": lmctp_rel,
        },
        {
            "date": "2026-07-09",
            "event": "누적 하역 공지",
            "quota_semantics": "consumption",
            "tonnes": _tonnes(progress_match.group(1)),
            "progress_pct": float(progress_match.group(2)),
            "source_path": progress_rel,
        },
        {
            "date": "2026-07-24",
            "event": "조업 중단 공지",
            "quota_semantics": "closure_notice",
            "closures": [
                {
                    "vessel_capacity": "10㎥ 미만",
                    "effective_date": "2026-07-22",
                    "source_text": small_closure.group(1),
                },
                {
                    "vessel_capacity": "10~32.6㎥",
                    "effective_date": "2026-07-18",
                    "source_text": large_closure.group(1),
                },
            ],
            "source_path": closure_rel,
        },
    ]
    events.sort(key=lambda event: event["date"])
    return {
        "chartType": spec.chart_type,
        "data": events,
        "xAxis": "date",
        "series": ["tonnes", "progress_pct"],
        "unit": "톤·%",
        "methodology": "PRODUCE 3개 문서에서 법정한도·누적하역·중단공지를 분리 추출하고 사건일 오름차순 정렬",
        "basis": {
            "coverage_start": events[0]["date"],
            "coverage_end": events[-1]["date"],
            "published_at": events[-1]["date"],
            "retrieved_at": "2026-08-12",
            "metrics": list(spec.metrics),
            "quota_semantics": "legal_limit",
        },
    }

