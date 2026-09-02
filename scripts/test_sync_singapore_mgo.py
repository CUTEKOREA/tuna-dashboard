#!/usr/bin/env python3
"""sync_singapore_mgo.py 자기점검 — 파싱·화요일 정렬·보간 금지."""
import unittest

from sync_singapore_mgo import build_payload, parse_daily, weekly_on_tuesday

FIXTURE = {
    "api": {"SG SIN": {"data": {
        # daynum → epoch(ms). 2026-08-31(월) 부터 2026-09-04(금)까지, 9/2(수) 는 휴장으로 뺀다.
        "day_list": {"MGO": {"1": 1788134400000, "2": 1788220800000, "4": 1788393600000, "5": 1788480000000, "9": 1788825600000}},
        "prices": {"MGO": {"dayprice": [[1, 1192.5], [2, 1222.5], [4, 1230.0], [5, None], [9, 1240.0]]}},
    }}},
    "message": {"code": 200},
}


class ParseTests(unittest.TestCase):
    def test_daily_skips_null_and_sorts(self):
        daily = parse_daily(FIXTURE)
        self.assertEqual(daily, [["2026-08-31", 1192.5], ["2026-09-01", 1222.5], ["2026-09-03", 1230.0], ["2026-09-08", 1240.0]])

    def test_weekly_uses_tuesday_or_previous_business_day(self):
        weekly = weekly_on_tuesday(parse_daily(FIXTURE))
        self.assertEqual(weekly, [["2026-09-01", 1222.5, "2026-09-01"], ["2026-09-08", 1240.0, "2026-09-08"]])

    def test_weekly_falls_back_at_most_four_days(self):
        daily = [["2026-08-27", 1129.5], ["2026-09-08", 1240.0]]  # 9/1(화) 직전 영업일이 8/27 — 5일 전이라 버린다
        self.assertEqual(weekly_on_tuesday(daily), [["2026-09-08", 1240.0, "2026-09-08"]])

    def test_payload_refuses_short_series(self):
        with self.assertRaises(SystemExit):
            build_payload(FIXTURE, "2026-09-02T00:00:00Z")


if __name__ == "__main__":
    unittest.main()
