"""Regression tests for the source-faithful GMTS monthly report normalizer."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from build_gmts_monthly import (  # noqa: E402
    check_funds_identity,
    check_profit_identity,
    parse_amount,
)


class ParseAmountTests(unittest.TestCase):
    def test_blank_and_dash_stay_null(self):
        self.assertIsNone(parse_amount(""))
        self.assertIsNone(parse_amount("  "))
        self.assertIsNone(parse_amount("-"))

    def test_parenthesis_means_negative(self):
        self.assertEqual(parse_amount("(1,516,746)"), -1_516_746.0)
        self.assertEqual(parse_amount("3,269,442"), 3_269_442.0)

    def test_source_comma_typo_still_parses(self):
        # 2월 KFC 영업이익 is printed "(9,29,959)" in the deck.
        self.assertEqual(parse_amount("(9,29,959)"), -929_959.0)


class IdentityCheckTests(unittest.TestCase):
    def test_profit_identity_flags_only_real_gaps(self):
        flags: list[dict] = []
        values = [100.0, 40.0, 60.0, 10.0, 50.0, -5.0, None, 45.0]
        check_profit_identity(values, flags, "ok")
        self.assertEqual(flags, [])

        check_profit_identity([100.0, 40.0, 70.0, 10.0, 60.0, None, None, 60.0], flags, "bad")
        self.assertEqual([flag["code"] for flag in flags], ["PROFIT_IDENTITY_MISMATCH"])
        self.assertIn("매출총이익", flags[0]["where"])

    def test_funds_identity_uses_printed_subtotals(self):
        flags: list[dict] = []
        record = {
            "cash": 1_234.0,
            "deposit": 225_301.0,
            "receivable": 5_854_232.0,
            "assetSubtotal": 6_080_767.0,
            "toSilla": 127_146.0,
            "toGmts": None,
            "toOthers": 2_684_179.0,
            "debtSubtotal": 2_811_325.0,
            "netBalance": 3_269_442.0,
        }
        check_funds_identity(record, flags, "GMTS")
        self.assertEqual(flags, [])

        record["netBalance"] = 3_269_500.0
        check_funds_identity(record, flags, "GMTS-off")
        self.assertEqual([flag["code"] for flag in flags], ["FUNDS_IDENTITY_MISMATCH"])


if __name__ == "__main__":
    unittest.main()
