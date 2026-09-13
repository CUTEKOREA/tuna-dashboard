#!/usr/bin/env python3
"""해수부 수산물 품목별 수출입 → 품목 월별 무역수지 스냅숏.

    python3 scripts/sync_mof_trade.py [개월수]

대시보드 무역수지 위젯은 2024년 정적값이었다. 이 API 는 품목별·월별 수출입을 kg·USD 로 준다.

실측(2026-09-13):
  · `baseDt` 는 6자리(yyyyMM)다. 8자리를 보내면 필수값 누락이라 결과코드 03 이 온다.
  · 공표가 두세 달 늦는다. 최근 달로 물으면 늘 03 이다 — 뒤로 훑는다.
  · 품목명이 길고 세분돼 있다(「조미오징어(조제 또는 저장처리)(밀폐용기에 넣은 것)」).
    검색어 부분일치로 묶고, 원본 품목명을 그대로 실어 보낸다.
"""
from __future__ import annotations

import asyncio
import json
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/data/mof_trade_monthly_v1.json"

sys.path.insert(0, str(Path.home() / "silla-mcp/packages/trade-fishery/src"))
sys.path.insert(0, str(Path.home() / "silla-mcp/packages/core/src"))
from silla_mcp.trade_fishery import api_client as api  # noqa: E402
from silla_mcp_core import DataGoError  # noqa: E402

SPECIES = ["오징어", "고등어", "명태", "새우", "문어", "골뱅이", "다랑어"]


def num(value: object) -> float:
    try:
        return float(str(value).replace(",", ""))
    except (TypeError, ValueError):
        return 0.0


def months_before(yymm: str, n: int) -> str:
    total = int(yymm[:4]) * 12 + (int(yymm[4:]) - 1) - n
    return f"{total // 12}{total % 12 + 1:02d}"


async def main(months: int) -> int:
    today = date.today()
    cursor = months_before(f"{today.year}{today.month:02d}", 1)

    monthly: dict[str, dict[str, dict]] = {}
    items: dict[str, set[str]] = defaultdict(set)
    misses = 0
    while len(monthly) < months and misses < 6:
        try:
            rows, _url, _label, _total = await api.mof("trade", {"baseDt": cursor}, max_rows=3000)
        except DataGoError as exc:
            if "[03]" in str(exc):
                misses += 1
                cursor = months_before(cursor, 1)
                continue
            raise
        misses = 0
        bucket: dict[str, dict] = {}
        for keyword in SPECIES:
            hit = [r for r in rows if keyword in str(r.get("mprcExipitmNm"))]
            if not hit:
                continue
            entry = {"수출_kg": 0.0, "수출_usd": 0.0, "수입_kg": 0.0, "수입_usd": 0.0, "품목수": 0}
            for row in hit:
                side = "수출" if row.get("imxprtSeNm") == "수출" else "수입"
                entry[f"{side}_kg"] += num(row.get("imxprtWt"))
                entry[f"{side}_usd"] += num(row.get("imxprtDollarAmount"))
                items[keyword].add(str(row.get("mprcExipitmNm")))
            entry["품목수"] = len({r.get("mprcExipitmNm") for r in hit})
            entry = {k: (round(v) if isinstance(v, float) else v) for k, v in entry.items()}
            entry["무역수지_usd"] = entry["수출_usd"] - entry["수입_usd"]
            bucket[keyword] = entry
        if bucket:
            monthly[cursor] = bucket
            print(f"  {cursor} {'·'.join(sorted(bucket))}", file=sys.stderr)
        cursor = months_before(cursor, 1)

    if not monthly:
        print("받은 달이 하나도 없다.", file=sys.stderr)
        return 1

    payload = {
        "_meta": {
            "출처": "해양수산부 수산물 품목별 수출입 현황 (data.go.kr 1192000 select0070List)",
            "조회일": today.isoformat(),
            "기간": f"{min(monthly)}~{max(monthly)}",
            "검색어": SPECIES,
            "단위": "kg · USD",
            "주의": "검색어 부분일치로 묶은 값이다. 어떤 품목이 들어갔는지는 「품목」 에 그대로 적었다",
            "공표지연": "두세 달 늦는다. 최근 달이 비어 있는 것은 아직 안 나온 것이다",
        },
        "월별": dict(sorted(monthly.items())),
        "품목": {k: sorted(v) for k, v in sorted(items.items())},
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)} — {len(monthly)}개월 · 검색어 {len(items)}종")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main(int(sys.argv[1]) if len(sys.argv) > 1 else 18)))
