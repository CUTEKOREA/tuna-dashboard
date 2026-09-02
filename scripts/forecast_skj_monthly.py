#!/usr/bin/env python3
"""방콕 SKJ 원어 시세 3개월 예측 — 월별 30년 시계열 롤링 백테스트(리포트만).

주간 284주로는 어떤 회귀도 기준선을 못 이겼다(docs/2026-09-02_bangkok_price_forecast_backtest.md).
Atuna 월별 SKJ 1.8kg CFR 방콕(1994~, data/atuna_prices.json)으로 표본을 12배 늘려 다시 본다.

입력: data/atuna_prices.json(skj_bkk 월별) + 스크래치 JSON(--brent FRED MCOILBRENTEU, --thb FRED EXTHUS,
      --oni NOAA ONI, --mgo Atuna SKJ-vs-MGO 월별, --cpi US CPI YoY) — 없는 것은 자동 제외.
후보(각각 직접예측 h=3개월, 확장창 롤링 오리진):
  RW    현재가 유지
  SEAS  같은 달 출발 과거 3개월 평균 변화율(계절 랜덤워크) — 기준선
  MR    24개월 이동평균으로의 회귀: Δln P(t+3) = a + b·(ln P(t) − ln MA24(t))
  MR+S  MR + 계절(월 더미 대신 SEAS 드리프트)
  MR+X  MR+S + 외생 로그차분(유가·환율·ONI 등, 리드 적용) — 릿지
"""
from __future__ import annotations

import argparse
import json
import math
from datetime import date
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
H = 3
LAM = 1.0


def ym(d: str) -> str:
    return d[:7]


def add_months(s: str, k: int) -> str:
    y, m = int(s[:4]), int(s[5:7]) + k
    while m > 12: y, m = y + 1, m - 12
    while m < 1: y, m = y - 1, m + 12
    return f"{y:04d}-{m:02d}"


def load_skj() -> dict[str, float]:
    rows = json.loads((ROOT / "data/atuna_prices.json").read_text())
    out = {}
    for r in rows:
        if r.get("skj_bkk"):
            out[ym(r["date"])] = float(r["skj_bkk"])  # 같은 달 여러 값이면 마지막(최신) 값
    return out


def load_fred(path: Path | None) -> dict[str, float]:
    if not path or not path.exists():
        return {}
    d = json.loads(path.read_text())
    return {ym(o["date"]): float(o["value"]) for o in d["observations"] if o["value"] != "."}


def load_json_map(path: Path | None, key=None) -> dict[str, float]:
    if not path or not path.exists():
        return {}
    d = json.loads(path.read_text())
    return {k: float(v) for k, v in (d[key] if key else d).items()}


def load_spreads() -> dict[str, dict[str, float]]:
    """Atuna 지역가 대비 방콕 스프레드 ln(지역/방콕) 월별. 만타·세이셸·아비장 (2010~)."""
    rows = json.loads((ROOT / "data/atuna_prices.json").read_text())
    bkk, reg = {}, {"mnt": {}, "sey": {}, "abj": {}}
    for r in rows:
        m = ym(r["date"])
        if r.get("skj_bkk"): bkk[m] = float(r["skj_bkk"])
        for k in reg:
            if r.get(f"skj_{k}"): reg[k][m] = float(r[f"skj_{k}"])
    out = {}
    for k, tbl in reg.items():
        out[f"sp_{k}"] = {m: math.log(v / bkk[m]) for m, v in tbl.items() if m in bkk}
    return out


def load_mgo(path: Path | None) -> dict[str, float]:
    """Atuna SKJ-vs-MGO 표(dd-mm-yyyy) → 월별 마지막 값."""
    if not path or not path.exists():
        return {}
    out = {}
    for d, _skj, mgo in json.loads(path.read_text()):
        dd, mm, yy = d.split("-")
        out[f"{yy}-{mm}"] = float(mgo)
    return out


def dlog(a, b):
    return None if (a is None or b is None or a <= 0 or b <= 0) else math.log(a) - math.log(b)


def build(skj, exog: dict[str, dict[str, float]], leads: dict[str, int]):
    months = sorted(skj)
    rows = []
    for i, m in enumerate(months):
        r = {"m": m, "p": skj[m]}
        hist = [skj[months[j]] for j in range(max(0, i - 23), i + 1)]
        r["ma24"] = float(np.mean(hist)) if len(hist) >= 12 else None
        r["mom3"] = dlog(skj[m], skj[months[i - 3]]) if i >= 3 else None
        for name, tbl in exog.items():
            lead = leads.get(name, 0)
            mm = add_months(m, -lead)
            cur, prev = tbl.get(mm), tbl.get(add_months(mm, -3))
            if name.startswith("sp_"):
                r[name] = cur  # 스프레드는 수준 자체가 신호 (공적분 오차)
            else:
                r[name] = (cur - prev) if name.startswith("oni") and cur is not None and prev is not None else dlog(cur, prev)
            r[name + "_lvl"] = tbl.get(mm)
        rows.append(r)
    return rows


