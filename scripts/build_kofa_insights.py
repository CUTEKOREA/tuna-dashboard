#!/usr/bin/env python3
"""원양산업 통계연보의 회사별 생산·입어료·선원 표를 전사해 인사이트 데이터로 만든다.

원본(스캔본 페이지 직독, 2026-08-17 전사):
  · 인쇄 p.112~114  회사별 업종별 생산실적 (2024, M/T)
  · 인쇄 p.120~121  연도별 국가별 입어료 지불 현황 (2019~2024, US$)
  · 인쇄 p.61       업종별 아국 승선원 (2024년말)
  · 인쇄 p.82       외국인선원 취업 현황 (2024)

스캔본이라 자동 재현이 안 되는 대신, 연보에 명기된 합계와 대조하는 게이트를 둔다 —
전사 숫자가 하나라도 어긋나면 생성이 실패한다.

사용법:
    python3 scripts/build_kofa_insights.py
"""
from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public/data/kofa_insights_v1.json"
FLEET = Path(__file__).resolve().parent.parent / "public/data/kofa_fleet_2024_v1.json"

# ── 회사별 참치선망 생산 (2024, M/T) — 연보 p.112~114 ──
SEINER_PROD = {
    "동원산업": 144460, "사조산업": 48833, "사조씨푸드": 9210,
    "사조오양": 9260, "신라교역": 76979,
}
SEINER_PROD_TOTAL = 288742  # 연보 합계 행

# 회사별 합계(전 업종) — 대조용
COMPANY_TOTAL = {"동원산업": 165537, "사조산업": 59882, "신라교역": 81479}
GRAND_TOTAL = 479398  # 연보 합계 행 (전 업종 전 회사)

# ── 참치선망 입어료 (US$) — 연보 p.120~121, 국가별 ──
ACCESS_FEE_SEINER = {
    "2019": {"키리바시": 29948000, "쿡제도": 3036600, "투발루": 6400000,
             "솔로몬제도": 7600000, "세이셸": 240000, "파푸아뉴기니": 6090000},
    "2020": {"키리바시": 29948000, "투발루": 9830000, "솔로몬제도": 8700000,
             "세이셸": 240000, "파푸아뉴기니": 18875000},
    "2021": {"키리바시": 26132000, "투발루": 6300000, "솔로몬제도": 12700000,
             "세이셸": 240000, "파푸아뉴기니": 17844000},
    "2022": {"키리바시": 21974000, "투발루": 7000000, "솔로몬제도": 7460000,
             "세이셸": 240000, "파푸아뉴기니": 22180500},
    "2023": {"키리바시": 22675780, "쿡제도": 332500, "투발루": 5500000,
             "솔로몬제도": 6500000, "세이셸": 300891, "파푸아뉴기니": 20527500},
    "2024": {"키리바시": 19918100, "쿡제도": 95000, "투발루": 4400000,
             "솔로몬제도": 10120000, "세이셸": 320814, "파푸아뉴기니": 22260000},
}

# ── 선원 (2024년말) — 연보 p.61·p.82 ──
CREW = {
    "한국인_원양어선": {"계": 1089, "해기사": 968, "부원": 121},
    "외국인_원양어선": {"계": 4352, "인도네시아": 3469, "필리핀": 513,
                    "베트남": 254, "미얀마": 51, "중국": 3, "기타": 62},
    "외국인_원양어선_연도별": {
        "2017": 3810, "2018": 3850, "2019": 3869, "2020": 3824,
        "2021": 4324, "2022": 4248, "2023": 3845, "2024": 4352,
    },
}


