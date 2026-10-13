"""Pilot market-regime collector. Python 3.10+, standard library only."""
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
UA = "market-regime-pilot/1.0"
XML_NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
MISSING = {"", "-", "--", "...", "…", "NA", "N/A", "(D)", "(Z)", "(NA)"}
IPV4_LOCK = threading.RLock()


class CollectionError(Exception):
    """Only sanitized codes cross the network boundary."""
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
        "status": status or ("ok" if present else "no_data"),
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


def _nass_rows(raw, category, units):
    return [row for row in _json_rows(raw)
            if row.get("commodity_desc") == "CORN"
            and row.get("agg_level_desc") == "NATIONAL"
            and row.get("freq_desc") == "WEEKLY"
            and row.get("source_desc") == "SURVEY"
            and row.get("domain_desc") == "TOTAL"
            and row.get("statisticcat_desc") == category
            and row.get("unit_desc") in units
            and (category != "PROGRESS" or row.get("util_practice_desc") == "GRAIN")]


def _one(rows):
    if len(rows) != 1:
        raise ValueError("ambiguous source rows")
    return rows[0]


def _week(row):
    match = re.fullmatch(r"WEEK #(\d{1,2})", row["reference_period_desc"])
    if not match or int(row["begin_code"]) != int(match[1]):
        raise ValueError("inconsistent source week")
    return int(match[1])


def parse_nass_progress(raw):
    rows = _nass_rows(raw, "PROGRESS", {"PCT HARVESTED"})
    if not rows:
        return []
    latest_date = max(_iso(row["week_ending"]) for row in rows)
    latest = _one([row for row in rows if _iso(row["week_ending"]) == latest_date])
    value = _number(latest["Value"])
    if value is not None and not 0 <= value <= 100:
        raise ValueError("invalid percentage")
    year, week = int(latest["year"]), _week(latest)
    if date.fromisoformat(latest_date).year != year:
        raise ValueError("inconsistent observation year")
    years = list(range(year - 5, year))
    history, missing = [], []
    for previous_year in years:
        candidates = [row for row in rows if int(row["year"]) == previous_year
                      and _week(row) == week]
        if len(candidates) != 1:
            missing.append(previous_year)
            continue
        number = _number(candidates[0]["Value"])
        if number is None or not 0 <= number <= 100:
            missing.append(previous_year)
        else:
            history.append(number)
    result = _metric("nass_progress", "us_harvest_progress", "미국 옥수수 수확",
                     value, "%", latest_date, NASS_URL,
                     {"type": "week_ending", "start": None, "end": latest_date},
                     {"geography": "US TOTAL", "product_scope": latest["short_desc"],
                      "source_week": week, "source_loaded_at": latest.get("load_time"),
                      "baseline_missing_years": missing})
    if not missing and value is not None:
        average = sum(history) / 5
        result["baseline"] = {
            "type": "computed_5y_average", "label": f"{years[0]}~{years[-1]}년 동일 주차 평균",
            "value": average, "unit": "%", "years": years,
        }
        result["delta"] = {"type": "difference", "value": value - average,
                           "unit": "％포인트"}
    return [result]


def parse_nass_condition(raw):
    rows = _nass_rows(raw, "CONDITION", {"PCT GOOD", "PCT EXCELLENT"})
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
    return [_metric("nass_condition", "us_good_excellent", "미국 옥수수 양호·우수",
                    value, "%", asof, NASS_URL,
                    {"type": "week_ending", "start": None, "end": asof},
                    {"geography": "US TOTAL", "product_scope": "CORN",
                     "components": values})]


