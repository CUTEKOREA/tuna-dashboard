"""Load archive governance registries and build section E widgets."""

from __future__ import annotations

import csv
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Iterable

from .spec import WidgetSpec, make_link_card, specs_by_id


OPERATIONS_DIR = Path("00_오징어_관련자료/01_오징어_시장·가격/00_운영")
SOURCE_REGISTRY = OPERATIONS_DIR / "source_registry.csv"
MEASUREMENT_GATE = OPERATIONS_DIR / "measurement_gate.csv"
MONITORING_CALENDAR = OPERATIONS_DIR / "monitoring_calendar.csv"
CORRECTIONS_REPORT = OPERATIONS_DIR / "전체수집_완료보고_20260812.md"
_DATE_RE = re.compile(r"(?<!\d)(20\d{2})-(\d{2})-(\d{2})(?!\d)")


@dataclass(frozen=True)
class GovernanceBundle:
    sources: list[dict]
    registry_sources: list[dict]
    gates: list[dict]
    monitoring: list[dict]
    widgets: dict[str, dict]

    @property
    def sources_by_id(self) -> dict[str, dict]:
        return {row["source_id"]: row for row in self.sources}

    @property
    def gates_by_id(self) -> dict[str, dict]:
        return {row["gate_id"]: row for row in self.gates}


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def load_sources(archive_root: Path) -> tuple[list[dict], list[dict]]:
    rows = _read_csv(archive_root / SOURCE_REGISTRY)
    registry_sources = [
        {
            "source_id": row["source_id"],
            "publisher": row["publisher"],
            "series": row["series"],
            "priority": row["priority"],
            "grade": row["grade"],
            "frequency": row["frequency"],
            "landing_url": row["landing_url"],
            "archive_subdir": row["archive_subdir"],
            "latest_verified": row["latest_verified"],
            "note": row["notes"],
        }
        for row in rows
    ]
    sources = list(registry_sources)
    sources.append(
        {
            "source_id": "MAN-TARIFF-KR",
            "publisher": "수기 운영 입력",
            "series": "한국 수입 관세율",
            "priority": "P2",
            "grade": "C",
            "frequency": "manual",
            "landing_url": "근거 메모: 2026-08 기준 수기 입력; 적용 전 관세사 확인 필요",
            "archive_subdir": "",
            "latest_verified": "2026-08",
            "note": "공식 원문이 아닌 랜딩코스트 사용자 입력 상수",
        }
    )
    sources.append(
        {
            # 정정 이력의 원천은 아카이브가 아니라 이 repo 의 감사 산출물이다.
            "source_id": "MAN-AUDIT-DASHBOARD",
            "publisher": "대시보드 내부 감사",
            "series": "squid 위젯 감사·정정 이력",
            "priority": "P2",
            "grade": "C",
            "frequency": "event",
            "landing_url": "artifacts/squid_audit_2026_05_28.md",
            "archive_subdir": "",
            "latest_verified": "2026-08-13",
            "note": "repo 내부 산출물. 외부 출처가 아니므로 C등급 · descriptive 용도로만",
        }
    )
    return sources, registry_sources


def load_gates(archive_root: Path) -> list[dict]:
    return [
        {
            "gate_id": row["gate_id"],
            "subject": row["subject"],
            "allowed_use": row["allowed_use"],
            "blocked_use": row["blocked_use"],
            "evidence_path": row["evidence_path"],
        }
        for row in _read_csv(archive_root / MEASUREMENT_GATE)
    ]


def load_monitoring(archive_root: Path) -> list[dict]:
    return [
        {
            "source_id": row["source_id"],
            "series": row["series"],
            "frequency": row["frequency"],
            "latest_verified": row["latest_verified"],
            "next_check": row["next_check"],
            "status": row["status"],
        }
        for row in _read_csv(archive_root / MONITORING_CALENDAR)
    ]


