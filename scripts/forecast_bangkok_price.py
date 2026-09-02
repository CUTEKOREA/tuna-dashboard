#!/usr/bin/env python3
"""방콕 원어 시세 3개월 예측 — 롤링 백테스트 리포트(화면 반영 없음).

원칙: 기준선(계절 랜덤워크)을 백테스트에서 못 이기는 모델은 점선으로 그리지 않는다.
2026-05-20 폐기된 VAR 예측(백테스트 불가, 실측 대비 30%+ 오차)의 재발 방지 장치다.

입력 (모두 저장소 안):
  public/data/bangkok_weekly_payload.json  — 주간 시세·반입량·재고·가동률·가공일수 (2020-05~)
  public/data/singapore_mgo.json           — 싱가포르 MGO 주간(화) 종가 (2023-09~)
  --cpi                                    — FRED CPIAUCSL·ONS D7G7 YoY (선택, 스크래치 JSON)

모형:
  기준선  P̂(t+h) = P(t) · (1 + s_m)         s_m = 예측 대상 월의 과거 평균 h주 변화율
  회귀    Δln P(t+h) = α + Σ β_k · Δln X_k(t − L_k)     릿지, 수평선 h ∈ {4, 8, 13} 각각 직접 예측
백테스트: 롤링 오리진(확장 창). 오리진 t마다 t 이전만으로 적합해 t+h 실측과 비교.

사용: python3 scripts/forecast_bangkok_price.py [--from 2024-06-01] [--cpi cpi.json] [--out docs/...md]
"""
from __future__ import annotations

import argparse
import json
import math
from datetime import date, datetime, timedelta
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
HORIZONS = (4, 8, 13)
RIDGE_LAMBDA = 1.0


def iso(d: date) -> str:
    return d.isoformat()


def load_bangkok() -> list[dict]:
    d = json.loads((ROOT / "public/data/bangkok_weekly_payload.json").read_text())
    return [r for r in d["series"] if r.get("price")]


def load_sg_weekly() -> dict[str, float]:
    d = json.loads((ROOT / "public/data/singapore_mgo.json").read_text())
    return {tue: v for tue, v, _ in d["weekly"]}



def load_cpi(path: Path | None) -> tuple[dict, dict]:
    if not path:
        return {}, {}
    d = json.loads(path.read_text())
    return d.get("us_cpi_yoy", {}), d.get("uk_cpi_yoy", {})


def nearest_before(table: dict[str, float], day: date, max_back: int) -> float | None:
    for back in range(max_back + 1):
        v = table.get(iso(day - timedelta(days=back)))
        if v is not None:
            return v
    return None


def month_lag(table: dict[str, float], day: date, months_back: int) -> float | None:
    """월간 지표를 발표 지연 감안해 months_back 개월 전 값으로 쓴다."""
    y, m = day.year, day.month - months_back
    while m <= 0:
        y, m = y - 1, m + 12
    return table.get(f"{y:04d}-{m:02d}")


def build_frame(bkk, sg, us, uk):
    """보고일별 행: 시세와 설명변수(원값). 결측은 None 유지."""
    rows = []
    for r in bkk:
        d = date.fromisoformat(r["date"])
        rows.append({
            "date": d, "price": r["price"],
            "unload": r.get("unload_mt"), "stock": r.get("bkk_stock"), "util": r.get("bkk_util"), "days": r.get("bkk_days"),
            "sg": nearest_before(sg, d, 6),
            "us_cpi": month_lag(us, d, 2), "uk_cpi": month_lag(uk, d, 2),
        })
    return rows


# 설명변수 정의: (이름, 필드, 리드 주, 변환)  — 리드는 «이 값이 시세보다 몇 주 먼저 관측되는가»
FEATURES = [
    ("반입량(4주 전)", "unload", 4, "dlog"),
    ("싱가포르 MGO(1주 전)", "sg", 1, "dlog"),
    ("싱가포르 MGO(4주 전)", "sg", 4, "dlog"),
    ("방콕 재고(동시)", "stock", 0, "dlog"),
    ("가공가능일수(동시)", "days", 0, "dlog"),
    ("미국 CPI YoY(2개월 지연)", "us_cpi", 0, "level"),
    ("영국 CPI YoY(2개월 지연)", "uk_cpi", 0, "level"),
]


def dlog(a, b):
    if a is None or b is None or a <= 0 or b <= 0:
        return None
    return math.log(a) - math.log(b)


