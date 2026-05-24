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

CHART_OPEN = re.compile(r'<(BarChart|ComposedChart)([^>]*)>')
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
    appears on the next non-whitespace line within the JSX block."""
    result = []
    i = 0
    while i < len(src):
        m = CHART_OPEN.search(src, i)
        if not m:
            result.append(src[i:])
            break
        # append everything up to and including the chart open tag
        end = m.end()
        result.append(src[i:end])
        # Look at the next ~200 chars to decide whether ChartPatternDefs already present
        lookahead = src[end:end + 400]
        if not DEFS_NEXT.search(lookahead):
            # Insert defs on next line with matching indentation
            # find indentation of chart open line
            line_start = src.rfind('\n', 0, m.start()) + 1
            indent = ''
            for ch in src[line_start:m.start()]:
                if ch in ' \t':
                    indent += ch
                else:
                    break
            insert = f'\n{indent}  <ChartPatternDefs />'
            result.append(insert)
        i = end
    return ''.join(result)


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
    while cursor < len(src):
        m = CHART_OPEN.search(src, cursor)
        if not m:
            out_parts.append(src[cursor:])
            break
        chart_name = m.group(1)
        close_tag = f'</{chart_name}>'
        close_idx = src.find(close_tag, m.end())
        if close_idx < 0:
            out_parts.append(src[cursor:])
            break
        block_end = close_idx + len(close_tag)
        out_parts.append(src[cursor:m.end()])  # up to and including <Chart...>
        block = src[m.end():block_end]
        out_parts.append(process_chart_block(block))
        cursor = block_end
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
