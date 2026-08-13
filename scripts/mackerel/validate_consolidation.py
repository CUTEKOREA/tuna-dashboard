#!/usr/bin/env python3
"""통합안 커버리지 검증.

렌더되는 위젯 90건이 docs/mackerel_consolidation.csv 에서
정확히 한 번씩만 처리되는지 확인한다. 누락·중복·유령 id 를 잡는다.
"""
import csv
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LEDGER = ROOT / "docs" / "mackerel_widget_ledger.csv"
PLAN = ROOT / "docs" / "mackerel_consolidation.csv"


def main():
    live = {r["id"] for r in csv.DictReader(LEDGER.open(encoding="utf-8-sig"))
            if r["rendered"] == "Y"}
    plan = list(csv.DictReader(PLAN.open(encoding="utf-8-sig")))

    seen = Counter()
    where = defaultdict(list)
    for row in plan:
        for wid in (row["absorbs"] or "").split():
            seen[wid] += 1
            where[wid].append(row["final_id"])

    missing = sorted(live - set(seen))
    dupes = sorted(w for w, n in seen.items() if n > 1)
    ghosts = sorted(set(seen) - live)

    finals = [r for r in plan if r["final_id"] != "DELETE"]
    deleted = sum(len((r["absorbs"] or "").split()) for r in plan if r["final_id"] == "DELETE")
    new_only = [r["final_id"] for r in finals if not (r["absorbs"] or "").strip()]

    print(f"렌더 위젯 {len(live)} → 최종 위젯 {len(finals)}")
    print(f"  흡수 {sum(seen.values()) - deleted} / 삭제 {deleted} / 순수 신규 {len(new_only)}: {new_only}")
    print(f"  신규 소스 편입(carries_new) {sum(1 for r in finals if r['carries_new'])}건")
    print("  pillar별:", dict(sorted(Counter(r["pillar"] for r in finals).items())))
    print("  grade 목표:", dict(sorted(Counter(r["grade_target"] for r in finals).items())))

    ok = True
    if missing:
        ok = False
        print(f"\n✗ 미처리 {len(missing)}건: {missing}")
    if dupes:
        ok = False
        print(f"\n✗ 중복 배정 {len(dupes)}건:")
        for w in dupes:
            print(f"    {w} → {where[w]}")
    if ghosts:
        ok = False
        print(f"\n✗ 유령 id {len(ghosts)}건 (원장에 없음): {ghosts}")

    if ok:
        print("\n✓ 커버리지 완전. 90건 전부 정확히 1회 처리.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