def seas_drift(rows, i, end):
    mo = rows[i]["m"][5:7]
    ch = [dlog(rows[k + H]["p"], rows[k]["p"]) for k in range(0, end - H) if rows[k]["m"][5:7] == mo]
    ch = [c for c in ch if c is not None]
    return float(np.mean(ch)) if len(ch) >= 3 else 0.0


def ridge(X, y, lam=LAM):
    mu, sd = X.mean(0), X.std(0) + 1e-9
    Z = np.hstack([np.ones((len(X), 1)), (X - mu) / sd])
    I = np.eye(Z.shape[1]); I[0, 0] = 0
    return np.linalg.solve(Z.T @ Z + lam * I, Z.T @ y), mu, sd


def predict(model, x):
    b, mu, sd = model
    return float(np.hstack([1.0, (np.array(x) - mu) / sd]) @ b)


def features(rows, i, spec):
    x = []
    for f in spec:
        if f == "gap":
            v = dlog(rows[i]["p"], rows[i]["ma24"])
        elif f == "seas":
            v = seas_drift(rows, i, i)
        elif f == "mom3":
            v = rows[i]["mom3"]
        else:
            v = rows[i].get(f)
        if v is None:
            return None
        x.append(v)
    return x


def backtest(rows, spec, start, min_train=60):
    recs = []
    for i in range(24, len(rows) - H):
        if rows[i]["m"] < start:
            continue
        train_X, train_y = [], []
        for k in range(24, i - H + 1):  # k+H <= i : 오리진 시점에 실측이 끝난 표본
            xk = features(rows, k, spec) if spec else []
            yk = dlog(rows[k + H]["p"], rows[k]["p"])
            if xk is None or yk is None:
                continue
            train_X.append(xk); train_y.append(yk)
        if len(train_y) < min_train:
            continue
        xi = features(rows, i, spec) if spec else []
        if xi is None:
            continue
        actual = rows[i + H]["p"]; p0 = rows[i]["p"]
        if spec:
            model = ridge(np.array(train_X), np.array(train_y))
            pred = p0 * math.exp(predict(model, xi))
        else:
            pred = p0
        recs.append((rows[i]["m"], actual, pred, p0, p0 * math.exp(seas_drift(rows, i, i))))
    return recs


