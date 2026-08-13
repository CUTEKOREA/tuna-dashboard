"""Parse KCS CSV/XML detail rows for prepared-mollusc trade widgets."""

from __future__ import annotations

import csv
import xml.etree.ElementTree as ET
from collections import defaultdict
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Iterable, Mapping

from ..spec import (
    KCS_RAW_TRADE_DIR,
    KCS_XML_2023_PATH,
    KCS_XML_2024_PATH,
    KCS_YTD_PATH,
    WidgetSpec,
    load_config,
)


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    with Path(path).open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def read_xml_rows(path: Path) -> list[dict[str, str]]:
    tree = ET.parse(Path(path))
    return [
        {child.tag: child.text or "" for child in item}
        for item in tree.findall(".//item")
    ]


def csv_detail_rows(
    rows: Iterable[dict[str, str]], *, hs_query: str | None = None
) -> list[dict[str, str]]:
    return [
        row
        for row in rows
        if (hs_query is None or row.get("hs_query") == hs_query)
        and row.get("year") not in (None, "", "총계")
        and row.get("statCdCntnKor1") not in (None, "", "-")
        and row.get("hsCd") not in (None, "", "-")
    ]


def xml_detail_rows(rows: Iterable[dict[str, str]]) -> list[dict[str, str]]:
    return [
        row
        for row in rows
        if row.get("statCdCntnKor1") != "-"
        and row.get("year") not in (None, "", "총계")
        and row.get("hsCd") not in (None, "", "-")
    ]


def _decimal(row: dict[str, str], key: str) -> Decimal:
    try:
        return Decimal(row.get(key) or "0")
    except InvalidOperation as exc:
        raise ValueError(f"invalid KCS {key}: {row.get(key)!r}") from exc


def _number(value: Decimal, places: int | None = None) -> int | float:
    if places is not None:
        value = round(value, places)
    if value == value.to_integral_value():
        return int(value)
    return float(value)


def _normal_month(value: str) -> str:
    return value.replace(".", "-")


def window_rows(
    rows: Iterable[dict[str, str]], year: str, first_month: int, last_month: int
) -> list[dict[str, str]]:
    """Keep only detail rows whose period falls inside year.first_month~last_month.

    G-005 기간 정합 게이트의 근간. 연간 스냅샷과 부분연도 스냅샷을 직접 비교하지 않도록
    비교 대상과 같은 월 구간을 잘라내는 데 쓴다.
    """
    wanted = {f"{year}.{month:02d}" for month in range(first_month, last_month + 1)}
    return [row for row in rows if (row.get("year") or "") in wanted]


