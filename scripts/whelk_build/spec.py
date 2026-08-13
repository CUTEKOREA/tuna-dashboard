"""Canonical widget specifications for the whelk v2 archive builder."""

from __future__ import annotations

import copy
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Mapping


REPO_ROOT = Path(__file__).resolve().parents[2]
CONFIG_DIR = Path(__file__).with_name("configs")
DEFAULT_ARCHIVE_ROOT = Path(
    "/Users/idong-geon/Library/CloudStorage/"
    "GoogleDrive-cutekorea@gmail.com/내 드라이브/agri_data/"
    "01_수산물(Seafood)/whelk/00_골뱅이_관련자료"
)
ARCHIVE_SNAPSHOT_DATE = "2026-08-12"


@dataclass(frozen=True)
class WidgetSpec:
    widget_id: str
    section: str
    title: str
    chart_type: str
    extractor: str
    species: tuple[str, ...]
    taxon_scope: str
    weight_basis: str
    market_stage: str
    aggregation: str
    metrics: tuple[str, ...]
    claim_type: str
    currency: str
    source_ids: tuple[str, ...]
    archive_paths: tuple[str, ...]
    restrictions: tuple[str, ...]
    coverage_start: str
    coverage_end: str
    published_at: str
    retrieved_at: str


CAPTURE_PATH = (
    "11_분석·가공데이터/FAO_FishStat/updates/2026-07-06/"
    "FishStat_2026.1.0_capture_whelk.csv"
)
AQUACULTURE_PATH = (
    "11_분석·가공데이터/FAO_FishStat/updates/2026-07-06/"
    "FishStat_2026.1.0_aquaculture_whelk.csv"
)
GLOBAL_PRODUCTION_PATH = (
    "11_분석·가공데이터/FAO_FishStat/updates/2026-07-06/"
    "FishStat_2026.1.0_global_production_whelk.csv"
)
SPECIES_CODES_PATH = (
    "11_분석·가공데이터/FAO_FishStat/updates/2026-07-06/"
    "FishStat_2026.1.0_species_codes_whelk.csv"
)
KCS_YTD_PATH = (
    "11_분석·가공데이터/KCS_trade/updates/2026-07-06/"
    "KCS_2026YTD_HS_whelk.csv"
)
KCS_XML_2023_PATH = (
    "10_원본데이터셋/KCS_trade/2023_2024/kcs_HS160559_2023.xml"
)
KCS_XML_2024_PATH = (
    "10_원본데이터셋/KCS_trade/2023_2024/kcs_HS160559_2024.xml"
)
KCS_XML_030781_PATH = (
    "10_원본데이터셋/KCS_trade/2023_2024/kcs_HS030781_2024.xml"
)
KCS_RAW_TRADE_DIR = "10_원본데이터셋/KCS_trade/2023_2024"
KMI_PATH = "11_분석·가공데이터/KMI_FTA_imports/whelk_fta_quarterly.json"
HS_MAP_PATH = (
    "11_분석·가공데이터/trade_classification/updates/2026-07-06/"
    "HS_matrix_whelk.csv"
)


_TRADE_COMMON = {
    "species": ("n/a",),
    "taxon_scope": "sea_snail_prepared",
    "weight_basis": "net_weight",
    "market_stage": "prepared_preserved",
    "currency": "USD",
    "source_ids": ("WH-TRADE-KCS",),
    "restrictions": ("G-002", "G-003"),
    "published_at": "2026-07-06",
    "retrieved_at": ARCHIVE_SNAPSHOT_DATE,
}


