#!/usr/bin/env python3
"""
A8 색맹 대비 codemod (L-07 patten).

For each .tsx file in components/:
1. If file contains <Bar and lacks ChartPatterns import, add the import.
2. Within each <BarChart...>...</BarChart> or <ComposedChart...>...</ComposedChart>
   block, insert <ChartPatternDefs /> after opening tag if missing.
3. For each plain <Bar ... fill="..." ... /> (single-line, no Cell loop),
   replace fill="X" with fill="url(#a11y-PATTERN)" color="X" where PATTERN
   rotates per Bar within each chart block.

Skips Bar tags that already have fill="url(#a11y-" (idempotent).
Skips Bars wrapping <Cell> loops (multi-line — fill is overridden by Cells).

Usage: python scripts/fix_a11y_charts.py [--dry-run] [files...]
"""
import re
import sys
from pathlib import Path

PATTERNS = ['stripe-h', 'diag', 'dots', 'stripe-v', 'cross']

# Match BarChart/ComposedChart as a full tag name (not BarChart2 etc.)
# and find the matching '>' that closes the opening tag, accounting for
# nested {...} expressions in JSX attributes.
CHART_OPEN_NAME = re.compile(r'<(BarChart|ComposedChart)\b')


def find_chart_open_tags(src: str):
    """Yield (start_idx, end_idx_after_gt, chart_name) for each chart open tag.
    Skips self-closing tags. Handles multi-line attributes with nested {...}."""
    for m in CHART_OPEN_NAME.finditer(src):
        name = m.group(1)
        i = m.end()
        depth = 0  # brace depth inside attribute values
        while i < len(src):
            ch = src[i]
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
            elif ch == '>' and depth == 0:
                # Check for self-closing '/>'
                if src[i - 1] == '/':
                    break  # skip self-closing tags
                yield (m.start(), i + 1, name)
                break
            elif ch == '<' and depth == 0:
                break  # malformed; bail
            i += 1
BAR_OPEN_LINE = re.compile(r'(<Bar\s+[^>]*?)fill=(\{[^}]+\}|"[^"]+")([^>]*?/>)')
DEFS_NEXT = re.compile(r'<ChartPatternDefs\s*/>')

IMPORT_LINE = "import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';\n"


def has_chartpatterns_import(src: str) -> bool:
    return 'ChartPatterns' in src and "from './ChartPatterns'" in src


def add_import(src: str) -> str:
    if has_chartpatterns_import(src):
        return src
    lines = src.split('\n')
    # Insert after last "import" near top
    last_import_idx = -1
    for i, ln in enumerate(lines[:80]):
        if ln.startswith('import ') and 'from ' in ln:
            last_import_idx = i
    if last_import_idx >= 0:
        lines.insert(last_import_idx + 1, IMPORT_LINE.rstrip('\n'))
    return '\n'.join(lines)


def process_chart_block(block: str) -> str:
    """Replace plain Bars in a chart block with patterned versions."""
    bar_index = [0]

    def replace_bar(m):
        prefix, fill_val, suffix = m.group(1), m.group(2), m.group(3)
        # Skip if already using a11y pattern
        if 'url(#a11y-' in fill_val or 'color=' in (prefix + suffix):
            return m.group(0)
        kind = PATTERNS[bar_index[0] % len(PATTERNS)]
        bar_index[0] += 1
        return f'{prefix}fill="url(#a11y-{kind})" color={fill_val}{suffix}'

    new_block = BAR_OPEN_LINE.sub(replace_bar, block)
    return new_block


def insert_defs_after_chart_open(src: str) -> str:
    """For each <BarChart...> or <ComposedChart...>, ensure <ChartPatternDefs />
    appears immediately after the opening tag within the JSX block.
    Builds result by collecting insertions and applying them in reverse order
    so earlier indices remain valid."""
    insertions = []  # list of (position, text)
    for start, end, _name in find_chart_open_tags(src):
        lookahead = src[end:end + 500]
        if DEFS_NEXT.search(lookahead):
            continue
        # find indentation of chart open line
        line_start = src.rfind('\n', 0, start) + 1
        indent = ''
        for ch in src[line_start:start]:
            if ch in ' \t':
                indent += ch
            else:
                break
        insertions.append((end, f'\n{indent}  <ChartPatternDefs />'))
    # Apply insertions in reverse
    parts = list(src)
    for pos, text in sorted(insertions, key=lambda x: -x[0]):
        parts.insert(pos, text)
    return ''.join(parts)


def process_file(path: Path, dry_run: bool = False) -> bool:
    src = path.read_text(encoding='utf-8')
    if '<Bar ' not in src and '<BarChart' not in src and '<ComposedChart' not in src:
        return False
    original = src

    # 1. Add import
    src = add_import(src)

    # 2. Insert ChartPatternDefs after each BarChart/ComposedChart open
    src = insert_defs_after_chart_open(src)

    # 3. Process Bars per chart block — find each chart block and replace Bars
    out_parts = []
    cursor = 0
    tags = list(find_chart_open_tags(src))
    for start, end, name in tags:
        if start < cursor:
            continue  # nested/already-handled
        close_tag = f'</{name}>'
        close_idx = src.find(close_tag, end)
        if close_idx < 0:
            continue
        block_end = close_idx + len(close_tag)
        out_parts.append(src[cursor:end])
        block = src[end:block_end]
        out_parts.append(process_chart_block(block))
        cursor = block_end
    out_parts.append(src[cursor:])
    src = ''.join(out_parts)

    if src == original:
        return False
    if not dry_run:
        path.write_text(src, encoding='utf-8')
    return True


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    args = [a for a in args if a != '--dry-run']
    if args:
        paths = [Path(a) for a in args]
    else:
        paths = list(Path('components').glob('*.tsx'))
    changed = []
    for p in sorted(paths):
        if process_file(p, dry_run=dry_run):
            changed.append(p)
    print(f'{"Would modify" if dry_run else "Modified"} {len(changed)} file(s):')
    for p in changed:
        print(f'  {p}')


if __name__ == '__main__':
    main()