def parse_cftc_disagg(raw):
    rows = [row for row in _json_rows(raw)
            if str(row.get("cftc_contract_market_code")) == "002602"
            and row.get("futonly_or_combined") == "FutOnly"
            and row.get("market_and_exchange_names") == "CORN - CHICAGO BOARD OF TRADE"]
    if not rows:
        return []
    asof = max(_iso(row["report_date_as_yyyy_mm_dd"]) for row in rows)
    row = _one([row for row in rows if _iso(row["report_date_as_yyyy_mm_dd"]) == asof])
    long = _number(row.get("m_money_positions_long_all"))
    short = _number(row.get("m_money_positions_short_all"))
    for number in (long, short):
        if number is not None and (number < 0 or int(number) != number):
            raise ValueError("invalid position")
    net = long - short if long is not None and short is not None else None
    return [_metric("cftc_disagg", "managed_money_net", "매니지드머니 순포지션",
                    net, "contracts", asof, CFTC_URL,
                    {"type": "position_date", "start": asof, "end": asof},
                    {"geography": "CBOT", "product_scope": row["market_and_exchange_names"],
                     "market_code": "002602", "dataset": "72hh-3qpy",
                     "long": long, "short": short, "series": "Futures Only"})]


def _xlsx_rows(raw, sheet_name):
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {item.attrib["Id"]: item.attrib["Target"]
                   for item in relationships if item.attrib.get("TargetMode") != "External"}
        sheets = [sheet for sheet in workbook.findall("s:sheets/s:sheet", XML_NS)
                  if sheet.attrib["name"] == sheet_name]
        sheet = _one(sheets)
        rid = sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
        target = targets[rid]
        path = target.lstrip("/") if target.startswith("/") else posixpath.normpath("xl/" + target)
        if not path.startswith("xl/"):
            raise ValueError("invalid worksheet path")
        shared = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared = ["".join(node.itertext()) for node in root.findall("s:si", XML_NS)]
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


def parse_wb_monthly(raw):
    rows = _xlsx_rows(raw, "Monthly Prices")
    headers = [(index, column) for index, row in enumerate(rows)
               for column, value in row.items() if value.strip() == "Maize"]
    if len(headers) != 1:
        return []
    index, column = headers[0]
    if index + 1 >= len(rows) or rows[index + 1].get(column, "").strip() != "($/mt)":
        raise ValueError("unverified maize unit")
    observations = [(row["A"], row) for row in rows[index + 2:]
                    if re.fullmatch(r"\d{4}M\d{2}", row.get("A", ""))]
    if not observations:
        return []
    latest_month = max(month for month, row in observations)
    row = _one([row for month, row in observations if month == latest_month])
    year, month = map(int, latest_month.split("M"))
    period = _month_period(year, month)
    value = _number(row.get(column))
    if value is not None and value < 0:
        raise ValueError("invalid price")
    updates = [value for row in rows[:index] for value in row.values()
               if value.startswith("Updated on ")]
    return [_metric("wb_monthly", "wb_maize_price", "세계은행 월간 옥수수 가격",
                    value, "USD/metric_ton", period["end"], WB_URL, period,
                    {"geography": "World Bank quotation", "product_scope": "Maize",
                     "source_unit": "($/mt)",
                     "source_updated_at": _english_date(updates[0]) if updates else None})]


class _HTML(HTMLParser):
    """Collect cells from nested tables without using layout positions."""
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
            self.rows.append(self.row_stack.pop())


def _noaa_missing():
    return [_metric("noaa_bsai_catch", metric_id, label, unit=unit, status="no_value",
                    context={"geography": "BSAI", "product_scope": "Pollock"},
                    source_url=NOAA_BASE)
            for metric_id, label, unit in (
                ("bsai_catch", "BSAI 명태 누적어획", "metric_ton"),
                ("bsai_quota", "BSAI 명태 쿼터", "metric_ton"),
                ("bsai_utilization", "BSAI 명태 쿼터 소진율", "%"))]


