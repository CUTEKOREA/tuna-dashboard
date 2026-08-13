#!/usr/bin/env python3
"""Assert-based regression checks for the squid v5 archive builder."""

from __future__ import annotations

import csv
import json
import sys
import tempfile
from dataclasses import replace
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo


REPO_ROOT = Path(__file__).resolve().parents[3]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts.squid_build import build_document  # noqa: E402
from scripts.squid_build.spec import (  # noqa: E402
    DEFAULT_ARCHIVE_ROOT,
    DEFAULT_SPEC_PATH,
    load_spec,
)
from scripts.validate_squid_v5 import validate  # noqa: E402


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def _specs_by_id():
    return {spec.widget_id: spec for spec in load_spec(DEFAULT_SPEC_PATH)}


def test_fishstat_species_filter() -> None:
    """A broader scientific-name filter must fail this test."""
    from scripts.squid_build.extract.fishstat import SPECIES_WHITELIST, filter_species_rows

    rows = _read_csv(
        DEFAULT_ARCHIVE_ROOT
        / "update_2026-07-06/fishstat/FishStat_2026.1.0_species_codes_squid.csv"
    )
    filtered = filter_species_rows(rows)
    observed = {row["Scientific_Name"] for row in filtered}
    assert observed <= SPECIES_WHITELIST, observed - SPECIES_WHITELIST
    assert observed == SPECIES_WHITELIST, SPECIES_WHITELIST - observed


def test_kmi_price_round_trip() -> None:
    """Changing the archived final KMI observation must fail this test."""
    from scripts.squid_build.extract.kmi_price import extract_kmi_price

    spec = _specs_by_id()["B_kmi_consumer_price"]
    patch = extract_kmi_price(DEFAULT_ARCHIVE_ROOT, spec)
    assert patch["data"]["observations"][-1] == {
        "date": "2026-08-11",
        "price_krw": 4926,
    }
    assert patch["basis"]["coverage_end"] == "2026-08-11"


def test_peru_timeline_order() -> None:
    """Sorting by archive filename instead of event date must fail this test."""
    from scripts.squid_build.extract.peru_pota import extract_peru_pota

    spec = _specs_by_id()["A_peru_pota_timeline"]
    widget = extract_peru_pota(DEFAULT_ARCHIVE_ROOT, spec)
    dates = [row["date"] for row in widget["data"]]
    assert dates == sorted(dates), dates
    assert dates.index("2026-07-24") > dates.index("2026-07-09"), dates


def test_chile_uses_separate_quota_and_capture_sources() -> None:
    """Using the XLSX effective quota as both numerator and denominator must fail."""
    from scripts.squid_build.extract.chile_jibia import extract_chile_jibia

    spec = _specs_by_id()["A_chile_jibia_quota"]
    widget = extract_chile_jibia(DEFAULT_ARCHIVE_ROOT, spec)
    assert widget["data"]["legal_quota_tonnes"] == 200000
    assert widget["data"]["recorded_capture_tonnes"] == 121868.7551
    assert widget["data"]["consumption_pct"] == 60.9344
    assert widget["data"]["denominator_source"].endswith("20251218-SUBPESCA-Jibia_Quota_2026.md")
    assert widget["data"]["numerator_source"].endswith("20260806-SERNAPESCA-Jibia_Quota_Consumption_2026.xlsx")


def test_kcs_2026_coverage_stops_at_may() -> None:
    """Treating a Jan-Jun query label as observed June data must fail."""
    from scripts.squid_build.extract.kcs import extract_kcs

    specs = _specs_by_id()
    widgets = extract_kcs(DEFAULT_ARCHIVE_ROOT, specs)
    checked = 0
    for widget in widgets.values():
        coverage_end = widget["basis"]["coverage_end"]
        if coverage_end.startswith("2026"):
            checked += 1
            assert coverage_end <= "2026-05", coverage_end
    assert checked >= 2, checked


