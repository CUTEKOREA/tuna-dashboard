#!/usr/bin/env python3
"""배포 게이트가 「오늘의 수치」 위젯과 같은 기준으로 수치를 세는지 확인한다.

게이트가 위젯보다 느슨하면 화면은 빈 채로 파이프라인만 OK 를 찍는다 —
2026-09-29·10-01 회차가 「SIAL 파리 2026」 같은 연도 하나로 통과해 그렇게 나갔다.
"""
import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("syncdb", ROOT / "scripts" / "sync_daily_briefing.py")
sync = importlib.util.module_from_spec(spec)
sys.modules["syncdb"] = sync
spec.loader.exec_module(sync)

# 위젯 정본과 같은 판정이어야 하는 표본. False = 위젯이 못 뽑는 것.
CASES = [
    ("SIAL 파리 2026", False),                        # 연도만 — 옛 게이트는 열렸다
    ("중국산 급감 속 EU 날개다랑어 수입 감소", False),   # 숫자 없음
    ("채낚기선 20척 이탈", False),                      # 「척」은 위젯 단위 목록에 없다
    ("Cepesca, 연료비 86% 급증", True),
    ("방콕 가다랑어 가격 올해 53% 상승", True),
    ("EUR 30억 3,000만 수출", True),
    ("상반기 64,782 M/T", True),
    ("USD 2,500만 계약", True),
    ("대형 선망선 어획능력 3% 증가", True),
]


def main() -> int:
    pattern = sync.widget_number_token_pattern()
    bad = [(t, bool(pattern.search(t)), want) for t, want in CASES if bool(pattern.search(t)) != want]
    for title, want in CASES:
        hit = pattern.search(title)
        print(f"{'HIT ' + hit.group() if hit else '--':<12} {title}")
    if bad:
        for title, got, want in bad:
            print(f"FAIL {title!r}: got {got}, want {want}", file=sys.stderr)
        return 1
    print(f"OK sync_daily_briefing 게이트 — 위젯 정본과 {len(CASES)}케이스 일치")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
