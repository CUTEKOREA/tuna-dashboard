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
            source_dir = home / "Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/11. 태국/해양수산본부 일일 업무보고"
            source_dir.mkdir(parents=True)

            with mock.patch.object(module.Path, "home", return_value=home):
                self.assertEqual(module.default_source_dir(), source_dir)

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
            self.assertIsNone(payload["latest"]["pacific"]["vessels"][2]["catchMt"])
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
                    "loadedMt": None,
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
                    ("2026-08-13", "pacific.dailyMt", 1, "incompleteUnavailable"),
                    ("2026-08-13", "atlantic.dailyMt", 0, "completeMatch"),
                    ("2026-08-13", "carrier.loadedMt", 0, "completeMatch"),
                    ("2026-08-13", "carrier.expectedRemainingMt", 0, "completeMatch"),
                    ("2026-08-14", "pacific.dailyMt", 1, "knownRowsExceedReported"),
                    ("2026-08-14", "atlantic.dailyMt", 0, "completeMatch"),
                    ("2026-08-14", "carrier.loadedMt", 0, "completeMismatch"),
                    ("2026-08-14", "carrier.expectedRemainingMt", 0, "completeMatch"),
                ],
            )
            self.assertEqual(payload["quality"]["counts"], {
                "reconciliationChecks": 8,
                "reconciliationCompleteChecks": 6,
                "reconciliationUnavailableChecks": 2,
                "reconciliationUnavailableDocuments": 2,
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


if __name__ == "__main__":
    unittest.main()
