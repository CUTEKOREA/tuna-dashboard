"""Derive portfolio, unit-price, and cross-source comparison widgets."""

from __future__ import annotations

import copy
from collections import defaultdict
from decimal import Decimal
from typing import Iterable, Mapping

from .spec import WidgetSpec, load_config, specs_by_id


CIF_LADDER_VOLUME_FLOOR_PCT = Decimal("1.0")
BUCCINUM_GENUS = "Buccinum"


def _decimal(value: int | float | str | None) -> Decimal:
    return Decimal(str(value or 0))


def _number(value: Decimal, places: int) -> int | float:
    value = round(value, places)
    if value == value.to_integral_value():
        return int(value)
    return float(value)


def derive_buccinum_only_ranking(
    country_species_totals: Mapping[tuple[str, str, str], Decimal],
    country_labels: Mapping[str, str],
    *,
    top_n: int = 5,
) -> list[dict]:
    """Rank countries after retaining only the scientific genus Buccinum."""
    country_totals: dict[str, Decimal] = defaultdict(Decimal)
    for (country_code, _alpha3, scientific_name), value in country_species_totals.items():
        genus = scientific_name.split(maxsplit=1)[0]
        if genus == BUCCINUM_GENUS and value > 0:
            country_totals[country_code] += value

    ranked = sorted(country_totals.items(), key=lambda item: (-item[1], item[0]))
    result = []
    for rank, (country_code, value) in enumerate(ranked[:top_n], start=1):
        if country_code not in country_labels:
            raise ValueError(
                f"missing Korean country label for Buccinum rank code {country_code}"
            )
        result.append(
            {
                "rank": rank,
                "country_code": country_code,
                "country": country_labels[country_code],
                "tonnes_live_weight": _number(value, 3),
            }
        )
    return result


def _origin_map(snapshot: dict) -> dict[str, dict]:
    return {row["country"]: row for row in snapshot["origins"]}


def _origin_or_zero(origins: dict[str, dict], country: str) -> dict:
    return origins.get(
        country,
        {
            "country": country,
            "import_usd": 0,
            "import_kg": 0,
            "unit_price_usd_per_kg": None,
            "share_pct": 0,
            "monthly": [],
        },
    )


def _volume_share_pct(import_kg: int | float, total_kg: int | float) -> Decimal:
    total = _decimal(total_kg)
    if total <= 0:
        return Decimal(0)
    return _decimal(import_kg) / total * Decimal(100)


def _basket(snapshot: dict, hsk8: str) -> dict:
    return snapshot["baskets"].get(
        hsk8,
        {
            "hsk8": hsk8,
            "total_import_usd": 0,
            "total_import_kg": 0,
            "share_of_hs6_pct": 0,
            "hsk10_observed": [],
            "origins": [],
            "monthly": [],
        },
    )


def _within_basket_pct(import_usd: int | float, basket: dict) -> Decimal:
    total = _decimal(basket["total_import_usd"])
    if total <= 0:
        return Decimal(0)
    return _decimal(import_usd) / total * Decimal(100)


