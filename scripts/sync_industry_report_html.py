#!/usr/bin/env python3
"""품목 해부보고서 원문 HTML → `public/reports/industry/<key>-2026-10.html`.

시장 이해 여섯 화면(명태·문어·새우·오징어·참치 해부·연육)의 「보고서 원문 보기」 링크가 가리키는 파일이다.
원문을 **바이트 그대로** 복사한다 — 고치지 않는다. 원문에 인쇄 스타일이 있어 브라우저 인쇄로 PDF 가 된다.
로그인 보호는 `proxy.ts` matcher 가 public 경로까지 덮는다.
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EDITION = "2026-10"
KEYS = ("pollock", "octopus", "shrimp", "squid", "tuna", "surimi", "mackerel", "tunafarm")
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
        print(f"{key:8s} {dst.stat().st_size // 1024:5,d} KB → {dst.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
