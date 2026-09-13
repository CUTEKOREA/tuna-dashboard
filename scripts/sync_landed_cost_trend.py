#!/usr/bin/env python3
"""항로별 해상 운송비용 × 원/달러 환율 → 착지원가 추세 스냅숏.

    python3 scripts/sync_landed_cost_trend.py [개월수]

「지금 들여오면 원가가 오르는 국면인가」를 한 화면에서 보려면 두 시계열이 같이 있어야 한다.

  · 관세청 해상 수출입 운송비용 — 단위가 **천원/2TEU** 다(40피트 컨테이너 1대, 원화).
    달러도 톤당도 아니다. 출처: 관세청 수출입무역통계 「수출입운임통계 → 해상컨테이너운임」.
  · 한국은행 ECOS 원/달러 — 일별만 있어(731Y001 은 월 주기가 없다) 월평균을 여기서 낸다.

운임은 원화라 환율이 올라도 그 자체는 안 변한다. 달러로 값을 매기는 원물과 합칠 때
환율이 들어오므로 두 줄을 같은 화면에 둔다.
"""
from __future__ import annotations

import asyncio
import json
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/data/landed_cost_trend_v1.json"

sys.path.insert(0, str(Path.home() / "silla-mcp/packages/trade-fishery/src"))
sys.path.insert(0, str(Path.home() / "silla-mcp/packages/core/src"))
sys.path.insert(0, str(Path.home() / "silla-mcp/packages/macro/src"))
from silla_mcp.macro import api_client as macro  # noqa: E402
from silla_mcp.trade_fishery import api_client as api  # noqa: E402

ROUTES = {"USW": "미국서부", "USE": "미국동부", "EU": "유럽연합", "CN": "중국", "JP": "일본", "VN": "베트남"}


def months_before(yymm: str, n: int) -> str:
    year, month = int(yymm[:4]), int(yymm[4:])
    total = year * 12 + (month - 1) - n
    return f"{total // 12}{total % 12 + 1:02d}"


async def main(months: int) -> int:
    today = date.today()
    # 공표가 두세 달 늦는다. 지난달부터 뒤로 훑어 값이 있는 달을 찾는다.
    end = f"{today.year}{today.month:02d}"
    end = months_before(end, 1)
    start = months_before(end, months - 1)

    freight: dict[str, dict[str, float]] = defaultdict(dict)
    for code in ROUTES:
        rows, _url, _total = await api.kcs_freight(code, "수입", start, end, max_rows=200)
        for row in rows:
            period = str(row.get("year", "")).replace(".", "")
            value = str(row.get("imexTrnpCst", "")).replace(",", "")
            if period and value.isdigit():
                freight[period][code] = int(value)
    if not freight:
        print("운임을 못 받았다. 기간과 키를 확인한다.", file=sys.stderr)
        return 1

    # ECOS 일별 → 월평균. 731Y001 은 월 주기가 없어 INFO-200 이 온다.
    first, last = min(freight), max(freight)
    fx_rows, _fx_url, _fx_total = await macro.ecos_series(
        "731Y001", "D", f"{first}01", f"{last}31", "0000001", max_rows=2000
    )
    buckets: dict[str, list[float]] = defaultdict(list)
    for row in fx_rows:
        period, value = str(row.get("period", "")), row.get("value")
        if len(period) == 8 and isinstance(value, (int, float)):
            buckets[period[:6]].append(float(value))
    fx = {k: round(sum(v) / len(v), 1) for k, v in buckets.items() if v}

    series = [
        {
            "period": f"{p[:4]}.{p[4:]}",
            **{code: freight[p].get(code) for code in ROUTES},
            "환율": fx.get(p),
        }
        for p in sorted(freight)
    ]
    payload = {
        "_meta": {
            "출처": "관세청 해상 수출입 운송비용(data.go.kr 15129097) · 한국은행 ECOS 731Y001",
            "조회일": today.isoformat(),
            "기간": f"{first}~{last}",
            "운임단위": "천원/2TEU (40피트 컨테이너 1대, 원화). 달러도 톤당도 아니다",
            "환율": "원/달러 매매기준율 일별의 월평균. ECOS 는 이 표에 월 주기를 주지 않는다",
            "방향": "수입(imexTpcd=2)",
        },
        "항로": ROUTES,
        "series": series,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    got = [c for c in ROUTES if any(r.get(c) for r in series)]
    print(f"{OUT.relative_to(ROOT)} — {len(series)}개월 · 항로 {len(got)}개 · 환율 {sum(1 for r in series if r['환율'])}개월")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main(int(sys.argv[1]) if len(sys.argv) > 1 else 24)))