def design(rows, h, feats):
    """행 i에 대해 y = ln P(i+h) − ln P(i), x = 각 설명변수의 리드 반영 로그차분(직전 4주 대비)."""
    X, Y, idx = [], [], []
    n = len(rows)
    for i in range(8, n - h):
        y = dlog(rows[i + h]["price"], rows[i]["price"])
        if y is None:
            continue
        x = []
        ok = True
        for name, field, lead, kind in feats:
            j = i - lead
            if j < 4:
                ok = False
                break
            if kind == "dlog":
                v = dlog(rows[j][field], rows[j - 4][field])
            else:
                v = rows[j][field]
            if v is None:
                ok = False
                break
            x.append(v)
        if not ok:
            continue
        X.append(x); Y.append(y); idx.append(i)
    return np.array(X), np.array(Y), idx


def ridge_fit(X, Y, lam=RIDGE_LAMBDA):
    mu, sd = X.mean(0), X.std(0) + 1e-9
    Z = (X - mu) / sd
    Zb = np.hstack([np.ones((len(Z), 1)), Z])
    I = np.eye(Zb.shape[1]); I[0, 0] = 0
    beta = np.linalg.solve(Zb.T @ Zb + lam * I, Zb.T @ Y)
    return beta, mu, sd


def ridge_predict(model, x):
    beta, mu, sd = model
    z = np.hstack([1.0, (np.array(x) - mu) / sd])
    return float(z @ beta)


def seasonal_baseline(rows, i, h, hist_end):
    """기준선: 같은 달에 출발한 과거 h주 변화율 평균 (hist_end 이전 관측만)."""
    m = rows[i]["date"].month
    changes = [dlog(rows[k + h]["price"], rows[k]["price"]) for k in range(0, hist_end - h) if rows[k]["date"].month == m]
    changes = [c for c in changes if c is not None]
    drift = float(np.mean(changes)) if len(changes) >= 3 else 0.0
    return rows[i]["price"] * math.exp(drift)


def backtest(rows, feats, start: date):
    out = {}
    for h in HORIZONS:
        X, Y, idx = design(rows, h, feats)
        pos = {i: k for k, i in enumerate(idx)}
        recs = []
        for i in idx:
            if rows[i]["date"] < start or i + h >= len(rows):
                continue
            train = [k for k, ii in enumerate(idx) if ii + h < i]  # t 이전에 실측이 끝난 표본만
            if len(train) < 30:
                continue
            model = ridge_fit(X[train], Y[train])
            pred = rows[i]["price"] * math.exp(ridge_predict(model, X[pos[i]]))
            base = seasonal_baseline(rows, i, h, i)
            actual = rows[i + h]["price"]
            recs.append((rows[i]["date"], actual, pred, base, rows[i]["price"]))
        out[h] = recs
    return out


def metrics(recs):
    if not recs:
        return None
    a = np.array([r[1] for r in recs]); p = np.array([r[2] for r in recs]); b = np.array([r[3] for r in recs]); p0 = np.array([r[4] for r in recs])
    mape = lambda f: float(np.mean(np.abs(f - a) / a) * 100)
    hit = lambda f: float(np.mean(np.sign(f - p0) == np.sign(a - p0)) * 100)
    return {"n": len(recs), "model_mape": mape(p), "base_mape": mape(b), "rw_mape": mape(p0), "model_hit": hit(p), "base_hit": hit(b)}


