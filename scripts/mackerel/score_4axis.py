#!/usr/bin/env python3
"""Phase 5 — 아카이브 위젯 4-Axis 재채점.

기존 스코어러(score_value_chain_4axis.py)는 cardDesc 문자열에서 출처 키워드를
찾아 추정했다. 이제 위젯이 provenance 블록을 들고 있으므로 추정할 필요가 없다.

  Axis 1 출처 신뢰도 — source_id 가 소스 원장에 있는가, 발행처 등급은
  Axis 2 데이터 신선도 — period 의 최신 연도
  Axis 3 검증 가능성 — method(기계추출/수동추출) + 입력 해시 유효성
  Axis 4 통합 완성도 — SIT/TAK·단위·재빌드 커맨드·차트 데이터
"""
import csv
import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build
import provenance

ROOT = build.ROOT
OUT = ROOT / "docs" / "mackerel_4axis_after.csv"


def axis1_source(p) -> int:
    """소스 원장 등재 + 발행처 성격."""
    if p["source_id"] not in provenance.registry_ids():
        return 40
    meta = provenance.registry_meta()[p["source_id"]]
    grade = (meta.get("grade") or "").strip().upper()
    return {"A": 95, "B": 80, "C": 65}.get(grade, 70)


def axis2_freshness(p) -> int:
    years = [int(t) for t in "".join(c if c.isdigit() else " " for c in p["period"]).split()
             if len(t) == 4 and t.startswith("20")]
    y = max(years) if years else 0
    if y >= 2026:
        return 95
    if y == 2025:
        return 80
    if y == 2024:
        return 70
    return 40 if y else 55


def axis3_verify(p, path: Path) -> int:
    """재현 가능성. 기계추출 + 입력 해시 일치가 최고점."""
    base = {"script": 95, "api_live": 85, "manual_extract": 70}.get(p["method"], 55)
    for rel, want in zip(p["input_files"], p["input_sha256"]):
        src = provenance.ARCHIVE / rel
        if not src.exists() or provenance.sha256(src) != want:
            return 40          # 입력이 사라졌거나 바뀌었으면 재현 불가
    return base


def axis4_completeness(w) -> int:
    score = 0
    if w.get("sit") and w.get("strat"):
        score += 30
    if len(w.get("subtitle") or "") >= 30:
        score += 25
    if w.get("unit"):
        score += 15
    if (w.get("data") or []):
        score += 15
    if w["provenance"].get("rebuild"):
        score += 15
    return min(score, 100)


def grade(avg: float) -> str:
    return "A" if avg >= 85 else "B" if avg >= 75 else "C" if avg >= 65 else "D"


def main():
    rows = []
    for path in sorted(build.OUT_DIR.glob(build.OUT_GLOB)):
        w = json.loads(path.read_text(encoding="utf-8"))
        p = w["provenance"]
        a1, a2 = axis1_source(p), axis2_freshness(p)
        a3, a4 = axis3_verify(p, path), axis4_completeness(w)
        avg = round((a1 + a2 + a3 + a4) / 4, 1)
        rows.append({"id": w["id"], "pillar": w["id"][:2].upper(), "title": w["title"],
                     "source_id": p["source_id"], "method": p["method"],
                     "prov_grade": p["grade"], "period": p["period"],
                     "axis1": a1, "axis2": a2, "axis3": a3, "axis4": a4,
                     "avg": avg, "grade": grade(avg)})

    OUT.parent.mkdir(exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8-sig") as fh:
        wtr = csv.DictWriter(fh, fieldnames=list(rows[0]))
        wtr.writeheader()
        wtr.writerows(rows)

    avg = round(sum(r["avg"] for r in rows) / len(rows), 1)
    print(f"위젯 {len(rows)}건 · 평균 {avg} ({grade(avg)})")
    print("  등급:", dict(sorted(Counter(r["grade"] for r in rows).items())))
    print("  축 평균:", {f"axis{i}": round(sum(r[f'axis{i}'] for r in rows) / len(rows), 1)
                        for i in range(1, 5)})
    low = [r for r in rows if r["avg"] < 85]
    if low:
        print(f"\n  A등급 미만 {len(low)}건:")
        for r in sorted(low, key=lambda x: x["avg"]):
            print(f"    {r['avg']:>5} {r['grade']} {r['id']:<26} {r['method']:<15} {r['period']}")
    print(f"\n✓ {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
