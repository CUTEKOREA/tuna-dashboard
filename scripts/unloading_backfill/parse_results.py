"""본선별 「Results of unloading」 xlsx → 본선 단위 하역결과 JSON (결정론적, API 미사용).

    rclone copy "gdrive:11. 태국/012. 하역 업무" artifacts/unloading_backfill/src/results \
        --ignore-case --include "/**/*Results of unloading*.xlsx"
    python scripts/unloading_backfill/parse_results.py

한 파일 = 본선 1척의 한 항차. 보고량(Fishing boat report)·실측(Loading result)·해역·환적일·하역일·
어창/온도 메모를 담는다. 같은 본선·운반선·하역기간이 여러 판이면 파일명 날짜가 가장 늦은 판만 쓴다.
"""
import hashlib
import json
import re
import unicodedata
import warnings
from datetime import date
from pathlib import Path

import openpyxl

warnings.filterwarnings("ignore")

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "artifacts/unloading_backfill/src/results"
OUT = ROOT / "artifacts/unloading_backfill/results_parsed.json"
TOL = 0.0011


def nfc(s):
    return unicodedata.normalize("NFC", str(s))


def voyage_folder(path):
    parts = [nfc(p) for p in path.relative_to(SRC).parts[:-1]]
    return "/".join(parts[:2] if parts[0].endswith("하역업무") else parts[:1])


def cell_mt(v):
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v or "").strip().replace(",", "")
    return float(s) if re.fullmatch(r"-?\d+(?:\.\d+)?", s) else 0.0


def species_of(grade):
    g = grade.upper()
    for prefix, sp in (("SJ", "SJ"), ("YF", "YF"), ("BE", "BET"), ("ALB", "ALB")):
        if g.startswith(prefix):
            return sp
    return "OTHER"


def date_range(text):
    if not text:
        return None, None
    found = re.findall(r"(\d{4})[./-](\d{1,2})[./-](\d{1,2})", str(text))
    if not found:
        return None, None
    tail = re.search(r"~\s*(\d{1,2})[./-](\d{1,2})\s*$", str(text))
    if len(found) == 1 and tail:
        found.append((found[0][0], tail.group(1), tail.group(2)))
    try:
        dates = [date(int(y), int(m), int(d)) for y, m, d in found]
    except ValueError:
        return None, None
    if dates[-1] < dates[0]:
        return None, None
    return dates[0].isoformat(), dates[-1].isoformat()


def brine(text, label):
    m = re.search(rf"{label}\s*\(\s*BRINE\s*:\s*(-?\d+(?:\.\d+)?)\s*℃?\s*~\s*(-?\d+(?:\.\d+)?)", text or "", re.I)
    return [float(m.group(1)), float(m.group(2))] if m else None


def parse(path):
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    ws = wb.worksheets[0]
    grid = {}
    for row in ws.iter_rows(min_row=1, max_row=60):
        for c in row:
            if c.value not in (None, ""):
                grid[(c.row, c.column)] = c.value
    if grid.get((7, 3)) != "Fishing boat report":
        return None
    lines, total, problems = [], None, []
    r = 8
    while r < 60:
        label = grid.get((r, 2))
        if label is None:
            r += 1
            continue
        label = str(label).strip()
        rep, act = cell_mt(grid.get((r, 3))), cell_mt(grid.get((r, 4)))
        if label.lower().startswith("sum total"):
            total = {"reported": float(rep), "actual": float(act)}
            break
        if rep or act:
            lines.append({"grade": label, "species": species_of(label), "reported": float(rep), "actual": float(act)})
        r += 1
    notes = {}
    for rr in range(r, 60):
        key = grid.get((rr, 1))
        if key:
            notes[re.sub(r"\s+", " ", str(key)).strip()] = nfc(grid.get((rr, 2), "") or "")
    if total is None:
        problems.append("Sum total 행 없음")
    else:
        for k in ("reported", "actual"):
            s = sum(x[k] for x in lines)
            if abs(s - total[k]) > TOL:
                problems.append(f"{k} 행 합 {s:.3f} ≠ Sum total {total[k]:.3f}")
    quality = next((v for k, v in notes.items() if k.lower().startswith("temperature")), "")
    t0, t1 = date_range(grid.get((5, 2)))
    u0, u1 = date_range(grid.get((5, 5)))
    stamp = re.match(r"(\d{8})", nfc(path.name))
    return {
        "file": nfc(path.relative_to(SRC)),
        "folder": voyage_folder(path),
        "file_date": stamp.group(1) if stamp else None,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "fishing_vessel": nfc(grid.get((3, 2), "")).strip(),
        "carrier": nfc(grid.get((3, 5), "")).strip(),
        "area": nfc(grid.get((4, 2), "")).strip() or None,
        "unloading_area": nfc(grid.get((4, 5), "")).strip() or None,
        "transfer_start": t0, "transfer_end": t1,
        "unloading_start": u0, "unloading_end": u1,
        "lines": lines,
        "total": total,
        "brine_fishing_boat": brine(quality, "Fishing boat"),
        "brine_port_loading": brine(quality, "Port Loading"),
        "notes": notes,
        "problems": problems,
    }


def main():
    parsed, skipped = [], []
    for p in sorted(SRC.rglob("*.xlsx")):
        rec = parse(p)
        (parsed if rec else skipped).append(rec or nfc(p.relative_to(SRC)))
    by_hash, by_key = {}, {}
    for rec in parsed:
        by_hash.setdefault(rec["sha256"], rec)
    for rec in by_hash.values():
        key = (rec["fishing_vessel"].upper(), rec["carrier"].upper(), rec["unloading_start"], rec["folder"])
        prev = by_key.get(key)
        if prev is None or (rec["file_date"] or "") > (prev["file_date"] or ""):
            by_key[key] = rec
    docs = sorted(by_key.values(), key=lambda x: x["file"])
    OUT.write_text(json.dumps({"documents": docs, "skipped": skipped}, ensure_ascii=False, indent=1), encoding="utf-8")
    bad = [d for d in docs if d["problems"]]
    print(f"파일 {len(parsed)} → 내용 중복 제거 {len(by_hash)} → 판 중복 제거 {len(docs)} · 검증 실패 {len(bad)} · 양식 다름 {len(skipped)}")
    for d in bad[:10]:
        print("  ⚠", d["file"], d["problems"])
    print("해역 누락", sum(1 for d in docs if not d["area"]), "· 환적일 누락", sum(1 for d in docs if not d["transfer_start"]),
          "· 염수온도(본선) 추출", sum(1 for d in docs if d["brine_fishing_boat"]))


if __name__ == "__main__":
    main()
