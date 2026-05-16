"""TunaInsightsDashboard.tsx 영문 잔존 28건 한글화 (Phase 1A).

L-07 규칙: 5개 위젯 이상 동일 패턴 변경은 일괄 스크립트로.
W-01·D-05 위반(사용자 노출 영문) 박멸.

실행:
    python scripts/fix_tuna_insights_en_to_ko.py
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "components" / "TunaInsightsDashboard.tsx"

# JSX text node 형태 (>영문<). 컨텍스트로 한정해 false positive 방지.
TEXT_MAPPING = {
    ">Current Spread (USD/t)<": ">현재 스프레드 ($/MT)<",
    ">Tariff advantage to EU<": ">EU 무관세 혜택<",
    ">Top Emerging Market<": ">최대 신흥 시장<",
    ">Nigeria<": ">나이지리아<",
    ">Atlantic Compensation Rate<": ">대서양 보전율<",
    ">During Pacific Shocks<": ">태평양 충격기<",
    ">Correlation (Tuna-Mackerel)<": ">상관계수 (참치-고등어)<",
    ">Strongly Negative (Hedgable)<": ">강한 음의 상관 (헷징 가능)<",
    ">Largest Discrepancy Margin<": ">최대 무역 격차<",
    ">Pacific Islands Route<": ">태평양 도서국 루트<",
    ">Aquaculture Premium<": ">양식 프리미엄<",
    ">vs Wild Catch (2024)<": ">자연산 대비 (2024)<",
    ">UAE (Dubai)<": ">아랍에미리트 (두바이)<",
    ">Current HHI Index<": ">현재 HHI 지수<",
    ">Projected Shift by 2035<": ">2035년 예상 변화<",
    ">Warm-Water Species Dominance<": ">온수성 어종 우세<",
    ">Fuel Cost Reduction<": ">연료비 절감<",
    ">vs 2018 Baseline<": ">2018년 대비<",
    ">Thai Export Impact<": ">태국 수출 충격<",
    ">Estimated Drop by 2026<": ">2026년 예상 하락<",
    ">Max Retail Premium<": ">최대 소매 프리미엄<",
    ">Dual Certified Products<": ">이중 인증 제품<",
    ">Alt-Protein Projection<": ">대체 단백질 전망<",
    ">Target by 2030 (7.8% CAGR)<": ">2030년 목표 (연 7.8% 성장)<",
    ">Upcycled PetCare Margin<": ">업사이클 펫푸드 마진<",
    ">vs 8.5% (Canned Tuna)<": ">통조림 참치 8.5% 대비<",
}

# prop= 형태 (예: name="CAGR Growth (%)")
PROP_MAPPING = {
    'name="CAGR Growth (%)"': 'name="연평균 성장률 (%)"',
    'name="Retail Price Index"': 'name="소매가 지수"',
}


def main() -> int:
    content = TARGET.read_text(encoding="utf-8")
    original = content

    hits: list[tuple[str, str]] = []

    for old, new in {**TEXT_MAPPING, **PROP_MAPPING}.items():
        count = content.count(old)
        if count == 0:
            print(f"  ⚠️  not found: {old!r}")
            continue
        if count > 1:
            print(f"  ⚠️  multiple ({count}): {old!r} — proceeding")
        content = content.replace(old, new)
        hits.append((old, new))

    if content == original:
        print("변경 없음.")
        return 1

    TARGET.write_text(content, encoding="utf-8")

    print(f"\n✅ {len(hits)}/{len(TEXT_MAPPING) + len(PROP_MAPPING)} 건 치환:")
    for old, new in hits:
        old_clean = old.strip("><")
        new_clean = new.strip("><")
        print(f"  · {old_clean!r}  →  {new_clean!r}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
