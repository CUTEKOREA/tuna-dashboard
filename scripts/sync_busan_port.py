#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""부산 입출항선 동향 통합본 HTML -> 대시보드 JSON (port-intel).

해양수산3팀 주간 통합본(iframe srcdoc 4개: 허브·2026·2025·2024)에서
연도별 어기 DATA 를 추출해 /port-intel 위젯이 쓰는 경량 JSON 을 만든다.

- 이월 어기는 두 연도 문서에 중복 수록되므로 (선박, 입항일) 기준 중복 제거.
- 선장 실명은 출력하지 않는다 (개인정보 최소화 - 교대 여부 bool 만 유지).
- 체류 통계는 문서 표기(전체 포함 / 90일 초과 제외)와 같은 규칙으로 재계산.

사용: python3 scripts/sync_busan_port.py <통합본.html> [--output data/busan_port_calls.json]
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path

TYPES = ["연승", "선망", "북양"]


def mainscript(doc: str) -> str:
    return max(re.findall(r"<script[^>]*>(.*?)</script>", doc, re.S), key=len)


def extract_const(doc: str, name: str):
    match = re.search(rf"const {name} = (\[.*?\]);", mainscript(doc), re.S)
    return json.loads(match.group(1)) if match else []


def days_of(run: dict, asof: date):
    if run["arrive"] and run["depart"]:
        return (date.fromisoformat(run["depart"]) - date.fromisoformat(run["arrive"])).days
    if run["arrive"] and run.get("open"):
        return (asof - date.fromisoformat(run["arrive"])).days
    return None


def stay_stats(runs: list[dict]) -> dict:
    """문서 renderStay 와 동일 규칙: 출항 완료 + 체류 중 제외 + 365일 초과 상시 제외.
    avg = 전체 포함, avg90 = 90일 초과 제외."""
    done = sorted(r["days"] for r in runs
                  if r["depart"] and not r.get("open") and r["days"] is not None and r["days"] <= 365)
    capped = [d for d in done if d <= 90]

    def avg(values):
        return round(sum(values) / len(values)) if values else None

    def med(values):
        if not values:
            return None
        mid = len(values) // 2
        return values[mid] if len(values) % 2 else round((values[mid - 1] + values[mid]) / 2)

    return {
        "n": len(done),
        "avg": avg(done),
        "avg90": avg(capped),
        "med": med(done),
        "min": done[0] if done else None,
        "max": done[-1] if done else None,
        "long": len(done) - len(capped),
    }


