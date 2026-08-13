"""Deterministic KCS import price, monthly flow, and concentration extracts."""

from __future__ import annotations

import csv
from collections import defaultdict
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Mapping

from ..spec import WidgetSpec


APPROVED_KCS_HS6 = ("030742", "030743", "030749", "160554")


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def _decimal(row: dict[str, str], key: str) -> Decimal:
    try:
        return Decimal(row[key] or "0")
    except (InvalidOperation, KeyError) as exc:
        raise ValueError(f"invalid KCS {key}: {row.get(key)!r}") from exc


def _number(value: Decimal, places: int | None = None) -> int | float:
    if places is not None:
        value = round(value, places)
    if value == value.to_integral_value():
        return int(value)
    return float(value)


def _detail_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    return [
        row
        for row in rows
        if row.get("hsCd") != "-"
        and row.get("statCd") not in (None, "", "-")
        and row.get("year") not in (None, "", "총계")
    ]


def _hs6(row: dict[str, str]) -> str:
    code = row.get("hsCd", "").strip()
    if len(code) < 6 or not code.isdigit():
        raise ValueError(f"invalid KCS hsCd: {code!r}")
    return code[:6]


def _approved_squid_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    allowed = set(APPROVED_KCS_HS6)
    return [row for row in _detail_rows(rows) if _hs6(row) in allowed]


def _taxon_note(hs_codes: list[str]) -> str:
    return (
        f"포함 HS: {'·'.join(hs_codes)}. "
        "각 분류는 오징어와 갑오징어를 함께 포함한다."
    )


