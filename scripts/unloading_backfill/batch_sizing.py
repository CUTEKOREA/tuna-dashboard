#!/usr/bin/env python3
"""SAP 양식이 아닌 SIZING PDF(구형 Universal Marine SizingReport·스캔본)를 Claude 로 구조화한다.

  pilot N : 앞에서 N개를 Messages API 로 즉시 처리 (비용·정확도 확인용)
  submit  : 남은 파일을 Message Batches API 로 제출
  status  : 배치 상태
  collect : 결과 수집·검증 → artifacts/unloading_backfill/sizing_vision/

검증: 등급 합 = 총계(문서 단위가 kg 이면 ±1 kg, MT 면 ±0.001), 텍스트가 있는 PDF 는
모든 숫자가 pdftotext 원문에 존재해야 한다.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

import anthropic

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_final_results import MODEL, ROOT, nfc  # noqa: E402

SRC = ROOT / "artifacts/unloading_backfill/src/sizing"
SAP = ROOT / "artifacts/unloading_backfill/sizing_sap.json"
OUT_DIR = ROOT / "artifacts/unloading_backfill/sizing_vision"
MANIFEST = ROOT / "artifacts/unloading_backfill/batch_sizing_manifest.json"

PROMPT = """This PDF is a tuna SIZING report from a Bangkok cannery (Thai Union, etc.) for fish transshipped by SILLA CO., LTD.
It may contain one or several reports (one per fishing vessel / sales order / page). For EACH report, read ONLY its
grand-total row (GRAND TOTAL / TOTAL / SIZING QTY of the whole report — never single truck rows) and return every
size column that has a non-zero value.

Return ONLY one JSON object, no prose, no comments:
{"reports": [{
  "page": <first page number of this report>,
  "fishing_vessel": "<F/V NAME as printed>",
  "carrier": "<CARRIER as printed or null>",
  "receiver": "<RECEIVER/buyer or null>",
  "date": "<YYYY-MM-DD or null>",
  "order_no": "<SO / order number or null>",
  "unit": "kg" | "MT",
  "lines": [{"column": "<column header exactly as printed, e.g. SKJ (LBS) 4-7.5>",
             "species": "SJ" | "YF" | "BET" | "ALB" | "OTHER",
             "grade": "<normalized: e.g. SKIPJACK 4-7.5 LBS, YELLOWFIN 20 LBS UP, BROKEN, DAMAGE>",
             "amount": <number as printed>}],
  "grand_total": <the report's overall total as printed>,
  "uncertain": ["<anything you could not read with confidence>"]
}]}

