#!/usr/bin/env python3
"""방콕 주간보고 1주치를 종합분석 HTML payload에 추가한다.

원본 빌더(292개 docx 전수 파서)는 유실됐다. 대신 매주 docx에서 손으로 검증한
week-spec JSON을 입력으로 받아, payload의 파생 집계를 결정적으로 재계산한다.
재계산 공식은 실행 시마다 «기존 데이터로 기존 payload를 재현하는지» 먼저
자가검증(reproduce check)하고, 재현 안 되는 항목은 건드리지 않고 경고만 낸다.

사용: python3 scripts/append_bangkok_week.py --spec <week.json> [--html <종합분석.html>] [--dry-run]
이후 scripts/sync_bangkok_report.sh 로 저장소 JSON을 재추출한다.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path

DEFAULT_HTML = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/"
    "내 드라이브/11. 태국/002. (매주)주간보고/"
    "방콕사무소_주간보고_종합분석_2020-2026.html"
)

PAYLOAD_RE = re.compile(
    r'(<script id="payload" type="application/json">)(.*?)(</script>)', re.DOTALL
)


def fail(msg: str) -> None:
    print(f"❌ {msg}")
    sys.exit(1)


def mean(xs: list[float]) -> float:
    return sum(xs) / len(xs)


def pearson(pairs: list[tuple[float, float]]) -> float | None:
    n = len(pairs)
    if n < 3:
        return None
    xs = [p[0] for p in pairs]
    ys = [p[1] for p in pairs]
    mx, my = mean(xs), mean(ys)
    sx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    sy = math.sqrt(sum((y - my) ** 2 for y in ys))
    if sx == 0 or sy == 0:
        return None
    return sum((x - mx) * (y - my) for x, y in pairs) / (sx * sy)


# ── 파생 집계 재계산 (빌더 공식 역산본 — reproduce check가 정당성 근거) ──

def calc_yearly_year(series: list[dict], tm: dict, year: int) -> dict:
    rows = [r for r in series if r["y"] == year]
    prices = [r["price"] for r in rows if r.get("price") is not None]
    utils = [r["bkk_util"] for r in rows if r.get("bkk_util") is not None]
    stocks = [r["bkk_stock"] for r in rows if r.get("bkk_stock") is not None]
    days = [r["bkk_days"] for r in rows if r.get("bkk_days") is not None]
    months = {k: v for k, v in tm.items() if k.startswith(f"{year}-")}
    return {
        "weeks": len(rows),
        "price_avg": round(mean(prices)),
        "price_min": min(prices),
        "price_max": max(prices),
        "bkk_util_avg": round(mean(utils), 1),
        "bkk_stock_avg": round(mean(stocks)),
        "bkk_stock_end": next(
            r["bkk_stock"] for r in reversed(rows) if r.get("bkk_stock") is not None
        ),
        "bkk_days_avg": round(mean(days), 1),
        "unload_total": sum(m["total_calc"] for m in months.values()),
        "ships_total": sum(m["ships_calc"] for m in months.values()),
        "rej_cases": sum(r["rej_cases"] for r in rows),
        "rej_mt": round(sum(r["rej_mt"] for r in rows), 1),
        "salt_cases": sum(r["salt_cases"] for r in rows),
        "salt_usd": sum(r["salt_usd"] for r in rows),
    }


TRADERS = ("FCF", "ITOCHU", "TRI MARINE", "DIRECT", "MALDIVES")


def calc_trader_annual_year(tm: dict, year: int) -> dict:
    months = {k: v for k, v in tm.items() if k.startswith(f"{year}-")}
    out: dict = {t: sum(m[t] for m in months.values()) for t in TRADERS}
    out["total"] = sum(m["total_calc"] for m in months.values())
    out["ships"] = sum(m["ships_calc"] for m in months.values())
    out["months"] = len(months)
    return out


def calc_stock_share(panel: dict, date: str) -> dict:
    latest = {
        name: row
        for name, rows in panel.items()
        for row in rows
        if row[0] == date
    }
    total = sum(row[3] for row in latest.values())
    return {name: round(row[3] / total * 100, 1) for name, row in latest.items()}


def calc_cannery_trend_year(panel: dict, year: int) -> dict:
    out = {}
    for name, rows in panel.items():
        yr = [r for r in rows if r[0].startswith(str(year))]
        if not yr:
            continue
        out[name] = {
            "cur": round(mean([r[1] for r in yr])),
            "util": round(mean([r[2] for r in yr]), 1),
            "stock": round(mean([r[3] for r in yr])),
        }
    return out


def calc_seasonality(tm: dict) -> dict:
    by_month: dict[str, list[float]] = {str(m): [] for m in range(1, 13)}
    for key, row in tm.items():
        by_month[str(int(key.split("-")[1]))].append(row["total_calc"])
    return {m: round(mean(v)) for m, v in by_month.items() if v}


def corr_pairs(series: list[dict], ind: str, lag: int) -> list[tuple[float, float]]:
    """지표[t] vs 가격[t+lag행] — 가격 쪽 suspect 행은 제외 (재현 검증으로 확정)."""
    pairs = []
    for i, row in enumerate(series):
        j = i + lag
        if j >= len(series):
            break
        x = row.get(ind)
        yrow = series[j]
        if x is not None and yrow.get("price") is not None and not yrow.get("suspect"):
            pairs.append((x, yrow["price"]))
    return pairs


def calc_corr(series: list[dict]) -> dict:
    out: dict = {}
    for ind in ("bkk_stock", "bkk_util", "bkk_days", "unload_mt"):
        out[ind] = {}
        for lag in (0, 4, 8, 13, 26):
            pairs = corr_pairs(series, ind, lag)
            r = pearson(pairs)
            out[ind][str(lag)] = [round(r, 3) if r is not None else None, len(pairs)]
    return out


def calc_corr_year(series: list[dict], years: list[int]) -> dict:
    """unload_mt[t] vs 가격[t+lag] — 가격행 연도로 그룹, n<5는 None (재현 검증으로 확정)."""
    out: dict = {}
    for year in years:
        out[str(year)] = {}
        for lag in (0, 4):
            pairs = []
            for i, row in enumerate(series):
                j = i + lag
                if j >= len(series):
                    break
                x = row.get("unload_mt")
                yrow = series[j]
                if x is None or yrow.get("price") is None or yrow.get("suspect"):
                    continue
                if yrow["y"] != year:
                    continue
                pairs.append((x, yrow["price"]))
            r = pearson(pairs) if len(pairs) >= 5 else None
            out[str(year)][str(lag)] = [round(r, 3) if r is not None else None, len(pairs)]
    return out


def approx(a, b, tol=0.51) -> bool:
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(a - b) <= tol
    return a == b


def dict_close(a: dict, b: dict, tol=0.51) -> list[str]:
    diffs = []
    for k in set(a) | set(b):
        va, vb = a.get(k), b.get(k)
        if isinstance(va, dict) and isinstance(vb, dict):
            diffs += [f"{k}.{d}" for d in dict_close(va, vb, tol)]
        elif isinstance(va, list) and isinstance(vb, list):
            if not all(approx(x, y, tol) for x, y in zip(va, vb)) or len(va) != len(vb):
                diffs.append(f"{k}: {va} != {vb}")
        elif not approx(va, vb, tol):
            diffs.append(f"{k}: {va} != {vb}")
    return diffs


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", required=True, type=Path)
    ap.add_argument("--html", type=Path, default=DEFAULT_HTML)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    spec = json.loads(args.spec.read_text())
    html = args.html.read_text()
    m = PAYLOAD_RE.search(html)
    if not m:
        fail("payload script 블록을 찾지 못했습니다")
    d = json.loads(m.group(2))

    week = spec["series"]
    date = week["date"]
    if d["series"][-1]["date"] >= date:
        fail(f"이미 {d['series'][-1]['date']}까지 반영됨 — {date} 추가 불가")

    # ── 1) reproduce check: 기존 데이터로 기존 집계를 재현하는가 ──
    year = week["y"]
    repro_ok: dict[str, bool] = {}
    checks = {
        "yearly": (calc_yearly_year(d["series"], d["traderMonthly"], year), d["yearly"][str(year)]),
        "traderAnnual": (calc_trader_annual_year(d["traderMonthly"], year), d["traderAnnual"][str(year)]),
        "stockShare": (calc_stock_share(d["panel"], d["series"][-1]["date"]), d["stockShare"]),
        "canneryTrend(2026만)": (
            {k: v for k, v in calc_cannery_trend_year(d["panel"], year).items()},
            {k: v[str(year)] for k, v in d["canneryTrend"].items() if str(year) in v},
        ),
        "seasonality": (calc_seasonality(d["traderMonthly"]), d["seasonality"]),
        "corr": (calc_corr(d["series"]), d["corr"]),
        "corrYear": (
            calc_corr_year(d["series"], [int(y) for y in d["corrYear"]]),
            d["corrYear"],
        ),
    }
    for name, (calc, stored) in checks.items():
        diffs = dict_close(calc, stored, tol=1.01 if name == "seasonality" else 0.51)
        repro_ok[name] = not diffs
        print(f"{'✅' if not diffs else '⚠️ '} reproduce {name}: {'일치' if not diffs else f'{len(diffs)}건 불일치'}")
        for diff in diffs[:6]:
            print(f"    {diff}")

    # ── 2) append ──
    d["series"].append(week)
    for name, vals in spec["panel"].items():
        d["panel"][name].append([date] + vals)

    tmspec = spec["trader_month"]
    key = tmspec["key"]
    ships_calc = sum(tmspec["ships"].values())
    d["traderMonthly"][key] = {
        **{t: tmspec[t] for t in TRADERS},
        "ships": tmspec["ships"],
        "total_calc": sum(tmspec[t] for t in TRADERS),
        "total_reported": tmspec["total_reported"],
        "ships_calc": ships_calc,
        "ships_reported": tmspec["ships_reported"],
        "source": date,
    }

    if repro_ok["yearly"]:
        d["yearly"][str(year)] = calc_yearly_year(d["series"], d["traderMonthly"], year)
    if repro_ok["traderAnnual"]:
        d["traderAnnual"][str(year)] = calc_trader_annual_year(d["traderMonthly"], year)
    if repro_ok["stockShare"]:
        d["stockShare"] = calc_stock_share(d["panel"], date)
    if repro_ok["canneryTrend(2026만)"]:
        for name, agg in calc_cannery_trend_year(d["panel"], year).items():
            d["canneryTrend"].setdefault(name, {})[str(year)] = agg
    if repro_ok["seasonality"]:
        d["seasonality"] = calc_seasonality(d["traderMonthly"])
    if repro_ok["corr"]:
        d["corr"] = calc_corr(d["series"])
    if repro_ok["corrYear"]:
        d["corrYear"] = calc_corr_year(d["series"], [int(y) for y in d["corrYear"]])

    # snapshot: 최신주 캐너리 표로 전면 교체 (기존 이름 순서 유지)
    meta_by_region = spec["snapshot_meta"]
    snap = []
    for old in d["snapshot"]:
        name, region = old["name"], old["region"]
        if name not in spec["panel"]:
            snap.append(old)
            continue
        _, cur, util, stock, days = [date] + spec["panel"][name]
        sm = meta_by_region[region][name]
        snap.append({
            "max": sm["max"], "current": cur, "util": util, "capa": sm["capa"],
            "stock": stock, "days": days, "tuna_share": old.get("tuna_share"),
            "name": name, "region": region,
        })
    d["snapshot"] = snap

    # claimsYear: 발표 합계·주차만 기계 증분 — unique(원장 xlsx dedup)는 원장 갱신 전까지 유지
    cy = d["claimsYear"][str(year)]
    cy["weeks"] += 1
    cy["salt_published"] += week["salt_cases"]
    cy["salt_usd_published"] += week["salt_usd"]
    cy["rej_published"] += week["rej_cases"]
    if week["salt_cases"]:
        cy["weeks_with_salt"] += 1
    if week["rej_cases"]:
        cy["weeks_with_rej"] += 1

    # mismatch: 이번 달·올해 누계는 재검증해 해소분 제거, 잔존분 source 갱신
    ta = d["traderAnnual"][str(year)]
    new_mismatch = []
    for entry in d["mismatch"]:
        where = entry["where"]
        if where == f"{key} 물량":
            continue  # 이번 주 값으로 재판정 (아래에서 다시 추가)
        if where == f"{year}년 누계표 물량":
            continue
        if where.startswith(f"{year}년 누계표 ") and where.split("누계표 ", 1)[1] in TRADERS:
            continue
        new_mismatch.append(entry)
    tm_row = d["traderMonthly"][key]
    if tm_row["total_calc"] != tm_row["total_reported"]:
        new_mismatch.append({
            "where": f"{key} 물량", "calc": tm_row["total_calc"],
            "reported": tm_row["total_reported"],
            "diff": tm_row["total_calc"] - tm_row["total_reported"], "source_file": date,
        })
    yr_reported = spec["trader_year_reported"]["total"]
    if ta.get("total") != yr_reported:
        new_mismatch.append({
            "where": f"{year}년 누계표 물량", "calc": ta.get("total"),
            "reported": yr_reported, "diff": ta.get("total", 0) - yr_reported,
            "source_file": date,
        })
    # 트레이더별 누계도 대조한다. 총계만 보면 한 트레이더 칸이 틀려도 다른 칸과
    # 상쇄되어 지나간다 — 2026-09-02 보고의 TRI MARINE 45,463(실제 56,463)이 그랬다.
    for trader in TRADERS:
        if trader not in spec["trader_year_reported"]:
            continue
        reported = spec["trader_year_reported"][trader]
        calc = ta.get(trader)
        where = f"{year}년 누계표 {trader}"
        new_mismatch = [e for e in new_mismatch if e["where"] != where]
        if calc != reported:
            new_mismatch.append({
                "where": where, "calc": calc, "reported": reported,
                "diff": (calc or 0) - reported, "source_file": date,
            })
    d["mismatch"] = new_mismatch

    # meta
    meta = d["meta"]
    meta["files"] += 1
    meta["reports"] += 1
    meta["last"] = date
    for k, cond in [
        ("price_weeks", week.get("price") is not None),
        ("unload_weeks", week.get("unload_mt") is not None),
        ("cannery_weeks", week.get("bkk_stock") is not None),
        ("trader_weeks", True),
        ("claim_weeks", bool(week["salt_cases"] or week["rej_cases"])),
    ]:
        if cond:
            meta[k] += 1

    # ── 3) 헤더 KPI·부제 갱신 ──
    hdr = spec["header"]
    replacements = [
        (r"~ \d{4}년 \d{1,2}월 \d{1,2}일 · 주간보고 \d+건\(고유 \d+주\)",
         f"~ {hdr['sub_end']} · 주간보고 {hdr['reports']}건(고유 {hdr['weeks']}주)"),
        (r'(<div class="lab">분석 대상</div>\s*<div class="val">)\d+주',
         f"{hdr['weeks']}주"),
        (r'(<div class="lab">최신 시세</div>\s*<div class="val">)\\?\$[\d,]+',
         hdr["latestPrice"]),
        (r'(<div class="lab">방콕 재고</div>\s*<div class="val">)[\d,]+ MT',
         hdr["stockMt"]),
        (r'(<div class="lab">가공가능일수</div>\s*<div class="val">)\d+일',
         hdr["processDays"]),
        (r'(<div class="lab">2026 누적 하역</div>\s*<div class="val">)[\d,]+ MT',
         hdr["cumUnload"]),
    ]
    payload_json = json.dumps(d, ensure_ascii=False, separators=(",", ":"))
    new_html = html[: m.start(2)] + payload_json + html[m.end(2):]
    for pat, rep in replacements:
        # substitute through a callable so '$' and '\\' inside the values stay literal
        # (a plain replacement string would read them as regex escapes)
        new_html, n = re.subn(
            pat,
            lambda mm, rep=rep: (mm.group(1) if mm.lastindex else "") + rep,
            new_html,
            count=1,
        )
        if n != 1:
            fail(f"헤더 치환 실패: {pat}")

    print(f"\nseries {len(d['series'])}주 · last {date}")
    print(f"yearly[{year}]:", json.dumps(d["yearly"][str(year)], ensure_ascii=False))
    print(f"traderAnnual[{year}]:", json.dumps(ta, ensure_ascii=False))
    print("mismatch:", len(d["mismatch"]))
    if args.dry_run:
        print("(dry-run — 파일 미기록)")
        return
    args.html.write_text(new_html)
    print(f"✅ {args.html} 갱신 완료 — 다음: scripts/sync_bangkok_report.sh")


if __name__ == "__main__":
    main()
