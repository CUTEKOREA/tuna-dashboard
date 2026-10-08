#!/usr/bin/env python3
"""SPC/FFA 선망 LOGSHEET 스캔 PDF → 일자별 조업 위치·어군·어획량 JSON (Claude 비전).

  pilot N : N개 파일을 Messages API 로 즉시 처리
  submit  : 남은 파일을 Message Batches API 로 제출
  status  : 배치 상태
  collect : 결과 수집·검증 → artifacts/unloading_backfill/logsheet/

페이지는 pdftoppm 으로 렌더한 뒤 tesseract 단어 적중 수로 회전 방향을 고른다.
검증: 페이지별 투망 어획량 합 = 그 페이지 합계 행(가다랑어·황다랑어·눈다랑어 각각, ±0.01 MT).
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import anthropic
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_final_results import MODEL, ROOT, nfc  # noqa: E402

SRC = ROOT / "artifacts/unloading_backfill/src/logsheet"
OUT_DIR = ROOT / "artifacts/unloading_backfill/logsheet"
MANIFEST = ROOT / "artifacts/unloading_backfill/batch_logsheet_manifest.json"
DPI = 144
MAX_PAGES = 8
BATCH_BYTES = 150_000_000
KEYWORDS = ("LOGSHEET", "LATITUDE", "LONGITUDE", "SKIPJACK", "YELLOWFIN", "BIGEYE", "VESSEL",
            "PROHIBITED", "CATCH", "DISCARDS", "UNLOADING", "CAPTAIN", "SCHOOL")

PROMPT = """These images are pages of SPC/FFA REGIONAL PURSE-SEINE LOGSHEETs from Korean purse seiners (SILLA CO., LTD.).
Transcribe them into ONE JSON object, no prose, no comments:
{"logsheets": [{
  "pages": [<page numbers in this file belonging to this logsheet>],
  "vessel": "<NAME OF VESSEL>", "trip_no": "<TRIP NUMBER THIS YEAR or null>", "year": <YEAR>,
  "departure_port": "<PORT OF DEPARTURE>", "departure_utc": "<DATE AND TIME OF DEPARTURE as printed>",
  "unloading_port": "<PLACE OF UNLOADING or null>", "arrival_utc": "<as printed or null>",
  "days": [[page, month, day, activity_code, "lat", "lon", school_code, "set_start", "set_end",
            skj, yft, bet, other, "eez", "note"]],
  "page_totals": [{"page": <n>, "skj": <MT>, "yft": <MT>, "bet": <MT>}],
  "unloadings": [{"start": "<date>", "end": "<date>", "carrier": "<VESSEL NAME>",
                  "skj": <MT or null>, "yft": <MT or null>, "bet": <MT or null>, "mixed": <MT or null>}],
  "uncertain": ["<cells you could not read confidently>"]
}]}

Each "days" item is a 15-element array, in this exact order:
  page (int), month (int|null), day (int|null), activity_code (int|null),
  lat (string as printed, e.g. "04-13.4 S"), lon (string as printed, e.g. "152-09.6 E"),
  school_code (int|null), set_start ("hhmm"|null), set_end ("hhmm"|null),
  skj (MT|null), yft (MT, small+large combined|null), bet (MT, small+large combined|null), other (MT|null),
  eez (two-letter code in the rightmost column|null), note (free text written across the row, e.g. "DEP PORT RABAUL", "ENT SB"|null).
Month and day are often printed only on the first row of that date; repeat them on every row.

Rules:
- One entry in "days" per printed row, in page order, including rows with no fishing set.
- "page_totals" is the FIRST total row under the catch columns on each page (this page only), NOT the cumulative trip row below it.
  yft/bet totals are small+large combined.
