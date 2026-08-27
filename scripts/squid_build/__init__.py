"""Squid v5 archive-to-JSON builder."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from .governance import load_governance
from .normalize import normalize_display_dashes
from .spec import (
    ARCHIVE_SNAPSHOT_DATE,
    DEFAULT_ARCHIVE_ROOT,
    DEFAULT_SPEC_PATH,
    apply_widget_patch,
    load_spec,
    make_link_card,
    specs_by_id,
)


BUILDER_VERSION = "squid_build/1.2.0"


def build_document(
    *,
    archive_root: Path = DEFAULT_ARCHIVE_ROOT,
    spec_path: Path = DEFAULT_SPEC_PATH,
    only: str | None = None,
    built_at: datetime | None = None,
) -> dict:
    """Build a complete 39-widget document; extraction stages are layered later."""
    archive_root = Path(archive_root)
    specs = load_spec(Path(spec_path))
    timestamp = built_at or datetime.now(ZoneInfo("Asia/Seoul"))
    governance = load_governance(archive_root, specs, timestamp.date())
    source_map = governance.sources_by_id
    gate_map = governance.gates_by_id
    widgets = {
        spec.widget_id: make_link_card(spec, source_map, gate_map)
        for spec in specs
    }
    widgets.update(governance.widgets)

    by_id = specs_by_id(specs)
    derived_widget_ids = {
        "A_sourcing_signal_board",
        "B_stage_separated_prices",
        "B_landed_cost_calc",
        "B_price_freshness_board",
    }
    derive_target = only == "derive" or only in derived_widget_ids
    if derive_target or only in (None, "all", "kmi_price", "B_kmi_consumer_price"):
        from .extract.kmi_price import extract_kmi_price

        widget_id = "B_kmi_consumer_price"
        widgets[widget_id] = apply_widget_patch(
            widgets[widget_id], extract_kmi_price(archive_root, by_id[widget_id])
        )
    if derive_target or only in (None, "all", "fishstat", "A_species_production_split"):
        from .extract.fishstat import extract_fishstat

        widget_id = "A_species_production_split"
        widgets[widget_id] = apply_widget_patch(
            widgets[widget_id], extract_fishstat(archive_root, by_id[widget_id])
        )
    if derive_target or only in (
        None,
        "all",
        "kcs",
        "B_kcs_import_unit_price",
        "C_korea_import_monthly",
        "C_import_concentration",
    ):
        from .extract.kcs import extract_kcs

        kcs_patches = extract_kcs(archive_root, by_id)
        for widget_id, patch in kcs_patches.items():
            widgets[widget_id] = apply_widget_patch(widgets[widget_id], patch)
    if derive_target or only in (None, "all", "comtrade", "C_comtrade_coverage_matrix"):
        from .extract.comtrade import extract_comtrade

        widget_id = "C_comtrade_coverage_matrix"
        widgets[widget_id] = apply_widget_patch(
            widgets[widget_id], extract_comtrade(archive_root, by_id[widget_id])
        )
    if derive_target or only in (None, "all", "hs_map", "C_hs_classification_map"):
        from .extract.hs_map import extract_hs_map

        widget_id = "C_hs_classification_map"
        widgets[widget_id] = apply_widget_patch(
            widgets[widget_id], extract_hs_map(archive_root, by_id[widget_id])
        )
    if derive_target or only in (None, "all", "peru_pota", "A_peru_pota_timeline"):
        from .extract.peru_pota import extract_peru_pota

        widget_id = "A_peru_pota_timeline"
        widgets[widget_id] = apply_widget_patch(
            widgets[widget_id], extract_peru_pota(archive_root, by_id[widget_id])
        )
    if derive_target or only in (None, "all", "chile_jibia", "A_chile_jibia_quota"):
        from .extract.chile_jibia import extract_chile_jibia

        widget_id = "A_chile_jibia_quota"
        widgets[widget_id] = apply_widget_patch(
            widgets[widget_id], extract_chile_jibia(archive_root, by_id[widget_id])
        )
    md_widget_ids = {spec.widget_id for spec in specs if spec.extractor == "md_extract.py"}
    if derive_target or only in (None, "all", "md_extract") or only in md_widget_ids:
        from .extract.md_extract import extract_all_configured

        selected_specs = specs if only not in md_widget_ids else [by_id[only]]
        md_patches, md_failures = extract_all_configured(archive_root, selected_specs)
        for widget_id, patch in md_patches.items():
            widgets[widget_id] = apply_widget_patch(widgets[widget_id], patch)
        for widget_id, reason in md_failures.items():
            widgets[widget_id]["methodology"] = reason

    document = {
        "meta": {
            "built_at": timestamp.isoformat(timespec="seconds"),
            "builder_version": BUILDER_VERSION,
            "archive_snapshot": f"squid archive @ {ARCHIVE_SNAPSHOT_DATE}",
            "gate_version": "measurement_gate 2026-08-12 + local G-012/G-013",
            "telemetry": "SYNCED",
        },
        "sources": governance.sources,
        "gates": governance.gates,
        "monitoring": governance.monitoring,
        "widgets": widgets,
    }
    if derive_target or only in (None, "all"):
        from .derive import derive_widgets

        for widget_id, patch in derive_widgets(document, specs, timestamp.date()).items():
            widgets[widget_id] = apply_widget_patch(widgets[widget_id], patch)

    known_only = {
        "all", "governance", "kmi_price", "fishstat", "kcs", "comtrade", "hs_map",
        "peru_pota", "chile_jibia",
        "md_extract",
        "derive",
        "B_kmi_consumer_price", "A_species_production_split",
        "B_kcs_import_unit_price", "C_korea_import_monthly", "C_import_concentration",
        "C_comtrade_coverage_matrix", "C_hs_classification_map",
        "A_peru_pota_timeline", "A_chile_jibia_quota",
    }
    known_only.update(md_widget_ids)
    known_only.update(derived_widget_ids)
    if only is not None and only not in known_only:
        if only not in widgets:
            raise ValueError(f"unknown --only target: {only}")
        # Keeping all 39 skeleton rows is deliberate: the validator and UI
        # contract never see a partially shaped document.

    return normalize_display_dashes(document, preserve_raw_evidence=True)


__all__ = ["build_document", "normalize_display_dashes"]
