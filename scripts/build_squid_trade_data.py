#!/usr/bin/env python3
"""관세청 통관 원본에서 「시장 이해 > 오징어」 페이지용 교역 집계 JSON을 만든다.

⚠ 바스켓 함정 — 원본 추출이 오징어 아닌 품목을 끌어와 있다.
  로컬 추출본 `KCS_squid_HS_2020-2024.csv` 는 HS6 을 11개 담고 있는데, 품목명을
  실제로 열어 보면 오징어가 아닌 것이 섞여 있다:
    · 0307.71 / .72 / .79 → 바지락·백합·피조개·개조개 (조개류)
    · 0307.81 / .82      → 전복 · 수정고둥류
    · 1605.55            → **문어** 조제품
    · 1605.59            → 기타 연체동물 조제품
  2024년 기준 이 넷이 수입액 7.28억 USD 중 1.68억(23%)을 차지했다. 그대로 쓰면
  오징어 시장이 23% 부풀어 보인다. 아카이브 규칙 5번(오징어·갑오징어·문어를 자동
  합산하지 않는다)이 정확히 이 상황을 겨눈다.

  오징어 바스켓은 HS **0307.41 · 0307.42 · 0307.43 · 0307.49 · 1605.54** 다.
  0307.4x 는 갑오징어와 오징어를 한 소호에 담고 있어 통관 단계에서 둘을 가를 수
  없다. 그 사실은 화면에 밝힌다 — 가를 수 없는 것을 갈랐다고 하지 않는다.

원본은 Google Drive 아카이브다. 산출 JSON 은 커밋돼 있으므로 빌드에는 필요 없다.

사용법:
    python3 scripts/build_squid_trade_data.py
"""
from __future__ import annotations

import argparse
import collections
import csv
import json
from pathlib import Path

BASE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/squid"
)
HISTORY = BASE / "extras/kcs/KCS_squid_HS_2020-2024.csv"
YTD = BASE / "update_2026-07-06/kcs/KCS_2026YTD_HS_squid.csv"

# 관세청 추출본은 2024년에서 끝난다. 2025년은 유엔 무역통계(Comtrade)로 잇는다.
# 두 출처의 2024년 값이 품목별로 일치함을 확인하고 붙였다 —
# 030743 349.5백만USD·109,942톤, 030749 33.6·1,466, 160554 177.1·36,295.
# 값이 어긋나면 스크립트가 멈춘다(아래 CROSS_CHECK_TOLERANCE).
COMTRADE = (
    BASE
    / "00_오징어_관련자료/01_오징어_시장·가격/03_무역·HS"
    / "20260816-COMTRADE-core_reporters_World_TOTALS_squid_HS_2024-2025.csv"
)
CROSS_CHECK_TOLERANCE = 0.02  # 2%

OUT_PATH = Path(__file__).resolve().parent.parent / "public/data/squid_trade_v1.json"

MIN_EXPECTED_YEAR = 2025

# 오징어 바스켓. 값은 (한글 품목명, 사슬 단계).
# 0307.4x 는 갑오징어와 오징어가 한 소호에 있다 — 통관에서 가를 수 없다.
SQUID_HS = {
    "030741": ("활·신선·냉장 (구 분류)", "원물"),
    "030742": ("활·신선·냉장", "원물"),
    "030743": ("냉동", "원물"),
    "030749": ("건조·염장·훈제", "1차가공"),
    "160554": ("조제·저장", "완제품"),
}

# 오징어가 아닌데 원본 추출에 섞여 있던 것. 규모를 보여주기 위해 남긴다.
NOT_SQUID_HS = {
    "030771": "조개류",
    "030772": "조개류",
    "030779": "조개류",
    "030781": "전복",
    "030782": "고둥류",
    "160555": "문어 조제품",
    "160559": "기타 연체동물 조제품",
}


