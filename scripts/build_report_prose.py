#!/usr/bin/env python3
"""조사보고서 절별 서술 → `public/data/companies/<key>_prose_v1.json`.

`build_report_tables.py` 의 짝이다. 표는 그쪽이, 문단·콜아웃은 여기가 맡는다.
사람이 정하는 것은 **절 → 단계 매핑** 하나뿐이고 나머지는 원문에서 그대로 읽는다.

손으로 쓴 `lib/company-*-content.ts` 는 보고서 본문의 18%만 담았고 보고서가 개정될 때마다
같은 일을 두 번 하게 했다. 이 스크립트가 그 이중 관리를 없앤다.
"""
from __future__ import annotations

import importlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from report_prose import parse  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/data/companies"

# 절 → 단계. build_report_tables.py 의 stages 와 같은 값을 써야 표와 서술이 한 단계에 모인다.
SPECS: dict[str, dict] = {}

# 절 → 단계 매핑은 `build_report_tables.py` 가 이미 갖고 있다. 표와 서술이 같은 단계에
# 모여야 하므로 **그 매핑을 그대로 재사용한다.** 여기서 따로 적으면 두 파일이 어긋난다.
_TABLES = importlib.import_module("build_report_tables")
for _key, _spec in _TABLES.SPECS.items():
    SPECS[_key] = {"src": _spec["src"], "stages": _spec["stages"]}


def build(key: str, spec: dict) -> tuple[int, int, int]:
    src = ROOT / spec["src"]
    secs = parse(src.read_text(encoding="utf8", errors="replace"))
    kept = []
    for s in secs:
        stage = spec["stages"].get(s.sid)
        if stage is None or not s.blocks:
            continue
        d = s.as_json()
        d["stage"] = stage
        kept.append(d)

    expect = spec.get("expect")
    if expect and expect != len(kept):
        raise SystemExit(f"{key}: 절 개수가 달라졌다 — 기대 {expect} / 실제 {len(kept)}")
    if not kept:
        raise SystemExit(f"{key}: 추출된 절이 없다. src 경로나 section id 를 확인하라")

    chars = sum(len(b["text"]) for s in kept for b in s["blocks"])
    out = OUT / f"{key}_prose_v1.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({
        "_meta": {"출처": spec["src"], "생성": "python3 scripts/build_report_prose.py",
                  "설명": "조사보고서 서술을 원문에서 그대로 읽는다. 손으로 옮기지 않는다."},
        "sections": kept,
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf8")
    return len(kept), chars, out.stat().st_size


def main() -> int:
    tot_s = tot_c = tot_b = 0
    for key, spec in SPECS.items():
        n, c, b = build(key, spec)
        tot_s += n; tot_c += c; tot_b += b
        print(f"{key:12s} 절 {n:2d}개 · 서술 {c:6,d}자 · {b // 1024:3d} KB")
    print(f"{'합계':12s} 절 {tot_s:2d}개 · {tot_c:,}자 · {tot_b // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
