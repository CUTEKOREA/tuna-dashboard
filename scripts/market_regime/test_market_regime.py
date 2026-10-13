
"""샘플 통합 테스트. 네트워크와 결과 파일 쓰기를 차단한다."""
import copy
import json
import socket
import csv
import io
import re
import zipfile
from xml.etree import ElementTree as ET
import unittest
from contextlib import ExitStack
from pathlib import Path
from unittest.mock import patch

import market_regime as mr

FIXTURES = Path(__file__).resolve().parent / "fixtures"


def source_csv(name):
    raw = (FIXTURES / name).read_bytes()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = raw.decode("euc-kr")
    return list(csv.DictReader(io.StringIO(text)))


def source_wb():
    # 직접 압축파일·XML을 읽어 수집기의 셀 파서와 독립적으로 대조한다.
    ns = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    with zipfile.ZipFile(FIXTURES / "wb_monthly.xlsx") as archive:
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        sheet = next(
            node for node in workbook.findall("s:sheets/s:sheet", ns)
            if node.attrib["name"] == "Monthly Prices"
        )
        rid = sheet.attrib[
            "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
        ]
        rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        target = next(
            node.attrib["Target"] for node in rels if node.attrib["Id"] == rid
        )
        name = target.lstrip("/") if target.startswith("/") else "xl/" + target
        shared = []
        if "xl/sharedStrings.xml" in archive.namelist():
            strings = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared = [
                "".join(node.itertext()) for node in strings.findall("s:si", ns)
            ]
        root = ET.fromstring(archive.read(name))
        rows = []
        for node in root.findall("s:sheetData/s:row", ns):
            row = {}
            for cell in node.findall("s:c", ns):
                col = re.match(r"[A-Z]+", cell.attrib["r"])[0]
                value = cell.find("s:v", ns)
                text = value.text if value is not None else ""
                if cell.attrib.get("t") == "s":
                    text = shared[int(text)]
                elif cell.attrib.get("t") == "inlineStr":
                    text = "".join(cell.find("s:is", ns).itertext())
                row[col] = text or ""
            rows.append(row)
    header = next(row for row in rows if "Maize" in row.values())
    latest = max(
        (row for row in rows if re.fullmatch(r"\d{4}M\d{2}", row.get("A", ""))),
        key=lambda row: row["A"],
    )
    return {
        label.strip(): latest.get(col, "")
        for col, label in header.items() if label
    }


