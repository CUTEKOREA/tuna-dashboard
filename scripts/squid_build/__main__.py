"""Command-line entry point for the squid v5 builder."""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

from scripts.validate_squid_v5 import validate

from . import build_document
from .spec import DEFAULT_ARCHIVE_ROOT, DEFAULT_SPEC_PATH


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--archive-root", type=Path, default=DEFAULT_ARCHIVE_ROOT)
    parser.add_argument("--spec", type=Path, default=DEFAULT_SPEC_PATH)
    parser.add_argument("--only", default=None)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    document = build_document(
        archive_root=args.archive_root,
        spec_path=args.spec,
        only=args.only,
    )
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
    print(f"wrote {args.out} — widgets={len(document['widgets'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
