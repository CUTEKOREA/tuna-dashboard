#!/usr/bin/env python3
"""품목 해부보고서 원문 HTML → `public/reports/industry/<key>-2026-10.html`.

시장 이해 아홉 화면(명태·문어·새우·오징어·참치·연육·고등어·참치 양식·골뱅이)과 공통 품목 라우트의 「보고서 원문 보기」 링크가 가리키는 파일이다.
원문을 **바이트 그대로** 복사한다 — 고치지 않는다. 원문에 인쇄 스타일이 있어 브라우저 인쇄로 PDF 가 된다.
로그인 보호는 `proxy.ts` matcher 가 public 경로까지 덮는다.
"""
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EDITION = "2026-10"
# 전용 화면 아홉 + 공통 품목 라우트(/industry/[key]) 품목. 공통 품목은 레지스트리에서 읽는다.
KEYS = ("pollock", "octopus", "shrimp", "squid", "tuna", "surimi", "mackerel", "tunafarm", "whelk") + tuple(
    it["key"] for it in json.loads((ROOT / "lib/industry-items.json").read_text(encoding="utf8"))["items"]
    if "route" not in it
)
OUT = ROOT / "public/reports/industry"


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for key in KEYS:
        src = ROOT / f"docs/evidence/industry-{key}-{EDITION}/보고서.html"
        if not src.exists():
            print(f"원문 없음: {src}", file=sys.stderr)
            return 1
        dst = OUT / f"{key}-{EDITION}.html"
        shutil.copyfile(src, dst)
        print(f"{key:14s} {dst.stat().st_size // 1024:5,d} KB → {dst.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