class MarketRegimeTests(unittest.TestCase):
    def setUp(self):
        self.stack = ExitStack()
        self.addCleanup(self.stack.close)
        self.previous = None
        self.saved = None
        self.stack.enter_context(patch.object(
            mr, "_load_previous",
            side_effect=lambda path: copy.deepcopy(self.previous),
        ))
        self.stack.enter_context(patch.object(
            mr, "_save_document", side_effect=self.save,
        ))
        self.network = [
            self.stack.enter_context(patch.object(
                mr, "_request", side_effect=AssertionError("network forbidden"),
            )),
            self.stack.enter_context(patch.object(
                socket, "create_connection",
                side_effect=AssertionError("network forbidden"),
            )),
            self.stack.enter_context(patch.object(
                mr.urllib.request.OpenerDirector, "open",
                side_effect=AssertionError("network forbidden"),
            )),
        ]

    def save(self, path, document):
        self.saved = json.loads(json.dumps(
            document, ensure_ascii=False, allow_nan=False,
        ))

    def collect(self):
        result = mr.main("unused-in-memory.json", FIXTURES)
        self.assertEqual(result, self.saved)
        for spy in self.network:
            spy.assert_not_called()
        return result

    def metric(self, document, commodity, metric_id):
        rows = (
            document["common"] if commodity == "common"
            else document["commodities"][commodity]
        )
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
        want = (int(latest["m_money_positions_long_all"])
                - int(latest["m_money_positions_short_all"]))
        row = self.metric(self.collect(), "corn", "managed_money_net")
        self.assertEqual(row["value"], want)
        self.assertEqual(row["asof"], latest["report_date_as_yyyy_mm_dd"][:10])

    def test_worldbank_month_and_unit(self):
        row = self.metric(self.collect(), "corn", "wb_maize_price")
        self.assertEqual(row["value"], 239.6)
        self.assertEqual(row["unit"], "USD/metric_ton")
        self.assertEqual(row["period"], {
            "type": "month", "start": "2026-09-01", "end": "2026-09-30",
        })

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
        inshore = [
            r for r in rows if r["context"]["account"] == "Pollock, AFA Inshore"
        ]
        self.assertEqual(next(
            r["value"] for r in inshore
            if r["unit"] == "metric_ton" and "_catch_" in r["id"]
        ), 509567)
        self.assertEqual(next(
            r["value"] for r in inshore if "_quota_" in r["id"]
        ), 602050)
        zero = [
            r for r in rows if r["context"]["account"] == "Pollock"
            and r["context"]["geography"] == "Aleutian Islands"
        ]
        self.assertEqual(next(
            r["value"] for r in zero if "_catch_" in r["id"]
        ), 0)
        ratio = next(r for r in zero if "_utilization_" in r["id"])
        self.assertIsNone(ratio["value"])
        self.assertEqual(ratio["status"], "no_value")

    def test_oni_latest_three_month_anomaly(self):
        last = (FIXTURES / "oni.txt").read_text().strip().splitlines()[-1].split()
        row = self.metric(self.collect(), "common", "enso_oni")
        self.assertEqual(row["value"], float(last[-1]))
        self.assertEqual(row["context"]["season"], last[0])
        self.assertEqual(row["period"], {
            "type": "three_month", "start": "2026-07-01", "end": "2026-09-30",
        })

    def test_failure_and_empty_result_preserve_last_value(self):
        self.previous = self.collect()
        original = self.metric(self.previous, "corn", "us_harvest_progress")
        for failing in [OSError("not retained"), RuntimeError("not retained"), []]:
            kwargs = (
                {"side_effect": failing} if isinstance(failing, Exception)
                else {"return_value": failing}
            )
            with patch.object(mr, "parse_nass_progress", **kwargs):
                current = self.collect()
            row = self.metric(current, "corn", "us_harvest_progress")
            self.assertEqual(row["status"], "stale")
            for key in [
                "value", "asof", "source_url", "baseline", "delta", "last_success_at",
            ]:
                self.assertEqual(row[key], original[key])
            self.assertEqual(
                self.metric(current, "corn", "us_good_excellent")["status"], "ok",
            )

    def test_empty_result_without_previous_is_failure(self):
        with patch.object(mr, "parse_cftc_disagg", return_value=[]):
            row = self.metric(self.collect(), "corn", "managed_money_net")
        self.assertIsNone(row["value"])
        self.assertEqual(row["status"], "no_value")
        self.assertEqual(row["fetch_state"], "empty_result")

    def test_partial_garlic_failure_is_per_indicator(self):
        self.previous = self.collect()
        original = mr.parse_oasis_retail_csv

        def partial(raw):
            rows = original(raw)
            rows[1]["value"] = None
            rows[1]["status"] = "no_value"
            rows[1]["missing_reason"] = "not_published"
            return rows

        with patch.object(mr, "parse_oasis_retail_csv", side_effect=partial):
            doc = self.collect()
        self.assertEqual(
            self.metric(doc, "garlic", "normal_price")["status"], "stale",
        )
        self.assertEqual(
            self.metric(doc, "garlic", "normal_price")["value"], 11282,
        )
        self.assertEqual(
            self.metric(doc, "garlic", "retail_price")["status"], "ok",
        )

    def test_noaa_failure_preserves_dynamic_ids(self):
        self.previous = self.collect()
        with patch.object(mr, "parse_noaa_bsai_catch", return_value=[]):
            rows = self.collect()["commodities"]["pollock"]
        previous_numbers = [
            r for r in self.previous["commodities"]["pollock"]
            if r["value"] is not None
        ]
        for old in previous_numbers:
            row = next(r for r in rows if r["id"] == old["id"])
            self.assertEqual(row["status"], "stale")
            self.assertEqual(row["value"], old["value"])
            self.assertEqual(row["context"], old["context"])

    def test_complete_five_year_baseline_only(self):
        source = json.loads((FIXTURES / "nass_corn_progress.json").read_bytes())
        sample = copy.deepcopy(next(
            r for r in source["data"]
            if r["year"] == 2026 and r["begin_code"] == "40"
        ))
        sample.update(
            year=2025, week_ending="2025-10-05", Value="24",
            load_time="2025-10-06 16:00:00.000",
        )
        source["data"].append(sample)
        row = mr.parse_nass_progress(json.dumps(source).encode())[0]
        self.assertEqual(row["baseline"]["years"], [2021, 2022, 2023, 2024, 2025])
        self.assertEqual(row["baseline"]["value"], 32)
        self.assertEqual(row["delta"]["value"], -9)

    def test_noaa_missing_values_never_estimated(self):
        raw = (FIXTURES / "noaa_bsai_2026.html").read_bytes()
        rows = mr.parse_noaa_bsai_catch(raw.replace(b"509,567", b""))
        row = next(
            r for r in rows
            if r["context"].get("account") == "Pollock, AFA Inshore"
            and "_catch_" in r["id"]
        )
        self.assertIsNone(row["value"])
        self.assertEqual(row["status"], "no_value")
        missing = mr.parse_noaa_bsai_catch(
            b"<html><body>no table</body></html>"
        )
        self.assertTrue(missing)
        self.assertTrue(all(r["status"] == "no_value" for r in missing))

    def test_oni_year_boundary_periods(self):
        for season, year, start, end in [
            ("DJF", 2026, "2025-12-01", "2026-02-28"),
            ("NDJ", 2026, "2026-11-01", "2027-01-31"),
        ]:
            row = mr.parse_oni(
                f"SEAS YR TOTAL ANOM\n{season} {year} 27.0 0.0\n".encode()
            )[0]
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
        required = {
            "id", "label", "value", "unit", "asof", "published_at", "period",
            "baseline", "delta", "source_url", "status", "data_state",
            "fetch_state", "freshness", "missing_reason", "last_attempt_at",
            "last_success_at", "error_code", "context",
        }
        self.assertEqual(doc["schema_version"], "1.0")
        self.assertEqual(doc["collection_interval_days"], 14)
        for rows in list(doc["commodities"].values()) + [doc["common"]]:
            self.assertEqual(len(rows), len({r["id"] for r in rows}))
            for row in rows:
                self.assertTrue(required <= row.keys())
        with patch.dict(mr.os.environ, {"NASS_API_KEY": "DO_NOT_LEAK"}):
            with patch.object(
                mr, "parse_nass_progress", side_effect=ValueError("DO_NOT_LEAK"),
            ):
                failed = self.collect()
        self.assertNotIn("DO_NOT_LEAK", json.dumps(failed))
        self.assertNotIn("key=", json.dumps(failed))

    def test_soybean_fixture_value(self):
        source = json.loads((FIXTURES / "nass_soy_progress.json").read_bytes())["data"]
        latest = max(
            (row for row in source if row["commodity_desc"] == "SOYBEANS"
             and row["unit_desc"] == "PCT HARVESTED"
             and row["class_desc"] == "ALL CLASSES"),
            key=lambda row: row["week_ending"],
        )
        row = self.metric(self.collect(), "soybean", "us_harvest_progress")
        self.assertEqual(row["value"], float(latest["Value"]))
        self.assertEqual(row["asof"], latest["week_ending"])
        self.assertEqual(row["status"], "ok")
        self.assertIsNone(row["baseline"])
        self.assertEqual(row["context"]["baseline_missing_years"], [2025])

    def test_winter_wheat_fixture_and_crop_year(self):
        source = json.loads(
            (FIXTURES / "nass_wheat_progress.json").read_bytes()
        )["data"]
        latest = max(
            (row for row in source if row["commodity_desc"] == "WHEAT"
             and row["unit_desc"] == "PCT PLANTED"
             and row["class_desc"] == "WINTER"),
            key=lambda row: row["week_ending"],
        )
        row = self.metric(self.collect(), "wheat", "us_planting_progress")
        self.assertEqual(row["value"], float(latest["Value"]))
        self.assertEqual(row["asof"], latest["week_ending"])
        self.assertEqual(row["context"]["source_year"], latest["year"])
        self.assertEqual(
            row["context"]["observation_year"], int(latest["week_ending"][:4]),
        )
        self.assertIsNone(row["baseline"])
        self.assertEqual(row["context"]["baseline_missing_years"], [2025])

    def test_all_new_cftc_fixtures_and_code_file(self):
        doc = self.collect()
        codes = (FIXTURES / "cftc_codes.txt").read_text()
        for item, name, code in (
            ("soybean", "cftc_soybeans.json", "005602"),
            ("wheat", "cftc_wheat.json", "001602"),
            ("soybean_oil", "cftc_soyoil.json", "007601"),
            ("sugar", "cftc_sugar11.json", "080732"),
            ("canola_oil", "cftc_canola.json", "135731"),
        ):
            with self.subTest(fixture=name):
                source = json.loads((FIXTURES / name).read_bytes())
                latest = max(
                    (row for row in source
                     if row["cftc_contract_market_code"] == code
                     and row["futonly_or_combined"] == "FutOnly"),
                    key=lambda row: row["report_date_as_yyyy_mm_dd"],
                )
                row = self.metric(doc, item, "managed_money_net")
                self.assertEqual(
                    row["value"],
                    int(latest["m_money_positions_long_all"])
                    - int(latest["m_money_positions_short_all"]),
                )
                self.assertEqual(row["context"]["market_code"], code)
                self.assertIn(
                    code + " " + latest["market_and_exchange_names"], codes,
                )
                self.assertEqual(row["status"], "ok")
        self.assertTrue(
            self.metric(doc, "canola_oil", "managed_money_net")["context"]["is_proxy"]
        )

    def test_all_eleven_oasis_fixtures(self):
        doc = self.collect()
        for item, code in (
            ("onions", "245"), ("pepper", "241"), ("carrot", "232"), ("rice", "111"),
            ("sesame", "312"), ("almonds", "319"), ("walnuts", "318"), ("bananas", "418"),
            ("pineapple", "420"), ("cherries", "425"), ("kiwis", "437"),
        ):
            with self.subTest(item=item):
                latest = max(
                    source_csv(f"oasis_{code}_daily.csv"),
                    key=lambda row: row["조회일자"],
                )
                price = self.metric(doc, item, "retail_price")
                self.assertEqual(price["value"], float(latest["해당일_평균가"]))
                self.assertEqual(price["context"]["product_scope"], latest["품목"])
                self.assertEqual(price["context"]["grade"], latest["등급"])
                self.assertEqual(price["unit"], "원/" + latest["단위"])
                self.assertEqual(
                    price["asof"].replace("-", ""), latest["조회일자"],
                )
                self.assertEqual(price["context"]["item_code"], code)
                for metric_id, field, baseline in (
                    ("normal_price", "평년_평균가", "평년_평균가"),
                    ("normal_change_pct", "평년_등락률", "평년_평균가"),
                    ("year_change_pct", "전년_등락률", "전년_평균가"),
                ):
                    row = self.metric(doc, item, metric_id)
                    if float(latest[baseline]) > 0:
                        self.assertEqual(row["value"], float(latest[field]))
                        self.assertEqual(row["status"], "ok")
                    else:
                        self.assertIsNone(row["value"])
                        self.assertEqual(row["status"], "no_value")
                self.assertIn(
                    "평년", self.metric(doc, item, "normal_change_pct")["label"],
                )
                if price["baseline"]:
                    self.assertEqual(price["baseline"]["label"], "원문 평년")
                    self.assertIsNone(price["baseline"]["years"])

    def test_worldbank_all_configured_columns_directly(self):
        source = source_wb()
        doc = self.collect()
        for item, jobs in mr.ITEMS.items():
            for adapter, args in jobs:
                if adapter != "wb_monthly":
                    continue
                with self.subTest(item=item, column=args["column_name"]):
                    row = self.metric(doc, item, args["metric_id"])
                    cell = source.get(args["column_name"].strip())
                    if cell is None or cell in {"", "…", "..."}:
                        self.assertIsNone(row["value"])
                        self.assertEqual(row["status"], "no_value")
                    else:
                        self.assertEqual(row["value"], float(cell))
                        self.assertEqual(row["status"], "ok")
                        self.assertEqual(row["period"]["end"], "2026-09-30")
        self.assertEqual(
            self.metric(doc, "cocoa", "wb_cocoa_price")["unit"], "USD/kg",
        )
        self.assertEqual(
            self.metric(doc, "sugar", "wb_sugar_price")["unit"], "USD/kg",
        )

    def test_palm_soy_spread_same_month_and_sign(self):
        source = source_wb()
        row = self.metric(self.collect(), "palm_oil", "wb_palm_soy_spread")
        self.assertEqual(
            row["value"], float(source["Palm oil"]) - float(source["Soybean oil"]),
        )
        self.assertLess(row["value"], 0)
        self.assertEqual(row["unit"], "USD/metric_ton")
        self.assertIsNone(row["baseline"])

    def test_salmon_fixture_weight_and_missing_price(self):
        source = json.loads(
            (FIXTURES / "ssb_salmon_weekly.json").read_bytes()
        )
        times = source["dimension"]["Tid"]["category"]["index"]
        latest = max(times)
        doc = self.collect()
        row = self.metric(doc, "salmon", "salmon_export_tonnes")
        self.assertEqual(row["value"], source["value"][times[latest]])
        self.assertEqual(row["context"]["source_week"], latest)
        self.assertEqual(row["unit"], "metric_ton")
        self.assertEqual(row["period"], {
            "type": "week", "start": "2026-09-28", "end": "2026-10-04",
        })
        price = self.metric(doc, "salmon", "salmon_export_price")
        self.assertIsNone(price["value"])
        self.assertEqual(price["status"], "no_value")
        self.assertIsNone(price["unit"])
        self.assertEqual(price["missing_reason"], "field_not_in_source")

    def test_argentine_fixture_month_and_source_total(self):
        text = (FIXTURES / "arg_squid_monthly.html").read_text()
        cells = re.search(
            r"Calamar\s*<i>Illex</i></TD></b>(.*?)</TR>", text, re.S,
        )[1]
        cells = re.split(r"<TD\b[^>]*>", cells, flags=re.I)[1:]
        numbers = [
            float(
                re.sub(r"<[^>]+>", "", cell).strip()
                .replace(".", "").replace(",", ".")
            ) for cell in cells
        ]
        doc = self.collect()
        month = self.metric(doc, "squid", "illex_monthly_landings")
        total = self.metric(doc, "squid", "illex_cumulative_landings")
        self.assertEqual(month["value"], numbers[-2])
        self.assertEqual(total["value"], numbers[-1])
        self.assertEqual(month["asof"], "2026-10-06")
        self.assertEqual(month["period"], {
            "type": "month_to_date", "start": "2026-10-01", "end": "2026-10-06",
        })
        self.assertEqual(total["period"]["start"], "2026-01-01")
        self.assertIn("월중", month["label"])

    def test_fishmeal_is_reference_for_all_three_items(self):
        source = source_wb()
        doc = self.collect()
        for item in ("surimi", "shrimp", "petfood"):
            with self.subTest(item=item):
                row = self.metric(doc, item, "wb_fishmeal_price")
                self.assertEqual(row["value"], float(source["Fish meal"]))
                self.assertEqual(row["context"]["product_scope"], "Fish meal")
                self.assertTrue(row["context"]["is_proxy"])
                self.assertIsNone(row["baseline"])

    def test_failure_isolated_between_items_and_wb_series(self):
        original = mr.parse_wb_monthly

        def fail_one(raw, **args):
            if args.get("column_name") == "Coffee, Arabica":
                raise ValueError("secret must not escape")
            return original(raw, **args)

        with patch.object(mr, "parse_wb_monthly", side_effect=fail_one):
            doc = self.collect()
        self.assertEqual(
            self.metric(doc, "coffee", "wb_coffee_arabica_price")["status"],
            "source_failed",
        )
        self.assertEqual(
            self.metric(doc, "coffee", "wb_coffee_robusta_price")["status"], "ok",
        )
        self.assertEqual(
            self.metric(doc, "sugar", "wb_sugar_price")["status"], "ok",
        )
        self.assertEqual(
            self.metric(doc, "salmon", "salmon_export_tonnes")["status"], "ok",
        )
        self.assertNotIn("secret must not escape", json.dumps(doc))

    def test_wb_stale_preservation_is_per_column(self):
        self.previous = self.collect()
        original = mr.parse_wb_monthly

        def missing(raw, **args):
            return (
                [] if args.get("column_name") == "Coffee, Arabica"
                else original(raw, **args)
            )

        with patch.object(mr, "parse_wb_monthly", side_effect=missing):
            doc = self.collect()
        arabica = self.metric(doc, "coffee", "wb_coffee_arabica_price")
        robusta = self.metric(doc, "coffee", "wb_coffee_robusta_price")
        self.assertEqual(arabica["status"], "stale")
        self.assertEqual(
            arabica["value"],
            self.metric(self.previous, "coffee", "wb_coffee_arabica_price")["value"],
        )
        self.assertEqual(robusta["status"], "ok")
        self.assertNotEqual(arabica["id"], robusta["id"])

    def test_missing_column_and_missing_latest_cell_never_backfill(self):
        raw = (FIXTURES / "wb_monthly.xlsx").read_bytes()
        self.assertEqual(
            mr.parse_wb_monthly(raw, column_name="Missing column"), [],
        )
        rows = copy.deepcopy(mr._xlsx_rows(raw, "Monthly Prices"))
        header = next(row for row in rows if "Maize" in row.values())
        column = next(col for col, value in header.items() if value == "Maize")
        latest = max(
            (row for row in rows if re.fullmatch(r"\d{4}M\d{2}", row.get("A", ""))),
            key=lambda row: row["A"],
        )
        latest[column] = "…"
        with patch.object(mr, "_xlsx_rows", return_value=rows):
            row = mr.parse_wb_monthly(raw)[0]
        self.assertIsNone(row["value"])
        self.assertEqual(row["status"], "no_value")
        self.assertEqual(row["asof"], "2026-09-30")

    def test_duplicate_adapter_ids_are_isolated(self):
        original = mr.parse_cftc_disagg

        def duplicate(raw, **args):
            rows = original(raw, **args)
            return (
                rows + rows if args.get("market_code") == "005602" else rows
            )

        with patch.object(mr, "parse_cftc_disagg", side_effect=duplicate):
            doc = self.collect()
        self.assertEqual(
            self.metric(doc, "soybean", "managed_money_net")["status"],
            "source_failed",
        )
        self.assertEqual(
            self.metric(doc, "wheat", "managed_money_net")["status"], "ok",
        )

    def test_empty_adapters_emit_no_value_for_every_item(self):
        with ExitStack() as stack:
            for adapter in {
                adapter for jobs in [*mr.ITEMS.values(), mr.COMMON]
                for adapter, args in jobs
            }:
                stack.enter_context(patch.object(
                    mr, "parse_" + adapter, return_value=[],
                ))
            doc = self.collect()
        for rows in [*doc["commodities"].values(), doc["common"]]:
            self.assertTrue(rows)
            self.assertTrue(all(
                row["value"] is None and row["status"] == "no_value"
                for row in rows
            ))

    def test_item_keys_match_registry_except_explicit_provisional_key(self):
        registry = json.loads((
            FIXTURES.parent.parent.parent / "lib" / "industry-items.json"
        ).read_bytes())
        keys = {item["key"] for item in registry["items"]}
        self.assertEqual(set(mr.ITEMS) - keys, {"soybean_oil"})

    def test_configuration_is_not_mutated(self):
        before = copy.deepcopy(mr.ITEMS)
        self.collect()
        self.assertEqual(mr.ITEMS, before)

    def test_nass_general_filters_exclude_other_class(self):
        source = json.loads(
            (FIXTURES / "nass_wheat_progress.json").read_bytes()
        )
        fake = copy.deepcopy(max(
            source["data"], key=lambda row: row["week_ending"],
        ))
        fake.update(class_desc="SPRING", week_ending="2026-10-11", Value="99")
        source["data"].append(fake)
        args = {
            key: value for key, value in mr.ITEMS["wheat"][0][1].items()
            if key != "fixture"
        }
        row = mr.parse_nass_progress(json.dumps(source).encode(), **args)[0]
        self.assertEqual(row["value"], 36)
        self.assertEqual(row["asof"], "2026-10-04")

    def test_complete_winter_wheat_baseline_uses_observation_years(self):
        source = json.loads(
            (FIXTURES / "nass_wheat_progress.json").read_bytes()
        )
        fake = copy.deepcopy(max(
            source["data"], key=lambda row: row["week_ending"],
        ))
        fake.update(
            year=2026, week_ending="2025-10-05", Value="40",
            load_time="2025-10-06 16:00:00.000",
        )
        source["data"].append(fake)
        args = {
            key: value for key, value in mr.ITEMS["wheat"][0][1].items()
            if key != "fixture"
        }
        row = mr.parse_nass_progress(json.dumps(source).encode(), **args)[0]
        self.assertEqual(row["baseline"]["years"], [2021, 2022, 2023, 2024, 2025])
        self.assertEqual(
            row["baseline"]["value"], (60 + 55 + 57 + 51 + 40) / 5,
        )
        self.assertEqual(
            row["delta"]["value"], 36 - row["baseline"]["value"],
        )

    def test_oasis_wrong_product_and_duplicate_specifications(self):
        raw = (FIXTURES / "oasis_245_daily.csv").read_bytes()
        self.assertEqual(mr.parse_oasis_retail_csv(raw, "241"), [])
        rows = source_csv("oasis_245_daily.csv")
        latest = max(rows, key=lambda row: row["조회일자"])
        alternate = {**latest, "등급": "중품"}
        stream = io.StringIO()
        writer = csv.DictWriter(stream, fieldnames=list(latest))
        writer.writeheader()
        writer.writerows([latest, alternate])
        with self.assertRaises(ValueError):
            mr.parse_oasis_retail_csv(stream.getvalue().encode(), "245")

    def test_ssb_axis_order_and_sparse_cells(self):
        source = json.loads(
            (FIXTURES / "ssb_salmon_weekly.json").read_bytes()
        )
        source["id"] = ["Tid", "VareGrupper2", "ContentsCode"]
        source["size"] = [10, 1, 1]
        source["value"] = {
            str(i): value for i, value in enumerate(source["value"])
        }
        row = mr.parse_ssb_salmon_weekly(json.dumps(source).encode())[0]
        self.assertEqual(row["value"], 30277)
        del source["value"]["9"]
        row = mr.parse_ssb_salmon_weekly(json.dumps(source).encode())[0]
        self.assertIsNone(row["value"])
        self.assertEqual(row["status"], "no_value")
        self.assertEqual(row["asof"], "2026-10-04")

    def test_arg_missing_cell_does_not_borrow_total(self):
        raw = (FIXTURES / "arg_squid_monthly.html").read_bytes()
        start = raw.index(b"Calamar <i>Illex</i>")
        end = raw.index(b"</TR>", start)
        segment = raw[start:end].replace(b">0,6</TD>", b"></TD>")
        rows = mr.parse_arg_squid_monthly(raw[:start] + segment + raw[end:])
        self.assertIsNone(rows[0]["value"])
        self.assertEqual(rows[0]["status"], "no_value")
        self.assertEqual(rows[1]["value"], 188371.1)


if __name__ == "__main__":
    unittest.main()
