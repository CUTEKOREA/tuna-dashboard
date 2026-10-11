#!/usr/bin/env python3
"""시장 이해 허브(/industry) 카드·공통 품목 히어로 → `public/data/industry/hub_v1.json`.

사람이 정하는 것은 `lib/industry-items.json`(품목 이름·분류·전용 경로) 하나다.
카드의 표지 수치와 보고서 연월, 공통 품목 페이지의 히어로 타일은 전부 원문 표지에서 읽는다 —
`docs/evidence/industry-<key>-2026-10/보고서.html` 의 `.cover-facts` 타일(k·v·n)과 `.by-r` 연월이다.
옮겨 적지 않으므로 틀릴 자리가 없다.
"""
from __future__ import annotations

import html as H
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "lib/industry-items.json"
OUT = ROOT / "public/data/industry/hub_v1.json"
EDITION = "2026-10"

_TAG = re.compile(r"<[^>]+>")
_TILE = re.compile(
    r'<div class="cf[^"]*"><div class="k[^"]*">(.*?)</div><div class="v[^"]*">(.*?)</div>\s*<div class="n[^"]*">(.*?)</div></div>',
    re.S,
)


def _text(raw: str) -> str:
    # 줄바꿈(<br>)은 낱말 사이다. 태그만 걷으면 「Flag I농식품부」처럼 붙는다.
    raw = re.sub(r"<br\s*/?>", " ", raw, flags=re.I)
    return " ".join(H.unescape(_TAG.sub("", raw)).split())


def cover_facts(doc: str) -> list[dict]:
    block = re.search(r'<div class="cover-facts">(.*?)\n\s*</div>\s*\n', doc, re.S)
    if not block:
        return []
    tiles = [{"k": _text(k), "v": _text(v), "n": _text(n)} for k, v, n in _TILE.findall(block.group(1))]
    # 타일 틀이 바뀌어 정규식이 일부만 잡으면 조용히 줄어든다. 개수를 맞춰 본다.
    if len(tiles) != block.group(1).count('class="cf'):
        raise SystemExit(f"cover-facts 타일 {block.group(1).count('class=\"cf')}개 중 {len(tiles)}개만 읽었다")
    return tiles


def edition(doc: str) -> str:
    """보고서 연월. 표지 서명(`.by-r`)이 없는 틀은 본문 첫 날짜(YYYY-MM-DD)에서 연월만 읽는다."""
    by = re.search(r'class="by-r">([^<]+)<', doc)
    if by:
        return _text(by.group(1))
    d = re.search(r"(20\d\d)-(\d\d)-\d\d", doc)
    if not d:
        raise SystemExit("보고서 연월을 찾지 못했다")
    return f"{d.group(1)}년 {int(d.group(2))}월"


def report_title(doc: str) -> str:
    """보고서 제목. 표지 h1 의 한글 제목(`.lt`), 없으면 문서 <title>."""
    lt = re.search(r'<h1[^>]*>.*?<span class="lt">(.*?)</span>', doc, re.S)
    t = lt or re.search(r"<title>(.*?)</title>", doc, re.S)
    return _text(t.group(1)) if t else ""


def main() -> int:
    reg = json.loads(REGISTRY.read_text(encoding="utf8"))
    cats = reg["_meta"]["categories"]
    items = []
    for it in reg["items"]:
        if it["category"] not in cats:
            raise SystemExit(f"{it['key']}: 모르는 분류 {it['category']}")
        src = ROOT / f"docs/evidence/industry-{it['key']}-{EDITION}/보고서.html"
        doc = src.read_text(encoding="utf8", errors="replace")
        facts = cover_facts(doc)
        # 공통 라우트 품목은 히어로를 표지 타일로 그린다. 타일이 없으면 화면이 빈다.
        if "route" not in it and len(facts) < 4:
            raise SystemExit(f"{it['key']}: 표지 cover-facts 타일이 {len(facts)}개뿐이다")
        items.append({
            "key": it["key"],
            "name": it["name"],
            "category": it["category"],
            "href": f"/{it['route']}" if "route" in it else f"/industry/{it['key']}",
            "report": f"/reports/industry/{it['key']}-{EDITION}.html",
            "title": report_title(doc),
            "edition": edition(doc),
            "facts": facts,
        })
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "_meta": {"출처": "docs/evidence/industry-<key>-2026-10/보고서.html 표지(cover-facts·by-r)",
                  "생성": "python3 scripts/build_industry_hub.py",
                  "설명": "허브 카드와 공통 품목 히어로. 이름·분류는 lib/industry-items.json, 수치·연월은 원문 표지."},
        "categories": cats,
        "pinned": reg["_meta"]["pinned"],
        "items": items,
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf8")
    print(f"품목 {len(items)}개 · 분류 {len(cats)}개 · {OUT.stat().st_size // 1024} KB → {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
