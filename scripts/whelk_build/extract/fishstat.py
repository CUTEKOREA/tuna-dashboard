"""Extract FAO FishStat capture, aquaculture, and species-scope widgets."""

from __future__ import annotations

import csv
from collections import defaultdict
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Mapping

from ..derive import derive_buccinum_only_ranking
from ..spec import (
    AQUACULTURE_PATH,
    CAPTURE_PATH,
    SPECIES_CODES_PATH,
    WidgetSpec,
    load_config,
)


COUNTRY_KO = {
    "826": "영국",
    "484": "멕시코",
    "410": "한국",
    "250": "프랑스",
    "792": "튀르키예",
    "643": "러시아",
    "124": "캐나다",
    "372": "아일랜드",
    "566": "나이지리아",
    "586": "파키스탄",
    "156": "중국",
    "184": "쿡 제도",
    "578": "노르웨이",
}


def _read_csv(path: Path) -> list[dict[str, str]]:
    with Path(path).open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def _decimal(value: str, *, context: str) -> Decimal:
    try:
        return Decimal(value or "0")
    except InvalidOperation as exc:
        raise ValueError(f"invalid FishStat VALUE for {context}: {value!r}") from exc


def _number(value: Decimal, places: int = 3) -> int | float:
    value = round(value, places)
    if value == value.to_integral_value():
        return int(value)
    return float(value)


def _valid_quantity_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    return [
        row
        for row in rows
        if row.get("MEASURE") == "Q_tlw" and row.get("PERIOD", "").isdigit()
    ]


def _species_scope(rows: list[dict[str, str]]) -> tuple[list[dict], list[str]]:
    config = load_config("S1_species_scope_notice")
    data = [
        {
            "alpha3_code": row["3A_Code"],
            "name_en": row["Name_En"],
            "scientific_name": row["Scientific_Name"],
            "isscaap_group": row["ISSCAAP_Group_En"],
        }
        for row in rows
    ]
    if len(data) != config["expected_species_count"]:
        raise ValueError(
            "FishStat species-code scope must contain "
            f"{config['expected_species_count']} rows; got {len(data)}"
        )
    scientific_names = [row["scientific_name"] for row in data]
    if len(set(scientific_names)) != len(scientific_names):
        raise ValueError("FishStat species-code scope contains duplicate scientific names")
    return data, scientific_names


def _capture_totals(
    rows: list[dict[str, str]],
) -> tuple[dict[tuple[int, str], Decimal], dict[int, Decimal]]:
    country_year: dict[tuple[int, str], Decimal] = defaultdict(Decimal)
    world_year: dict[int, Decimal] = defaultdict(Decimal)
    for row in _valid_quantity_rows(rows):
        year = int(row["PERIOD"])
        country_code = row["COUNTRY.UN_CODE"]
        value = _decimal(
            row.get("VALUE", ""),
            context=f"capture {year}/{country_code}/{row.get('SPECIES.Scientific_Name')}",
        )
        country_year[(year, country_code)] += value
        world_year[year] += value
    return country_year, world_year


def _capture_species_totals(
    rows: list[dict[str, str]], period: int
) -> dict[tuple[str, str, str], Decimal]:
    totals: dict[tuple[str, str, str], Decimal] = defaultdict(Decimal)
    for row in _valid_quantity_rows(rows):
        if int(row["PERIOD"]) != period:
            continue
        value = _decimal(
            row.get("VALUE", ""),
            context=(
                f"capture species {period}/{row['COUNTRY.UN_CODE']}/"
                f"{row.get('SPECIES.Scientific_Name')}"
            ),
        )
        totals[
            (
                row["COUNTRY.UN_CODE"],
                row["SPECIES.ALPHA_3_CODE"],
                row["SPECIES.Scientific_Name"],
            )
        ] += value
    return totals