- Copy numbers as printed. Leave a value null if the cell is blank or unreadable and list it in "uncertain".
"""


def render_pages(path: Path) -> list[bytes]:
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftoppm", "-r", str(DPI), "-png", "-l", str(MAX_PAGES), str(path), f"{tmp}/p"],
                       check=True, capture_output=True)
        pages = []
        for png in sorted(Path(tmp).glob("p-*.png"), key=lambda p: int(p.stem.split("-")[-1])):
            pages.append(upright(Image.open(png)))
        return pages


def score(img: Image.Image) -> int:
    small = img.copy()
    small.thumbnail((1400, 1400))
    buf = io.BytesIO()
    small.save(buf, format="PNG")
    out = subprocess.run(["tesseract", "stdin", "stdout", "--psm", "6"], input=buf.getvalue(),
                         capture_output=True).stdout.decode(errors="ignore").upper()
    return sum(out.count(k) for k in KEYWORDS)


def upright(img: Image.Image) -> bytes:
    img = img.convert("L")
    candidates = (-90, 90) if img.height > img.width else (0, 180)
    best = max((img.rotate(a, expand=True) for a in candidates), key=score)
    best.thumbnail((1568, 1568))
    buf = io.BytesIO()
    best.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def request_params(path: Path) -> dict:
    content = []
    for i, png in enumerate(render_pages(path), 1):
        content.append({"type": "text", "text": f"Page {i}"})
        content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                                    "data": base64.standard_b64encode(png).decode()}})
    content.append({"type": "text", "text": PROMPT})
    return {"model": MODEL, "max_tokens": 64000, "messages": [{"role": "user", "content": content}]}


DAY_FIELDS = ("page", "month", "day", "activity_code", "lat", "lon", "school_code", "set_start", "set_end",
              "skj", "yft", "bet", "other", "eez", "note")


def as_rows(days: list) -> list[dict]:
    return [dict(zip(DAY_FIELDS, d)) if isinstance(d, list) else d for d in days]


def validate(got: dict) -> list[str]:
    errors = []
    sheets = got.get("logsheets") or []
    if not sheets:
        return ["일지 없음"]
    for i, s in enumerate(sheets):
        days = as_rows(s.get("days") or [])
        bad_rows = [d for d in days if len(d) != len(DAY_FIELDS)]
        if bad_rows:
            errors.append(f"#{i} 열 수가 다른 행 {len(bad_rows)}")
        if not days:
            errors.append(f"#{i} 일자 행 없음")
        for t in s.get("page_totals") or []:
            rows = [d for d in days if d.get("page") == t.get("page")]
            for k in ("skj", "yft", "bet"):
                if not isinstance(t.get(k), (int, float)):
                    continue
                got_sum = sum(d.get(k) or 0 for d in rows)
                if abs(got_sum - t[k]) > 0.011:
                    errors.append(f"#{i} p{t.get('page')} {k} 행 합 {got_sum:g} ≠ 합계 {t[k]:g}")
        if not s.get("page_totals"):
            errors.append(f"#{i} 페이지 합계 행 없음")
    return errors


def parse_reply(msg) -> dict:
    text = "".join(c.text for c in msg.content if c.type == "text")
    m = re.search(r"\{.*\}", text, re.S)
    try:
        return json.loads(m.group(0)) if m else {}
    except json.JSONDecodeError:
        return {}


def record(path: Path, sha: str, msg, batch_id: str | None) -> dict:
    got = parse_reply(msg)
    rec = {"source_file": nfc(str(path.relative_to(SRC))), "source_sha256": sha, "model": MODEL,
           "batch_id": batch_id, "extracted": got, "validation_errors": validate(got),
           "usage": {"input_tokens": msg.usage.input_tokens, "output_tokens": msg.usage.output_tokens,
                     "stop_reason": msg.stop_reason}}
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / f"{sha[:16]}.json").write_text(json.dumps(rec, ensure_ascii=False, indent=1))
    return rec


def pending() -> dict[str, Path]:
    finished = {json.loads(f.read_text())["source_sha256"] for f in OUT_DIR.glob("*.json")} if OUT_DIR.exists() else set()
    seen = {}
    for p in sorted(SRC.rglob("*")):
        if p.suffix.lower() != ".pdf":
            continue
        h = hashlib.sha256(p.read_bytes()).hexdigest()
        if h not in finished and h not in seen:
            seen[h] = p
    return seen


def pilot(client: anthropic.Anthropic, n: int) -> None:
    items = list(pending().items())
    picked = items[:: max(1, len(items) // n)][:n]
    tin = tout = 0
    for h, p in picked:
        with client.messages.stream(**request_params(p)) as stream:
            msg = stream.get_final_message()
        tin += msg.usage.input_tokens
        tout += msg.usage.output_tokens
        rec = record(p, h, msg, None)
        sheets = rec["extracted"].get("logsheets") or []
        days = sum(len(s.get("days") or []) for s in sheets)
        status = "통과" if not rec["validation_errors"] else f"실패 {rec['validation_errors'][:3]}"
        print(f"{rec['source_file']} · 일지 {len(sheets)} · 행 {days} · {msg.stop_reason} · {status}")
    print(json.dumps({"files": len(picked), "input_tokens": tin, "output_tokens": tout}))


def submit(client: anthropic.Anthropic) -> None:
    items = pending()
    if not items:
        print("보낼 파일이 없다")
        return
    batches, entries = [], {}
    chunk, size = [], 0
    for h, p in items.items():
        cid = f"ls_{h[:24]}"
        req = {"custom_id": cid, "params": request_params(p)}
        req_size = len(json.dumps(req))
        if chunk and size + req_size > BATCH_BYTES:
            batches.append(client.messages.batches.create(requests=chunk).id)
            chunk, size = [], 0
        chunk.append(req)
        size += req_size
        entries[cid] = {"path": nfc(str(p)), "sha256": h}
    if chunk:
        batches.append(client.messages.batches.create(requests=chunk).id)
    MANIFEST.write_text(json.dumps({"batch_ids": batches, "model": MODEL, "entries": entries},
                                   ensure_ascii=False, indent=1))
    print(f"제출 {len(entries)}건 → 배치 {len(batches)}개 {batches}")


def status(client: anthropic.Anthropic) -> None:
    m = json.loads(MANIFEST.read_text())
    for bid in m["batch_ids"]:
        b = client.messages.batches.retrieve(bid)
        print(bid, b.processing_status, b.request_counts.model_dump())


def collect(client: anthropic.Anthropic) -> None:
    m = json.loads(MANIFEST.read_text())
    states = {bid: client.messages.batches.retrieve(bid).processing_status for bid in m["batch_ids"]}
    if any(s != "ended" for s in states.values()):
        print(f"아직 끝나지 않음: {states}")
        return
    tally = {"pass": 0, "fail": 0, "error": 0}
    tin = tout = 0
    for bid in m["batch_ids"]:
        for res in client.messages.batches.results(bid):
            entry = m["entries"][res.custom_id]
            if res.result.type != "succeeded":
                tally["error"] += 1
                print(f"✗ {Path(entry['path']).name}: {res.result.type}", file=sys.stderr)
                continue
            msg = res.result.message
            tin += msg.usage.input_tokens
            tout += msg.usage.output_tokens
            rec = record(Path(entry["path"]), entry["sha256"], msg, bid)
            tally["pass" if not rec["validation_errors"] else "fail"] += 1
    print(json.dumps({**tally, "input_tokens": tin, "output_tokens": tout}, ensure_ascii=False))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["pilot", "submit", "status", "collect"])
    ap.add_argument("n", nargs="?", type=int, default=3)
    args = ap.parse_args()
    client = anthropic.Anthropic()
    if args.cmd == "pilot":
        pilot(client, args.n)
    else:
        {"submit": submit, "status": status, "collect": collect}[args.cmd](client)
    return 0


if __name__ == "__main__":
    sys.exit(main())