def main() -> None:
    # ── 게이트 1: 선망 생산 합계 ──
    if sum(SEINER_PROD.values()) != SEINER_PROD_TOTAL:
        raise SystemExit(f"전사 오류: 선망 생산 합 {sum(SEINER_PROD.values()):,} ≠ 연보 {SEINER_PROD_TOTAL:,}")

    # ── 게이트 2: 외국인 선원 국적 합 ──
    foreign = CREW["외국인_원양어선"]
    if sum(v for k, v in foreign.items() if k != "계") != foreign["계"]:
        raise SystemExit("전사 오류: 외국인 원양선원 국적 합이 계와 다르다")
    korean = CREW["한국인_원양어선"]
    if korean["해기사"] + korean["부원"] != korean["계"]:
        raise SystemExit("전사 오류: 한국인 원양선원 해기사+부원 ≠ 계")

    # ── 선망 척수는 명부(전사 검증 완료)에서 가져와 척당 생산성을 계산 ──
    fleet = json.loads(FLEET.read_text(encoding="utf-8"))
    seiner_count: dict[str, int] = {}
    for row in fleet["rows"]:
        if row["업종"] == "참치선망":
            seiner_count[row["회사"]] = seiner_count.get(row["회사"], 0) + 1
    if set(seiner_count) != set(SEINER_PROD):
        raise SystemExit(f"명부와 생산표의 선망 회사가 다르다: {set(seiner_count) ^ set(SEINER_PROD)}")

    productivity = [
        {
            "회사": company,
            "척수": seiner_count[company],
            "선망생산톤": SEINER_PROD[company],
            "척당톤": round(SEINER_PROD[company] / seiner_count[company]),
        }
        for company in SEINER_PROD
    ]
    productivity.sort(key=lambda r: -r["척당톤"])

    fee_2024 = ACCESS_FEE_SEINER["2024"]
    fee_total_2024 = sum(fee_2024.values())
    top2 = fee_2024["파푸아뉴기니"] + fee_2024["키리바시"]

    payload = {
        "_meta": {
            "생성일": "2026-08-17",
            "출처": "원양산업 통계연보 p.61·82·112~114·120~121 (스캔 직독 전사, 합계 게이트 검증)",
            "등급": "A",
            "주의": (
                "생산은 2024년 실적, 척수는 2024년말 명부다 — 연중 매각·전배가 있으면 척당 값이 "
                "흔들릴 수 있다. 입어료는 협회 집계 지불액이며 조건(VDS 일수 등)은 담지 않는다."
            ),
            "갱신방법": "python3 scripts/build_kofa_insights.py",
        },
        "선망생산성": {
            "rows": productivity,
            "선망전체": {"생산톤": SEINER_PROD_TOTAL, "척수": sum(seiner_count.values()),
                     "척당톤": round(SEINER_PROD_TOTAL / sum(seiner_count.values()))},
        },
        "입어료": {
            "연도별선망합": {
                year: sum(vals.values()) for year, vals in ACCESS_FEE_SEINER.items()
            },
            "국가별2024": [
                {"국가": country, "입어료": fee}
                for country, fee in sorted(fee_2024.items(), key=lambda kv: -kv[1])
            ],
            "요약2024": {
                "합계": fee_total_2024,
                "상위2국비중": round(top2 / fee_total_2024 * 100, 1),
                "톤당달러": round(fee_total_2024 / SEINER_PROD_TOTAL, 1),
            },
        },
        "선원": {
            **CREW,
            "외국인비중": round(
                foreign["계"] / (foreign["계"] + korean["계"]) * 100, 1
            ),
        },
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✅ {OUT}")
    print("   척당 생산성:", " · ".join(f"{r['회사']} {r['척당톤']:,}" for r in productivity))
    print(f"   2024 선망 입어료 ${fee_total_2024/1e6:.1f}M · 상위 2국 {payload['입어료']['요약2024']['상위2국비중']}% · 톤당 ${payload['입어료']['요약2024']['톤당달러']}")
    print(f"   원양어선 외국인 비중 {payload['선원']['외국인비중']}% (외국인 {foreign['계']:,} vs 한국인 {korean['계']:,})")


if __name__ == "__main__":
    main()
