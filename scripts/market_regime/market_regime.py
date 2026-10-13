
"""시장 국면 수집기. 파이썬 3.10 이상, 표준 라이브러리만 사용한다."""
import argparse
import calendar
import copy
import csv
import io
import json
import math
import os
import posixpath
import re
import socket
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from functools import lru_cache
from contextlib import contextmanager
from datetime import date, datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path
from xml.etree import ElementTree as ET

NASS_URL = "https://quickstats.nass.usda.gov/api/api_GET/"
CFTC_URL = "https://publicreporting.cftc.gov/resource/72hh-3qpy.json"
WB_URL = ("https://thedocs.worldbank.org/en/doc/"
          "74e8be41ceb20fa0da750cda2f6b9e4e-0050012026/related/"
          "CMO-Historical-Data-Monthly.xlsx")
NOAA_BASE = "https://www.fisheries.noaa.gov/sites/default/files/akro/"
OASIS_BASE = "https://oasis.krei.re.kr"
OASIS_URL = OASIS_BASE + "/basicInfo/retailale/agriPrice.do"
ONI_URL = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt"
SSB_URL = "https://data.ssb.no/api/pxwebapi/v2/tables/03024"
ARG_BASE = "https://www.magyp.gob.ar/sitio/areas/pesca_maritima/desembarques/"
UA = "market-regime/1.1"
OASIS_PRODUCTS = {
    "258": ("깐마늘(국산)-깐마늘(국산)", "깐마늘"),
    "245": ("양파-양파", "양파"),
    "241": ("건고추-화건", "건고추"),
    "232": ("당근-무세척(국산)", "당근"),
    "111": ("쌀-20kg(햅쌀)", "쌀"),
    "312": ("참깨-중국", "참깨"),
    "319": ("아몬드-수입", "아몬드"),
    "318": ("호두-수입", "호두"),
    "418": ("바나나-수입", "바나나"),
    "420": ("파인애플-수입", "파인애플"),
    "425": ("체리-수입", "체리"),
    "437": ("키위-골드", "키위"),
}
XML_NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
MISSING = {"", "-", "--", "...", "…", "NA", "N/A", "(D)", "(Z)", "(NA)"}
IPV4_LOCK = threading.RLock()


class CollectionError(Exception):
    """외부 오류는 비밀정보를 제거한 코드로만 전달한다."""

    def __init__(self, code):
        self.code = code
        super().__init__(code)


def _number(value):
    if value is None:
        return None
    text = str(value).strip().replace(",", "")
    if text in MISSING:
        return None
    if not re.fullmatch(r"[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?", text):
        raise ValueError("invalid numeric cell")
    result = float(text)
    if not math.isfinite(result):
        raise ValueError("nonfinite numeric cell")
    return int(result) if result.is_integer() else result


def _iso(value):
    return date.fromisoformat(str(value)[:10]).isoformat()


def _month_period(year, month):
    return {"type": "month", "start": date(year, month, 1).isoformat(),
            "end": date(year, month, calendar.monthrange(year, month)[1]).isoformat()}


