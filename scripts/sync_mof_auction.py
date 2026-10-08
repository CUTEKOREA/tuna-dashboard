#!/usr/bin/env python3
"""해수부 위판장별 위탁판매 → 품목별 일별 단가 스냅숏.

    python3 scripts/sync_mof_auction.py [일수]

대시보드가 쓰던 위판 숫자는 정적 집계(2021~2025)이거나 자체 추정치였다. 이 API 는 **일별·위판장별**
실거래를 준다. 페이지에서 직접 부르지 않는 이유는 하루치가 1만 6천 행이라서다 —
어종으로 좁혀 받아 여기서 미리 집계하고, 화면은 이 JSON 만 읽는다.

실측(2026-09-13):
  · 하루 전체는 16,456행. 어종 없이 받으면 40초가 걸리고 core 페이지 상한(1만 행)에 걸린다.
  · `mprcStdCodeNm` 은 부분일치 필터가 먹는다. 「오징어」로 좁히면 697행이라 몇 초면 끝난다.
  · 주말·공휴일은 위판이 없어 결과코드 03 이다. 빈 날로 적고 넘어간다.
"""
from __future__ import annotations

import asyncio
import json
import sys
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/data/mof_auction_daily_v1.json"

sys.path.insert(0, str(Path.home() / "silla-mcp/packages/trade-fishery/src"))
sys.path.insert(0, str(Path.home() / "silla-mcp/packages/core/src"))
from silla_mcp.trade_fishery import api_client as api  # noqa: E402
from silla_mcp_core import DataGoError, UpstreamError  # noqa: E402

# 대시보드 품목 메뉴에 맞춘 검색어. 부분일치라 「오징어」가 갑오징어류까지 잡는다 —
# 잡힌 표준명을 그대로 실어 보내 화면에서 갈라 볼 수 있게 한다.
SPECIES = ["오징어", "고등어", "문어", "새우", "갈치"]


def num(value: object) -> float:
    try:
        return float(str(value).replace(",", ""))
    except (TypeError, ValueError):
        return 0.0


async def fetch_day(day: str, keyword: str) -> list[dict]:
    try:
        rows, _url, _label, _total = await api.mof(
            "auction", {"baseDt": day, "mprcStdCodeNm": keyword}, max_rows=5000
        )
        return rows
    except DataGoError as exc:
        # 03 은 그날 위판이 없다는 뜻이다(주말·공휴일). 다른 코드는 삼키지 않는다.
        if "[03]" in str(exc):
            return []
        raise
    except UpstreamError:
        raise


async def main(days: int) -> int:
    today = date.today()
    daily: dict[str, dict[str, dict]] = defaultdict(dict)
    markets: dict[str, set[str]] = defaultdict(set)
    empty_days = 0

    for offset in range(1, days + 1):
        day = (today - timedelta(days=offset)).strftime("%Y%m%d")
        got_any = False
        for keyword in SPECIES:
            rows = await fetch_day(day, keyword)
            if not rows:
                continue
            got_any = True
            buckets: dict[str, list[dict]] = defaultdict(list)
            for row in rows:
                buckets[row.get("mprcStdCodeNm") or "미상"].append(row)
            for species, group in buckets.items():
                # 중량이 0·비어 있는 행이 실제로 온다(2026-08-16 참문어 0kg·364,000원).
                # 금액만 분자에 넣으면 단가가 부풀어 오른다 — 중량 있는 행만으로 가중평균을 낸다.
                priced = [r for r in group if num(r.get("csmtWt")) > 0]
                weight = sum(num(r.get("csmtWt")) for r in priced)
                amount = sum(num(r.get("csmtAmount")) for r in priced)
                daily[day][species] = {
                    "검색어": keyword,
                    "건수": len(group),
                    "중량없는건수": len(group) - len(priced),
                    "물량_kg": round(weight, 1),
                    "금액_원": round(amount),
                    # 가중평균이다. 건별 단가를 평균 내면 소량 고가 건이 값을 끌어올린다.
                    "단가_원_kg": round(amount / weight) if weight else None,
                    "위판장수": len({r.get("csmtmktNm") for r in group}),
                }
                markets[species] |= {r.get("csmtmktNm") for r in group if r.get("csmtmktNm")}
        if not got_any:
            empty_days += 1
            # defaultdict 는 접근만 해도 빈 항목을 만든다. 그대로 두면 「받은 날이 하루도 없다」 가드를
            # 빈 날들이 통과시켜, 빈 스냅숏이 멀쩡한 기존 파일을 덮는다.
            daily.pop(day, None)
        print(f"  {day} {'·'.join(sorted(daily[day])) if daily[day] else '위판 없음'}", file=sys.stderr)

    if not daily:
        print("받은 날이 하루도 없다. 키와 기간을 확인한다. 기존 스냅숏은 그대로 둔다.", file=sys.stderr)
        return 1

    payload = {
        "_meta": {
            "출처": "해양수산부 위판장별 위탁판매 현황 (data.go.kr 1192000 select0040List)",
            "조회일": today.isoformat(),
            "기간": f"{min(daily)}~{max(daily)}",
            "검색어": SPECIES,
            "단위주의": "단가는 금액÷물량 가중평균이다. 건별 단가의 산술평균이 아니다",
            "빈날": f"{empty_days}일 (주말·공휴일은 위판이 없다)",
            "부분일치": "검색어는 부분일치라 「오징어」가 갑오징어류까지 잡는다. 표준명별로 갈라 담았다",
        },
        "일별": {day: species for day, species in sorted(daily.items())},
        "위판장": {k: sorted(v) for k, v in sorted(markets.items())},
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)} — {len(daily)}일 · 어종 {len(markets)}종")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main(int(sys.argv[1]) if len(sys.argv) > 1 else 21)))
