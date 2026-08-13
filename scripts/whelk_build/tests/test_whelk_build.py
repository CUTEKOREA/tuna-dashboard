#!/usr/bin/env python3
"""Assert-based regression checks for the whelk v2 archive builder."""

from __future__ import annotations

import copy
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo


REPO_ROOT = Path(__file__).resolve().parents[3]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

_IMPORT_ERROR: ModuleNotFoundError | None = None
try:
    from scripts.validate_whelk_v2 import validate
    from scripts.whelk_build import build_document
    from scripts.whelk_build.extract.fishstat import extract_fishstat
    from scripts.whelk_build.extract.kcs import (
        csv_detail_rows,
        load_prepared_trade,
        read_csv_rows,
        read_xml_rows,
        xml_detail_rows,
    )
    from scripts.whelk_build.spec import DEFAULT_ARCHIVE_ROOT, load_spec
except ModuleNotFoundError as exc:
    _IMPORT_ERROR = exc


YTD_PATH = Path(
    "11_분석·가공데이터/KCS_trade/updates/2026-07-06/"
    "KCS_2026YTD_HS_whelk.csv"
)
XML_2024_PATH = Path(
    "10_원본데이터셋/KCS_trade/2023_2024/kcs_HS160559_2024.xml"
)


def _require_builder() -> None:
    assert _IMPORT_ERROR is None, f"whelk builder import failed: {_IMPORT_ERROR}"


def _specs_by_id():
    _require_builder()
    return {spec.widget_id: spec for spec in load_spec()}


def _fixed_build() -> dict:
    _require_builder()
    return build_document(
        archive_root=DEFAULT_ARCHIVE_ROOT,
        built_at=datetime(2026, 8, 13, 9, 0, tzinfo=ZoneInfo("Asia/Seoul")),
    )


def test_01_csv_total_row_is_excluded() -> None:
    """Letting the D4 year='총계' row through must fail this test."""
    _require_builder()
    rows = read_csv_rows(DEFAULT_ARCHIVE_ROOT / YTD_PATH)
    selected = [row for row in rows if row.get("hs_query") == "160559"]
    details = csv_detail_rows(rows, hs_query="160559")
    total_rows = [row for row in selected if row.get("year") == "총계"]

    assert len(total_rows) == 1, len(total_rows)
    assert len(selected) == len(details) + 1
    assert all(row.get("year") != "총계" for row in details)
    assert sum(int(row["impDlr"] or 0) for row in selected) == (
        sum(int(row["impDlr"] or 0) for row in details)
        + int(total_rows[0]["impDlr"])
    )


def test_02_xml_total_row_is_excluded() -> None:
    """Letting the D5 statCdCntnKor1='-' row through must fail this test."""
    _require_builder()
    rows = read_xml_rows(DEFAULT_ARCHIVE_ROOT / XML_2024_PATH)
    details = xml_detail_rows(rows)
    total_rows = [row for row in rows if row.get("statCdCntnKor1") == "-"]

    assert len(total_rows) == 1, len(total_rows)
    assert len(rows) == len(details) + 1
    assert all(row.get("statCdCntnKor1") != "-" for row in details)
    assert sum(int(row["impDlr"] or 0) for row in details) == int(
        total_rows[0]["impDlr"]
    )


def test_03_2024_prepared_import_anchor() -> None:
    """Changing the D5 2024 detail aggregation must fail this test."""
    _require_builder()
    snapshots = load_prepared_trade(DEFAULT_ARCHIVE_ROOT)
    assert abs(snapshots["2024"]["total_import_usd"] - 58_504_760) <= 1


def test_04_2026_ytd_prepared_import_anchor() -> None:
    """Including the D4 total row or a non-160559 row must fail this test."""
    _require_builder()
    snapshots = load_prepared_trade(DEFAULT_ARCHIVE_ROOT)
    assert abs(snapshots["2026YTD"]["total_import_usd"] - 12_531_808) <= 1
    assert snapshots["2026YTD"]["months"] == [
        "2026-01",
        "2026-02",
        "2026-03",
        "2026-04",
        "2026-05",
    ]