def _portfolio_shift(source_widget: dict, spec: WidgetSpec) -> dict:
    config = load_config(spec.widget_id)
    snapshots = source_widget["source_breakdown"]
    # G-005 기간 정합: 2026년은 1~5월뿐이므로 비교 상대도 2024년 1~5월이어야 한다.
    # 연간(2024) 점유율과 맞대면 하반기 성수기가 빠진 만큼이 구조 변화로 오독된다.
    # G-006 분류 정합: 점유율 분모는 HS6 총액이 아니라 각 HSK8 바구니 총액이다.
    # HS6 분모를 쓰면 16055990 붕괴(-69.5%)가 16055910 원산지의 '점유율 상승'으로 둔갑한다.
    old = snapshots["2024JanMay"]
    recent = snapshots["2026YTD"]
    full_year = snapshots["2024"]
    uk_full_year = _origin_or_zero(
        _origin_map(_basket(full_year, "16055910")), "영국"
    )

    baskets = []
    data = []
    for hsk8 in config["baskets"]:
        old_basket = _basket(old, hsk8)
        recent_basket = _basket(recent, hsk8)
        charted = hsk8 in config["charted_baskets"]
        old_usd = _decimal(old_basket["total_import_usd"])
        recent_usd = _decimal(recent_basket["total_import_usd"])
        basket_meta = {
            "hsk8": hsk8,
            # 아카이브 statKor은 HSK10 말단 라벨이라 HSK8 바구니의 공식 품명이 아니다.
            # 없는 품명을 지어내지 않고 코드 + 관측 원산지로 식별한다.
            "label": f"HSK8 {hsk8}",
            "label_source": "archive_absent",
            "observed_hsk10": sorted(
                set(old_basket["hsk10_observed"]) | set(recent_basket["hsk10_observed"])
            ),
            "import_usd_2024_jan_may": old_basket["total_import_usd"],
            "import_usd_2026_jan_may": recent_basket["total_import_usd"],
            "change_pct": (
                _number((recent_usd / old_usd - Decimal(1)) * Decimal(100), 2)
                if old_usd > 0
                else None
            ),
            "share_of_hs6_2024_jan_may_pct": _number(
                _decimal(old_basket["share_of_hs6_pct"]), 2
            ),
            "share_of_hs6_2026_jan_may_pct": _number(
                _decimal(recent_basket["share_of_hs6_pct"]), 2
            ),
            "charted": charted,
            "top_origins_2026": [
                row["country"] for row in recent_basket["origins"][:3]
            ],
        }
        if not charted:
            basket_meta["excluded_reason"] = (
                f"2026년 1~5월 ${recent_basket['total_import_usd']:,} "
                f"(HS6의 {basket_meta['share_of_hs6_2026_jan_may_pct']}%) — 표본 미달"
            )
        baskets.append(basket_meta)
        if not charted:
            continue

        old_origins = _origin_map(old_basket)
        recent_origins = _origin_map(recent_basket)
        for country in config["origins_by_basket"][hsk8]:
            old_row = _origin_or_zero(old_origins, country)
            recent_row = _origin_or_zero(recent_origins, country)
            old_share = _within_basket_pct(old_row["import_usd"], old_basket)
            recent_share = _within_basket_pct(recent_row["import_usd"], recent_basket)
            shipment_count = recent_row.get("shipment_count", 0)
            data.append(
                {
                    "hsk8": hsk8,
                    "origin": country,
                    "import_usd_2024_jan_may": old_row["import_usd"],
                    "share_within_basket_2024_pct": _number(old_share, 2),
                    "import_usd_2026_jan_may": recent_row["import_usd"],
                    "share_within_basket_2026_pct": _number(recent_share, 2),
                    "share_delta_pp": _number(recent_share - old_share, 2),
                    "shipment_count_2026": shipment_count,
                    "shipment_months_2026": recent_row.get("shipment_months", []),
                    "thin_evidence": shipment_count
                    <= config["thin_evidence_shipment_max"],
                    "combined": False,
                }
            )

        # 명시 원산지가 바구니 총액을 다 덮지 않으면 점유율 합이 100에 못 미쳐
        # 분모가 무엇인지 흐려진다. 잔여분을 '기타' 행으로 닫는다.
        listed = set(config["origins_by_basket"][hsk8])
        old_rest = sum(
            (
                _decimal(row["import_usd"])
                for row in old_basket["origins"]
                if row["country"] not in listed
            ),
            Decimal(0),
        )
        recent_rest = sum(
            (
                _decimal(row["import_usd"])
                for row in recent_basket["origins"]
                if row["country"] not in listed
            ),
            Decimal(0),
        )
        old_rest_share = _within_basket_pct(_number(old_rest, 0), old_basket)
        recent_rest_share = _within_basket_pct(_number(recent_rest, 0), recent_basket)
        rest_shipments = sum(
            row.get("shipment_count", 0)
            for row in recent_basket["origins"]
            if row["country"] not in listed
        )
        data.append(
            {
                "hsk8": hsk8,
                "origin": "기타",
                "import_usd_2024_jan_may": _number(old_rest, 0),
                "share_within_basket_2024_pct": _number(old_rest_share, 2),
                "import_usd_2026_jan_may": _number(recent_rest, 0),
                "share_within_basket_2026_pct": _number(recent_rest_share, 2),
                "share_delta_pp": _number(recent_rest_share - old_rest_share, 2),
                "shipment_count_2026": rest_shipments,
                "shipment_months_2026": [],
                "thin_evidence": False,
                "combined": False,
            }
        )

        for label, members in config["combined_origins"].items():
            if label != hsk8:
                continue
            old_combined = sum(
                (
                    _decimal(_origin_or_zero(old_origins, country)["import_usd"])
                    for country in members
                ),
                Decimal(0),
            )
            recent_combined = sum(
                (
                    _decimal(_origin_or_zero(recent_origins, country)["import_usd"])
                    for country in members
                ),
                Decimal(0),
            )
            old_share = _within_basket_pct(_number(old_combined, 0), old_basket)
            recent_share = _within_basket_pct(_number(recent_combined, 0), recent_basket)
            data.append(
                {
                    "hsk8": hsk8,
                    "origin": "+".join(members),
                    "import_usd_2024_jan_may": _number(old_combined, 0),
                    "share_within_basket_2024_pct": _number(old_share, 2),
                    "import_usd_2026_jan_may": _number(recent_combined, 0),
                    "share_within_basket_2026_pct": _number(recent_share, 2),
                    "share_delta_pp": _number(recent_share - old_share, 2),
                    "shipment_count_2026": sum(
                        _origin_or_zero(recent_origins, country).get(
                            "shipment_count", 0
                        )
                        for country in members
                    ),
                    "shipment_months_2026": sorted(
                        {
                            month
                            for country in members
                            for month in _origin_or_zero(
                                recent_origins, country
                            ).get("shipment_months", [])
                        }
                    ),
                    "thin_evidence": False,
                    # 합산 행은 바구니 내 점유율 합계 검산(100%)에서 제외된다.
                    "combined": True,
                }
            )

    combined_row = next(row for row in data if row["combined"])
    qualification_origin = config["qualification_origin"]
    qualification_row = next(
        row
        for row in data
        if row["hsk8"] == combined_row["hsk8"]
        and row["origin"] == qualification_origin
        and not row["combined"]
    )
    qualification_basket = _basket(recent, combined_row["hsk8"])
    qualification_excluded_denominator = (
        _decimal(qualification_basket["total_import_usd"])
        - _decimal(qualification_row["import_usd_2026_jan_may"])
    )
    if qualification_excluded_denominator <= 0:
        raise ValueError("N1 qualification-excluded denominator must be positive")
    combined_share_excluding_qualification = (
        _decimal(combined_row["import_usd_2026_jan_may"])
        / qualification_excluded_denominator
        * Decimal(100)
    )
    qualification_month_count = len(
        set(qualification_row["shipment_months_2026"])
    )

    return {
        "chartType": spec.chart_type,
        "layout": "small_multiples_by_basket",
        "data": data,
        "baskets": baskets,
        "period_totals": {
            "2024_jan_may_import_usd": old["total_import_usd"],
            "2026_jan_may_import_usd": recent["total_import_usd"],
        },
        "interpretation_context": {
            "qualification_origin": qualification_origin,
            "qualification_observed_month_count": qualification_month_count,
            "combined_share_excluding_qualification_origin_2026_pct": _number(
                combined_share_excluding_qualification, 2
            ),
        },
        "uk_monthly_2024": uk_full_year.get("monthly", []),
        "window_sensitivity": {
            "jan_may": {
                f"{hsk8}_share_of_hs6_2024_pct": _number(
                    _decimal(_basket(old, hsk8)["share_of_hs6_pct"]), 2
                )
                for hsk8 in config["baskets"]
            },
            "full_year": {
                f"{hsk8}_share_of_hs6_2024_pct": _number(
                    _decimal(_basket(full_year, hsk8)["share_of_hs6_pct"]), 2
                )
                for hsk8 in config["baskets"]
            },
            "note": (
                "같은 2024년이라도 1~5월 창과 연간 창에서 바구니 비중이 갈린다. "
                "1~5월 창은 흑해축(16055990) 비중이 극대화되고 연간 창은 5~8월 성수기로 "
                "북해축(16055910)이 커진다. 창 선택이 결론을 만든다."
            ),
        },
        "xAxis": "origin",
        "series": [
            "share_within_basket_2024_pct",
            "share_within_basket_2026_pct",
        ],
        "unit": "%·USD",
        "methodology": (
            "HS 1605.59는 원산지 구성이 겹치지 않는 두 개의 HSK8 바구니 합이다. "
            "2026년 1~5월 기준 16055910은 $9,469,723(−8.8%), 16055990은 $3,044,358(−69.5%)로, "
            "합산 분모를 쓰면 16055990 붕괴가 다른 원산지의 점유율 상승으로 나타난다. "
            f"실제로 {combined_row['hsk8']} 안에서는 영국+아일랜드가 "
            f"{combined_row['share_within_basket_2024_pct']}%→"
            f"{combined_row['share_within_basket_2026_pct']}%로 낮게 관측됐지만, 이 하락은 "
            f"{qualification_origin} 양수 통관이 잡힌 {qualification_month_count}개월을 "
            f"포함할 때만 성립한다. {qualification_origin}를 제외하면 "
            f"{_number(combined_share_excluding_qualification, 2)}%여서 분산으로 단정하지 않는다. "
            "따라서 점유율은 각 바구니 총액을 "
            "분모로만 산출하며 바구니 간 합산·교차 비교를 하지 않는다(G-006). "
            "기간은 2024년 1~5월 ↔ 2026년 1~5월 동월 창(G-005)이며 연환산·증감률은 "
            "산출하지 않는다(G-002). 1605.59는 조제 골뱅이의 광의 대리지표다(G-003). "
            "2025년 원자료는 아카이브에 없어 두 시점 사이 경로는 미확인이다"
        ),
        "basis": {
            "coverage_start": "2024-01",
            "coverage_end": "2026-05",
            "published_at": "2026-07-06",
            "retrieved_at": "2026-08-12",
            "aggregation": "sum_by_country",
            "metrics": list(spec.metrics),
        },
    }


