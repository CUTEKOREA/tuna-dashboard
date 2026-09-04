#!/usr/bin/env python3
"""돼지고기 보드의 USDA ESR 파생 위젯만 최신 주차로 다시 받는다.

pork_usda_widgets.json 의 5개 위젯은 출처가 두 갈래다.

  · ESR (Export Sales Reporting) — 주간 발행 API. 되받을 수 있다.
        w_us_korea_pork_timeline   미국→한국 월별
        w_us_pork_top_importers    3년 누적 수입국 Top8
  · GAIN 보고서 PDF — 기관이 부정기로 내는 리포트에서 일회성으로 뽑은 값.
        w_china_pork_dominance / w_spain_pork_eu_leader / w_asf_global_spread
    API 가 없다. **이 스크립트는 이 셋을 건드리지 않는다.**

그래서 실행 후에도 파일 안에 syncDate 가 두 종류로 남는 것이 정상이다.
전부를 한 날짜로 맞추면 GAIN 위젯이 갱신된 척하게 되므로 그렇게 하지 않는다(L-09).

  python3 scripts/sync_pork_usda.py           # 최신 주차까지 받아 파일 갱신
  python3 scripts/sync_pork_usda.py --check   # 갱신 없이 현재 파일과 다른지만 본다
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
# 화면이 읽는 것은 `data/` 쪽이다 — lib/data/usda-widgets.ts 가 그것을 import 한다.
# `public/data/` 에도 같은 이름의 사본이 있어 2026-09-04 에 그쪽을 고쳤다가 화면이 안 바뀌었다.
# 두 벌을 함께 쓰되 정본은 data/ 다.
DEFAULT_OUTPUT = ROOT / "data/pork_usda_widgets.json"
MIRROR_OUTPUT = ROOT / "public/data/pork_usda_widgets.json"

API = "https://api.fas.usda.gov/api"
COMMODITY = 1702           # Pork, fresh/chilled/frozen muscle cuts
KOREA = 5800               # KOR REP
ESR_WIDGETS = ("w_us_korea_pork_timeline", "w_us_pork_top_importers")

# 위젯 라벨은 한글이다(L-01). ESR 국가명은 'KOR REP ' 처럼 공백 패딩된 축약형이라 그대로 못 쓴다.
# 코드는 추측하지 말 것 — 2470=도미니카, 2320=버뮤다, 5570=말레이시아처럼 직관과 어긋난다.
# 아래는 /esr/countries 응답에서 확인한 값이고, 없는 코드는 그 축약명을 그대로 노출한다.
COUNTRY_KO = {
    1220: "캐나다", 2010: "멕시코", 2150: "온두라스", 2320: "버뮤다", 2470: "도미니카공화국",
    3010: "콜롬비아", 5570: "말레이시아", 5660: "마카오", 5700: "중국", 5800: "한국",
    5820: "홍콩", 5880: "일본", 6020: "호주", 1: "유럽연합",
}


class SyncError(RuntimeError):
    pass


def fetch(path: str, *, retries: int = 4) -> Any:
    key = os.environ.get("USDA_FAS_API_KEY", "").strip()
    if not key:
        raise SyncError("USDA_FAS_API_KEY 가 없습니다 (.env.local 또는 환경변수)")
    url = f"{API}/{path}"
    last: Exception | None = None
    for attempt in range(retries):
        request = urllib.request.Request(url, headers={"X-Api-Key": key, "Accept": "application/json"})
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                return json.loads(response.read().decode("utf-8"))
        except (OSError, TimeoutError, json.JSONDecodeError) as error:  # noqa: PERF203
            last = error
            time.sleep(2 * (attempt + 1))
    # 키가 URL 에 실리지 않으므로 예외 메시지에 노출될 것이 없다.
    raise SyncError(f"USDA 요청 실패: {path}\n  {type(last).__name__}: {last}")


def market_years(latest: int, back: int) -> list[int]:
    return list(range(latest - back + 1, latest + 1))


def esr_rows(year: int) -> list[dict[str, Any]]:
    rows = fetch(f"esr/exports/commodityCode/{COMMODITY}/allCountries/marketYear/{year}")
    if not isinstance(rows, list):
        raise SyncError(f"ESR 응답이 배열이 아닙니다 (MY{year}): {str(rows)[:120]}")
    return rows


def korea_monthly(rows: list[dict[str, Any]], months: int) -> list[dict[str, Any]]:
    """주간 선적을 월로 접는다. ESR 의 weeklyExports 는 실제 선적량이다."""
    bucket: dict[str, float] = defaultdict(float)
    for row in rows:
        if int(row.get("countryCode", 0)) != KOREA:
            continue
        week = str(row.get("weekEndingDate") or "")[:7]
        if not week:
            continue
        bucket[week] += float(row.get("weeklyExports") or 0)
    ordered = sorted(bucket.items())[-months:]
    return [{"month": m, "weeklyExports": round(v)} for m, v in ordered]


def country_names() -> dict[int, str]:
    """매핑에 없는 코드를 «코드 2470» 대신 원문 축약명으로라도 보이게 한다."""
    try:
        rows = fetch("esr/countries")
    except SyncError:
        return {}
    return {int(r["countryCode"]): str(r.get("countryName", "")).strip()
            for r in rows if r.get("countryCode") is not None}


def top_importers(rows_by_year: dict[int, list[dict[str, Any]]], top: int,
                  names: dict[int, str]) -> list[dict[str, Any]]:
    """누적 선적을 국가별로 더해 상위 N. 단위는 천톤(kt) — 원본 위젯과 같다."""
    total: dict[int, float] = defaultdict(float)
    for rows in rows_by_year.values():
        for row in rows:
            code = int(row.get("countryCode", 0))
            if code <= 0:
                continue
            total[code] += float(row.get("weeklyExports") or 0)
    ranked = sorted(total.items(), key=lambda kv: -kv[1])[:top]
    out = []
    for code, tonnes in ranked:
        out.append({
            "country": COUNTRY_KO.get(code) or names.get(code) or f"코드 {code}",
            "exports_kt": round(tonnes / 1000),
        })
    return out


def latest_week(rows_by_year: dict[int, list[dict[str, Any]]]) -> str:
    weeks = [
        str(row.get("weekEndingDate") or "")[:10]
        for rows in rows_by_year.values() for row in rows
        if row.get("weekEndingDate")
    ]
    if not weeks:
        raise SyncError("ESR 응답에 주차 날짜가 없습니다")
    return max(weeks)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--years", type=int, default=3, help="누적 집계에 쓸 마켓연도 수")
    parser.add_argument("--months", type=int, default=14, help="월별 타임라인 길이")
    parser.add_argument("--check", action="store_true", help="파일을 쓰지 않고 차이만 본다")
    args = parser.parse_args()

    payload = json.loads(args.output.read_text(encoding="utf-8"))
    widgets = {w["id"]: w for w in payload["widgets"]}
    missing = [w for w in ESR_WIDGETS if w not in widgets]
    if missing:
        raise SyncError(f"ESR 위젯이 파일에 없습니다: {missing}")

    years = market_years(date.today().year, args.years)
    rows_by_year = {}
    for year in years:
        rows_by_year[year] = esr_rows(year)
        print(f"  MY{year}: {len(rows_by_year[year])}행", file=sys.stderr)

    week = latest_week(rows_by_year)
    timeline = korea_monthly(rows_by_year[max(years)], args.months)
    importers = top_importers(rows_by_year, top=8, names=country_names())
    if not timeline or not importers:
        raise SyncError("집계 결과가 비었습니다 — 국가코드 매핑을 확인하세요")

    widgets["w_us_korea_pork_timeline"]["data"] = timeline
    widgets["w_us_pork_top_importers"]["data"] = importers

    # 설명문도 같은 숫자에서 만든다. 데이터만 갈고 문장을 두면 화면이 서로 다른 말을 한다 —
    # 2026-09-04 에 실제로 「2025-06~2026-05 · 582K톤」 문장이 2026-01~08 차트 위에 남아 있었다.
    span = f"{timeline[0]['month']}~{timeline[-1]['month']}"
    peak = max(timeline, key=lambda r: r["weeklyExports"])
    avg = sum(r["weeklyExports"] for r in timeline) / len(timeline)
    korea = next((r for r in importers if r["country"] == "한국"), None)
    rank = importers.index(korea) + 1 if korea else None
    kt = lambda v: f"{v:,.0f}K톤" if v < 1000 else f"{v/1000:.1f}M톤"
    top_line = " > ".join(f"{r['country']} {kt(r['exports_kt'])}" for r in importers[:4])

    tl = widgets["w_us_korea_pork_timeline"]
    tl["cardDesc"] = (
        f"ESR 주간→월간 집계({span}). 한국 {years[0]}~{years[-1]}년 누적 "
        f"{kt(korea['exports_kt']) if korea else '-'}, 세계 {rank}위. "
        f"{peak['month']} {peak['weeklyExports']/1000:.1f}K톤 피크."
    )
    tl["sit"] = (
        f"미국→한국 Pork 평균 {avg/1000:.1f}K톤/월({span}). "
        f"{peak['month']} {peak['weeklyExports']/1000:.1f}K톤이 최고, "
        f"{min(timeline, key=lambda r: r['weeklyExports'])['month']} "
        f"{min(r['weeklyExports'] for r in timeline)/1000:.1f}K톤이 최저다. "
        f"{years[0]}~{years[-1]}년 누적 {kt(korea['exports_kt']) if korea else '-'}로 세계 {rank}위. "
        f"KORUS 무관세와 ASF 청정 공급원이라는 위치는 그대로다."
    )
    ti = widgets["w_us_pork_top_importers"]
    ti["cardDesc"] = f"USDA FAS ESR 주간 {len(years)}년 누적(상위 {len(importers)}개국). {top_line}."
    ti["sit"] = (
        f"USDA FAS ESR MY{years[0]}~{years[-1]} 누적 기준 미국 Pork 수출 상위는 {top_line} 순이다. "
        f"1위 {importers[0]['country']}가 상위 8개국 합계의 "
        f"{importers[0]['exports_kt']/sum(r['exports_kt'] for r in importers)*100:.0f}%를 차지한다."
    )

    for wid in ESR_WIDGETS:
        widgets[wid]["syncDate"] = week
        widgets[wid]["telemetry"] = "SYNCED"
        widgets[wid]["source"] = f"USDA FAS ESR {COMMODITY} (MY{years[0]}~{years[-1]}, ~{week})"

    meta = payload.setdefault("_meta", {})
    meta["esrRefreshed"] = week
    meta["esrRefreshedAt"] = date.today().isoformat()
    meta["note"] = (
        "ESR 파생 위젯(w_us_korea_pork_timeline, w_us_pork_top_importers)만 주간 갱신된다. "
        "나머지 세 위젯은 USDA GAIN 보고서 PDF 에서 일회성으로 뽑은 값이라 API 가 없고, "
        "그래서 syncDate 가 서로 다른 것이 정상이다."
    )

    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        same = args.output.read_text(encoding="utf-8") == text
        print(json.dumps({"latestWeek": week, "changed": not same}, ensure_ascii=False, indent=2))
        return 0
    args.output.write_text(text, encoding="utf-8")
    # 사본이 갈라지면 어느 쪽이 화면인지 다시 헷갈린다. 같이 쓴다.
    if args.output.resolve() == DEFAULT_OUTPUT.resolve() and MIRROR_OUTPUT.exists():
        MIRROR_OUTPUT.write_text(text, encoding="utf-8")
    print(json.dumps({
        "output": str(args.output), "latestWeek": week,
        "timelineMonths": len(timeline), "importers": len(importers),
        "untouched": [w["id"] for w in payload["widgets"] if w["id"] not in ESR_WIDGETS],
        "mirrored": str(MIRROR_OUTPUT) if MIRROR_OUTPUT.exists() else None,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SyncError as error:
        print(f"❌ {error}", file=sys.stderr)
        raise SystemExit(1) from error