def test_05_korea_2024_capture_anchor() -> None:
    """Using the wrong country field or dropping species rows must fail."""
    _require_builder()
    patches = extract_fishstat(DEFAULT_ARCHIVE_ROOT, _specs_by_id())
    rows = patches["S1_korea_capture_timeline"]["data"]
    observed = next(row for row in rows if row["year"] == 2024)
    assert abs(observed["tonnes_live_weight"] - 9_669.783) <= 0.001


def test_06_uk_rank_and_world_2024_capture_anchors() -> None:
    """Ranking individual species rows instead of country sums must fail."""
    _require_builder()
    patches = extract_fishstat(DEFAULT_ARCHIVE_ROOT, _specs_by_id())
    widget = patches["S1_global_capture_top_countries"]
    leader = widget["data"][0]
    assert leader["country_code"] == "826"
    assert leader["country"] == "영국"
    assert abs(leader["tonnes_live_weight"] - 16_511.020) <= 0.001
    assert abs(widget["world_total_tonnes"] - 90_114.065) <= 0.001


def test_07_china_rapana_dominates_aquaculture() -> None:
    """Combining Rapana with Buccinum or claiming Buccinum output must fail."""
    _require_builder()
    patches = extract_fishstat(DEFAULT_ARCHIVE_ROOT, _specs_by_id())
    widget = patches["S1_aquaculture_species_split"]
    rows = {row["scientific_name"]: row for row in widget["data"]}
    assert rows["Rapana spp"]["china_tonnes_live_weight"] == 361_919
    assert rows["Rapana spp"]["share_pct"] >= 99.9
    assert rows["Buccinum spp"]["tonnes_live_weight"] == 0


def test_07_country_species_resolution_and_buccinum_ranking() -> None:
    """Dropping country species detail or ranking Korea as Buccinum must fail."""
    _require_builder()
    patches = extract_fishstat(DEFAULT_ARCHIVE_ROOT, _specs_by_id())
    widget = patches["S1_global_capture_top_countries"]
    rows = {row["country_code"]: row for row in widget["data"]}

    assert rows["410"]["species_composition"] == [
        {
            "alpha3": "GAS",
            "scientific_name": "Gastropoda",
            "tonnes": 9_669.783,
            "share_pct": 100,
        }
    ]
    assert rows["410"]["dominant_species_scientific_name"] == "Gastropoda"
    assert rows["410"]["is_species_resolved"] is False
    assert rows["826"]["dominant_species_scientific_name"] == "Buccinum undatum"
    assert rows["826"]["is_species_resolved"] is True
    assert rows["792"]["dominant_species_scientific_name"] == "Rapana venosa"
    assert rows["792"]["is_species_resolved"] is True
    assert all(
        abs(sum(part["share_pct"] for part in row["species_composition"]) - 100)
        <= 0.000001
        for row in rows.values()
    )

    ranking = widget["buccinum_only_ranking"]
    assert [row["country_code"] for row in ranking] == [
        "826",
        "250",
        "124",
        "372",
        "578",
    ]
    assert [row["tonnes_live_weight"] for row in ranking] == [
        16_511.02,
        7_695.607,
        5_410.208,
        4_590.375,
        458,
    ]
    assert not any(row["country_code"] == "410" for row in ranking)


def test_08_widget_sources_are_bidirectionally_linked() -> None:
    """Missing, unknown, or unused source registrations must fail."""
    document = _fixed_build()
    known = {source["source_id"] for source in document["sources"]}
    cited: set[str] = set()
    for widget_id, widget in document["widgets"].items():
        source_ids = widget["basis"].get("source_ids")
        assert source_ids, widget_id
        assert set(source_ids) <= known, (widget_id, set(source_ids) - known)
        cited.update(source_ids)
    assert known == cited, {"unused": known - cited, "unknown": cited - known}
    assert validate(document) == []