def parse_noaa_bsai_catch(raw):
    parser = _HTML()
    parser.feed(raw.decode("utf-8-sig"))
    text = " ".join(parser.text)
    through = re.search(r"Through:\s*(\d{1,2}-[A-Za-z]{3}-\d{4})", text)
    if not through or "All weights are in metric tons." not in text:
        return _noaa_missing()
    asof = _english_date(through[1])
    generated = re.search(r"Report run on\s+([A-Za-z]+\s+\d{1,2},\s*\d{4})", text)
    url = NOAA_BASE + f"car110_bsai_with_cdq{date.fromisoformat(asof).year}.html"
    area, header, results = None, None, []
    for cells in parser.rows:
        if cells and cells[0] in {"Bering Sea", "Aleutian Islands", "Bering Sea Aleutian Islands"}:
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
        scope = re.sub(r"[^a-z0-9]+", "_", (area + "_" + account).lower()).strip("_")
        context = {"geography": area, "product_scope": "Pollock",
                   "account": account, "season_marker": row.get("Seasons"),
                   "quota_column": "Quota", "source_unit": "metric tons",
                   "report_generated_at": _english_date(generated[1]) if generated else None}
        catch, quota = _number(row["Total Catch"]), _number(row["Quota"])
        if any(v is not None and v < 0 for v in (catch, quota)):
            raise ValueError("invalid catch or quota")
        ratio = catch / quota * 100 if catch is not None and quota is not None and quota > 0 else None
        for kind, label, value, unit in (
            ("catch", "누적어획", catch, "metric_ton"),
            ("quota", "쿼터", quota, "metric_ton"),
            ("utilization", "쿼터 소진율", ratio, "%"),
        ):
            metric = _metric("noaa_bsai_catch", f"bsai_{kind}_{scope}",
                             f"{area} {account} {label}", value, unit, asof, url,
                             {"type": "year_to_date", "start": None, "end": asof},
                             context, "ok" if value is not None else "no_value")
            if kind == "utilization" and quota == 0:
                metric["missing_reason"] = "not_applicable"
            results.append(metric)
    return results or _noaa_missing()


def parse_oasis_retail_csv(raw):
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = raw.decode("euc-kr")
    reader = csv.DictReader(io.StringIO(text))
    required = {"조회일자", "품목", "등급", "단위", "해당일_평균가",
                "평년_평균가", "평년_등락률", "전년_등락률"}
    if not required <= set(reader.fieldnames or []):
        raise ValueError("invalid OASIS CSV header")
    rows = [row for row in reader
            if row.get("품목") == "깐마늘(국산)-깐마늘(국산)"
            and row.get("등급") and row.get("단위")]
    if not rows:
        return []
    asof = max(datetime.strptime(row["조회일자"], "%Y%m%d").date().isoformat() for row in rows)
    latest = [row for row in rows
              if datetime.strptime(row["조회일자"], "%Y%m%d").date().isoformat() == asof]
    row = _one(latest)
    context = {"geography": "대한민국", "product_scope": row["품목"],
               "grade": row["등급"], "source_unit": row["단위"], "item_code": "258"}
    result = []
    for metric_id, label, column, unit in (
        ("retail_price", "깐마늘 당일 평균가", "해당일_평균가", "원/" + row["단위"]),
        ("normal_price", "깐마늘 평년 평균가", "평년_평균가", "원/" + row["단위"]),
        ("normal_change_pct", "깐마늘 평년 대비", "평년_등락률", "%"),
        ("year_change_pct", "깐마늘 전년 대비", "전년_등락률", "%"),
    ):
        value = _number(row[column])
        if unit != "%" and value is not None and value < 0:
            raise ValueError("invalid retail price")
        metric = _metric("oasis_retail_csv", metric_id, label, value, unit, asof,
                         OASIS_URL, {"type": "day", "start": asof, "end": asof}, context)
        if metric_id == "retail_price":
            normal = _number(row["평년_평균가"])
            if normal is not None:
                metric["baseline"] = {"type": "source_normal", "label": "원문 평년",
                                      "value": normal, "unit": unit, "years": None}
            change = _number(row["평년_등락률"])
            if change is not None:
                metric["delta"] = {"type": "source_percent_change", "value": change, "unit": "%"}
        result.append(metric)
    return result


