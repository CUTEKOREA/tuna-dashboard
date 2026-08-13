"""Command-line entry point for the whelk v2 archive builder."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from scripts.validate_whelk_v2 import validate

from . import build_document
from .spec import DEFAULT_ARCHIVE_ROOT, REPO_ROOT


DEFAULT_OUTPUT = REPO_ROOT / "public/data/whelk_v2.json"


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--archive-root", type=Path, default=DEFAULT_ARCHIVE_ROOT)
    parser.add_argument("--only", default=None)
    return parser


def _inside(path: Path, parent: Path) -> bool:
    try:
        path.resolve().relative_to(parent.resolve())
    except ValueError:
        return False
    return True


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    if _inside(args.out, args.archive_root):
        print("build blocked — Google Drive archive is read-only", file=sys.stderr)
        return 2

    document = build_document(archive_root=args.archive_root, only=args.only)
    errors = validate(document)
    if errors:
        print(f"build blocked — {len(errors)} violation(s)", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps(document, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    empty_count = sum(widget["data"] == [] for widget in document["widgets"].values())
    print(
        f"wrote {args.out} — widgets={len(document['widgets'])} "
        f"empty_cards={empty_count}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
