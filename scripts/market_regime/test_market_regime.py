"""Fixture integration tests; all output snapshots stay in memory."""
import copy
import json
import socket
import unittest
from contextlib import ExitStack
from pathlib import Path
from unittest.mock import patch

import market_regime as mr

FIXTURES = Path(__file__).resolve().parent / "fixtures"


class MarketRegimeTests(unittest.TestCase):
    def setUp(self):
        self.stack = ExitStack()
        self.addCleanup(self.stack.close)
        self.previous = None
        self.saved = None
        self.stack.enter_context(patch.object(
            mr, "_load_previous", side_effect=lambda path: copy.deepcopy(self.previous)))
        self.stack.enter_context(patch.object(
            mr, "_save_document", side_effect=self.save))
        self.network = [
            self.stack.enter_context(patch.object(
                mr, "_request", side_effect=AssertionError("network forbidden"))),
            self.stack.enter_context(patch.object(
                socket, "create_connection",
                side_effect=AssertionError("network forbidden"))),
            self.stack.enter_context(patch.object(
                mr.urllib.request.OpenerDirector, "open",
                side_effect=AssertionError("network forbidden"))),
        ]

    def save(self, path, document):
        self.saved = json.loads(json.dumps(document, ensure_ascii=False, allow_nan=False))

    def collect(self):
        result = mr.main("unused-in-memory.json", FIXTURES)
        self.assertEqual(result, self.saved)
        for spy in self.network:
            spy.assert_not_called()
        return result

    def metric(self, document, commodity, metric_id):
        rows = document["common"] if commodity == "common" else document["commodities"][commodity]
        return next(row for row in rows if row["id"] == metric_id)

    def test_harvest_latest_week_and_incomplete_baseline(self):
        doc = self.collect()
        row = self.metric(doc, "corn", "us_harvest_progress")
        self.assertEqual(row["value"], 23)
        self.assertEqual(row["asof"], "2026-10-04")
        self.assertIsNone(row["baseline"])
        self.assertIsNone(row["delta"])
        self.assertEqual(row["context"]["baseline_missing_years"], [2025])

    def test_good_excellent_same_week(self):
        row = self.metric(self.collect(), "corn", "us_good_excellent")
        self.assertEqual(row["value"], 54)
        self.assertEqual(row["asof"], "2026-10-04")

    def test_cftc_latest_long_minus_short(self):
        source = json.loads((FIXTURES / "cftc_corn.json").read_bytes())
        latest = max(source, key=lambda row: row["report_date_as_yyyy_mm_dd"])
        want = int(latest["m_money_positions_long_all"]) - int(latest["m_money_positions_short_all"])
        row = self.metric(self.collect(), "corn", "managed_money_net")
        self.assertEqual(row["value"], want)
        self.assertEqual(row["asof"], latest["report_date_as_yyyy_mm_dd"][:10])

    def test_worldbank_month_and_unit(self):
        row = self.metric(self.collect(), "corn", "wb_maize_price")
        self.assertEqual(row["value"], 239.6)
        self.assertEqual(row["unit"], "USD/metric_ton")
        self.assertEqual(row["period"], {
            "type": "month", "start": "2026-09-01", "end": "2026-09-30"})

    def test_garlic_source_values_and_dimensions(self):
        doc = self.collect()
        for metric_id, want in [
            ("retail_price", 10682), ("normal_price", 11282),
            ("normal_change_pct", -5.3), ("year_change_pct", -5.8),
        ]:
            row = self.metric(doc, "garlic", metric_id)
            self.assertEqual(row["value"], want)
            self.assertEqual(row["asof"], "2026-10-12")
            self.assertEqual(row["context"]["grade"], "상품")
            self.assertEqual(row["context"]["source_unit"], "1kg")

    def test_noaa_scoped_rows_zero_and_report_date(self):
        rows = self.collect()["commodities"]["pollock"]
        self.assertEqual(len(rows), 27)
        for row in rows:
            self.assertEqual(row["asof"], "2026-10-03")
            if row["value"] is not None:
                self.assertIsInstance(row["value"], (int, float))
        inshore = [r for r in rows if r["context"]["account"] == "Pollock, AFA Inshore"]
        self.assertEqual(next(r["value"] for r in inshore if r["unit"] == "metric_ton" and "_catch_" in r["id"]), 509567)
        self.assertEqual(next(r["value"] for r in inshore if "_quota_" in r["id"]), 602050)
        zero = [r for r in rows if r["context"]["account"] == "Pollock"
                and r["context"]["geography"] == "Aleutian Islands"]
        self.assertEqual(next(r["value"] for r in zero if "_catch_" in r["id"]), 0)
        ratio = next(r for r in zero if "_utilization_" in r["id"])
        self.assertIsNone(ratio["value"])
        self.assertEqual(ratio["status"], "no_value")

    def test_oni_latest_three_month_anomaly(self):
        last = (FIXTURES / "oni.txt").read_text().strip().splitlines()[-1].split()
        row = self.metric(self.collect(), "common", "enso_oni")
        self.assertEqual(row["value"], float(last[-1]))
        self.assertEqual(row["context"]["season"], last[0])
        self.assertEqual(row["period"], {
            "type": "three_month", "start": "2026-07-01", "end": "2026-09-30"})

    def test_failure_and_empty_result_preserve_last_value(self):
        self.previous = self.collect()
        original = self.metric(self.previous, "corn", "us_harvest_progress")
        for failing in [OSError("not retained"), RuntimeError("not retained"), []]:
            kwargs = {"side_effect": failing} if isinstance(failing, Exception) else {"return_value": failing}
            with patch.object(mr, "parse_nass_progress", **kwargs):
                current = self.collect()
            row = self.metric(current, "corn", "us_harvest_progress")
            self.assertEqual(row["status"], "stale")
            for key in ["value", "asof", "source_url", "baseline", "delta", "last_success_at"]:
                self.assertEqual(row[key], original[key])
            self.assertEqual(self.metric(current, "corn", "us_good_excellent")["status"], "ok")

    def test_empty_result_without_previous_is_failure(self):
        with patch.object(mr, "parse_cftc_disagg", return_value=[]):
            row = self.metric(self.collect(), "corn", "managed_money_net")
        self.assertIsNone(row["value"])
        self.assertEqual(row["status"], "no_data")
        self.assertEqual(row["fetch_state"], "empty_result")

    def test_partial_garlic_failure_is_per_indicator(self):
        self.previous = self.collect()
        original = mr.parse_oasis_retail_csv
        def partial(raw):
            rows = original(raw)
            rows[1]["value"] = None
            rows[1]["status"] = "no_data"
            rows[1]["missing_reason"] = "not_published"
            return rows
        with patch.object(mr, "parse_oasis_retail_csv", side_effect=partial):
            doc = self.collect()
        self.assertEqual(self.metric(doc, "garlic", "normal_price")["status"], "stale")
        self.assertEqual(self.metric(doc, "garlic", "normal_price")["value"], 11282)
        self.assertEqual(self.metric(doc, "garlic", "retail_price")["status"], "ok")

    def test_noaa_failure_preserves_dynamic_ids(self):
        self.previous = self.collect()
        with patch.object(mr, "parse_noaa_bsai_catch", return_value=[]):
            rows = self.collect()["commodities"]["pollock"]
        previous_numbers = [r for r in self.previous["commodities"]["pollock"] if r["value"] is not None]
        for old in previous_numbers:
            row = next(r for r in rows if r["id"] == old["id"])
            self.assertEqual(row["status"], "stale")
            self.assertEqual(row["value"], old["value"])
            self.assertEqual(row["context"], old["context"])

    def test_complete_five_year_baseline_only(self):
        source = json.loads((FIXTURES / "nass_corn_progress.json").read_bytes())
        sample = copy.deepcopy(next(r for r in source["data"] if r["year"] == 2026 and r["begin_code"] == "40"))
        sample.update(year=2025, week_ending="2025-10-05", Value="24",
                      load_time="2025-10-06 16:00:00.000")
        source["data"].append(sample)
        row = mr.parse_nass_progress(json.dumps(source).encode())[0]
        self.assertEqual(row["baseline"]["years"], [2021, 2022, 2023, 2024, 2025])
        self.assertEqual(row["baseline"]["value"], 32)
        self.assertEqual(row["delta"]["value"], -9)

    def test_noaa_missing_values_never_estimated(self):
        raw = (FIXTURES / "noaa_bsai_2026.html").read_bytes()
        rows = mr.parse_noaa_bsai_catch(raw.replace(b"509,567", b""))
        row = next(r for r in rows if r["context"].get("account") == "Pollock, AFA Inshore"
                   and "_catch_" in r["id"])
        self.assertIsNone(row["value"])
        self.assertEqual(row["status"], "no_value")
        missing = mr.parse_noaa_bsai_catch(b"<html><body>no table</body></html>")
        self.assertTrue(missing)
        self.assertTrue(all(r["status"] == "no_value" for r in missing))

    def test_oni_year_boundary_periods(self):
        for season, year, start, end in [
            ("DJF", 2026, "2025-12-01", "2026-02-28"),
            ("NDJ", 2026, "2026-11-01", "2027-01-31"),
        ]:
            row = mr.parse_oni(f"SEAS YR TOTAL ANOM\n{season} {year} 27.0 0.0\n".encode())[0]
            self.assertEqual(row["value"], 0)
            self.assertEqual(row["period"]["start"], start)
            self.assertEqual(row["period"]["end"], end)

    def test_ipv4_resolver_is_restored(self):
        original = socket.getaddrinfo
        with patch.object(socket, "getaddrinfo", return_value=[]) as resolver:
            with mr._ipv4_only():
                socket.getaddrinfo("example.invalid", 443)
            self.assertIs(socket.getaddrinfo, resolver)
            self.assertEqual(resolver.call_args.args[2], socket.AF_INET)
        self.assertIs(socket.getaddrinfo, original)

    def test_nass_missing_key_never_calls_network(self):
        with patch.dict(mr.os.environ, {}, clear=True):
            with self.assertRaises(mr.CollectionError) as caught:
                mr.fetch_nass_progress()
        self.assertEqual(str(caught.exception), "CREDENTIALS_REQUIRED")
        self.network[0].assert_not_called()

    def test_schema_required_fields_and_no_credentials(self):
        doc = self.collect()
        required = {"id", "label", "value", "unit", "asof", "published_at", "period",
                    "baseline", "delta", "source_url", "status", "data_state",
                    "fetch_state", "freshness", "missing_reason", "last_attempt_at",
                    "last_success_at", "error_code", "context"}
        self.assertEqual(doc["schema_version"], "1.0")
        self.assertEqual(doc["collection_interval_days"], 14)
        for rows in list(doc["commodities"].values()) + [doc["common"]]:
            self.assertEqual(len(rows), len({r["id"] for r in rows}))
            for row in rows:
                self.assertTrue(required <= row.keys())
        with patch.dict(mr.os.environ, {"NASS_API_KEY": "DO_NOT_LEAK"}):
            with patch.object(mr, "parse_nass_progress", side_effect=ValueError("DO_NOT_LEAK")):
                failed = self.collect()
        self.assertNotIn("DO_NOT_LEAK", json.dumps(failed))
        self.assertNotIn("key=", json.dumps(failed))


if __name__ == "__main__":
    unittest.main()
