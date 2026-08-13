"""Whelk v2 archive-to-JSON builder."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from .governance import load_governance
from .spec import (
    ARCHIVE_SNAPSHOT_DATE,
    DEFAULT_ARCHIVE_ROOT,
    apply_widget_patch,
    load_spec,
    make_link_card,
    specs_by_id,
)


BUILDER_VERSION = "whelk_build/1.0.0"


def build_document(
    *,
    archive_root: Path = DEFAULT_ARCHIVE_ROOT,
    only: str | None = None,
    built_at: datetime | None = None,
) -> dict:
    """Build the complete ten-widget contract from the read-only archive."""
    archive_root = Path(archive_root)
    specs = load_spec()
    by_id = specs_by_id(specs)
    timestamp = built_at or datetime.now(ZoneInfo("Asia/Seoul"))
    governance = load_governance(archive_root, specs, timestamp.date())
    source_map = governance.sources_by_id
    gate_map = governance.gates_by_id
    widgets = {
        spec.widget_id: make_link_card(spec, source_map, gate_map)
        for spec in specs
    }

    fishstat_ids = {spec.widget_id for spec in specs if spec.extractor == "fishstat"}
    kcs_ids = {spec.widget_id for spec in specs if spec.extractor == "kcs"}
    kmi_ids = {spec.widget_id for spec in specs if spec.extractor == "kmi"}
    hs_map_ids = {spec.widget_id for spec in specs if spec.extractor == "hs_map"}
    derived_ids = {spec.widget_id for spec in specs if spec.extractor == "derive"}
    known_only = {
        "all",
        "governance",
        "fishstat",
        "kcs",
        "kmi",
        "hs_map",
        "derive",
        *by_id,
    }
    if only is not None and only not in known_only:
        raise ValueError(f"unknown --only target: {only}")

    full = only in (None, "all")
    derive_target = only == "derive" or only in derived_ids
    run_fishstat = full or derive_target or only == "fishstat" or only in fishstat_ids
    run_kcs = full or derive_target or only == "kcs" or only in kcs_ids
    run_kmi = full or only == "kmi" or only in kmi_ids
    run_hs_map = full or only == "hs_map" or only in hs_map_ids
    run_derive = full or derive_target

    if run_fishstat:
        from .extract.fishstat import extract_fishstat

        for widget_id, patch in extract_fishstat(archive_root, by_id).items():
            widgets[widget_id] = apply_widget_patch(widgets[widget_id], patch)

    if run_kcs:
        from .extract.kcs import extract_kcs

        for widget_id, patch in extract_kcs(archive_root, by_id).items():
            widgets[widget_id] = apply_widget_patch(widgets[widget_id], patch)

    if run_kmi:
        from .extract.kmi import extract_kmi

        widget_id = "S3_fta_import_quarterly"
        widgets[widget_id] = apply_widget_patch(
            widgets[widget_id], extract_kmi(archive_root, by_id[widget_id])
        )

    if run_hs_map:
        from .extract.hs_map import extract_hs_map

        widget_id = "S3_hs_classification_guide"
        widgets[widget_id] = apply_widget_patch(
            widgets[widget_id], extract_hs_map(archive_root, by_id[widget_id])
        )

    document = {
        "meta": {
            "built_at": timestamp.isoformat(timespec="seconds"),
            "builder_version": BUILDER_VERSION,
            "archive_snapshot": f"whelk archive @ {ARCHIVE_SNAPSHOT_DATE}",
            "gate_version": "measurement_gate 2026-08-13",
            "telemetry": "SYNCED",
            "coverage_gaps": [
                {
                    "series": "KCS 1605.59 / 0307.92 원산지 상세",
                    "missing": ["2025"],
                    "available": ["2023", "2024", "2026-01~05"],
                    "impact": (
                        "2024→2026 두 시점 비교는 중간 경로를 관측하지 않은 구간 "
                        "점프다. 전환 시점·속도를 특정할 수 없다."
                    ),
                }
            ],
        },
        "sources": governance.sources,
        "gates": governance.gates,
        "monitoring": governance.monitoring,
        "widgets": widgets,
    }

    if run_derive:
        from .derive import derive_widgets

        for widget_id, patch in derive_widgets(document, specs).items():
            widgets[widget_id] = apply_widget_patch(widgets[widget_id], patch)

    return document


__all__ = ["build_document"]
