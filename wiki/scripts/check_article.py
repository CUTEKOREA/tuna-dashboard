#!/usr/bin/env python3
"""Check one wiki article against the four rules in the design spec (§6).

Exit code = number of errors. Warnings never fail the check.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from article import parse_article  # noqa: E402

TYPES = {"company", "rfmo", "gear", "cert", "regime"}
CONF = {"A", "B", "C"}
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
SRC_TAIL = re.compile(r"\[출처 (\d+)\]\s*$")
SRC_ANY = re.compile(r"\[출처 (\d+)\]")
SRC_DEF = re.compile(r"^\[(\d+)\]\s")
LINK = re.compile(r"\[\[([^\]|#]+)")


def check(path: Path, wiki_root: Path) -> tuple[list[str], list[str]]:
    a = parse_article(path)
    errors: list[str] = []
    warnings: list[str] = []

    # 1. frontmatter
    for key in ("type", "name", "last_verified", "confidence"):
        if key not in a.fm or a.fm[key] in (None, ""):
            errors.append(f"frontmatter '{key}' 없음")
    t = a.fm.get("type")
    if t is not None and t not in TYPES:
        errors.append(f"frontmatter type '{t}' — {sorted(TYPES)} 중 하나여야 함")
    c = a.fm.get("confidence")
    if c is not None and str(c) not in CONF:
        errors.append(f"frontmatter confidence '{c}' — A/B/C 중 하나여야 함")
    d = a.fm.get("last_verified")
    if d is not None and not DATE.match(str(d)):
        errors.append(f"frontmatter last_verified '{d}' — YYYY-MM-DD 형식이어야 함")

    # 2. every fact bullet ends with [출처 n]
    for line in a.sections.get("사실", []):
        if line.startswith("- ") and not SRC_TAIL.search(line):
            errors.append(f"사실 불릿에 [출처 n] 없음: {line[:60]}")

    # 3. every [출처 n] is defined under ## 출처
    defined = {m.group(1) for line in a.sections.get("출처", []) for m in [SRC_DEF.match(line)] if m}
    used = set(SRC_ANY.findall(a.body))
    for n in sorted(used - defined, key=int):
        errors.append(f"[출처 {n}] 이 ## 출처 에 정의되지 않음")

    # 4. wikilinks resolve (warning only)
    stems = {p.stem for p in Path(wiki_root).rglob("*.md")}
    for name in set(LINK.findall(a.body)):
        if name.strip() not in stems:
            warnings.append(f"[[{name}]] 대상 문서 없음")

    return errors, warnings


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--wiki-root", default=None)
    args = ap.parse_args()
    path = Path(args.file).resolve()
    root = Path(args.wiki_root).resolve() if args.wiki_root else _find_root(path)
    errors, warnings = check(path, root)
    for e in errors:
        print(f"ERR: {e}")
    for w in warnings:
        print(f"WARN: {w}")
    return len(errors)


def _find_root(path: Path) -> Path:
    for p in path.parents:
        if p.name == "wiki":
            return p
    return path.parent


if __name__ == "__main__":
    sys.exit(main())
