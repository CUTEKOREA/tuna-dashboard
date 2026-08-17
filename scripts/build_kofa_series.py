#!/usr/bin/env python3
"""연보 전사 원자료(아카이브)에서 대시보드용 시리즈를 만든다 — 수출·경영체·월별생산·어가.

원자료: 아카이브 `연보전사_2026-08-17/kofa_transcribe_raw.json`
(스캔 직독 전사 — 전사 시점에 행합·열합·평균 재계산 검증을 거쳤고, 이 스크립트가
같은 검증을 코드로 다시 강제한다. 어긋나면 생성 실패).

사용법:
    python3 scripts/build_kofa_series.py
"""
from __future__ import annotations

import json
from pathlib import Path

RAW = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/tuna/00_참치_관련자료/06_한국_원양정책·제도"
    "/06_한국기관_정책리포트/연보전사_2026-08-17/kofa_transcribe_raw.json"
)
OUT = Path(__file__).resolve().parent.parent / "public/data/kofa_series_v1.json"


def main() -> None:
    if not RAW.exists():
        raise SystemExit(f"원자료를 찾을 수 없다: {RAW}\n아카이브 README 를 보라.")
    raw = json.loads(RAW.read_text(encoding="utf-8"))

    # ── 수출: 행합·열합 재검증 ──
    ex = raw["exports"]["tables"][0]
    ex_rows = []
    for row in ex["rows"]:
        name = row[0].split(" (")[0]
        vals = row[1:]
        total_v, total_a = vals[0], vals[1]
        parts_v = [v for v in vals[2::2] if v]
        parts_a = [v for v in vals[3::2] if v]
        if sum(parts_v) != total_v or sum(parts_a) != total_a:
            raise SystemExit(f"수출 행합 불일치: {name}")
        ex_rows.append({
            "회사": name, "물량": total_v, "금액천달러": total_a,
            "가공용참치": vals[4] or 0, "횟감용참치": vals[2] or 0,
            "그밖": total_v - (vals[4] or 0) - (vals[2] or 0),
        })
    tot = ex["totalsRow"]
    if sum(r["물량"] for r in ex_rows) != tot[1] or sum(r["금액천달러"] for r in ex_rows) != tot[2]:
        raise SystemExit("수출 열합이 연보 합계 행과 다르다")
    ex_rows.sort(key=lambda r: -r["물량"])

    # ── 경영체·부도 ──
    comp = raw["companies"]["tables"]
    comp_2024 = {"1~5척": 28, "6~9척": 4, "10~19척": 4, "20척이상": 2}
    donut = comp[1]
    if sum(v for v in donut["rows"][0][1:] if v) != 38:
        raise SystemExit("경영체 2024 합이 38이 아니다")
    bankrupt_10y = sum(row[-1] for row in comp[2]["rows"])

    # ── 월별 생산: 주요 어종만, 계 대 월합 검증 ──
    mo = raw["monthly"]["tables"][0]
    WANT = {"어류·가다랑어": "가다랑어", "어류·황다랑어": "황다랑어",
            "어류·눈다랑어": "눈다랑어", "연체동물·오징어류": "오징어류"}
    monthly_rows = []
    for row in mo["rows"]:
        key = str(row[0]).split(" (")[0]
        if key not in WANT:
            continue
        total, months = row[1], row[2:14]
        msum = sum(v for v in months if v)
        if abs(msum - total) > 3:  # 원문 반올림 오차 허용(전사 검증에서 확인된 범위)
            raise SystemExit(f"월별 계 불일치: {key} {msum:,} vs {total:,}")
        monthly_rows.append({
            "어종": WANT[key], "계": total,
            "월별": [v if v else 0 for v in months],
        })
    if len(monthly_rows) != len(WANT):
        raise SystemExit("월별 생산에서 주요 어종이 빠졌다")

    # ── 어가: 연승(눈다·황다)·선망(가다)·오징어(수역별) ──
    pr = raw["prices"]["tables"]
    longline = [
        {"연도": row[0], "눈다랑어": row[1], "황다랑어": row[2]}
        for row in pr[0]["rows"]
    ]
    seiner = [{"연도": row[0], "가다랑어": row[1]} for row in pr[1]["rows"]]
    squid_price = [
        {"연도": row[0], "남서대서양": row[1], "뉴질랜드": row[2], "페루": row[3]}
        for row in pr[3]["rows"]
    ]
    # 스팟 게이트 (전사 검증에서 확정된 값)
    ll_2024 = next(r for r in longline if r["연도"] == "2024")
    if ll_2024["눈다랑어"] != 6036 or ll_2024["황다랑어"] != 4847:
        raise SystemExit("연승 2024 어가가 전사 검증값과 다르다")
    if next(r for r in seiner if r["연도"] == "2024")["가다랑어"] != 1441:
        raise SystemExit("선망 2024 어가가 전사 검증값과 다르다")
    sq_2024 = next(r for r in squid_price if r["연도"] == "2024")
    if sq_2024["남서대서양"] != 6637:
        raise SystemExit("오징어 2024 어가가 전사 검증값과 다르다")

    payload = {
        "_meta": {
            "생성일": "2026-08-17",
            "출처": "원양산업 통계연보 p.16~17·106·142~143·156~166 (아카이브 전사본 재검증)",
            "등급": "A",
            "주의": (
                "수출은 2024년 회사별 물량(M/T)·금액(천달러). 어가의 참치선망은 연보가 "
                "Atuna CFR 가격을 인용한 것이라 이 페이지의 시세 차트와 같은 계열이다. "
                "경영체 장기 추이 그래프는 라벨이 없어 수치화하지 않았다 — 정성 서술만 쓴다."
            ),
            "갱신방법": "python3 scripts/build_kofa_series.py",
        },
        "수출회사별": {"rows": ex_rows, "합계": {"물량": tot[1], "금액천달러": tot[2]}},
        "경영체": {
            "기준": "2024년말",
            "보유척수별": comp_2024,
            "합계": 38,
            "부도10년": bankrupt_10y,
            "정성": "경영체 수는 1990년대 초 정점(연보 그래프상 약 160개대) 이후 장기 감소해 38개사다 — 그래프에 라벨이 없어 정점값은 근사로만 쓴다.",
        },
        "월별생산2024": monthly_rows,
        "어가": {
            "연승달러톤": longline,
            "선망달러톤": seiner,
            "오징어원kg": squid_price,
        },
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✅ {OUT}")
    print("   수출 상위:", " · ".join(f"{r['회사']} {r['물량']:,}t" for r in ex_rows[:3]))
    print(f"   연승 어가 2008→2024: 눈다 {longline[0]['눈다랑어']:,}→{ll_2024['눈다랑어']:,} · 선망 가다 {seiner[0]['가다랑어']:,}→1,441")
    print(f"   오징어 남서대서양 원/kg 2015→2024: {squid_price[0]['남서대서양']:,}→6,637")


if __name__ == "__main__":
    main()
