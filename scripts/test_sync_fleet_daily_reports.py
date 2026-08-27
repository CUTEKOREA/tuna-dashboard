#!/usr/bin/env python3
"""Synthetic DOCX contract tests for the fleet daily report sync."""

from __future__ import annotations

import json
import importlib.util
import subprocess
import sys
import tempfile
import unicodedata
import unittest
import zipfile
from datetime import date, timedelta
from pathlib import Path
from unittest import mock
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
SYNC_SCRIPT = ROOT / "scripts" / "sync_fleet_daily_reports.py"


def load_sync_module():
    spec = importlib.util.spec_from_file_location("fleet_daily_sync", SYNC_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError("fleet daily sync module을 불러올 수 없습니다")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def paragraph(text: str) -> str:
    return f"<w:p><w:r><w:t>{escape(text)}</w:t></w:r></w:p>"


def cell(text: str) -> str:
    return f"<w:tc>{paragraph(text)}</w:tc>"


def table(rows: list[list[str]]) -> str:
    return "<w:tbl>" + "".join(
        "<w:tr>" + "".join(cell(value) for value in row) + "</w:tr>"
        for row in rows
    ) + "</w:tbl>"


def write_docx(path: Path, blocks: list[str | list[list[str]]]) -> None:
    body = "".join(
        paragraph(block) if isinstance(block, str) else table(block)
        for block in blocks
    )
    document = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        f"<w:body>{body}</w:body></w:document>"
    )
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("word/document.xml", document)


def report_tables(*, daily: int, atlantic_daily: int, mismatch: bool = False, invalid_coordinate: bool = False, duplicate_vessel: bool = False) -> list[list[list[str]]]:
    pacific_rows = [
        ["선박", "위치", "어획량", "선적량", "비고"],
        *([["S/EXP", "N0155 W15730 (KI)", "20", "100(5)", "이전 중복 행"]] if duplicate_vessel else []),
        ["S/EXP", "N0155 W15730 (KI)", f"{daily}(3)", "100(5)", "최신 상세만 보관"],
        ["S/PIO", "N0324 W16452 (H)" if not invalid_coordinate else "N999 W1 (H)", "-", "-", "좌표 형식 이상"],
    ]
    atlantic_rows = [
        ["선박", "위치", "어획량", "선적량", "비고"],
        ["P/MAS", "S0338 W01119 (H)", str(atlantic_daily), "300", ""],
    ]
    carrier_total = "1000(10)" if not mismatch else "1001(10)"
    carrier_rows = [
        ["선박", "선적량", "예상잔량", "선적 현황", "비고"],
        ["합계", carrier_total, "500", "", ""],
        ["CARRIER A", "600", "200", "", ""],
        ["CARRIER B", "400", "(300)", "", ""],
    ]
    longline_rows = [
        ["선 박", "선적량", "비 고"],
        ["TEST LONGLINE A", "(338.699톤 (TEST-A, TEST-B))", "8/12 시험항 입항, 8/21 하역 예정"],
        ["TEST LONGLINE B", "-", "8/19~22 시험항 휴게 입항 예정"],
    ]
    return [pacific_rows, carrier_rows, atlantic_rows, longline_rows]


