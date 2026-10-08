#!/usr/bin/env python3
"""「최종 하역결과」 .xls 전체를 Message Batches API 로 구조화한다.

  submit  : 대상 파일을 찾아 내용 해시로 중복 제거 → 배치 제출 → manifest 기록
  status  : 배치 진행 상태
  collect : 결과를 받아 extract_final_results 의 검증을 그대로 적용해 파일별 JSON 기록

이미 final_results/ 에 같은 sha256 결과가 있으면 다시 보내지 않는다.
manifest 는 artifacts/unloading_backfill/batch_manifest.json.

실행:
  python3 scripts/unloading_backfill/batch_final_results.py submit
  python3 scripts/unloading_backfill/batch_final_results.py status
  python3 scripts/unloading_backfill/batch_final_results.py collect
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path

import anthropic

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_final_results import (  # noqa: E402
    MODEL, OUT_DIR, PROMPT, ROOT, dump_workbook, ledger_match, nfc, validate,
)

SOURCE = Path.home() / "Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/11. 태국/012. 하역 업무"
MANIFEST = ROOT / "artifacts/unloading_backfill/batch_manifest.json"
YEARS = range(2021, 2027)


def find_sources() -> list[Path]:
    found = []
    for y in YEARS:
        for dp, _, files in os.walk(SOURCE / f"{y} 하역업무"):
            for f in files:
                name = nfc(f)
                if ("최종 하역결과" in name or "최종하역결과" in name) and "정정전" not in name \
                        and name.lower().endswith(".xls"):
                    found.append(Path(dp) / f)
    return sorted(found)


def done_hashes() -> set[str]:
    out = set()
    for f in OUT_DIR.glob("*.json"):
        out.add(json.loads(f.read_text()).get("source_sha256", ""))
    return out


def submit(client: anthropic.Anthropic) -> None:
    done = done_hashes()
    seen: dict[str, Path] = {}
    for p in find_sources():
        h = hashlib.sha256(p.read_bytes()).hexdigest()
        if h not in done and h not in seen:
            seen[h] = p
    if not seen:
        print("보낼 파일이 없다")
        return
    requests, entries = [], {}
    for h, p in seen.items():
        try:
            dump, _ = dump_workbook(p)
        except Exception as exc:  # noqa: BLE001
            print(f"✗ 읽기 실패 {nfc(p.name)}: {type(exc).__name__}", file=sys.stderr)
            continue
        cid = f"fr_{h[:24]}"
        requests.append({"custom_id": cid, "params": {
            "model": MODEL, "max_tokens": 16000,
            "messages": [{"role": "user", "content": f"{PROMPT}\n\n<workbook>\n{dump}\n</workbook>"}],
        }})
        entries[cid] = {"path": nfc(str(p)), "sha256": h}
    batch = client.messages.batches.create(requests=requests)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
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
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    tally = {"pass": 0, "fail": 0, "error": 0}
    tok_in = tok_out = 0
    for res in client.messages.batches.results(m["batch_id"]):
        entry = m["entries"][res.custom_id]
        path = Path(entry["path"])
        if res.result.type != "succeeded":
            tally["error"] += 1
            print(f"✗ {path.name}: {res.result.type}", file=sys.stderr)
            continue
        msg = res.result.message
        tok_in += msg.usage.input_tokens
        tok_out += msg.usage.output_tokens
        text = "".join(c.text for c in msg.content if c.type == "text")
        match = re.search(r"\{.*\}", text, re.S)
        try:
            got = json.loads(match.group(0)) if match else None
            if got is None:
                raise ValueError
            _, numbers = dump_workbook(path)
            errors = validate(got, numbers)
        except Exception as exc:  # noqa: BLE001
            tally["error"] += 1
            print(f"✗ {path.name}: 응답 해석 실패 {type(exc).__name__}", file=sys.stderr)
            continue
        record = {"source_file": entry["path"], "source_sha256": entry["sha256"], "model": m["model"],
                  "batch_id": m["batch_id"], "extracted": got, "validation_errors": errors,
                  "ledger_check": ledger_match(got),
                  "usage": {"input_tokens": msg.usage.input_tokens, "output_tokens": msg.usage.output_tokens,
                            "stop_reason": msg.stop_reason}}
        (OUT_DIR / f"{path.stem}_{entry['sha256'][:8]}.json").write_text(
            json.dumps(record, ensure_ascii=False, indent=1))
        tally["pass" if not errors else "fail"] += 1
    print(json.dumps({**tally, "input_tokens": tok_in, "output_tokens": tok_out}, ensure_ascii=False))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["submit", "status", "collect"])
    args = ap.parse_args()
    client = anthropic.Anthropic()
    {"submit": submit, "status": status, "collect": collect}[args.cmd](client)
    return 0


if __name__ == "__main__":
    sys.exit(main())