def week_counts(data: list[dict], w0: date, w1: date):
    lo, hi = w0.isoformat(), w1.isoformat()
    ins = [c for c in data if c["first_report"] and lo <= c["first_report"] <= hi]
    outs = [c for c in data if c["depart"] and lo <= c["depart"] <= hi]
    return ins, outs, [c for c in outs if c["change"]]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", help="통합본 HTML 경로")
    parser.add_argument("--output", default="data/busan_port_calls.json")
    args = parser.parse_args()

    src = Path(args.source).read_text(encoding="utf-8")
    pairs = re.findall(r'title="([^"]+)" srcdoc="(.*?)"></iframe>', src, re.S)
    docs = {t: html.unescape(b) for t, b in pairs}
    if not {"허브", "2026", "2025", "2024"} <= set(docs):
        print("통합본 srcdoc 구성이 다릅니다 (허브·2026·2025·2024 필요)", file=sys.stderr)
        return 1

    years = sorted((int(t) for t in docs if t.isdigit()), reverse=True)
    asof = date.fromisoformat(re.search(r"기준일 <b>(\d{4}-\d{2}-\d{2})</b>", src).group(1))
    data_by_year = {y: extract_const(docs[str(y)], "DATA") for y in years}

    # 이월 중복 제거 (최신 연도 문서의 확정치 우선)
    seen: set[tuple[str, str]] = set()
    runs_by_year: dict[int, list[dict]] = {y: [] for y in years}
    for y in years:
        for c in data_by_year[y]:
            key = (c["ship"].replace(" ", ""), c["arrive"] or "")
            if key in seen:
                continue
            seen.add(key)
            run = {
                "ship": c["ship"],
                "co": c["company"],
                "type": c["type"],
                "arrive": c["arrive"],
                "depart": c["depart"],
                "open": bool(c.get("open")),
                "own": bool(c.get("own")),
                "change": bool(c.get("change")),
                "note": (c.get("note") or "").replace("—", "-"),
            }
            run["days"] = days_of(run, asof)
            run["carry"] = bool(c["arrive"] and int(c["arrive"][:4]) < y)
            runs_by_year[y].append(run)

    # 월별 입출항 (연도 문서 원본 행 기준 - 해당 연도 화면과 일치)
    monthly = {}
    for y in years:
        rows = []
        for m in range(1, 13):
            mk = f"{y}-{m:02d}"
            arrivals = [c for c in data_by_year[y] if c["arrive"] and c["arrive"][:7] == mk]
            departs = [c for c in data_by_year[y] if c["depart"] and c["depart"][:7] == mk]
            rows.append({
                "m": m,
                "i": len(arrivals),
                "o": len(departs),
                "iBy": [sum(1 for c in arrivals if c["type"] == t) for t in TYPES],
                "oBy": [sum(1 for c in departs if c["type"] == t) for t in TYPES],
            })
        monthly[str(y)] = rows

    latest = years[0]
    wk_in, wk_out, wk_chg = week_counts(data_by_year[latest], asof - timedelta(days=6), asof)
    pv_in, pv_out, pv_chg = week_counts(
        data_by_year[latest], asof - timedelta(days=13), asof - timedelta(days=7))

    # 허브 발표치 (대기 선장·입항 예상) - 신규 주장 생성 없이 문서 수치 재사용
    hub_txt = re.sub(r"<[^>]+>", " ", html.unescape(docs["허브"]))
    waiting = dict(zip([str(y) for y in sorted(years)],
                       map(int, re.search(r"대기 선장\s*(\d+)\s*(\d+)\s*(\d+)", hub_txt).groups())))
    fc = re.search(r"하반기 입항 예상\D*(\d+)\D*척\D*12월\D*(\d+)척", hub_txt)
    mails = re.search(r"주간 메일\s*(\d+)", hub_txt)

    def strip_capt(run: dict) -> dict:
        return {k: run[k] for k in
                ("ship", "co", "type", "arrive", "depart", "open", "own", "days", "carry", "note")}

    def year_rows(y: int) -> list[dict]:
        rows = []
        for c in data_by_year[y]:
            r = {"arrive": c["arrive"], "depart": c["depart"], "open": bool(c.get("open")),
                 "type": c["type"]}
            r["days"] = days_of(r, asof)
            rows.append(r)
        return rows

    stay_by_year = {str(y): {t: stay_stats([r for r in year_rows(y) if r["type"] == t])
                             for t in TYPES} for y in years}

    payload = {
        "asof": asof.isoformat(),
        "sourceNote": "타사 국내 입항선 동향 주간 메일 + 당사 실적 (해양수산3팀 취합)",
        "mailCount": int(mails.group(1)) if mails else None,
        "years": years,
        "kpi": {
            "runs": {str(y): len(data_by_year[y]) for y in years},
            "carry": {str(y): sum(1 for r in runs_by_year[y] if r["carry"]) for y in years},
            "byType": {str(y): {t: sum(1 for c in data_by_year[y] if c["type"] == t)
                                for t in TYPES} for y in years},
            "own": {str(y): sum(1 for c in data_by_year[y] if c.get("own")) for y in years},
            "changes": {str(y): sum(1 for c in data_by_year[y] if c.get("change")) for y in years},
            "openNow": sum(1 for r in runs_by_year[latest] if r["open"]),
            "waiting": waiting,
            "forecast": {"n": int(fc.group(1)), "dec": int(fc.group(2))} if fc else None,
        },
        "weekly": {
            "w0": (asof - timedelta(days=6)).isoformat(),
            "w1": asof.isoformat(),
            "in": [{"ship": c["ship"], "co": c["company"], "type": c["type"],
                    "arrive": c["arrive"], "own": bool(c.get("own"))} for c in wk_in],
            "out": [{"ship": c["ship"], "co": c["company"], "type": c["type"],
                     "depart": c["depart"],
                     "days": days_of({"arrive": c["arrive"], "depart": c["depart"]}, asof),
                     "change": bool(c.get("change")), "own": bool(c.get("own"))} for c in wk_out],
            "prev": {"in": len(pv_in), "out": len(pv_out), "chg": len(pv_chg)},
        },
        "monthly": monthly,
        "stay": stay_by_year,
        "timeline": sorted((strip_capt(r) for r in runs_by_year[latest]),
                           key=lambda r: r["arrive"] or ""),
    }

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    s26 = stay_by_year[str(latest)]
    print(f"OK {out_path} ({out_path.stat().st_size / 1024:.0f}KB) | 기준일 {asof} | "
          f"어기 {[len(data_by_year[y]) for y in years]} | 이번 주 {len(wk_in)}/{len(wk_out)}/{len(wk_chg)}")
    print("체류 sanity(연승 전체/90제외):", s26["연승"]["avg"], "/", s26["연승"]["avg90"],
          "- 문서 표기와 대조할 것")
    return 0


if __name__ == "__main__":
    sys.exit(main())