def parse_oni(raw):
    lines = [line.split() for line in raw.decode("ascii").splitlines() if line.strip()]
    if not lines or lines[0] != ["SEAS", "YR", "TOTAL", "ANOM"]:
        raise ValueError("invalid ONI header")
    seasons = ("DJF", "JFM", "FMA", "MAM", "AMJ", "MJJ",
               "JJA", "JAS", "ASO", "SON", "OND", "NDJ")
    rows = []
    for fields in lines[1:]:
        if len(fields) != 4 or fields[0] not in seasons:
            raise ValueError("invalid ONI row")
        rows.append((int(fields[1]), seasons.index(fields[0]) + 1, fields))
    if not rows:
        return []
    year, center, fields = max(rows, key=lambda row: row[:2])
    start_year, start_month = (year - 1, 12) if center == 1 else (year, center - 1)
    end_year, end_month = (year + 1, 1) if center == 12 else (year, center + 1)
    end = date(end_year, end_month, calendar.monthrange(end_year, end_month)[1]).isoformat()
    return [_metric("oni", "enso_oni", "ENSO ONI 최근 3개월 편차",
                    _number(fields[3]), "°C", end, ONI_URL,
                    {"type": "three_month", "start": date(start_year, start_month, 1).isoformat(),
                     "end": end},
                    {"geography": "Niño 3.4", "product_scope": "ONI ANOM",
                     "season": fields[0], "source_year": year})]


@contextmanager
def _ipv4_only():
    # Scoped process-wide patch. This collector runs requests sequentially.
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
    ipv4 = ipv4 or any(host == domain or host.endswith("." + domain)
                        for domain in ("noaa.gov", "kamis.or.kr"))
    opener = opener or urllib.request.build_opener()
    request = urllib.request.Request(url, data=data, headers={"User-Agent": UA, **(headers or {})})
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
    # Never include exception text, request URLs or credentials.
    raise CollectionError(code) from None


def _fetch_nass(category, **filters):
    key = os.environ.get("NASS_API_KEY")
    if not key:
        raise CollectionError("CREDENTIALS_REQUIRED")
    params = {
        "key": key, "commodity_desc": "CORN", "source_desc": "SURVEY",
        "agg_level_desc": "NATIONAL", "freq_desc": "WEEKLY",
        "domain_desc": "TOTAL", "statisticcat_desc": category, "format": "JSON", **filters,
    }
    return _request(NASS_URL + "?" + urllib.parse.urlencode(params))


def fetch_nass_progress():
    return _fetch_nass("PROGRESS", unit_desc="PCT HARVESTED", util_practice_desc="GRAIN",
                       year__GE=date.today().year - 5)


def fetch_nass_condition():
    return _fetch_nass("CONDITION", year=date.today().year)


def fetch_cftc_disagg():
    params = {"$where": "cftc_contract_market_code='002602'",
              "$order": "report_date_as_yyyy_mm_dd DESC", "$limit": "2"}
    return _request(CFTC_URL + "?" + urllib.parse.urlencode(params))


def fetch_wb_monthly():
    return _request(WB_URL)


def fetch_noaa_bsai_catch():
    return _request(NOAA_BASE + f"car110_bsai_with_cdq{date.today().year}.html", ipv4=True)


def fetch_oni():
    return _request(ONI_URL, ipv4=True)


def _inputs(raw, name):
    parser = _HTML()
    parser.feed(raw.decode("utf-8"))
    return [item.get("value", "") for item in parser.inputs if item.get("name") == name]


