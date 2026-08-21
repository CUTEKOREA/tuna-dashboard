#!/usr/bin/env python3
"""표 칸의 한글이 글자 단위로 끊기지 않게 한다.

브라우저 기본값(`word-break: normal`)은 한글을 어느 글자에서든 끊는다. 라틴 문자는
단어 단위로 지키면서 한글만 그렇게 다루는 것이라, 좁은 칸에서 「가다랑/어」 「산지 자가
냉동창/고」 「② 지위 전/환」 처럼 낱말이 두 줄로 갈라진다. 표에서는 그 칸이 라벨이라
특히 눈에 띈다.

`word-break: keep-all` 이 한국어 조판의 기본값이다 — 띄어쓰기에서만 끊는다.
일곱 편 중 ITOCHU 만 이미 갖고 있었고 그래서 그 편 표만 멀쩡했다.

낱말을 안 끊으면 칸의 최소 폭이 커져 표가 넘칠 수 있다. 그래서 적용 전에 일곱 편
186개 표를 재 봤고, 넘친 표는 0개였다. 앞서 `.num` 주석의 nowrap 을 푼 덕이다.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

RULE = (
    "\n/* 브라우저 기본값은 한글을 글자 단위로 끊는다 — 좁은 칸에서 낱말이 갈라진다.\n"
    "   한국어 조판의 기본은 띄어쓰기에서만 끊는 것이다. */\n"
    "main th,main td{word-break:keep-all}\n"
)
MARK = "main th,main td{word-break:keep-all}"
# 편마다 `td{...}` 앞뒤 공백이 다르다. 표 관련 규칙 뒤에 끼운다.
ANCHOR = re.compile(r"(\btd\s*\{[^}]*padding[^}]*\})", re.S)


def patch(path: Path) -> str:
    raw = path.read_text(encoding="utf8")
    if MARK in raw:
        return "이미 적용됨"
    # ITOCHU 처럼 이미 td 에 keep-all 이 있으면 손대지 않는다
    for m in re.finditer(r"\btd\s*\{([^}]*)\}", raw):
        if "keep-all" in m.group(1):
            return "이미 td 에 keep-all 이 있다 — 손댈 필요 없음"
    m = ANCHOR.search(raw)
    if not m:
        return "td 규칙을 못 찾았다"
    path.write_text(raw[:m.end(1)] + RULE + raw[m.end(1):], encoding="utf8")
    return "적용"


def main() -> int:
    files = [Path(p) for p in sys.argv[1:]]
    if not files:
        print("사용: fix_table_keepall.py <보고서.html> …", file=sys.stderr)
        return 1
    done = 0
    for f in files:
        r = patch(f)
        done += r == "적용"
        print(f"{f.name:<16} {r}")
    print(f"합계 {done}편 적용")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
