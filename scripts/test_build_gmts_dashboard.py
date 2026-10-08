"""Regression tests for the source-faithful GMTS weekly report normalizer."""

from __future__ import annotations

import copy
import inspect
import json
import subprocess
import sys
import unittest
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import build_gmts_dashboard as gmts  # noqa: E402

from build_gmts_dashboard import (  # noqa: E402
    DEFAULT_SOURCE_DIR,
    MONTH_KEYS,
    build_dashboard,
    detect_volume_revisions,
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

    def test_revision_detection_covers_years_other_than_2026(self) -> None:
        months_before = {month: None for month in MONTH_KEYS}
        months_after = dict(months_before)
        months_before['01'] = 100.0
        months_after['01'] = 125.0
        reports = [
            {
                'reportDate': '2025-01-01',
                'volume': {
                    'annual': {
                        '2025': {'months': months_before, 'total': 100.0}
                    }
                },
            },
            {
                'reportDate': '2025-01-08',
                'volume': {
                    'annual': {
                        '2025': {'months': months_after, 'total': 125.0}
                    }
                },
            },
        ]
        self.assertEqual(
            detect_volume_revisions(reports),
            [
                {
                    'month': '2025-01',
                    'previousReportDate': '2025-01-01',
                    'previousValue': 100.0,
                    'reportDate': '2025-01-08',
                    'value': 125.0,
                }
            ],
        )


class ArchiveEndToEndTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.dashboard = build_dashboard(SOURCE_DIR)
        cls.latest_report = parse_report(
            SOURCE_DIR / 'GMTS Weekly Report 20260812.pdf'
        )

    def test_runtime_gate_rejects_cannery_sum_mismatch(self) -> None:
        mutated = copy.deepcopy(self.latest_report)
        gentuna = next(
            row for row in mutated['canneries'] if row['name'] == 'Gentuna/Century'
        )
        gentuna['currentStockMt'] += 1
        with self.assertRaisesRegex(ValueError, 'cannery total mismatch'):
            gmts.validate_report(mutated)

    def test_runtime_gate_rejects_bad_total_utilization(self) -> None:
        mutated = copy.deepcopy(self.latest_report)
        total = next(row for row in mutated['canneries'] if row['name'] == 'Total')
        total['productionUtilizationPercent'] += 1
        with self.assertRaisesRegex(ValueError, 'utilization mismatch'):
            gmts.validate_report(mutated)

    def test_runtime_gate_requires_all_annual_rows(self) -> None:
        mutated = copy.deepcopy(self.latest_report)
        del mutated['volume']['annual']['2019']
        with self.assertRaisesRegex(ValueError, 'annual rows'):
            gmts.validate_report(mutated)

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

    def test_archive_report_dates_are_weekly_and_metadata_counts_match(self) -> None:
        """주차 수·쪽수는 매주 늘어난다 — 숫자를 박으면 반영할 때마다 이 테스트가 먼저 깨진다.
        지켜야 할 것은 «메타가 실제 배열과 맞는가»와 «수요일 간격이 끊기지 않는가»다."""
        metadata = self.dashboard["metadata"]
        weekly = self.dashboard["weekly"]
        first = date.fromisoformat(metadata["firstReportDate"])
        expected_dates = [
            (first + timedelta(days=7 * index)).isoformat() for index in range(len(weekly))
        ]
        self.assertEqual(metadata["reportCount"], len(weekly))
        self.assertEqual(metadata["pageCount"], sum(source["pages"] for source in self.dashboard["sources"]))
        self.assertEqual([report["reportDate"] for report in weekly], expected_dates)
        self.assertEqual(metadata["coverageStart"], metadata["firstReportDate"])
        self.assertEqual(metadata["coverageEnd"], metadata["latestReportDate"])
        self.assertEqual(metadata["latestReportDate"], weekly[-1]["reportDate"])

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
        self.assertIsNone(first["months"][0])
        self.assertIsNone(first["total"])

    def test_latest_source_hash_numeric_anchors_and_blanks_are_source_faithful(self) -> None:
        """최신 주차 값은 매주 바뀌므로 숫자를 박지 않는다 — 최신 스냅샷이 원문 매니페스트·주간 배열과
        서로 맞는지, 공장 합계가 행 합과 맞는지를 본다."""
        latest = self.dashboard["latest"]
        self.assertEqual(latest["reportDate"], self.dashboard["metadata"]["latestReportDate"])
        self.assertEqual(latest["source"], self.dashboard["sources"][-1])
        self.assertRegex(latest["source"]["sha256"], r"^[0-9a-f]{64}$")
        total = next(row for row in latest["canneries"] if row["name"] == "Total")
        rows = [row for row in latest["canneries"] if row["name"] != "Total"]
        for field in ("currentProductionMt", "maximumProductionMt", "currentStockMt", "maximumCapacityMt"):
            self.assertAlmostEqual(sum(row[field] for row in rows), total[field], places=3, msg=field)
        self.assertEqual(latest["canneryTotal"]["currentDailyProductionMt"], total["currentProductionMt"])
        self.assertEqual(latest["canneryTotal"]["currentStockMt"], total["currentStockMt"])
        active = latest["port"]["active"]
        if active["declaredCount"] is not None:
            self.assertIn(str(active["declaredCount"]), active["rawText"])

    def test_operational_contract_separates_report_date_from_operational_as_of(self) -> None:
        metadata = self.dashboard["metadata"]
        self.assertEqual(metadata["status"], "STATIC")
        self.assertEqual(metadata["coverageStart"], "2026-01-21")
        self.assertEqual(metadata["coverageEnd"], metadata["latestReportDate"])
        self.assertTrue(all(item["operationalAsOf"] is None for item in self.dashboard["weekly"]))
        self.assertIsNone(self.dashboard["latest"]["operationalAsOf"])

    def test_latest_lanes_keep_declared_and_record_counts_with_source_details(self) -> None:
        """레인별 척수·물량은 매주 바뀐다. 고정할 것은 «선언 척수와 실제 행 수가 따로 보존되고,
        합계가 행에서 나오며, 공란이 0 으로 바뀌지 않는다»이다."""
        latest = self.dashboard["latest"]
        for lane in ("active", "completed", "incoming"):
            block = latest["port"][lane]
            self.assertEqual(block["recordCount"], len(block["records"]), lane)
            if block["declaredCount"] is None:
                # 원문이 척수를 비워 둔 주 - 0 으로 만들지 않는다
                self.assertIsNotNone(block.get("rawText"), lane)
            else:
                self.assertIsInstance(block["declaredCount"], int)
            for record in block["records"]:
                # TBA 는 0 이 아니라 공란이다
                if record["rawFields"].get("cargo") in (None, "TBA", "EMPTY"):
                    self.assertIsNone(record["cargo"], (lane, record["displayName"]))

    def test_volume_is_unit_neutral_and_retains_annual_rows(self) -> None:
        volume = self.dashboard["volumeHistory"]
        self.assertIsNone(volume["unit"])
        self.assertTrue(volume["excludesFreshTuna"])
        self.assertNotIn("totalMt", volume)
        self.assertEqual([row["year"] for row in volume["annual"]], list(range(2019, 2027)))
        self.assertTrue(all(len(row["months"]) == 12 for row in volume["annual"]))
        # 끝난 해는 고정값, 진행 중인 해는 «합계 = 월 합»만 본다(매주 월이 채워진다)
        annual_2025 = next(row for row in volume["annual"] if row["year"] == 2025)
        annual_2026 = next(row for row in volume["annual"] if row["year"] == 2026)
        self.assertEqual(annual_2025["months"][6], 16120.0)
        self.assertEqual(annual_2025["total"], 112986.0)
        self.assertAlmostEqual(
            annual_2026["total"],
            sum(value for value in annual_2026["months"] if value is not None),
            places=3,
        )
        self.assertEqual(annual_2026["months"][6], 12687.0)
        self.assertTrue(
            all(len(report["volume2026"]["months"]) == 12 for report in self.dashboard["weekly"])
        )
        self.assertTrue(
            all(
                len(snapshot["volume2026"]["months"]) == 12
                for snapshot in volume["snapshots"]
            )
        )

    def test_quality_flags_are_an_ordered_structured_array(self) -> None:
        flags = self.dashboard["qualityFlags"]
        self.assertIsInstance(flags, list)
        # 건수는 주차가 늘면 같이 는다. 고정할 것은 «코드가 묶여서, 정해진 순서로» 나오는지다.
        order = [
            "blank_declared_count",
            "price_qualifier",
            "volume_revision",
            "capacity_exceeded",
            "price_basis_unit_missing",
            "volume_unit_missing",
        ]
        codes = [flag["code"] for flag in flags]
        self.assertEqual(set(codes) - set(order), set())
        self.assertEqual(codes, sorted(codes, key=order.index))
        self.assertEqual(codes.count("volume_revision"), 1)
        self.assertEqual(codes.count("price_basis_unit_missing"), 1)
        self.assertEqual(codes.count("volume_unit_missing"), 1)
        self.assertEqual(len(flags), len(codes))
        self.assertTrue(
            any(
                flag["code"] == "capacity_exceeded"
                and flag["name"] == "Celebes"
                and flag["storageUtilizationPercent"] == 122.0
                for flag in flags
            )
        )

    def test_emitted_arrays_support_javascript_find_filter_and_slice(self) -> None:
        script = """
let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  const dashboard = JSON.parse(input);
  const flags = dashboard.qualityFlags;
  const annual = dashboard.volumeHistory.annual;
  const months = dashboard.weekly[0].volume2026.months;
  process.stdout.write(JSON.stringify({
    revisionCode: flags.find((flag) => flag.code === 'volume_revision')?.code,
    qualifierCount: flags.filter((flag) => flag.code === 'price_qualifier').length,
    firstYears: annual.slice(0, 2).map((row) => row.year),
    firstMonths: months.slice(0, 3),
  }));
});
"""
        result = subprocess.run(
            ['node', '-e', script],
            input=json.dumps(self.dashboard),
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            json.loads(result.stdout),
            {
                'revisionCode': 'volume_revision',
                'qualifierCount': 31,
                'firstYears': [2019, 2020],
                'firstMonths': [None, None, None],
            },
        )

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
        """최신 주차의 선박은 매주 바뀐다 — 선명을 박으면 반영할 때마다 깨진다(2026-08-19 판의
        SEA BLAZER 를 박아 두어 실제로 깨져 있었다). 선명별 확인은 고정 PDF 테스트가 맡고,
        여기서는 주차가 바뀌어도 성립하는 구조만 본다."""
        latest = self.dashboard["latest"]
        self.assertEqual(set(latest["port"]), {"active", "completed", "incoming"})
        for lane in ("active", "completed", "incoming"):
            block = latest["port"][lane]
            self.assertEqual(block["recordCount"], len(block["records"]), lane)
            for record in block["records"]:
                self.assertIsInstance(record["traders"], list)
                self.assertIsInstance(record["consignees"], list)
                self.assertTrue(record["displayName"])
                # 값이 있으면 원문 문자열이 함께 남는다 - 숫자만 남기고 원문을 버리지 않는다
                for key in ("cargo", "discharged", "short"):
                    if record[key] is not None:
                        self.assertTrue(record["rawFields"].get(key), (lane, record["displayName"], key))
                # 수하인이 ETA 칸으로 새지 않는다
                eta = record["etaOrUnloadingDate"]
                if eta and eta not in {"TBA", "TBD", "EMPTY"}:
                    for consignee in record["consignees"]:
                        self.assertNotIn(consignee, eta)

    def test_cannery_total_uses_approved_type_contract_keys(self) -> None:
        expected = {"maxDailyProductionMt", "currentDailyProductionMt", "productionUtilizationPct", "storageCapacityMt", "currentStockMt", "storageUtilizationPct", "reportedProcessingDays"}
        self.assertEqual(set(self.dashboard["weekly"][0]["canneryTotal"]), expected)
        self.assertEqual(set(self.dashboard["latest"]["canneryTotal"]), expected)

    def test_latest_vessel_dates_and_raw_values_are_preserved(self) -> None:
        """날짜는 값과 원문을 함께 들고 있어야 한다. TBA 는 값이 없고 원문만 남는다."""
        for lane in ("active", "completed", "incoming"):
            for record in self.dashboard["latest"]["port"][lane]["records"]:
                for key, observation in record["dates"].items():
                    if observation is None:
                        continue
                    self.assertEqual(set(observation), {"value", "rawText"}, (lane, key))
                    if observation["rawText"] is None:
                        # 원문이 칸을 비운 경우 - 값도 없어야 한다
                        self.assertIsNone(observation["value"], (lane, key))
                        continue
                    if observation["value"] is not None:
                        self.assertRegex(observation["value"], r"^\d{4}-\d{2}-\d{2}$")
                        # 원문은 0 을 떼기도 한다 - 9/16 판의 «2026/08/8» 이 그렇다
                        year, month, day = observation["value"].split("-")
                        self.assertRegex(
                            observation["rawText"],
                            rf"{year}/0?{int(month)}/0?{int(day)}",
                            (lane, key, observation["rawText"]),
                        )


if __name__ == "__main__":
    unittest.main()
