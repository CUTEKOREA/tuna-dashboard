#!/usr/bin/env python3
"""전 모듈 CSS의 간격을 4px 그리드로 스냅한다 — 다크 스위스 규율 (2026-08-20).

GMTS 파일럿(components/gmts)에서 확정한 규율의 전 페이지 확대(L-07):
padding / margin / gap 계열 선언의 9~47px 홀수 리듬 값을 다음 4의 배수로
올림 스냅한다. 색·보더·라운드·폰트·치수(width/height)는 건드리지 않는다.

- 8px 이하: 칩·헤어라인 간격 — 제외 (의도된 밀도)
- 48px 이상: 드문 대형 여백 — 의도로 보고 제외
- 4의 배수: 이미 그리드 위 — 불변

사용법:
    python3 scripts/fix_swiss_spacing.py          # 적용
    python3 scripts/fix_swiss_spacing.py --check  # 위반만 세고 변경 없음
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROPS = re.compile(
    r"^(\s*)(padding|padding-top|padding-right|padding-bottom|padding-left|"
    r"gap|row-gap|column-gap|"
    r"margin|margin-top|margin-right|margin-bottom|margin-left)(\s*:\s*)([^;]+);",
    re.MULTILINE,
)
PX = re.compile(r"(?<![\w.])(\d+)px\b")


def snap(value: int) -> int:
    if value < 9 or value >= 48 or value % 4 == 0:
        return value
    return value + (4 - value % 4)


def transform(css: str) -> tuple[str, int]:
    changes = 0

    def fix_decl(match: re.Match[str]) -> str:
        nonlocal changes
        indent, prop, sep, value = match.groups()
        # calc()·var() 인자 안의 px 는 건드리지 않는다 — 괄호 밖 토큰만
        if "(" in value:
            return match.group(0)

        def fix_px(px_match: re.Match[str]) -> str:
            nonlocal changes
            old = int(px_match.group(1))
            new = snap(old)
            if new != old:
                changes += 1
            return f"{new}px"

        return f"{indent}{prop}{sep}{PX.sub(fix_px, value)};"

    return PROPS.sub(fix_decl, css), changes


def main() -> None:
    check_only = "--check" in sys.argv
    total = 0
    touched: list[str] = []
    for path in sorted(ROOT.glob("components/**/*.module.css")) + sorted(ROOT.glob("app/**/*.module.css")):
        css = path.read_text(encoding="utf-8")
        fixed, changes = transform(css)
        if changes:
            total += changes
            touched.append(f"{path.relative_to(ROOT)} ({changes})")
            if not check_only:
                path.write_text(fixed, encoding="utf-8")
    label = "위반" if check_only else "스냅"
    print(f"{label} {total}건 / 파일 {len(touched)}개")
    for line in touched:
        print(" ", line)
    if check_only and total:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
