#!/usr/bin/env python3

from __future__ import annotations

import importlib.util
from pathlib import Path
import tempfile
import unittest

from openpyxl import Workbook
from openpyxl.utils import column_index_from_string


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'scripts' / 'sync_reefer_weekly.py'
SPEC = importlib.util.spec_from_file_location('sync_reefer_weekly', SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError('운반선 동기화 모듈을 불러올 수 없습니다')
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def workbook(path: Path, *, drift: bool = False, total: int = 3) -> Path:
    book = Workbook()
    sheet = book.active
    sheet.title = 'WEEK 33'
    sheet['A1'] = 'REEFER MOVEMENT FOR  14/08/26 - 20/08/26'
    sheet['AJ2'] = 33
    for column, header in MODULE.EXPECTED_DESTINATION_HEADERS.items():
        sheet.cell(6, column_index_from_string(column), header)
    if drift:
        sheet['G6'] = 'ASIAN'
    sheet['A7'] = 'TEST REEFER'
    sheet['B7'] = '19.08.26'
    sheet['F7'] = 1
    sheet['G7'] = 2
    sheet['AI7'] = total
    sheet['AJ7'] = '33B'
    sheet['A8'] = 'SONGKHLA PORT :-'
    book.save(path)
    return path


class ReeferWeeklySyncTest(unittest.TestCase):
    def test_parses_a_valid_bangkok_row(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            path = workbook(Path(temporary) / 'Reefer ship movement for week 33rd.xlsx')
            week, start, end, rows, total = MODULE.parse_workbook(path)
            self.assertEqual((week, start, end), (33, '2026-08-14', '2026-08-20'))
            self.assertEqual(total, 3)
            self.assertEqual(rows[0]['deliveries'], {'ASIAN': '1', 'AEC': '2', 'OTHER': '33B'})

    def test_duplicate_or_shifted_headers_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            path = workbook(Path(temporary) / 'Reefer ship movement for week 33rd.xlsx', drift=True)
            with self.assertRaisesRegex(ValueError, 'G6'):
                MODULE.parse_workbook(path)

    def test_source_total_mismatch_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            path = workbook(Path(temporary) / 'Reefer ship movement for week 33rd.xlsx', total=4)
            with self.assertRaisesRegex(ValueError, '배분 합계 불일치'):
                MODULE.parse_workbook(path)

if __name__ == '__main__':
    unittest.main()
