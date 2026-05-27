#!/usr/bin/env python3
"""
L-07 일괄 변환 — TunaOperationalIntelWidgets.tsx + 기타 takeaway 파일
SIT/TAK 텍스트 끝의 영문 trailing meta-tag 제거.
패턴: ". (English Phrase)" → "."
이런 태그는 한글 문장이 이미 의미를 다 담고 있어 정보 가치 없음. L-01 위반.

또한 takeaway source/situation의 명백한 영문 잔존도 한글화.
"""

import re
import sys
from pathlib import Path

FILES = [
    Path(__file__).parent.parent / "components" / "TunaOperationalIntelWidgets.tsx",
]

# 명백한 영문 source/inline 표현 → 한글
INLINE_TRANSLATIONS = {
    # Super Freezer는 -60°C 초저온 냉동 시설 — 일반명사라 한글화
    "Super Freezer Premium Index": "초저온 프리미엄 지수",
    "Super Freezer 설비": "초저온 냉동 설비",
    "Super Freezer 투자": "초저온 냉동 투자",
    "BEP(Break-Even Point)": "손익분기점",
}


def main():
    total_tag_removed = 0
    total_inline_replaced = 0

    for file in FILES:
        text = file.read_text()
        original = text

        # 1. Trailing English meta-tag 제거: ". (English Phrase)" → "."
        # 패턴: ". " + "(" + 알파벳·공백·하이픈·앰퍼샌드 1개 이상 + ")" + 끝 또는 \"
        # 예: ". (Masterplan Required)\"" → ".\""
        # 예: ". (Concentrate Resources)\"" → ".\""
        tag_pattern = re.compile(r'\.\s*\(([A-Z][a-zA-Z &/\-]+)\)(?=")')
        tags = tag_pattern.findall(text)
        text = tag_pattern.sub('.', text)
        total_tag_removed += len(tags)
        if tags:
            print(f"[{file.name}] Trailing tag removed: {len(tags)} 건")
            for t in sorted(set(tags))[:10]:
                print(f"    - ({t})")
            if len(set(tags)) > 10:
                print(f"    ... 외 {len(set(tags))-10}종")

        # 2. Inline 영문 표현 한글화
        for eng, kor in INLINE_TRANSLATIONS.items():
            count = text.count(eng)
            if count > 0:
                text = text.replace(eng, kor)
                total_inline_replaced += count
                print(f"[{file.name}] '{eng}' → '{kor}': {count} 건")

        if text != original:
            file.write_text(text)
            print(f"  ✓ Wrote {file.name}")

    print(f"\n총 {total_tag_removed}개 trailing tag 제거, {total_inline_replaced}개 inline 치환")


if __name__ == "__main__":
    main()
