#!/usr/bin/env python3
"""THAICEN 수기 DAILY REPORT(jpg)에서 조정량을 Claude 비전으로 추출해 원장과 대조한다.

파일럿 전용. 원장(`public/data/unloading/local_db.json`)은 읽기만 한다.
추출값은 후보일 뿐이며 원장 반영은 사람이 「UP TO DATE TOTAL」 대조 후 결정한다.

실행:
  python3 scripts/unloading_backfill/pilot_handwritten.py <이미지폴더> --vessel sein-venus
"""
from __future__ import annotations

import argparse
import base64
import json
import re
import sys
from pathlib import Path

import anthropic

ROOT = Path(__file__).resolve().parents[2]
LEDGER = ROOT / "public/data/unloading/local_db.json"
OUT_DIR = ROOT / "artifacts/unloading_backfill"
MODEL = "claude-sonnet-5-5"

PROMPT = """This is a handwritten THAICEN "DAILY REPORT" for a tuna carrier unloading in Bangkok.
Return ONLY a strict JSON object (no comments, no markdown) with these keys. Numbers are plain decimals in metric tons, keeping the sign exactly as written.
- working_date: "DD.MM.YYYY" as written
- vessel: the M.V name
- today_total: TODAY row, TOTAL column
- gtotal: G'TOTAL row, TOTAL column
- balance: BALANCE row, TOTAL column
- bottom_total_balance: the number after "/" on the bottom TOTAL line, or null if blank or a dash
- remark_adjustments: list of signed values in the REMARK column (e.g. [30.8, -8.55]); [] if none
- up_to_date_adjustment: signed value on the second "UP TO DATE TOTAL" line, or null
- uncertain: list of short notes on fields you could not read confidently
Do not compute or guess missing values; use null and note them in "uncertain"."""


def extract(client: anthropic.Anthropic, path: Path) -> tuple[dict, dict]:
    data = base64.standard_b64encode(path.read_bytes()).decode()
    msg = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": data}},
                {"type": "text", "text": PROMPT},
            ],
        }],
    )
    text = "".join(b.text for b in msg.content if b.type == "text")
    match = re.search(r"\{.*\}", text, re.S)
    if not match:
        raise ValueError(f"{path.name}: JSON 응답 없음")
    usage = {"input_tokens": msg.usage.input_tokens, "output_tokens": msg.usage.output_tokens}
    return json.loads(match.group(0)), usage


def ledger_rows(vessel: str) -> dict[str, dict]:
    db = json.loads(LEDGER.read_text())
    return {r["report_date"]: r for r in db["unloading_reports"] if r.get("vessel_id") == vessel}


def report_date(stem: str) -> str:
    return f"{int(stem[4:6])}/{int(stem[6:8])}"


def close(a, b, tol=0.005) -> bool:
    return a is not None and b is not None and abs(float(a) - float(b)) <= tol


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("image_dir", type=Path)
    ap.add_argument("--vessel", required=True)
    args = ap.parse_args()

    client = anthropic.Anthropic()
    truth = ledger_rows(args.vessel)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    results, total_in, total_out = [], 0, 0
    for img in sorted(args.image_dir.glob("*.jpg")):
        try:
            got, usage = extract(client, img)
        except Exception as exc:  # noqa: BLE001
            print(f"{img.name}: 실패 {type(exc).__name__}", file=sys.stderr)
            continue
        total_in += usage["input_tokens"]
        total_out += usage["output_tokens"]
        row = truth.get(report_date(img.stem), {})
        daily_adj = round(sum(got.get("remark_adjustments") or []), 3)
        checks = {
            "today_total": close(got.get("today_total"), row.get("daily_amount")),
            "gtotal": close(got.get("gtotal"), row.get("cumulative_amount")),
            "balance": close(got.get("balance"), row.get("remaining_amount")),
            "daily_adjustment": close(daily_adj, row.get("daily_adjustment_amount")),
            "cumulative_adjustment": close(got.get("up_to_date_adjustment"), row.get("cumulative_adjustment_amount")),
            "adjusted_balance": close(got.get("bottom_total_balance"), row.get("adjusted_remaining_amount")),
        }
        results.append({"file": img.name, "report_date": report_date(img.stem), "extracted": got,
                        "daily_adjustment_sum": daily_adj, "checks": checks, "usage": usage})
        mark = " ".join(f"{k}={'O' if v else 'X'}" for k, v in checks.items())
        print(f"{report_date(img.stem):>5}  {mark}")

    fields = [c for r in results for c in r["checks"].values()]
    summary = {"model": MODEL, "vessel": args.vessel, "images": len(results),
               "fields_ok": sum(fields), "fields_total": len(fields),
               "input_tokens": total_in, "output_tokens": total_out}
    out = OUT_DIR / f"pilot_{args.vessel}.json"
    out.write_text(json.dumps({"summary": summary, "results": results}, ensure_ascii=False, indent=1))
    print(json.dumps(summary, ensure_ascii=False))
    print(f"→ {out.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