def fetch_oasis_retail_csv(item_code="258"):
    """Reproduce oasis_recipe.sh using an in-memory cookie jar."""
    import http.cookiejar
    if item_code != "258":
        raise CollectionError("UNVERIFIED_MAPPING")
    today = date.today()
    year, month = (today.year - 1, 12) if today.month == 1 else (today.year, today.month - 1)
    last = calendar.monthrange(year, month)[1]
    start = date(year, month, min(today.day, last)) + timedelta(days=max(0, today.day - last))
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    _request(OASIS_URL, opener=opener, ipv4=True)
    common = {"pageIndex": "1", "userSelectMenuId": "010103", "gradNm": "",
              "sCalendar": start.isoformat(), "eCalendar": today.isoformat(),
              "pageUnit": "10"}
    form = {**common, "tabId": "", "fileName": "", "cmd": "init", "noData": "0",
            "excelMode": "", "codeType": "code2"}
    def post(path, ajax=True):
        return _request(OASIS_BASE + path, urllib.parse.urlencode(form).encode("utf-8"),
                        opener, True, {
                            "Referer": OASIS_URL,
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                            **({"X-Requested-With": "XMLHttpRequest"} if ajax else {}),
                        })
    found = False
    for category in ("100", "200", "300", "400"):
        form["code1"] = category
        if item_code in _inputs(post("/selectAgriPriceCode.do"), "code2"):
            found = True
            break
    if not found:
        raise CollectionError("UNVERIFIED_MAPPING")
    form.update(code2=item_code, codeType="code3")
    varieties = [value for value in _inputs(
        post("/selectAgriPriceCodeToYear.do?checkAll=CODE3"), "code3") if value != "ALL"]
    if not varieties:
        raise CollectionError("EMPTY_RESULT")
    form.update(code3=varieties[0], codeType="code4")
    grades = [value for value in _inputs(post("/selectAgriPriceCode.do?checkAll=CODE4"), "code4")
              if value != "ALL"]
    if not grades:
        raise CollectionError("EMPTY_RESULT")
    form.update(code4="04" if "04" in grades else grades[0], cmd="service")
    page = _HTML()
    page.feed(post("/basicInfo/retailale/agriPrice.do", ajax=False).decode("utf-8"))
    counts = [item.get("value", "") for item in page.inputs if item.get("id") == "noData"]
    if len(counts) != 1 or not counts[0].isdigit() or int(counts[0]) == 0:
        raise CollectionError("EMPTY_RESULT")
    form.update(noData=counts[0], excelMode="excel")
    name = post("/basicInfo/retailale/agriPriceCsv.do").decode("utf-8").strip().strip('"')
    if not re.fullmatch(r"[^/\\<>\r\n\x00]+\.csv", name):
        raise CollectionError("PARSE_ERROR")
    form["fileName"] = name
    return post("/excelDownload.do", ajax=False)


def _templates(adapter):
    definitions = {
        "nass_progress": [("us_harvest_progress", "미국 옥수수 수확", "%", NASS_URL)],
        "nass_condition": [("us_good_excellent", "미국 옥수수 양호·우수", "%", NASS_URL)],
        "cftc_disagg": [("managed_money_net", "매니지드머니 순포지션", "contracts", CFTC_URL)],
        "wb_monthly": [("wb_maize_price", "세계은행 월간 옥수수 가격", "USD/metric_ton", WB_URL)],
        "oasis_retail_csv": [
            ("retail_price", "깐마늘 당일 평균가", None, OASIS_URL),
            ("normal_price", "깐마늘 평년 평균가", None, OASIS_URL),
            ("normal_change_pct", "깐마늘 평년 대비", "%", OASIS_URL),
            ("year_change_pct", "깐마늘 전년 대비", "%", OASIS_URL)],
        "oni": [("enso_oni", "ENSO ONI 최근 3개월 편차", "°C", ONI_URL)],
    }
    if adapter == "noaa_bsai_catch":
        return _noaa_missing()
    return [_metric(adapter, metric_id, label, unit=unit, source_url=url)
            for metric_id, label, unit, url in definitions[adapter]]


def _load_previous(path):
    try:
        document = json.loads(path.read_bytes())
    except FileNotFoundError:
        return None
    if document.get("schema_version") != "1.0" or not isinstance(document.get("commodities"), dict):
        raise ValueError("invalid previous snapshot")
    return document