def band(recs, q=0.8):
    err = np.array([math.log(r[1] / r[2]) for r in recs])
    lo, hi = np.quantile(err, (1 - q) / 2), np.quantile(err, 1 - (1 - q) / 2)
    return float(lo), float(hi)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--from", dest="start", default="2024-06-01")
    ap.add_argument("--cpi", type=Path)
    ap.add_argument("--out", type=Path, default=ROOT / "docs/2026-09-02_bangkok_price_forecast_backtest.md")
    ap.add_argument("--json", type=Path)
    args = ap.parse_args(argv)

    bkk = load_bangkok(); sg = load_sg_weekly(); us, uk = load_cpi(args.cpi)
    rows = build_frame(bkk, sg, us, uk)
    start = date.fromisoformat(args.start)

    variants = {
        "A 반입량+재고+가공일수": [f for f in FEATURES if f[1] in ("unload", "stock", "days")],
        "B A+싱가포르 MGO": [f for f in FEATURES if f[1] in ("unload", "stock", "days", "sg")],
        "C B+미국·영국 CPI": FEATURES,
        "D 싱가포르 MGO만": [f for f in FEATURES if f[1] == "sg"],
    }
    results = {name: backtest(rows, feats, start) for name, feats in variants.items()}

    lines = ["# 방콕 원어 시세 3개월 예측 — 롤링 백테스트", "",
             f"생성 {datetime.now().strftime('%Y-%m-%d %H:%M')} · 시세 {rows[0]['date']}~{rows[-1]['date']} {len(rows)}주 · 백테스트 오리진 {start} 이후 · 릿지 λ={RIDGE_LAMBDA}", "",
             "기준선 = 같은 달 출발 과거 h주 평균 변화율을 현재가에 적용(계절 랜덤워크). 랜덤워크 = 현재가 유지.", "",
             "| 변수 세트 | h | n | 모델 MAPE | 기준선 MAPE | 랜덤워크 MAPE | 방향 적중 모델/기준선 | 판정 |", "|---|---|---|---|---|---|---|---|"]
    verdicts = {}
    for name, res in results.items():
        for h in HORIZONS:
            m = metrics(res[h])
            if not m:
                lines.append(f"| {name} | {h}주 | 0 | — | — | — | — | 표본 부족 |"); continue
            beat = m["model_mape"] < m["base_mape"] and m["model_mape"] < m["rw_mape"]
            verdicts[(name, h)] = beat
            lines.append(f"| {name} | {h}주 | {m['n']} | {m['model_mape']:.1f}% | {m['base_mape']:.1f}% | {m['rw_mape']:.1f}% | {m['model_hit']:.0f}% / {m['base_hit']:.0f}% | {'이김' if beat else '못 이김'} |")
    lines += ["", "## 변수별 표준화 계수 (전체 표본 적합, 세트 C)", ""]
    for h in HORIZONS:
        X, Y, idx = design(rows, h, FEATURES)
        if len(Y) < 30:
            continue
        beta, mu, sd = ridge_fit(X, Y)
        lines.append(f"**h={h}주** (n={len(Y)}): " + ", ".join(f"{FEATURES[k][0]} {beta[k+1]:+.3f}" for k in range(len(FEATURES))))
    lines += ["", "## 최근 오리진의 예측 vs 실측 (세트 B, h=13)", "", "| 오리진 | 당시 시세 | 13주 뒤 실측 | 모델 | 기준선 |", "|---|---|---|---|---|"]
    for d, a, p, b, p0 in results["B A+싱가포르 MGO"][13][-8:]:
        lines.append(f"| {d} | {p0:,.0f} | {a:,.0f} | {p:,.0f} | {b:,.0f} |")
    lines += ["", "## 지금 시점 예측 (참고용 — 판정이 «이김»인 세트·수평선만 의미 있음)", "", "| 세트 | h | 예측 | 80% 밴드 |", "|---|---|---|---|"]
    last = len(rows) - 1
    for name, feats in variants.items():
        for h in HORIZONS:
            X, Y, idx = design(rows, h, feats)
            if len(Y) < 30:
                continue
            model = ridge_fit(X, Y)
            x = []
            ok = True
            for fname, field, lead, kind in feats:
                j = last - lead
                v = dlog(rows[j][field], rows[j - 4][field]) if kind == "dlog" else rows[j][field]
                if v is None:
                    ok = False; break
                x.append(v)
            if not ok:
                lines.append(f"| {name} | {h}주 | 최신 설명변수 결측 | — |"); continue
            pred = rows[last]["price"] * math.exp(ridge_predict(model, x))
            recs = results[name][h]
            if recs:
                lo, hi = band(recs)
                lines.append(f"| {name} | {h}주 | {pred:,.0f} | {pred*math.exp(lo):,.0f} ~ {pred*math.exp(hi):,.0f} {'✅' if verdicts.get((name,h)) else '✖'} |")
    coverage = {k: sum(1 for r in rows if r[k] is not None) for k in ("unload", "stock", "days", "sg", "us_cpi", "uk_cpi")}
    lines += ["", "## 데이터 커버리지", "", ", ".join(f"{k} {v}/{len(rows)}주" for k, v in coverage.items()),
              "", "선단 조업량(fleet daily)은 2026-01-16부터라 백테스트에 넣지 않았다. 유가는 사용자 지시대로 싱가포르 MGO(Ship & Bunker) 기준이며 Brent는 쓰지 않았다."]
    args.out.write_text("\n".join(lines) + "\n")
    if args.json:
        args.json.write_text(json.dumps({name: {h: metrics(res[h]) for h in HORIZONS} for name, res in results.items()}, ensure_ascii=False, indent=1))
    print("\n".join(lines[:5 + 4 * len(HORIZONS) + 2]))
    print(f"\n→ {args.out}")


if __name__ == "__main__":
    main()