def extract_fishstat(
    archive_root: Path,
    specs: Mapping[str, WidgetSpec],
) -> dict[str, dict]:
    archive_root = Path(archive_root)
    capture_rows = _read_csv(archive_root / CAPTURE_PATH)
    aquaculture_rows = _read_csv(archive_root / AQUACULTURE_PATH)
    species_rows = _read_csv(archive_root / SPECIES_CODES_PATH)
    species_data, all_species = _species_scope(species_rows)

    capture_valid = _valid_quantity_rows(capture_rows)
    observed_capture_species = sorted(
        {row["SPECIES.Scientific_Name"] for row in capture_valid}
    )
    country_year, world_year = _capture_totals(capture_rows)

    rank_config = load_config("S1_global_capture_top_countries")
    rank_year = int(rank_config["period"])
    country_species_totals = _capture_species_totals(capture_rows, rank_year)
    unresolved_species_codes = {
        row["alpha3_code"]
        for row in species_data
        if "NEI" in row["name_en"].upper()
    }
    ranked = sorted(
        (
            (country_code, value)
            for (year, country_code), value in country_year.items()
            if year == rank_year
        ),
        key=lambda item: (-item[1], item[0]),
    )
    top_rows = []
    for rank, (country_code, value) in enumerate(
        ranked[: int(rank_config["top_n"])], start=1
    ):
        if country_code not in COUNTRY_KO:
            raise ValueError(f"missing Korean country label for FishStat code {country_code}")
        species_rows_for_country = sorted(
            (
                (alpha3, scientific_name, species_value)
                for (code, alpha3, scientific_name), species_value
                in country_species_totals.items()
                if code == country_code and species_value > 0
            ),
            key=lambda item: (-item[2], item[0], item[1]),
        )
        if not species_rows_for_country:
            raise ValueError(
                f"FishStat rank row has no positive species detail for {country_code}"
            )
        species_composition = [
            {
                "alpha3": alpha3,
                "scientific_name": scientific_name,
                "tonnes": _number(species_value),
                "share_pct": _number(species_value / value * Decimal(100), 6),
            }
            for alpha3, scientific_name, species_value in species_rows_for_country
        ]
        dominant_alpha3, dominant_scientific_name, _ = species_rows_for_country[0]
        top_rows.append(
            {
                "rank": rank,
                "country_code": country_code,
                "country": COUNTRY_KO[country_code],
                "tonnes_live_weight": _number(value),
                "species_composition": species_composition,
                "dominant_species_scientific_name": dominant_scientific_name,
                "is_species_resolved": dominant_alpha3 not in unresolved_species_codes,
            }
        )

    buccinum_only_ranking = derive_buccinum_only_ranking(
        country_species_totals,
        COUNTRY_KO,
        top_n=5,
    )

    korea_config = load_config("S1_korea_capture_timeline")
    korea_code = korea_config["country_code"]
    korea_values = sorted(
        (year, value)
        for (year, country_code), value in country_year.items()
        if country_code == korea_code
        and year <= int(korea_config["period_end"])
        and year >= int(korea_config["requested_period_start"])
    )
    if not korea_values:
        raise ValueError("FishStat Korea capture filter produced no rows")
    record_value = max(value for _, value in korea_values)
    korea_data = [
        {
            "year": year,
            "tonnes_live_weight": _number(value),
            "is_record": value == record_value,
        }
        for year, value in korea_values
    ]

    uk_config = load_config("S1_uk_capture_import_link")
    uk_values = sorted(
        (year, value)
        for (year, country_code), value in country_year.items()
        if country_code == uk_config["country_code"]
        and int(uk_config["period_start"]) <= year <= int(uk_config["period_end"])
    )
    uk_data = [
        {
            "period": str(year),
            "period_basis": "연간",
            "uk_capture_tonnes_live_weight": _number(value),
            "korea_import_usd": None,
            "korea_import_kg": None,
        }
        for year, value in uk_values
    ]

    aqua_config = load_config("S1_aquaculture_species_split")
    aqua_period = str(aqua_config["period"])
    aqua_filtered = [
        row
        for row in _valid_quantity_rows(aquaculture_rows)
        if row["PERIOD"] == aqua_period
    ]
    aqua_by_species: dict[str, Decimal] = defaultdict(Decimal)
    china_by_species: dict[str, Decimal] = defaultdict(Decimal)
    for row in aqua_filtered:
        scientific_name = row["SPECIES.Scientific_Name"]
        value = _decimal(
            row.get("VALUE", ""),
            context=f"aquaculture {aqua_period}/{scientific_name}",
        )
        aqua_by_species[scientific_name] += value
        if row["COUNTRY.UN_CODE"] == aqua_config["china_country_code"]:
            china_by_species[scientific_name] += value
    aqua_total = sum(aqua_by_species.values(), Decimal(0))
    if aqua_total <= 0:
        raise ValueError("FishStat 2024 aquaculture total must be positive")

    aqua_data = []
    for scientific_name, value in sorted(
        aqua_by_species.items(), key=lambda item: (-item[1], item[0])
    ):
        aqua_data.append(
            {
                "scientific_name": scientific_name,
                "tonnes_live_weight": _number(value),
                "china_tonnes_live_weight": _number(china_by_species[scientific_name]),
                "share_pct": _number(value / aqua_total * Decimal(100), 6),
                "observation": "FishStat 2024 관측행",
            }
        )
    buccinum_name = "Buccinum spp"
    if not any(row["scientific_name"] == buccinum_name for row in aqua_data):
        aqua_data.append(
            {
                "scientific_name": buccinum_name,
                "tonnes_live_weight": 0,
                "china_tonnes_live_weight": 0,
                "share_pct": 0,
                "observation": "FishStat 2024 양식 필터에서 관측행 없음",
            }
        )

    common_capture_basis = {
        "species": observed_capture_species,
        "coverage_end": "2024",
        "published_at": "2026-07-06",
        "retrieved_at": "2026-08-12",
    }
    return {
        "S1_global_capture_top_countries": {
            "chartType": specs["S1_global_capture_top_countries"].chart_type,
            "data": top_rows,
            "buccinum_only_ranking": buccinum_only_ranking,
            "world_total_tonnes": _number(world_year[rank_year]),
            "xAxis": "tonnes_live_weight",
            "series": ["tonnes_live_weight"],
            "unit": "톤(활중량)",
            "methodology": (
                "FishStat 28종 코드 범위에서 2024년 Q_tlw 관측 9종을 국가별 합산하고 "
                "각 국가의 종 구성·지배 종군·NEI 해상도를 함께 산출. Buccinum 속 단독 "
                "순위는 학명의 첫 토큰이 Buccinum인 상세행만 재집계. 세계 합계는 상위 "
                "10개국이 아닌 전체 상세행 합계"
            ),
            "basis": {
                **common_capture_basis,
                "coverage_start": "2024",
                "aggregation": "sum_by_country",
            },
        },
        "S1_korea_capture_timeline": {
            "chartType": specs["S1_korea_capture_timeline"].chart_type,
            "data": korea_data,
            "xAxis": "year",
            "series": ["tonnes_live_weight"],
            "unit": "톤(활중량)",
            "methodology": (
                "COUNTRY.UN_CODE=410, MEASURE=Q_tlw 상세행을 연도별 합산. "
                "28종 코드 범위 중 실제 한국 관측은 1970~2024이며 1950~1969 관측행은 없음"
            ),
            "basis": {
                **common_capture_basis,
                "coverage_start": str(korea_data[0]["year"]),
                "aggregation": "sum_by_year",
            },
        },
        "S1_uk_capture_import_link": {
            "chartType": specs["S1_uk_capture_import_link"].chart_type,
            "data": uk_data,
            "xAxis": "period",
            "series": ["uk_capture_tonnes_live_weight", "korea_import_usd"],
            "unit": "톤(활중량)·USD",
            "methodology": (
                "영국 COUNTRY.UN_CODE=826의 FishStat 28종 코드 범위 어획을 2018~2024 "
                "연도별 합산; 한국 수입은 KCS 추출 후 파생 단계에서 결합. "
                "Defra와 D&S IFCA는 영국 규제 맥락에만 사용"
            ),
            "basis": {
                **common_capture_basis,
                "coverage_start": str(uk_config["period_start"]),
                "aggregation": "none",
            },
        },
        "S1_aquaculture_species_split": {
            "chartType": specs["S1_aquaculture_species_split"].chart_type,
            "data": aqua_data,
            "total_aquaculture_tonnes": _number(aqua_total),
            "xAxis": "scientific_name",
            "series": ["tonnes_live_weight"],
            "unit": "톤(활중량)",
            "methodology": (
                "FishStat 양식 2024 Q_tlw를 학명별 합산. Rapana와 Buccinum을 구분하며 "
                "Buccinum 0은 물리적 불가능 단정이 아니라 보관 필터의 관측행 부재. "
                "DFO 캐나다 자료는 Buccinum 어업관리의 종 맥락에만 사용"
            ),
            "basis": {
                "species": sorted(set(aqua_by_species) | {buccinum_name}),
                "coverage_start": "2024",
                "coverage_end": "2024",
                "published_at": "2026-07-06",
                "retrieved_at": "2026-08-12",
                "aggregation": "sum_by_species",
            },
        },
        "S1_species_scope_notice": {
            "chartType": specs["S1_species_scope_notice"].chart_type,
            "data": species_data,
            "series": ["scientific_name"],
            "unit": "종",
            "methodology": (
                "FishStat 종 코드표 28종 전체를 공개. 어획 수치는 이 코드 범위의 상세행을 "
                "합산한 Gastropoda 범위이며 Buccinum undatum 단독 통계가 아님"
            ),
            "basis": {
                "species": all_species,
                "coverage_start": "1950",
                "coverage_end": "2024",
                "published_at": "2026-07-06",
                "retrieved_at": "2026-08-12",
            },
        },
    }


__all__ = ["extract_fishstat"]