def _unit_price_ladder(source_widget: dict, spec: WidgetSpec) -> dict:
    config = load_config(spec.widget_id)
    snapshots = source_widget["source_breakdown"]
    # G-005 기간 정합: 단가 비교도 동월 창(2024년 1~5월)으로 맞춘다.
    # G-006 분류 정합: 같은 원산지도 바구니가 다르면 단가가 갈린다
    # (중국 16055910 $4.58 vs 16055990 $7.68). 바구니별 사다리를 따로 세우고
    # 표본 하한(G-004)도 바구니 내부 물량 기준으로 잰다.
    old_snapshot = snapshots["2024JanMay"]
    recent_snapshot = snapshots["2026YTD"]

    data = []
    basket_meta = []
    for hsk8 in config["baskets"]:
        old_basket = _basket(old_snapshot, hsk8)
        recent_basket = _basket(recent_snapshot, hsk8)
        old_origins = _origin_map(old_basket)
        recent_origins = _origin_map(recent_basket)
        old_total_kg = old_basket["total_import_kg"]
        recent_total_kg = recent_basket["total_import_kg"]
        basket_rows = []

        for country, recent in recent_origins.items():
            old = _origin_or_zero(old_origins, country)
            old_price = old.get("unit_price_usd_per_kg")
            recent_price = recent.get("unit_price_usd_per_kg")
            old_volume_share = _volume_share_pct(old["import_kg"], old_total_kg)
            recent_volume_share = _volume_share_pct(
                recent["import_kg"], recent_total_kg
            )
            old_below_floor = old_volume_share < CIF_LADDER_VOLUME_FLOOR_PCT
            recent_below_floor = recent_volume_share < CIF_LADDER_VOLUME_FLOOR_PCT
            comparable_old_price = None if old_below_floor else old_price
            gap_pct = None
            if (
                not recent_below_floor
                and comparable_old_price not in (None, 0)
                and recent_price is not None
            ):
                gap_pct = _number(
                    (
                        _decimal(recent_price) / _decimal(comparable_old_price)
                        - Decimal(1)
                    )
                    * Decimal(100),
                    1,
                )
            basket_rows.append(
                {
                    "hsk8": hsk8,
                    "origin": country,
                    "rank": None,
                    "unit_price_2024_jan_may_usd_per_kg": (
                        _number(_decimal(comparable_old_price), 2)
                        if comparable_old_price is not None
                        else None
                    ),
                    "unit_price_2026_jan_may_usd_per_kg": _number(
                        _decimal(recent_price), 2
                    ),
                    "unit_price_gap_vs_2024_jan_may_pct": gap_pct,
                    "import_kg_2026_jan_may": recent["import_kg"],
                    "volume_share_pct": _number(recent_volume_share, 4),
                    "below_volume_floor": recent_below_floor,
                    "volume_share_2024_pct": _number(old_volume_share, 4),
                    "below_volume_floor_2024": old_below_floor,
                }
            )

        basket_rows.sort(
            key=lambda row: (
                row["below_volume_floor"],
                -row["unit_price_2026_jan_may_usd_per_kg"],
                row["origin"],
            )
        )
        for rank, row in enumerate(
            (row for row in basket_rows if not row["below_volume_floor"]), start=1
        ):
            row["rank"] = rank
        data.extend(basket_rows)
        basket_meta.append(
            {
                "hsk8": hsk8,
                "label": f"HSK8 {hsk8}",
                "label_source": "archive_absent",
                "import_kg_2024_jan_may": old_total_kg,
                "import_kg_2026_jan_may": recent_total_kg,
                "floor_kg_2024_jan_may": _number(
                    _decimal(old_total_kg)
                    * CIF_LADDER_VOLUME_FLOOR_PCT
                    / Decimal(100),
                    2,
                ),
                "floor_kg_2026_jan_may": _number(
                    _decimal(recent_total_kg)
                    * CIF_LADDER_VOLUME_FLOOR_PCT
                    / Decimal(100),
                    2,
                ),
                "below_floor_count_2026": sum(
                    row["below_volume_floor"] for row in basket_rows
                ),
            }
        )

    return {
        "chartType": spec.chart_type,
        "data": data,
        "baskets": basket_meta,
        "layout": "small_multiples_by_basket",
        "xAxis": "origin",
        "series": [
            "unit_price_2024_jan_may_usd_per_kg",
            "unit_price_2026_jan_may_usd_per_kg",
        ],
        "unit": "USD/kg",
        "methodology": (
            "국가별 상세행 수입액 합계를 수입중량 합계로 나눈 가중 단가를 "
            "HSK8 바구니별로 따로 세운 사다리. 같은 원산지도 바구니가 다르면 단가가 갈리므로"
            "(중국 16055910 $4.58 vs 16055990 $7.68) 바구니를 섞은 단일 단가는 만들지 "
            "않는다(G-006). "
            f"단가 순위는 각 바구니 기간 수입중량의 {CIF_LADDER_VOLUME_FLOOR_PCT:g}% "
            "이상만 사용하며 하한 미달 원산지는 순위·2024 비교값에서 제외한다(G-004). "
            + " ".join(
                f"{row['hsk8']}은 2026년 1~5월 {row['import_kg_2026_jan_may']:,}kg의 1%인 "
                f"{row['floor_kg_2026_jan_may']:,.2f}kg 미만 "
                f"{row['below_floor_count_2026']}개 원산지를 순위에서 제외."
                for row in basket_meta
            )
            + f" {config['excluded_baskets'][0]} 바구니는 2026년 1~5월 규모가 표본 미달이라 "
            "사다리에서 제외했다. "
            "비교 기준은 2024년 1~5월 동월 창(G-005)이며 2026년은 1~5월 누적 단가로 "
            "연환산·증감률이 아니다. 1605.59는 광의 대리지표. "
            "2025년 원자료는 아카이브에 없어 두 시점 사이 경로는 미확인이다"
        ),
        "basis": {
            "coverage_start": "2024-01",
            "coverage_end": "2026-05",
            "published_at": "2026-07-06",
            "retrieved_at": "2026-08-12",
            "aggregation": "sum_by_country",
            "metrics": list(spec.metrics),
        },
    }


