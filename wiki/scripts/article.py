"""Parse one wiki article: YAML frontmatter + '## ' sections.

Shared by check_article.py and build_index.py. Standard library + pyyaml only.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

import yaml

_FM = re.compile(r"\A---\n(.*?)\n---\n", re.S)
_H2 = re.compile(r"^## (.+?)\s*$")


@dataclass
class Article:
    path: Path
    fm: dict = field(default_factory=dict)
    sections: dict = field(default_factory=dict)
    body: str = ""


def parse_article(path: Path) -> Article:
    text = Path(path).read_text(encoding="utf-8")
    fm: dict = {}
    body = text
    m = _FM.match(text)
    if m:
        loaded = yaml.safe_load(m.group(1)) or {}
        fm = loaded if isinstance(loaded, dict) else {}
        body = text[m.end():]

    sections: dict[str, list[str]] = {}
    current: str | None = None
    for line in body.splitlines():
        h = _H2.match(line)
        if h:
            current = h.group(1)
            sections[current] = []
            continue
        if current is not None and line.strip():
            sections[current].append(line.rstrip())
    return Article(path=Path(path), fm=fm, sections=sections, body=body)
