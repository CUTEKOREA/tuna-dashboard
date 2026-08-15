"""Regression tests for the source-faithful GMTS weekly report normalizer."""

from __future__ import annotations

import sys
import inspect
import unittest
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from build_gmts_dashboard import (  # noqa: E402
    DEFAULT_SOURCE_DIR,
    MONTH_KEYS,
    build_dashboard,
    parse_declared_count,
    parse_iso_date,
    parse_measure,
    parse_price,
    parse_lane_records,
    parse_report,
    validate_weekly_sequence,
)


SOURCE_DIR = Path(DEFAULT_SOURCE_DIR)


class NormalizationTest(unittest.TestCase):
    def test_blank_declared_count_stays_unknown(self) -> None:
        self.assertIsNone(parse_declared_count("A. Unloading Vessels :"))
        self.assertEqual(parse_declared_count("B. Incoming Vessel: 3"), 3)

    def test_price_qualifiers_are_preserved(self) -> None:
        no_offer = parse_price("No offer")
        self.assertEqual(no_offer["qualifier"], "no-offer")
        self.assertIsNone(no_offer["amount"])
        self.assertEqual(no_offer["rawText"], "No offer")
        self.assertEqual(
            parse_price("$1,750 Level (No Deal)")["qualifier"], "no-transaction"
        )

    def test_source_typos_are_normalized_without_inventing_a_value(self) -> None:
        self.assertEqual(parse_iso_date("2026/08/06 MT"), "2026-08-06")
        self.assertEqual(parse_measure("6.295.630 MT"), 6295.630)
        self.assertIsNone(parse_measure("TBA"))


class WeeklySequenceGateTest(unittest.TestCase):
    def test_duplicate_and_missing_weeks_are_rejected(self) -> None:
        duplicate = [{"reportDate": "2026-01-21"}, {"reportDate": "2026-01-21"}]
        missing = [{"reportDate": "2026-01-21"}, {"reportDate": "2026-02-04"}]
        with self.assertRaisesRegex(ValueError, "duplicate"):
            validate_weekly_sequence(duplicate)
        with self.assertRaisesRegex(ValueError, "missing"):
            validate_weekly_sequence(missing)


class ArchiveEndToEndTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.dashboard = build_dashboard(SOURCE_DIR)
        cls.latest_report = parse_report(
            SOURCE_DIR / 'GMTS Weekly Report 20260812.pdf'
        )

    def test_production_parser_has_no_latest_report_fixture_literals(self) -> None:
        source = '\n'.join(
            inspect.getsource(helper)
            for helper in (build_dashboard, parse_report, parse_lane_records)
        )
        for fixture_literal in (
            '2026-08-12',
            'AMAGI',
            'HIKARI 1',
            'SEIN QUEEN',
            'SEA BLAZER',
            'QUEEN ELLICE',
        ):
            self.assertNotIn(fixture_literal, source)

    def test_generic_parser_builds_complete_latest_vessel_records(self) -> None:
        port = self.latest_report
        records = (
            port['completedDischarging']['records'] + port['incoming']['records']
        )
        expected_date_keys = {
            'arrived',
            'unloadingStarted',
            'etd',
            'etaStart',
            'etaEnd',
        }
        self.assertEqual(len(records), 5)
        for record in records:
            self.assertIsInstance(record['traders'], list)
            self.assertIsInstance(record['consignees'], list)
            self.assertEqual(set(record['dates']), expected_date_keys)
            self.assertTrue(record['rawFields'])
            if record['cargo'] is not None:
                self.assertTrue(record['rawFields'].get('cargo'))

        amagi = next(item for item in records if item['displayName'] == 'AMAGI')
        self.assertEqual(amagi['traders'], ['TPJ', 'FFC'])
        self.assertEqual(amagi['rawFields']['cargo'], '2,102.141 MT')
        self.assertEqual(amagi['rawFields']['discharged'], '1,899.280 MT')
        self.assertEqual(amagi['rawFields']['short'], '202.861 MT')
        self.assertEqual(
            amagi['dates']['arrived'],
            {'value': '2026-07-23', 'rawText': '2026/07/23'},
        )
        self.assertEqual(
            amagi['dates']['unloadingStarted'],
            {'value': '2026-07-25', 'rawText': '2026/07/25'},
        )
        self.assertEqual(
            amagi['dates']['etd'],
            {'value': '2026-08-07', 'rawText': '2026/08/07 MT'},
        )

        hikari = next(item for item in records if item['displayName'] == 'HIKARI 1')
        self.assertEqual(hikari['traders'], ['SHILLA'])
        self.assertEqual(hikari['rawFields']['cargo'], '285.000 MT')
        self.assertEqual(hikari['rawFields']['discharged'], '284.830 MT')
        self.assertEqual(hikari['rawFields']['short'], '0.170 MT')
        self.assertEqual(hikari['dates']['arrived']['value'], '2026-08-05')
        self.assertEqual(hikari['dates']['unloadingStarted']['value'], '2026-08-06')
        self.assertEqual(hikari['dates']['etd']['value'], '2026-08-07')

        sein_queen = next(
            item for item in records if item['displayName'] == 'SEIN QUEEN'
        )
        self.assertEqual(sein_queen['traders'], ['TPJ'])
        self.assertEqual(sein_queen['rawFields']['cargo'], '4,994.414 MT')
        self.assertEqual(
            sein_queen['rawFields']['gensanAllocation'], '2,092.414 MT'
        )
        self.assertEqual(sein_queen['dates']['etaStart']['value'], '2026-08-12')
        self.assertEqual(sein_queen['dates']['etaEnd']['value'], '2026-08-13')

        sea_blazer = next(
            item for item in records if item['displayName'] == 'SEA BLAZER'
        )
        self.assertEqual(sea_blazer['traders'], ['FCF'])
        self.assertEqual(sea_blazer['rawFields']['cargo'], '4,345.080 MT')
        self.assertEqual(sea_blazer['dates']['etaStart']['value'], '2026-08-11')
        self.assertEqual(
            sea_blazer['consignees'], ['FOODSPHERE', 'FCF TRANSHIPMENT']
        )

        queen_ellice = next(
            item for item in records if item['displayName'] == 'QUEEN ELLICE'
        )
        self.assertEqual(queen_ellice['traders'], ['ITOCHU'])
        self.assertEqual(queen_ellice['rawFields']['cargo'], '580.000 MT')
        self.assertEqual(queen_ellice['dates']['etaStart']['value'], '2026-08-11')
        self.assertEqual(queen_ellice['consignees'], ['GENTUNA'])

    def test_archive_has_30_reports_38_pages_and_continuous_report_dates(self) -> None:
        expected_dates = [
            (date(2026, 1, 21) + timedelta(days=7 * index)).isoformat()
            for index in range(30)
        ]
        self.assertEqual(self.dashboard["metadata"]["reportCount"], 30)
        self.assertEqual(self.dashboard["metadata"]["pageCount"], 38)
        self.assertEqual(
            [report["reportDate"] for report in self.dashboard["weekly"]], expected_dates
        )
        self.assertEqual(self.dashboard["qualityFlags"]["missingWeeks"], [])
        self.assertEqual(self.dashboard["qualityFlags"]["duplicateReportDates"], [])

    def test_each_report_preserves_seven_canneries_and_total_reconciles(self) -> None:
        numeric_fields = (
            "maxDailyProductionMt",
            "currentDailyProductionMt",
            "storageCapacityMt",
            "currentStockMt",
        )
        for report in self.dashboard["weekly"]:
            self.assertTrue(all(field in report["canneryTotal"] for field in numeric_fields), report["reportDate"])

    def test_february_2026_revision_is_explicit_and_not_silently_overwritten(self) -> None:
        revision = next(
            item
            for item in self.dashboard["volumeHistory"]["revisions"]
            if item["month"] == "2026-02"
            and item["previousReportDate"] == "2026-03-04"
            and item["reportDate"] == "2026-03-11"
        )
        self.assertEqual(revision["previousValue"], 6220.0)
        self.assertEqual(revision["value"], 11968.0)

    def test_blank_2026_volume_row_is_kept_as_unknown(self) -> None:
        first = self.dashboard["volumeHistory"]["snapshots"][0]["volume2026"]
        self.assertIsNone(first["months"]["01"])
        self.assertIsNone(first["total"])

    def test_latest_source_hash_numeric_anchors_and_blanks_are_source_faithful(self) -> None:
        latest = self.dashboard["latest"]
        self.assertEqual(latest["reportDate"], "2026-08-12")
        self.assertEqual(
            latest["source"]["sha256"],
            "e84ad3bb26ebe05e863467bff3f4507775a8cf4b04adefa8026eb3414e1e5243",
        )
        self.assertEqual(latest["prices"]["nonGspNonMsc"]["amount"], 1900)
        self.assertEqual(latest["prices"]["gspNonMsc"]["amount"], 2025)
        self.assertEqual(self.dashboard["volumeHistory"]["annual"]["2026"]["months"]["07"], 12687.0)
        self.assertEqual(self.dashboard["volumeHistory"]["annual"]["2026"]["total"], 63736.0)
        total = next(row for row in latest["canneries"] if row["name"] == "Total")
        self.assertEqual(total["currentProductionMt"], 895.0)
        self.assertEqual(total["currentStockMt"], 17550.0)
        self.assertIsNone(latest["port"]["active"]["declaredCount"])
        self.assertEqual(latest["port"]["active"]["rawText"], "A. Unloading Vessels :")

    def test_operational_contract_separates_report_date_from_operational_as_of(self) -> None:
        self.assertEqual(self.dashboard["metadata"]["status"], "STATIC")
        self.assertEqual(self.dashboard["metadata"]["coverageStart"], "2026-01-21")
        self.assertEqual(self.dashboard["metadata"]["coverageEnd"], "2026-08-12")
        self.assertTrue(all(item["operationalAsOf"] is None for item in self.dashboard["weekly"]))
        self.assertIsNone(self.dashboard["latest"]["operationalAsOf"])

    def test_latest_lanes_keep_declared_and_record_counts_with_source_details(self) -> None:
        latest = self.dashboard["latest"]
        self.assertEqual(latest["port"]["active"]["recordCount"], 0)
        completed = latest["port"]["completed"]
        self.assertEqual(completed["declaredCount"], 2)
        self.assertEqual(completed["recordCount"], 2)
        self.assertEqual(sum(item["cargo"] or 0 for item in completed["records"]), 2387.141)
        self.assertEqual(sum(item["discharged"] or 0 for item in completed["records"]), 2184.110)
        self.assertAlmostEqual(sum(item["short"] or 0 for item in completed["records"]), 203.031, places=3)
        incoming = latest["port"]["incoming"]
        self.assertEqual(incoming["recordCount"], 3)
        self.assertAlmostEqual(sum(item["cargo"] or 0 for item in incoming["records"]), 9919.494, places=3)
        queen = next(item for item in incoming["records"] if item["displayName"] == "SEIN QUEEN")
        self.assertEqual(queen["gensanAllocation"], 2092.414)

    def test_volume_is_unit_neutral_and_retains_annual_rows(self) -> None:
        volume = self.dashboard["volumeHistory"]
        self.assertIsNone(volume["unit"])
        self.assertTrue(volume["excludesFreshTuna"])
        self.assertNotIn("totalMt", volume)
        self.assertEqual(volume["annual"]["2025"]["months"]["07"], 16120.0)
        self.assertEqual(sum(volume["annual"]["2025"]["months"][key] for key in MONTH_KEYS[:7]), 67363.0)
        self.assertEqual(volume["annual"]["2026"]["total"], 63736.0)
        self.assertEqual(volume["annual"]["2026"]["months"]["07"], 12687.0)

    def test_quality_flags_are_observed_not_constant_empty_lists(self) -> None:
        flags = self.dashboard["qualityFlags"]
        self.assertTrue(flags["blankHeadings"])
        self.assertTrue(flags["priceQualifiers"])
        self.assertTrue(flags["volumeRevisions"])
        self.assertTrue(any(flag["name"] == "Celebes" and flag["storageUtilizationPercent"] == 122.0 for flag in flags["utilizationOverCapacity"]))

    def test_weekly_is_compact_and_volume_history_owns_annual_table(self) -> None:
        weekly = self.dashboard["weekly"][0]
        self.assertEqual(set(weekly), {"reportDate", "operationalAsOf", "port", "canneryTotal", "prices", "volume2026"})
        self.assertEqual(set(weekly["port"]["active"]), {"declaredCount", "recordCount"})
        self.assertNotIn("canneries", weekly)
        self.assertNotIn("volume", weekly)
        history = self.dashboard["volumeHistory"]
        self.assertEqual(set(history), {"excludesFreshTuna", "unit", "annual", "snapshots", "revisions"})
        self.assertTrue(all(set(item) == {"reportDate", "volume2026"} for item in history["snapshots"]))

    def test_latest_port_structure_and_vessel_columns_are_source_aligned(self) -> None:
        latest = self.dashboard["latest"]
        self.assertEqual(set(latest["port"]), {"active", "completed", "incoming"})
        amagi = next(item for item in latest["port"]["completed"]["records"] if item["displayName"] == "AMAGI")
        self.assertEqual(amagi["traders"], ["TPJ", "FFC"])
        self.assertEqual(amagi["cargo"], 2102.141)
        self.assertEqual(amagi["discharged"], 1899.280)
        self.assertEqual(amagi["short"], 202.861)
        self.assertEqual(amagi["consignees"], ["T/S", "GENTUNA", "SEATRADE"])
        queen = next(item for item in latest["port"]["incoming"]["records"] if item["displayName"] == "SEIN QUEEN")
        self.assertEqual(queen["traders"], ["TPJ"])
        self.assertEqual(queen["etaOrUnloadingDate"], "2026/08/12-13")
        self.assertEqual(queen["consignees"], ["GENTUNA"])
        self.assertNotIn("GENTUNA", queen["etaOrUnloadingDate"])

    def test_cannery_total_uses_approved_type_contract_keys(self) -> None:
        expected = {"maxDailyProductionMt", "currentDailyProductionMt", "productionUtilizationPct", "storageCapacityMt", "currentStockMt", "storageUtilizationPct", "reportedProcessingDays"}
        self.assertEqual(set(self.dashboard["weekly"][0]["canneryTotal"]), expected)
        self.assertEqual(set(self.dashboard["latest"]["canneryTotal"]), expected)

    def test_latest_vessel_dates_and_raw_values_are_preserved(self) -> None:
        records = self.dashboard["latest"]["port"]["completed"]["records"]
        amagi = next(item for item in records if item["displayName"] == "AMAGI")
        self.assertEqual(amagi["dates"]["arrived"], {"value": "2026-07-23", "rawText": "2026/07/23"})
        self.assertEqual(amagi["dates"]["unloadingStarted"]["rawText"], "2026/07/25")
        self.assertEqual(amagi["dates"]["etd"], {"value": "2026-08-07", "rawText": "2026/08/07 MT"})
        self.assertEqual(amagi["rawFields"]["cargo"], "2,102.141 MT")
        hikar = next(item for item in records if item["displayName"] == "HIKARI 1")
        self.assertEqual(hikar["dates"]["unloadingStarted"]["rawText"], "2026/08/06 MT")
        incoming = self.dashboard["latest"]["port"]["incoming"]["records"]
        queen = next(item for item in incoming if item["displayName"] == "SEIN QUEEN")
        self.assertEqual(queen["dates"]["etaStart"], {"value": "2026-08-12", "rawText": "2026/08/12-13"})
        self.assertEqual(queen["dates"]["etaEnd"], {"value": "2026-08-13", "rawText": "2026/08/12-13"})


if __name__ == "__main__":
    unittest.main()
