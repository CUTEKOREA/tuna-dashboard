#!/usr/bin/env python3
"""Claude 추출 결과(final_results)를 기존 5년 이력(history_2021_2025.json)과 항차 단위로 대조한다.

매칭: 하역 시작일·종료일이 각각 ±3일 안이면 같은 항차로 본다.
판정:
  agree     기존 actualMt 와 추출 하역량이 0.5 MT 안
  differ    둘 다 값이 있는데 0.5 MT 넘게 다름
  fills     기존 actualMt 가 비었거나 verified 가 아님 → 추출값으로 보강 가능
  new       기존 이력에 없는 항차
읽기만 한다. 산출: artifacts/unloading_backfill/history_compare.{json,md}

실행:
  python3 scripts/unloading_backfill/compare_history.py
"""
from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_final_results import OUT_DIR, ROOT  # noqa: E402
import review  # noqa: E402

HISTORY = ROOT / "lib/unloading-history/history_2021_2025.json"
ART = ROOT / "artifacts/unloading_backfill"
DAYS = 3
AGREE_MT = 0.5


def d(s: str | None) -> date | None:
    try:
        return date.fromisoformat(s) if s else None
    except ValueError:
        return None


def name_key(s: str) -> str:
    s = re.sub(r"[^a-z0-9]", "", s.lower().replace("pheonix", "phoenix"))
    return re.sub(r"reeferi$", "reefer1", s)


def same_vessel(canonical: str, folder: str) -> bool:
    leaf = re.sub(r"^(완료\s*)?\d{6,8}\s*(mv\s*)?", "", folder.split("/")[-1].lower())
    return name_key(canonical) in name_key(leaf.replace("reefer i", "reefer 1"))


def extracted_voyages() -> list[dict]:
    by_folder: dict[str, dict] = {}
    for f in sorted(OUT_DIR.glob("*.json")):
        r = json.loads(f.read_text())
        got, errors = r["extracted"], r["validation_errors"]
        if errors:
            fixed, notes = review.drop_placeholder_columns(got)
            if notes:
                _, numbers = review.dump_workbook(Path(r["source_file"]))
                if not review.validate(fixed, numbers):
                    got, errors = fixed, []
        if errors or not float(got.get("grand_total_discharged") or 0):
            continue
        folder = review.voyage_folder(r["source_file"])
        prev = by_folder.get(folder)
        if prev is None or Path(r["source_file"]).stat().st_mtime > Path(prev["file"]).stat().st_mtime:
            by_folder[folder] = {"folder": folder, "file": r["source_file"], "got": got}
    return list(by_folder.values())


def main() -> int:
    hist = json.loads(HISTORY.read_text())["voyages"]
    ext = extracted_voyages()
    used: set[str] = set()
    rows = []
    for e in ext:
        s, t = d(e["got"].get("period_start")), d(e["got"].get("period_end"))
        got = e["got"]
        dated = []
        for h in hist:
            hs, ht = d(h["period"].get("startDate")), d(h["period"].get("endDate"))
            if s and t and hs and ht and abs((s - hs).days) <= DAYS and abs((t - ht).days) <= DAYS:
                dated.append(h)
        named = [h for h in dated if same_vessel(h["vessel"]["canonicalName"], e["folder"])]
        match = (named or dated or [None])[0]
        ext_actual, ext_reported = float(got["grand_total_discharged"]), float(got["grand_total_reported"])
        row = {"folder": e["folder"], "period": f"{got.get('period_start')} ~ {got.get('period_end')}",
               "ext_reported": ext_reported, "ext_actual": ext_actual,
               "source_vessels": len(got["source_vessels"])}
        if match is None:
            row.update(kind="new")
        else:
            used.add(match["voyageId"])
            ha = match["actualMt"]
            row.update(voyageId=match["voyageId"], hist_actual=ha, hist_reported=match["reportedMt"],
                       hist_verification=match["verification"])
            if ha is None or match["verification"] != "verified":
                row["kind"] = "fills"
            elif abs(ha - ext_actual) <= AGREE_MT:
                row["kind"] = "agree"
            else:
                row["kind"] = "differ"
            row["diff"] = None if ha is None else round(ext_actual - ha, 3)
        rows.append(row)
    unmatched = [{"voyageId": h["voyageId"], "verification": h["verification"], "actualMt": h["actualMt"],
                  "period": f"{h['period'].get('startDate')} ~ {h['period'].get('endDate')}"}
                 for h in hist if h["voyageId"] not in used]

    counts = {k: sum(1 for r in rows if r["kind"] == k) for k in ("agree", "differ", "fills", "new")}
    (ART / "history_compare.json").write_text(json.dumps(
        {"counts": counts, "rows": rows, "history_unmatched": unmatched}, ensure_ascii=False, indent=1))
    md = ["# 추출 결과 × 기존 5년 이력 대조", "", " · ".join(f"{k} {v}" for k, v in counts.items())
          + f" · 이력에만 있음 {len(unmatched)}", "",
          "| 판정 | 항차 폴더 | 기간 | 기존 실측 | 추출 실측 | 차이 | 추출 보고량 | 기존 등급 |", "|---|---|---|---:|---:|---:|---:|---|"]
    order = {"differ": 0, "fills": 1, "new": 2, "agree": 3}
    for r in sorted(rows, key=lambda r: (order[r["kind"]], r["folder"])):
        md.append(f"| {r['kind']} | {r['folder']} | {r['period']} | {r.get('hist_actual') or '-'} | {r['ext_actual']:,.3f} "
                  f"| {r.get('diff') if r.get('diff') is not None else '-'} | {r['ext_reported']:,.1f} | {r.get('hist_verification', '-')} |")
    md += ["", "## 이력에만 있고 추출 결과와 매칭 안 된 항차", ""]
    md += [f"- {u['voyageId']} ({u['verification']}, {u['actualMt']}) {u['period']}" for u in unmatched]
    (ART / "history_compare.md").write_text("\n".join(md) + "\n")
    print(json.dumps({**counts, "history_unmatched": len(unmatched)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
