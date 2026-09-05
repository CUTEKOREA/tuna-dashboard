#!/usr/bin/env python3
"""보고서에 넣을 SVG 차트를 만든다.

**왜 SVG 인가.** 래스터는 인쇄에서 뭉개지고 다크 모드에서 흰 사각형이 남는다.
색은 클래스로 받아 보고서 팔레트를 따르고, 그 클래스 규칙을 함께 낸다 —
대시보드로 옮길 때 규칙이 같이 가야 선이 보인다(`report_figures.py` 가 그것을 뽑는다).

가로 막대만 지원한다. 편마다 다른 축을 그리는 것보다, **같은 문법으로 아홉 편을 읽는 것**이
독자에게 낫다. 로그 눈금은 배수가 10배를 넘을 때만 쓴다.
"""
from __future__ import annotations

import html as H
import math

CSS = (
    ".rc-g{stroke:var(--rule);stroke-width:.6}"
    ".rc-a{stroke:var(--rule-2);stroke-width:.8}"
    ".rc-l{fill:var(--ink-3);font-family:var(--mono);font-size:8px;letter-spacing:.04em}"
    ".rc-v{fill:var(--ink);font-family:var(--mono);font-size:8.5px;font-weight:600}"
    # 색은 편마다 다르다. 아홉 편이 `--accent`/`--hot` 을 갖고 있지 않고 각자
    # `--teal`·`--steel`·`--adri` 처럼 다른 이름을 쓴다 — 그래서 클래스는 일반명을
    # 참조하고, 그 값은 `<svg style="--rc-b:…">` 로 그림마다 실어 보낸다.
    ".rc-b{fill:var(--rc-b,#3a6ea5)}"
    ".rc-b.hot{fill:var(--rc-h,#b8860b)}"
    ".rc-b.mut{fill:var(--rule-2)}"
    ".rc-n{fill:var(--ink-2);font-family:var(--sans);font-size:8px}"
)


def _dec(vals: list[float]) -> int:
    """차트 하나 안에서 소수 자릿수를 통일한다.

    값마다 따로 정하면 같은 축에 28.6 옆에 3 이 서고(지역 차트),
    표의 44.80 이 그림에서 44.8 이 된다. 자릿수는 **계열 전체**가 정한다.
    """
    d = 0
    for v in vals:
        if v >= 1000 or v == int(v):
            continue
        d = max(d, 1 if round(v, 1) == round(v, 2) else 2)
    return d


def _num(v: float, euro: bool, dec: int = 0) -> str:
    t = f"{v:,.0f}" if v >= 1000 else f"{v:,.{dec}f}"
    return t.replace(",", ".") if euro else t


def bars(rows: list[tuple[str, float, str]], *, unit: str, note: str,
         width: int = 620, label_w: int = 150, log: bool | None = None,
         euro: bool = False, accent: str = "#3a6ea5", hot: str = "#b8860b") -> str:
    """rows = [(이름, 값, 'plain'|'hot'|'mut')]

    `euro` 는 천 단위 구분을 그 보고서의 표기로 맞춘다. 아홉 편 중 유럽식은
    Jealsa 하나뿐이고 나머지 여덟은 영미식이다 — 차트만 다른 표기로 그리면
    같은 쪽 표와 어긋난다.
    값 0 은 **0 으로 적고 최소 폭 막대로 그린다.** 눈에 보이라고 0.4 같은
    가짜 값을 넣으면 캡션이 그림을 반박하게 된다.
    """
    vals = [v for _, v, _ in rows if v > 0]
    lo, hi = min(vals), max(vals)
    if log is None:
        log = hi / lo >= 10
    T, B = 16, 30
    row_h = 26
    ph = row_h * len(rows)
    h = T + ph + B
    pw = width - label_w - 14

    if log:
        a, b = math.log10(lo * 0.85), math.log10(hi * 1.15)
        x = lambda v: label_w + (math.log10(max(v, lo * 0.85)) - a) / (b - a) * pw
        ticks = [t for t in (1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000,
                             10000, 50000, 100000) if lo * 0.85 <= t <= hi * 1.15]
    else:
        b = hi * 1.12
        x = lambda v: label_w + v / b * pw
        # 1·2·5 사다리 — 눈금이 3~6개 나오게. 10 하나만 찍히면 축이 아니라 장식이다.
        e = 10 ** math.floor(math.log10(b))
        cands = (e / 10, e / 5, e / 2, e, e * 2, e * 5)
        # 3~6개 구간을 먼저 보고 그 안에서 4개에 가까운 것을 고른다. 구간 밖만
        # 남으면 그때 전체에서 가장 가까운 것을 쓴다 — 조기 탈출로 짜면 어느
        # 후보도 못 맞출 때 눈금이 0개가 되고(ITOCHU), 구간을 안 보면 눈금이
        # 둘밖에 안 남는다(Bolton 사다리가 20·40 둘뿐이었다).
        good = [c for c in cands if 3 <= b / c <= 6]
        step = min(good or cands, key=lambda c: abs(b / c - 4))
        ticks = [t for t in (step * i for i in range(1, 24)) if t <= b]

    dec = _dec([v for _, v, _ in rows])
    out = [f'<svg viewBox="0 0 {width} {h}" role="img" aria-label="{H.escape(note)}"'
           f' style="--rc-b:{accent};--rc-h:{hot}">']
    for t in ticks:
        tx = x(t)
        lab = _num(t, euro) if t >= 1000 else f"{t:g}"
        out.append(f'<line class="rc-g" x1="{tx:.1f}" y1="{T}" x2="{tx:.1f}" y2="{T+ph}"/>')
        out.append(f'<text class="rc-l" x="{tx:.1f}" y="{T+ph+13}" text-anchor="middle">{lab}</text>')
    for i, (name, v, kind) in enumerate(rows):
        y = T + i * row_h + row_h / 2
        cls = "rc-b" + ("" if kind == "plain" else f" {kind}")
        w = max(x(v) - label_w, 1.5)
        out.append(f'<rect class="{cls}" x="{label_w}" y="{y-6:.1f}" width="{w:.1f}" height="12" rx="1"/>')
        out.append(f'<text class="rc-l" x="{label_w-6}" y="{y+3:.1f}" text-anchor="end">{H.escape(name)}</text>')
        shown = _num(v, euro, dec)
        out.append(f'<text class="rc-v" x="{label_w+w+5:.1f}" y="{y+3:.1f}">{shown}</text>')
    out.append(f'<text class="rc-n" x="{label_w}" y="{h-6}">{H.escape(unit)}{" · 가로축 로그 눈금" if log else ""}</text>')
    out.append("</svg>")
    return "".join(out)


def figure(svg: str, caption: str) -> str:
    return (f'<figure class="chart"><div class="fi">{svg}</div>\n'
            f'  <figcaption>{caption}</figcaption></figure>')