class FleetDailyReportSyncTest(unittest.TestCase):
    def test_fishing_hold_capacity_registry_preserves_source_units(self) -> None:
        module = load_sync_module()
        capacity_of = getattr(module, 'fishing_hold_capacity', lambda _name: None)

        self.assertEqual(capacity_of('S/SPR'), {
            'value': 1200,
            'unit': 'MT',
            'source': 'FFA VRST',
            'asOf': '2026-08-14',
        })
        self.assertEqual(capacity_of('NAOERO SUN'), {
            'value': 1614,
            'unit': '㎥',
            'source': 'FFA VRST',
            'asOf': '2026-08-14',
        })
        self.assertEqual(capacity_of('P/DIS'), {
            'value': 3114.85,
            'unit': '㎥',
            'source': 'ICCAT',
            'asOf': '2026-08-21',
        })
        self.assertIsNone(capacity_of('UNKNOWN VESSEL'))

    def test_detail_digest_compat_rolls_only_the_previous_generation(self) -> None:
        module = load_sync_module()
        compatible = getattr(module, 'compatible_detail_sha256', lambda _public, _current: [])
        previous = {
            '_meta': {
                'detailSha256': 'a' * 64,
                'detailSha256Compat': ['z' * 64],
            },
        }

        self.assertEqual(compatible(previous, 'b' * 64), ['a' * 64])
        self.assertEqual(compatible({
            '_meta': {
                'detailSha256': 'b' * 64,
                'detailSha256Compat': ['a' * 64],
            },
        }, 'b' * 64), ['a' * 64])

    def test_parse_amount_preserves_an_approximate_tonnage(self) -> None:
        module = load_sync_module()

        amount = module.parse_amount("(약 300톤)")

        self.assertEqual(amount.raw, "(약 300톤)")
        self.assertEqual(amount.value, 300)
        self.assertIsNone(amount.parenthetical)

    def run_sync(self, source_dir: Path, output: Path, *extra: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(SYNC_SCRIPT), "--source-dir", str(source_dir), "--output", str(output), *extra],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )

    def test_default_source_dir_matches_requested_google_drive_folder(self) -> None:
        module = load_sync_module()
        with tempfile.TemporaryDirectory() as temporary_directory:
            home = Path(temporary_directory)
            source_dir = home / "Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/11. 태국/001. (매일)해양수산본부일일업무보고"
            source_dir.mkdir(parents=True)

            with mock.patch.object(module.Path, "home", return_value=home):
                self.assertEqual(module.default_source_dir(), source_dir)

    def test_iter_reports_ignores_unrelated_docx_in_mixed_source_folder(self) -> None:
        module = load_sync_module()
        with tempfile.TemporaryDirectory() as temporary_directory:
            source_dir = Path(temporary_directory)
            daily_report = source_dir / "해양수산본부 일일업무보고-260818 (화).docx"
            unrelated_report = source_dir / "211020_GMTS 주간보고.docx"
            daily_report.write_bytes(b"daily")
            unrelated_report.write_bytes(b"weekly")

            reports = module.iter_reports(source_dir)

            self.assertEqual(reports, [("2026-08-18", daily_report)])

    def test_iter_reports_rejects_malformed_daily_report_filename(self) -> None:
        module = load_sync_module()
        with tempfile.TemporaryDirectory() as temporary_directory:
            source_dir = Path(temporary_directory)
            malformed_report = source_dir / "해양수산본부 일일업무보고-날짜없음.docx"
            malformed_report.write_bytes(b"daily")

            with self.assertRaises(module.FleetDailySyncError):
                module.iter_reports(source_dir)

    def test_iter_reports_applies_bounded_2026_coverage_start(self) -> None:
        module = load_sync_module()
        with tempfile.TemporaryDirectory() as temporary_directory:
            source_dir = Path(temporary_directory)
            archived_report = source_dir / "해양수산본부 일일업무보고-251231 (수).docx"
            covered_report = source_dir / "해양수산본부 일일업무보고-260116 (금).docx"
            archived_report.write_bytes(b"old")
            covered_report.write_bytes(b"covered")

            reports = module.iter_reports(source_dir)

            self.assertEqual(reports, [("2026-01-16", covered_report)])

    def test_iter_reports_merges_explicit_additional_report_with_base_history(self) -> None:
        module = load_sync_module()
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary = Path(temporary_directory)
            source_dir = temporary / "history"
            source_dir.mkdir()
            history_report = source_dir / "해양수산본부 일일업무보고-260814 (금).docx"
            additional_report = temporary / "해양수산본부 일일업무보고-260818 (화).docx"
            history_report.write_bytes(b"history")
            additional_report.write_bytes(b"new")

            reports = module.iter_reports(source_dir, [additional_report])

            self.assertEqual(
                reports,
                [
                    ("2026-08-14", history_report),
                    ("2026-08-18", additional_report),
                ],
            )

    def test_incremental_public_payload_advances_without_reopening_history(self) -> None:
        module = load_sync_module()
        previous_public = {
            "_meta": {
                "schemaVersion": 1,
                "reportCount": 2,
                "firstReportDate": "2026-08-13",
                "latestReportDate": "2026-08-14",
                "latestAsOf": "2026-08-13",
                "detailSha256": "a" * 64,
            },
            "latest": {
                "reportDate": "2026-08-14",
                "asOf": "2026-08-13",
                "pacific": {"asOf": "2026-08-13", "dailyMt": 85, "monthlyMt": 100, "annualMt": 1000},
                "atlantic": {"asOf": "2026-08-13", "dailyMt": 170, "monthlyMt": 200, "annualMt": 2000},
                "carrier": {"loadedTotalMt": 600, "expectedRemainingMt": 400},
            },
            "deltas": {"pacificDailyMt": 0, "atlanticDailyMt": 0, "totalDailyMt": 0},
            "reconciliation": {},
            "quality": {
                "counts": {
                    "reconciliationChecks": 8,
                    "reconciliationCompleteChecks": 8,
                    "reconciliationUnavailableChecks": 0,
                    "reconciliationUnavailableDocuments": 0,
                    "reconciliationIssues": 0,
                    "reconciliationDocuments": 0,
                    "reconciliationPartialDifferences": 0,
                    "reconciliationPartialDifferenceDocuments": 0,
                    "duplicateVesselRows": 0,
                    "coordinateFormatIssues": 0,
                    "longlineSectionMissing": 0,
                },
                "incompletePartialDifferences": 0,
                "incompletePartialDifferenceDocuments": 0,
            },
        }
        report = {
            "reportDate": "2026-08-15",
            "asOf": "2026-08-14",
            "pacific": {"asOf": "2026-08-14", "dailyMt": 100, "monthlyMt": 200, "annualMt": 1100, "vessels": []},
            "atlantic": {"asOf": "2026-08-14", "dailyMt": 160, "monthlyMt": 300, "annualMt": 2160, "vessels": []},
            "carrier": {
                "loadedTotalMt": 700,
                "loadedTotalMtRaw": "700",
                "loadedTotalParentheticalMt": None,
                "expectedRemainingMt": 300,
                "expectedRemainingMtRaw": "300",
                "expectedRemainingParentheticalMt": None,
                "vessels": [],
            },
            "longline": {"vessels": []},
        }
        issues = {
            "reconciliationChecks": [
                module.reconciliation_check("2026-08-15", "pacific.dailyMt", 100, [100]),
                module.reconciliation_check("2026-08-15", "atlantic.dailyMt", 160, [160]),
                module.reconciliation_check("2026-08-15", "carrier.loadedMt", 700, [700]),
                module.reconciliation_check("2026-08-15", "carrier.expectedRemainingMt", 300, [300]),
            ],
            "duplicateVessel": [],
            "coordinate": [],
            "longlineMissing": [],
        }

        result = module.build_incremental_public_payload(previous_public, report, issues, "b" * 64)

        self.assertEqual(result["_meta"], {
            "schemaVersion": 1,
            "reportCount": 3,
            "firstReportDate": "2026-08-13",
            "latestReportDate": "2026-08-15",
            "latestAsOf": "2026-08-14",
            "detailSha256": "b" * 64,
            "detailSha256Compat": ["a" * 64],
        })
        self.assertEqual(result["deltas"], {
            "pacificDailyMt": 15,
            "atlanticDailyMt": -10,
            "totalDailyMt": 5,
        })
        self.assertEqual(result["quality"]["counts"]["reconciliationChecks"], 12)
        self.assertEqual(result["quality"]["counts"]["reconciliationCompleteChecks"], 12)
        self.assertTrue(result["reconciliation"]["valid"])

        stale = {**report, "reportDate": "2026-08-14"}
        with self.assertRaises(module.FleetDailySyncError):
            module.build_incremental_public_payload(previous_public, stale, issues, "b" * 64)

    def test_latest_report_cli_updates_public_and_detail_without_rebuilding_private_history(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary = Path(temporary_directory)
            previous_public = json.loads(
                (ROOT / "lib/data/generated/fleet-daily-public.json").read_text(encoding="utf-8")
            )
            previous_count = previous_public["_meta"]["reportCount"]
            report_date = date.fromisoformat(previous_public["_meta"]["latestReportDate"]) + timedelta(days=1)
            as_of = report_date - timedelta(days=1)
            report_path = temporary / f"해양수산본부 일일업무보고-{report_date:%y%m%d} (테스트).docx"
            tables = report_tables(daily=100, atlantic_daily=160)
            write_docx(
                report_path,
                [
                    f"BB. 태평양 선망 : {as_of.month}/{as_of.day} (일간: 100톤 / 월간 누계: 2,500톤 / 연간 누계: 50,000톤)",
                    tables[0],
                    "운반선 선적 현황",
                    tables[1],
                    f"CC. 대서양 선망 : {as_of.month}/{as_of.day} (일간: 160톤 / 월간 누계: 3,500톤 / 연간 누계: 30,000톤)",
                    tables[2],
                    "AA. 연승",
                    tables[3],
                ],
            )
            public_output = temporary / "fleet-daily-public.json"
            detail_output = temporary / "fleet-daily-detail.json"
            private_output = temporary / "fleet-daily-private.json"
            public_output.write_text(json.dumps(previous_public, ensure_ascii=False), encoding="utf-8")

            result = subprocess.run(
                [
                    sys.executable,
                    str(SYNC_SCRIPT),
                    "--latest-report",
                    str(report_path),
                    "--output",
                    str(private_output),
                    "--public-output",
                    str(public_output),
                    "--detail-output",
                    str(detail_output),
                ],
                cwd=ROOT,
                check=False,
                capture_output=True,
                text=True,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertFalse(private_output.exists())
            updated_public = json.loads(public_output.read_text(encoding="utf-8"))
            updated_detail = json.loads(detail_output.read_text(encoding="utf-8"))
            self.assertEqual(updated_public["_meta"]["reportCount"], previous_count + 1)
            self.assertEqual(updated_public["_meta"]["latestReportDate"], report_date.isoformat())
            self.assertEqual(updated_detail["reportDate"], report_date.isoformat())

            stale_result = subprocess.run(
                [
                    sys.executable,
                    str(SYNC_SCRIPT),
                    "--latest-report",
                    str(report_path),
                    "--public-output",
                    str(public_output),
                    "--detail-output",
                    str(detail_output),
                ],
                cwd=ROOT,
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(stale_result.returncode, 1)
            self.assertIn("기존 최신일", stale_result.stderr)

    def test_reconciliation_check_ignores_sub_milliton_float_noise(self) -> None:
        module = load_sync_module()
        check = module.reconciliation_check(
            "2026-08-14",
            "pacific.dailyMt",
            0.3,
            [0.1, 0.2, None],
        )
        self.assertEqual(check["status"], "incompleteUnavailable")

    def test_syncs_nfc_nfd_reports_by_filename_date_and_preserves_quality_issues(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary = Path(temporary_directory)
            source_dir = temporary / "source"
            source_dir.mkdir()
            output = temporary / "fleet-daily.json"

            write_docx(
                source_dir / unicodedata.normalize("NFD", "해양수산본부 일일업무보고-260814 (금).docx"),
                [
                    "AA. 연승",
                    report_tables(daily=130, atlantic_daily=205, mismatch=True, invalid_coordinate=True, duplicate_vessel=True)[3],
                    "BB. 태평양 선망 : 8/13 (일간: 130톤 / 월간 누계: 1,947톤 / 연간 누계: 46,779.8톤)",
                    report_tables(daily=130, atlantic_daily=205, mismatch=True, invalid_coordinate=True, duplicate_vessel=True)[0],
                    "운반선 선적 현황",
                    report_tables(daily=130, atlantic_daily=205, mismatch=True, invalid_coordinate=True, duplicate_vessel=True)[1],
                    "CC. 대서양 선망 : 8/13 (일간: 205톤 / 월간 누계: 2,010톤 / 연간 누계: 28,735톤)",
                    report_tables(daily=130, atlantic_daily=205, mismatch=True, invalid_coordinate=True, duplicate_vessel=True)[2],
                ],
            )
            write_docx(
                source_dir / "해양수산본부 일일업무보고-260813 (목).docx",
                [
                    "BB. 태평양 선망 : 8/12 (일간: 85톤 / 월간 누계: 1,817톤 / 연간 누계: 46,649.8톤)",
                    report_tables(daily=85, atlantic_daily=170)[0],
                    "운반선 선적 현황",
                    report_tables(daily=85, atlantic_daily=170)[1],
                    "CC. 대서양 선망 : 8/12 (일간: 170톤 / 월간 누계: 1,805톤 / 연간 누계: 28,530톤)",
                    report_tables(daily=85, atlantic_daily=170)[2],
                ],
            )

            result = self.run_sync(source_dir, output)

            self.assertEqual(result.returncode, 0, result.stderr)
            payload = json.loads(output.read_text(encoding="utf-8"))
            public_payload = json.loads((temporary / "fleet-daily-public.json").read_text(encoding="utf-8"))
            detail_payload = json.loads((temporary / "fleet-daily-detail.json").read_text(encoding="utf-8"))
            self.assertEqual(payload["_meta"]["reportCount"], 2)
            self.assertEqual(payload["_meta"]["latestReportDate"], "2026-08-14")
            self.assertEqual([row["reportDate"] for row in payload["daily"]], ["2026-08-13", "2026-08-14"])
            self.assertEqual(payload["latest"]["asOf"], "2026-08-13")
            self.assertEqual(payload["latest"]["pacific"]["dailyMt"], 130)
            self.assertEqual(payload["latest"]["atlantic"]["annualMt"], 28735)
            self.assertEqual(payload["latest"]["pacific"]["vessels"][0]["loadedMt"], 100)
            self.assertEqual(payload["latest"]["pacific"]["vessels"][0]["catchMt"], 20)
            self.assertEqual(payload["latest"]["pacific"]["vessels"][0]["catchMtRaw"], "20")
            self.assertIsNone(payload["latest"]["pacific"]["vessels"][0]["catchMtParenthetical"])
            self.assertEqual(payload["latest"]["pacific"]["vessels"][1]["catchMt"], 130)
            self.assertEqual(payload["latest"]["pacific"]["vessels"][1]["catchMtRaw"], "130(3)")
            self.assertEqual(payload["latest"]["pacific"]["vessels"][1]["catchMtParenthetical"], 3)
            self.assertEqual(payload["latest"]["pacific"]["vessels"][0]["loadedMtRaw"], "100(5)")
            self.assertEqual(payload["latest"]["pacific"]["vessels"][0]["loadedMtParenthetical"], 5)
            self.assertEqual(payload["latest"]["pacific"]["vessels"][2]["catchMt"], 0)
            self.assertEqual(payload["latest"]["pacific"]["vessels"][2]["catchMtRaw"], "-")
            self.assertEqual(payload["latest"]["carrier"]["loadedTotalMt"], 1001)
            self.assertEqual(payload["latest"]["carrier"]["loadedTotalParentheticalMt"], 10)
            self.assertEqual(payload["latest"]["carrier"]["vessels"][1]["expectedRemainingMt"], 300)
            self.assertIsNone(payload["latest"]["carrier"]["vessels"][1]["expectedRemainingParentheticalMt"])
            self.assertTrue(all(vessel["entityType"] == "vessel" for vessel in payload["latest"]["carrier"]["vessels"]))
            self.assertEqual(payload["latest"]["longline"]["vessels"], [
                {
                    "name": "TEST LONGLINE A",
                    "loadedMt": 338.699,
                    "loadedMtRaw": "(338.699톤(TEST-A,TEST-B))",
                    "loadedMtParenthetical": None,
                    "note": "8/12 시험항 입항, 8/21 하역 예정",
                },
                {
                    "name": "TEST LONGLINE B",
                    "loadedMt": 0,
                    "loadedMtRaw": "-",
                    "loadedMtParenthetical": None,
                    "note": "8/19~22 시험항 휴게 입항 예정",
                },
            ])
            self.assertNotIn("longline", payload["previous"])
            self.assertNotIn("longline", payload["daily"][0])
            self.assertEqual(payload["previous"]["pacific"]["dailyMt"], 85)
            self.assertNotIn("vessels", payload["previous"]["pacific"])
            self.assertNotIn("vessels", payload["daily"][0])
            self.assertEqual(payload["quality"]["duplicateVesselRows"], ["2026-08-14"])
            self.assertEqual(payload["quality"]["longlineSectionMissing"], ["2026-08-13"])
            self.assertEqual(payload["quality"]["coordinateFormatIssues"], ["2026-08-14"])
            self.assertEqual(len(payload["quality"]["reconciliationChecks"]), 8)
            self.assertEqual(
                [(check["reportDate"], check["field"], check["missingCount"], check["status"]) for check in payload["quality"]["reconciliationChecks"]],
                [
                    ("2026-08-13", "pacific.dailyMt", 0, "completeMatch"),
                    ("2026-08-13", "atlantic.dailyMt", 0, "completeMatch"),
                    ("2026-08-13", "carrier.loadedMt", 0, "completeMatch"),
                    ("2026-08-13", "carrier.expectedRemainingMt", 0, "completeMatch"),
                    ("2026-08-14", "pacific.dailyMt", 0, "completeMismatch"),
                    ("2026-08-14", "atlantic.dailyMt", 0, "completeMatch"),
                    ("2026-08-14", "carrier.loadedMt", 0, "completeMismatch"),
                    ("2026-08-14", "carrier.expectedRemainingMt", 0, "completeMatch"),
                ],
            )
            self.assertEqual(payload["quality"]["counts"], {
                "reconciliationChecks": 8,
                "reconciliationCompleteChecks": 8,
                "reconciliationUnavailableChecks": 0,
                "reconciliationUnavailableDocuments": 0,
                "reconciliationIssues": 2,
                "reconciliationDocuments": 1,
                "reconciliationPartialDifferences": 2,
                "reconciliationPartialDifferenceDocuments": 1,
                "duplicateVesselRows": 1,
                "coordinateFormatIssues": 1,
                "longlineSectionMissing": 1,
            })

            self.assertEqual(public_payload["_meta"]["reportCount"], 2)
            self.assertEqual(public_payload["_meta"]["detailSha256"], load_sync_module().canonical_sha256(detail_payload))
            self.assertEqual(public_payload["latest"]["pacific"]["dailyMt"], 130)
            self.assertEqual(public_payload["deltas"], {
                "pacificDailyMt": 45,
                "atlanticDailyMt": 35,
                "totalDailyMt": 80,
            })
            self.assertNotIn("vessels", public_payload["latest"]["pacific"])
            self.assertNotIn("daily", public_payload)
            self.assertNotIn("reconciliationChecks", public_payload["quality"])

            self.assertEqual(detail_payload["reportDate"], "2026-08-14")
            self.assertEqual(detail_payload["pacific"]["vessels"][0].get("holdCapacity"), {
                "value": 1300,
                "unit": "MT",
                "source": "FFA VRST",
                "asOf": "2026-08-14",
            })
            self.assertEqual(detail_payload["atlantic"]["vessels"][0].get("holdCapacity"), {
                "value": 2817.52,
                "unit": "㎥",
                "source": "ICCAT",
                "asOf": "2026-08-21",
            })
            self.assertEqual(detail_payload["longline"]["vessels"][0], {
                "name": "TEST LONGLINE A",
                "loadedMt": 338.699,
                "note": "8/12 시험항 입항, 8/21 하역 예정",
            })
            self.assertNotIn("daily", detail_payload)
            self.assertNotIn("quality", detail_payload)
            self.assertNotIn("loadedMtRaw", detail_payload["longline"]["vessels"][0])

            check = self.run_sync(source_dir, output, "--check")
            self.assertEqual(check.returncode, 0, check.stderr)


class ParseAmountDashIsZero(unittest.TestCase):
    def test_dash_and_blank_are_zero_tons(self):
        module = load_sync_module()
        dash = module.parse_amount("-")
        blank = module.parse_amount("")
        self.assertEqual(dash.raw, "-")
        self.assertEqual(dash.value, 0)
        self.assertIsNone(dash.parenthetical)
        self.assertEqual(blank.value, 0)
        self.assertEqual(blank.raw, "-")


if __name__ == "__main__":
    unittest.main()
