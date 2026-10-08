#!/usr/bin/env python3
"""history_2021_2025.json 의 항차 목록에서 annual·completionYearBaseline·meta 집계를 다시 계산한다.

원래 생성기는 저장소에 없다. 이 규칙은 2026-10-08 스냅샷을 그대로 재현하는지로 검증했다
(`python3 history_aggregate.py --check`). 항차를 고친 뒤 집계를 맞출 때만 쓴다.
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HISTORY = ROOT / "lib/unloading-history/history_2021_2025.json"
YEARS = [2021, 2022, 2023, 2024, 2025]
METHOD_KEY = {"daily_report": "dailyReport", "completion_year": "completionYear",
              "final_report_adjustment": "finalReportAdjustment"}


def display_year(v: dict) -> int:
    return v["completionYear"] if v["completionYear"] is not None else v["sourceYear"]


def aggregate(data: dict) -> dict:
    voyages = data["voyages"]
    port_names = {p["code"]: p["nameKo"] for v in voyages for p in v["ports"]}
    annual = []
    for y in YEARS:
        allocs = [(v, a) for v in voyages if v["kpiIncluded"] for a in v["yearAllocations"] if a["year"] == y]
        verified_ids = {v["voyageId"] for v, a in allocs if a["actualMt"] > 0 and a["method"] != "final_report_adjustment"}
        total = round(sum(a["actualMt"] for _, a in allocs), 4)
        partial = sum(1 for v in voyages if v["verification"] == "partial" and display_year(v) == y)
        unverified = sum(1 for v in voyages if v["verification"] == "unverified" and display_year(v) == y)
        ports = sorted({p["code"] for v in voyages
                        if display_year(v) == y or any(a["year"] == y for a in v["yearAllocations"])
                        for p in v["ports"]})
        methods = Counter(METHOD_KEY[a["method"]] for _, a in allocs)
        annual.append({
            "year": y,
            "verifiedActualMt": total,
            "verifiedVoyageCount": len(verified_ids),
            "candidateVoyageCount": len(verified_ids) + partial + unverified,
            "partialCount": partial,
            "unverifiedCount": unverified,
            "averageVerifiedMt": round(total / len(verified_ids), 4) if verified_ids else 0,
            "portCount": len(ports),
            "ports": [{"code": c, "nameKo": port_names[c]} for c in ports],
            "allocationMethodCounts": {k: methods.get(k, 0) for k in METHOD_KEY.values()},
            "isMinimumVerifiedTotal": partial + unverified > 0,
        })
    baseline = []
    for y in YEARS:
        done = [v for v in voyages if v["kpiIncluded"] and v["completionYear"] == y]
        cand = [v for v in voyages if display_year(v) == y]
        baseline.append({"year": y, "verifiedActualMt": round(sum(v["actualMt"] for v in done), 4),
                         "verifiedVoyageCount": len(done), "candidateVoyageCount": len(cand)})
    counts = Counter(v["verification"] for v in voyages)
    meta = {"candidateVoyageCount": len(voyages), "verifiedVoyageCount": counts["verified"],
            "partialVoyageCount": counts["partial"], "unverifiedVoyageCount": counts["unverified"]}
    return {"annual": annual, "completionYearBaseline": baseline, "meta": meta}


def diff(a, b, path="") -> list[str]:
    if isinstance(a, dict):
        return [x for k in a for x in diff(a[k], b.get(k) if isinstance(b, dict) else None, f"{path}.{k}")]
    if isinstance(a, list):
        if not isinstance(b, list) or len(a) != len(b):
            return [f"{path}: 길이 다름"]
        return [x for i, (p, q) in enumerate(zip(a, b)) for x in diff(p, q, f"{path}[{i}]")]
    if isinstance(a, float) or isinstance(b, float):
        return [] if a is not None and b is not None and abs(a - b) < 1e-6 else [f"{path}: {a} ≠ {b}"]
    return [] if a == b else [f"{path}: {a} ≠ {b}"]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="재계산값이 현재 파일과 같은지만 본다")
    ap.add_argument("--write", action="store_true", help="재계산값으로 파일의 집계를 덮어쓴다")
    ap.add_argument("--years", type=int, nargs="+", default=YEARS,
                    help="이 연도의 annual·baseline 만 덮어쓴다 (나머지 연도는 기존 값 유지)")
    args = ap.parse_args()
    data = json.loads(HISTORY.read_text())
    agg = aggregate(data)
    for key in ("annual", "completionYearBaseline"):
        agg[key] = [new if new["year"] in args.years else old for new, old in zip(agg[key], data[key])]
    current = {"annual": data["annual"], "completionYearBaseline": data["completionYearBaseline"],
               "meta": {k: data["meta"][k] for k in agg["meta"]}}
    errors = diff(agg, current)
    if args.write:
        data["annual"], data["completionYearBaseline"] = agg["annual"], agg["completionYearBaseline"]
        data["meta"].update(agg["meta"])
        HISTORY.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        print(f"집계 갱신 (변경 {len(errors)}곳)")
        for e in errors:
            print("  ", e)
        return 0
    print("일치" if not errors else f"불일치 {len(errors)}곳")
    for e in errors[:30]:
        print("  ", e)
    return 1 if (args.check and errors) else 0


if __name__ == "__main__":
    sys.exit(main())