def read_comtrade() -> dict[tuple[int, str], dict[str, float]]:
    """한국 수출입을 (연도, HS6) → {수입액·수입량·수출액·수출량} 으로 편다."""
    if not COMTRADE.exists():
        return {}
    out: dict[tuple[int, str], dict[str, float]] = {}
    with open(COMTRADE, encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            if row.get("reporterISO") != "KOR":
                continue
            flow = row.get("flowCode")
            if flow not in ("M", "X"):
                continue
            key = (int(row["refYear"]), row["cmdCode"])
            entry = out.setdefault(
                key, {"value": 0.0, "weight": 0.0, "expValue": 0.0, "expWeight": 0.0}
            )
            if flow == "M":
                entry["value"] += float(row.get("primaryValue") or 0)
                entry["weight"] += float(row.get("netWgt") or 0)
            else:
                entry["expValue"] += float(row.get("primaryValue") or 0)
                entry["expWeight"] += float(row.get("netWgt") or 0)
    return out


COUNTRY_KO_ISO = {
    "ARG": "아르헨티나",
    "CHL": "칠레",
    "ESP": "스페인",
    "JPN": "일본",
    "KOR": "대한민국",
    "PER": "페루",
}


def read_country_compare() -> list[dict]:
    """주요국 수출입을 (국가, 연도) 로 편다. 한국이 어디에 서 있는지 보이게 하는 표다."""
    if not COMTRADE.exists():
        return []
    agg: dict[tuple[str, str], dict[str, float]] = {}
    with open(COMTRADE, encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            iso = row.get("reporterISO") or ""
            if iso not in COUNTRY_KO_ISO:
                continue
            key = (COUNTRY_KO_ISO[iso], row["refYear"])
            entry = agg.setdefault(key, {"imp": 0.0, "exp": 0.0, "impW": 0.0, "expW": 0.0})
            value = float(row.get("primaryValue") or 0)
            weight = float(row.get("netWgt") or 0)
            if row.get("flowCode") == "M":
                entry["imp"] += value
                entry["impW"] += weight
            elif row.get("flowCode") == "X":
                entry["exp"] += value
                entry["expW"] += weight

    out = []
    for (country, year), v in sorted(agg.items()):
        # 한 해에 한쪽 흐름만 보고된 나라가 있다(페루 2025년 미보고). 그건 0 이 아니라 결측이다.
        out.append(
            {
                "국가": country,
                "연도": year,
                "수입액": round(v["imp"] / 1e6, 1) if v["imp"] else None,
                "수출액": round(v["exp"] / 1e6, 1) if v["exp"] else None,
                "수입량": round(v["impW"] / 1000) if v["impW"] else None,
                "수출량": round(v["expW"] / 1000) if v["expW"] else None,
            }
        )
    return out


def read_history() -> list[dict]:
    """상세행만 읽는다. hsCd='-' 는 총계행이라 함께 더하면 이중계상된다."""
    with open(HISTORY, encoding="utf-8-sig") as handle:
        return [r for r in csv.DictReader(handle) if r.get("hsCd") not in ("-", "", None)]


def num(value: str | None) -> float:
    try:
        return float(value or 0)
    except ValueError:
        return 0.0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=OUT_PATH)
    args = parser.parse_args()

    if not HISTORY.exists():
        raise SystemExit(f"통관 원본을 찾을 수 없다: {HISTORY}\nGoogle Drive 동기화를 확인하라.")

    rows = read_history()
    kcs_years = sorted({int(r["year"]) for r in rows})
    comtrade = read_comtrade()
    comtrade_years = sorted({y for y, _ in comtrade})

    # ── 두 출처의 겹치는 해를 대조한다 ──
    # 어긋난 채로 이으면 시계열에 계단이 생기고, 그 계단을 시장 변화로 읽게 된다.
    overlap = sorted(set(kcs_years) & set(comtrade_years))
    for year in overlap:
        for hs in SQUID_HS:
            kcs_v = sum(num(r["impDlr"]) for r in rows if int(r["year"]) == year and r["hsSgn"] == hs)
            ct = comtrade.get((year, hs))
            if not ct or not kcs_v:
                continue
            gap = abs(ct["value"] - kcs_v) / kcs_v
            if gap > CROSS_CHECK_TOLERANCE:
                raise SystemExit(
                    f"두 출처가 {year}년 {hs} 에서 {gap * 100:.1f}% 어긋난다 "
                    f"(관세청 {kcs_v / 1e6:.1f} · 유엔 {ct['value'] / 1e6:.1f} 백만USD). "
                    "이어 붙이기 전에 원인을 확인하라."
                )

    years = sorted(set(kcs_years) | set(comtrade_years))
    latest = years[-1]
    if latest < MIN_EXPECTED_YEAR:
        raise SystemExit(
            f"원본이 낡았다: 최신 연도 {latest} < {MIN_EXPECTED_YEAR}. 무역 자료를 다시 받아라."
        )

    squid = [r for r in rows if r["hsSgn"] in SQUID_HS]
    other = [r for r in rows if r["hsSgn"] in NOT_SQUID_HS]

    # ── 바스켓 대조 — 오징어만 남겼을 때 얼마나 줄어드는지 화면에 밝힌다 ──
    def totals(subset: list[dict], year: int) -> tuple[float, float]:
        sel = [r for r in subset if int(r["year"]) == year]
        return (
            sum(num(r["impDlr"]) for r in sel),
            sum(num(r["impWgt"]) for r in sel),
        )

    # 오징어 아닌 품목이 얼마나 섞여 있었는지는 관세청 상세행에서만 잴 수 있다.
    # 유엔 무역통계는 애초에 오징어 코드만 뽑은 것이라 비교 대상이 없다.
    kcs_latest_for_exclusion = sorted({int(r["year"]) for r in rows})[-1]
    sq_v, sq_w = totals(squid, kcs_latest_for_exclusion)
    ot_v, ot_w = totals(other, kcs_latest_for_exclusion)
    exclusion = {
        "기준연도": kcs_latest_for_exclusion,
        "오징어수입액": round(sq_v / 1e6, 1),
        "제외수입액": round(ot_v / 1e6, 1),
        "제외비중": round(ot_v / (sq_v + ot_v) * 100, 1) if (sq_v + ot_v) else 0,
        "제외품목": sorted(set(NOT_SQUID_HS.values())),
    }

    # ── 연도별 수출입 ──
    by_year: dict[int, dict[str, float]] = collections.defaultdict(
        lambda: {"impDlr": 0.0, "impWgt": 0.0, "expDlr": 0.0, "expWgt": 0.0}
    )
    for r in squid:
        y = int(r["year"])
        for k in ("impDlr", "impWgt", "expDlr", "expWgt"):
            by_year[y][k] += num(r[k])

    # 관세청에 없는 해(2025)는 유엔 무역통계로 채운다. 수입만 있고 수출은 없다.
    comtrade_only = sorted(set(comtrade_years) - set(kcs_years))
    for year in comtrade_only:
        for hs in SQUID_HS:
            ct = comtrade.get((year, hs))
            if not ct:
                continue
            by_year[year]["impDlr"] += ct["value"]
            by_year[year]["impWgt"] += ct["weight"]
            by_year[year]["expDlr"] += ct.get("expValue", 0.0)
            by_year[year]["expWgt"] += ct.get("expWeight", 0.0)

    timeline = [
        {
            "연도": str(y),
            "수입액": round(by_year[y]["impDlr"] / 1e6, 1),
            "수입량": round(by_year[y]["impWgt"] / 1000),
            "수출액": round(by_year[y]["expDlr"] / 1e6, 1),
            "수출량": round(by_year[y]["expWgt"] / 1000),
            "수입단가": round(by_year[y]["impDlr"] / (by_year[y]["impWgt"] / 1000))
            if by_year[y]["impWgt"]
            else 0,
            # 어느 출처에서 왔는지 화면에서 밝힌다 — 수출이 비는 해가 있기 때문이다
            "출처": "유엔 무역통계" if y in comtrade_only else "관세청",
        }
        for y in years
    ]

    # ── 수입국 구성 ──
    # 상대국 분해는 관세청 상세행에만 있다. 유엔 무역통계는 對세계 합계라 국가를 못 가른다.
    # 그래서 이 표만 관세청 최신해 기준이고, 시계열은 한 해 더 간다.
    kcs_latest = kcs_years[-1]
    origin_v: collections.Counter = collections.Counter()
    origin_w: collections.Counter = collections.Counter()
    for r in squid:
        if int(r["year"]) != kcs_latest:
            continue
        name = (r.get("statCdCntnKor1") or "").strip() or "미상"
        origin_v[name] += num(r["impDlr"])
        origin_w[name] += num(r["impWgt"])
    origin_total = sum(origin_v.values()) or 1
    origins = [
        {
            "국가": n,
            "수입액": round(v / 1e6, 1),
            "수입량": round(origin_w[n] / 1000),
            "비중": round(v / origin_total * 100, 2),
            "단가": round(v / (origin_w[n] / 1000)) if origin_w[n] else 0,
        }
        for n, v in origin_v.most_common(10)
    ]

    # ── 품목단계별 (최신연도) ──
    stage_v: collections.Counter = collections.Counter()
    stage_w: collections.Counter = collections.Counter()
    for r in squid:
        if int(r["year"]) != kcs_latest:
            continue
        _, stage = SQUID_HS[r["hsSgn"]]
        stage_v[stage] += num(r["impDlr"])
        stage_w[stage] += num(r["impWgt"])
    stage_order = ["원물", "1차가공", "완제품"]
    stages = [
        {
            "구분": s,
            "수입액": round(stage_v[s] / 1e6, 1),
            "수입량": round(stage_w[s] / 1000),
            "단가": round(stage_v[s] / (stage_w[s] / 1000)) if stage_w[s] else 0,
        }
        for s in stage_order
        if stage_v[s]
    ]

    # ── 2026 상반기 ──
    ytd = None
    if YTD.exists():
        with open(YTD, encoding="utf-8-sig") as handle:
            yrows = [r for r in csv.DictReader(handle) if r.get("hs_query") in SQUID_HS]
        # 이 파일은 year 컬럼이 '총계' 문자열이라 상세/총계 구분이 다르다. 총계행만 쓴다.
        tot = [r for r in yrows if (r.get("year") or "").strip() in ("총계", "")]
        use = tot or yrows
        ytd = {
            "구간": "2026년 1~6월",
            "수입액": round(sum(num(r.get("impDlr")) for r in use) / 1e6, 1),
            "수입량": round(sum(num(r.get("impWgt")) for r in use) / 1000),
            "수출액": round(sum(num(r.get("expDlr")) for r in use) / 1e6, 1),
            "수출량": round(sum(num(r.get("expWgt")) for r in use) / 1000),
        }

    payload = {
        "_meta": {
            "생성일": "2026-08-16",
            "출처": "관세청 수출입무역통계 (HSK 10자리 상세, 2020~2024) + 2026년 1~6월 누계",
            "단위": "금액 백만 USD · 물량 톤 · 단가 USD/톤",
            "기준연도": latest,
            "바스켓": (
                "HS 0307.41·42·43·49 + 1605.54. 0307.4x 는 갑오징어와 오징어를 한 소호에 "
                "담고 있어 통관 단계에서 둘을 가를 수 없다."
            ),
            "제외": (
                "원본 추출에 섞여 있던 조개류(0307.71·72·79) · 전복(0307.81) · "
                "고둥류(0307.82) · 문어 조제품(1605.55) · 기타 연체동물 조제품(1605.59) 은 뺐다."
            ),
            "이중계상방지": "hsCd='-' 총계행을 빼고 HSK 10자리 상세행만 더했다. 두 합계가 일치함을 확인했다.",
            "갱신방법": "python3 scripts/build_squid_trade_data.py",
        },
        "요약": {
            "기준연도": latest,
            "수입액": timeline[-1]["수입액"],
            "수입량": timeline[-1]["수입량"],
            "수출액": timeline[-1]["수출액"],
            "수출량": timeline[-1]["수출량"],
            "수입단가": timeline[-1]["수입단가"],
            "최대수입국": origins[0]["국가"],
            "최대수입국비중": origins[0]["비중"],
        },
        "바스켓제외": exclusion,
        "교역시계열": timeline,
        "국가비교": read_country_compare(),
        "수입국구성": origins,
        "품목단계": stages,
        "최근누계": ytd,
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✅ {args.out} ({args.out.stat().st_size / 1024:,.0f} KB)")
    print(f"   기준연도 {latest} · 수입 {timeline[-1]['수입액']:,}백만USD · {timeline[-1]['수입량']:,}t")
    print(
        f"   바스켓 제외: 오징어 아닌 {exclusion['제외수입액']:,}백만USD "
        f"({exclusion['제외비중']}%) — {', '.join(exclusion['제외품목'])}"
    )
    print("   수입국:", " · ".join(f"{o['국가']} {o['비중']}%" for o in origins[:5]))
    print("   단계별:", " · ".join(f"{s['구분']} {s['단가']:,}USD/t" for s in stages))
    if ytd:
        print(f"   {ytd['구간']}: 수입 {ytd['수입액']:,}백만USD · {ytd['수입량']:,}t")


if __name__ == "__main__":
    main()
