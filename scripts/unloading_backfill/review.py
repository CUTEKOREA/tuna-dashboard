#!/usr/bin/env python3
"""final_results/*.json 을 항차 단위 원장 후보로 정리하고 검토표를 만든다.

  - 템플릿 잔재 열: 세부 행이 전부 0 인데 합계만 있는 원선 열은, 빼야 총계가 맞을 때만 뺀다.
  - 항차 단위: 「YYYY 하역업무/<항차 폴더>」 하나에 후보 하나. 결과가 여럿이면 총계가 같은지 본다.
  - 기간 점검: 폴더 이름의 YYYYMM 과 추출한 하역 시작월이 2개월 넘게 벌어지면 표시한다.
  - 원장 중복: 원장에 이미 있는 항차는 후보에서 뺀다(정본 판단은 사람 몫).
원장은 읽기만 한다. 산출: artifacts/unloading_backfill/{candidates.json, review.md}

실행:
  python3 scripts/unloading_backfill/review.py
"""
from __future__ import annotations

import copy
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_final_results import OUT_DIR, ROOT, TOL, dump_workbook, ledger_match, nfc, validate  # noqa: E402

ART = ROOT / "artifacts/unloading_backfill"
FOLDER_YEAR = re.compile(r"^(20\d\d) 하역업무$")
FOLDER_YM = re.compile(r"(20\d\d)(\d\d)")


def voyage_folder(path: str) -> str:
    parts = Path(path).parts
    for i, p in enumerate(parts):
        if FOLDER_YEAR.match(p) and i + 1 < len(parts) - 1:
            return f"{p}/{parts[i + 1]}"
    return str(Path(path).parent)


def drop_placeholder_columns(got: dict) -> tuple[dict, list[str]]:
    fixed, notes = copy.deepcopy(got), []
    for k in ("reported", "discharged"):
        s = sum(float(v[f"total_{k}"]) for v in fixed["source_vessels"])
        if abs(s - float(fixed[f"grand_total_{k}"])) <= TOL:
            continue
        for v in list(fixed["source_vessels"]):
            empty = all(float(ln["reported"]) == 0 and float(ln["discharged"]) == 0 for ln in v["lines"])
            if empty and abs(s - float(v[f"total_{k}"]) - float(fixed[f"grand_total_{k}"])) <= TOL:
                fixed["source_vessels"].remove(v)
                notes.append(f"세부 행 없는 '{v['name']}' 열(합계 {v['total_reported']}) 제외 — 총계에 포함되지 않은 템플릿 잔재")
                break
    return fixed, notes


def month_gap(folder: str, start: str) -> int | None:
    m = FOLDER_YM.search(folder.split("/", 1)[-1])
    if not m or not re.match(r"\d{4}-\d{2}", start or ""):
        return None
    fy, fm = int(m.group(1)), int(m.group(2))
    sy, sm = int(start[:4]), int(start[5:7])
    return abs((fy * 12 + fm) - (sy * 12 + sm))


def main() -> int:
    records = [json.loads(f.read_text()) for f in sorted(OUT_DIR.glob("*.json"))]
    by_voyage: dict[str, list[dict]] = {}
    for r in records:
        got, notes = r["extracted"], []
        errors = r["validation_errors"]
        if errors:
            fixed, notes = drop_placeholder_columns(got)
            if notes:
                _, numbers = dump_workbook(Path(r["source_file"]))
                errors = validate(fixed, numbers)
                got = fixed if not errors else got
        r["_got"], r["_notes"], r["_errors"] = got, notes, errors
        by_voyage.setdefault(voyage_folder(r["source_file"]), []).append(r)

    candidates, review = [], []
    for folder, rs in sorted(by_voyage.items()):
        passing = [r for r in rs if not r["_errors"]]
        flags: list[str] = []
        if not passing:
            flags.append("검증 실패: " + "; ".join(rs[0]["_errors"][:2]))
            chosen = None
        else:
            totals = {(round(float(r["_got"]["grand_total_reported"]), 2),
                       round(float(r["_got"]["grand_total_discharged"]), 2)) for r in passing}
            if len(totals) > 1:
                flags.append(f"같은 항차에 총계가 다른 결과 {len(totals)}개: {sorted(totals)}")
            chosen = max(passing, key=lambda r: Path(r["source_file"]).stat().st_mtime)
        got = chosen["_got"] if chosen else rs[0]["extracted"]
        gap = month_gap(folder, got.get("period_start", ""))
        if gap is not None and gap > 2:
            flags.append(f"폴더 날짜와 하역 시작일이 {gap}개월 차이 ({got.get('period_start')})")
        ledger = ledger_match(got) if chosen else None
        if ledger:
            flags.append(f"원장에 이미 있음 ({ledger['vessel_id']})")
        for r in rs:
            flags.extend(r["_notes"])
        status = "후보" if chosen and not ledger and not any(f.startswith(("같은 항차", "폴더 날짜")) for f in flags) \
            else ("원장 기존" if ledger else ("검토 필요" if chosen else "실패"))
        review.append({"folder": folder, "status": status, "flags": flags, "got": got,
                       "files": [nfc(Path(r["source_file"]).name) for r in rs]})
        if status == "후보":
            candidates.append({"voyage_folder": folder, "source_file": chosen["source_file"],
                               "source_sha256": chosen["source_sha256"], "model": chosen["model"],
                               "notes": chosen["_notes"], **{k: got[k] for k in (
                                   "period_start", "period_end", "port", "buyer", "sheet_used",
                                   "grand_total_reported", "grand_total_discharged", "source_vessels")}})

    (ART / "candidates.json").write_text(json.dumps(candidates, ensure_ascii=False, indent=1))
    counts = {s: sum(1 for x in review if x["status"] == s) for s in ("후보", "검토 필요", "원장 기존", "실패")}
    lines = ["# 하역 백필 검토표 (최종 하역결과 기준)", "",
             f"항차 {len(review)}개 — " + " · ".join(f"{k} {v}" for k, v in counts.items()), "",
             "| 상태 | 항차 폴더 | 하역 기간 | 하역지 | 보고량 | 하역량 | 원선 | 메모 |",
             "|---|---|---|---|---:|---:|---:|---|"]
    order = {"검토 필요": 0, "실패": 1, "후보": 2, "원장 기존": 3}
    for x in sorted(review, key=lambda x: (order[x["status"]], x["folder"])):
        g = x["got"]
        lines.append(f"| {x['status']} | {x['folder']} | {g.get('period_start')} ~ {g.get('period_end')} | {g.get('port')} "
                     f"| {float(g.get('grand_total_reported') or 0):,.1f} | {float(g.get('grand_total_discharged') or 0):,.1f} "
                     f"| {len(g.get('source_vessels', []))} | {'<br>'.join(x['flags'])} |")
    (ART / "review.md").write_text("\n".join(lines) + "\n")
    print(json.dumps(counts, ensure_ascii=False))
    print(f"→ {(ART / 'review.md').relative_to(ROOT)}, {(ART / 'candidates.json').relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