WIDGET_SPECS = (
    WidgetSpec(
        widget_id="S3_origin_portfolio_shift",
        section="S3",
        title="원산지 구성 비교 (HSK8 바구니별 · 2024·2026년 1~5월)",
        chart_type="bar",
        extractor="derive",
        aggregation="sum_by_country",
        metrics=("value_usd", "weight_kg", "share_pct"),
        claim_type="comparative",
        archive_paths=(KCS_XML_2024_PATH, KCS_YTD_PATH),
        coverage_start="2024",
        coverage_end="2026-05",
        **{
            **_TRADE_COMMON,
            "restrictions": ("G-002", "G-003", "G-005", "G-006"),
        },
    ),
    WidgetSpec(
        widget_id="S3_frozen_origin_mix",
        section="S3",
        title="냉동 바다고둥 수입 구성 (2026년 1~5월)",
        chart_type="bar",
        extractor="derive",
        aggregation="sum_by_country",
        metrics=("value_usd", "weight_kg", "share_pct", "unit_price_usd_per_kg"),
        claim_type="descriptive",
        archive_paths=(KCS_YTD_PATH,),
        coverage_start="2026-01",
        coverage_end="2026-05",
        **{
            **_TRADE_COMMON,
            "taxon_scope": "gastropoda_aggregate",
            "market_stage": "frozen",
            "restrictions": ("G-002", "G-003", "G-006"),
        },
    ),
    WidgetSpec(
        widget_id="S3_prepared_import_monthly",
        section="S3",
        title="조제 골뱅이 월별 수입 원계열",
        chart_type="composed",
        extractor="kcs",
        aggregation="sum_by_month",
        metrics=("value_usd", "weight_kg", "unit_price_usd_per_kg"),
        claim_type="descriptive",
        archive_paths=(KCS_YTD_PATH,),
        coverage_start="2026-01",
        coverage_end="2026-05",
        **_TRADE_COMMON,
    ),
    WidgetSpec(
        widget_id="S3_origin_cif_ladder",
        section="S3",
        title="원산지별 수입단가 사다리",
        chart_type="bar",
        extractor="derive",
        aggregation="sum_by_country",
        metrics=("value_usd", "weight_kg", "unit_price_usd_per_kg"),
        claim_type="comparative",
        archive_paths=(KCS_XML_2024_PATH, KCS_YTD_PATH),
        coverage_start="2024",
        coverage_end="2026-05",
        **{
            **_TRADE_COMMON,
            "restrictions": ("G-002", "G-003", "G-004", "G-006"),
        },
    ),
    WidgetSpec(
        widget_id="S1_global_capture_top_countries",
        section="S1",
        title="글로벌 어획 상위국 (2024 확정)",
        chart_type="bar",
        extractor="fishstat",
        species=("n/a",),
        taxon_scope="gastropoda_aggregate",
        weight_basis="live_weight",
        market_stage="capture",
        aggregation="sum_by_country",
        metrics=("production_tonnes",),
        claim_type="descriptive",
        currency="n/a",
        source_ids=("WH-PROD-FAO-FISHSTAT",),
        archive_paths=(CAPTURE_PATH, SPECIES_CODES_PATH),
        restrictions=("G-001",),
        coverage_start="2024",
        coverage_end="2024",
        published_at="2026-07-06",
        retrieved_at=ARCHIVE_SNAPSHOT_DATE,
    ),
    WidgetSpec(
        widget_id="S1_korea_capture_timeline",
        section="S1",
        title="한국 어획 시계열 1950~2024",
        chart_type="area",
        extractor="fishstat",
        species=("n/a",),
        taxon_scope="gastropoda_aggregate",
        weight_basis="live_weight",
        market_stage="capture",
        aggregation="sum_by_year",
        metrics=("production_tonnes",),
        claim_type="descriptive",
        currency="n/a",
        source_ids=("WH-PROD-FAO-FISHSTAT",),
        archive_paths=(CAPTURE_PATH, SPECIES_CODES_PATH),
        restrictions=("G-001",),
        coverage_start="1970",
        coverage_end="2024",
        published_at="2026-07-06",
        retrieved_at=ARCHIVE_SNAPSHOT_DATE,
    ),
    WidgetSpec(
        widget_id="S1_uk_capture_import_link",
        section="S1",
        title="영국 어획 자원과 한국 수입 연동",
        chart_type="composed",
        extractor="derive",
        species=("n/a",),
        taxon_scope="gastropoda_aggregate",
        weight_basis="n/a",
        market_stage="n/a",
        aggregation="none",
        metrics=("production_tonnes", "value_usd", "weight_kg"),
        claim_type="comparative",
        currency="USD",
        source_ids=(
            "WH-PROD-FAO-FISHSTAT",
            "WH-TRADE-KCS",
            "WH-REG-DEFRA-FMP",
            "WH-REG-DSIFCA",
        ),
        archive_paths=(
            CAPTURE_PATH,
            KCS_XML_2023_PATH,
            KCS_XML_2024_PATH,
            KCS_YTD_PATH,
            "repo:docs/2026_whelk_industry_sources.md#1-2",
        ),
        restrictions=("G-001", "G-002", "G-003"),
        coverage_start="2018",
        coverage_end="2026-05",
        published_at="2026-07-06",
        retrieved_at=ARCHIVE_SNAPSHOT_DATE,
    ),
    WidgetSpec(
        widget_id="S1_aquaculture_species_split",
        section="S1",
        title="양식 가능성 종별 분해",
        chart_type="bar",
        extractor="fishstat",
        species=("n/a",),
        taxon_scope="gastropoda_aggregate",
        weight_basis="live_weight",
        market_stage="n/a",
        aggregation="sum_by_species",
        metrics=("production_tonnes", "share_pct"),
        claim_type="comparative",
        currency="n/a",
        source_ids=("WH-PROD-FAO-FISHSTAT", "WH-REG-DFO-CA"),
        archive_paths=(
            AQUACULTURE_PATH,
            GLOBAL_PRODUCTION_PATH,
            SPECIES_CODES_PATH,
            "repo:docs/2026_whelk_industry_sources.md#7-8",
        ),
        restrictions=("G-001",),
        coverage_start="2024",
        coverage_end="2024",
        published_at="2026-07-06",
        retrieved_at=ARCHIVE_SNAPSHOT_DATE,
    ),
    WidgetSpec(
        widget_id="S3_hs_classification_guide",
        section="S3",
        title="HS 코드 체계 해설",
        chart_type="card",
        extractor="hs_map",
        species=("n/a",),
        taxon_scope="sea_snail_prepared",
        weight_basis="n/a",
        market_stage="n/a",
        aggregation="none",
        metrics=("coverage",),
        claim_type="descriptive",
        currency="n/a",
        source_ids=("WH-TRADE-KCS",),
        archive_paths=(HS_MAP_PATH, KCS_YTD_PATH, KCS_XML_030781_PATH),
        restrictions=("G-003",),
        coverage_start="2024",
        coverage_end="2026-05",
        published_at="2026-07-06",
        retrieved_at=ARCHIVE_SNAPSHOT_DATE,
    ),
    WidgetSpec(
        widget_id="S1_species_scope_notice",
        section="S1",
        title="종 코드 커버리지 고지",
        chart_type="card",
        extractor="fishstat",
        species=("n/a",),
        taxon_scope="gastropoda_aggregate",
        weight_basis="n/a",
        market_stage="n/a",
        aggregation="none",
        metrics=("coverage",),
        claim_type="descriptive",
        currency="n/a",
        source_ids=("WH-PROD-FAO-FISHSTAT",),
        archive_paths=(SPECIES_CODES_PATH, CAPTURE_PATH),
        restrictions=("G-001",),
        coverage_start="1950",
        coverage_end="2024",
        published_at="2026-07-06",
        retrieved_at=ARCHIVE_SNAPSHOT_DATE,
    ),
    WidgetSpec(
        widget_id="S3_fta_import_quarterly",
        section="S3",
        title="자유무역협정 체결국 골뱅이 분기별 수입 동향",
        chart_type="composed",
        extractor="kmi",
        species=("n/a",),
        taxon_scope="sea_snail_prepared",
        weight_basis="net_weight",
        market_stage="prepared_preserved",
        aggregation="sum_by_quarter",
        metrics=("value_usd", "weight_kg", "share_pct", "unit_price_usd_per_kg"),
        claim_type="descriptive",
        currency="USD",
        source_ids=("WH-TRADE-KMI-FTA",),
        archive_paths=(KMI_PATH,),
        restrictions=(),
        coverage_start="2020",
        coverage_end="2026-03",
        published_at="2026-05-27",
        retrieved_at=ARCHIVE_SNAPSHOT_DATE,
    ),
)


