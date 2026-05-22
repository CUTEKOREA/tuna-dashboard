#!/usr/bin/env python3
"""
L-07 codemod — mobile responsive grid stacker.

Adds `data-mobile-stack` attribute to every JSX opening tag whose inline
`style` contains a fixed multi-column grid (`repeat(N, 1fr)` with N>=2,
or whitespace-separated '1fr 1fr ...').

Pairs with one CSS rule in app/globals.css:
  @media (max-width: 768px) {
    [data-mobile-stack] { grid-template-columns: 1fr !important; }
  }

Skips `auto-fit`, `auto-fill`, `minmax(...)` (already responsive).
Idempotent: re-running does nothing.

Usage:
  python scripts/fix_mobile_grid.py            # dry-run report
  python scripts/fix_mobile_grid.py --apply    # actually modify files
  python scripts/fix_mobile_grid.py --file components/X.tsx [--apply]
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCAN_DIRS = [ROOT / "components", ROOT / "app"]
EXCLUDE_PARTS = {"_archive", "node_modules", ".next", ".git"}
EXTENSIONS = {".tsx", ".jsx"}

# JSX opening tag containing `gridTemplateColumns` somewhere in its attrs.
# `[^<]*?` keeps us inside one tag (JSX opening tags don't contain `<`).
TAG_RE = re.compile(
    r"<([A-Za-z][A-Za-z0-9.]*)\b([^<]*?gridTemplateColumns[^<]*?)(/?>)",
    re.DOTALL,
)

# Patterns meaning "fixed multi-column" -> needs mobile stacking
TARGET = re.compile(
    r"""gridTemplateColumns\s*:\s*['"`](?:
        repeat\(\s*[2-9]\d*\s*,\s*1fr\s*\)
        |
        (?:1fr\s+){1,9}1fr
    )['"`]""",
    re.VERBOSE,
)

# Already-responsive markers -> skip
SKIP = re.compile(r"auto-fit|auto-fill|minmax|repeat\(\s*1\s*,")

ALREADY = re.compile(r"\bdata-mobile-stack\b")


def iter_target_files():
    for root in SCAN_DIRS:
        if not root.exists():
            continue
        for p in root.rglob("*"):
            if p.suffix not in EXTENSIONS:
                continue
            if any(part in EXCLUDE_PARTS for part in p.parts):
                continue
            yield p


def transform(text: str) -> tuple[str, int, int, int, list[str]]:
    """
    Returns: (new_text, found, modified, idempotent_skip, diff_lines)
    """
    out: list[str] = []
    last = 0
    found = modified = idempotent_skip = 0
    diffs: list[str] = []

    for m in TAG_RE.finditer(text):
        tag, attrs, close = m.group(1), m.group(2), m.group(3)

        if not TARGET.search(attrs):
            continue
        if SKIP.search(attrs):
            continue

        found += 1

        if ALREADY.search(attrs):
            idempotent_skip += 1
            continue

        line_no = text.count("\n", 0, m.start()) + 1
        diffs.append(f"  L{line_no}: <{tag} ...> +data-mobile-stack")

        out.append(text[last:m.start()])
        out.append(f"<{tag} data-mobile-stack{attrs}{close}")
        last = m.end()
        modified += 1

    if modified == 0:
        return text, found, 0, idempotent_skip, diffs

    out.append(text[last:])
    return "".join(out), found, modified, idempotent_skip, diffs


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="Modify files (default: dry-run)")
    ap.add_argument("--file", type=str, help="Process single file only")
    args = ap.parse_args()

    if args.file:
        p = Path(args.file)
        if not p.is_absolute():
            p = (ROOT / p).resolve()
        files = [p]
    else:
        files = sorted(iter_target_files())

    total_found = total_modified = total_idem = files_touched = 0

    for path in files:
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as e:
            print(f"[skip] {path}: {e}", file=sys.stderr)
            continue

        new_text, found, modified, idem, diffs = transform(text)

        total_found += found
        total_modified += modified
        total_idem += idem

        if modified > 0:
            files_touched += 1
            rel = path.relative_to(ROOT) if path.is_absolute() else path
            print(f"[file] {rel} — {modified} sites")
            for d in diffs:
                print(d)
            if args.apply:
                path.write_text(new_text, encoding="utf-8")

    mode = "APPLY" if args.apply else "DRY-RUN"
    print(
        f"\n[summary] mode={mode} files_scanned={len(files)} "
        f"files_touched={files_touched} sites_found={total_found} "
        f"sites_modified={total_modified} idempotent_skip={total_idem}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
