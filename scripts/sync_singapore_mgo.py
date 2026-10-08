#!/usr/bin/env python3
"""싱가포르 MGO 벙커 시세를 Ship & Bunker 가격 API에서 받아 저장소 JSON으로 동기화한다.

원자료: https://shipandbunker.com/a/.json (POST, api-method=pricesForAllSeriesGet).
페이지의 Highcharts 그래프가 쓰는 공개 엔드포인트라 로그인 없이 약 3년치 일별 종가가 온다.
등급은 MGO(0.1% DMA, 사이트 표기 'MGO' — 'LSMGO' 시리즈와 값이 같다).

출력: public/data/singapore_mgo.json
  meta   — 출처·요청·받은 시각·행 수·기간·일별 payload SHA-256
  daily  — [[YYYY-MM-DD, $/t], ...] 영업일 종가
  weekly — [[화요일, $/t, 실제 사용한 영업일], ...] 파노피·방콕 주간보고 보고일(화)에 맞춘 값.
           화요일 값이 없으면 직전 영업일(최대 4일 전)을 쓴다. 보간하지 않는다.

사용: python3 scripts/sync_singapore_mgo.py [--input saved.json] [--output path] [--check]
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "public/data/singapore_mgo.json"
API_URL = "https://shipandbunker.com/a/.json"
MARKET = "SG SIN"
PRODUCT = "MGO"
QUERY = {"api-method": "pricesForAllSeriesGet", "resource": "MarketPriceGraph_Block", "mc0": MARKET, "pc0": PRODUCT}
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0 Safari/537.36"
TUESDAY = 1  # date.weekday(): 월=0
MAX_LOOKBACK_DAYS = 4


def fetch_raw(timeout: int = 30) -> dict:
    body = urllib.parse.urlencode(QUERY).encode()
    req = urllib.request.Request(
        API_URL,
        data=body,
        headers={
            "User-Agent": USER_AGENT,
            "Referer": "https://shipandbunker.com/prices/apac/sea/sg-sin-singapore",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.loads(res.read().decode("utf8"))


def parse_daily(raw: dict, product: str = PRODUCT) -> list[list]:
    """API 응답 → [[date, price], ...] 오름차순. daynum은 day_list 로 epoch(ms)에 대응한다."""
    data = raw["api"][MARKET]["data"]
    day_list = data["day_list"][product]
    rows: dict[str, float] = {}
    for daynum, price in data["prices"][product]["dayprice"]:
        if price is None:
            continue
        ts = day_list.get(str(daynum))
        if ts is None:
            continue
        day = datetime.fromtimestamp(ts / 1000, timezone.utc).date().isoformat()
        rows[day] = float(price)
    return [[d, rows[d]] for d in sorted(rows)]


def weekly_on_tuesday(daily: list[list]) -> list[list]:
    """매주 화요일 값. 화요일 종가가 없으면 직전 영업일(최대 4일)로 대체하고 사용한 날짜를 남긴다."""
    by_date = {d: v for d, v in daily}
    first = date.fromisoformat(daily[0][0])
    last = date.fromisoformat(daily[-1][0])
    cur = first + timedelta(days=(TUESDAY - first.weekday()) % 7)
    out = []
    while cur <= last:
        for back in range(MAX_LOOKBACK_DAYS + 1):
            key = (cur - timedelta(days=back)).isoformat()
            if key in by_date:
                out.append([cur.isoformat(), by_date[key], key])
                break
        cur += timedelta(days=7)
    return out


def build_payload(raw: dict, fetched_at: str) -> dict:
    daily = parse_daily(raw)
    if len(daily) < 100:
        raise SystemExit(f"일별 행이 {len(daily)}개뿐 — 응답 형식이 바뀌었는지 확인 필요")
    weekly = weekly_on_tuesday(daily)
    digest = hashlib.sha256(json.dumps(daily, separators=(",", ":")).encode()).hexdigest()
    return {
        "meta": {
            "source": "Ship & Bunker — Singapore bunker prices",
            "sourceUrl": "https://shipandbunker.com/prices/apac/sea/sg-sin-singapore",
            "api": {"url": API_URL, "query": QUERY},
            "grade": "MGO (0.1%S DMA, 사이트 표기 MGO)",
            "unit": "USD/MT",
            "fetchedAt": fetched_at,
            "dailyRows": len(daily),
            "weeklyRows": len(weekly),
            "first": daily[0][0],
            "last": daily[-1][0],
            "dailySha256": digest,
            "weeklyRule": "화요일 종가, 없으면 직전 영업일(최대 4일). 보간 없음.",
        },
        "daily": daily,
        "weekly": weekly,
    }


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--input", type=Path, help="저장해 둔 API 응답 JSON(오프라인 재생)")
    ap.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    ap.add_argument("--check", action="store_true", help="기존 출력의 daily 와 같은지만 확인")
    args = ap.parse_args(argv)

    raw = json.loads(args.input.read_text()) if args.input else fetch_raw()
    fetched_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    payload = build_payload(raw, fetched_at)

    if args.check:
        current = json.loads(args.output.read_text()) if args.output.exists() else {}
        same = current.get("daily") == payload["daily"]
        print(("✅ 동일" if same else "⚠️  차이 있음") + f" — 최신 {payload['meta']['last']} ${payload['daily'][-1][1]:,.1f}")
        return 0 if same else 1

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n")
    m = payload["meta"]
    print(f"싱가포르 MGO 동기화 완료: {args.output} — 일별 {m['dailyRows']}행 ({m['first']}~{m['last']}), 주간 {m['weeklyRows']}행, 최신 ${payload['daily'][-1][1]:,.1f}/t")
    return 0


if __name__ == "__main__":
    sys.exit(main())