def extract_kcs(
    archive_root: Path,
    specs: Mapping[str, WidgetSpec],
) -> dict[str, dict]:
    price_spec = specs["B_kcs_import_unit_price"]
    monthly_spec = specs["C_korea_import_monthly"]
    concentration_spec = specs["C_import_concentration"]
    ytd_path = Path(archive_root) / price_spec.archive_paths[0]
    legacy_path = Path(archive_root) / concentration_spec.archive_paths[0]

    ytd_rows = _approved_squid_rows(_read_csv(ytd_path))
    ytd_hs_codes = sorted({_hs6(row) for row in ytd_rows})
    months = sorted({row["year"].replace(".", "-") for row in ytd_rows})
    if not months or months[-1] > "2026-05":
        raise ValueError(f"KCS observed 2026 coverage must end by 2026-05; got {months}")

    monthly_totals: dict[str, dict[str, Decimal]] = defaultdict(
        lambda: {"import_usd": Decimal(0), "import_kg": Decimal(0)}
    )
    country_month: dict[tuple[str, str, str], dict[str, Decimal]] = defaultdict(
        lambda: {"import_usd": Decimal(0), "import_kg": Decimal(0)}
    )
    for row in ytd_rows:
        month = row["year"].replace(".", "-")
        import_usd = _decimal(row, "impDlr")
        import_kg = _decimal(row, "impWgt")
        monthly_totals[month]["import_usd"] += import_usd
        monthly_totals[month]["import_kg"] += import_kg
        key = (month, row["statCd"], row["statCdCntnKor1"])
        country_month[key]["import_usd"] += import_usd
        country_month[key]["import_kg"] += import_kg

    price_data = []
    for month in months:
        totals = monthly_totals[month]
        if totals["import_kg"] <= 0:
            continue
        price_data.append(
            {
                "month": month,
                "import_usd": _number(totals["import_usd"]),
                "import_kg": _number(totals["import_kg"]),
                "unit_price_usd_mt": _number(
                    totals["import_usd"] / totals["import_kg"] * Decimal(1000), 2
                ),
            }
        )

    monthly_data = [
        {
            "month": month,
            "country_code": country_code,
            "country": country,
            "import_usd": _number(values["import_usd"]),
            "import_kg": _number(values["import_kg"]),
        }
        for (month, country_code, country), values in sorted(
            country_month.items(),
            key=lambda item: (item[0][0], -item[1]["import_usd"], item[0][1]),
        )
        if values["import_usd"] > 0 or values["import_kg"] > 0
    ]

    # 원천 CSV 는 2020~2024 를 모두 담고 있다. 한 해만 뽑으면 "중국 의존도가
    # 오르는 중인가"라는 조달 질문에 답할 수 없으므로 연도별로 전부 산출한다.
    legacy_detail = _approved_squid_rows(_read_csv(legacy_path))
    legacy_hs_codes = sorted({_hs6(row) for row in legacy_detail})
    years = sorted({row["year"] for row in legacy_detail if row["year"].isdigit()})
    if not years:
        raise ValueError("KCS legacy CSV 에 연도가 없다")

    concentration_data = []
    for year in years:
        origins: dict[tuple[str, str], dict[str, Decimal]] = defaultdict(
            lambda: {"import_usd": Decimal(0), "import_kg": Decimal(0)}
        )
        for row in legacy_detail:
            if row["year"] != year:
                continue
            key = (row["statCd"], row["statCdCntnKor1"])
            origins[key]["import_usd"] += _decimal(row, "impDlr")
            origins[key]["import_kg"] += _decimal(row, "impWgt")
        total_import_usd = sum(
            (values["import_usd"] for values in origins.values()), Decimal(0)
        )
        if total_import_usd <= 0:
            # 관측이 없는 해는 0으로 채우지 않고 건너뛴다.
            continue
        ranked = sorted(origins.items(), key=lambda item: -item[1]["import_usd"])
        origin_rows = [
            {
                "country_code": code,
                "country": country,
                "import_usd": _number(values["import_usd"]),
                "import_kg": _number(values["import_kg"]),
                "share_pct": _number(
                    values["import_usd"] / total_import_usd * Decimal(100), 4
                ),
            }
            for (code, country), values in ranked
            if values["import_usd"] > 0
        ]
        shares = [Decimal(str(row["share_pct"])) for row in origin_rows]
        concentration_data.append({
            "year": int(year),
            "total_import_usd": _number(total_import_usd),
            "top1_share_pct": _number(sum(shares[:1]), 4),
            "top3_share_pct": _number(sum(shares[:3]), 4),
            "hhi": _number(sum((share * share for share in shares), Decimal(0)), 2),
            "origins": origin_rows,
        })
    if not concentration_data:
        raise ValueError("KCS 연도별 수입 총액이 모두 비어 있다")

    return {
        "B_kcs_import_unit_price": {
            "chartType": price_spec.chart_type,
            "data": price_data,
            "xAxis": "month",
            "series": ["unit_price_usd_mt"],
            "unit": "USD/톤",
            "methodology": (
                f"KCS HS {'·'.join(ytd_hs_codes)} 상세행의 수입금액 합계를 "
                "수입중량 합계로 나눈 월별 가중 수입단가"
            ),
            "basis": {
                "coverage_start": months[0],
                "coverage_end": months[-1],
                "published_at": "2026-07-06",
                "retrieved_at": "2026-08-12",
                "metrics": list(price_spec.metrics),
                "hs_codes": ytd_hs_codes,
                "taxon_note": _taxon_note(ytd_hs_codes),
            },
        },
        "C_korea_import_monthly": {
            "chartType": monthly_spec.chart_type,
            "data": monthly_data,
            "xAxis": "month",
            "series": ["import_usd", "import_kg"],
            "unit": "USD·kg",
            "methodology": (
                f"KCS HS {'·'.join(ytd_hs_codes)}의 HS10 상세행을 "
                "월·상대국별로 합산하며 총계행은 제외"
            ),
            "basis": {
                "coverage_start": months[0],
                "coverage_end": months[-1],
                "published_at": "2026-07-06",
                "retrieved_at": "2026-08-12",
                "metrics": list(monthly_spec.metrics),
                "hs_codes": ytd_hs_codes,
                "taxon_note": _taxon_note(ytd_hs_codes),
            },
        },
        "C_import_concentration": {
            "chartType": concentration_spec.chart_type,
            "data": concentration_data,
            "series": ["share_pct"],
            "unit": "%·USD",
            "methodology": (
                f"KCS {concentration_data[0]['year']}~{concentration_data[-1]['year']} 연도별 "
                f"HS {'·'.join(legacy_hs_codes)} 상대국 비중과 HHI. "
                "비중은 한국 수입 안에서의 비중이며 글로벌 점유율이 아님"
            ),
            "basis": {
                "coverage_start": str(concentration_data[0]["year"]),
                "coverage_end": str(concentration_data[-1]["year"]),
                "published_at": "2026",
                "retrieved_at": "2026",
                "metrics": list(concentration_spec.metrics),
                "hs_codes": legacy_hs_codes,
                "taxon_note": _taxon_note(legacy_hs_codes),
            },
        },
    }