def test_comtrade_is_coverage_only() -> None:
    """Adding legacy value/share/growth metrics must fail this test."""
    from scripts.squid_build.extract.comtrade import extract_comtrade

    spec = _specs_by_id()["C_comtrade_coverage_matrix"]
    widget = extract_comtrade(DEFAULT_ARCHIVE_ROOT, spec)
    banned = {"share", "cagr", "global_total"}
    assert not (banned & set(widget["basis"]["metrics"])), widget["basis"]["metrics"]
    assert all(set(row) == {"reporter_code", "reporter", "year", "row_count", "density_pct"}
               for row in widget["data"]), widget["data"][0]
    # 21개 reporter×year 조합에 모두 행이 있다. 있음/없음 이진표시로 되돌아가면 실패한다.
    assert len(widget["data"]) == 21
    assert all(row["row_count"] > 0 for row in widget["data"])
    # 실제 한계는 밀도다 — 페루 2022 는 2행뿐이다.
    peru_2022 = next(r for r in widget["data"]
                     if r["reporter_code"] == "604" and r["year"] == "2022")
    assert peru_2022["row_count"] < 30


def test_concentration_covers_every_observed_year() -> None:
    """한 해만 뽑아 4년치를 버리면 실패한다. 추이가 이 위젯의 존재 이유다."""
    from scripts.squid_build.extract.kcs import extract_kcs

    specs = _specs_by_id()
    widget = extract_kcs(DEFAULT_ARCHIVE_ROOT, specs)["C_import_concentration"]
    rows = widget["data"]
    years = [r["year"] for r in rows]
    assert years == [2020, 2021, 2022, 2023, 2024], years
    assert widget["basis"]["coverage_start"] == "2020"
    assert widget["basis"]["coverage_end"] == "2024"

    for r in rows:
        # 비중 합은 100%, HHI 는 0~10000 안에 있어야 한다.
        assert abs(sum(o["share_pct"] for o in r["origins"]) - 100) < 0.01, r["year"]
        assert 0 < r["hhi"] <= 10000, r
        assert r["top1_share_pct"] <= r["top3_share_pct"] <= 100, r
        assert r["total_import_usd"] > 0

    # 중국 편중이 실제로 심화된 구간이다 — 이 신호가 사라지면 집계가 깨진 것이다.
    assert rows[-1]["top1_share_pct"] > rows[0]["top1_share_pct"]


def test_translation_number_fidelity() -> None:
    """번역이 원문에 없는 숫자를 만들어내면 실패한다.

    번역은 발행처의 말을 옮기는 것이지 새로 쓰는 것이 아니다. 규제·쿼터 문서에서
    숫자가 바뀌면 그대로 오독으로 이어지므로, 원문 숫자 집합을 벗어나는 값을 막는다.
    """
    import re as _re
    from scripts.squid_build.extract.md_extract import _excerpt_hash, _translations

    document = build_document(
        archive_root=DEFAULT_ARCHIVE_ROOT,
        built_at=datetime(2026, 8, 13, 9, 0, tzinfo=ZoneInfo("Asia/Seoul")),
    )
    table = _translations()
    checked = 0
    for widget_id, widget in document["widgets"].items():
        rows = widget["data"]
        if not isinstance(rows, list):
            continue
        for row in rows:
            if not isinstance(row, dict) or "text_ko" not in row:
                continue
            checked += 1
            assert _excerpt_hash(row["text"]) in table, widget_id
            digits = lambda t: {n.replace(",", "").rstrip(".") for n in _re.findall(r"\d[\d,]*\.?\d*", t)}
            extra = digits(row["text_ko"]) - digits(row["text"])
            assert not extra, (widget_id, sorted(extra)[:5], row["text"][:80])
            # 500자 원문이 30자로 줄면 번역이 아니라 요약이다 — 내용이 사라진다.
            assert len(row["text_ko"]) >= len(row["text"]) * 0.25, (
                widget_id, len(row["text"]), len(row["text_ko"]))
    print(f"    (번역 {checked}건 수치 대조)")


def test_hs_map_preserves_archive_rows() -> None:
    """Dropping a product form or hiding cuttlefish scope must fail."""
    from scripts.squid_build.extract.hs_map import extract_hs_map

    spec = _specs_by_id()["C_hs_classification_map"]
    widget = extract_hs_map(DEFAULT_ARCHIVE_ROOT, spec)
    assert [row["hs6"] for row in widget["data"]] == [
        "030741", "030742", "030743", "030749", "160554"
    ]
    assert all("cuttlefish" in row["description"].lower() for row in widget["data"])


