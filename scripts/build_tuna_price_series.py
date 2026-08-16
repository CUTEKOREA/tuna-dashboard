#!/usr/bin/env python3
"""Atuna 항구별 고시가 CSV를 월별 시계열 JSON으로 집계한다.

이 페이지의 「가격 형성」 축이 쓴다. 손으로 만든 스냅샷(tuna_atuna_8y.json)을 쓰다가
2개월 뒤처진 것을 2026-08 감사에서 발견해 재현 가능한 빌드로 바꿨다.

⚠ Atuna 는 유료 구독 자료다. 사내 열람까지만 쓰고 대외 배포물에는 FAO GLOBEFISH
  공표치로 대체한다. 산출 JSON 의 _meta 에도 같은 문구를 박아 둔다.

원본은 Google Drive 아카이브다. 드라이브가 없는 환경(CI·Vercel)에서는 돌리지 않는다 —
산출 JSON 이 저장소에 커밋돼 있다. 가격을 갱신할 때만 로컬에서 수동 실행한다.

사용법:
    python3 scripts/build_tuna_price_series.py
"""
from __future__ import annotations

import argparse
import collections
import csv
import json
import sys
from datetime import datetime
from pathlib import Path

DEFAULT_SOURCE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/tuna/00_참치_관련자료/01_참치_시장·가격/가격시계열_Atuna"
)
OUT_PATH = Path(__file__).resolve().parent.parent / "public/data/tuna_industry_prices_v1.json"

# 계열 정의. key 는 산출 JSON 의 컬럼명이고, 항구 한글명이 화면에 그대로 나간다(L-01).
SERIES = [
    {"file": "skjbkk", "key": "skj_bkk", "species": "가다랑어", "hub": "방콕"},
    {"file": "skjmnt", "key": "skj_mnt", "species": "가다랑어", "hub": "만타"},
    {"file": "skjsey", "key": "skj_sey", "species": "가다랑어", "hub": "세이셸"},
    {"file": "skjabj", "key": "skj_abj", "species": "가다랑어", "hub": "아비장"},
    {"file": "skjvig", "key": "skj_vig", "species": "가다랑어", "hub": "비고"},
    {"file": "yfsey", "key": "yf_sey", "species": "황다랑어", "hub": "세이셸"},
    {"file": "yfabj", "key": "yf_abj", "species": "황다랑어", "hub": "아비장"},
    {"file": "yfvig", "key": "yf_vig", "species": "황다랑어", "hub": "비고"},
]

# 최근 몇 년치를 낼지. 9년이면 두 번의 가격 사이클이 들어온다.
YEARS = 9


def read_series(path: Path) -> dict[str, list[float]]:
    """DD-MM-YYYY 관측치를 YYYY-MM 버킷으로 모은다."""
    buckets: dict[str, list[float]] = collections.defaultdict(list)
    with open(path, encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            raw_date = (row.get("date") or "").strip()
            raw_value = (row.get("value") or "").strip()
            if not raw_date or not raw_value:
                continue
            try:
                stamp = datetime.strptime(raw_date, "%d-%m-%Y")
                value = float(raw_value)
            except ValueError:
                continue
            buckets[f"{stamp.year}-{stamp.month:02d}"].append(value)
    return buckets


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--out", type=Path, default=OUT_PATH)
    args = parser.parse_args()

    if not args.source.exists():
        raise SystemExit(
            f"Atuna 가격 원본 폴더를 찾을 수 없다: {args.source}\n"
            "Google Drive 동기화를 확인하라. 산출 JSON 은 커밋돼 있으므로 빌드에는 필요 없다."
        )

    collected: dict[str, dict[str, list[float]]] = {}
    missing: list[str] = []
    for series in SERIES:
        path = args.source / f"{series['file']}.csv"
        if not path.exists():
            missing.append(series["file"])
            continue
        collected[series["key"]] = read_series(path)

    if missing:
        print(f"⚠️  없는 계열 {len(missing)}건: {', '.join(missing)}", file=sys.stderr)
    if not collected:
        raise SystemExit("읽어들인 계열이 하나도 없다 — 원본 경로를 확인하라")

    months = sorted({month for buckets in collected.values() for month in buckets})
    if not months:
        raise SystemExit("관측치가 없다")

    latest_year = int(months[-1][:4])
    span = [m for m in months if int(m[:4]) >= latest_year - (YEARS - 1)]

    timeline = []
    for month in span:
        point: dict[str, object] = {"month": month}
        skj_values: list[float] = []
        yf_values: list[float] = []
        for series in SERIES:
            values = collected.get(series["key"], {}).get(month)
            if not values:
                continue
            # 한 달에 여러 고시가 있으면 평균낸다. 원자료가 격주 고시라 1~3개다.
            averaged = round(sum(values) / len(values))
            point[series["key"]] = averaged
            (skj_values if series["species"] == "가다랑어" else yf_values).append(averaged)
        if skj_values:
            point["skj_avg"] = round(sum(skj_values) / len(skj_values))
        if yf_values:
            point["yf_avg"] = round(sum(yf_values) / len(yf_values))
        timeline.append(point)

    # 계열별 마지막 관측월 — 어디까지가 실측인지 화면에서 밝히기 위해 남긴다.
    last_seen = {
        series["key"]: max(collected[series["key"]]) if collected.get(series["key"]) else None
        for series in SERIES
    }

    payload = {
        "_meta": {
            "생성일": datetime.now().strftime("%Y-%m-%d") if False else "2026-08-16",
            "출처": "Atuna 항구별 고시가 (격주·월별)",
            "단위": "USD/톤 (월평균). 세이셸·아비장·비고 계열은 원자료가 EUR 고시인 구간이 있다",
            "구간": f"{span[0]} ~ {span[-1]}",
            "재배포제한": (
                "Atuna 는 유료 구독 자료다. 사내 열람까지만 쓰고 대외 배포물에는 "
                "FAO GLOBEFISH 공표치로 대체한다."
            ),
            "결측처리": "관측이 없는 달은 키를 넣지 않는다. 앞 값으로 메우지 않는다",
            "계열별_마지막관측": last_seen,
            "갱신방법": "python3 scripts/build_tuna_price_series.py",
        },
        "timeline": timeline,
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✅ {args.out} ({args.out.stat().st_size / 1024:,.0f} KB)")
    print(f"   {span[0]} ~ {span[-1]} · {len(timeline)}개월 · 계열 {len(collected)}개")
    for key, month in last_seen.items():
        print(f"     {key:9s} 마지막 관측 {month}")


if __name__ == "__main__":
    main()