def test_09_telemetry_is_synced_never_live() -> None:
    """Promoting a static build artifact to LIVE must fail this test."""
    document = _fixed_build()
    assert document["meta"]["telemetry"] == "SYNCED"
    assert document["meta"]["telemetry"] != "LIVE"


def test_10_empty_cards_explain_the_data_gap() -> None:
    """A focused build may be sparse, but every empty card must explain why."""
    _require_builder()
    document = build_document(
        archive_root=DEFAULT_ARCHIVE_ROOT,
        only="fishstat",
        built_at=datetime(2026, 8, 13, 9, 0, tzinfo=ZoneInfo("Asia/Seoul")),
    )
    empty = [widget for widget in document["widgets"].values() if widget["data"] == []]
    assert empty, "focused build must retain unpopulated contract rows"
    for widget in empty:
        assert widget["chartType"] == "card"
        assert widget.get("methodology", "").strip()
        assert any(
            marker in widget["methodology"]
            for marker in ("공백", "미실행", "확정하지 못")
        ), widget["methodology"]


def test_11_origin_price_rank_obeys_volume_floor() -> None:
    """Ranking or comparing an origin below 1% basket volume must fail."""
    document = _fixed_build()
    widget = document["widgets"]["S3_origin_cif_ladder"]
    rows = widget["data"]
    by_key = {(row["hsk8"], row["origin"]): row for row in rows}
    ranked = [row for row in rows if row.get("rank") is not None]

    assert ranked, "origins at or above the volume floor must receive ranks"
    assert all(row.get("volume_share_pct", -1) >= 1.0 for row in ranked), ranked
    # G-006: 순위는 바구니 안에서만 1..n으로 닫힌다. 바구니를 섞은 통합 순위는 금지.
    for hsk8 in {row["hsk8"] for row in ranked}:
        basket_ranks = sorted(row["rank"] for row in ranked if row["hsk8"] == hsk8)
        assert basket_ranks == list(range(1, len(basket_ranks) + 1)), (
            hsk8,
            basket_ranks,
        )
    assert all(
        row.get("rank") is None
        for row in rows
        if row.get("below_volume_floor") is True
    )
    for origin in ("미국", "말레이시아", "캄보디아"):
        row = by_key[("16055990", origin)]
        assert row.get("below_volume_floor") is True, row

    # Canada clears the 2026 floor of its basket but its 2024 volume (1,500 kg)
    # is below 1% of the 905,303 kg the 16055910 basket moved that window.
    assert by_key[("16055910", "캐나다")]["unit_price_2024_jan_may_usd_per_kg"] is None

    invalid = copy.deepcopy(document)
    invalid["widgets"]["S3_origin_cif_ladder"]["data"][0][
        "volume_share_pct"
    ] = 0.5
    assert any("G-004" in error for error in validate(invalid)), validate(invalid)


def _basket_usd(snapshot: dict) -> dict[str, int]:
    return {
        hsk8: basket["total_import_usd"]
        for hsk8, basket in snapshot["baskets"].items()
    }


def test_12_hsk8_basket_totals_match_the_hs6_total() -> None:
    """A-12·A-13·A-14 — truncating hsCd wrongly or dropping a basket must fail."""
    _require_builder()
    snapshots = load_prepared_trade(DEFAULT_ARCHIVE_ROOT)
    old = snapshots["2024JanMay"]
    recent = snapshots["2026YTD"]

    assert _basket_usd(old) == {
        "16055910": 10_378_657,
        "16055920": 603_350,
        "16055990": 9_970_347,
    }, _basket_usd(old)
    assert _basket_usd(recent) == {
        "16055910": 9_469_723,
        "16055920": 17_727,
        "16055990": 3_044_358,
    }, _basket_usd(recent)
    assert sum(_basket_usd(old).values()) == old["total_import_usd"] == 20_952_354
    assert sum(_basket_usd(recent).values()) == recent["total_import_usd"] == 12_531_808