def load_spec() -> list[WidgetSpec]:
    specs = list(WIDGET_SPECS)
    ids = [spec.widget_id for spec in specs]
    if len(specs) != 11 or len(set(ids)) != 11:
        raise ValueError(
            f"whelk widget spec must contain 11 unique rows; rows={len(specs)} "
            f"unique={len(set(ids))}"
        )
    return specs


def specs_by_id(specs: Iterable[WidgetSpec]) -> dict[str, WidgetSpec]:
    return {spec.widget_id: spec for spec in specs}


def load_config(widget_id: str, config_dir: Path = CONFIG_DIR) -> dict:
    path = Path(config_dir) / f"{widget_id}.json"
    config = json.loads(path.read_text(encoding="utf-8"))
    if config.get("widget_id") != widget_id:
        raise ValueError(f"config widget_id mismatch: {path}")
    return config


def source_grade(
    source_ids: Iterable[str], sources: Mapping[str, Mapping[str, str]]
) -> str:
    order = {"A": 0, "B": 1, "C": 2}
    grades = []
    for source_id in source_ids:
        if source_id not in sources:
            raise ValueError(f"source registry is missing {source_id}")
        grades.append(sources[source_id]["grade"])
    if not grades:
        raise ValueError("widget source_ids must not be empty")
    return max(grades, key=lambda grade: order[grade])


