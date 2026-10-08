#!/usr/bin/env python3
"""Re-ask Claude to correct LOGSHEET/SIZING extractions that failed validation.

The first extraction and its validation errors are sent back as a follow-up turn, so the
model re-reads only the disputed pages. Validation rules are unchanged; a retry replaces the
stored record only when it has fewer errors.

  python3 scripts/unloading_backfill/retry_failed.py [--only logsheet|sizing] [--dry-run]
"""
from __future__ import annotations

import argparse
import json
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import anthropic

sys.path.insert(0, str(Path(__file__).resolve().parent))
import batch_logsheet as LS  # noqa: E402
import batch_sizing as SZ  # noqa: E402

WORKERS = 4

FOLLOW_UP = """Your JSON above failed these arithmetic checks:
{errors}

Look again at the page images for the cells involved. Common causes: a row skipped or read twice,
a digit misread (1/7, 3/8, 5/6), a value placed in the wrong species column, or a cumulative trip
total used instead of this page's total. Return the COMPLETE corrected JSON object in the same
schema, nothing else. Copy numbers as printed; never adjust a value just to make the sums agree.
If the printed total itself disagrees with the printed rows, keep both as printed and add
"SOURCE_TOTAL_MISMATCH <where>" to "uncertain"."""

SIZING_FOLLOW_UP = FOLLOW_UP.replace("page images", "PDF pages").replace(
    "a value placed in the wrong species column, or a cumulative trip\ntotal used instead of this page's total",
    "a size column missed, a subtotal column counted as a line, or a truck row used instead of the\nreport's grand total")


def failed(out_dir: Path) -> list[tuple[Path, dict]]:
    return [(f, rec) for f in sorted(out_dir.glob("*.json"))
            if (rec := json.loads(f.read_text())).get("validation_errors")]


def stream(client: anthropic.Anthropic, params: dict):
    with client.messages.stream(**params) as s:
        return s.get_final_message()


def retry_logsheet(client: anthropic.Anthropic, f: Path, rec: dict) -> tuple[str, int, int]:
    path = LS.SRC / rec["source_file"]
    params = LS.request_params(path)
    if rec["usage"]["stop_reason"] == "end_turn" and rec["extracted"]:
        params["messages"] += [
            {"role": "assistant", "content": json.dumps(rec["extracted"], ensure_ascii=False)},
            {"role": "user", "content": FOLLOW_UP.format(errors="\n".join(rec["validation_errors"]))},
        ]
    msg = stream(client, params)
    got = LS.parse_reply(msg)
    return keep_better(f, rec, got, LS.validate(got), msg)


def retry_sizing(client: anthropic.Anthropic, f: Path, rec: dict) -> tuple[str, int, int]:
    path = SZ.SRC / rec["source_file"]
    params = SZ.request_params(path)
    params["max_tokens"] = 32000
    if rec["usage"]["stop_reason"] == "end_turn" and rec["extracted"]:
        params["messages"] += [
            {"role": "assistant", "content": json.dumps(rec["extracted"], ensure_ascii=False)},
            {"role": "user", "content": SIZING_FOLLOW_UP.format(errors="\n".join(rec["validation_errors"]))},
        ]
    msg = stream(client, params)
    try:
        got = SZ.parse_reply(msg) or {}
    except json.JSONDecodeError:
        got = {}
    return keep_better(f, rec, got, SZ.validate(got, SZ.pdf_text(path)), msg)


def keep_better(f: Path, rec: dict, got: dict, errors: list[str], msg) -> tuple[str, int, int]:
    before = len(rec["validation_errors"])
    if got and len(errors) < before:
        rec = {**rec, "extracted": got, "validation_errors": errors, "batch_id": None,
               "retry": {"previous_errors": rec["validation_errors"], "stop_reason": msg.stop_reason}}
        f.write_text(json.dumps(rec, ensure_ascii=False, indent=1))
    status = "통과" if not errors else f"실패 {len(errors)} (이전 {before}) {errors[:2]}"
    print(f"{rec['source_file'][-60:]} · {status}", flush=True)
    return status, msg.usage.input_tokens, msg.usage.output_tokens


def run(client: anthropic.Anthropic, fn, f: Path, rec: dict) -> tuple[str, int, int]:
    try:
        return fn(client, f, rec)
    except Exception as exc:  # one bad file must not stop the rest
        print(f"{rec['source_file'][-60:]} · 오류 {type(exc).__name__}", flush=True)
        return "오류", 0, 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", choices=["logsheet", "sizing"])
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    jobs = []
    if args.only in (None, "logsheet"):
        jobs += [(retry_logsheet, f, r) for f, r in failed(LS.OUT_DIR)]
    if args.only in (None, "sizing"):
        jobs += [(retry_sizing, f, r) for f, r in failed(SZ.OUT_DIR)]
    print(f"재시도 {len(jobs)}건", flush=True)
    if args.dry_run:
        return 0
    client = anthropic.Anthropic()
    with ThreadPoolExecutor(WORKERS) as pool:
        results = list(pool.map(lambda j: run(client, *j), jobs))
    passed = sum(1 for s, _, _ in results if s == "통과")
    print(json.dumps({"retried": len(results), "passed": passed,
                      "input_tokens": sum(r[1] for r in results),
                      "output_tokens": sum(r[2] for r in results)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