def _english_date(text):
    months = {name.lower(): i for i, name in enumerate(
        ("Jan", "Feb", "Mar", "Apr", "May", "Jun",
         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"), 1)}
    match = re.search(r"(\d{1,2})-([A-Za-z]{3})-(\d{4})", text)
    if match:
        day, month, year = match.groups()
    else:
        match = re.search(r"([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})", text)
        if not match:
            return None
        month, day, year = match.groups()
    return date(int(year), months[month[:3].lower()], int(day)).isoformat()


def _metric(adapter, metric_id, label, value=None, unit=None, asof=None,
            source_url=None, period=None, context=None, status=None):
    present = value is not None
    return {
        "id": metric_id, "label": label, "value": value, "unit": unit,
        "asof": asof, "published_at": None,
        "period": period or {"type": "unknown", "start": None, "end": asof},
        "baseline": None, "delta": None, "source_url": source_url,
        "status": status or ("ok" if present else "no_value"),
        "data_state": "present" if present else "missing",
        "fetch_state": "ok", "freshness": "unknown",
        "missing_reason": None if present else "not_published",
        "last_attempt_at": None, "last_success_at": None, "error_code": None,
        "context": {
            "geography": None, "product_scope": None,
            "definition_version": "source", "is_proxy": False,
            "source_adapter": adapter, **(context or {}),
        },
    }


def _json_rows(raw):
    obj = json.loads(raw)
    if isinstance(obj, dict):
        if obj.get("error"):
            raise CollectionError("SOURCE_ERROR")
        obj = obj.get("data")
    if not isinstance(obj, list) or any(not isinstance(row, dict) for row in obj):
        raise ValueError("expected JSON rows")
    return obj


def _nass_rows(raw, commodity, statisticcat, units, class_desc, util_practice):
    return [row for row in _json_rows(raw)
            if row.get("commodity_desc") == commodity
            and row.get("agg_level_desc") == "NATIONAL"
            and row.get("freq_desc") == "WEEKLY"
            and row.get("source_desc") == "SURVEY"
            and row.get("domain_desc") == "TOTAL"
            and row.get("statisticcat_desc") == statisticcat
            and row.get("unit_desc") in units
            and row.get("class_desc") == class_desc
            and (util_practice is None
                 or row.get("util_practice_desc") == util_practice)]


def _one(rows):
    if len(rows) != 1:
        raise ValueError("ambiguous source rows")
    return rows[0]


def _week(row):
    match = re.fullmatch(r"WEEK #(\d{1,2})", row["reference_period_desc"])
    if not match or int(row["begin_code"]) != int(match[1]):
        raise ValueError("inconsistent source week")
    return int(match[1])


def parse_nass_progress(raw, commodity="CORN", statisticcat="PROGRESS",
                        unit="PCT HARVESTED", class_desc="ALL CLASSES",
                        util_practice="GRAIN", year_offset=0,
                        metric_id="us_harvest_progress", label="미국 옥수수 수확"):
    rows = _nass_rows(raw, commodity, statisticcat, {unit}, class_desc, util_practice)
    if not rows:
        return []
    latest_date = max(_iso(row["week_ending"]) for row in rows)
    latest = _one([row for row in rows if _iso(row["week_ending"]) == latest_date])
    value = _number(latest["Value"])
    if value is not None and not 0 <= value <= 100:
        raise ValueError("invalid percentage")
    source_year, week = int(latest["year"]), _week(latest)
    year = date.fromisoformat(latest_date).year
    if source_year != year + year_offset:
        raise ValueError("inconsistent observation year")
    years = list(range(year - 5, year))
    history, missing = [], []
    for previous_year in years:
        candidates = [row for row in rows
                      if int(row["year"]) == previous_year + year_offset
                      and _iso(row["week_ending"])[:4] == str(previous_year)
                      and _week(row) == week]
        if len(candidates) != 1:
            missing.append(previous_year)
            continue
        number = _number(candidates[0]["Value"])
        if number is None or not 0 <= number <= 100:
            missing.append(previous_year)
        else:
            history.append(number)
    result = _metric(
        "nass_progress", metric_id, label, value, "%", latest_date, NASS_URL,
        {"type": "week_ending", "start": None, "end": latest_date},
        {"geography": "US TOTAL", "product_scope": latest["short_desc"],
         "source_week": week, "source_year": source_year,
         "observation_year": year, "class_desc": class_desc,
         "source_loaded_at": latest.get("load_time"),
         "baseline_missing_years": missing},
    )
    if not missing and value is not None:
        average = sum(history) / 5
        result["baseline"] = {
            "type": "computed_5y_average",
            "label": f"{years[0]}~{years[-1]}년 동일 주차 평균",
            "value": average, "unit": "%", "years": years,
        }
        result["delta"] = {"type": "difference", "value": value - average,
                           "unit": "％포인트"}
    return [result]


def parse_nass_condition(raw, commodity="CORN", statisticcat="CONDITION",
                         unit=("PCT GOOD", "PCT EXCELLENT"), class_desc="ALL CLASSES",
                         util_practice=None, label="미국 옥수수 양호·우수"):
    if set(unit) != {"PCT GOOD", "PCT EXCELLENT"}:
        raise ValueError("invalid condition units")
    rows = _nass_rows(raw, commodity, statisticcat, set(unit), class_desc, util_practice)
    if not rows:
        return []
    asof = max(_iso(row["week_ending"]) for row in rows)
    latest = [row for row in rows if _iso(row["week_ending"]) == asof]
    values = {}
    for unit in ("PCT GOOD", "PCT EXCELLENT"):
        candidates = [row for row in latest if row["unit_desc"] == unit]
        if len(candidates) > 1:
            raise ValueError("ambiguous condition")
        values[unit] = _number(candidates[0]["Value"]) if candidates else None
    value = None
    if all(number is not None for number in values.values()):
        if any(not 0 <= number <= 100 for number in values.values()):
            raise ValueError("invalid condition")
        value = sum(values.values())
        if value > 100:
            raise ValueError("invalid combined condition")
    return [_metric(
        "nass_condition", "us_good_excellent", label, value, "%", asof, NASS_URL,
        {"type": "week_ending", "start": None, "end": asof},
        {"geography": "US TOTAL", "product_scope": commodity, "components": values},
    )]


def parse_cftc_disagg(raw, market_code="002602", is_proxy=False):
    rows = [row for row in _json_rows(raw)
            if str(row.get("cftc_contract_market_code")) == market_code
            and row.get("futonly_or_combined") == "FutOnly"]
    if not rows:
        return []
    asof = max(_iso(row["report_date_as_yyyy_mm_dd"]) for row in rows)
    row = _one([row for row in rows
                if _iso(row["report_date_as_yyyy_mm_dd"]) == asof])
    long = _number(row.get("m_money_positions_long_all"))
    short = _number(row.get("m_money_positions_short_all"))
    for number in (long, short):
        if number is not None and (number < 0 or int(number) != number):
            raise ValueError("invalid position")
    net = long - short if long is not None and short is not None else None
    return [_metric(
        "cftc_disagg", "managed_money_net", "운용자금 순포지션",
        net, "contracts", asof, CFTC_URL,
        {"type": "position_date", "start": asof, "end": asof},
        {"product_scope": row["market_and_exchange_names"],
         "market_code": market_code, "dataset": "72hh-3qpy",
         "long": long, "short": short, "series": "Futures Only",
         "is_proxy": is_proxy},
    )]


@lru_cache(maxsize=2)
def _xlsx_rows(raw, sheet_name):
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {item.attrib["Id"]: item.attrib["Target"]
                   for item in relationships
                   if item.attrib.get("TargetMode") != "External"}
        sheets = [sheet for sheet in workbook.findall("s:sheets/s:sheet", XML_NS)
                  if sheet.attrib["name"] == sheet_name]
        sheet = _one(sheets)
        rid = sheet.attrib[
            "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
        ]
        target = targets[rid]
        path = (target.lstrip("/") if target.startswith("/")
                else posixpath.normpath("xl/" + target))
        if not path.startswith("xl/"):
            raise ValueError("invalid worksheet path")
        shared = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared = ["".join(node.itertext())
                      for node in root.findall("s:si", XML_NS)]
        root = ET.fromstring(archive.read(path))
        result = []
        for row in root.findall("s:sheetData/s:row", XML_NS):
            cells = {}
            for cell in row.findall("s:c", XML_NS):
                column = re.match(r"[A-Z]+", cell.attrib["r"]).group()
                node = cell.find("s:v", XML_NS)
                value = node.text if node is not None else ""
                if cell.attrib.get("t") == "s":
                    value = shared[int(value)]
                elif cell.attrib.get("t") == "inlineStr":
                    inline = cell.find("s:is", XML_NS)
                    value = "".join(inline.itertext()) if inline is not None else ""
                cells[column] = value or ""
            result.append(cells)
        return result


def _wb_series(rows, column_name):
    headers = [(index, column) for index, row in enumerate(rows)
               for column, value in row.items()
               if value.strip() == column_name.strip()]
    if not headers:
        return None
    index, column = _one(headers)
    source_unit = rows[index + 1].get(column, "").strip()
    units = {"($/mt)": "USD/metric_ton", "($/kg)": "USD/kg"}
    if source_unit not in units:
        raise ValueError("unverified World Bank unit")
    observations = [(row["A"], row) for row in rows[index + 2:]
                    if re.fullmatch(r"\d{4}M\d{2}", row.get("A", ""))]
    if not observations:
        return None
    latest = max(month for month, row in observations)
    row = _one([row for month, row in observations if month == latest])
    period = _month_period(*map(int, latest.split("M")))
    value = _number(row.get(column))
    if value is not None and value < 0:
        raise ValueError("invalid price")
    updates = [value for row in rows[:index] for value in row.values()
               if value.startswith("Updated on ")]
    return {
        "value": value, "unit": units[source_unit], "source_unit": source_unit,
        "period": period,
        "source_updated_at": _english_date(updates[0]) if updates else None,
    }


def parse_wb_monthly(raw, column_name="Maize", metric_id="wb_maize_price",
                     label="세계은행 월간 옥수수 가격", is_proxy=False,
                     definition_note=None):
    series = _wb_series(_xlsx_rows(raw, "Monthly Prices"), column_name)
    if series is None:
        return []
    return [_metric(
        "wb_monthly", metric_id, label, series["value"], series["unit"],
        series["period"]["end"], WB_URL, series["period"],
        {"geography": "World Bank quotation", "product_scope": column_name,
         "source_unit": series["source_unit"],
         "source_updated_at": series["source_updated_at"],
         "is_proxy": is_proxy, "definition_note": definition_note},
    )]


def parse_wb_spread(raw, left_column="Palm oil", right_column="Soybean oil",
                    metric_id="wb_palm_soy_spread", label="팜유−대두유 가격차"):
    rows = _xlsx_rows(raw, "Monthly Prices")
    left, right = (_wb_series(rows, column)
                   for column in (left_column, right_column))
    if left is None or right is None:
        return []
    if left["period"] != right["period"] or left["unit"] != right["unit"]:
        raise ValueError("incompatible spread")
    value = None
    if left["value"] is not None and right["value"] is not None:
        value = left["value"] - right["value"]
    return [_metric(
        "wb_spread", metric_id, label, value, left["unit"],
        left["period"]["end"], WB_URL, left["period"],
        {"product_scope": left_column + " - " + right_column,
         "left": left["value"], "right": right["value"],
         "definition_note": "팜유는 2026-01 정의 변경. 과거 평균 미계산"},
    )]


class _HTML(HTMLParser):
    """중첩 표의 셀을 수집하며 닫히지 않은 마지막 셀도 보존한다."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows, self.row_stack, self.cells, self.inputs, self.text = [], [], [], [], []

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self.row_stack.append([])
        elif tag in ("td", "th"):
            self.cells.append([])
        elif tag == "input":
            self.inputs.append(dict(attrs))

    def handle_data(self, data):
        self.text.append(data)
        if self.cells:
            self.cells[-1].append(data)

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.cells:
            cell = " ".join("".join(self.cells.pop()).split())
            if self.row_stack:
                self.row_stack[-1].append(cell)
        elif tag == "tr" and self.row_stack:
            if self.cells:
                self.row_stack[-1].append(
                    " ".join("".join(self.cells.pop()).split())
                )
            self.rows.append(self.row_stack.pop())


def _noaa_missing():
    return [_metric(
        "noaa_bsai_catch", metric_id, label, unit=unit, status="no_value",
        context={"geography": "BSAI", "product_scope": "Pollock"},
        source_url=NOAA_BASE,
    ) for metric_id, label, unit in (
        ("bsai_catch", "BSAI 명태 누적어획", "metric_ton"),
        ("bsai_quota", "BSAI 명태 쿼터", "metric_ton"),
        ("bsai_utilization", "BSAI 명태 쿼터 소진율", "%"),
    )]


def parse_noaa_bsai_catch(raw):
    parser = _HTML()
    parser.feed(raw.decode("utf-8-sig"))
    text = " ".join(parser.text)
    through = re.search(r"Through:\s*(\d{1,2}-[A-Za-z]{3}-\d{4})", text)
    if not through or "All weights are in metric tons." not in text:
        return _noaa_missing()
    asof = _english_date(through[1])
    generated = re.search(
        r"Report run on\s+([A-Za-z]+\s+\d{1,2},\s*\d{4})", text
    )
    url = NOAA_BASE + f"car110_bsai_with_cdq{date.fromisoformat(asof).year}.html"
    area, header, results = None, None, []
    for cells in parser.rows:
        if cells and cells[0] in {
            "Bering Sea", "Aleutian Islands", "Bering Sea Aleutian Islands"
        }:
            area, header = cells[0], None
            continue
        if "Account" in cells and "Total Catch" in cells and "Quota" in cells:
            header = cells
            continue
        if area is None or header is None or len(cells) != len(header):
            continue
        row = dict(zip(header, cells))
        account = row.get("Account", "")
        if not re.match(r"^Pollock(?:,|\s|$)", account):
            continue
        scope = re.sub(
            r"[^a-z0-9]+", "_", (area + "_" + account).lower()
        ).strip("_")
        context = {
            "geography": area, "product_scope": "Pollock",
            "account": account, "season_marker": row.get("Seasons"),
            "quota_column": "Quota", "source_unit": "metric tons",
            "report_generated_at": _english_date(generated[1]) if generated else None,
        }
        catch, quota = _number(row["Total Catch"]), _number(row["Quota"])
        if any(v is not None and v < 0 for v in (catch, quota)):
            raise ValueError("invalid catch or quota")
        ratio = (catch / quota * 100
                 if catch is not None and quota is not None and quota > 0
                 else None)
        for kind, label, value, unit in (
            ("catch", "누적어획", catch, "metric_ton"),
            ("quota", "쿼터", quota, "metric_ton"),
            ("utilization", "쿼터 소진율", ratio, "%"),
        ):
            metric = _metric(
                "noaa_bsai_catch", f"bsai_{kind}_{scope}",
                f"{area} {account} {label}", value, unit, asof, url,
                {"type": "year_to_date", "start": None, "end": asof},
                context, "ok" if value is not None else "no_value",
            )
            if kind == "utilization" and quota == 0:
                metric["missing_reason"] = "not_applicable"
            results.append(metric)
    return results or _noaa_missing()


def parse_oasis_retail_csv(raw, item_code="258"):
    product, label = OASIS_PRODUCTS[item_code]
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = raw.decode("euc-kr")
    reader = csv.DictReader(io.StringIO(text))
    required = {
        "조회일자", "품목", "등급", "단위", "해당일_평균가",
        "평년_평균가", "평년_등락률", "전년_평균가", "전년_등락률",
    }
    if not required <= set(reader.fieldnames or []):
        raise ValueError("invalid OASIS CSV header")
    rows = [row for row in reader if row.get("품목") == product
            and row.get("등급") and row.get("단위")]
    if not rows:
        return []
    asof = max(datetime.strptime(row["조회일자"], "%Y%m%d").date().isoformat()
               for row in rows)
    row = _one([
        row for row in rows
        if datetime.strptime(row["조회일자"], "%Y%m%d").date().isoformat() == asof
    ])
    context = {
        "geography": "대한민국", "product_scope": row["품목"],
        "grade": row["등급"], "source_unit": row["단위"], "item_code": item_code,
    }
    # 가격 기준값 0은 유효한 비교 분모가 아니다. 등락률 자체의 0은 보존한다.
    normal, previous = _number(row["평년_평균가"]), _number(row["전년_평균가"])
    if any(v is not None and v < 0 for v in (normal, previous)):
        raise ValueError("invalid baseline price")
    normal = normal if normal is not None and normal > 0 else None
    previous = previous if previous is not None and previous > 0 else None
    result = []
    for metric_id, suffix, column, unit, valid in (
        ("retail_price", "당일 평균가", "해당일_평균가", "원/" + row["단위"], True),
        ("normal_price", "평년 평균가", "평년_평균가",
         "원/" + row["단위"], normal is not None),
        ("normal_change_pct", "평년 대비", "평년_등락률", "%", normal is not None),
        ("year_change_pct", "전년 대비", "전년_등락률", "%", previous is not None),
    ):
        value = _number(row[column]) if valid else None
        if unit != "%" and value is not None and value < 0:
            raise ValueError("invalid retail price")
        metric = _metric(
            "oasis_retail_csv", metric_id, label + " " + suffix,
            value, unit, asof, OASIS_URL,
            {"type": "day", "start": asof, "end": asof}, context,
        )
        if metric_id == "retail_price" and normal is not None:
            metric["baseline"] = {
                "type": "source_normal", "label": "원문 평년",
                "value": normal, "unit": unit, "years": None,
            }
            change = _number(row["평년_등락률"])
            if change is not None:
                metric["delta"] = {
                    "type": "source_percent_change", "value": change, "unit": "%",
                }
        result.append(metric)
    return result


def parse_ssb_salmon_weekly(raw):
    dataset = json.loads(raw)
    ids, sizes = dataset["id"], dataset["size"]
    if set(ids) != {"VareGrupper2", "ContentsCode", "Tid"} or len(ids) != len(sizes):
        raise ValueError("unverified salmon dimensions")
    dimensions = dataset["dimension"]
    indices = {}
    for axis, size in zip(ids, sizes):
        index = dimensions[axis]["category"]["index"]
        index = ({code: i for i, code in enumerate(index)}
                 if isinstance(index, list) else index)
        if set(index.values()) != set(range(size)):
            raise ValueError("invalid category index")
        indices[axis] = index
    values = dataset["value"]
    if isinstance(values, list) and len(values) != math.prod(sizes):
        raise ValueError("invalid dataset size")
    if "01" not in indices["VareGrupper2"]:
        return []
    times = indices["Tid"]
    if not times:
        return []
    if any(not re.fullmatch(r"\d{4}U\d{2}", code) for code in times):
        raise ValueError("invalid salmon week")
    latest = max(times)
    year, week = map(int, latest.split("U"))
    start, end = (
        date.fromisocalendar(year, week, day).isoformat() for day in (1, 7)
    )
    context = {
        "geography": "노르웨이",
        "product_scope": dimensions["VareGrupper2"]["category"]["label"]["01"],
        "commodity_code": "01", "source_week": latest,
        "source_updated_at": dataset.get("updated"),
    }
    result = []
    for code, metric_id, label, allowed_units, unit in (
        ("Vekt", "salmon_export_tonnes",
         "노르웨이 신선·냉장 양식연어 주간 수출중량", {"tonnes"}, "metric_ton"),
        ("Pris", "salmon_export_price",
         "노르웨이 신선·냉장 양식연어 주간 수출가격",
         {"NOK per kilo", "NOK/kg"}, "NOK/kg"),
    ):
        value, source_unit = None, None
        if code in indices["ContentsCode"]:
            source_unit = dimensions["ContentsCode"]["category"]["unit"][code]["base"]
            if source_unit not in allowed_units:
                raise ValueError("unverified salmon unit")
            coordinate = {
                "VareGrupper2": "01", "ContentsCode": code, "Tid": latest,
            }
            flat = 0
            for axis, size in zip(ids, sizes):
                flat = flat * size + indices[axis][coordinate[axis]]
            cell = values[flat] if isinstance(values, list) else values.get(str(flat))
            value = _number(cell)
            if value is not None and value < 0:
                raise ValueError("invalid salmon value")
        metric = _metric(
            "ssb_salmon_weekly", metric_id, label, value,
            unit if source_unit is not None else None, end, SSB_URL,
            {"type": "week", "start": start, "end": end},
            {**context, "contents_code": code, "source_unit": source_unit},
        )
        if code not in indices["ContentsCode"]:
            metric["missing_reason"] = "field_not_in_source"
        result.append(metric)
    return result


def _spanish_number(text):
    text = text.strip().replace("\u00a0", "")
    if not text or text in MISSING:
        return None
    if not re.fullmatch(r"(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?", text):
        raise ValueError("invalid Spanish number")
    return _number(text.replace(".", "").replace(",", "."))


def parse_arg_squid_monthly(raw):
    parser = _HTML()
    parser.feed(raw.decode("utf-8-sig"))
    text = " ".join(parser.text)
    match = re.search(
        r"Periodo:\s*(\d{2}/\d{2}/\d{4})\s*-\s*(\d{2}/\d{2}/\d{4})", text
    )
    if not match or "Por Especie y Mes (t)" not in text:
        return []
    start, end = (
        datetime.strptime(value, "%d/%m/%Y").date() for value in match.groups()
    )
    if start != date(end.year, 1, 1):
        raise ValueError("unverified landings period")
    months = (
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    )
    headers = [row for row in parser.rows if "Enero" in row and "Total" in row]
    if not headers:
        return []
    header = _one(headers)
    source_months = [cell for cell in header if cell in months]
    if source_months != list(months[:end.month]):
        raise ValueError("inconsistent landings months")
    candidates = [
        row for row in parser.rows if row and row[0] == "Calamar Illex"
    ]
    if not candidates:
        return []
    row = _one(candidates)
    if len(row) != len(header):
        raise ValueError("ambiguous landings columns")
    url = ARG_BASE + f"lectura.php?imp=1&tabla=especie_mes_{end.year}"
    context = {
        "geography": "아르헨티나", "product_scope": "Calamar Illex",
        "source_unit": "t", "report_through": end.isoformat(),
    }
    complete = end.day == calendar.monthrange(end.year, end.month)[1]
    result = []
    for metric_id, label, column, period in (
        (
            "illex_monthly_landings",
            "아르헨티나 일렉스 월간 양륙" if complete else "아르헨티나 일렉스 월중 양륙",
            months[end.month - 1],
            {"type": "month" if complete else "month_to_date",
             "start": date(end.year, end.month, 1).isoformat(),
             "end": end.isoformat()},
        ),
        (
            "illex_cumulative_landings", "아르헨티나 일렉스 누적양륙", "Total",
            {"type": "year_to_date", "start": start.isoformat(), "end": end.isoformat()},
        ),
    ):
        value = _spanish_number(row[header.index(column)])
        result.append(_metric(
            "arg_squid_monthly", metric_id, label, value,
            "metric_ton", end.isoformat(), url, period, context,
        ))
    return result


def parse_oni(raw):
    lines = [line.split() for line in raw.decode("ascii").splitlines() if line.strip()]
    if not lines or lines[0] != ["SEAS", "YR", "TOTAL", "ANOM"]:
        raise ValueError("invalid ONI header")
    seasons = (
        "DJF", "JFM", "FMA", "MAM", "AMJ", "MJJ",
        "JJA", "JAS", "ASO", "SON", "OND", "NDJ",
    )
    rows = []
    for fields in lines[1:]:
        if len(fields) != 4 or fields[0] not in seasons:
            raise ValueError("invalid ONI row")
        rows.append((int(fields[1]), seasons.index(fields[0]) + 1, fields))
    if not rows:
        return []
    year, center, fields = max(rows, key=lambda row: row[:2])
    start_year, start_month = (
        (year - 1, 12) if center == 1 else (year, center - 1)
    )
    end_year, end_month = (
        (year + 1, 1) if center == 12 else (year, center + 1)
    )
    end = date(
        end_year, end_month, calendar.monthrange(end_year, end_month)[1]
    ).isoformat()
    return [_metric(
        "oni", "enso_oni", "엘니뇨·라니냐 최근 3개월 편차",
        _number(fields[3]), "°C", end, ONI_URL,
        {"type": "three_month",
         "start": date(start_year, start_month, 1).isoformat(), "end": end},
        {"geography": "Niño 3.4", "product_scope": "ONI ANOM",
         "season": fields[0], "source_year": year},
    )]


@contextmanager
def _ipv4_only():
    # 순차 요청 동안에만 프로세스 전체의 주소 해석을 IPv4로 제한한다.
    with IPV4_LOCK:
        original = socket.getaddrinfo

        def resolve(host, port, family=0, type=0, proto=0, flags=0):
            return original(host, port, socket.AF_INET, type, proto, flags)

        socket.getaddrinfo = resolve
        try:
            yield
        finally:
            socket.getaddrinfo = original


def _request(url, data=None, opener=None, ipv4=False, headers=None):
    host = urllib.parse.urlsplit(url).hostname or ""
    ipv4 = ipv4 or any(
        host == domain or host.endswith("." + domain)
        for domain in ("noaa.gov", "kamis.or.kr")
    )
    opener = opener or urllib.request.build_opener()
    request = urllib.request.Request(
        url, data=data, headers={"User-Agent": UA, **(headers or {})}
    )
    code = "NETWORK_ERROR"
    for attempt in range(2):
        try:
            if ipv4:
                with _ipv4_only():
                    with opener.open(request, timeout=30) as response:
                        return response.read()
            else:
                with opener.open(request, timeout=30) as response:
                    return response.read()
        except urllib.error.HTTPError as exc:
            code = f"HTTP_{exc.code}"
            if exc.code < 500 and exc.code != 429:
                break
        except (urllib.error.URLError, OSError, TimeoutError) as exc:
            reason = exc.reason if isinstance(exc, urllib.error.URLError) else exc
            code = "DNS_ERROR" if isinstance(reason, socket.gaierror) else "NETWORK_ERROR"
        if attempt == 0:
            time.sleep(1)
    # 오류 본문·요청 주소·인증정보를 출력하지 않는다.
    raise CollectionError(code) from None


def _fetch_nass(category, commodity="CORN", **filters):
    key = os.environ.get("NASS_API_KEY")
    if not key:
        raise CollectionError("CREDENTIALS_REQUIRED")
    params = {
        "key": key, "commodity_desc": commodity, "source_desc": "SURVEY",
        "agg_level_desc": "NATIONAL", "freq_desc": "WEEKLY",
        "domain_desc": "TOTAL", "statisticcat_desc": category,
        "format": "JSON", **filters,
    }
    return _request(NASS_URL + "?" + urllib.parse.urlencode(params))


def fetch_nass_progress(commodity="CORN", statisticcat="PROGRESS",
                        unit="PCT HARVESTED", class_desc="ALL CLASSES",
                        util_practice="GRAIN", year_offset=0, **unused):
    filters = {
        "unit_desc": unit, "class_desc": class_desc,
        "year__GE": date.today().year - 5 + year_offset,
    }
    if util_practice is not None:
        filters["util_practice_desc"] = util_practice
    return _fetch_nass(statisticcat, commodity, **filters)


def fetch_nass_condition(commodity="CORN", statisticcat="CONDITION",
                         class_desc="ALL CLASSES", util_practice=None, **unused):
    filters = {"class_desc": class_desc, "year": date.today().year}
    if util_practice is not None:
        filters["util_practice_desc"] = util_practice
    return _fetch_nass(statisticcat, commodity, **filters)


def fetch_cftc_disagg(market_code="002602", **unused):
    if not re.fullmatch(r"\d{6}", market_code):
        raise CollectionError("UNVERIFIED_MAPPING")
    params = {
        "$where": (
            f"cftc_contract_market_code='{market_code}' "
            "AND futonly_or_combined='FutOnly'"
        ),
        "$order": "report_date_as_yyyy_mm_dd DESC", "$limit": "2",
    }
    return _request(CFTC_URL + "?" + urllib.parse.urlencode(params))


def fetch_wb_monthly(**unused):
    return _request(WB_URL)


def fetch_wb_spread(**unused):
    return fetch_wb_monthly()


def fetch_ssb_salmon_weekly():
    metadata = json.loads(_request(SSB_URL + "?lang=en"))
    latest = metadata.get("lastPeriod")
    if not isinstance(latest, str) or not re.fullmatch(r"\d{4}U\d{2}", latest):
        raise CollectionError("UNVERIFIED_MAPPING")
    # 실측으로 확인된 중량 코드만 요청한다. 가격 코드는 별도 실측 전 보류한다.
    params = {
        "lang": "en", "outputFormat": "json-stat2",
        "valueCodes[VareGrupper2]": "01",
        "valueCodes[ContentsCode]": "Vekt", "valueCodes[Tid]": latest,
    }
    return _request(SSB_URL + "/data?" + urllib.parse.urlencode(params))


def fetch_arg_squid_monthly():
    return _request(
        ARG_BASE + f"lectura.php?imp=1&tabla=especie_mes_{date.today().year}"
    )


def fetch_noaa_bsai_catch():
    return _request(
        NOAA_BASE + f"car110_bsai_with_cdq{date.today().year}.html", ipv4=True
    )


def fetch_oni():
    return _request(ONI_URL, ipv4=True)


def _inputs(raw, name):
    parser = _HTML()
    parser.feed(raw.decode("utf-8"))
    return [item.get("value", "") for item in parser.inputs
            if item.get("name") == name]


def fetch_oasis_retail_csv(item_code="258"):
    """쿠키를 메모리에 보관하며 검증된 CSV 다운로드 절차를 재현한다."""
    import http.cookiejar

    if item_code not in OASIS_PRODUCTS:
        raise CollectionError("UNVERIFIED_MAPPING")
    today = date.today()
    year, month = (
        (today.year - 1, 12) if today.month == 1
        else (today.year, today.month - 1)
    )
    last = calendar.monthrange(year, month)[1]
    start = (date(year, month, min(today.day, last))
             + timedelta(days=max(0, today.day - last)))
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar())
    )
    _request(OASIS_URL, opener=opener, ipv4=True)
    common = {
        "pageIndex": "1", "userSelectMenuId": "010103", "gradNm": "",
        "sCalendar": start.isoformat(), "eCalendar": today.isoformat(),
        "pageUnit": "10",
    }
    form = {
        **common, "tabId": "", "fileName": "", "cmd": "init", "noData": "0",
        "excelMode": "", "codeType": "code2",
    }

    def post(path, ajax=True):
        return _request(
            OASIS_BASE + path, urllib.parse.urlencode(form).encode("utf-8"),
            opener, True, {
                "Referer": OASIS_URL,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                **({"X-Requested-With": "XMLHttpRequest"} if ajax else {}),
            },
        )

    found = False
    for category in ("100", "200", "300", "400"):
        form["code1"] = category
        if item_code in _inputs(post("/selectAgriPriceCode.do"), "code2"):
            found = True
            break
    if not found:
        raise CollectionError("UNVERIFIED_MAPPING")
    form.update(code2=item_code, codeType="code3")
    varieties = [
        value for value in _inputs(
            post("/selectAgriPriceCodeToYear.do?checkAll=CODE3"), "code3"
        ) if value != "ALL"
    ]
    if not varieties:
        raise CollectionError("EMPTY_RESULT")
    form.update(code3=varieties[0], codeType="code4")
    grades = [
        value for value in _inputs(
            post("/selectAgriPriceCode.do?checkAll=CODE4"), "code4"
        ) if value != "ALL"
    ]
    if not grades:
        raise CollectionError("EMPTY_RESULT")
    form.update(code4="04" if "04" in grades else grades[0], cmd="service")
    page = _HTML()
    page.feed(post(
        "/basicInfo/retailale/agriPrice.do", ajax=False
    ).decode("utf-8"))
    counts = [item.get("value", "") for item in page.inputs
              if item.get("id") == "noData"]
    if len(counts) != 1 or not counts[0].isdigit() or int(counts[0]) == 0:
        raise CollectionError("EMPTY_RESULT")
    form.update(noData=counts[0], excelMode="excel")
    name = post(
        "/basicInfo/retailale/agriPriceCsv.do"
    ).decode("utf-8").strip().strip('"')
    if not re.fullmatch(r"[^/\\<>\r\n\x00]+\.csv", name):
        raise CollectionError("PARSE_ERROR")
    form["fileName"] = name
    return post("/excelDownload.do", ajax=False)


def _wb(column_name, metric_id, label, **options):
    return ("wb_monthly", {
        "fixture": "wb_monthly.xlsx", "column_name": column_name,
        "metric_id": metric_id, "label": label, **options,
    })


def _cot(market_code, fixture, **options):
    return ("cftc_disagg", {
        "fixture": fixture, "market_code": market_code, **options,
    })


def _oasis(item_code):
    return ("oasis_retail_csv", {
        "fixture": f"oasis_{item_code}_daily.csv", "item_code": item_code,
    })


# 각 항목은 어댑터와 인자의 목록이다. 공통 기후 지표는 별도로 수집한다.
# 대두유는 메뉴 레지스트리에 키가 없어 임시 키를 사용한다.
ITEMS = {
    "corn": [
        ("nass_progress", {"fixture": "nass_corn_progress.json"}),
        ("nass_condition", {"fixture": "nass_corn_condition.json"}),
        _cot("002602", "cftc_corn.json"),
        _wb("Maize", "wb_maize_price", "세계은행 월간 옥수수 가격"),
    ],
    "pollock": [
        ("noaa_bsai_catch", {"fixture": "noaa_bsai_2026.html"}),
    ],
    "garlic": [
        ("oasis_retail_csv", {"fixture": "oasis_garlic_daily.csv"}),
    ],
    "soybean": [
        ("nass_progress", {
            "fixture": "nass_soy_progress.json", "commodity": "SOYBEANS",
            "statisticcat": "PROGRESS", "unit": "PCT HARVESTED",
            "class_desc": "ALL CLASSES", "util_practice": None,
            "label": "미국 대두 수확",
        }),
        _cot("005602", "cftc_soybeans.json"),
        _wb("Soybeans", "wb_soybean_price", "세계은행 월간 대두 가격"),
    ],
    "wheat": [
        ("nass_progress", {
            "fixture": "nass_wheat_progress.json", "commodity": "WHEAT",
            "statisticcat": "PROGRESS", "unit": "PCT PLANTED",
            "class_desc": "WINTER", "util_practice": None, "year_offset": 1,
            "metric_id": "us_planting_progress", "label": "미국 겨울밀 파종",
        }),
        _cot("001602", "cftc_wheat.json"),
        _wb("Wheat, US SRW", "wb_wheat_srw_price", "세계은행 월간 미국 연질밀 가격"),
        _wb("Wheat, US HRW", "wb_wheat_hrw_price", "세계은행 월간 미국 경질밀 가격"),
    ],
    "soybean_oil": [
        _cot("007601", "cftc_soyoil.json"),
        _wb("Soybean oil", "wb_soyoil_price", "세계은행 월간 대두유 가격"),
    ],
    "sugar": [
        _cot("080732", "cftc_sugar11.json"),
        _wb("Sugar, world", "wb_sugar_price", "세계은행 월간 세계 설탕 가격"),
    ],
    "canola_oil": [
        _cot("135731", "cftc_canola.json", is_proxy=True),
        _wb("Rapeseed oil", "wb_rapeseed_oil_price", "세계은행 월간 유채유 가격"),
    ],
    "palm_oil": [
        _wb(
            "Palm oil", "wb_palm_oil_price", "세계은행 월간 팜유 가격",
            definition_note="2026-01 정의 변경. 과거 평균 미계산",
        ),
        ("wb_spread", {"fixture": "wb_monthly.xlsx"}),
    ],
    "sunflower_oil": [
        _wb(
            "Sunflower oil", "wb_sunflower_oil_price",
            "세계은행 월간 해바라기유 가격",
        ),
    ],
    "olive": [
        _wb("Olive oil", "wb_olive_oil_price", "세계은행 월간 올리브유 가격"),
    ],
    "coffee": [
        _wb(
            "Coffee, Arabica", "wb_coffee_arabica_price",
            "세계은행 월간 아라비카 가격",
        ),
        _wb(
            "Coffee, Robusta", "wb_coffee_robusta_price",
            "세계은행 월간 로부스타 가격",
        ),
    ],
    "cocoa": [
        _wb("Cocoa", "wb_cocoa_price", "세계은행 월간 코코아 가격"),
    ],
    "natural_rubber": [
        _wb(
            "Rubber, TSR20 **", "wb_rubber_tsr20_price",
            "세계은행 월간 천연고무 가공등급 가격",
            definition_note="원문 ** 주석 유지. 과거 평균 미계산",
        ),
        _wb(
            "Rubber, RSS3", "wb_rubber_rss3_price",
            "세계은행 월간 천연고무 시트등급 가격",
        ),
    ],
    "bananas": [
        _wb(
            "Banana, US", "wb_banana_us_price",
            "세계은행 월간 바나나 미국 수입가격",
        ),
        _wb(
            "Banana, Europe", "wb_banana_europe_price",
            "세계은행 월간 바나나 유럽 수입가격",
        ),
        _oasis("418"),
    ],
    "rice": [
        _wb("Rice, Thai 5%", "wb_rice_thai_price", "세계은행 월간 태국 쌀 가격"),
        _oasis("111"),
    ],
    "coconut": [
        _wb(
            "Coconut oil", "wb_coconut_oil_price",
            "세계은행 월간 코코넛오일 원료 참고가격", is_proxy=True,
        ),
    ],
    "beef": [
        _wb(
            "Beef **", "wb_beef_price", "세계은행 월간 소고기 참고가격",
            is_proxy=True,
            definition_note="국내 등급판정·도축 지표가 아님. 원문 ** 주석 유지",
        ),
    ],
    "chicken": [
        _wb(
            "Chicken **", "wb_chicken_price", "세계은행 월간 닭고기 참고가격",
            is_proxy=True,
            definition_note="국내 도축 지표가 아님. 원문 ** 주석 유지",
        ),
    ],
    "salmon": [
        ("ssb_salmon_weekly", {"fixture": "ssb_salmon_weekly.json"}),
    ],
    "squid": [
        ("arg_squid_monthly", {"fixture": "arg_squid_monthly.html"}),
    ],
    "surimi": [
        _wb(
            "Fish meal", "wb_fishmeal_price", "세계은행 월간 어분 원료 참고가격",
            is_proxy=True, definition_note="2026-07 정의 변경. 과거 평균 미계산",
        ),
    ],
    "shrimp": [
        _wb(
            "Fish meal", "wb_fishmeal_price", "세계은행 월간 어분 사료원료 참고가격",
            is_proxy=True, definition_note="2026-07 정의 변경. 과거 평균 미계산",
        ),
    ],
    "petfood": [
        _wb(
            "Fish meal", "wb_fishmeal_price", "세계은행 월간 어분 원료 참고가격",
            is_proxy=True, definition_note="2026-07 정의 변경. 과거 평균 미계산",
        ),
    ],
    "onions": [_oasis("245")],
    "pepper": [_oasis("241")],
    "carrot": [_oasis("232")],
    "sesame": [_oasis("312")],
    "almonds": [_oasis("319")],
    "walnuts": [_oasis("318")],
    "pineapple": [_oasis("420")],
    "cherries": [_oasis("425")],
    "kiwis": [_oasis("437")],
}
COMMON = [("oni", {"fixture": "oni.txt"})]


def _templates(adapter, **options):
    if adapter == "noaa_bsai_catch":
        return _noaa_missing()
    definitions = {
        "nass_progress": [
            (options.get("metric_id", "us_harvest_progress"),
             options.get("label", "미국 옥수수 수확"), "%", NASS_URL),
        ],
        "nass_condition": [
            ("us_good_excellent", options.get("label", "미국 옥수수 양호·우수"),
             "%", NASS_URL),
        ],
        "cftc_disagg": [
            ("managed_money_net", "운용자금 순포지션", "contracts", CFTC_URL),
        ],
        "wb_monthly": [
            (options.get("metric_id", "wb_maize_price"),
             options.get("label", "세계은행 월간 옥수수 가격"), None, WB_URL),
        ],
        "wb_spread": [
            (options.get("metric_id", "wb_palm_soy_spread"),
             options.get("label", "팜유−대두유 가격차"), None, WB_URL),
        ],
        "ssb_salmon_weekly": [
            ("salmon_export_tonnes",
             "노르웨이 신선·냉장 양식연어 주간 수출중량", "metric_ton", SSB_URL),
            ("salmon_export_price",
             "노르웨이 신선·냉장 양식연어 주간 수출가격", None, SSB_URL),
        ],
        "arg_squid_monthly": [
            ("illex_monthly_landings", "아르헨티나 일렉스 월간 양륙",
             "metric_ton", ARG_BASE),
            ("illex_cumulative_landings", "아르헨티나 일렉스 누적양륙",
             "metric_ton", ARG_BASE),
        ],
        "oni": [
            ("enso_oni", "엘니뇨·라니냐 최근 3개월 편차", "°C", ONI_URL),
        ],
    }
    if adapter == "oasis_retail_csv":
        code = options.get("item_code", "258")
        label = OASIS_PRODUCTS[code][1]
        definitions[adapter] = [
            ("retail_price", label + " 당일 평균가", None, OASIS_URL),
            ("normal_price", label + " 평년 평균가", None, OASIS_URL),
            ("normal_change_pct", label + " 평년 대비", "%", OASIS_URL),
            ("year_change_pct", label + " 전년 대비", "%", OASIS_URL),
        ]
    context = {"is_proxy": options.get("is_proxy", False)}
    if adapter.startswith("wb_"):
        context.update(
            product_scope=options.get("column_name"),
            definition_note=options.get("definition_note"),
        )
    return [_metric(
        adapter, metric_id, label, unit=unit, source_url=url, context=context
    ) for metric_id, label, unit, url in definitions[adapter]]


def _load_previous(path):
    try:
        document = json.loads(path.read_bytes())
    except FileNotFoundError:
        return None
    if (document.get("schema_version") != "1.0"
            or not isinstance(document.get("commodities"), dict)):
        raise ValueError("invalid previous snapshot")
    return document


def _save_document(path, document):
    serialized = json.dumps(
        document, ensure_ascii=False, indent=2, allow_nan=False
    ) + "\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path.parent,
            prefix=path.name + ".", delete=False,
        ) as stream:
            temporary = stream.name
            stream.write(serialized)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
        temporary = None
    finally:
        if temporary is not None:
            os.unlink(temporary)


def _failed(candidate, previous, now, code, empty=False):
    has_previous = previous is not None and previous.get("value") is not None
    row = copy.deepcopy(previous if has_previous else candidate)
    row.update(
        status="stale" if has_previous else (
            "deferred" if code == "CREDENTIALS_REQUIRED" else
            "no_value" if empty or code == "NO_VALUE" else "source_failed"
        ),
        data_state="present" if has_previous else "missing",
        fetch_state="empty_result" if empty else (
            "ok" if code == "NO_VALUE" else
            "not_run" if code == "CREDENTIALS_REQUIRED" and not has_previous
            else "failed"
        ),
        freshness="stale" if has_previous else "unknown",
        missing_reason=(
            "credentials_required" if code == "CREDENTIALS_REQUIRED" else
            candidate.get("missing_reason", "not_published") if code == "NO_VALUE" else
            "empty_result" if empty else "source_failure"
        ),
        last_attempt_at=now, error_code=code,
    )
    return row


def _merge(rows, defaults, old, now, failure=None, empty=False):
    if failure:
        candidates = list(old.values()) or defaults
        return [
            _failed(row, old.get(row["id"]), now, failure, empty)
            for row in candidates
        ]
    result = []
    for row in rows:
        if row["value"] is None and row.get("missing_reason") != "not_applicable":
            row = _failed(row, old.get(row["id"]), now, "NO_VALUE")
        else:
            row = copy.deepcopy(row)
            row.update(last_attempt_at=now)
            if row["value"] is not None:
                row["last_success_at"] = now
        result.append(row)
    ids = {row["id"] for row in rows}
    for metric_id, row in old.items():
        if metric_id not in ids:
            result.append(_failed(row, row, now, "EMPTY_RESULT", empty=True))
    return result


def main(out_path, fixtures_dir=None):
    """지표별 실패를 격리하고 이전 성공값을 보존해 결과를 저장한다."""
    path = Path(out_path)
    previous = _load_previous(path) or {"commodities": {}, "common": []}
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    document = {
        "schema_version": "1.0", "generated_at": now,
        "collection_interval_days": 14,
        "commodities": {item: [] for item in ITEMS}, "common": [],
    }
    raw_cache = {}
    for commodity, jobs in [*ITEMS.items(), ("common", COMMON)]:
        old_rows = (
            previous.get("common", []) if commodity == "common"
            else previous["commodities"].get(commodity, [])
        )
        target = (
            document["common"] if commodity == "common"
            else document["commodities"][commodity]
        )
        for adapter, arguments in jobs:
            options = {
                key: value for key, value in arguments.items() if key != "fixture"
            }
            defaults = _templates(adapter, **options)
            default_ids = {row["id"] for row in defaults}
            old = {
                row["id"]: row for row in old_rows
                if row["id"] in default_ids or (
                    adapter == "noaa_bsai_catch"
                    and row.get("context", {}).get("source_adapter") == adapter
                )
            }
            failure, empty, rows = None, False, []
            try:
                # 세계은행 파일은 한 실행에서 한 번만 읽거나 다운로드한다.
                cache_key = (
                    arguments["fixture"] if fixtures_dir is not None else (
                        "wb" if adapter in {"wb_monthly", "wb_spread"}
                        else adapter + json.dumps(options, sort_keys=True)
                    )
                )
                if cache_key not in raw_cache:
                    raw_cache[cache_key] = (
                        (Path(fixtures_dir) / arguments["fixture"]).read_bytes()
                        if fixtures_dir is not None
                        else globals()["fetch_" + adapter](**options)
                    )
                rows = globals()["parse_" + adapter](
                    raw_cache[cache_key], **options
                )
                if (not isinstance(rows, list)
                        or any(not isinstance(row, dict) for row in rows)):
                    raise ValueError("invalid adapter result")
                ids = [row["id"] for row in rows]
                if (len(ids) != len(set(ids))
                        or set(ids) & {row["id"] for row in target}):
                    raise ValueError("duplicate indicator ID")
                for row in rows:
                    if row["asof"] is not None:
                        _iso(row["asof"])
                if not rows:
                    failure, empty = "EMPTY_RESULT", True
            except CollectionError as exc:
                failure = exc.code
                empty = failure == "EMPTY_RESULT"
            except (
                ValueError, KeyError, TypeError, IndexError, UnicodeError,
                ET.ParseError, zipfile.BadZipFile,
            ):
                failure = "PARSE_ERROR"
            except OSError:
                failure = "IO_ERROR"
            except Exception:
                failure = "ADAPTER_ERROR"
            target.extend(_merge(rows, defaults, old, now, failure, empty))
    _save_document(path, document)
    return document


if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("--out", default="public/data/market-regime.v1.json")
    cli.add_argument("--fixtures-dir")
    args = cli.parse_args()
    try:
        main(args.out, args.fixtures_dir)
    except Exception:
        # 인증정보가 포함될 수 있는 원래 예외 내용을 숨긴다.
        cli.exit(1, "market-regime collection failed\n")