def test_13_within_basket_shares_never_use_the_hs6_denominator() -> None:
    """A-15·A-16 — the core guard: reverting the denominator to HS6 must fail."""
    document = _fixed_build()
    rows = document["widgets"]["S3_origin_portfolio_shift"]["data"]
    by_key = {(row["hsk8"], row["origin"]): row for row in rows}

    combined = by_key[("16055910", "영국+아일랜드")]
    assert abs(combined["share_within_basket_2024_pct"] - 97.30) <= 0.01, combined
    assert abs(combined["share_within_basket_2026_pct"] - 75.78) <= 0.01, combined

    canada = by_key[("16055910", "캐나다")]
    assert abs(canada["share_within_basket_2024_pct"] - 0.08) <= 0.01, canada
    assert abs(canada["share_within_basket_2026_pct"] - 19.94) <= 0.01, canada
    context = document["widgets"]["S3_origin_portfolio_shift"][
        "interpretation_context"
    ]
    assert context["qualification_observed_month_count"] == 2, context
    assert (
        abs(context["combined_share_excluding_qualification_origin_2026_pct"] - 94.65)
        <= 0.01
    ), context

    # 바구니를 섞은 분모로 되돌리면(= 한 바구니 행이 다른 바구니 분모를 쓰면) G-006이 잡는다.
    invalid = copy.deepcopy(document)
    for row in invalid["widgets"]["S3_origin_portfolio_shift"]["data"]:
        if row["hsk8"] == "16055990" and not row["combined"]:
            row["hsk8"] = "16055910"
    assert any("G-006" in error for error in validate(invalid)), validate(invalid)


def test_14_basket_change_rates_are_not_swapped() -> None:
    """A-17 — mislabelling which basket collapsed must fail this test."""
    document = _fixed_build()
    baskets = {
        row["hsk8"]: row
        for row in document["widgets"]["S3_origin_portfolio_shift"]["baskets"]
    }
    assert abs(baskets["16055910"]["change_pct"] - (-8.76)) <= 0.01, baskets
    assert abs(baskets["16055990"]["change_pct"] - (-69.47)) <= 0.01, baskets
    assert baskets["16055920"]["charted"] is False
    assert baskets["16055910"]["label_source"] == "archive_absent"


def test_15_canada_thin_evidence_keeps_its_shipment_receipts() -> None:
    """A-18 — losing the two-shipment footnote basis must fail this test."""
    document = _fixed_build()
    rows = document["widgets"]["S3_origin_portfolio_shift"]["data"]
    canada = next(
        row for row in rows if row["hsk8"] == "16055910" and row["origin"] == "캐나다"
    )
    assert canada["shipment_count_2026"] == 2, canada
    assert canada["shipment_months_2026"] == ["2026-02", "2026-04"], canada
    assert canada["thin_evidence"] is True


def test_16_unit_prices_are_never_mixed_across_baskets() -> None:
    """A-19 — a single blended China price ($7.20/kg) must fail this test."""
    _require_builder()
    recent = load_prepared_trade(DEFAULT_ARCHIVE_ROOT)["2026YTD"]
    prices = {
        hsk8: next(
            row["unit_price_usd_per_kg"]
            for row in basket["origins"]
            if row["country"] == "중국"
        )
        for hsk8, basket in recent["baskets"].items()
    }
    assert abs(prices["16055910"] - 4.58) <= 0.01, prices
    assert abs(prices["16055990"] - 7.68) <= 0.01, prices


