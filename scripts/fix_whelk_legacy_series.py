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
KCS_DIR = ARCHIVE / "KCS_품목별국가별/2026-08-17"


def kcs_gb_monthly(all_years: bool = False) -> dict[str, tuple[float, float]]:
    """관세청 HS 160559 영국(GB) 월별 수입 — {YYYY.MM: (수입 USD, 수입 kg)}.

    골뱅이 수입의 실체는 자숙 냉동육이라 0307 이 아니라 **1605.59(조제)** 로 들어온다.
    2024년 이 코드 전체 수입 $58.5M · 영국 $30.5M(52.1%) — 파이 위젯의 주장과 일치해
    코드 선택 자체가 교차 검증된다.
    """
    import re as _re

    acc: dict[str, tuple[float, float]] = {}
    names = (
        ("kcs_160559_2023.xml", "kcs_160559_2024.xml", "kcs_160559_2025.xml", "kcs_160559_2026.xml")
        if all_years
        else ("kcs_160559_2024.xml", "kcs_160559_2025.xml")
    )
    for name in names:
        path = KCS_DIR / name
        if not path.exists():
            raise SystemExit(f"원본을 찾을 수 없다: {path}\n아카이브 README 의 재수집 방법을 보라.")
        xml = path.read_text(encoding="utf-8")
        for item in _re.findall(r"<item>(.*?)</item>", xml, _re.S):
            def field(tag: str) -> str:
                found = _re.search(f"<{tag}>(.*?)</{tag}>", item)
                return found.group(1) if found else ""

            if field("year") == "총계" or field("statCd") != "GB":
                continue
            ym = field("year")
            dlr, wgt = acc.get(ym, (0.0, 0.0))
            acc[ym] = (dlr + float(field("impDlr") or 0), wgt + float(field("impWgt") or 0))
    return acc


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

    # ── 9·10. 월별 수입 두 계열 — 실측 한 점에 종형 곡선을 붙여 놨다 ──
    #
    # seasonalityData 는 8월(실측 $5.70M·435톤)만 맞고 나머지는 매끄러운 종형이다.
    # 11월은 실제 $0.53M·40톤인데 $1.8M·140톤으로 3.4배 부풀려져 있었다.
    # importSurgeData 는 대체로 실측에 가깝지만 25.02 가 $2.85M 로 적혀 있었다 —
    # 실제는 $1.86M 다. 「역대 최고치 경신」의 근거가 됐던 그 값이다.
    gb = kcs_gb_monthly()
    need = [f"2024.{m:02d}" for m in range(1, 13)] + ["2025.01", "2025.02"]
    absent = [ym for ym in need if ym not in gb]
    if absent:
        raise SystemExit(f"관세청 원본에 없는 달이 있다: {absent}")

    legacy["seasonalityData"] = [
        {
            "month": f"{m}월",
            "importUSD": round(gb[f"2024.{m:02d}"][0] / 1e6, 2),
            "volume": round(gb[f"2024.{m:02d}"][1] / 1e3),
        }
        for m in range(1, 13)
    ]
    legacy["importSurgeData"] = [
        {
            "month": ym[2:4] + "." + ym[5:7],
            "volume": round(gb[ym][1] / 1e3),
            "value": round(gb[ym][0] / 1e6, 2),
        }
        for ym in ["2024.01", "2024.02", "2024.07", "2024.08", "2024.12", "2025.01", "2025.02"]
    ]

    # ── 11. 환율×단가 계열 — 양쪽 다 합성이었다 ──
    #
    # 조작본은 단가를 11.82→13.85 로 단조 상승하는 계단으로, 환율을 25Q3·Q4 를 통째로
    # 건너뛴 채 매끈하게 그렸다. 실측 영국산 단가는 25Q1(12.85)과 25Q4(14.49)에 하락이
    # 있고, 환율은 25Q1 에 1,449.5 로 튀었다가 25Q2 에 1,397.1 로 내려온다.
    # 단가는 아카이브 관세청 XML에서 계산하고, 환율은 아래 상수를 쓴다.
    #
    # 환율 출처: 일별 시장환율 종가의 분기 산술평균 (2026-08-17 수집, ECB 크로스와
    # ±3원 이내 교차 일치). 매매기준율 분기평균 공식표가 아닌 근사치다.
    FX_QUARTERLY = {
        "23Q1": 1274.9, "23Q2": 1314.8, "23Q3": 1312.7, "23Q4": 1318.7,
        "24Q1": 1328.2, "24Q2": 1370.1, "24Q3": 1354.4, "24Q4": 1395.5,
        "25Q1": 1449.5, "25Q2": 1397.1, "25Q3": 1385.8, "25Q4": 1447.7,
        "26Q1": 1462.9, "26Q2": 1500.9,
        # 26Q3 는 미완결 분기(7월까지만 통관 집계) — 넣지 않는다
    }
    quarters: dict[str, list[float]] = {}
    for ym, (dlr, wgt) in kcs_gb_monthly(all_years=True).items():
        qk = ym[2:4] + "Q" + str((int(ym[5:7]) - 1) // 3 + 1)
        acc_q = quarters.setdefault(qk, [0.0, 0.0])
        acc_q[0] += dlr
        acc_q[1] += wgt
    fx_rows = []
    for qk, rate in FX_QUARTERLY.items():
        if qk not in quarters or quarters[qk][1] <= 0:
            raise SystemExit(f"관세청 원본에 {qk} 분기가 없다 — 아카이브를 확인하라.")
        fx_rows.append({
            "quarter": qk,
            "avgUnitPrice": round(quarters[qk][0] / quarters[qk][1], 2),
            "usdkrw": rate,
        })
    legacy["fxCorrelationData"] = fx_rows

    # ── 12. 영양 벤치마크 — 다섯 항목 전부 성분표와 불일치했다 ──
    #
    # 출처가 「KFDA 2024 식품성분표」로 적혀 있었지만 국가표준식품성분표 제10개정판
    # (DB 10.4, 2026)의 어느 항목과도 맞지 않았다(미국 USDA 계열 값으로 추정).
    # 성분표에 「골뱅이 자숙」 항목은 없다 — 등재명은 「우렁이, 큰구슬우렁이(골뱅이)」이고
    # 소비 형태에 맞는 통조림 고형물 값을 쓴다. 100g당 단백질g/지방g/kcal/철mg.
    legacy["nutritionBenchmarkData"] = [
        {"item": "골뱅이캔", "protein": 19.33, "fat": 0.83, "calories": 109, "iron": 0.95},
        {"item": "닭가슴살", "protein": 22.97, "fat": 0.97, "calories": 106, "iron": 0.28},
        {"item": "참치캔", "protein": 23.0, "fat": 10.63, "calories": 197, "iron": 1.14},
        {"item": "삶은새우", "protein": 28.2, "fat": 0.5, "calories": 116, "iron": 1.0},
        {"item": "소등심", "protein": 15.61, "fat": 26.3, "calories": 313, "iron": 2.24},
    ]

    # ── 13. PFAS — 기준도 값도 서사도 전부 원문에 없었다 ──
    #
    # 「기준 1.0 ng/g」은 어떤 규정에도 없다. 실제 EU Reg 2023/915 는 PFOS 기준
    # 갑각류·이매패류 3.0, 어육 2.0 이고 **복족류(골뱅이)는 카테고리 자체가 없다**.
    # 인용된 군산연안 연구(한국수산과학회지 55(5), 2022)에는 골뱅이·담치·굴 시료가
    # 아예 없고, 이매패류는 초과는커녕 전 분류군 최저(ΣPFSA 0.03 ng/g)였다.
    # 논문의 실제 분류군별 값으로 바꾼다.
    legacy["pfasRiskData"] = [
        {"species": "갑각류", "pfsa": 0.63, "note": "꽃게 등"},
        {"species": "어류", "pfsa": 0.61, "note": "조피볼락 등"},
        {"species": "두족류", "pfsa": 0.30, "note": "주꾸미 등"},
        {"species": "이매패류", "pfsa": 0.03, "note": "전 분류군 최저"},
    ]

    legacy["_정정"] = {
        "일자": "2026-08-17",
        "출처": "FAO FishStat 2026.1.0 파생 CSV + 국가통계포털 어업생산동향조사 + 관세청 품목별 국가별 수출입실적(HS 160559)",
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
            "월별 계절성 계열을 관세청 실측으로 바꿨다. 8월 한 점만 실측이고 나머지는 "
            "매끄러운 종형이었다 — 11월은 실제 $0.53M·40톤인데 $1.8M·140톤으로 부풀려져 있었다. "
            "5~8월 물량이 연간의 절반을 넘는다는 진단 자체는 실측으로도 참(51.9%)이다.",
            "수입 급증 계열의 2025년 2월 값을 고쳤다 — $2.85M·170톤이 아니라 $1.86M·146톤이다. "
            "전년 동기 대비 물량 +72%, 1~2월 누적 수입액 $2.0M → $4.05M(+102%). "
            "급증은 사실이지만 크기가 과장돼 있었다.",
            "환율×단가 계열을 실측으로 바꿨다. 단가는 단조 상승 계단(11.82→13.85)으로, "
            "환율은 25Q3·Q4 를 통째 건너뛴 채 그려져 있었다. 실측은 단가가 25Q1·25Q4 에 "
            "내려오고 환율이 25Q1 에 1,449.5 로 튀는, 훨씬 덜 매끈한 곡선이다.",
            "영양 벤치마크 다섯 항목이 전부 국가표준식품성분표 10판과 불일치해 성분표 "
            "실측값으로 바꿨다. 골뱅이는 「우렁이, 큰구슬우렁이(골뱅이)」 통조림 고형물 항목이다. "
            "「철분 3.2mg 슈퍼푸드」 서사는 성분표에 없다(실제 0.95mg — 닭가슴살의 3.4배인 것은 맞다).",
            "채널별 점유율(대형마트 62.3% 등)은 공표 통계가 존재하지 않음을 확인했다 — "
            "aT 소매 POS 는 골뱅이를 「수산물캔」에 합산하고 온라인·B2B 채널이 패널에 없다. "
            "62.3% 는 유동 브랜드 점유율 63% 보도의 와전으로 추정된다. 자체 추정임을 화면에 밝혔다.",
            "PFAS 계열을 전면 교체했다. 「기준 1.0」은 어느 규정에도 없고(실제 EU PFOS 3.0/2.0, "
            "복족류는 카테고리 공백), 인용 논문에 골뱅이·담치·굴 시료가 없으며, 이매패류는 "
            "초과가 아니라 전 분류군 최저(0.03 ng/g)였다. 논문의 실제 분류군별 값으로 바꿨다.",
        ],
        "범위밖": (
            "수율차익·브랜드 포지셔닝·규제 레이더 등 나머지 계열은 아직 대조하지 않았다. "
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
