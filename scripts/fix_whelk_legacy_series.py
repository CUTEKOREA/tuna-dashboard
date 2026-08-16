#!/usr/bin/env python3
"""기존 골뱅이 대시보드(`components/WhelkDashboard.tsx`)의 조작된 계열을 검증된 값으로 바꾼다.

「시장 이해 > 골뱅이」 페이지를 만들면서 원본을 다시 집계했더니, 기존 대시보드가 쓰던
`public/data/whelk_real_data_v1.json` 의 세 계열이 원본과 맞지 않았다.
같은 화면에 서로 다른 숫자가 뜨는 상태라 방치할 수 없다.

바로잡는 것 넷:

1. **한국에 붙은 종명이 근거 없다.** 원본은 한국을 1970~2024년 전 연도 단일 코드
   GAS(고둥류 미분류)로 적는다. 종 단위 보고가 한 해도 없으므로 「B. opisoplectum」은
   붙일 수 없는 이름이다.

2. **세계 순위가 성립하지 않는다.** 다른 나라는 7개 종코드를 합산하고 한국은 미분류
   한 코드를 쓴 값을 나란히 세워 「한국 5위」라고 했다. 과(科)가 다른 종을 더한 값이라
   아카이브 원본 설명서가 직접 금지한 합산이다("Do not add groups together as
   'world whelk'"). 통조림 원료인 참골뱅이(Buccinum) 어획으로 좁혀 다시 세우면
   **한국은 0**이다 — 순위에 들지 못한다.

3. **2024년 한국 어획량이 틀렸다.** 8,750톤으로 적혀 있는데 원본은 9,669.783톤이다.

4. **추정치가 실측과 같은 선에 있다.** 「2026 (E)」는 근거가 적혀 있지 않은 채
   실측 계열 끝에 붙어 있어 실측으로 읽힌다. 뺀다.

바꾸지 않은 것: 캐나다·영국 시계열, 수입 점유율 등 나머지 계열. 이 스크립트의 범위는
위 네 가지로 한정한다. 나머지는 따로 대조해야 한다.

사용법:
    python3 scripts/fix_whelk_legacy_series.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEGACY = ROOT / "public/data/whelk_real_data_v1.json"
VERIFIED = ROOT / "public/data/whelk_industry_v1.json"


def main() -> None:
    legacy = json.loads(LEGACY.read_text(encoding="utf-8"))
    verified = json.loads(VERIFIED.read_text(encoding="utf-8"))

    # ── 1·2. 참골뱅이 어획 상위국 — 한국은 여기 없다 ──
    top = verified["참골뱅이상위국"]
    if not top or top[0]["국가"] != "영국":
        raise SystemExit("검증본의 참골뱅이 상위국이 예상과 다르다. 먼저 확인하라.")

    ranking = [
        {"name": row["국가"], "value": row["어획량"], "label": "B. undatum 등 Buccinum"}
        for row in top[:6]
    ]
    legacy["globalCaptureData"] = ranking
    legacy["koreaGlobalShareData"] = [
        {"name": row["name"], "value": row["value"]} for row in ranking
    ]

    # ── 3·4. 한국 어획 시계열 — 실측만, 국가통계포털 고둥류(130311) ──
    series = {row["연도"]: row["생산량"] for row in verified["한국생산"]["계열"]["고둥류"]}
    want = ["2010", "2014", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"]
    missing = [y for y in want if y not in series]
    if missing:
        raise SystemExit(f"국내 생산 계열에 없는 연도가 있다: {missing}")
    legacy["koreaCaptureData"] = [
        {"year": y, "capture": series[y]} for y in want
    ]

    legacy["_정정"] = {
        "일자": "2026-08-17",
        "출처": "FAO FishStat 2026.1.0 파생 CSV + 국가통계포털 어업생산동향조사",
        "갱신방법": "python3 scripts/fix_whelk_legacy_series.py",
        "내용": [
            "한국에 붙은 종명(B. opisoplectum)을 뺐다 — 한국은 종을 보고하지 않는다(전 연도 GAS).",
            "세계 순위를 참골뱅이(Buccinum) 어획으로 좁혔다. 이 기준에서 한국 어획은 0이라 순위에 없다.",
            "2024년 한국 어획을 8,750 → 9,670톤으로 고쳤다(원본 9,669.783).",
            "근거가 없는 「2026 (E)」 추정치를 뺐다. 실측 계열에 추정치를 섞지 않는다.",
        ],
        "범위밖": "캐나다·영국 시계열과 수입 점유율 등 나머지 계열은 이 스크립트가 손대지 않았다.",
    }

    LEGACY.write_text(
        json.dumps(legacy, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    print(f"✅ {LEGACY}")
    print("   참골뱅이 어획 상위: " + " · ".join(f"{r['name']} {r['value']:,}" for r in ranking[:4]))
    print("   한국은 참골뱅이 어획 0 — 이 순위에 들지 않는다")
    print(f"   한국 고둥류 어획 2024 {series['2024']:,} t · 2025 {series['2025']:,} t")


if __name__ == "__main__":
    main()
