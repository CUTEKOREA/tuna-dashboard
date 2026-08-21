#!/usr/bin/env python3
"""조사보고서 표의 `.num` 칸에서 주석 줄만 접히게 한다.

`td.num, th.num` 에 `white-space:nowrap` 이 걸려 있다. 숫자를 중간에서 끊지 않으려는
규칙이고 그 자체는 맞다. 그런데 이 시리즈의 `.num` 칸은 숫자만 담지 않는다 —
값 아래에 기준·출처를 적은 주석 줄이 함께 들어간다. 그 줄까지 nowrap 에 붙들리면
칸이 문장 길이만큼 벌어지고 표가 컨테이너를 밀어낸다.

일곱 편에서 「거점·법인·생산 품목·규모·인력」 가공거점 표가 그렇게 넘쳤다.
Thai Union +93px · Frinsa +47px · Albacora +36px. 넘친 자리는 잘려 보이고, 밀린 만큼
왼쪽 거점 칸이 헤더 폭(48px)까지 눌려 한글이 글자마다 끊겼다 — 「사/뭇/사/콘」.

숫자와 등급 칩은 그대로 두고 주석 span 만 접는다. 한 줄이면 된다.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

RULE = (
    "\n/* .num 은 숫자를 안 끊으려고 nowrap 이다. 그런데 같은 칸에 붙는 주석 줄까지\n"
    "   붙들려 표가 컨테이너를 밀어냈다 — 숫자와 칩은 그대로 두고 주석만 접는다. */\n"
    "td.num span:not(.chip):not(.basis){white-space:normal;word-break:keep-all}\n"
)
MARK = "td.num span:not(.chip)"
# 편마다 선택자가 `td.num,th.num` 이기도 하고 `td.num` 단독이기도 하다. 둘 다 받는다.
ANCHOR = re.compile(r"(td\.num(?:\s*,\s*th\.num)?\s*\{[^}]*\})", re.S)


def patch(path: Path) -> str:
    raw = path.read_text(encoding="utf8")
    if MARK in raw:
        return "이미 적용됨"
    m = ANCHOR.search(raw)
    if not m:
        return "td.num,th.num 규칙을 못 찾았다"
    if "nowrap" not in m.group(1):
        return "그 규칙에 nowrap 이 없다 — 손댈 필요 없음"
    out = raw[:m.end(1)] + RULE + raw[m.end(1):]
    path.write_text(out, encoding="utf8")
    return "적용"


def main() -> int:
    files = [Path(p) for p in sys.argv[1:]]
    if not files:
        print("사용: fix_num_note_wrap.py <보고서.html> …", file=sys.stderr)
        return 1
    done = 0
    for f in files:
        r = patch(f)
        done += r == "적용"
        print(f"{f.name:<16} {r}")
    print(f"합계 {done}편 적용")
    return 0 if done else 1


if __name__ == "__main__":
    raise SystemExit(main())
