"""Load archive governance registries and build section E widgets."""

from __future__ import annotations

import csv
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Iterable

from .spec import WidgetSpec, make_link_card, specs_by_id


OPERATIONS_DIR = Path("00_오징어_관련자료/00_운영")
SOURCE_REGISTRY = OPERATIONS_DIR / "source_registry.csv"
MEASUREMENT_GATE = OPERATIONS_DIR / "measurement_gate.csv"
MONITORING_CALENDAR = OPERATIONS_DIR / "monitoring_calendar.csv"
CORRECTIONS_REPORT = OPERATIONS_DIR / "전체수집_완료보고_20260812.md"
_DATE_RE = re.compile(r"(?<!\d)(20\d{2})-(\d{2})-(\d{2})(?!\d)")
MONITORING_PRIORITY = {
    source_id: index
    for index, source_id in enumerate(
        (
            "SQ-PRC-KMI",
            "SQ-PRC-KAMIS",
            "SQ-MGT-PRODUCE",
            "SQ-MGT-SERNAPESCA",
            "SQ-TRD-CN-CUSTOMS",
        )
    )
}


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
    sources.extend(
        [
            {
                "source_id": "MAN-GOV-SOURCE-REGISTRY",
                "publisher": "아카이브 운영 원장",
                "series": "오징어 공식 출처 레지스트리",
                "priority": "P2",
                "grade": "C",
                "frequency": "event",
                "landing_url": str(SOURCE_REGISTRY),
                "archive_subdir": str(OPERATIONS_DIR),
                "latest_verified": "2026-08-27",
                "note": "각 행의 source_id가 실제 원출처를 역참조하는 운영 원장",
            },
            {
                "source_id": "MAN-GOV-MONITORING-CALENDAR",
                "publisher": "아카이브 운영 원장",
                "series": "오징어 공식자료 모니터링 캘린더",
                "priority": "P2",
                "grade": "C",
                "frequency": "event",
                "landing_url": str(MONITORING_CALENDAR),
                "archive_subdir": str(OPERATIONS_DIR),
                "latest_verified": "2026-08-27",
                "note": "각 행의 source_id가 실제 점검 대상 원출처를 역참조하는 운영 일정",
            },
        ]
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
    source_widget.update(
        title="출처 원장 (P0/P1/P2 · A/B/C)",
        chartType="table",
        data=registry_sources,
    )

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
        title="공식자료 모니터링 캘린더",
        chartType="table",
        data=sorted(
            monitoring,
            key=lambda item: (
                MONITORING_PRIORITY.get(item["source_id"], len(MONITORING_PRIORITY)),
                item["next_check"],
                item["source_id"],
            ),
        ),
        methodology="공식 모니터링 캘린더에서 이번 점검 5개 계열을 먼저 두고 최신 확인·다음 확인·상태만 표시",
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
    # 아카이브는 자란다. 정확한 행 수를 강제하면 정상적인 신규 수집이 빌드를 막는다
    # (2026-08-18 실제로 36→44 로 늘며 실패했다). 줄어드는 쪽만 사고이므로 하한을 본다.
    if len(registry_sources) < 36:
        raise ValueError(
            f"source_registry.csv 가 36행 미만이다({len(registry_sources)}). 원장이 유실됐는지 확인할 것"
        )
    required_gates = {f"G-{n:03d}" for n in range(1, 12)}
    missing_gates = required_gates - {g["gate_id"] for g in gates}
    if missing_gates:
        raise ValueError(f"measurement_gate.csv 에 {sorted(missing_gates)} 누락")
    if len(monitoring) < 15:
        raise ValueError(
            f"monitoring_calendar.csv 가 15행 미만이다({len(monitoring)}). 감시 계열이 사라졌는지 확인할 것"
        )
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
