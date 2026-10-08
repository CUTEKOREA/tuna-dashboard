#!/usr/bin/env python3
"""조사보고서 그림 → `public/data/companies/<key>_figures_v1.json` + 정적 이미지.

절 → 단계 매핑은 `build_report_tables.py` 가 이미 갖고 있다. 표·서술·그림이 같은 단계에
모여야 하므로 **그 매핑을 그대로 재사용한다.**

표지 팩샷은 절이 없다. 첫 단계(c01)에 붙인다 — 브랜드 얼굴이 회사 개요 옆에 오는 것이 맞다.
"""
from __future__ import annotations

import importlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from report_figures import parse  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/data/companies"
IMG_ROOT = ROOT / "public/data/companies/figures"
URL_ROOT = "/data/companies/figures"

_TABLES = importlib.import_module("build_report_tables")
SPECS = {k: {"src": v["src"], "stages": v["stages"]} for k, v in _TABLES.SPECS.items()}


def build(key: str, spec: dict) -> tuple[int, int, int]:
    src = ROOT / spec["src"]
    fs = parse(src.read_text(encoding="utf8", errors="replace"),
               key, IMG_ROOT / key, f"{URL_ROOT}/{key}")
    kept = []
    for f in fs.figures:
        stage = "c01" if f.sid == "cover" else spec["stages"].get(f.sid)
        if stage is None:
            continue
        kept.append({"stage": stage, "sid": f.sid, "kind": f.kind, "ord": f.ord,
                     "caption": f.caption, "alt": f.alt,
                     **({"src": f.src} if f.src else {}),
                     **({"svg": f.svg} if f.svg else {}),
                     **({"css": f.css} if f.css else {})})
    payload = {
        "_meta": {
            "출처": str(spec["src"]),
            "생성": "python3 scripts/build_report_figures.py",
            "설명": "보고서의 팩샷과 차트. 이미지는 public 아래 정적 파일이고 여기에는 URL 만 담는다.",
        },
        "figures": kept,
    }
    p = OUT / f"{key}_figures_v1.json"
    p.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf8")
    shots = sum(1 for f in kept if f["kind"] == "shot")
    charts = sum(1 for f in kept if f["kind"] == "chart")
    docs = sum(1 for f in kept if f["kind"] == "doc")
    return shots, charts, docs, p.stat().st_size


def main() -> int:
    keys = sys.argv[1:] or list(SPECS)
    ts = tc = td = tb = 0
    for k in keys:
        if k not in SPECS:
            print(f"모르는 회사: {k}", file=sys.stderr)
            return 1
        s, c, d, b = build(k, SPECS[k])
        ts += s; tc += c; td += d; tb += b
        print(f"{k:12s} 팩샷 {s:3d} · 차트 {c:2d} · 문서 {d:2d} · JSON {b // 1024:3d} KB")
    disk = sum(f.stat().st_size for f in IMG_ROOT.rglob("*.jpg")) if IMG_ROOT.exists() else 0
    print(f"{'합계':12s} 팩샷 {ts:3d} · 차트 {tc:2d} · 문서 {td:2d} · JSON {tb // 1024:3d} KB · 정적 이미지 {disk // 1024:,} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