def _origin_rows(rows: list[dict[str, str]], total_usd: Decimal) -> list[dict]:
    """Aggregate detail rows by origin, keeping shipment evidence per origin.

    ``shipment_count``/``shipment_months`` count only rows that actually cleared
    customs (``impDlr > 0``); KCS emits a zero row for every registered country
    every month, so a raw row count would read as continuous supply.
    """
    totals: dict[tuple[str, str], dict[str, Decimal]] = defaultdict(
        lambda: {"import_usd": Decimal(0), "import_kg": Decimal(0)}
    )
    shipments: dict[tuple[str, str], list[str]] = defaultdict(list)
    members: dict[tuple[str, str], list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        import_usd = _decimal(row, "impDlr")
        import_kg = _decimal(row, "impWgt")
        key = (row.get("statCd", ""), row.get("statCdCntnKor1", ""))
        totals[key]["import_usd"] += import_usd
        totals[key]["import_kg"] += import_kg
        members[key].append(row)
        if import_usd > 0:
            shipments[key].append(_normal_month(row["year"]))

    origins = []
    for (country_code, country), values in sorted(
        totals.items(), key=lambda item: (-item[1]["import_usd"], item[0][1])
    ):
        if values["import_usd"] <= 0 and values["import_kg"] <= 0:
            continue
        unit_price = (
            values["import_usd"] / values["import_kg"]
            if values["import_kg"] > 0
            else None
        )
        months = sorted(set(shipments[(country_code, country)]))
        origins.append(
            {
                "country_code": country_code,
                "country": country,
                "import_usd": _number(values["import_usd"]),
                "import_kg": _number(values["import_kg"]),
                "unit_price_usd_per_kg": (
                    _number(unit_price, 4) if unit_price is not None else None
                ),
                "share_pct": (
                    _number(values["import_usd"] / total_usd * Decimal(100), 6)
                    if total_usd > 0
                    else 0
                ),
                "shipment_count": len(shipments[(country_code, country)]),
                "shipment_months": months,
                "monthly": _monthly_rows(members[(country_code, country)]),
            }
        )
    return origins


def _monthly_rows(rows: list[dict[str, str]]) -> list[dict]:
    month_totals: dict[str, dict[str, Decimal]] = defaultdict(
        lambda: {"import_usd": Decimal(0), "import_kg": Decimal(0)}
    )
    for row in rows:
        month = _normal_month(row["year"])
        month_totals[month]["import_usd"] += _decimal(row, "impDlr")
        month_totals[month]["import_kg"] += _decimal(row, "impWgt")

    monthly = []
    for month, values in sorted(month_totals.items()):
        unit_price = (
            values["import_usd"] / values["import_kg"]
            if values["import_kg"] > 0
            else None
        )
        monthly.append(
            {
                "month": month,
                "import_usd": _number(values["import_usd"]),
                "import_kg": _number(values["import_kg"]),
                "unit_price_usd_per_kg": (
                    _number(unit_price, 4) if unit_price is not None else None
                ),
            }
        )
    return monthly


def _hsk10_rows(rows: list[dict[str, str]], total_usd: Decimal) -> list[dict]:
    """Aggregate the frozen snapshot by exact Korean tariff line and item name."""
    totals: dict[str, dict[str, object]] = defaultdict(
        lambda: {
            "item_names": set(),
            "import_usd": Decimal(0),
            "import_kg": Decimal(0),
        }
    )
    for row in rows:
        hsk10 = row["hsCd"]
        item_name = (row.get("statKor") or "").strip()
        if item_name:
            totals[hsk10]["item_names"].add(item_name)
        totals[hsk10]["import_usd"] += _decimal(row, "impDlr")
        totals[hsk10]["import_kg"] += _decimal(row, "impWgt")

    breakdown = []
    for hsk10, values in totals.items():
        item_names = sorted(values["item_names"])
        if len(item_names) != 1:
            raise ValueError(
                f"KCS HSK10 {hsk10} must map to one statKor item name; got {item_names}"
            )
        import_usd = values["import_usd"]
        import_kg = values["import_kg"]
        if import_usd <= 0 and import_kg <= 0:
            continue
        breakdown.append(
            {
                "hsk10": hsk10,
                "item_name": item_names[0],
                "import_usd": _number(import_usd),
                "import_kg": _number(import_kg),
                "share_pct": (
                    _number(import_usd / total_usd * Decimal(100), 6)
                    if total_usd > 0
                    else 0
                ),
            }
        )
    return sorted(
        breakdown,
        key=lambda row: (-Decimal(str(row["import_usd"])), row["hsk10"]),
    )


def _snapshot(
    label: str, rows: list[dict[str, str]], *, include_hsk10_breakdown: bool = False
) -> dict:
    total_usd = sum((_decimal(row, "impDlr") for row in rows), Decimal(0))
    total_kg = sum((_decimal(row, "impWgt") for row in rows), Decimal(0))

    # G-006 분류 정합: HS6 하나가 원산지 구성이 겹치지 않는 두 바구니의 합이라
    # HS6 분모로 점유율을 내면 한 바구니의 붕괴가 다른 바구니 원산지의 '상승'이 된다.
    # 국가·월 축은 규모 서술이 계속 쓰므로 남기고, 바구니 축을 나란히 만든다.
    basket_rows: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        basket_rows[row["hsCd"][:8]].append(row)

    baskets = {}
    for hsk8 in sorted(basket_rows):
        member_rows = basket_rows[hsk8]
        basket_usd = sum((_decimal(row, "impDlr") for row in member_rows), Decimal(0))
        basket_kg = sum((_decimal(row, "impWgt") for row in member_rows), Decimal(0))
        baskets[hsk8] = {
            "hsk8": hsk8,
            "total_import_usd": _number(basket_usd),
            "total_import_kg": _number(basket_kg),
            "share_of_hs6_pct": (
                _number(basket_usd / total_usd * Decimal(100), 6)
                if total_usd > 0
                else 0
            ),
            "hsk10_observed": sorted({row["hsCd"] for row in member_rows}),
            "origins": _origin_rows(member_rows, basket_usd),
            "monthly": _monthly_rows(member_rows),
        }

    monthly = _monthly_rows(rows)
    sealed_usd = sum(
        (_decimal(row, "impDlr") for row in rows if row["hsCd"][8:] == "10"),
        Decimal(0),
    )
    snapshot = {
        "label": label,
        "total_import_usd": _number(total_usd),
        "total_import_kg": _number(total_kg),
        "months": [row["month"] for row in monthly],
        "monthly": monthly,
        "origins": _origin_rows(rows, total_usd),
        "baskets": baskets,
        "sealed_container_import_usd": _number(sealed_usd),
    }
    if include_hsk10_breakdown:
        snapshot["hsk10_breakdown"] = _hsk10_rows(rows, total_usd)
    return snapshot


def _assert_xml_total_matches(rows: list[dict[str, str]], details: list[dict[str, str]]) -> None:
    total_rows = [row for row in rows if row.get("statCdCntnKor1") == "-"]
    if len(total_rows) != 1:
        raise ValueError(f"KCS XML must contain one total row; got {len(total_rows)}")
    detail_usd = sum((_decimal(row, "impDlr") for row in details), Decimal(0))
    total_usd = _decimal(total_rows[0], "impDlr")
    if detail_usd != total_usd:
        raise ValueError(
            f"KCS XML detail sum {detail_usd} != total-row import USD {total_usd}"
        )


def load_prepared_trade(archive_root: Path) -> dict[str, dict]:
    archive_root = Path(archive_root)

    xml_2023_rows = read_xml_rows(archive_root / KCS_XML_2023_PATH)
    xml_2023_details = xml_detail_rows(xml_2023_rows)
    _assert_xml_total_matches(xml_2023_rows, xml_2023_details)

    xml_2024_rows = read_xml_rows(archive_root / KCS_XML_2024_PATH)
    xml_2024_details = xml_detail_rows(xml_2024_rows)
    _assert_xml_total_matches(xml_2024_rows, xml_2024_details)

    config = load_config("S3_prepared_import_monthly")
    ytd_rows = read_csv_rows(archive_root / KCS_YTD_PATH)
    ytd_details = csv_detail_rows(ytd_rows, hs_query=config["hs_query"])
    observed_months = sorted({_normal_month(row["year"]) for row in ytd_details})
    expected_months = [f"2026-{month:02d}" for month in range(1, 6)]
    if observed_months != expected_months:
        raise ValueError(
            f"KCS 2026 observed months must be Jan-May; got {observed_months}"
        )

    # G-005 기간 정합: 2026년 자료는 1~5월 5개월치뿐인데 2024 연간과 점유율을 맞대면
    # 계절성이 구조 변화로 오독된다. 실측: 2024년 1~5월은 연간 수입액의 35.8%에 불과하고,
    # 같은 창으로 보면 영국 점유율은 34.6%(연간 52.1%)라 결론이 뒤집힌다.
    # 따라서 비교용 동월 창 스냅샷을 함께 만든다.
    jan_may_2024 = window_rows(xml_2024_details, "2024", 1, 5)
    jan_may_2023 = window_rows(xml_2023_details, "2023", 1, 5)

    frozen_config = load_config("S3_frozen_origin_mix")
    frozen_details = csv_detail_rows(ytd_rows, hs_query=frozen_config["hs_query"])
    live_fresh_details = csv_detail_rows(
        ytd_rows, hs_query=frozen_config["live_fresh_hs_query"]
    )

    frozen_snapshot = _snapshot(
        "2026년 1~5월 누적 (냉동 0307.92)",
        frozen_details,
        include_hsk10_breakdown=True,
    )
    frozen_baseline_files = sorted(
        path.name
        for path in (archive_root / KCS_RAW_TRADE_DIR).glob(
            f"*{frozen_config['hs_query']}*.xml"
        )
    )
    frozen_snapshot["baseline_source_files"] = frozen_baseline_files
    frozen_snapshot["baseline_2024_available"] = bool(frozen_baseline_files)

    return {
        "2023": _snapshot("2023", xml_2023_details),
        "2024": _snapshot("2024", xml_2024_details),
        "2023JanMay": _snapshot("2023년 1~5월 누적", jan_may_2023),
        "2024JanMay": _snapshot("2024년 1~5월 누적", jan_may_2024),
        "2026YTD": _snapshot("2026년 1~5월 누적", ytd_details),
        "2026YTDFrozen": frozen_snapshot,
        "2026YTDLiveFresh": _snapshot(
            "2026년 1~5월 누적 (활·신선 0307.91)", live_fresh_details
        ),
    }


def extract_kcs(
    archive_root: Path,
    specs: Mapping[str, WidgetSpec],
) -> dict[str, dict]:
    snapshots = load_prepared_trade(archive_root)
    ytd = snapshots["2026YTD"]
    spec = specs["S3_prepared_import_monthly"]
    return {
        "S3_prepared_import_monthly": {
            "chartType": spec.chart_type,
            "data": ytd["monthly"],
            "source_breakdown": snapshots,
            "hsk8_monthly": {
                hsk8: basket["monthly"] for hsk8, basket in ytd["baskets"].items()
            },
            "xAxis": "month",
            "series": ["import_usd", "unit_price_usd_per_kg"],
            "unit": "USD·kg·USD/kg",
            "methodology": (
                "KCS HS 1605.59 상세행을 월별 합산하고 year='총계' 행을 제외. "
                "1605.59는 조제 골뱅이 100%가 아닌 광의 대리지표이며, 상세행 중량 합계는 "
                "총계행보다 3kg 커서 상세행 원계열 1,151,892kg을 사용. "
                "이 월별 계열은 HSK8 16055910·16055920·16055990 세 바구니의 합계 규모이며 "
                "원산지 점유율 분모로 쓰지 않는다(G-006). 바구니별 월 원계열은 "
                "hsk8_monthly에 분리 보관"
            ),
            "basis": {
                "coverage_start": ytd["months"][0],
                "coverage_end": ytd["months"][-1],
                "published_at": "2026-07-06",
                "retrieved_at": "2026-08-12",
                "aggregation": "sum_by_month",
                "metrics": list(spec.metrics),
            },
        }
    }


__all__ = [
    "csv_detail_rows",
    "extract_kcs",
    "load_prepared_trade",
    "read_csv_rows",
    "read_xml_rows",
    "xml_detail_rows",
]
