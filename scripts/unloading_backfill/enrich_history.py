#!/usr/bin/env python3
"""5년 이력(history_2021_2025.json)의 빈 reportedMt 를 최종 하역결과 추출값으로 채운다.

채우는 조건: compare_history 판정이 agree(기존 actualMt 와 추출 하역량이 0.5 MT 안)이고
기존 reportedMt 가 null 인 항차만. actualMt·verification·KPI 는 건드리지 않는다.
기본은 미리보기: artifacts/unloading_backfill/history_2021_2025.enriched.json 에만 쓴다.
--write 를 줘야 lib/unloading-history/history_2021_2025.json 을 고친다.

실행:
  python3 scripts/unloading_backfill/compare_history.py
  python3 scripts/unloading_backfill/enrich_history.py [--write]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HISTORY = ROOT / "lib/unloading-history/history_2021_2025.json"
COMPARE = ROOT / "artifacts/unloading_backfill/history_compare.json"
PREVIEW = ROOT / "artifacts/unloading_backfill/history_2021_2025.enriched.json"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    args = ap.parse_args()

    data = json.loads(HISTORY.read_text())
    rows = {r["voyageId"]: r for r in json.loads(COMPARE.read_text())["rows"] if r["kind"] == "agree"}
    changed = []
    for v in data["voyages"]:
        r = rows.get(v["voyageId"])
        if r is None or v["reportedMt"] is not None:
            continue
        v["reportedMt"] = round(r["ext_reported"], 3)
        changed.append((v["voyageId"], v["reportedMt"], v["actualMt"]))

    target = HISTORY if args.write else PREVIEW
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    gap = sum(a - rep for _, rep, a in changed)
    print(f"reportedMt 채움 {len(changed)}항차 → {target.relative_to(ROOT)}")
    print(f"합계: 보고 {sum(r for _, r, _ in changed):,.1f} MT / 실측 {sum(a for _, _, a in changed):,.1f} MT "
          f"/ 실측−보고 {gap:+,.1f} MT")
    for vid, rep, act in changed[:5]:
        print(f"  {vid}: 보고 {rep} / 실측 {act} ({act - rep:+.2f})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
