#!/usr/bin/env python3
"""
차트 계열 색을 공통 SERIES(lib/chart-palette.ts)로 옮기는 codemod (L-07). 2026-09-11 팔레트 일원화 후속.

한 차트 블록(<LineChart|BarChart|ComposedChart|AreaChart|PieChart ...> … </…>) 안에서, 계열 요소
(<Line|Bar|Area|Scatter|Pie>)의 stroke/fill 과 dot 의 fill 에 쓰인 유채색(--w-* 토큰 또는 hex)을
**처음 나온 순서대로** SERIES[0], SERIES[1] … 로 바꾼다. 같은 색이 같은 블록에 다시 나오면 같은 칸을 쓴다.
SERIES 앞 칸부터 차례로 쓰는 것은 validate_palette.js 인접 검사를 통과하는 순서다.

건드리지 않는 것:
  - 무채색(--w-slate-*, --w-navy-*, --dsc-*, 회색 hex) — 축·격자·툴팁
  - 삼항식 안의 색(`cond ? 'red' : 'green'`) — 부호·경보 같은 상태색이라 팔레트 밖이다
  - 그런 상태색 Cell 을 자식으로 둔 막대 자신의 fill — 범례 색이라 상태색과 맞아야 한다
  - 블록 안 유채색이 8개를 넘는 차트 — 접거나 나눠 그려야 하므로 보고만 한다

Usage:
  python3 scripts/fix_chart_series.py --dry-run components/PorkWidgets.tsx ...   # diff 출력
  python3 scripts/fix_chart_series.py components/PorkWidgets.tsx ...             # 적용 (import 도 넣는다)
  python3 scripts/fix_chart_series.py --selftest
"""
import difflib
import re
import sys
from pathlib import Path

BLOCK = re.compile(r"<(LineChart|BarChart|ComposedChart|AreaChart|PieChart|ScatterChart)\b[\s\S]*?</\1>")
SERIES_EL = re.compile(r"<(Line|Bar|Area|Scatter|Pie)\b[^>]*?/?>")
# stroke="…" / fill="…" / fill: '…' (dot={{ fill: … }}) — 따옴표 안 값 하나
ATTR = re.compile(r"""(?P<k>\b(?:stroke|fill))(?P<sep>=|:\s*)(?P<q>['"])(?P<v>var\(--w-[a-z]+-\d{2,3}\)|#[0-9a-fA-F]{6})(?P=q)""")


def is_neutral(v: str) -> bool:
    if v.startswith("var("):
        return bool(re.match(r"var\(--w-(slate|navy)-", v))
    r, g, b = (int(v[i:i + 2], 16) for i in (1, 3, 5))
    return max(r, g, b) - min(r, g, b) < 24  # 채도 없는 회색·흰·검정


def in_ternary(text: str, pos: int) -> bool:
    """pos 가 `? … :` 삼항식 안인지 — 같은 { } 표현식 안에서 앞에 ? 가 있으면 상태색으로 본다."""
    start = text.rfind("{", 0, pos)
    return start != -1 and "?" in text[start:pos]


def convert_block(block: str):
    order: list = []
    skipped = []

    def sub_attr(m, el_text, el_start):
        v = m.group("v")
        if is_neutral(v) or in_ternary(el_text, m.start()):
            return m.group(0)
        if v not in order:
            order.append(v)
        idx = order.index(v)
        if idx >= 8:
            skipped.append(v)
            return m.group(0)
        if m.group("sep") == "=":
            return f"{m.group('k')}={{SERIES[{idx}]}}"
        return f"{m.group('k')}{m.group('sep')}SERIES[{idx}]"

    def sub_el(em):
        el = em.group(0)
        if not el.endswith("/>"):
            # 자식 Cell 이 삼항으로 상태색을 칠하면, 요소 fill 은 범례 색이라 그 상태색과 맞아야 한다 — 건드리지 않는다
            close = block.find(f"</{em.group(1)}>", em.end())
            if close != -1 and re.search(r"<Cell[^>]*\?", block[em.end():close]):
                return el
        return ATTR.sub(lambda m: sub_attr(m, el, em.start()), el)

    out = SERIES_EL.sub(sub_el, block)
    # dot={{ fill: '…' }} sits inside the <Line …> tag, handled above; Cell children are left alone (ternary/state)
    return out, len(order), skipped


def convert(src: str):
    total = 0
    notes = []

    def sub_block(bm):
        nonlocal total
        out, n, skipped = convert_block(bm.group(0))
        total += min(n, 8)
        if skipped:
            notes.append(f"9색 이상 — {len(set(skipped))}색은 그대로 둠")
        return out

    return BLOCK.sub(sub_block, src), total, notes


def ensure_import(src: str) -> str:
    m = re.search(r"import \{([^}]*)\} from '@/lib/chart-palette';", src)
    if m:
        names = sorted({x.strip() for x in m.group(1).split(",") if x.strip()} | {"SERIES"})
        return src.replace(m.group(0), "import { " + ", ".join(names) + " } from '@/lib/chart-palette';")
    code = re.search(r"^(const|function|export|type|interface)\b", src, re.M)
    imports = [i for i in re.finditer(r"^import [\s\S]*?;\n", src, re.M) if not code or i.start() < code.start()]
    pos = imports[-1].end()
    return src[:pos] + "import { SERIES } from '@/lib/chart-palette';\n" + src[pos:]


def selftest():
    src = """<LineChart><XAxis stroke="var(--w-slate-500)" />
<Line dataKey="a" stroke="var(--w-rose-500)" dot={{ r: 5, fill: 'var(--w-rose-500)' }} />
<Line dataKey="b" stroke="#22d3ee" />
<Bar dataKey="c" fill="var(--w-emerald-500)">{d.map((e, i) => <Cell key={i} fill={e.v < 0 ? 'var(--w-red-500)' : 'var(--w-emerald-500)'} />)}</Bar>
</LineChart>"""
    out, n, _ = convert(src)
    assert 'stroke="var(--w-slate-500)"' in out, out                      # 축은 그대로
    assert 'dataKey="a" stroke={SERIES[0]} dot={{ r: 5, fill: SERIES[0] }}' in out, out  # 같은 색은 같은 칸
    assert 'dataKey="b" stroke={SERIES[1]}' in out, out
    assert 'dataKey="c" fill="var(--w-emerald-500)"' in out, out           # 상태색 Cell 을 둔 막대는 범례색이라 그대로
    assert "e.v < 0 ? 'var(--w-red-500)' : 'var(--w-emerald-500)'" in out, out  # 삼항 상태색은 그대로
    assert n == 2, n
    out2, n2, _ = convert(out)
    assert out2 == out and n2 == 0, "멱등이어야 한다"
    print("selftest OK")


def main(argv):
    if "--selftest" in argv:
        selftest()
        return 0
    dry = "--dry-run" in argv
    files = [a for a in argv if not a.startswith("--")]
    if not files:
        print(__doc__)
        return 0
    for f in files:
        p = Path(f)
        src = p.read_text(encoding="utf-8")
        out, n, notes = convert(src)
        if n == 0:
            continue
        out = ensure_import(out)
        if dry:
            sys.stdout.writelines(difflib.unified_diff(src.splitlines(True), out.splitlines(True), f, f))
        else:
            p.write_text(out, encoding="utf-8")
        print(f"{n:3}개 계열 색 → SERIES: {f}" + (f"  ({'; '.join(notes)})" if notes else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
