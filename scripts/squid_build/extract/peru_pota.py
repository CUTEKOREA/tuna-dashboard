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
    research_rel, research_text = next(
        value for name, value in sources.items() if "RM00269" in name
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

    # RM 00269-2026 은 조사·탐사 인가지 상업 재개가 아니다. 재개로 읽히면 조달 판단이
    # 뒤집히므로, 재개 문구가 원문에 실제로 없다는 것부터 확인하고 넘어간다.
    reopening = re.search(
        r"reanud|reinici|levantar\s+la\s+suspensi[oó]n|habilitar\s+la\s+actividad\s+extractiva",
        research_text,
        flags=re.IGNORECASE,
    )
    if reopening:
        raise ValueError(
            "RM00269 에 재개 문구가 있다 — 조사·탐사 인가로 단정하지 말고 원문을 다시 읽을 것: "
            + reopening.group(0)
        )
    survey = _required_match(
        r"Operaci[oó]n\s+Calamar\s+Gigante\s+V,\s+desde\s+el\s+(\d{1,2})\s+hasta\s+el\s+"
        r"(\d{1,2})\s+de\s+(agosto)\s+del\s+a[nñ]o\s+2026",
        research_text,
        "IMARPE survey window",
    )
    prospection = _required_match(
        r"Prospecci[oó]n\s+Pesquera\s+del\s+Calamar\s+Gigante\s+o\s+Pota.*?"
        r"desde\s+el\s+(\d{1,2})\s+de\s+(agosto)\s+hasta\s+el\s+(\d{1,2})\s+de\s+"
        r"(setiembre|septiembre)\s+del\s+a[nñ]o\s+2026",
        research_text,
        "prospecting window",
    )
    fleet_cap = _required_match(
        r"participaci[oó]n\s+de\s+hasta\s+\w+\s+\((\d+)\)\s+embarcaciones\s+pesqueras\s+"
        r"de\s+hasta\s+(\d+\.?\d*)\s*m3",
        research_text,
        "vessel cap",
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
    events.append(
        {
            "date": "2026-08-17",
            # 상업 재개가 아니라는 사실을 이름에 박아 둔다. 이 문자열이 화면에 그대로 나간다.
            "event": "조사·탐사 인가 (상업 재개 아님)",
            # 어획 쿼터가 아니라 선박 척수·선창 상한이 걸린 노력량 인가다.
            "quota_semantics": "effort_limit",
            "windows": [
                {
                    "kind": "IMARPE 자원조사",
                    "start": f"2026-08-{int(survey.group(1)):02d}",
                    "end": f"2026-08-{int(survey.group(2)):02d}",
                },
                {
                    "kind": "탐사조업",
                    "start": f"2026-08-{int(prospection.group(1)):02d}",
                    "end": f"2026-09-{int(prospection.group(3)):02d}",
                },
            ],
            "vessel_limit": int(fleet_cap.group(1)),
            "hold_capacity_m3_max": float(fleet_cap.group(2)),
            "source_path": research_rel,
        }
    )
    events.sort(key=lambda event: event["date"])
    return {
        "chartType": spec.chart_type,
        "data": events,
        "xAxis": "date",
        "series": ["tonnes", "progress_pct"],
        "unit": "톤·%",
        "methodology": (
            "PRODUCE 4개 문서에서 법정한도·누적하역·중단공지·조사탐사인가를 분리 추출하고 "
            "사건일 오름차순 정렬. 2026-08-17 RM00269 는 IMARPE 조사와 탐사조업 인가이며 "
            "상업 재개가 아니다 — 원문에 재개 문구가 없음을 추출 단계에서 확인한다"
        ),
        "basis": {
            "coverage_start": events[0]["date"],
            "coverage_end": events[-1]["date"],
            "published_at": events[-1]["date"],
            "retrieved_at": "2026-08-18",
            "metrics": list(spec.metrics),
            "quota_semantics": "legal_limit",
        },
    }

