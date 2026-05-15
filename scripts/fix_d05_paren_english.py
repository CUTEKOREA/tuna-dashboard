#!/usr/bin/env python3
"""
L-07 일괄 변환기 — D-05 위반(괄호 영문 잔존) 자동 제거 (V4.1)

대상 패턴 (사용자 노출 display 필드에 한해):
    name: '한글 (English)'   →  name: '한글'
    label: "수출 (Exports)"  →  label: "수출"

규칙:
- display 필드만 수정: label, name, title, tooltip, legend, cardDesc
- 괄호 안이 '순수 영문 단어'일 때만 제거
- 코드/번호 포함 시 (예: (P-506, J-630)) 절대 건드리지 않음
- 한글이 괄호 앞에 반드시 있어야 함 (영문만 있는 경우는 별도 작업)

사용법:
    python3 scripts/fix_d05_paren_english.py              # dry-run (변경 없음)
    python3 scripts/fix_d05_paren_english.py --apply      # 실제 적용
    python3 scripts/fix_d05_paren_english.py --apply --file components/X.tsx  # 단일 파일

종료 코드: 위반 발견 시 0(dry-run) 또는 적용 결과 코드
"""

import argparse
import re
import sys
from pathlib import Path

DISPLAY_FIELDS = ("label", "name", "title", "tooltip", "legend", "cardDesc")

# 매칭 패턴
#   <field> : '한글텍스트 (영문)' 또는 "..." 또는 `...`
#   캡처: 1=field, 2=따옴표, 3=괄호 앞 한글+공백, 4=괄호 안 영문, 5=나머지 (보통 빈 문자열)
FIELD_RE = re.compile(
    r"(?P<field>\b(?:" + "|".join(DISPLAY_FIELDS) + r")\b)"
    r"(?P<sep>\s*[:=]\s*\{?\s*)"
    r"(?P<quote>['\"`])"
    r"(?P<before>[^'\"`]*?[가-힣][^'\"`(]*?)"
    r"\s*\("
    r"(?P<paren>[A-Z][A-Za-z. /]*)"
    r"\)"
    r"(?P<after>[^'\"`]*)"
    r"(?P=quote)"
)


def transform_line(line: str):
    """라인 변환. (new_line, n_changes) 반환."""
    changes = 0

    def repl(m):
        nonlocal changes
        before = m.group("before").rstrip()
        after = m.group("after").rstrip()
        # 괄호 뒤에 추가 텍스트 있으면 보존
        new_content = before + after
        new_content = new_content.rstrip()
        changes += 1
        return (
            m.group("field") + m.group("sep") +
            m.group("quote") + new_content + m.group("quote")
        )

    new_line = FIELD_RE.sub(repl, line)
    return new_line, changes


def process_file(path: Path, apply: bool):
    """파일 처리. (file_changes, hits) 반환."""
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    new_lines = []
    hits = []
    file_changes = 0

    for lineno, line in enumerate(lines, 1):
        new_line, n = transform_line(line)
        if n > 0:
            hits.append((lineno, line.rstrip("\n"), new_line.rstrip("\n")))
            file_changes += n
        new_lines.append(new_line)

    if apply and file_changes > 0:
        path.write_text("".join(new_lines), encoding="utf-8")

    return file_changes, hits


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="실제 파일에 적용")
    ap.add_argument("--file", help="단일 파일만 처리")
    ap.add_argument("--root", default=str(Path(__file__).resolve().parent.parent))
    args = ap.parse_args()

    root = Path(args.root)
    if args.file:
        targets = [Path(args.file)]
    else:
        targets = list((root / "components").glob("*.tsx"))

    total_changes = 0
    file_count = 0
    print(f"{'APPLY' if args.apply else 'DRY-RUN'} mode")
    print(f"Targets: {len(targets)} file(s)")
    print("─" * 70)

    for path in targets:
        if not path.exists():
            continue
        n, hits = process_file(path, args.apply)
        if n > 0:
            file_count += 1
            total_changes += n
            rel = path.relative_to(root)
            print(f"\n{rel}  ({n} change{'s' if n > 1 else ''})")
            for lineno, old, new in hits:
                print(f"  L{lineno}:")
                print(f"    -  {old.strip()}")
                print(f"    +  {new.strip()}")

    print("\n" + "─" * 70)
    print(f"Files affected: {file_count}")
    print(f"Total changes:  {total_changes}")
    if args.apply:
        print("✅ Applied. Next steps:")
        print("   1) ./scripts/check_korean.sh  (verify D-05 count drops)")
        print("   2) npm run build               (L-03 verify)")
        print("   3) git diff                    (review)")
    else:
        print("Dry-run only. Re-run with --apply to write changes.")


if __name__ == "__main__":
    main()