def test_md_configs_cover_work_list_and_isolate_failures() -> None:
    """A missing config or one broken source must not erase neighboring widgets."""
    from scripts.squid_build.extract.md_extract import extract_all_configured

    specs = load_spec(DEFAULT_SPEC_PATH)
    expected = {spec.widget_id for spec in specs if spec.extractor == "md_extract.py"}
    config_dir = REPO_ROOT / "scripts/squid_build/configs"
    configs = {path.stem for path in config_dir.glob("*.json")}
    assert configs == expected, {"missing": expected - configs, "extra": configs - expected}
    patches, failures = extract_all_configured(DEFAULT_ARCHIVE_ROOT, specs, config_dir)
    assert "A_argentina_illex_gap" in failures
    assert "D_korea_origin_labeling" in failures
    assert len(patches) + len(failures) == 21
    assert len(patches) >= 15, sorted(failures)


def test_eu_market_prices_and_ladder_are_structured_import_quotes() -> None:
    """Leaving EFPR quotes empty or mixing price stages must fail this test."""
    document = build_document(
        archive_root=DEFAULT_ARCHIVE_ROOT,
        built_at=datetime(2026, 8, 13, 9, 0, tzinfo=ZoneInfo("Asia/Seoul")),
    )
    assert "B_eu_first_sale_price" not in document["widgets"]
    assert "B_eu_spread" not in document["widgets"]

    market = document["widgets"]["B_eu_market_prices"]
    assert market["chartType"] == "table"
    assert market["basis"]["market_stage"] == "import_unit"
    assert len(market["data"]) == 49
    assert market["data"][0] == {
        "scientific_name": "Loligo spp.",
        "product_form": "Whole",
        "size_grade": "S (< 18 cm)",
        "price_eur_per_kg": 8.9,
        "price_usd_per_kg": 10.23,
        "trend": None,
        "reference_area": "Italy",
        "incoterm": "CIF",
        "origin": "South Africa",
        "source_line": 1566,
    }
    coindetii = market["data"][-2]
    assert coindetii["scientific_name"] == "Illex coindetii"
    assert coindetii["size_grade"] == "100-150 g/pc"
    assert coindetii["price_eur_per_kg"] == 2.95
    assert coindetii["price_usd_per_kg"] == 3.39
    assert coindetii["trend"] == "+"
    assert coindetii["incoterm"] == "FOB"
    assert coindetii["origin"] == "Morocco"
    grade_a = next(row for row in market["data"] if row["source_line"] == 1577)
    assert grade_a["incoterm"] == "CIF"
    assert "EUR/kg" in market["methodology"]
    assert "USD/kg" in market["methodology"]

    ladder = document["widgets"]["B_species_price_ladder"]
    assert ladder["chartType"] == "bar"
    assert ladder["basis"]["market_stage"] == "import_unit"
    assert len(ladder["data"]) == 44
    assert {row["market_stage"] for row in ladder["data"]} == {"import_unit"}
    assert all(row["size_grade"] for row in ladder["data"])
    eur_prices = [row["price_eur_per_kg"] for row in ladder["data"]]
    assert eur_prices == sorted(eur_prices, reverse=True)
    assert ladder["data"][0]["price_eur_per_kg"] == 25.0


def test_korea_tac_is_coverage_table_not_species_tonnage() -> None:
    """Reintroducing a fabricated squid allocation tonnage must fail this test."""
    document = build_document(archive_root=DEFAULT_ARCHIVE_ROOT)
    widget = document["widgets"]["A_korea_tac"]
    assert widget["chartType"] == "table"
    assert widget["basis"]["metrics"] == ["coverage"]
    assert widget["basis"]["weight_basis"] == "n/a"
    assert widget["basis"]["quota_semantics"] == "n/a"
    assert widget["data"] == [
        {
            "species": "민어",
            "applicable_fishery": "대형트롤",
            "application_stage": 2,
        },
        {
            "species": "살오징어",
            "applicable_fishery": "서남해구외끌이중형저인망",
            "application_stage": 2,
        },
        {
            "species": "전 어종",
            "applicable_fishery": "정치망",
            "application_stage": 1,
        },
    ]
    assert all("tonnes" not in row and "tonnage" not in row for row in widget["data"])
    assert "배분 톤수" in widget["methodology"]


