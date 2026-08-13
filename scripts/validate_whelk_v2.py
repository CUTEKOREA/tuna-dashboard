#!/usr/bin/env python3
"""Standard-library build gate for ``public/data/whelk_v2.json``.

Usage:
    python3 scripts/validate_whelk_v2.py public/data/whelk_v2.json
    python3 scripts/validate_whelk_v2.py --self-test
"""

from __future__ import annotations

import copy
import json
import re
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Iterable


TOP_LEVEL_KEYS = {"meta", "sources", "gates", "monitoring", "widgets"}
META_KEYS = {
    "built_at",
    "builder_version",
    "archive_snapshot",
    "gate_version",
    "telemetry",
    "coverage_gaps",
}
REQUIRED_SOURCE_IDS = {
    "WH-PROD-FAO-FISHSTAT",
    "WH-TRADE-KCS",
    "WH-TRADE-KMI-FTA",
    "WH-REG-DEFRA-FMP",
    "WH-REG-DSIFCA",
    "WH-REG-DFO-CA",
}
REQUIRED_GATE_IDS = {"G-001", "G-002", "G-003", "G-004", "G-005", "G-006"}
UNIT_PRICE_VOLUME_FLOOR_PCT = 1.0
# G-006 분류 정합: 1605.59는 원산지 구성이 겹치지 않는 세 바구니의 합이다.
HSK8_BASKETS = {"16055910", "16055920", "16055990"}
BASKET_SHARE_TOLERANCE_PCT = 0.5
G006_BANNED_PHRASES = (
    "1605.59 기준 점유율",
    "HS6 점유율",
    "HS 1605.59 원산지 점유",
)
SHARE_WITHIN_BASKET_RE = re.compile(r"^share_within_basket_.*_pct$")
SECTIONS = {"S1", "S2", "S3", "S4", "S5"}
CHART_TYPES = {
    "bar",
    "line",
    "area",
    "pie",
    "scatter",
    "radar",
    "signal",
    "card",
    "composed",
    "table",
}
TAXON_SCOPES = {"buccinum_only", "gastropoda_aggregate", "sea_snail_prepared"}
WEIGHT_BASES = {"live_weight", "net_weight", "n/a"}
MARKET_STAGES = {
    "capture",
    "live_fresh",
    "frozen",
    "prepared_preserved",
    "n/a",
}
CLAIM_TYPES = {"descriptive", "comparative", "hypothesis"}
GRADE_ORDER = {"A": 0, "B": 1, "C": 2}
SOURCE_ID_RE = re.compile(r"^WH-[A-Z0-9-]+$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
MONTH_RE = re.compile(r"^\d{4}-\d{2}$")
YEAR_RE = re.compile(r"^\d{4}$")


class GateError(Exception):
    pass


def _month_end(year: int, month: int) -> date:
    if month == 12:
        return date(year + 1, 1, 1) - timedelta(days=1)
    return date(year, month + 1, 1) - timedelta(days=1)


def parse_edge(value: str, *, upper: bool) -> date:
    if DATE_RE.match(value):
        return date.fromisoformat(value)
    if MONTH_RE.match(value):
        year, month = (int(part) for part in value.split("-"))
        return _month_end(year, month) if upper else date(year, month, 1)
    if YEAR_RE.match(value):
        year = int(value)
        return date(year, 12, 31) if upper else date(year, 1, 1)
    raise GateError(f"날짜 형식 불가: {value!r} (YYYY | YYYY-MM | YYYY-MM-DD)")


def _is_nonempty_string(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _strings(value: object) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for key, item in value.items():
            yield str(key)
            yield from _strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from _strings(item)


def check_schema(doc: object) -> list[str]:
    errors: list[str] = []
    if not isinstance(doc, dict):
        return ["[SCHEMA] 최상위 값은 객체여야 함"]
    if set(doc) != TOP_LEVEL_KEYS:
        errors.append(
            f"[SCHEMA] 최상위 키는 {sorted(TOP_LEVEL_KEYS)}만 허용; 실제={sorted(doc)}"
        )

    meta = doc.get("meta")
    if not isinstance(meta, dict):
        errors.append("[SCHEMA] meta 객체 누락")
    else:
        if set(meta) != META_KEYS:
            errors.append(f"[SCHEMA] meta 키 불일치: {sorted(meta)}")
        if meta.get("telemetry") != "SYNCED":
            errors.append("[SCHEMA] meta.telemetry는 SYNCED여야 함")
        gaps = meta.get("coverage_gaps")
        if not isinstance(gaps, list) or not gaps:
            errors.append("[SCHEMA] meta.coverage_gaps는 비어 있지 않은 배열이어야 함")
        else:
            for index, gap in enumerate(gaps):
                if not isinstance(gap, dict) or {
                    "series",
                    "missing",
                    "available",
                    "impact",
                } - set(gap):
                    errors.append(f"[SCHEMA] meta.coverage_gaps/{index} 필수 키 누락")
        if meta.get("builder_version") != "whelk_build/1.0.0":
            errors.append("[SCHEMA] builder_version은 whelk_build/1.0.0이어야 함")
        try:
            built_at = datetime.fromisoformat(str(meta.get("built_at", "")))
            if built_at.tzinfo is None:
                raise ValueError("timezone missing")
        except ValueError:
            errors.append("[SCHEMA] meta.built_at은 시간대가 있는 ISO 일시여야 함")

    sources = doc.get("sources")
    if not isinstance(sources, list) or not sources:
        errors.append("[SCHEMA] sources는 비어 있지 않은 배열이어야 함")
        sources = []
    source_ids: list[str] = []
    for index, source in enumerate(sources):
        location = f"sources/{index}"
        if not isinstance(source, dict):
            errors.append(f"[SCHEMA] {location}는 객체여야 함")
            continue
        required = {
            "source_id",
            "publisher",
            "series",
            "priority",
            "grade",
            "frequency",
            "landing_url",
            "archive_subdir",
            "latest_verified",
            "note",
        }
        missing = required - set(source)
        if missing:
            errors.append(f"[SCHEMA] {location} 필수 키 누락: {sorted(missing)}")
        source_id = source.get("source_id")
        if not isinstance(source_id, str) or not SOURCE_ID_RE.match(source_id):
            errors.append(f"[SCHEMA] {location}/source_id 형식 오류: {source_id!r}")
        else:
            source_ids.append(source_id)
        if source.get("grade") not in GRADE_ORDER:
            errors.append(f"[SCHEMA] {location}/grade는 A|B|C여야 함")
        if source.get("priority") not in {"P0", "P1", "P2"}:
            errors.append(f"[SCHEMA] {location}/priority는 P0|P1|P2여야 함")
    if len(source_ids) != len(set(source_ids)):
        errors.append("[SCHEMA] sources.source_id 중복")
    missing_sources = REQUIRED_SOURCE_IDS - set(source_ids)
    if missing_sources:
        errors.append(f"[SCHEMA] 필수 source_id 누락: {sorted(missing_sources)}")

    gates = doc.get("gates")
    if not isinstance(gates, list):
        errors.append("[SCHEMA] gates는 배열이어야 함")
        gates = []
    gate_ids = []
    for index, gate in enumerate(gates):
        if not isinstance(gate, dict):
            errors.append(f"[SCHEMA] gates/{index}는 객체여야 함")
            continue
        missing = {
            "gate_id",
            "subject",
            "allowed_use",
            "blocked_use",
            "evidence_path",
        } - set(gate)
        if missing:
            errors.append(f"[SCHEMA] gates/{index} 필수 키 누락: {sorted(missing)}")
        gate_ids.append(gate.get("gate_id"))
    if len(gate_ids) != len(set(gate_ids)):
        errors.append("[SCHEMA] gates.gate_id 중복")
    missing_gates = REQUIRED_GATE_IDS - set(gate_ids)
    if missing_gates:
        errors.append(f"[SCHEMA] 필수 gate_id 누락: {sorted(missing_gates)}")

    monitoring = doc.get("monitoring")
    if not isinstance(monitoring, list):
        errors.append("[SCHEMA] monitoring은 배열이어야 함")
        monitoring = []
    for index, item in enumerate(monitoring):
        required = {
            "source_id",
            "series",
            "frequency",
            "latest_verified",
            "next_check",
            "status",
        }
        if not isinstance(item, dict) or required - set(item):
            errors.append(f"[SCHEMA] monitoring/{index} 필수 키 누락")
        elif item["source_id"] not in set(source_ids):
            errors.append(
                f"[SCHEMA] monitoring/{index} 미등록 source_id {item['source_id']}"
            )

    widgets = doc.get("widgets")
    if not isinstance(widgets, dict) or not widgets:
        errors.append("[SCHEMA] widgets는 비어 있지 않은 객체여야 함")
        widgets = {}
    basis_required = {
        "species",
        "taxon_scope",
        "weight_basis",
        "market_stage",
        "aggregation",
        "metrics",
        "claim_type",
        "currency",
        "currency_converted",
        "fx_date",
        "nominal_real",
        "coverage_start",
        "coverage_end",
        "published_at",
        "retrieved_at",
        "source_ids",
        "source_grade",
        "archive_path",
        "restrictions",
        "blocked_use",
    }
    for widget_id, widget in widgets.items():
        if not re.match(r"^S[1-5]_[a-z0-9_]+$", str(widget_id)):
            errors.append(f"[SCHEMA] 위젯 ID 형식 오류: {widget_id}")
        if not isinstance(widget, dict):
            errors.append(f"[SCHEMA] {widget_id}는 객체여야 함")
            continue
        for key in ("section", "title", "chartType", "data", "methodology", "basis"):
            if key not in widget:
                errors.append(f"[SCHEMA] {widget_id}/{key} 누락")
        if widget.get("section") not in SECTIONS:
            errors.append(f"[SCHEMA] {widget_id}/section 오류")
        if widget.get("chartType") not in CHART_TYPES:
            errors.append(f"[SCHEMA] {widget_id}/chartType 오류: {widget.get('chartType')}")
        if not isinstance(widget.get("data"), (list, dict)):
            errors.append(f"[SCHEMA] {widget_id}/data는 배열 또는 객체여야 함")
        if not _is_nonempty_string(widget.get("title")):
            errors.append(f"[SCHEMA] {widget_id}/title은 비어 있을 수 없음")
        if not _is_nonempty_string(widget.get("methodology")):
            errors.append(f"[SCHEMA] {widget_id}/methodology는 비어 있을 수 없음")

        basis = widget.get("basis")
        if not isinstance(basis, dict):
            errors.append(f"[SCHEMA] {widget_id}/basis는 객체여야 함")
            continue
        missing = basis_required - set(basis)
        if missing:
            errors.append(f"[SCHEMA] {widget_id}/basis 필수 키 누락: {sorted(missing)}")
        if basis.get("taxon_scope") not in TAXON_SCOPES:
            errors.append(f"[SCHEMA] {widget_id}/basis/taxon_scope 오류")
        if basis.get("weight_basis") not in WEIGHT_BASES:
            errors.append(f"[SCHEMA] {widget_id}/basis/weight_basis 오류")
        if basis.get("market_stage") not in MARKET_STAGES:
            errors.append(f"[SCHEMA] {widget_id}/basis/market_stage 오류")
        if basis.get("claim_type") not in CLAIM_TYPES:
            errors.append(f"[SCHEMA] {widget_id}/basis/claim_type 오류")
        species = basis.get("species")
        if not isinstance(species, list) or not species or not all(
            _is_nonempty_string(item) for item in species
        ):
            errors.append(f"[SCHEMA] {widget_id}/basis/species는 비어 있지 않은 문자열 배열")
        metrics = basis.get("metrics")
        if not isinstance(metrics, list) or not metrics:
            errors.append(f"[SCHEMA] {widget_id}/basis/metrics는 비어 있지 않은 배열")
        cited = basis.get("source_ids")
        if not isinstance(cited, list) or not cited:
            errors.append(f"[SCHEMA] {widget_id}/basis/source_ids는 비어 있지 않은 배열")
        if basis.get("source_grade") not in GRADE_ORDER:
            errors.append(f"[SCHEMA] {widget_id}/basis/source_grade 오류")
        if not _is_nonempty_string(basis.get("archive_path")):
            errors.append(f"[SCHEMA] {widget_id}/basis/archive_path 누락")
        if not isinstance(basis.get("restrictions"), list):
            errors.append(f"[SCHEMA] {widget_id}/basis/restrictions는 배열이어야 함")
        if not isinstance(basis.get("blocked_use"), list):
            errors.append(f"[SCHEMA] {widget_id}/basis/blocked_use는 배열이어야 함")

    return errors


def _check_anchor_values(doc: dict) -> list[str]:
    errors: list[str] = []
    widgets = doc["widgets"]

    gaps = doc["meta"].get("coverage_gaps") or []
    if not any("2025" in list(gap.get("missing") or []) for gap in gaps):
        errors.append("[META] 2025 공백 고지 누락")

    frozen = widgets.get("S3_frozen_origin_mix", {})
    if frozen.get("data"):
        scale = frozen.get("scale_context", {})
        observed = scale.get("frozen_030792_import_usd")
        if observed is None or abs(observed - 33_235_347) > 1:
            errors.append(f"[ANCHOR] 2026년 1~5월 냉동 030792 총액 불일치: {observed}")
        observed_kg = scale.get("frozen_030792_import_kg")
        if observed_kg is None or abs(observed_kg - 4_683_163) > 1:
            errors.append(f"[ANCHOR] 2026년 1~5월 냉동 030792 중량 불일치: {observed_kg}")
        excluded_ratio = scale.get("frozen_excluding_scallop_to_prepared_ratio")
        if excluded_ratio is None or abs(excluded_ratio - 2.38) > 0.01:
            errors.append(
                "[ANCHOR] 조개관자 제외 냉동/조제 배수 불일치: "
                f"{excluded_ratio}"
            )
        hsk10_rows = frozen.get("hsk10_breakdown") or []
        scallop = next(
            (row for row in hsk10_rows if row.get("hsk10") == "0307921000"),
            None,
        )
        if (
            scallop is None
            or scallop.get("item_name") != "조개관자"
            or abs(scallop.get("import_usd", 0) - 3_435_189) > 1
            or abs(scallop.get("share_pct", 0) - 10.34) > 0.01
            or scallop.get("excluded_from_whelk_scope") is not True
        ):
            errors.append(f"[ANCHOR] 냉동 030792 HSK10 조개관자 분해 불일치: {scallop}")

    portfolio = widgets.get("S3_origin_portfolio_shift", {})
    if portfolio.get("data"):
        # G-005 기간 정합: 비교 기준은 2024 연간(58,504,760)이 아니라 동월 창이다.
        # 2024년 1~5월 = 20,952,354 (연간의 35.8%).
        observed = portfolio.get("period_totals", {}).get("2024_jan_may_import_usd")
        if observed is None or abs(observed - 20_952_354) > 1:
            errors.append(f"[ANCHOR] 2024년 1~5월 수입 총액 불일치: {observed}")
        # 연간 총액을 동월 창과 혼동해 되돌리는 회귀를 차단한다.
        if observed is not None and abs(observed - 58_504_760) <= 1:
            errors.append(
                "[G-005] 포트폴리오 비교 기준이 2024 연간으로 되돌아갔다 — 동월 창이어야 한다"
            )

    monthly = widgets.get("S3_prepared_import_monthly", {})
    if monthly.get("data"):
        observed = sum(row["import_usd"] for row in monthly["data"])
        if abs(observed - 12_531_808) > 1:
            errors.append(f"[ANCHOR] 2026년 1~5월 수입 총액 불일치: {observed}")

    ranking = widgets.get("S1_global_capture_top_countries", {})
    if ranking.get("data"):
        rows = ranking["data"]
        leader = rows[0]
        korea = next((row for row in rows if row.get("country_code") == "410"), None)
        if leader.get("country_code") != "826" or abs(
            leader.get("tonnes_live_weight", 0) - 16_511.020
        ) > 0.001:
            errors.append(f"[ANCHOR] 2024 세계 1위 영국 불일치: {leader}")
        if korea is None or abs(korea["tonnes_live_weight"] - 9_669.783) > 0.001:
            errors.append(f"[ANCHOR] 2024 한국 어획 불일치: {korea}")
        world = ranking.get("world_total_tonnes")
        if world is None or abs(world - 90_114.065) > 0.001:
            errors.append(f"[ANCHOR] 2024 세계 합계 불일치: {world}")

    return errors


def _check_classification_gate(widget_id: str, widget: dict) -> list[str]:
    """G-006 분류 정합 — 원산지 점유율·단가를 HSK8 바구니 안에서만 비교하게 강제한다.

    HS6(1605.59) 분모를 쓰면 16055990 붕괴가 16055910 원산지의 '점유율 상승'으로
    둔갑한다(영국 34.6%→47.2%). 같은 바구니 안에서는 영국+아일랜드가
    97.30%→75.78%로 낮게 관측됐지만 캐나다 2개월 관측의 영향이 크다.
    """
    errors: list[str] = []
    basis = widget["basis"]
    rows = widget["data"]
    if (
        basis["market_stage"] != "prepared_preserved"
        or not str(basis["aggregation"]).startswith("sum_by_country")
        or not isinstance(rows, list)
        or not rows
    ):
        return errors

    if "G-006" not in set(basis["restrictions"]):
        errors.append(f"[{widget_id}] G-006 restriction 누락")

    share_sums: dict[tuple[str, str], float] = {}
    for row in rows:
        hsk8 = row.get("hsk8")
        if hsk8 is None:
            errors.append(f"[{widget_id}] G-006: 원산지 행에 hsk8 바구니 표기 누락")
            continue
        if hsk8 not in HSK8_BASKETS:
            errors.append(f"[{widget_id}] G-006: 미등록 HSK8 바구니 {hsk8}")
            continue
        if row.get("combined"):
            continue
        for key, value in row.items():
            if not SHARE_WITHIN_BASKET_RE.match(key):
                continue
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                errors.append(f"[{widget_id}] G-006: {key} 값 형식 오류")
                continue
            share_sums[(hsk8, key)] = share_sums.get((hsk8, key), 0.0) + value

    for (hsk8, key), total in sorted(share_sums.items()):
        if abs(total - 100.0) > BASKET_SHARE_TOLERANCE_PCT:
            errors.append(
                f"[{widget_id}] G-006: 바구니 교차 분모 사용 — "
                f"{hsk8}/{key} 합 {total:.2f}"
            )

    if "HSK8" not in widget["methodology"]:
        errors.append(f"[{widget_id}] G-006: HSK8 분해 고지 누락")
    claim_text = f"{widget['title']} {widget['methodology']}"
    for phrase in G006_BANNED_PHRASES:
        if phrase in claim_text:
            errors.append(f"[{widget_id}] G-006 금지 표현: {phrase}")
    return errors


def check_gates(doc: dict) -> list[str]:
    errors: list[str] = []
    sources = {source["source_id"]: source for source in doc["sources"]}
    cited_sources = {
        source_id
        for widget in doc["widgets"].values()
        for source_id in widget["basis"]["source_ids"]
    }
    unused_sources = set(sources) - cited_sources
    if unused_sources:
        errors.append(
            f"[SOURCE] 실제 위젯이 인용하지 않는 sources[] 항목: {sorted(unused_sources)}"
        )

    if doc["meta"]["telemetry"] != "SYNCED":
        errors.append("[L-09] meta.telemetry는 SYNCED여야 하며 LIVE 금지")
    live_values = [value for value in _strings(doc["meta"]) if re.search(r"\bLIVE\b", value)]
    if live_values:
        errors.append(f"[L-09] meta에 LIVE 표기 금지: {live_values}")

    for widget_id, widget in doc["widgets"].items():
        basis = widget["basis"]
        source_ids = basis["source_ids"]
        restrictions = set(basis["restrictions"])
        metrics = set(basis["metrics"])

        missing = [source_id for source_id in source_ids if source_id not in sources]
        if missing:
            errors.append(f"[{widget_id}] 미등록 source_id: {missing}")
        else:
            worst = max(
                (sources[source_id]["grade"] for source_id in source_ids),
                key=lambda grade: GRADE_ORDER[grade],
            )
            if basis["source_grade"] != worst:
                errors.append(
                    f"[{widget_id}] source_grade={basis['source_grade']}이나 실제 최저 등급은 {worst}"
                )

        if widget["data"] == []:
            if widget["chartType"] != "card":
                errors.append(f"[{widget_id}] 빈 데이터는 chartType=card여야 함")
            if not any(
                marker in widget["methodology"]
                for marker in ("공백", "미실행", "확정하지 못", "없음")
            ):
                errors.append(f"[{widget_id}] 빈 카드 methodology에 데이터 공백 사유 누락")

        species = basis["species"]
        if len(species) > 1 and "n/a" in species:
            errors.append(f"[{widget_id}] G-001: species에 n/a와 실제 학명 혼재")
        if basis["taxon_scope"] == "buccinum_only" and any(
            "Rapana" in name for name in species
        ):
            errors.append(f"[{widget_id}] G-001: buccinum_only 범위에 Rapana 혼입")
        if (
            basis["taxon_scope"] == "gastropoda_aggregate"
            and basis["market_stage"] == "capture"
            and "28종" not in widget["methodology"]
        ):
            errors.append(f"[{widget_id}] G-001: 어획 합산 methodology에 28종 범위 고지 누락")

        if widget_id == "S1_aquaculture_species_split" and widget["data"]:
            rows = {row.get("scientific_name"): row for row in widget["data"]}
            if "Rapana spp" not in rows or "Buccinum spp" not in rows:
                errors.append(f"[{widget_id}] G-001: Rapana/Buccinum 분리행 누락")
            if any(
                phrase in " ".join(_strings({"title": widget["title"], "data": widget["data"]}))
                for phrase in ("양식 영구 불가", "골뱅이 양식 불가")
            ):
                errors.append(f"[{widget_id}] G-001: 종 구분 없는 양식 불가 단정")

        uses_kcs_trade = "WH-TRADE-KCS" in source_ids and bool(
            metrics
            & {
                "value_usd",
                "weight_kg",
                "share_pct",
                "unit_price_usd_per_kg",
            }
        )
        if uses_kcs_trade:
            try:
                coverage_end = parse_edge(basis["coverage_end"], upper=True)
            except GateError as exc:
                errors.append(f"[{widget_id}] G-002: {exc}")
            else:
                if coverage_end >= date(2026, 1, 1):
                    if coverage_end > date(2026, 5, 31):
                        errors.append(
                            f"[{widget_id}] G-002: 2026 관측 종료가 5월 이후: {basis['coverage_end']}"
                        )
                    if "G-002" not in restrictions:
                        errors.append(f"[{widget_id}] G-002 restriction 누락")
                    claim_text = " ".join(
                        _strings({"title": widget["title"], "data": widget["data"]})
                    )
                    banned = [
                        phrase
                        for phrase in ("연환산", "전년 대비", "전년대비", "YoY", "yoy")
                        if phrase in claim_text
                    ]
                    if banned:
                        errors.append(f"[{widget_id}] G-002 금지 산출·표현: {banned}")

            if "G-003" not in restrictions:
                errors.append(f"[{widget_id}] G-003 restriction 누락")
            if "광의" not in widget["methodology"]:
                errors.append(f"[{widget_id}] G-003: 1605.59 광의 대리지표 고지 누락")

        if widget_id == "S3_origin_cif_ladder" and widget["data"]:
            if "G-004" not in restrictions:
                errors.append(f"[{widget_id}] G-004 restriction 누락")

            # G-006: 순위는 바구니 안에서만 유효하다. 바구니를 섞은 통합 순위는
            # 서로 다른 상품을 한 사다리에 세우는 것이라 금지.
            assigned_ranks: dict[str, list[int]] = {}
            for row in widget["data"]:
                origin = row.get("origin", "원산지 미상")
                share = row.get("volume_share_pct")
                below_floor = row.get("below_volume_floor")
                rank = row.get("rank")
                if isinstance(share, bool) or not isinstance(share, (int, float)):
                    errors.append(f"[{widget_id}] G-004: {origin} volume_share_pct 누락")
                    continue
                expected_below = share < UNIT_PRICE_VOLUME_FLOOR_PCT
                if below_floor is not expected_below:
                    errors.append(
                        f"[{widget_id}] G-004: {origin} below_volume_floor 불일치"
                    )
                if rank is not None:
                    if isinstance(rank, bool) or not isinstance(rank, int) or rank < 1:
                        errors.append(f"[{widget_id}] G-004: {origin} rank 형식 오류")
                    else:
                        assigned_ranks.setdefault(str(row.get("hsk8")), []).append(rank)
                    if expected_below:
                        errors.append(
                            f"[{widget_id}] G-004: {origin} 표본 미달 행에 rank 부여"
                        )
                elif not expected_below:
                    errors.append(
                        f"[{widget_id}] G-004: {origin} 하한 통과 행의 rank 누락"
                    )

                share_2024 = row.get("volume_share_2024_pct")
                below_floor_2024 = row.get("below_volume_floor_2024")
                if isinstance(share_2024, bool) or not isinstance(
                    share_2024, (int, float)
                ):
                    errors.append(
                        f"[{widget_id}] G-004: {origin} volume_share_2024_pct 누락"
                    )
                else:
                    expected_below_2024 = (
                        share_2024 < UNIT_PRICE_VOLUME_FLOOR_PCT
                    )
                    if below_floor_2024 is not expected_below_2024:
                        errors.append(
                            f"[{widget_id}] G-004: {origin} "
                            "below_volume_floor_2024 불일치"
                        )
                    if (
                        expected_below_2024
                        and row.get("unit_price_2024_usd_per_kg") is not None
                    ):
                        errors.append(
                            f"[{widget_id}] G-004: {origin} "
                            "2024 표본 미달 단가를 비교값에 포함"
                        )

            for hsk8, ranks in sorted(assigned_ranks.items()):
                if sorted(ranks) != list(range(1, len(ranks) + 1)):
                    errors.append(
                        f"[{widget_id}] G-004: {hsk8} rank 연속성 오류 {sorted(ranks)}"
                    )

        errors.extend(_check_classification_gate(widget_id, widget))

        rows = widget["data"] if isinstance(widget["data"], list) else []
        if basis["claim_type"] == "comparative" and "WH-TRADE-KCS" in source_ids:
            if "2025" not in widget["methodology"]:
                errors.append(f"[{widget_id}] 2025 공백 고지 누락")
        if any(row.get("thin_evidence") for row in rows):
            if not any(
                key.startswith("shipment_count") for row in rows for key in row
            ):
                errors.append(f"[{widget_id}] 표본 희박 표기 근거 누락")

        hypothesis = widget.get("hypothesis")
        if hypothesis is not None:
            if not isinstance(hypothesis, dict):
                errors.append(f"[{widget_id}] 가설 블록은 객체여야 함")
            elif (
                hypothesis.get("claim_grade") not in GRADE_ORDER
                or not isinstance(hypothesis.get("why_unproven"), list)
                or not hypothesis.get("why_unproven")
                or not _is_nonempty_string(hypothesis.get("falsification_test"))
            ):
                errors.append(f"[{widget_id}] 가설 블록 필수 필드 누락")

        if widget_id == "S3_frozen_origin_mix" and basis["market_stage"] != "frozen":
            errors.append(
                f"[{widget_id}] market_stage 불일치: {basis['market_stage']}"
            )

        if widget_id == "S3_hs_classification_guide" and widget["data"]:
            codes = {row.get("hs6") for row in widget["data"]}
            required = {"030781", "030791", "030792", "160559"}
            if not required <= codes:
                errors.append(f"[{widget_id}] G-003: 필수 HS6 누락 {sorted(required - codes)}")
            if "광의" not in widget["methodology"]:
                errors.append(f"[{widget_id}] G-003: 광의 범위 고지 누락")

        try:
            coverage_start = parse_edge(basis["coverage_start"], upper=False)
            coverage_end = parse_edge(basis["coverage_end"], upper=True)
            published_at = parse_edge(basis["published_at"], upper=True)
            retrieved_at = parse_edge(basis["retrieved_at"], upper=True)
        except GateError as exc:
            errors.append(f"[{widget_id}] 날짜 게이트: {exc}")
        else:
            if coverage_start > coverage_end:
                errors.append(f"[{widget_id}] coverage_start > coverage_end")
            if coverage_end > published_at:
                errors.append(f"[{widget_id}] coverage_end > published_at")
            if published_at > retrieved_at:
                errors.append(f"[{widget_id}] published_at > retrieved_at")

    errors.extend(_check_anchor_values(doc))
    return errors


def validate(doc: object) -> list[str]:
    schema_errors = check_schema(doc)
    if schema_errors:
        return schema_errors
    return check_gates(doc)  # type: ignore[arg-type]


def _minimal_doc() -> dict:
    source_rows = [
        ("WH-PROD-FAO-FISHSTAT", "FAO", "A"),
        ("WH-TRADE-KCS", "관세청", "A"),
        ("WH-TRADE-KMI-FTA", "KMI", "A"),
        ("WH-REG-DEFRA-FMP", "Defra", "B"),
        ("WH-REG-DSIFCA", "D&S IFCA", "B"),
        ("WH-REG-DFO-CA", "DFO Canada", "B"),
    ]
    return {
        "meta": {
            "built_at": "2026-08-13T09:00:00+09:00",
            "builder_version": "whelk_build/1.0.0",
            "archive_snapshot": "whelk archive @ 2026-08-12",
            "gate_version": "measurement_gate 2026-08-13",
            "telemetry": "SYNCED",
            "coverage_gaps": [
                {
                    "series": "검증용 계열",
                    "missing": ["2025"],
                    "available": ["2024", "2026-01~05"],
                    "impact": "구간 점프",
                }
            ],
        },
        "sources": [
            {
                "source_id": source_id,
                "publisher": publisher,
                "series": "검증용 계열",
                "priority": "P0",
                "grade": grade,
                "frequency": "annual",
                "landing_url": "https://example.invalid/",
                "archive_subdir": "fixture",
                "latest_verified": "2024",
                "note": "검증기 자체검사용",
            }
            for source_id, publisher, grade in source_rows
        ],
        "gates": [
            {
                "gate_id": gate_id,
                "subject": "검증",
                "allowed_use": "허용",
                "blocked_use": "차단",
                "evidence_path": "fixture.csv",
            }
            for gate_id in sorted(REQUIRED_GATE_IDS)
        ],
        "monitoring": [],
        "widgets": {
            "S1_fixture": {
                "section": "S1",
                "title": "검증 위젯",
                "chartType": "card",
                "data": [{"value": 1}],
                "methodology": "검증용 관측값",
                "basis": {
                    "species": ["Buccinum undatum"],
                    "taxon_scope": "buccinum_only",
                    "weight_basis": "live_weight",
                    "market_stage": "capture",
                    "aggregation": "sum_by_year",
                    "metrics": ["coverage"],
                    "claim_type": "descriptive",
                    "currency": "n/a",
                    "currency_converted": False,
                    "fx_date": None,
                    "nominal_real": "n/a",
                    "coverage_start": "2024",
                    "coverage_end": "2024",
                    "published_at": "2026-07-06",
                    "retrieved_at": "2026-08-12",
                    "source_ids": sorted(REQUIRED_SOURCE_IDS),
                    "source_grade": "B",
                    "archive_path": "fixture.csv",
                    "restrictions": [],
                    "blocked_use": [],
                },
            }
        },
    }


def _mutate(doc: dict, path: list, value: object) -> dict:
    changed = copy.deepcopy(doc)
    node = changed
    for key in path[:-1]:
        node = node[key]
    node[path[-1]] = value
    return changed


def self_test() -> None:
    base = _minimal_doc()
    assert validate(base) == [], validate(base)
    widget_path = ["widgets", "S1_fixture"]
    basis_path = widget_path + ["basis"]

    def fails(doc: dict, marker: str) -> None:
        observed = validate(doc)
        assert any(marker in error for error in observed), (marker, observed)

    fails(_mutate(base, ["meta", "telemetry"], "LIVE"), "SCHEMA")

    missing_gate = copy.deepcopy(base)
    missing_gate["gates"] = missing_gate["gates"][:-1]
    fails(missing_gate, "gate_id")

    fails(_mutate(base, basis_path + ["source_ids"], []), "source_ids")
    fails(_mutate(base, basis_path + ["source_grade"], "A"), "실제 최저 등급")
    fails(_mutate(base, basis_path + ["coverage_start"], "2027"), "coverage_start")
    fails(_mutate(base, widget_path + ["chartType"], "unknown"), "chartType")

    empty = _mutate(base, widget_path + ["data"], [])
    empty = _mutate(empty, widget_path + ["methodology"], "설명 누락")
    fails(empty, "공백 사유")

    fails(
        _mutate(base, basis_path + ["species"], ["n/a", "Buccinum undatum"]),
        "n/a와 실제 학명",
    )
    rapana = _mutate(base, basis_path + ["species"], ["Rapana spp"])
    fails(rapana, "Rapana 혼입")

    kcs = _mutate(base, basis_path + ["source_ids"], ["WH-TRADE-KCS"])
    kcs = _mutate(kcs, basis_path + ["metrics"], ["value_usd"])
    kcs = _mutate(kcs, basis_path + ["coverage_end"], "2026-06")
    fails(kcs, "G-002")

    annualized = _mutate(kcs, basis_path + ["coverage_end"], "2026-05")
    annualized = _mutate(annualized, basis_path + ["restrictions"], ["G-002", "G-003"])
    annualized = _mutate(annualized, widget_path + ["methodology"], "1605.59 광의 대리지표")
    annualized = _mutate(annualized, widget_path + ["data"], [{"label": "2026 연환산"}])
    fails(annualized, "금지 산출")

    broad_missing = _mutate(annualized, widget_path + ["data"], [{"label": "2026년 1~5월"}])
    broad_missing = _mutate(broad_missing, widget_path + ["methodology"], "상세행 합산")
    fails(broad_missing, "광의 대리지표")

    fails(_mutate(base, ["meta", "coverage_gaps"], []), "coverage_gaps")
    fails(
        _mutate(
            base,
            ["meta", "coverage_gaps"],
            [
                {
                    "series": "검증용 계열",
                    "missing": ["2027"],
                    "available": ["2024"],
                    "impact": "없음",
                }
            ],
        ),
        "2025 공백 고지 누락",
    )

    # G-006: HSK8 바구니로 분해된 원산지 위젯의 실패 케이스 3종.
    basket = _mutate(base, basis_path + ["metrics"], ["value_usd", "share_pct"])
    basket = _mutate(basket, basis_path + ["taxon_scope"], "sea_snail_prepared")
    basket = _mutate(basket, basis_path + ["market_stage"], "prepared_preserved")
    basket = _mutate(basket, basis_path + ["weight_basis"], "net_weight")
    basket = _mutate(basket, basis_path + ["species"], ["n/a"])
    basket = _mutate(basket, basis_path + ["aggregation"], "sum_by_country")
    basket = _mutate(basket, basis_path + ["claim_type"], "comparative")
    basket = _mutate(basket, basis_path + ["coverage_end"], "2026-05")
    basket = _mutate(
        basket, basis_path + ["restrictions"], ["G-002", "G-003", "G-005", "G-006"]
    )
    basket = _mutate(
        basket,
        widget_path + ["methodology"],
        "HSK8 바구니별 광의 대리지표 점유율. 2025년 원자료는 아카이브에 없다",
    )
    basket = _mutate(
        basket,
        widget_path + ["data"],
        [
            {"hsk8": "16055910", "origin": "영국", "share_within_basket_2026_pct": 62.41},
            {"hsk8": "16055910", "origin": "기타", "share_within_basket_2026_pct": 37.59},
        ],
    )
    assert validate(basket) == [], validate(basket)

    no_hsk8 = copy.deepcopy(basket)
    for row in no_hsk8["widgets"]["S1_fixture"]["data"]:
        row.pop("hsk8")
    fails(no_hsk8, "hsk8 바구니 표기 누락")

    crossed = copy.deepcopy(basket)
    crossed["widgets"]["S1_fixture"]["data"][1]["hsk8"] = "16055990"
    fails(crossed, "바구니 교차 분모")

    unlabelled = _mutate(
        basket,
        widget_path + ["methodology"],
        "바구니별 광의 대리지표 점유율. 2025년 원자료는 아카이브에 없다",
    )
    fails(unlabelled, "HSK8 분해 고지 누락")

    print("self-test OK — 18 cases")


def main(argv: list[str]) -> int:
    if "--self-test" in argv:
        self_test()
        return 0
    if len(argv) < 2:
        print(__doc__)
        return 2
    path = Path(argv[1])
    document = json.loads(path.read_text(encoding="utf-8"))
    errors = validate(document)
    if errors:
        print(f"✗ {path} — {len(errors)}건 위반\n")
        for error in errors:
            print("  " + error)
        return 1
    empty_count = sum(widget["data"] == [] for widget in document["widgets"].values())
    print(
        f"✓ {path} — 위젯 {len(document['widgets'])}개, "
        f"빈 카드 {empty_count}개, 게이트 위반 0"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
