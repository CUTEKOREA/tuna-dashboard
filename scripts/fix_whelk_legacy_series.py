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

ARCHIVE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/whelk/00_골뱅이_관련자료/11_분석·가공데이터"
)
FAO_CAPTURE = ARCHIVE / "FAO_FishStat/updates/2026-08-16/species_groups/capture_with_group.csv"


def fao_series(group: str, countries: dict[str, str], years: list[int]) -> dict:
    """FAO 파생 CSV 에서 (그룹·나라·연도) 어획량을 뽑는다."""
    import csv as _csv

    if not FAO_CAPTURE.exists():
        raise SystemExit(f"원본을 찾을 수 없다: {FAO_CAPTURE}")
    acc: dict[str, dict[int, float]] = {k: {} for k in countries}
    with open(FAO_CAPTURE, encoding="utf-8-sig") as handle:
        for row in _csv.DictReader(handle):
            if row.get("species_group") != group:
                continue
            name = row.get("COUNTRY.Name_En", "")
            key = next((k for k, v in countries.items() if v == name), None)
            if key is None:
                continue
            year = int(row["PERIOD"])
            if year in years:
                acc[key][year] = acc[key].get(year, 0.0) + float(row["VALUE"])
    return acc


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

    # ── 5. 캐나다·영국 시계열 — **두 개 과(科)를 한 선으로 이어 놨다** ──
    #
    # 원래 위젯은 캐나다를 2008년 7,219 → 2022년 1,847 로 그리며 「-74% 붕괴」라 했다.
    # 그런데 FAO 원본을 보면 **2008·2013 값은 미국고둥류(busycon, 물레고둥붙이과)** 이고
    # 2016년부터는 **참골뱅이(buccinum, 물레고둥과)** 다. 캐나다의 보고 코드가 바뀐 것이지
    # 같은 생물이 줄어든 것이 아니다. 과(科)가 다른 두 계열을 이어 붙인 셈이라
    # 한국의 130303 골뱅이 / 130311 고둥류 단절과 똑같은 오류다.
    #
    # 참골뱅이만 남기면 캐나다는 2018년 2,484 → 2022년 1,847 → **2024년 5,410 으로 되올라온다.**
    # 기후로 무너졌다는 서사와 최신 실측이 어긋난다.
    cauk_years = [2016, 2018, 2020, 2022, 2024]
    cauk = fao_series(
        "buccinum",
        {
            "canada": "Canada",
            "uk": "United Kingdom of Great Britain and Northern Ireland",
        },
        cauk_years,
    )
    legacy["canadaCaptureData"] = [
        {
            "year": str(y),
            "canada": round(cauk["canada"].get(y, 0)),
            "uk": round(cauk["uk"].get(y, 0)),
        }
        for y in cauk_years
        if cauk["canada"].get(y) or cauk["uk"].get(y)
    ]

    # ── 6. 흑해 피뿔고둥 — 세 나라 모두 실제보다 훨씬 작게 적혀 있었다 ──
    # 2018년 기준 튀르키예 4,200(실제 9,672) · 불가리아 1,800(3,515) · 루마니아 950(7,330).
    # 루마니아는 실제의 8분의 1이다. 게다가 **우크라이나가 2022년부터 0** 인 사실이 빠져 있다 —
    # 흑해 공급 구조에서 가장 큰 사건인데 화면에 없었다.
    bs_years = list(range(2018, 2025))
    bs = fao_series(
        "rapana",
        {
            "turkey": "Türkiye",
            "bulgaria": "Bulgaria",
            "romania": "Romania",
            "ukraine": "Ukraine",
            "russia": "Russian Federation",
        },
        bs_years,
    )
    legacy["blackSeaSupplyData"] = [
        {
            "year": str(y),
            "turkey": round(bs["turkey"].get(y, 0)),
            "bulgaria": round(bs["bulgaria"].get(y, 0)),
            "romania": round(bs["romania"].get(y, 0)),
            "ukraine": round(bs["ukraine"].get(y, 0)),
            "russia": round(bs["russia"].get(y, 0)),
        }
        for y in bs_years
    ]

    # ── 7. 기후 리스크 계열 — 없는 추세를 만들어 냈다 ──
    #
    # 위젯은 영국을 12,800~14,100 으로 평평하게, 캐나다를 7,500 → 2,100 으로 매끄럽게
    # 줄어드는 것으로 그렸다. 실측은 둘 다 그렇지 않다 —
    # 영국은 2005년 11,463 에서 2020년 21,280 까지 올랐다가 2024년 16,511 로 내려왔고,
    # 캐나다는 오르내린다. **매끄러운 감소선은 자료에 없다.**
    #
    # 해수면 온도(SST) 계열은 뺀다. 10.2 → 13.8 을 0.6도씩 균등하게 올린 값이라
    # 실측일 수 없고, 출처로 적힌 기구는 이런 형태의 시계열을 내지 않는다.
    # 2025E·2030E·2035E 추정치도 뺀다 — 근거가 적혀 있지 않다.
    #
    # 캐나다는 과(科)가 바뀌므로 한 선으로 잇지 않고 **두 계열로 나눠** 내보낸다.
    climate_years = [2005, 2010, 2015, 2020, 2024]
    uk = fao_series(
        "buccinum",
        {"uk": "United Kingdom of Great Britain and Northern Ireland"},
        climate_years,
    )["uk"]
    ca_bucc = fao_series("buccinum", {"ca": "Canada"}, climate_years)["ca"]
    ca_busy = fao_series("busycon", {"ca": "Canada"}, climate_years)["ca"]
    legacy["climateRiskData"] = [
        {
            "year": str(y),
            "ukCatch": round(uk.get(y, 0)),
            # 두 과를 따로 낸다. 한쪽이 비는 해는 선이 끊긴다 — 그것이 사실이다.
            "canadaBusycon": round(ca_busy[y]) if y in ca_busy else None,
            "canadaBuccinum": round(ca_bucc[y]) if y in ca_bucc else None,
        }
        for y in climate_years
    ]

    # ── 8. 최소보존규격 시나리오 — 기준선이 낡은 값이었다 ──
    # 2024년 기준선이 14,091 로 박혀 있는데 실제 영국 참골뱅이 어획은 16,511 이다.
    # 시나리오 자체는 가정이라 그대로 두되, **출발점은 실측이어야 한다.**
    uk2024 = round(uk.get(2024, 0))
    if uk2024:
        old_base = legacy["mcrsScenarioData"][0]["baseline"]
        scale = uk2024 / old_base if old_base else 1
        for row in legacy["mcrsScenarioData"]:
            for key in ("baseline", "mcrs50", "mcrs55", "mcrs60"):
                if key in row:
                    row[key] = round(row[key] * scale)

    legacy["_정정"] = {
        "일자": "2026-08-17",
        "출처": "FAO FishStat 2026.1.0 파생 CSV + 국가통계포털 어업생산동향조사",
        "갱신방법": "python3 scripts/fix_whelk_legacy_series.py",
        "내용": [
            "한국에 붙은 종명(B. opisoplectum)을 뺐다 — 한국은 종을 보고하지 않는다(전 연도 GAS).",
            "세계 순위를 참골뱅이(Buccinum) 어획으로 좁혔다. 이 기준에서 한국 어획은 0이라 순위에 없다.",
            "2024년 한국 어획을 8,750 → 9,670톤으로 고쳤다(원본 9,669.783).",
            "근거가 없는 「2026 (E)」 추정치를 뺐다. 실측 계열에 추정치를 섞지 않는다.",
            "캐나다·영국 시계열이 **두 개 과(科)를 한 선으로 잇고 있었다.** 캐나다의 2008·2013 값은 "
            "미국고둥류(busycon)이고 2016년부터가 참골뱅이(buccinum)다. 보고 코드가 바뀐 것을 "
            "「-74% 붕괴」로 읽은 것이다. 참골뱅이만 남기니 캐나다는 2022년 1,847에서 "
            "2024년 5,410으로 **되올라왔다** — 기후 붕괴 서사와 최신 실측이 어긋난다.",
            "흑해 피뿔고둥 세 나라를 전부 고쳤다 — 2018년 튀르키예 4,200 → 9,672, "
            "불가리아 1,800 → 3,515, 루마니아 950 → 7,330. 루마니아는 실제의 8분의 1이었다.",
            "흑해에 우크라이나·러시아를 추가했다. 우크라이나는 2019년 11,203톤에서 "
            "**2022년부터 0** 이다 — 이 수역 공급 구조에서 가장 큰 변화인데 빠져 있었다.",
            "기후 리스크 계열이 **없는 추세를 그리고 있었다.** 영국을 평평하게(실제는 11,463 → "
            "21,280 → 16,511), 캐나다를 매끄러운 감소로(실제는 오르내림) 그렸다. 실측으로 바꾸고 "
            "캐나다는 과(科)가 바뀌므로 두 계열로 나눴다.",
            "기후 계열의 해수면 온도(SST)를 뺐다. 0.6도씩 균등하게 오르는 값이라 실측일 수 없고 "
            "출처로 적힌 기구는 그런 시계열을 내지 않는다. 2025E·2030E·2035E 추정치도 뺐다.",
            "최소보존규격 시나리오의 기준선을 실측으로 옮겼다 — 2024년 14,091 → 16,511. "
            "시나리오는 가정이라 그대로 두되 출발점은 실측이어야 한다.",
        ],
        "범위밖": (
            "수입 점유율·수율차익·브랜드 포지셔닝·규제 레이더 등 나머지 계열은 아직 대조하지 않았다. "
            "그중 상당수는 실측이 아니라 **모델·점수**다(레이더 축 점수, 시나리오, 시장 전망). "
            "그런 계열은 수치를 고치는 문제가 아니라 「모델임을 화면에 밝혔는가」의 문제다."
        ),
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