def _frozen_origin_mix(source_widget: dict, spec: WidgetSpec) -> dict:
    """N10 — expose the broad 0307.92 scope before comparing it with prepared trade."""
    config = load_config(spec.widget_id)
    snapshots = source_widget["source_breakdown"]
    frozen = snapshots["2026YTDFrozen"]
    prepared = snapshots["2026YTD"]
    top_n = config["top_origin_count"]
    total_usd = _decimal(frozen["total_import_usd"])
    prepared_usd = _decimal(prepared["total_import_usd"])
    if total_usd <= 0 or prepared_usd <= 0:
        raise ValueError("N10 frozen/prepared import totals must both be positive")

    ranked = frozen["origins"][:top_n]
    data = [
        {
            "origin": row["country"],
            "import_usd_2026_jan_may": row["import_usd"],
            "import_kg_2026_jan_may": row["import_kg"],
            "share_pct": _number(
                _decimal(row["import_usd"]) / total_usd * Decimal(100), 2
            ),
            "unit_price_usd_per_kg": (
                _number(_decimal(row["unit_price_usd_per_kg"]), 2)
                if row["unit_price_usd_per_kg"] is not None
                else None
            ),
            "shipment_count_2026": row["shipment_count"],
        }
        for row in ranked
    ]
    rest = frozen["origins"][top_n:]
    if rest:
        rest_usd = sum((_decimal(row["import_usd"]) for row in rest), Decimal(0))
        data.append(
            {
                "origin": "기타",
                "import_usd_2026_jan_may": _number(rest_usd, 0),
                "import_kg_2026_jan_may": _number(
                    sum((_decimal(row["import_kg"]) for row in rest), Decimal(0)),
                    0,
                ),
                "share_pct": _number(rest_usd / total_usd * Decimal(100), 2),
                # 혼합 단가 금지(G-006): 묶음 행에는 단가를 표시하지 않는다.
                "unit_price_usd_per_kg": None,
                "shipment_count_2026": sum(row["shipment_count"] for row in rest),
            }
        )

    excluded_codes = set(config["excluded_from_whelk_scope_hsk10"])
    hsk10_breakdown = [
        {
            "hsk10": row["hsk10"],
            "item_name": row["item_name"],
            "import_usd": row["import_usd"],
            "import_kg": row["import_kg"],
            "share_pct": _number(_decimal(row["share_pct"]), 2),
            "excluded_from_whelk_scope": row["hsk10"] in excluded_codes,
        }
        for row in frozen["hsk10_breakdown"]
    ]
    observed_excluded_codes = {
        row["hsk10"] for row in hsk10_breakdown if row["excluded_from_whelk_scope"]
    }
    if observed_excluded_codes != excluded_codes:
        raise ValueError(
            "N10 excluded HSK10 lines must all be observed: "
            f"configured={sorted(excluded_codes)}, observed={sorted(observed_excluded_codes)}"
        )
    scallop_usd = sum(
        (_decimal(row["import_usd"]) for row in hsk10_breakdown if row["excluded_from_whelk_scope"]),
        Decimal(0),
    )
    frozen_excluding_scallop_usd = total_usd - scallop_usd

    hypothesis_origin = config["hypothesis_origin"]
    turkiye_old = _origin_or_zero(
        _origin_map(snapshots["2024JanMay"]), hypothesis_origin
    )["import_usd"]
    turkiye_new = _origin_or_zero(_origin_map(prepared), hypothesis_origin)[
        "import_usd"
    ]
    turkiye_frozen = _origin_or_zero(_origin_map(frozen), hypothesis_origin)[
        "import_usd"
    ]
    baseline_available = bool(frozen.get("baseline_2024_available"))

    return {
        "chartType": spec.chart_type,
        "data": data,
        "xAxis": "origin",
        "series": ["import_usd_2026_jan_may", "unit_price_usd_per_kg"],
        "unit": "USD·kg·USD/kg",
        "scale_context": {
            "frozen_030792_import_usd": frozen["total_import_usd"],
            "frozen_030792_import_kg": frozen["total_import_kg"],
            "prepared_160559_import_usd": prepared["total_import_usd"],
            "frozen_to_prepared_ratio": _number(total_usd / prepared_usd, 2),
            "scallop_0307921000_import_usd": _number(scallop_usd, 0),
            "scallop_share_pct": _number(
                scallop_usd / total_usd * Decimal(100), 2
            ),
            "frozen_excluding_scallop_import_usd": _number(
                frozen_excluding_scallop_usd, 0
            ),
            "frozen_excluding_scallop_to_prepared_ratio": _number(
                frozen_excluding_scallop_usd / prepared_usd, 2
            ),
            "live_fresh_030791_import_usd": snapshots["2026YTDLiveFresh"][
                "total_import_usd"
            ],
            "baseline_2024_available": baseline_available,
            "baseline_gap_note": (
                "아카이브 KCS 원본 XML에 0307.92가 없어 2024 냉동 기준선이 없다. "
                "본 위젯은 2026년 1~5월 횡단면이며 시계열 비교를 하지 않는다."
                if not baseline_available
                else "아카이브 KCS 원본 XML에 0307.92 기준선 파일이 존재한다."
            ),
        },
        "hsk10_breakdown": hsk10_breakdown,
        "hypothesis": {
            "id": "H-FORM-SHIFT",
            "statement": (
                "튀르키예 흑해산은 시장에서 이탈한 것이 아니라 조제→냉동으로 "
                "형태를 바꿨을 가능성이 있다."
            ),
            "supporting_observations": [
                f"튀르키예 조제(160559) 2024.1~5 ${turkiye_old:,} → "
                f"2026.1~5 ${turkiye_new:,}",
                f"튀르키예 냉동(030792) 2026.1~5 ${turkiye_frozen:,} "
                f"(냉동 전체의 "
                f"{_number(_decimal(turkiye_frozen) / total_usd * Decimal(100), 2)}%)",
            ],
            "why_unproven": [
                "030792의 2024년 기준선이 아카이브에 없어 냉동 물량이 늘어난 것인지 "
                "원래 그 수준이었는지 확인 불가",
                "2025년 원자료 부재로 전환 시점·경로 미확인",
                "동일 사업자의 형태 전환인지 다른 수입자의 신규 유입인지 "
                "통관 데이터로는 식별 불가",
            ],
            "falsification_test": (
                "KCS API로 030792 2023·2024 연도별 상세를 수집해 튀르키예 냉동 "
                "기준선을 확보하면 확정 또는 기각된다."
            ),
            "claim_grade": "C",
        },
        "methodology": (
            "KCS 2026년 1~5월 상세행 중 hs_query=030792를 원산지별로 합산하고 총계행을 "
            f"제외. 상위 {top_n}개 원산지만 표시하며 나머지는 '기타'로 묶고 혼합 단가를 "
            "만들지 않는다. 0307.92는 냉동 연체동물의 광의 대리지표로 골뱅이 100% 코드가 "
            "아니다. HSK10 세번·원자료 품명·수입액·비중을 분해하고, 조개관자 "
            "0307921000은 골뱅이 범위에서 제외한 뒤 조제 대비 배수를 별도로 산출한다(G-003). "
            "2024·2025 원자료가 없어 시계열 비교·연환산을 하지 않고 2026년 1~5월 "
            "횡단면으로만 서술한다"
        ),
        "basis": {
            "coverage_start": spec.coverage_start,
            "coverage_end": spec.coverage_end,
            "published_at": "2026-07-06",
            "retrieved_at": "2026-08-12",
            "aggregation": spec.aggregation,
            "metrics": list(spec.metrics),
        },
    }


