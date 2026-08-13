#!/usr/bin/env python3
"""data/mackerel/*.json 의 provenance 블록을 검증한다. 빌드 게이트용.

  - source_id 가 아카이브 소스 원장에 실재하는가
  - 입력 파일이 아직 그 자리에 있고 SHA-256 이 기록과 일치하는가 (조용한 데이터 변경 탐지)
  - method / grade 가 허용값인가
  - 필수 서사 필드(sit/strat)와 단위가 있는가

종료코드 0 = 통과. CI 에서 그대로 쓴다.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build
import provenance
from scope import ARCHIVE

ROOT = Path(__file__).resolve().parents[2]
DATA = build.OUT_DIR
REQUIRED = ("source_id", "publisher", "series", "period", "extract_date",
            "input_files", "input_sha256", "method", "grade", "rebuild")


def check(path: Path) -> list[str]:
    errs = []
    w = json.loads(path.read_text(encoding="utf-8"))
    p = w.get("provenance")
    if not p:
        return ["provenance 블록 없음"]

    for k in REQUIRED:
        if not p.get(k):
            errs.append(f"provenance.{k} 누락")
    if errs:
        return errs

    if p["source_id"] not in provenance.registry_ids():
        errs.append(f"source_id '{p['source_id']}' 가 소스 원장에 없음")
    if p["method"] not in provenance.METHODS:
        errs.append(f"method '{p['method']}' 불가")
    if p["grade"] not in provenance.GRADES:
        errs.append(f"grade '{p['grade']}' 불가")
    if len(p["input_files"]) != len(p["input_sha256"]):
        errs.append("input_files 와 input_sha256 개수 불일치")

    for rel, want in zip(p["input_files"], p["input_sha256"]):
        src = ARCHIVE / rel
        if not src.exists():
            errs.append(f"입력 파일 없음: {rel}")
            continue
        got = provenance.sha256(src)
        if got != want:
            errs.append(f"입력 파일 변경됨(재빌드 필요): {rel}\n      기록 {want[:16]}… / 실제 {got[:16]}…")

    if not w.get("sit") or not w.get("strat"):
        errs.append("SIT/TAK 서사 누락 (UI_RULES 2-1)")
    if not w.get("unit"):
        errs.append("unit 누락")
    if p["grade"] == "C" and "추정" not in (w.get("subtitle", "") + w.get("sit", "")):
        errs.append("grade C 인데 '추정' 표기가 본문에 없음")
    return errs


def main():
    files = sorted(DATA.glob(build.OUT_GLOB))
    if not files:
        print(f"✗ {DATA.relative_to(ROOT)} 에 위젯 JSON이 없다. build.py 부터 실행.")
        return 1

    bad = 0
    for f in files:
        errs = check(f)
        if errs:
            bad += 1
            print(f"✗ {f.name}")
            for e in errs:
                print(f"    {e}")
        else:
            print(f"✓ {f.name}")

    print(f"\n{len(files) - bad}/{len(files)} 통과")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
