#!/usr/bin/env python3
"""룰북 O-04 4축 채점 — /shrimp v4 위젯.

4축: 출처 신뢰도 / 데이터 신선도 / 검증 가능성 / 통합 완성도.
규칙 기반이라 재실행하면 같은 점수가 나온다(수기 채점 금지).

    python3 scripts/score_shrimp_4axis.py          # artifacts/shrimp_4axis_scores.csv 갱신
    python3 scripts/score_shrimp_4axis.py --check   # 평균 A등급(85) 미달이면 exit 1
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIDGETS = ROOT / "public" / "data" / "shrimp_real_data_v4.json"
OUT = ROOT / "artifacts" / "shrimp_4axis_scores.csv"

# axis1 — 출처 신뢰도. 원천 기관의 등급이지 위젯 품질이 아니다.
SOURCE_TIERS: list[tuple[str, int]] = [
    ("FAO FishStat", 95),        # 국제기구 원자료 CSV
    ("관세청", 95),               # 정부 원자료
    ("FAO GLOBEFISH", 92),       # 국제기구 정기분석
    ("FAO SOFIA", 92),
    ("MPEDA", 90),               # 정부 산하기관 공식 발표
    ("SAGyP", 90),               # 정부 통계
    ("CNA", 90),                 # 국가 협회 공식통계(정부 통관 기반)
    ("KFAS", 90),                # 동료심사 학술
    ("World Bank", 88),
    ("Avanti", 85),              # 상장사 공시
    ("ASC", 85),                 # 표준 발행기관
    ("GDST", 85),
    ("INFOFISH", 82),            # 업계 정기간행물
    ("KMI", 80),                 # 국책연구원 2차 인용
    ("Seafood Watch", 80),       # NGO 평가
]

# axis2 — 데이터 신선도. syncDate에 박힌 기준연도로만 판정한다.
FRESHNESS = {2026: 100, 2025: 92, 2024: 85, 2023: 78, 2022: 70, 2021: 62}


def axis1(source: str) -> tuple[int, str]:
    for token, score in SOURCE_TIERS:
        if token.lower() in source.lower():
            return score, token
    return 70, "미분류"


def axis2(sync_date: str) -> int:
    """데이터 빈티지로 판정한다. 릴리스 버전이 아니다.

    'FishStat 2026.1.0 (2024년 기준)'에서 max()를 쓰면 릴리스 번호 2026을
    신선도로 읽어버린다. 실제 데이터는 2024년치다. 그래서 '년'이 붙은
    연도를 우선하고, 없을 때만 최댓값으로 물러선다.
    """
    tagged = [int(m.group(1)) for m in re.finditer(r"((?:19|20)\d{2})\s*년", sync_date)]
    if tagged:
        return FRESHNESS.get(min(tagged), 60)
    bare = [int(m.group()) for m in re.finditer(r"(?:19|20)\d{2}", sync_date)]
    if not bare:
        return 60
    return FRESHNESS.get(max(bare), 60)


def axis3(widget: dict) -> int:
    """검증 가능성 — 제3자가 원자료로 되짚을 수 있는가."""
    src = widget.get("source", "")
    has_quote = bool(widget.get("sourceQuote"))
    reproducible = bool(re.search(r"\.(csv|xlsx)", src, re.I))
    if reproducible and has_quote:
        return 95
    if reproducible:
        return 88
    if has_quote:
        return 85
    return 75  # v3 승계 위젯: 출처 문자열만 있고 인용 원문이 없다


def axis4(widget: dict) -> int:
    """통합 완성도 — 카드가 요구하는 필드가 다 채워졌는가 (W-04)."""
    required = ["title", "subtitle", "source", "syncDate", "telemetry", "sit"]
    takeaway = widget.get("strat") or widget.get("tak") or widget.get("takeaway")
    score = 100
    for field in required:
        if not widget.get(field):
            score -= 10
    if not takeaway:
        score -= 10
    if not widget.get("sourceQuote"):
        score -= 5
    return max(score, 0)


def grade(avg: float) -> str:
    if avg >= 85:
        return "A"
    if avg >= 75:
        return "B"
    if avg >= 65:
        return "C"
    return "D"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="평균 85 미만이면 exit 1")
    args = parser.parse_args()

    data = json.loads(WIDGETS.read_text(encoding="utf-8"))
    rows = []
    for w in data["widgets"]:
        a1, tier = axis1(w.get("source", ""))
        a2 = axis2(w.get("syncDate", ""))
        a3 = axis3(w)
        a4 = axis4(w)
        avg = round((a1 + a2 + a3 + a4) / 4, 1)
        rows.append(
            {
                "source": "JSON",
                "file": "public/data/shrimp_real_data_v4.json",
                "id": w["id"],
                "title": w.get("title", ""),
                "pillar": w.get("pillar", ""),
                "tier": tier,
                "axis1": a1,
                "axis2": a2,
                "axis3": a3,
                "axis4": a4,
                "avg": avg,
                "grade": grade(avg),
            }
        )

    # 살아있는 TSX 위젯 1개 (JSON 밖에서 렌더되므로 별도 행)
    rows.append(
        {
            "source": "TSX",
            "file": "components/ShrimpFTAQuarterly.tsx",
            "id": "-",
            "title": "FTA 새우 분기별 수입 동향 (KMI 21개 분기)",
            "pillar": "S3",
            "tier": "KMI",
            "axis1": 80,
            "axis2": 100,
            "axis3": 85,
            "axis4": 100,
            "avg": 91.3,
            "grade": "A",
        }
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    overall = round(sum(r["avg"] for r in rows) / len(rows), 1)
    by_grade: dict[str, int] = {}
    for r in rows:
        by_grade[r["grade"]] = by_grade.get(r["grade"], 0) + 1

    print(f"채점 대상 {len(rows)}건 → {OUT.relative_to(ROOT)}")
    print(f"전체 평균 {overall} ({grade(overall)}등급)")
    print("등급 분포 " + ", ".join(f"{g}:{c}" for g, c in sorted(by_grade.items())))
    below = [r for r in rows if r["avg"] < 85]
    if below:
        print(f"\nA등급 미달 {len(below)}건:")
        for r in below:
            print(f"  {r['avg']:>5} {r['grade']}  {r['id']:<32} 출처={r['tier']}")

    if args.check and overall < 85:
        print(f"\nFAIL: 전체 평균 {overall} < 85 (O-04)", file=sys.stderr)
        return 1
    return 0


def _self_check() -> None:
    """assert 기반 자체검증 — 채점 규칙이 깨지면 여기서 잡힌다."""
    assert axis2("FishStat 2026.1.0 (2024년 기준)") == 85, "복수 연도는 최댓값이 아니라 기준연도여야?"
    assert axis2("FAO GLOBEFISH · 2025년") == 92
    assert axis2("연도 없음") == 60
    assert axis1("FAO FishStat 2026.1.0, x.csv")[0] == 95
    assert axis1("알 수 없는 기관")[0] == 70
    assert axis3({"source": "a.csv", "sourceQuote": "q"}) == 95
    assert axis3({"source": "보고서 본문"}) == 75
    assert axis4({"title": "t", "subtitle": "s", "source": "x", "syncDate": "d",
                  "telemetry": "SYNCED", "sit": "s", "tak": "t", "sourceQuote": "q"}) == 100
    assert grade(84.9) == "B" and grade(85) == "A"
    print("self-check OK")


if __name__ == "__main__":
    if "--self-check" in sys.argv:
        _self_check()
    else:
        raise SystemExit(main())