def test_sourcing_signal_records_observed_and_schedule_derivations() -> None:
    """Hiding supported states or presenting a schedule as observed must fail."""
    document = build_document(
        archive_root=DEFAULT_ARCHIVE_ROOT,
        built_at=datetime(2026, 8, 13, 9, 0, tzinfo=ZoneInfo("Asia/Seoul")),
    )
    rows = {
        row["origin"]: row
        for row in document["widgets"]["A_sourcing_signal_board"]["data"]
    }

    chile = rows["칠레 jibia"]
    assert chile["status"] == "조업중"
    assert chile["as_of"] == "2026-08-06"
    # 잔여량은 조달 판단용이므로 정수 톤. 소수점 4자리는 의미 없는 정밀도였다.
    assert "78,131톤" in chile["reason"]
    # 기준일은 카드가 as_of 로 따로 찍는다 — reason 안에서 되풀이하지 않는다.
    assert "2026-08-06" not in chile["reason"]
    assert chile["state_evidence"]["evidence_type"] == "observed_report"
    assert chile["state_evidence"]["derivation"] == "observed_capture_accrual"
    assert chile["state_evidence"]["archive_path"].endswith(
        "20260806-SERNAPESCA-Jibia_Quota_Consumption_2026.xlsx"
    )

    falkland = rows["포클랜드 Loligo"]
    assert falkland["status"] == "어기중"
    assert falkland["state_evidence"]["evidence_type"] == "schedule_derived"
    assert falkland["state_evidence"]["derivation"] == "published_schedule_window"
    assert falkland["state_evidence"]["archive_path"].endswith(
        "20251212-FIFD-Licensing_Advice_2026.md"
    )
    # 문구가 바뀌어도 "관측이 아니라 일정 기준"이라는 사실은 남아야 한다.
    assert "공개 어기 일정" in falkland["reason"]
    assert "개장 공지 확인은 아님" in falkland["reason"]

    assert rows["아르헨티나 Illex"]["status"] == "데이터공백"
    assert rows["한국 살오징어"]["status"] == "데이터공백"
    assert all("state_evidence" in row for row in rows.values())


def test_sprfmo_effort_rows_are_numeric_and_keep_excerpt() -> None:
    """Replacing chart rows with source-excerpt objects must fail this test."""
    document = build_document(archive_root=DEFAULT_ARCHIVE_ROOT)
    widget = document["widgets"]["A_sprfmo_cmm18_effort"]
    assert widget["chartType"] == "bar"
    assert widget["data"] == [
        {"member": "China", "vessel_limit": 570, "gross_tonnage_gt": 548097},
        {"member": "Korea", "vessel_limit": 43, "gross_tonnage_gt": 38907},
        {"member": "Chinese Taipei", "vessel_limit": 38, "gross_tonnage_gt": 38674},
        {"member": "Total", "vessel_limit": 651, "gross_tonnage_gt": 625678},
    ]
    assert all(
        isinstance(row["vessel_limit"], int)
        and isinstance(row["gross_tonnage_gt"], int)
        for row in widget["data"]
    )
    assert "Member" in widget["source_excerpt"]
    assert "625,678" in widget["source_excerpt"]
    # 선박수·GT 는 어체 중량이 아니다. metrics=effort 로 선언해야 G-003 이 통과한다
    # (게이트에 effort_limit 예외를 두는 대신 지표 자체를 정확히 부른다).
    assert widget["basis"]["metrics"] == ["effort"]
    assert widget["basis"]["weight_basis"] == "n/a"


def test_pdf_layout_fallback_preserves_archive_pdf_citation() -> None:
    """Requiring a Markdown twin when layout PDF text is usable must fail."""
    from scripts.squid_build.extract.md_extract import extract_configured_widget

    spec = replace(
        _specs_by_id()["A_argentina_illex_gap"],
        archive_paths=("오징어자료/01_Argentina/INIDEP_Calamar_T2024_Informe_final.pdf",),
    )
    config = {
        "widget_id": spec.widget_id,
        "patterns": [r"Calamar argentino\. Temporada 2024\. Informe final"],
        "min_items": 1,
        "max_items": 2,
    }
    with tempfile.TemporaryDirectory() as temp_dir:
        config_path = Path(temp_dir) / f"{spec.widget_id}.json"
        config_path.write_text(json.dumps(config), encoding="utf-8")
        patch = extract_configured_widget(DEFAULT_ARCHIVE_ROOT, spec, config_path)

    assert patch["data"]
    assert all(row["source_path"].endswith(".pdf") for row in patch["data"])
    assert all(row["extraction_method"] == "pdftotext -layout" for row in patch["data"])
    assert "layout 재추출" in patch["methodology"]


