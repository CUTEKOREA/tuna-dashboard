#!/usr/bin/env python3
"""COSMO 시장 보드가 쓰는 유럽 수입 통계를 1차 출처에서 다시 받아 온다.

두 출처의 발행 주기가 다르다 — Eurostat COMEXT 는 EU 회원국을, HMRC OTS 는 영국을
각각 월 단위로 내고 지연도 다르다. 그래서 **기간을 맞춰 자르는 일**이 이 스크립트의
핵심이다. 두 출처가 공통으로 덮는 마지막 달까지만 «완결 구간»으로 표시하고,
그보다 앞선 달이 한쪽에만 있으면 버린다. 절대 보간하지 않는다.

  python3 scripts/sync_trade_stats.py --year 2026 --through 2026-06
  python3 scripts/sync_trade_stats.py --probe          # 각 출처의 최신 발행월만 보고
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "public/data/cosmo/trade_stats.json"

EUROSTAT = "https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409"
HMRC = "https://api.uktradeinfo.com/OTS"
ECB = "https://data-api.ecb.europa.eu/service/data/EXR"

HS_CODES = ("160414", "030487")

# COMEXT 는 HS6 을 그대로 받는다. 8자리(16041400)를 넣으면 조용히 빈 결과가 온다.
EU_REPORTERS = {
    "DE": "Germany", "IT": "Italy", "NL": "Netherlands", "ES": "Spain",
    "BE": "Belgium", "IE": "Ireland", "DK": "Denmark", "SI": "Slovenia",
}
# HMRC 는 수입을 EU(1)·비EU(3) 두 흐름으로 쪼개 낸다. 둘을 더해야 총수입이다.
HMRC_IMPORT_FLOWS = (1, 3)

USER_AGENT = "tuna-dashboard trade-stats sync (+https://leedonggun.co.kr)"


class SyncError(RuntimeError):
    pass


def fetch(
    url: str, params: dict[str, Any] | None = None, *, retries: int = 5, pace: float = 0.0,
) -> Any:
    """HMRC 는 연속 호출에 연결을 끊는다(ConnectionReset·403). 지수 백오프로 되받고,
    호출 사이에 pace 만큼 쉰다. Eurostat 은 조여 오지 않아 pace 0 이면 된다."""
    full = url + ("?" + urllib.parse.urlencode(params, doseq=True) if params else "")
    last: Exception | None = None
    for attempt in range(retries):
        if pace and attempt == 0:
            time.sleep(pace)
        request = urllib.request.Request(full, headers={"Accept": "application/json", "User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                return json.loads(response.read().decode("utf-8"))
        except (OSError, TimeoutError, json.JSONDecodeError) as error:  # noqa: PERF203
            last = error
            time.sleep(3 * (2 ** attempt))
    raise SyncError(f"요청 실패: {full}\n  {last}")


HMRC_PACE = 1.5


# ----------------------------------------------------------------- Eurostat

def eurostat_cell(hs: str, reporter: str, partner: str, period: str, indicator: str) -> float | None:
    """한 셀만 읽는다. COMEXT 는 필터가 넓으면 413(추출 과다)으로 거절한다."""
    payload = fetch(EUROSTAT, {
        "format": "JSON", "PRODUCT": hs, "REPORTER": reporter, "PARTNER": partner,
        "FLOW": 1, "INDICATORS": indicator, "time": period,
    })
    if "error" in payload:
        raise SyncError(f"COMEXT 오류 {reporter}/{partner}/{period}: {payload['error']}")
    values = payload.get("value") or {}
    if not values:
        return None
    return float(next(iter(values.values())))


# 파트너 축에는 개별국뿐 아니라 집계가 섞여 있다 — Extra-EU, Intra-euro area,
# Extra-EU27(from 2020) 등. 같은 값이 여러 코드로 중복돼 나오므로 합치면 국가 총계가
# 2~3배로 부푼다. 집계 코드는 해마다 늘어나 고정 목록으로는 못 막는다.
# 개별국은 예외 없이 2자리 ISO 코드이므로, 그것만 통과시키고 라벨로 한 번 더 거른다.
AGGREGATE_LABEL_HINTS = (
    "extra-", "intra-", "euro area", "european union", "total",
    "not specified", "countries", "eu27", "eu28",
)


# COMEXT 라벨에는 연혁 주석이 붙는다 — "Viet Nam (incl. North Viet Nam 'VD' from 1977)",
# "Spain (incl. Canary Islands 'XB' from 1997)". 표에 그대로 넣으면 이름 열이 부풀어
# 금액·점유 열을 화면 밖으로 밀어낸다. 주석 괄호만 떼고 국가명은 원문 그대로 둔다.
ANNOTATION = re.compile(r"\s*\((?:incl\.|excl\.|from |until |-> ).*$", re.IGNORECASE)


def clean_partner_label(label: str) -> str:
    return ANNOTATION.sub("", label).strip()


def is_country_partner(code: str, label: str) -> bool:
    if len(code) != 2 or not code.isalpha():
        return False
    lowered = label.lower()
    return not any(hint in lowered for hint in AGGREGATE_LABEL_HINTS)


def eurostat_month(hs: str, reporter: str, period: str) -> dict[str, dict[str, float]]:
    """한 보고국·한 달의 전 파트너 값을 파트너 코드로 풀어 돌려준다."""
    out: dict[str, dict[str, float]] = defaultdict(dict)
    for indicator, key in (("VALUE_IN_EUROS", "eur"), ("QUANTITY_IN_100KG", "q100kg")):
        payload = fetch(EUROSTAT, {
            "format": "JSON", "PRODUCT": hs, "REPORTER": reporter,
            "FLOW": 1, "INDICATORS": indicator, "time": period,
        })
        if "error" in payload:
            raise SyncError(f"COMEXT 오류 {reporter}/{period}/{indicator}: {payload['error']}")
        values = payload.get("value") or {}
        if not values:
            continue
        dimension = payload["dimension"]
        order: list[str] = payload["id"]
        sizes: list[int] = payload["size"]
        partner_axis = order.index("partner")
        partner_index = dimension["partner"]["category"]["index"]
        by_position = {position: code for code, position in partner_index.items()}
        # jsonstat 은 값을 평탄한 인덱스로 준다 — 파트너 축 좌표만 되짚는다.
        strides = [1] * len(sizes)
        for axis in range(len(sizes) - 2, -1, -1):
            strides[axis] = strides[axis + 1] * sizes[axis + 1]
        labels = dimension["partner"]["category"].get("label", {})
        for flat, value in values.items():
            position = (int(flat) // strides[partner_axis]) % sizes[partner_axis]
            partner = by_position.get(position)
            if not partner:
                continue
            label = labels.get(partner, partner)
            if not is_country_partner(partner, label):
                continue
            out[partner][key] = float(value)
            out[partner]["_label"] = clean_partner_label(label)  # type: ignore[assignment]
    return out


def eurostat_latest_period(hs: str = "160414", reporter: str = "DE") -> str:
    """가장 최근에 값이 있는 달. 발행 지연을 추정하지 않고 실제로 찔러 확인한다."""
    today = date.today()
    year, month = today.year, today.month
    for _ in range(8):
        month -= 1
        if month == 0:
            year, month = year - 1, 12
        period = f"{year}-{month:02d}"
        if eurostat_cell(hs, reporter, "GH", period, "VALUE_IN_EUROS") is not None:
            return period
    raise SyncError("COMEXT 최신 발행월을 찾지 못했습니다")


# --------------------------------------------------------------------- HMRC

def hmrc_commodity_ids(hs: str) -> list[int]:
    payload = fetch("https://api.uktradeinfo.com/Commodity", {
        "$filter": f"Hs6Code eq '{hs}'", "$select": "CommodityId", "$top": 200,
    }, pace=HMRC_PACE)
    ids = [int(row["CommodityId"]) for row in payload.get("value", [])]
    if not ids:
        raise SyncError(f"HMRC 에서 HS {hs} 의 CN8 코드를 찾지 못했습니다")
    return ids


# OTS 는 한 요청의 결과 수와 필터 길이 모두에 상한이 있다. 한 번에 6개월치를
# 요청하면 400 이 돌아오므로 달 단위로 끊고, 그 안에서 $skip 으로 페이지를 넘긴다.
HMRC_PAGE = 1000


def hmrc_rows(hs: str, months: Iterable[str]) -> list[dict[str, Any]]:
    ids = hmrc_commodity_ids(hs)
    commodity_clause = " or ".join(f"CommodityId eq {i}" for i in ids)
    flow_clause = " or ".join(f"FlowTypeId eq {f}" for f in HMRC_IMPORT_FLOWS)
    rows: list[dict[str, Any]] = []
    for month in months:
        month_id = int(month.replace("-", ""))
        skip = 0
        while True:
            payload = fetch(HMRC, {
                "$filter": f"MonthId eq {month_id} and ({flow_clause}) and ({commodity_clause})",
                "$select": "MonthId,FlowTypeId,CountryId,Value,NetMass",
                "$top": HMRC_PAGE, "$skip": skip,
            }, pace=HMRC_PACE)
            if "error" in payload:
                raise SyncError(f"HMRC 오류 {month}: {payload['error']}")
            page = payload.get("value", [])
            rows.extend(page)
            if len(page) < HMRC_PAGE:
                break
            skip += HMRC_PAGE
    return rows


def hmrc_latest_month(hs: str = "160414") -> str:
    ids = hmrc_commodity_ids(hs)
    commodity_clause = " or ".join(f"CommodityId eq {i}" for i in ids)
    today = date.today()
    start = int(f"{today.year}{1:02d}")
    months: set[int] = set()
    skip = 0
    while True:
        payload = fetch(HMRC, {
            "$filter": f"MonthId ge {start} and ({commodity_clause})",
            "$select": "MonthId", "$top": HMRC_PAGE, "$skip": skip,
        }, pace=HMRC_PACE)
        page = payload.get("value", [])
        months.update(int(row["MonthId"]) for row in page)
        if len(page) < HMRC_PAGE:
            break
        skip += HMRC_PAGE
    if not months:
        raise SyncError("HMRC 에서 올해 발행분을 찾지 못했습니다")
    latest = max(months)
    return f"{latest // 100}-{latest % 100:02d}"


def hmrc_countries() -> dict[int, str]:
    payload = fetch("https://api.uktradeinfo.com/Country", {
        "$select": "CountryId,CountryName", "$top": 2000,
    }, pace=HMRC_PACE)
    return {int(r["CountryId"]): r["CountryName"] for r in payload.get("value", [])}


# ----------------------------------------------------------------------- FX

def ecb_average(series: str, months: list[str]) -> float:
    """월평균 환율의 단순 평균. 기간이 다르면 값도 달라야 하므로 기간을 받아서 계산한다."""
    payload = fetch(f"{ECB}/{series}", {
        "format": "jsondata",
        "startPeriod": months[0], "endPeriod": months[-1],
        "detail": "dataonly",
    })
    sets = payload["dataSets"][0]["series"]
    values = next(iter(sets.values()))["observations"]
    rates = [v[0] for v in values.values() if v and v[0] is not None]
    if not rates:
        raise SyncError(f"ECB {series} 환율이 비어 있습니다")
    return sum(rates) / len(rates)


# ---------------------------------------------------------------------- main

def months_between(start: str, end: str) -> list[str]:
    year, month = int(start[:4]), int(start[5:7])
    last_year, last_month = int(end[:4]), int(end[5:7])
    out: list[str] = []
    while (year, month) <= (last_year, last_month):
        out.append(f"{year}-{month:02d}")
        month += 1
        if month == 13:
            year, month = year + 1, 1
    return out


def probe() -> dict[str, str]:
    eurostat = eurostat_latest_period()
    hmrc = hmrc_latest_month()
    common = min(eurostat, hmrc)
    return {"eurostatLastPeriod": eurostat, "hmrcLastPeriod": hmrc, "commonThrough": common}


def collect_eurostat(hs: str, months: list[str]) -> dict[str, dict[str, dict[str, float]]]:
    """보고국 → 파트너 → {eur, kg}. 달을 합산해 기간 총계로 만든다."""
    result: dict[str, dict[str, dict[str, float]]] = {}
    for iso, name in EU_REPORTERS.items():
        totals: dict[str, dict[str, float]] = defaultdict(lambda: {"eur": 0.0, "kg": 0.0})
        for period in months:
            for partner, cell in eurostat_month(hs, iso, period).items():
                label = cell.get("_label")
                if label:
                    totals[partner]["_label"] = label  # type: ignore[assignment]
                totals[partner]["eur"] += cell.get("eur", 0.0)
                totals[partner]["kg"] += cell.get("q100kg", 0.0) * 100
        result[name] = dict(totals)
        print(f"  Eurostat {name}: 파트너 {len(totals)}", file=sys.stderr)
    return result


def collect_hmrc(hs: str, months: list[str]) -> dict[str, dict[str, float]]:
    """영국 파트너 → {gbp, kg}. 수입 두 흐름(EU·비EU)을 합친다."""
    names = hmrc_countries()
    totals: dict[str, dict[str, float]] = defaultdict(lambda: {"gbp": 0.0, "kg": 0.0})
    for row in hmrc_rows(hs, months):
        partner = names.get(int(row["CountryId"]), f"CountryId {row['CountryId']}")
        totals[partner]["gbp"] += float(row.get("Value") or 0.0)
        totals[partner]["kg"] += float(row.get("NetMass") or 0.0)
    print(f"  HMRC United Kingdom: 파트너 {len(totals)}", file=sys.stderr)
    return dict(totals)


def build_rows(
    hs: str, year: int, months: list[str], eur_usd: float, gbp_usd: float,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    period_label = f"{months[0].replace('-', '-')}..{months[-1]}"
    imports: list[dict[str, Any]] = []
    suppliers: list[dict[str, Any]] = []

    def emit(country: str, iso: str | None, rows: dict[str, dict[str, float]],
             ccy: str, rate: float, source: str) -> None:
        value_native = sum(r.get("eur", r.get("gbp", 0.0)) for r in rows.values())
        qty = sum(r.get("kg", 0.0) for r in rows.values())
        if value_native <= 0:
            return
        value_usd = value_native * rate
        entry: dict[str, Any] = {
            "country": country, "hs": hs, "year": year,
            "valueUsd": round(value_usd, 2), "qtyKg": round(qty, 2),
            "unitUsdKg": round(value_usd / qty, 2) if qty else None,
            "valueNative": round(value_native, 2), "nativeCcy": ccy, "fxToUsd": rate,
            "source": source, "grade": "A", "period": period_label,
        }
        if iso:
            entry["iso"] = iso
        imports.append(entry)
        for partner, cell in sorted(rows.items(), key=lambda kv: -kv[1].get("eur", kv[1].get("gbp", 0.0))):
            native = cell.get("eur", cell.get("gbp", 0.0))
            partner_kg = cell.get("kg", 0.0)
            if native <= 0:
                continue
            partner_usd = native * rate
            suppliers.append({
                "country": country, "hs": hs, "year": year,
                "partner": str(cell.get("_label", partner)),
                "partnerIso": partner if len(str(partner)) == 2 else None,
                "valueUsd": round(partner_usd, 2), "qtyKg": round(partner_kg, 2),
                "unitUsdKg": round(partner_usd / partner_kg, 2) if partner_kg else None,
                "share": round(partner_kg / qty * 100, 2) if qty else None,
                "shareBasis": "quantity",
                "source": source, "grade": "A", "period": period_label,
            })

    eurostat_source = f"{EUROSTAT} (Eurostat COMEXT)"
    for country, rows in collect_eurostat(hs, months).items():
        iso = next((k for k, v in EU_REPORTERS.items() if v == country), None)
        emit(country, iso, rows, "EUR", eur_usd, eurostat_source)

    uk = {p: {"gbp": c["gbp"], "kg": c["kg"], "_label": p} for p, c in collect_hmrc(hs, months).items()}
    emit("United Kingdom", "GB", uk, "GBP", gbp_usd, f"{HMRC} (HMRC Overseas Trade Statistics)")
    return imports, suppliers


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--year", type=int, default=date.today().year)
    parser.add_argument("--through", help="마지막 달 (YYYY-MM). 생략하면 두 출처의 공통 최신월")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--probe", action="store_true", help="발행 현황만 보고 끝낸다")
    parser.add_argument(
        "--also-through", action="append", default=[], metavar="YYYY-MM",
        help="같은 해에 대해 추가로 만들 구간의 마지막 달. COSMO 원장이 1~5월이면 "
             "시장 통계도 1~5월 창이 있어야 단가를 같은 기간으로 비교할 수 있다. 여러 번 지정 가능.",
    )
    args = parser.parse_args()

    if args.probe:
        print(json.dumps(probe(), ensure_ascii=False, indent=2))
        return 0

    coverage = probe()
    through = args.through or coverage["commonThrough"]
    if through > coverage["commonThrough"]:
        raise SyncError(
            f"요청한 {through} 는 두 출처의 공통 발행 범위({coverage['commonThrough']})를 넘습니다. "
            f"Eurostat {coverage['eurostatLastPeriod']}, HMRC {coverage['hmrcLastPeriod']}."
        )
    windows: list[str] = []
    for candidate in [*args.also_through, through]:
        if candidate > coverage["commonThrough"]:
            raise SyncError(f"{candidate} 는 공통 발행 범위({coverage['commonThrough']})를 넘습니다")
        if candidate not in windows:
            windows.append(candidate)
    windows.sort()

    existing = json.loads(args.output.read_text(encoding="utf-8")) if args.output.exists() else {
        "meta": {}, "imports": [], "suppliers": [],
    }
    imports = [r for r in existing["imports"] if r["year"] != args.year]
    suppliers = [r for r in existing["suppliers"] if r["year"] != args.year]
    period_labels: list[str] = []
    fx_by_window: dict[str, dict[str, float]] = {}

    for window_end in windows:
        months = months_between(f"{args.year}-01", window_end)
        print(f"기간 {months[0]}..{months[-1]} ({len(months)}개월)", file=sys.stderr)

        # 환율도 구간마다 다르다. 1~5월과 1~6월에 같은 평균을 쓰면 그만큼 값이 어긋난다.
        eur_usd = ecb_average("D.USD.EUR.SP00.A", months)
        gbp_eur = ecb_average("D.GBP.EUR.SP00.A", months)
        gbp_usd = eur_usd / gbp_eur
        print(f"  환율 EUR→USD {eur_usd:.6f} · GBP→USD {gbp_usd:.6f}", file=sys.stderr)

        for hs in HS_CODES:
            print(f"  HS {hs}", file=sys.stderr)
            new_imports, new_suppliers = build_rows(hs, args.year, months, eur_usd, gbp_usd)
            imports.extend(new_imports)
            suppliers.extend(new_suppliers)

        label = f"{months[0]}..{months[-1]}"
        period_labels.append(label)
        fx_by_window[label] = {"eurUsd": eur_usd, "gbpUsd": gbp_usd}

    months = months_between(f"{args.year}-01", through)
    period_label = f"{months[0]}..{months[-1]}"
    meta = dict(existing.get("meta") or {})
    meta["collected"] = date.today().isoformat()
    meta["hs"] = list(HS_CODES)
    meta["sources"] = {"eurostat": EUROSTAT, "hmrc": HMRC, "ecb_fx": ECB}
    meta["coverage"] = {
        "eurostatLastPeriod": coverage["eurostatLastPeriod"],
        "hmrcLastPeriod": coverage["hmrcLastPeriod"],
        f"{args.year}Period": period_label,
        f"{args.year}Windows": period_labels,
    }
    fx = dict(meta.get("fx") or {})
    for label, rates in fx_by_window.items():
        fx.setdefault("eurUsd", {})[f"{args.year}:{label}"] = rates["eurUsd"]
        fx.setdefault("gbpUsd", {})[f"{args.year}:{label}"] = rates["gbpUsd"]
    fx["note"] = "ECB reference rates; GBP->USD is cross-derived as (USD/EUR)/(GBP/EUR)"
    meta["fx"] = fx
    meta["note"] = (
        f"Primary sources only. EU = Eurostat COMEXT DS-045409 (EUR, qty in 100kg converted to kg); "
        f"United Kingdom = HMRC uktradeinfo OTS (GBP, kg, import flows 1+3 summed). "
        f"valueUsd is converted at the ECB reference rate in fxToUsd; valueNative/nativeCcy hold the "
        f"unconverted figure. Quantities are NET MASS in kg. Shares are quantity-based. "
        f"WARNING 1: Netherlands and Belgium include quasi-transit trade (Rotterdam/Antwerp effect) and "
        f"are 25-42% above the same country's UN Comtrade declaration - do not treat as domestic "
        f"consumption. WARNING 2: {args.year} covers {period_label} for BOTH sources - a part year, not a "
        f"full one; never compare its absolute level against a full year. No estimation or "
        f"interpolation: missing items are absent, not filled."
    )

    payload = {"meta": meta, "imports": imports, "suppliers": suppliers}
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(args.output), "period": period_label,
        "importRows": len(imports), "supplierRows": len(suppliers),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SyncError as error:
        print(f"❌ {error}", file=sys.stderr)
        raise SystemExit(1) from error
