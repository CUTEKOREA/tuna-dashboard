#!/usr/bin/env python3
"""조사보고서 HTML 의 산문 폭을 표 폭에 맞춘다.

보고서는 산문에 measure 상한(44rem 또는 37rem)을 걸어 뒀는데 표는 `main` 을 꽉 채운다.
그래서 같은 화면에서 글이 표보다 120~232px 좁게 끝났다. 상한을 풀면 산문이 `main` 을
채우므로 표와 좌우가 맞는다 — 컨테이너(`.wrap`·`main`·표지)는 건드리지 않는다.

CSS 를 정규식 한 방으로 고치면 미디어쿼리 안쪽까지 잘못 건드린다. 중괄호 깊이를 세는
스캐너로 **최상위 블록만** 훑고, 선택자가 대상 목록에 정확히 있을 때만 그 블록의
max-width 선언을 바꾼다. 바뀐 건수를 세어 기대와 다르면 실패시킨다.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

# 풀 대상 — 산문·본문 블록. 컨테이너와 표지는 여기 없다.
PROSE = {
    "p", ".lead", ".call", "blockquote", "footer p", "ul",
    ".alert", ".own", ".panel", ".pull", ".tl", "figcaption",
    "ul.t", "ol.src",
}

# 선택자 앞에 절 구분 주석(`/* ===== CALLOUT ===== */`)이 붙어 오는 자리가 있다.
# 떼지 않으면 `.call` 이 목록에 있어도 안 걸린다 — 실제로 다섯 편에서 빗나갔다.
_COMMENT = re.compile(r"/\*.*?\*/", re.S)


def top_level_blocks(css: str):
    """(선택자, 본문시작, 본문끝) — 최상위 규칙만. 미디어쿼리 안쪽은 건너뛴다."""
    i, n = 0, len(css)
    while i < n:
        if css.startswith("/*", i):
            j = css.find("*/", i + 2)
            i = n if j < 0 else j + 2
            continue
        j = css.find("{", i)
        if j < 0:
            return
        sel = css[i:j]
        # @media·@supports 같은 조건 블록은 통째로 건너뛴다
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == "{":
                depth += 1
            elif css[k] == "}":
                depth -= 1
            k += 1
        if "@" not in sel:
            yield " ".join(_COMMENT.sub(" ", sel).split()), j + 1, k - 1
        i = k


def widen(path: Path) -> tuple[int, list[str]]:
    raw = path.read_text(encoding="utf8")
    changed, notes = 0, []
    out = []
    last = 0
    for m in re.finditer(r"(<style[^>]*>)(.*?)(</style>)", raw, re.S):
        css = m.group(2)
        edits = []
        for sel, s, e in top_level_blocks(css):
            if sel not in PROSE:
                continue
            body = css[s:e]
            mw = re.search(r"max-width\s*:\s*([^;}]+)", body)
            if not mw or mw.group(1).strip() == "none":
                continue
            edits.append((s + mw.start(1), s + mw.end(1), sel, mw.group(1).strip()))
        if not edits:
            continue
        edits.sort()
        new_css, pos = [], 0
        for a, b, sel, old in edits:
            new_css.append(css[pos:a])
            new_css.append("none")
            pos = b
            notes.append(f"{sel}: {old} → none")
            changed += 1
        new_css.append(css[pos:])
        out.append(raw[last:m.start(2)])
        out.append("".join(new_css))
        last = m.end(2)
    if not changed:
        return 0, notes
    out.append(raw[last:])
    path.write_text("".join(out), encoding="utf8")
    return changed, notes


def main() -> int:
    files = [Path(p) for p in sys.argv[1:]]
    if not files:
        print("사용: widen_report_prose.py <보고서.html> …", file=sys.stderr)
        return 1
    total = 0
    for f in files:
        n, notes = widen(f)
        total += n
        print(f"{f.name:<16} {n}건  " + " · ".join(notes))
    if total == 0:
        print("바꾼 것이 없다 — 이미 풀렸거나 선택자가 달라졌다", file=sys.stderr)
        return 1
    print(f"합계 {total}건")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