def test_17_frozen_030792_scale_anchors() -> None:
    """A-20·A-21·A-22·A-27 — a bad frozen derivation must fail this test."""
    document = _fixed_build()
    widget = document["widgets"]["S3_frozen_origin_mix"]
    scale = widget["scale_context"]
    assert abs(scale["frozen_030792_import_usd"] - 33_235_347) <= 1, scale
    assert abs(scale["frozen_030792_import_kg"] - 4_683_163) <= 1, scale
    assert abs(scale["frozen_to_prepared_ratio"] - 2.65) <= 0.01, scale
    assert abs(scale["scallop_0307921000_import_usd"] - 3_435_189) <= 1, scale
    assert abs(scale["frozen_excluding_scallop_import_usd"] - 29_800_158) <= 1, scale
    assert abs(scale["frozen_excluding_scallop_to_prepared_ratio"] - 2.38) <= 0.01, scale
    assert abs(scale["scallop_0307921000_import_usd"] - 3_435_189) <= 1, scale
    assert abs(scale["scallop_share_pct"] - 10.34) <= 0.01, scale
    assert abs(scale["frozen_excluding_scallop_import_usd"] - 29_800_158) <= 1, scale
    assert (
        abs(scale["frozen_excluding_scallop_to_prepared_ratio"] - 2.38) <= 0.01
    ), scale
    # 아카이브에 030792 2023·2024 원본이 없다. 없는 기준선을 채우면 이 앵커가 깨진다.
    assert scale["baseline_2024_available"] is False

    turkiye = next(row for row in widget["data"] if row["origin"] == "튀르키예")
    assert abs(turkiye["import_usd_2026_jan_may"] - 4_667_134) <= 1, turkiye
    assert abs(turkiye["share_pct"] - 14.04) <= 0.01, turkiye
    assert widget["basis"]["market_stage"] == "frozen"
    assert widget["hypothesis"]["claim_grade"] == "C"
    assert len(widget["hypothesis"]["why_unproven"]) == 3


def test_18_turkiye_prepared_exit_and_sealed_container_codes() -> None:
    """A-23·A-24 — HSK10 parsing regressions must fail this test."""
    _require_builder()
    snapshots = load_prepared_trade(DEFAULT_ARCHIVE_ROOT)
    old = {row["country"]: row for row in snapshots["2024JanMay"]["origins"]}
    recent = {row["country"]: row for row in snapshots["2026YTD"]["origins"]}
    assert old["튀르키예"]["import_usd"] == 3_832_090
    assert recent["튀르키예"]["import_usd"] == 160_855

    # 밀폐용기 코드(…10)는 사실상 미사용이다. 전 물량이 …90(기타)으로 통관된다.
    assert snapshots["2024JanMay"]["sealed_container_import_usd"] == 0
    assert snapshots["2026YTD"]["sealed_container_import_usd"] == 113


def test_19_window_choice_changes_the_basket_mix() -> None:
    """A-25·A-26 — dropping the window-bias evidence must fail this test."""
    document = _fixed_build()
    _require_builder()
    snapshots = load_prepared_trade(DEFAULT_ARCHIVE_ROOT)
    assert _basket_usd(snapshots["2024"]) == {
        "16055910": 40_064_937,
        "16055920": 713_700,
        "16055990": 17_726_123,
    }, _basket_usd(snapshots["2024"])

    sensitivity = document["widgets"]["S3_origin_portfolio_shift"]["window_sensitivity"]
    full_year = sensitivity["full_year"]
    jan_may = sensitivity["jan_may"]
    assert abs(full_year["16055910_share_of_hs6_2024_pct"] - 68.48) <= 0.01, full_year
    assert abs(full_year["16055920_share_of_hs6_2024_pct"] - 1.22) <= 0.01, full_year
    assert abs(full_year["16055990_share_of_hs6_2024_pct"] - 30.30) <= 0.01, full_year
    assert abs(jan_may["16055990_share_of_hs6_2024_pct"] - 47.59) <= 0.01, jan_may

    # 반사실 검증: 붕괴한 두 바구니가 2024 수준을 유지했다면 영국 HS6 점유율은
    # 47.2%가 아니라 29.48%다 — 방향이 뒤집힌다. 합성 착시 문안의 수치 근거.
    counterfactual_denominator = (
        snapshots["2026YTD"]["baskets"]["16055910"]["total_import_usd"]
        + snapshots["2024JanMay"]["baskets"]["16055990"]["total_import_usd"]
        + snapshots["2024JanMay"]["baskets"]["16055920"]["total_import_usd"]
    )
    uk_2026 = next(
        row["import_usd"]
        for row in snapshots["2026YTD"]["baskets"]["16055910"]["origins"]
        if row["country"] == "영국"
    )
    assert (
        abs(uk_2026 / counterfactual_denominator * 100 - 29.48) <= 0.01
    ), uk_2026 / counterfactual_denominator * 100