Rules:
- Copy numbers exactly as printed; do not convert units, do not compute.
- Do not include subtotal columns such as "TOTAL SKJ WT." or "TOTAL 100% WT." as lines.
- If a value is illegible, omit that line and say so in "uncertain".
"""


def nums_in(text: str) -> set[float]:
    return {float(x.replace(",", "")) for x in re.findall(r"\d[\d,]*\.?\d*", text)}


def pdf_text(path: Path) -> str:
    return subprocess.run(["pdftotext", "-layout", str(path), "-"], capture_output=True, text=True).stdout


def targets() -> list[Path]:
    non_sap = json.loads(SAP.read_text())["non_sap"]
    return [SRC / f for f in non_sap]


def request_params(path: Path) -> dict:
    data = base64.standard_b64encode(path.read_bytes()).decode()
    return {"model": MODEL, "max_tokens": 8000, "messages": [{"role": "user", "content": [
        {"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": data}},
        {"type": "text", "text": PROMPT},
    ]}]}


def validate(got: dict, text: str) -> list[str]:
    errors = []
    reports = got.get("reports") or []
    if not reports:
        return ["보고서 없음"]
    grounded = nums_in(text) if len(text.strip()) > 200 else None
    for i, r in enumerate(reports):
        lines = r.get("lines") or []
        total = r.get("grand_total")
        if not lines or not isinstance(total, (int, float)):
            errors.append(f"#{i} 행 또는 총계 없음")
            continue
        s = sum(x.get("amount", 0) for x in lines)
        tol = 1.0 if r.get("unit") == "kg" else 0.001
        if abs(s - total) > tol:
            errors.append(f"#{i} 등급 합 {s:.3f} ≠ 총계 {total}")
        if grounded is not None:
            for v in [total] + [x.get("amount") for x in lines]:
                if not any(abs(v - g) <= 0.0051 for g in grounded):
                    errors.append(f"#{i} 원문에 없는 숫자 {v}")
    return errors


def parse_reply(msg) -> dict | None:
    text = "".join(c.text for c in msg.content if c.type == "text")
    m = re.search(r"\{.*\}", text, re.S)
    return json.loads(m.group(0)) if m else None


def record(path: Path, sha: str, msg, got: dict, batch_id: str | None) -> dict:
    text = pdf_text(path)
    rec = {"source_file": nfc(str(path.relative_to(SRC))), "source_sha256": sha, "model": MODEL,
           "batch_id": batch_id, "text_layer": len(text.strip()) > 200, "extracted": got,
           "validation_errors": validate(got, text),
           "usage": {"input_tokens": msg.usage.input_tokens, "output_tokens": msg.usage.output_tokens,
                     "stop_reason": msg.stop_reason}}
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / f"{sha[:16]}.json").write_text(json.dumps(rec, ensure_ascii=False, indent=1))
    return rec


def done() -> set[str]:
    return {json.loads(f.read_text())["source_sha256"] for f in OUT_DIR.glob("*.json")} if OUT_DIR.exists() else set()


def pending() -> dict[str, Path]:
    seen, finished = {}, done()
    for p in targets():
        h = hashlib.sha256(p.read_bytes()).hexdigest()
        if h not in finished and h not in seen:
            seen[h] = p
    return seen


def pilot(client: anthropic.Anthropic, n: int) -> None:
    items = list(pending().items())
    picked = items[:: max(1, len(items) // n)][:n]
    tin = tout = 0
    for h, p in picked:
        msg = client.messages.create(**request_params(p))
        tin += msg.usage.input_tokens
        tout += msg.usage.output_tokens
        try:
            got = parse_reply(msg) or {}
        except json.JSONDecodeError:
            got = {}
        rec = record(p, h, msg, got, None)
        status = "통과" if not rec["validation_errors"] else f"실패 {rec['validation_errors'][:2]}"
        print(f"{rec['source_file']} · 보고서 {len(got.get('reports') or [])} · {status}")
    print(json.dumps({"files": len(picked), "input_tokens": tin, "output_tokens": tout}))


def submit(client: anthropic.Anthropic) -> None:
    items = pending()
    if not items:
        print("보낼 파일이 없다")
        return
    requests, entries = [], {}
    for h, p in items.items():
        cid = f"sz_{h[:24]}"
        requests.append({"custom_id": cid, "params": request_params(p)})
        entries[cid] = {"path": nfc(str(p)), "sha256": h}
    batch = client.messages.batches.create(requests=requests)
    MANIFEST.write_text(json.dumps({"batch_id": batch.id, "model": MODEL, "entries": entries},
                                   ensure_ascii=False, indent=1))
    print(f"제출 {len(requests)}건 → batch {batch.id}")


def status(client: anthropic.Anthropic) -> None:
    m = json.loads(MANIFEST.read_text())
    b = client.messages.batches.retrieve(m["batch_id"])
    print(b.processing_status, b.request_counts.model_dump())


def collect(client: anthropic.Anthropic) -> None:
    m = json.loads(MANIFEST.read_text())
    b = client.messages.batches.retrieve(m["batch_id"])
    if b.processing_status != "ended":
        print(f"아직 끝나지 않음: {b.processing_status}")
        return
    tally = {"pass": 0, "fail": 0, "error": 0}
    tin = tout = 0
    for res in client.messages.batches.results(m["batch_id"]):
        entry = m["entries"][res.custom_id]
        path = Path(entry["path"])
        if res.result.type != "succeeded":
            tally["error"] += 1
            print(f"✗ {path.name}: {res.result.type}", file=sys.stderr)
            continue
        msg = res.result.message
        tin += msg.usage.input_tokens
        tout += msg.usage.output_tokens
        try:
            got = parse_reply(msg) or {}
        except json.JSONDecodeError:
            got = {}
        rec = record(path, entry["sha256"], msg, got, m["batch_id"])
        tally["pass" if not rec["validation_errors"] else "fail"] += 1
    print(json.dumps({**tally, "input_tokens": tin, "output_tokens": tout}, ensure_ascii=False))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["pilot", "submit", "status", "collect"])
    ap.add_argument("n", nargs="?", type=int, default=8)
    args = ap.parse_args()
    client = anthropic.Anthropic()
    if args.cmd == "pilot":
        pilot(client, args.n)
    else:
        {"submit": submit, "status": status, "collect": collect}[args.cmd](client)
    return 0


if __name__ == "__main__":
    sys.exit(main())
