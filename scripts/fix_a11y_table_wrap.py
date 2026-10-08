#!/usr/bin/env python3
"""
품목 대시보드 공용 표 래퍼 키보드 접근 codemod (L-07 패턴, 2026-10-08 axe 감사).

`styles.dataTableWrap`(TunaIndustryDashboard.module.css)은 넓은 표를 자기 안에서 가로 스크롤한다.
스크롤 영역이 포커스를 못 받으면 키보드 사용자는 잘린 열을 볼 수 없다
(axe `scrollable-region-focusable`, WCAG 2.1.1). 같은 래퍼가 품목 대시보드 8곳에 복제돼 있어
한 번에 바꾼다: tabIndex=0 + role="region" + 한글 이름.

멱등: 이미 tabIndex 가 붙은 래퍼는 건너뛴다.

Usage: python3 scripts/fix_a11y_table_wrap.py [--dry-run]
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OLD = '<div className={styles.dataTableWrap}>'
NEW = '<div className={styles.dataTableWrap} tabIndex={0} role="region" aria-label="표 (가로 스크롤)">'


def main() -> int:
    dry = '--dry-run' in sys.argv
    changed = 0
    for path in sorted((ROOT / 'components').rglob('*.tsx')):
        src = path.read_text(encoding='utf-8')
        if OLD not in src:
            continue
        out = src.replace(OLD, NEW)
        changed += src.count(OLD)
        print(f'{path.relative_to(ROOT)}: {src.count(OLD)}')
        if not dry:
            path.write_text(out, encoding='utf-8')
    print(f'{"(dry-run) " if dry else ""}래퍼 {changed}곳')
    return 0


if __name__ == '__main__':
    sys.exit(main())