def make_basis(
    spec: WidgetSpec,
    sources: Mapping[str, Mapping[str, str]],
    gates: Mapping[str, Mapping[str, str]],
    *,
    link_card: bool = False,
) -> dict:
    restrictions = list(spec.restrictions)
    return {
        "species": list(spec.species),
        "taxon_scope": spec.taxon_scope,
        "weight_basis": spec.weight_basis,
        "market_stage": spec.market_stage,
        "aggregation": spec.aggregation,
        "metrics": ["coverage"] if link_card else list(spec.metrics),
        "claim_type": spec.claim_type,
        "currency": spec.currency,
        "currency_converted": False,
        "fx_date": None,
        "nominal_real": "nominal" if spec.currency != "n/a" else "n/a",
        "coverage_start": spec.coverage_start,
        "coverage_end": spec.coverage_end,
        "published_at": spec.published_at,
        "retrieved_at": spec.retrieved_at,
        "source_ids": list(spec.source_ids),
        "source_grade": source_grade(spec.source_ids, sources),
        "archive_path": ";".join(spec.archive_paths),
        "restrictions": restrictions,
        "blocked_use": [
            gates[gate_id]["blocked_use"]
            for gate_id in restrictions
            if gate_id in gates
        ],
    }


def make_link_card(
    spec: WidgetSpec,
    sources: Mapping[str, Mapping[str, str]],
    gates: Mapping[str, Mapping[str, str]],
    *,
    reason: str = "해당 추출 단계 미실행으로 데이터 공백; 전체 빌드에서 원천을 다시 읽어야 함",
) -> dict:
    return {
        "section": spec.section,
        "title": spec.title,
        "chartType": "card",
        "data": [],
        "methodology": reason,
        "basis": make_basis(spec, sources, gates, link_card=True),
    }


def apply_widget_patch(widget: Mapping, patch: Mapping) -> dict:
    merged = copy.deepcopy(dict(widget))
    values = copy.deepcopy(dict(patch))
    basis_patch = values.pop("basis", {})
    merged.update(values)
    merged["basis"].update(basis_patch)
    return merged


__all__ = [
    "ARCHIVE_SNAPSHOT_DATE",
    "CONFIG_DIR",
    "KCS_RAW_TRADE_DIR",
    "DEFAULT_ARCHIVE_ROOT",
    "WidgetSpec",
    "apply_widget_patch",
    "load_config",
    "load_spec",
    "make_link_card",
    "specs_by_id",
]