def _save_document(path, document):
    serialized = json.dumps(document, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8",
                                         dir=path.parent, prefix=path.name + ".", delete=False) as stream:
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
            "no_value" if candidate["status"] == "no_value" else
            "deferred" if code == "CREDENTIALS_REQUIRED" else
            "no_data" if empty else "source_failed"),
        data_state="present" if has_previous else "missing",
        fetch_state="empty_result" if empty else (
            "not_run" if code == "CREDENTIALS_REQUIRED" and not has_previous else "failed"),
        freshness="stale" if has_previous else "unknown",
        missing_reason="credentials_required" if code == "CREDENTIALS_REQUIRED" else
                       "empty_result" if empty else "source_failure",
        last_attempt_at=now, error_code=code,
    )
    return row


def main(out_path, fixtures_dir=None):
    """Collect, preserve individual failed indicators, atomically save and return JSON."""
    path = Path(out_path)
    previous = _load_previous(path) or {"commodities": {}, "common": []}
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    jobs = [
        ("corn", "nass_progress", "nass_corn_progress.json"),
        ("corn", "nass_condition", "nass_corn_condition.json"),
        ("corn", "cftc_disagg", "cftc_corn.json"),
        ("corn", "wb_monthly", "wb_monthly.xlsx"),
        ("pollock", "noaa_bsai_catch", "noaa_bsai_2026.html"),
        ("garlic", "oasis_retail_csv", "oasis_garlic_daily.csv"),
        ("common", "oni", "oni.txt"),
    ]
    document = {"schema_version": "1.0", "generated_at": now, "collection_interval_days": 14,
                "commodities": {"corn": [], "pollock": [], "garlic": []}, "common": []}
    for commodity, adapter, fixture in jobs:
        old_rows = previous.get("common", []) if commodity == "common" else previous["commodities"].get(commodity, [])
        defaults = _templates(adapter)
        default_ids = {row["id"] for row in defaults}
        old = {row["id"]: row for row in old_rows
               if row.get("context", {}).get("source_adapter") == adapter or row["id"] in default_ids}
        failure, empty = None, False
        try:
            raw = (Path(fixtures_dir) / fixture).read_bytes() if fixtures_dir is not None else globals()["fetch_" + adapter]()
            rows = globals()["parse_" + adapter](raw)
            if not isinstance(rows, list) or any(not isinstance(row, dict) for row in rows):
                raise ValueError("invalid adapter result")
            if not rows:
                failure, empty = "EMPTY_RESULT", True
        except CollectionError as exc:
            rows, failure = [], exc.code
            empty = failure == "EMPTY_RESULT"
        except (ValueError, KeyError, TypeError, IndexError, UnicodeError,
                ET.ParseError, zipfile.BadZipFile):
            rows, failure = [], "PARSE_ERROR"
        except OSError:
            rows, failure = [], "IO_ERROR"
        except Exception:
            rows, failure = [], "ADAPTER_ERROR"
        if failure:
            candidates = list(old.values()) or defaults
            merged = [_failed(row, old.get(row["id"]), now, failure, empty) for row in candidates]
        else:
            ids = [row["id"] for row in rows]
            if len(ids) != len(set(ids)):
                raise ValueError("duplicate indicator ID")
            merged = []
            for row in rows:
                if row["value"] is None and row.get("missing_reason") != "not_applicable":
                    row = _failed(row, old.get(row["id"]), now, "NO_VALUE", empty=True)
                else:
                    row = copy.deepcopy(row)
                    row.update(last_attempt_at=now, last_success_at=now)
                merged.append(row)
            for metric_id, row in old.items():
                if metric_id not in ids:
                    merged.append(_failed(row, row, now, "EMPTY_RESULT", empty=True))
        target = document["common"] if commodity == "common" else document["commodities"][commodity]
        target.extend(merged)
    for rows in list(document["commodities"].values()) + [document["common"]]:
        if len(rows) != len({row["id"] for row in rows}):
            raise ValueError("duplicate indicator ID")
        for row in rows:
            if row["asof"] is not None:
                _iso(row["asof"])
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
        # Suppress raw exception details, including any secret-bearing request URL.
        cli.exit(1, "market-regime collection failed\n")
