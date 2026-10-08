#!/usr/bin/env python3
"""「최종 하역결과」 .xls 를 Claude 로 구조화하고, 결과를 로컬에서 검증한다.

Claude 는 시트 셀 덤프를 읽어 원선×어종 보고량·하역량을 JSON 으로 돌려준다.
신뢰는 Claude 가 아니라 아래 검증에서 나온다:
  ① 근거: 돌려준 숫자가 전부 시트 덤프에 실제로 있는가 (지어낸 숫자 차단)
  ② 원선 합: 행 합 = 원선 합계
  ③ 총계: 원선 합계의 합 = 총계
  ④ 원장 대조: 원장(local_db.json)에 있는 항차면 총량을 맞대 본다
원장은 읽기만 한다. 결과는 artifacts/unloading_backfill/final_results/ 에 쓴다.

실행:
  python3 scripts/unloading_backfill/extract_final_results.py <xls> [<xls> ...]
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

import anthropic
import xlrd

ROOT = Path(__file__).resolve().parents[2]
LEDGER = ROOT / "public/data/unloading/local_db.json"
OUT_DIR = ROOT / "artifacts/unloading_backfill/final_results"
MODEL = "claude-sonnet-5-5"
TOL = 0.05

PROMPT = """Below is a cell dump of a Korean tuna unloading "최종 하역결과" (final unloading result) workbook.
Each line is "r<row>: c<col>=<value> ...". Columns per source vessel come in triples: 보고량 (reported), 하역량 (discharged), 증감 (difference).

Tasks:
1. If there are several sheets, choose the one that represents the final, whole-voyage result
   (prefer a TOTAL sheet over per-port sheets, and the latest correction such as "수정 2" over earlier ones). Explain briefly.
2. From that sheet, extract every DETAIL row (skip 소계/subtotal and 합계/total rows) for every source vessel column (skip the 합계 column).