def _freshness_rows(monitoring: Iterable[dict], built_on: date) -> list[dict]:
    rows = []
    for item in monitoring:
        match = _DATE_RE.search(item["latest_verified"])
        age_days = None
        band = "기준일 해석불가"
        if match:
            observed = date(*(int(part) for part in match.groups()))
            age_days = (built_on - observed).days
            if age_days > 365:
                band = "적색"
            elif age_days > 90:
                band = "주황"
            else:
                band = "정상"
        rows.append(
            {
                "source_id": item["source_id"],
                "series": item["series"],
                "latest_verified": item["latest_verified"],
                "age_days": age_days,
                "band": band,
            }
        )
    return rows


def _build_widgets(
    archive_root: Path,
    specs: list[WidgetSpec],
    sources: list[dict],
    registry_sources: list[dict],
    gates: list[dict],
    monitoring: list[dict],
    built_on: date,
) -> dict[str, dict]:
    by_id = specs_by_id(specs)
    source_map = {row["source_id"]: row for row in sources}
    gate_map = {row["gate_id"]: row for row in gates}

    def base(widget_id: str) -> dict:
        return make_link_card(by_id[widget_id], source_map, gate_map)

    source_widget = base("E_source_registry")
    source_widget.update(chartType="table", data=registry_sources)

    gate_widget = base("E_gate_status_board")
    gate_widget.update(
        chartType="table",
        data=[
            {
                **gate,
                "explicit_widget_count": sum(
                    gate["gate_id"] in spec.restrictions for spec in specs
                ),
            }
            for gate in gates
        ],
    )

    monitoring_widget = base("E_monitoring_calendar")
    monitoring_widget.update(
        chartType="table",
        data=sorted(monitoring, key=lambda item: item["next_check"]),
    )

    freshness_widget = base("E_freshness_heatmap")
    freshness_widget.update(
        chartType="table",
        data=_freshness_rows(monitoring, built_on),
        methodology="정확한 YYYY-MM-DD 기준일이 있는 계열만 빌드일과의 경과일을 계산",
    )

    corrections_widget = base("E_corrections_log")
    report_text = (archive_root / CORRECTIONS_REPORT).read_text(
        encoding="utf-8", errors="replace"
    )
    expected_markers = ("P0 9", "P1 8", "폐기 110")
    if all(marker in report_text for marker in expected_markers):
        corrections_widget.update(
            chartType="table",
            data=[{"marker": marker} for marker in expected_markers],
        )
    else:
        corrections_widget["methodology"] = (
            "지정 보고서에 명세가 요구한 2026-05 P0 9건·P1 8건·폐기 110건 이력이 없어 링크 카드로 강등"
        )

    return {
        "E_source_registry": source_widget,
        "E_gate_status_board": gate_widget,
        "E_monitoring_calendar": monitoring_widget,
        "E_freshness_heatmap": freshness_widget,
        "E_corrections_log": corrections_widget,
    }


def load_governance(
    archive_root: Path,
    specs: list[WidgetSpec],
    built_on: date,
) -> GovernanceBundle:
    sources, registry_sources = load_sources(archive_root)
    gates = load_gates(archive_root)
    monitoring = load_monitoring(archive_root)
    if len(registry_sources) != 36:
        raise ValueError(f"source_registry.csv must contain 36 rows; got {len(registry_sources)}")
    if len(gates) != 11:
        raise ValueError(f"measurement_gate.csv must contain 11 rows; got {len(gates)}")
    if len(monitoring) != 15:
        raise ValueError(f"monitoring_calendar.csv must contain 15 rows; got {len(monitoring)}")
    widgets = _build_widgets(
        archive_root,
        specs,
        sources,
        registry_sources,
        gates,
        monitoring,
        built_on,
    )
    return GovernanceBundle(
        sources=sources,
        registry_sources=registry_sources,
        gates=gates,
        monitoring=monitoring,
        widgets=widgets,
    )

