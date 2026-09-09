#!/usr/bin/env python3
"""Generate wiki/INDEX.md from article frontmatter and the first line of ## 요약.

Deterministic. Never edit INDEX.md by hand.
"""
from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from article import parse_article  # noqa: E402

ORDER = [("company", "기업"), ("rfmo", "RFMO"), ("gear", "어법"), ("cert", "인증"), ("regime", "제도")]
SKIP = {"INDEX.md", "README.md", "_template.md"}
MAX_SUMMARY = 80


def _summary(a) -> str:
    lines = a.sections.get("요약", [])
    s = lines[0].strip() if lines else ""
    return s if len(s) <= MAX_SUMMARY else s[:MAX_SUMMARY] + "…"


def build(wiki_root: Path) -> str:
    wiki_root = Path(wiki_root)
    by_type: dict[str, list] = {t: [] for t, _ in ORDER}
    for p in sorted(wiki_root.rglob("*.md")):
        if p.name in SKIP or "scripts" in p.parts:
            continue
        a = parse_article(p)
        t = a.fm.get("type")
        if t in by_type:
            by_type[t].append(a)

    total = sum(len(v) for v in by_type.values())
    out = [
        "# 참치 위키 INDEX",
        "",
        f"생성: {date.today().isoformat()} · 문서 {total}장 · `python3 wiki/scripts/build_index.py`로 재생성. 손으로 고치지 않는다.",
        "",
        "사실이 필요하면 아래 표에서 개체를 찾아 그 문서의 `## 사실`을 읽는다. 없으면 원자료로 간다.",
        "",
    ]
    for t, label in ORDER:
        arts = sorted(by_type[t], key=lambda a: str(a.fm.get("name", a.path.stem)))
        out.append(f"## {label} ({len(arts)})")
        out.append("")
        out.append("| 이름 | 별칭 | 요약 | last_verified | confidence |")
        out.append("|---|---|---|---|---|")
        for a in arts:
            aliases = a.fm.get("aliases") or []
            alias_s = ", ".join(str(x) for x in aliases) if isinstance(aliases, list) else str(aliases)
            out.append(f"| [[{a.path.stem}]] | {alias_s} | {_summary(a)} | {a.fm.get('last_verified','')} | {a.fm.get('confidence','')} |")
        out.append("")
    return "\n".join(out)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--wiki-root", default=str(Path(__file__).resolve().parents[1]))
    args = ap.parse_args()
    root = Path(args.wiki_root)
    text = build(root)
    (root / "INDEX.md").write_text(text + "\n", encoding="utf-8")
    n = sum(1 for l in text.splitlines() if l.startswith("| [["))
    print(f"INDEX: {n} 문서")
    return 0


if __name__ == "__main__":
    sys.exit(main())