Return ONLY strict JSON (no comments, no markdown):
{
 "sheet_used": "...",
 "sheet_reason": "...",
 "period_start": "YYYY-MM-DD",
 "period_end": "YYYY-MM-DD",
 "port": "...",
 "buyer": "...",
 "source_vessels": [
  {"name": "as written in the header",
   "lines": [{"label": "row label as written", "species": "YF|SJ|BET|ALB|OTHER", "reported": 0.0, "discharged": 0.0}],
   "total_reported": 0.0, "total_discharged": 0.0}
 ],
 "grand_total_reported": 0.0,
 "grand_total_discharged": 0.0,
 "uncertain": ["..."]
}
Rules: copy numbers exactly as they appear in the dump, keeping all 3 decimals (1025.655, not 1025.65). total_* and grand_total_* must be the values printed in the
합계 rows/column, not your own sums. Omit detail lines where both reported and discharged are 0. If a value is absent use 0.0 and mention it in "uncertain". Never invent numbers."""


def nfc(s: str) -> str:
    return unicodedata.normalize("NFC", s)


def dump_workbook(path: Path) -> tuple[str, set[float]]:
    wb = xlrd.open_workbook(str(path))
    lines, numbers = [], set()
    for ws in wb.sheets():
        lines.append(f"### sheet: {ws.name}")
        for r in range(ws.nrows):
            cells = []
            for c, v in enumerate(ws.row_values(r)):
                if isinstance(v, float):
                    v = round(v, 3)
                    numbers.add(v)
                    cells.append(f"c{c}={v:g}")
                elif str(v).strip():
                    cells.append(f"c{c}={str(v).strip()}")
            if cells:
                lines.append(f"r{r}: " + " ".join(cells))
    return "\n".join(lines), numbers


def call_claude(client: anthropic.Anthropic, dump: str) -> tuple[dict, dict]:
    msg = client.messages.create(
        model=MODEL,
        max_tokens=16000,
        messages=[{"role": "user", "content": f"{PROMPT}\n\n<workbook>\n{dump}\n</workbook>"}],
    )
    text = "".join(b.text for b in msg.content if b.type == "text")
    match = re.search(r"\{.*\}", text, re.S)
    if not match:
        raise ValueError("JSON 응답 없음")
    return json.loads(match.group(0)), {"input_tokens": msg.usage.input_tokens,
                                        "output_tokens": msg.usage.output_tokens,
                                        "stop_reason": msg.stop_reason}


def grounded(v: float, numbers: set[float]) -> bool:
    return v == 0 or any(abs(v - n) <= 0.0051 for n in numbers)


def validate(got: dict, numbers: set[float]) -> list[str]:
    errors = []
    for sv in got.get("source_vessels", []):
        for ln in sv.get("lines", []):
            for k in ("reported", "discharged"):
                if not grounded(float(ln[k]), numbers):
                    errors.append(f"근거 없음: {sv['name']}/{ln['label']}/{k}={ln[k]}")
        for k in ("reported", "discharged"):
            s = sum(float(ln[k]) for ln in sv.get("lines", []))
            if abs(s - float(sv[f"total_{k}"])) > TOL:
                errors.append(f"원선 합 불일치: {sv['name']}/{k} 행합 {s:.3f} ≠ 합계 {sv[f'total_{k}']}")
    for k in ("reported", "discharged"):
        s = sum(float(sv[f"total_{k}"]) for sv in got.get("source_vessels", []))
        if abs(s - float(got[f"grand_total_{k}"])) > TOL:
            errors.append(f"총계 불일치: {k} 원선합 {s:.3f} ≠ 총계 {got[f'grand_total_{k}']}")
        if not grounded(float(got[f"grand_total_{k}"]), numbers):
            errors.append(f"근거 없음: 총계 {k}={got[f'grand_total_{k}']}")
    return errors


def ledger_match(got: dict) -> dict | None:
    db = json.loads(LEDGER.read_text())
    start = (got.get("period_start") or "").replace("-", ".")
    for v in db["unloading_vessels"]:
        if start and v.get("date_range", "").startswith(start):
            actual = sum(s["actual_amount"] for s in db["unloading_species"] if s["vessel_id"] == v["vessel_id"]
                         and s.get("updated_at", "")[:4] == start[:4])
            return {"vessel_id": v["vessel_id"], "date_range": v["date_range"],
                    "reported_total": v["reported_total"], "actual_total": round(actual, 3),
                    "reported_ok": abs(v["reported_total"] - float(got["grand_total_reported"])) <= TOL,
                    "actual_ok": abs(actual - float(got["grand_total_discharged"])) <= TOL}
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+", type=Path)
    args = ap.parse_args()

    client = anthropic.Anthropic()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    tot_in = tot_out = 0
    for path in args.files:
        name = nfc(path.name)
        dump, numbers = dump_workbook(path)
        try:
            got, usage = call_claude(client, dump)
        except Exception as exc:  # noqa: BLE001
            print(f"✗ {name}: {type(exc).__name__}", file=sys.stderr)
            continue
        tot_in += usage["input_tokens"]
        tot_out += usage["output_tokens"]
        errors = validate(got, numbers)
        ledger = ledger_match(got)
        record = {"source_file": nfc(str(path)), "source_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                  "model": MODEL, "extracted": got, "validation_errors": errors, "ledger_check": ledger,
                  "usage": usage}
        out = OUT_DIR / (Path(name).stem + ".json")
        out.write_text(json.dumps(record, ensure_ascii=False, indent=1))
        status = "PASS" if not errors else f"FAIL({len(errors)})"
        lg = "" if not ledger else f" 원장대조 보고량={'O' if ledger['reported_ok'] else 'X'} 실측={'O' if ledger['actual_ok'] else 'X'}"
        print(f"{status:9} {name}  sheet={got.get('sheet_used')!r} 원선={len(got.get('source_vessels', []))} "
              f"보고 {got.get('grand_total_reported')} / 하역 {got.get('grand_total_discharged')}{lg}"
              f"  [{usage['input_tokens']}+{usage['output_tokens']} tok]")
        for e in errors[:5]:
            print(f"          - {e}")
    print(json.dumps({"input_tokens": tot_in, "output_tokens": tot_out}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