def _uk_capture_import_link(
    document: dict,
    source_widget: dict,
    spec: WidgetSpec,
) -> dict:
    config = load_config(spec.widget_id)
    rows = copy.deepcopy(document["widgets"][spec.widget_id]["data"])
    by_period = {row["period"]: row for row in rows}
    snapshots = source_widget["source_breakdown"]

    # G-006: 이 축은 HS6 1605.59 전체가 아니라 영국이 실제로 통관되는
    # HSK8 16055910 바구니다. 바구니를 명시해야 HS6 분모 서술로 오독되지 않는다.
    basket_hsk8 = config["import_basket_hsk8"]
    for period in ("2023", "2024"):
        origin = _origin_or_zero(
            _origin_map(_basket(snapshots[period], basket_hsk8)),
            config["import_country"],
        )
        by_period[period]["korea_import_usd"] = origin["import_usd"]
        by_period[period]["korea_import_kg"] = origin["import_kg"]

    recent = _origin_or_zero(
        _origin_map(_basket(snapshots["2026YTD"], basket_hsk8)),
        config["import_country"],
    )
    rows.append(
        {
            "period": "2026-01~05",
            "period_basis": "1~5월 누적",
            "uk_capture_tonnes_live_weight": None,
            "korea_import_usd": recent["import_usd"],
            "korea_import_kg": recent["import_kg"],
        }
    )
    return {
        "chartType": spec.chart_type,
        "data": rows,
        "series_basis": {
            "uk_capture_tonnes_live_weight": "FAO FishStat 활중량",
            "korea_import_usd": (
                "KCS HSK8 16055910 광의 조제 연체동물 수입액 (영국 전량이 이 바구니)"
            ),
        },
        "xAxis": "period",
        "series": ["uk_capture_tonnes_live_weight", "korea_import_usd"],
        "unit": "톤(활중량)·USD",
        "methodology": (
            "영국 FishStat 어획(2018~2024, 28종 코드 범위)과 한국의 영국산 HS 1605.59 "
            "광의 대리지표 상세행 수입액을 별도 축으로 병기. 수입 축은 HS6 1605.59 "
            "전체가 아니라 영국이 실제로 통관되는 HSK8 16055910 바구니만 쓴다"
            "(2024년 16055920의 영국 실적 $34는 제외 — G-006). "
            "2026년은 1~5월 누적 수입만 표시하고 "
            "어획값·연환산·증감률을 만들지 않음. Defra와 D&S IFCA는 "
            "영국 규제 맥락에만 사용. "
            "2025년 KCS 원자료는 아카이브에 없어 2024와 2026 사이 경로는 미확인이다"
        ),
        "basis": {
            "coverage_start": "2018",
            "coverage_end": "2026-05",
            "published_at": "2026-07-06",
            "retrieved_at": "2026-08-12",
            "aggregation": "none",
            "metrics": list(spec.metrics),
        },
    }


def derive_widgets(document: dict, specs: Iterable[WidgetSpec]) -> dict[str, dict]:
    by_id = specs_by_id(specs)
    source_widget = document["widgets"]["S3_prepared_import_monthly"]
    if not source_widget.get("data") or "source_breakdown" not in source_widget:
        raise ValueError("KCS source widget must be populated before derivation")
    return {
        "S3_frozen_origin_mix": _frozen_origin_mix(
            source_widget, by_id["S3_frozen_origin_mix"]
        ),
        "S3_origin_portfolio_shift": _portfolio_shift(
            source_widget, by_id["S3_origin_portfolio_shift"]
        ),
        "S3_origin_cif_ladder": _unit_price_ladder(
            source_widget, by_id["S3_origin_cif_ladder"]
        ),
        "S1_uk_capture_import_link": _uk_capture_import_link(
            document, source_widget, by_id["S1_uk_capture_import_link"]
        ),
    }


__all__ = [
    "BUCCINUM_GENUS",
    "CIF_LADDER_VOLUME_FLOOR_PCT",
    "derive_buccinum_only_ranking",
    "derive_widgets",
]
