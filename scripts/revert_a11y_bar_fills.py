#!/usr/bin/env python3
"""Revert codemod's Bar fill modifications.

Converts: <Bar ... fill="url(#a11y-X)" color={Y} ... />
Back to:  <Bar ... fill={Y} ... />

Reason: SVG <pattern fill="currentColor"> needs the parent to have CSS
color set, but Recharts <Bar> drops unknown props (color). Result: bars
render with currentColor falling back to the page text color (often
invisible on dark theme).

Keeps the <ChartPatternDefs /> and the import statement intact —
those are harmless dormant code that future A8 work can rebuild on.
"""
import re
import sys
from pathlib import Path

# Match: fill="url(#a11y-X)" ... color={Y} where Y is either {...} or "..."
# Two patterns to handle both orderings (fill first or color first; though
# our codemod always wrote fill before color).
PATTERN_FILL_COLOR = re.compile(
    r'fill="url\(#a11y-[a-z-]+\)"\s+color=(\{[^}]+\}|"[^"]+")'
)


def process_file(path: Path) -> bool:
    src = path.read_text(encoding='utf-8')
    if 'url(#a11y-' not in src:
        return False
    original = src

    def replace(m):
        color_expr = m.group(1)
        return f'fill={color_expr}'

    src = PATTERN_FILL_COLOR.sub(replace, src)

    if src == original:
        return False
    path.write_text(src, encoding='utf-8')
    return True


def main():
    paths = list(Path('components').glob('*.tsx'))
    if len(sys.argv) > 1:
        paths = [Path(a) for a in sys.argv[1:]]
    changed = []
    for p in sorted(paths):
        if process_file(p):
            changed.append(p)
    print(f'Reverted {len(changed)} file(s):')
    for p in changed:
        print(f'  {p}')


if __name__ == '__main__':
    main()