def metrics(recs):
    a = np.array([r[1] for r in recs]); p = np.array([r[2] for r in recs]); p0 = np.array([r[3] for r in recs]); b = np.array([r[4] for r in recs])
    mape = lambda f: float(np.mean(np.abs(f - a) / a) * 100)
    hit = lambda f: float(np.mean(np.sign(f - p0) == np.sign(a - p0)) * 100)
    return {"n": len(recs), "mape": mape(p), "rw": mape(p0), "seas": mape(b), "hit": hit(p), "hit_seas": hit(b)}


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="start", default="2010-01")
    ap.add_argument("--brent", type=Path); ap.add_argument("--thb", type=Path); ap.add_argument("--oni", type=Path)
    ap.add_argument("--mgo", type=Path); ap.add_argument("--cpi", type=Path)
    ap.add_argument("--thaiunion", type=Path, default=ROOT / "public/data/thaiunion_skj_monthly.json")
    ap.add_argument("--out", type=Path, default=ROOT / "docs/2026-09-02_skj_monthly_forecast_backtest.md")
    a = ap.parse_args(argv)

    skj = load_skj()
    exog = {"brent": load_fred(a.brent), "thb": load_fred(a.thb), "oni": load_json_map(a.oni), "mgo": load_mgo(a.mgo)}
    if a.cpi and a.cpi.exists():
        exog["uscpi"] = load_json_map(a.cpi, "us_cpi_yoy")
    exog.update(load_spreads())
    exog["oni12"] = dict(exog.get("oni", {}))  # 문헌: WCPO CPUE–ONI 최적 지연 12개월
    exog = {k: v for k, v in exog.items() if v}
    leads = {"brent": 1, "thb": 1, "oni": 3, "oni12": 12, "mgo": 1, "uscpi": 2, "sp_mnt": 1, "sp_sey": 1, "sp_abj": 1}
    rows = build(skj, exog, leads)

    specs = {
        "RW": [],
        "S": ["seas"],
        "MR": ["gap"],
        "MR+S": ["gap", "seas"],
        "S+mom": ["seas", "mom3"],
        "MR+S+mom": ["gap", "seas", "mom3"],
    }
    for name in exog:
        specs[f"MR+S+{name}"] = ["gap", "seas", name]
    specs["MR+S+mom+sp_mnt"] = ["gap", "seas", "mom3", "sp_mnt"]
    specs["MR+S+mom+sp_mnt+oni12"] = ["gap", "seas", "mom3", "sp_mnt", "oni12"]
    specs["MR+S+mom+oni12"] = ["gap", "seas", "mom3", "oni12"]
    specs["MR+S+all"] = ["gap", "seas", "mom3", "sp_mnt", "oni12", "brent", "thb"]

    lines = [f"# 방콕 SKJ 월별 시세 3개월 예측 — 롤링 백테스트 (Atuna 1.8kg CFR, {rows[0]['m']}~{rows[-1]['m']}, {len(rows)}개월)", "",
             f"오리진 {a.start} 이후, 확장창, 직접예측 h=3개월, 릿지 λ={LAM}. 기준선 SEAS = 같은 달 출발 과거 3개월 평균 변화율. 외생 리드(개월): {leads}", "",
             "| 모델 | n | MAPE | 랜덤워크 | 계절기준선 | 방향적중 모델/기준선 | 판정 |", "|---|---|---|---|---|---|---|"]
    results = {}
    for name, spec in specs.items():
        recs = backtest(rows, spec, a.start)
        if not recs:
            lines.append(f"| {name} | 0 | — | — | — | — | 표본 부족 |"); continue
        m = metrics(recs); results[name] = (recs, m)
        beat = m["mape"] < m["seas"] and m["mape"] < m["rw"]
        lines.append(f"| {name} | {m['n']} | {m['mape']:.1f}% | {m['rw']:.1f}% | {m['seas']:.1f}% | {m['hit']:.0f}% / {m['hit_seas']:.0f}% | {'**이김**' if beat else '못 이김'} |")

    # 공정 비교 — 사양마다 표본 길이가 달라 MAPE를 바로 비교하면 안 된다. 공통 오리진에서 다시 잰다.
    keyed = {name: {r[0]: r for r in recs} for name, (recs, _) in results.items() if len(recs) >= 100}  # 짧은 사양은 제외
    common = sorted(set.intersection(*[set(v) for v in keyed.values()])) if keyed else []
    if len(common) >= 30:
        lines += ["", f"## 공통 오리진 비교 — {len(common)}개({common[0]}~{common[-1]}), 같은 표본", "", "| 모델 | MAPE | 랜덤워크 | 계절기준선 | 방향 | 이득(%p) | 부트스트랩 90% CI |", "|---|---|---|---|---|---|---|"]
        rng2 = np.random.default_rng(1)
        for name in keyed:
            recs = [keyed[name][m] for m in common]
            mm = metrics(recs)
            aa = np.array([r[1] for r in recs]); pp = np.array([r[2] for r in recs]); bb = np.array([r[4] for r in recs])
            d = np.abs(bb - aa) / aa - np.abs(pp - aa) / aa
            boots = [np.mean(d[rng2.integers(0, len(d), len(d))]) for _ in range(3000)]
            lines.append(f"| {name} | {mm['mape']:.1f}% | {mm['rw']:.1f}% | {mm['seas']:.1f}% | {mm['hit']:.0f}% | {np.mean(d)*100:+.2f} | [{np.quantile(boots, .05)*100:+.2f}, {np.quantile(boots, .95)*100:+.2f}] |")

    # 유의성 — 오리진별 |오차| 차이(기준선 − 모델)의 부트스트랩 90% CI
    lines += ["", "## 유의성 (기준선 |오차| − 모델 |오차|, %p; 양수면 모델 우세)", "", "| 모델 | n | 평균 차이 | 부트스트랩 90% CI | 모델 우세 비율 |", "|---|---|---|---|---|"]
    rng = np.random.default_rng(0)
    for name, (recs, m) in results.items():
        if name == "RW" or len(recs) < 30:
            continue
        aa = np.array([r[1] for r in recs]); pp = np.array([r[2] for r in recs]); bb = np.array([r[4] for r in recs])
        d = np.abs(bb - aa) / aa - np.abs(pp - aa) / aa
        boots = [np.mean(d[rng.integers(0, len(d), len(d))]) for _ in range(3000)]
        lines.append(f"| {name} | {len(d)} | {np.mean(d)*100:+.2f} | [{np.quantile(boots, 0.05)*100:+.2f}, {np.quantile(boots, 0.95)*100:+.2f}] | {(d > 0).mean()*100:.0f}% |")

    # 구간별 (2010s vs 2020s) 안정성
    lines += ["", "## 구간별 MAPE (모델 / 계절기준선)", "", "| 모델 | 2010-2015 | 2016-2019 | 2020-2023 | 2024- |", "|---|---|---|---|---|"]
    for name, (recs, _) in results.items():
        cells = []
        for lo, hi in (("2010", "2015"), ("2016", "2019"), ("2020", "2023"), ("2024", "2099")):
            sub = [r for r in recs if lo <= r[0][:4] <= hi]
            if len(sub) < 6: cells.append("—"); continue
            mm = metrics(sub); cells.append(f"{mm['mape']:.1f} / {mm['seas']:.1f}")
        lines.append(f"| {name} | " + " | ".join(cells) + " |")

    # 최근 오리진 표 + 현재 예측
    best = min(results, key=lambda k: results[k][1]["mape"])
    lines += ["", f"## 최근 오리진 (최저 MAPE 모델 «{best}»)", "", "| 오리진 | 당시 | 3개월 뒤 실측 | 모델 | 계절기준선 |", "|---|---|---|---|---|"]
    for mo, act, pred, p0, base in results[best][0][-10:]:
        lines.append(f"| {mo} | {p0:,.0f} | {act:,.0f} | {pred:,.0f} | {base:,.0f} |")
    last = len(rows) - 1
    lines += ["", f"## 지금 시점({rows[last]['m']}, ${rows[last]['p']:,.0f}) 3개월 뒤 예측", "", "| 모델 | 예측 | 80% 밴드(백테스트 잔차) |", "|---|---|---|"]
    for name, (recs, m) in results.items():
        spec = specs[name]
        xi = features(rows, last, spec) if spec else []
        if xi is None:
            lines.append(f"| {name} | 최신 입력 결측 | — |"); continue
        if spec:
            X, y = [], []
            for k in range(24, last - H + 1):
                xk = features(rows, k, spec); yk = dlog(rows[k + H]["p"], rows[k]["p"])
                if xk is not None and yk is not None: X.append(xk); y.append(yk)
            pred = rows[last]["p"] * math.exp(predict(ridge(np.array(X), np.array(y)), xi))
        else:
            pred = rows[last]["p"]
        err = np.array([math.log(r[1] / r[2]) for r in recs])
        lo, hi = np.quantile(err, 0.1), np.quantile(err, 0.9)
        lines.append(f"| {name} | {pred:,.0f} | {pred*math.exp(lo):,.0f} ~ {pred*math.exp(hi):,.0f} |")
    # 표적 시리즈 교차검증 — Thai Union IR 월별 방콕 SKJ(2019~)와 대조
    if a.thaiunion and a.thaiunion.exists():
        tu = json.loads(a.thaiunion.read_text())["monthly"]
        common = [m for m in tu if m in skj]
        aa = np.array([skj[m] for m in common]); bb = np.array([tu[m] for m in common])
        lines += ["", "## 표적 시리즈 교차검증 — Atuna vs Thai Union IR 월별", "",
                  f"{len(common)}개월({common[0]}~{common[-1]}) 상관 {np.corrcoef(aa, bb)[0,1]:.3f} · 평균 절대차 {np.mean(np.abs(aa-bb)):.0f}$/t ({np.mean(np.abs(aa-bb)/bb)*100:.1f}%) · Atuna−TU 평균 {np.mean(aa-bb):+.0f}$/t. "
                  "12% 초과 괴리: " + ", ".join(f"{m}({skj[m]:.0f}/{tu[m]})" for m in common if abs(skj[m]-tu[m])/tu[m] > 0.12)]
    # 유사국면 — 지금과 같은 조건(7~9월 출발, 24개월MA 대비 ≥+15%)에서 3개월 뒤 실제 변화
    months = sorted(skj)
    analogs = []
    for i, m in enumerate(months[:-H]):
        if m[5:7] not in ("07", "08", "09") or i < 24:
            continue
        gap = math.log(skj[m] / float(np.mean([skj[x] for x in months[i-23:i+1]])))
        if gap >= 0.15:
            analogs.append((m, skj[m], gap, math.log(skj[months[i+H]] / skj[m])))
    if analogs:
        ch = np.array([x[3] for x in analogs])
        lines += ["", f"## 유사국면 — 7~9월 출발 · 24개월MA 대비 ≥+15% (지금: {rows[last]['m']} gap {dlog(rows[last]['p'], rows[last]['ma24'])*100:+.0f}%)", "",
                  f"{len(analogs)}건 중 3개월 뒤 하락 {(ch < 0).sum()}건({(ch < 0).mean()*100:.0f}%) · 변화율 중앙값 {np.median(ch)*100:+.0f}% · 10~90분위 {np.quantile(ch, .1)*100:+.0f}%~{np.quantile(ch, .9)*100:+.0f}%", "",
                  "| 출발 | 시세 | gap | 3개월 뒤 |", "|---|---|---|---|"]
        lines += [f"| {m} | {p_:,.0f} | {g*100:+.0f}% | {c*100:+.0f}% |" for m, p_, g, c in analogs[-14:]]
    cov = {k: sum(1 for r in rows if r.get(k) is not None) for k in exog}
    lines += ["", f"커버리지(월): {cov} / 총 {len(rows)}"]
    a.out.write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