def test_only_four_cards_remain_empty_after_layout_recheck() -> None:
    """Using stale empties or 2024 evidence as a 2026 Argentina state must fail."""
    document = build_document(
        archive_root=DEFAULT_ARCHIVE_ROOT,
        built_at=datetime(2026, 8, 13, 9, 0, tzinfo=ZoneInfo("Asia/Seoul")),
    )
    empty = {
        widget_id
        for widget_id, widget in document["widgets"].items()
        if not widget["data"]
    }
    assert empty == {
        "A_argentina_illex_gap",
        "B_landed_cost_calc",
        "D_korea_origin_labeling",
        "E_corrections_log",
    }

    argentina = document["widgets"]["A_argentina_illex_gap"]
    assert "pdftotext -layout" in argentina["methodology"]
    assert "2024" in argentina["methodology"]
    assert "2026" in argentina["methodology"]
    assert argentina["basis"]["archive_path"].endswith(
        "INIDEP_Calamar_T2024_Informe_final.pdf"
    )

    origin = document["widgets"]["D_korea_origin_labeling"]
    assert "SQ-SAFE-NFQS" in origin["methodology"]
    assert "공식" in origin["methodology"]
    corrections = document["widgets"]["E_corrections_log"]
    assert "P0 9건·P1 8건·폐기 110건" in corrections["methodology"]


def test_derivations_preserve_missing_inputs() -> None:
    """A derivation that turns missing tariff/season evidence into a number must fail."""
    from scripts.squid_build.derive import derive_widgets

    document = build_document(archive_root=DEFAULT_ARCHIVE_ROOT)
    specs = load_spec(DEFAULT_SPEC_PATH)
    patches = derive_widgets(document, specs)

    signal = patches["A_sourcing_signal_board"]
    assert {row["status"] for row in signal["data"]} <= {
        "조업중", "어기중", "중단·제한", "어기외", "데이터공백"
    }
    peru = next(row for row in signal["data"] if row["origin"] == "페루 pota")
    assert peru["status"] == "중단·제한"

    landed = patches["B_landed_cost_calc"]
    assert landed["data"] == []
    assert landed["chartType"] == "card"
    assert landed["basis"]["claim_type"] == "operational"

    stages = patches["B_stage_separated_prices"]["data"]
    assert [row["market_stage"] for row in stages] == [
        "consumer", "import_unit", "import_unit"
    ]
    assert all(row["market_stage"] != "first_sale" for row in stages)
    assert all("combined_average" not in row for row in stages)


def test_complete_document_contract() -> None:
    """Dropping a spec row or violating a measurement gate must fail."""
    document = build_document(archive_root=DEFAULT_ARCHIVE_ROOT)
    assert len(document["widgets"]) == 39, len(document["widgets"])
    assert document["meta"]["telemetry"] == "SYNCED"
    errors = validate(document)
    assert errors == [], "\n".join(errors)


def main() -> None:
    tests = [
        test_fishstat_species_filter,
        test_kmi_price_round_trip,
        test_peru_timeline_order,
        test_chile_uses_separate_quota_and_capture_sources,
        test_kcs_2026_coverage_stops_at_may,
        test_comtrade_is_coverage_only,
        test_concentration_covers_every_observed_year,
        test_translation_number_fidelity,
        test_hs_map_preserves_archive_rows,
        test_md_configs_cover_work_list_and_isolate_failures,
        test_eu_market_prices_and_ladder_are_structured_import_quotes,
        test_korea_tac_is_coverage_table_not_species_tonnage,
        test_sourcing_signal_records_observed_and_schedule_derivations,
        test_sprfmo_effort_rows_are_numeric_and_keep_excerpt,
        test_pdf_layout_fallback_preserves_archive_pdf_citation,
        test_only_four_cards_remain_empty_after_layout_recheck,
        test_derivations_preserve_missing_inputs,
        test_complete_document_contract,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"all asserts pass — {len(tests)} checks")


if __name__ == "__main__":
    main()
