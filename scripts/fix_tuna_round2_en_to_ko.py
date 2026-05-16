"""Phase 1A 2차 — 4개 파일 영문 잔존 13건 한글화.

대상:
- TunaDashboard.tsx (6건: ESTIMATE, No Data, Unsupported×2, Loading..., Connected)
- TunaLiveTicker.tsx (4건: LIVE INTELLIGENCE TICKER, Refresh, Live, Cached)
- TunaExtractDashboard.tsx (1건: HS Code)
- TunaNewInsightsB.tsx (2건: Avg. Tax Rate Impact, Tan Phat Foods)

L-07 일괄 변환 패턴. W-01·D-05 위반 박멸.
"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# (파일명, old, new) 형태. old는 파일에서 *그대로* 매칭되는 최소 컨텍스트.
REPLACEMENTS: list[tuple[str, str, str]] = [
    # TunaDashboard.tsx
    ("components/TunaDashboard.tsx", "    ESTIMATE\n", "    추정\n"),
    ("components/TunaDashboard.tsx", ">No Data<", ">데이터 없음<"),
    ("components/TunaDashboard.tsx", ">Unsupported<", ">미지원<"),
    ("components/TunaDashboard.tsx",
     ">Loading Strategic Intelligence...<", ">전략 인텔리전스 불러오는 중...<"),
    ("components/TunaDashboard.tsx", ">Connected<", ">연결됨<"),

    # TunaLiveTicker.tsx
    ("components/TunaLiveTicker.tsx",
     "            LIVE INTELLIGENCE TICKER\n", "            실시간 인텔리전스 티커\n"),
    ("components/TunaLiveTicker.tsx", "            Refresh\n", "            새로고침\n"),
    ("components/TunaLiveTicker.tsx", "/> Live\n", "/> 실시간\n"),
    ("components/TunaLiveTicker.tsx", "/> Cached\n", "/> 캐시됨\n"),

    # TunaExtractDashboard.tsx
    ("components/TunaExtractDashboard.tsx", ">HS Code<", ">HS 코드<"),

    # TunaNewInsightsB.tsx
    ("components/TunaNewInsightsB.tsx",
     ">Avg. Tax Rate Impact<", ">평균 관세 영향<"),
    ("components/TunaNewInsightsB.tsx", ">Tan Phat Foods<", ">탄팟 푸드<"),
]


def main() -> int:
    by_file: dict[str, list[tuple[str, str]]] = {}
    for path, old, new in REPLACEMENTS:
        by_file.setdefault(path, []).append((old, new))

    total_hits = 0
    total_expected = 0

    for rel, pairs in by_file.items():
        path = ROOT / rel
        content = path.read_text(encoding="utf-8")
        original = content
        file_hits = 0

        for old, new in pairs:
            count = content.count(old)
            total_expected += 1
            if count == 0:
                print(f"  ⚠️  {rel}: not found {old!r}")
                continue
            if count > 1:
                print(f"  · {rel}: {count}× {old!r}  (모두 치환)")
            content = content.replace(old, new)
            file_hits += count
            total_hits += count

        if content != original:
            path.write_text(content, encoding="utf-8")
            print(f"✓ {rel}: {file_hits}건 치환")
        else:
            print(f"– {rel}: 변경 없음")

    print(f"\n총 {total_hits}건 치환 ({total_expected}개 매핑 규칙 중)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
