#!/usr/bin/env python3
"""Phase 1 — 위젯이 서로 모순되게 말하는 정의 3건을 아카이브 원본으로 실측한다.

  1. 노르웨이 수입 의존도  (현재: 52% / 67% / 73.9% / 80~90% 4가지 표기)
  2. 아프리카 수출 증가율  (현재: +167% 누적 / +63% YoY / +83.4% 혼재)
  3. 한국 고등어 자급률    (현재: 분모 정의 불명)

출력은 판단 재료다. 확정은 사람이 한다.
"""
import csv
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from scope import (AFRICA, COUNTRY, FAO_FILTERED, FLOW_EXPORT, FLOW_IMPORT, Q, V,
                   is_scomber_commodity, is_scomber_species)

KOREA = 410
NORWAY = 578


def load_partners():
    """(flow, reporter, partner, measure, period) -> value 합계."""
    agg = defaultdict(float)
    path = FAO_FILTERED / "mackerel_trade_partners.csv"
    with path.open(encoding="utf-8-sig") as fh:
        for r in csv.DictReader(fh):
            if not is_scomber_commodity(r["_commodity_name_en"]):
                continue
            key = (r["TRADE_FLOW.ALPHA_CODE"], int(r["COUNTRY_REPORTER.UN_CODE"]),
                   int(r["COUNTRY_PARTNER.UN_CODE"]), r["MEASURE"], int(r["PERIOD"]))
            agg[key] += float(r["VALUE"] or 0)
    return agg


def load_capture():
    """(country, period) -> 톤."""
    agg = defaultdict(float)
    path = FAO_FILTERED / "mackerel_capture.csv"
    with path.open(encoding="utf-8-sig") as fh:
        for r in csv.DictReader(fh):
            if not is_scomber_species(r["_species_name_en"]):
                continue
            agg[(int(r["COUNTRY.UN_CODE"]), int(r["PERIOD"]))] += float(r["VALUE"] or 0)
    return agg


def pct(a, b):
    return f"{100 * a / b:.1f}%" if b else "n/a"


def q1_norway_dependency(agg):
    print("\n" + "=" * 72)
    print("정의 1 — 노르웨이 수입 의존도")
    print("=" * 72)
    years = sorted({k[4] for k in agg if k[0] == FLOW_IMPORT and k[1] == KOREA})
    for measure, unit in ((Q, "톤"), (V, "천USD")):
        print(f"\n[{measure}] 한국 수입 파트너별 비중")
        print(f"{'연도':>6} {'전체':>12} {'노르웨이':>12} {'비중':>7}   상위5")
        for y in years:
            rows = {k[2]: v for k, v in agg.items()
                    if k[0] == FLOW_IMPORT and k[1] == KOREA and k[3] == measure and k[4] == y}
            total = sum(rows.values())
            nor = rows.get(NORWAY, 0)
            top = sorted(rows.items(), key=lambda kv: -kv[1])[:5]
            top_s = " ".join(f"{COUNTRY.get(c, c)}{pct(v, total)}" for c, v in top)
            print(f"{y:>6} {total:>12,.0f} {nor:>12,.0f} {pct(nor, total):>7}   {top_s}")
    print("\n  ※ 상위 3국만으로 분모를 잡으면 비중이 올라간다 — 현재 w14의 67%가 이 방식일 가능성.")
    print("  ※ 금액 기준과 물량 기준이 다르다. 어느 쪽을 쓸지 확정 필요.")


def q2_africa_growth(agg):
    print("\n" + "=" * 72)
    print("정의 2 — 아프리카 수출 증가율")
    print("=" * 72)
    years = sorted({k[4] for k in agg if k[0] == FLOW_EXPORT and k[1] == KOREA})
    series = {}
    for y in years:
        rows = {k[2]: v for k, v in agg.items()
                if k[0] == FLOW_EXPORT and k[1] == KOREA and k[3] == Q and k[4] == y}
        series[y] = {
            "africa": sum(v for c, v in rows.items() if c in AFRICA),
            "ghana": rows.get(288, 0),
            "nigeria": rows.get(566, 0),
            "total": sum(rows.values()),
        }
    print(f"\n[{Q}] 한국 수출 (톤)")
    print(f"{'연도':>6} {'전체수출':>12} {'아프리카':>12} {'비중':>7} {'가나':>10} {'나이지리아':>12} {'YoY':>8}")
    prev = None
    for y in years:
        s = series[y]
        yoy = f"{100 * (s['africa'] / prev - 1):+.1f}%" if prev else "-"
        print(f"{y:>6} {s['total']:>12,.0f} {s['africa']:>12,.0f} "
              f"{pct(s['africa'], s['total']):>7} {s['ghana']:>10,.0f} {s['nigeria']:>12,.0f} {yoy:>8}")
        prev = s["africa"] or None
    if len(years) >= 2:
        a, b = series[years[0]]["africa"], series[years[-1]]["africa"]
        n = years[-1] - years[0]
        print(f"\n  누적 {years[0]}→{years[-1]}: {100 * (b / a - 1):+.1f}%  "
              f"(CAGR {100 * ((b / a) ** (1 / n) - 1):+.1f}%/년)" if a else "\n  기준연도 0")
    print("  ※ 현재 위젯 부제의 '+167%'는 이 표 어느 값과도 맞춰봐야 한다.")


def q3_self_sufficiency(agg, cap):
    print("\n" + "=" * 72)
    print("정의 3 — 한국 고등어 자급률")
    print("=" * 72)
    years = sorted({k[4] for k in agg if k[1] == KOREA})
    print(f"\n{'연도':>6} {'어획(톤)':>12} {'수입(톤)':>12} {'수출(톤)':>12} "
          f"{'A:어획/(어획+수입)':>18} {'B:어획/(어획+수입-수출)':>22}")
    for y in years:
        c = cap.get((KOREA, y), 0)
        imp = sum(v for k, v in agg.items()
                  if k[0] == FLOW_IMPORT and k[1] == KOREA and k[3] == Q and k[4] == y)
        exp = sum(v for k, v in agg.items()
                  if k[0] == FLOW_EXPORT and k[1] == KOREA and k[3] == Q and k[4] == y)
        a = pct(c, c + imp)
        supply = c + imp - exp
        b = pct(c, supply) if supply > 0 else "n/a"
        print(f"{y:>6} {c:>12,.0f} {imp:>12,.0f} {exp:>12,.0f} {a:>18} {b:>22}")
    print("\n  A = 국내 조달 비율 (통계청 어업생산 + 수입).")
    print("  B = 국내 소비 기준 (수출분 차감). 한국은 수출이 커서 두 값이 크게 갈린다.")
    print("  ※ 어획은 FAO capture(Scomber 속)이라 통계청 '고등어류'와 범위가 다를 수 있다.")


def main():
    agg = load_partners()
    cap = load_capture()
    print(f"로드: trade_partners {len(agg):,}키 / capture {len(cap):,}키")
    print(f"범위: Scomber 속만. jack·horse·Indian·Spanish·Atka mackerel 제외.")
    q1_norway_dependency(agg)
    q2_africa_growth(agg)
    q3_self_sufficiency(agg, cap)


if __name__ == "__main__":
    main()