def test_20_frozen_snapshot_keeps_hsk10_item_scope() -> None:
    """Dropping the non-whelk scallop tariff line or its share must fail."""
    _require_builder()
    snapshot = load_prepared_trade(DEFAULT_ARCHIVE_ROOT)["2026YTDFrozen"]
    rows = {row["hsk10"]: row for row in snapshot["hsk10_breakdown"]}

    assert set(rows) == {"0307921000", "0307922000", "0307929000"}, rows
    scallop = rows["0307921000"]
    assert scallop["item_name"] == "조개관자", scallop
    assert abs(scallop["import_usd"] - 3_435_189) <= 1, scallop
    assert abs(scallop["share_pct"] - 10.335950) <= 0.000001, scallop
    assert sum(row["import_usd"] for row in rows.values()) == snapshot["total_import_usd"]


def test_20_uk_monthly_series_is_archived_hsk8_evidence() -> None:
    """The S2 seasonality replacement must use real UK rows inside 16055910."""
    document = _fixed_build()
    rows = document["widgets"]["S3_origin_portfolio_shift"]["uk_monthly_2024"]
    assert len(rows) == 12, rows
    assert sum(row["import_usd"] for row in rows) == 30_455_373
    assert sum(row["import_kg"] for row in rows) == 2_388_236
    peak = max(rows, key=lambda row: row["import_usd"])
    assert peak == {
        "month": "2024-08",
        "import_usd": 5_695_231,
        "import_kg": 434_920,
        "unit_price_usd_per_kg": 13.0949,
    }, peak


def main() -> None:
    tests = [
        test_01_csv_total_row_is_excluded,
        test_02_xml_total_row_is_excluded,
        test_03_2024_prepared_import_anchor,
        test_04_2026_ytd_prepared_import_anchor,
        test_05_korea_2024_capture_anchor,
        test_06_uk_rank_and_world_2024_capture_anchors,
        test_07_china_rapana_dominates_aquaculture,
        test_07_country_species_resolution_and_buccinum_ranking,
        test_08_widget_sources_are_bidirectionally_linked,
        test_09_telemetry_is_synced_never_live,
        test_10_empty_cards_explain_the_data_gap,
        test_11_origin_price_rank_obeys_volume_floor,
        test_12_hsk8_basket_totals_match_the_hs6_total,
        test_13_within_basket_shares_never_use_the_hs6_denominator,
        test_14_basket_change_rates_are_not_swapped,
        test_15_canada_thin_evidence_keeps_its_shipment_receipts,
        test_16_unit_prices_are_never_mixed_across_baskets,
        test_17_frozen_030792_scale_anchors,
        test_18_turkiye_prepared_exit_and_sealed_container_codes,
        test_19_window_choice_changes_the_basket_mix,
        test_20_frozen_snapshot_keeps_hsk10_item_scope,
        test_20_uk_monthly_series_is_archived_hsk8_evidence,
    ]
    total = len(tests)
    for index, test in enumerate(tests, start=1):
        test()
        print(f"PASS {index}/{total} {test.__name__}")
    print(f"all asserts pass — {total} checks")


if __name__ == "__main__":
    main()
