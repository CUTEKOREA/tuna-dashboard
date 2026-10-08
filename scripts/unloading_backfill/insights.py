"""본선별 하역결과·SIZING·LOGSHEET 추출물을 묶어 분석용 요약을 만든다.

    python scripts/unloading_backfill/insights.py

항차 합계가 최종 하역결과 실측과 ±0.05 MT 로 맞는 항차만 쓴다(일부 문서가 빠진 항차는 제외).
출력: artifacts/unloading_backfill/insights.json
"""
import collections
import json
import math
import re
import statistics
import sys
import unicodedata
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / "artifacts/unloading_backfill"
OUT = ART / "insights.json"
MATCH_TOL = 0.05
LARGE = {"SJ": ("7.5 LBS UP", "+7.5LBS"), "YF": ("20 LBS UP", "+20LBS", "10 KGS UP"), "BET": ("20 LBS UP", "+20LBS")}
PORTS = {"RABAUL": "RABAUL", "RABUAL": "RABAUL", "TARAWA": "TARAWA", "HONIARA": "HONIARA", "CHRISTMAS": "CHRISTMAS",
         "CHISTMAS": "CHRISTMAS", "FUNAFUTI": "FUNAFUTI", "POHNPEI": "POHNPEI"}


def nfc(s):
    return unicodedata.normalize("NFC", str(s))


def final_actuals():
    rows = json.loads((ART / "history_compare.json").read_text())["rows"]
    return {nfc(r["folder"]): r["ext_actual"] for r in rows if r.get("ext_actual")}


def vessel_key(name):
    s = re.sub(r"^(F/V|M/V)\s*", "", nfc(name).upper()).strip()
    return re.sub(r"\s*(MR-?\d+.*|\(.*\))$", "", s).strip()


def port_key(area):
    first = area.upper().split(",")[0]
    for k, v in PORTS.items():
        if k in first:
            return v
    return "KIRIBATI(미상)" if "KIRIBATI" in first else first.strip()


def matched(folders_sum, actual):
    return {k for k, v in folders_sum.items() if k in actual and abs(v - actual[k]) <= MATCH_TOL}


def results_section(actual):
    docs = json.loads((ART / "results_parsed.json").read_text())["documents"]
    sums = collections.defaultdict(float)
    for d in docs:
        sums[d["folder"]] += d["total"]["actual"]
    good = matched(sums, actual)
    use = [d for d in docs if d["folder"] in good and d["total"]["reported"] > 0]

    by_vessel = collections.defaultdict(lambda: {"transfers": 0, "reported": 0.0, "actual": 0.0})
    for d in use:
        v = by_vessel[vessel_key(d["fishing_vessel"])]
        v["transfers"] += 1
        v["reported"] += d["total"]["reported"]
        v["actual"] += d["total"]["actual"]
    vessels = sorted(({"vessel": k, **v, "variance_pct": round(100 * (v["actual"] - v["reported"]) / v["reported"], 2)}
                      for k, v in by_vessel.items()), key=lambda x: x["variance_pct"])

    ports = collections.Counter()
    lead = collections.defaultdict(list)
    brine_boat, brine_port = [], []
    for d in use:
        ports[port_key(d["area"])] += d["total"]["actual"]
        if d["transfer_end"] and d["unloading_start"]:
            days = (date.fromisoformat(d["unloading_start"]) - date.fromisoformat(d["transfer_end"])).days
            if days >= 0:
                lead[d["unloading_start"][:4]].append(days)
        if d["brine_fishing_boat"]:
            brine_boat.append(max(d["brine_fishing_boat"]))
        if d["brine_port_loading"]:
            brine_port.append(max(d["brine_port_loading"]))
    total = sum(ports.values())
    return {
        "voyages": len(good), "documents": len(use),
        "vessels": vessels,
        "transfer_ports": [{"port": k, "actual_mt": round(v, 3), "share_pct": round(100 * v / total, 1)}
                           for k, v in ports.most_common()],
        "transfer_to_unloading_days": {y: {"median": statistics.median(v), "min": min(v), "max": max(v), "n": len(v)}
                                       for y, v in sorted(lead.items())},
        "brine_warmest_c": {"fishing_boat_median": statistics.median(brine_boat) if brine_boat else None,
                            "port_loading_median": statistics.median(brine_port) if brine_port else None,
                            "n": len(brine_boat)},
    }


def sizing_docs():
    sap = json.loads((ART / "sizing_sap.json").read_text())["documents"]
    out = [{"folder": "/".join(d["folder"].split("/")[:2]), "year": (d["discharge_start"] or "")[:4],
            "lines": [(x["species"], x["grade"], x["mt"]) for x in d["lines"]], "total": d["total_mt"]}
           for d in sap if not d["problems"]]
    for f in (ART / "sizing_vision").glob("*.json"):
        rec = json.loads(f.read_text())
        if rec["validation_errors"]:
            continue
        folder = "/".join(rec["source_file"].split("/")[:2])
        for r in rec["extracted"]["reports"]:
            k = 0.001 if r.get("unit") == "kg" else 1.0
            out.append({"folder": folder, "year": (r.get("date") or "")[:4] or folder[:4],
                        "lines": [(x["species"], x["grade"], x["amount"] * k) for x in r["lines"]],
                        "total": r["grand_total"] * k})
    return out


def is_large(species, grade):
    g = grade.upper()
    return any(t in g for t in LARGE.get(species, ()))


def sizing_section(actual):
    docs = sizing_docs()
    sums = collections.defaultdict(float)
    for d in docs:
        sums[d["folder"]] += d["total"]
    good = matched(sums, actual)
    by_year = collections.defaultdict(lambda: collections.defaultdict(lambda: [0.0, 0.0]))
    for d in docs:
        if d["folder"] not in good:
            continue
        year = d["folder"][:4]
        for sp, grade, mt in d["lines"]:
            if sp in LARGE:
                cell = by_year[year][sp]
                cell[1] += mt
                if is_large(sp, grade):
                    cell[0] += mt
    years = {y: {sp: {"large_mt": round(a, 3), "total_mt": round(t, 3), "large_pct": round(100 * a / t, 1) if t else None}
                 for sp, (a, t) in sorted(v.items())} for y, v in sorted(by_year.items())}
    voyages_by_year = collections.Counter(f[:4] for f in good)
    return {"voyages": len(good), "folders_with_sizing": len(sums), "large_share_by_year": years,
            "voyages_by_year": dict(sorted(voyages_by_year.items()))}


SCHOOL_GROUPS = {1: "unassociated", 4: "drifting_fad", 3: "log", 5: "anchored_fad"}


def logsheet_rows():
    from batch_logsheet import as_rows
    best = {}
    for f in (ART / "logsheet").glob("*.json"):
        rec = json.loads(f.read_text())
        if rec["validation_errors"]:
            continue
        for s in rec["extracted"].get("logsheets") or []:
            key = (vessel_key(s.get("vessel") or ""), re.sub(r"\s+", " ", str(s.get("departure_utc") or "")).upper())
            rows = as_rows(s.get("days") or [])
            if key not in best or len(rows) > len(best[key][1]):
                best[key] = (s, rows)
    return best


VESSEL_ALIASES = {"PIONEER": "SHILLA PIONEER"}
COORD = re.compile(r"(\d{1,3})\s*[-°º ]\s*(\d{1,2}(?:\.\d+)?)\s*'?\s*([NSEW])")


def coord(text, limit):
    m = COORD.search(str(text or "").upper())
    if not m:
        return None
    deg, minutes, hemi = int(m.group(1)), float(m.group(2)), m.group(3)
    if minutes >= 60 or deg > limit:
        return None
    value = deg + minutes / 60
    return -value if hemi in "SW" else value


def position(row):
    """(lat, lon east 0–360) inside the western/central Pacific purse-seine area, else None."""
    lat, lon = coord(row.get("lat"), 90), coord(row.get("lon"), 180)
    if lat is None or lon is None:
        return None
    lon %= 360
    return (lat, lon) if -25 <= lat <= 25 and 120 <= lon <= 220 else None


def set_rows():
    """Every fishing set (activity code 1) with its calendar year, vessel and catch (MT)."""
    for s, rows in logsheet_rows().values():
        dep_year = re.search(r"(20\d{2})", str(s.get("departure_utc") or ""))
        year = int(dep_year.group(1)) if dep_year else s.get("year")
        months = [r.get("month") for r in rows if isinstance(r.get("month"), int)]
        if not isinstance(year, int) or not months:
            continue
        key = vessel_key(s.get("vessel") or "")
        vessel = VESSEL_ALIASES.get(key, key)
        first_month = months[0]
        for r in rows:
            if r.get("activity_code") != 1:
                continue
            month = r.get("month") if isinstance(r.get("month"), int) else first_month
            catch = sum(r.get(k) or 0 for k in ("skj", "yft", "bet"))
            yield (year + 1 if month < first_month else year), vessel, r, catch


def logsheet_section():
    sets = list(set_rows())
    by_year = collections.defaultdict(lambda: {"sets": 0, "catch": 0.0, **{g: 0.0 for g in SCHOOL_GROUPS.values()}, "other": 0.0})
    grounds = collections.defaultdict(lambda: [0, 0.0])
    eff = collections.defaultdict(lambda: {"sets": 0, "positive": 0, "catch": 0.0})
    school_eff = collections.defaultdict(lambda: {"sets": 0, "positive": 0, "catch": 0.0})
    for y, vessel, r, catch in sets:
        e = eff[(vessel, y)]
        e["sets"] += 1
        se = school_eff[(y, SCHOOL_GROUPS.get(r.get("school_code"), "other"))]
        se["sets"] += 1
        se["catch"] += catch
        if catch <= 0:
            continue
        se["positive"] += 1
        e["positive"] += 1
        e["catch"] += catch
        cell = by_year[y]
        cell["sets"] += 1
        cell["catch"] += catch
        cell[SCHOOL_GROUPS.get(r.get("school_code"), "other")] += catch
        pos = position(r)
        if pos:
            g = grounds[(y, math.floor(pos[0]) + 0.5, math.floor(pos[1]) + 0.5)]
            g[0] += 1
            g[1] += catch
    return {
        "logsheets": len(logsheet_rows()),
        "by_year": {y: {"sets": v["sets"], "catch_mt": round(v["catch"], 1),
                        **{f"{g}_pct": round(100 * v[g] / v["catch"], 1) for g in (*SCHOOL_GROUPS.values(), "other")}}
                    for y, v in sorted(by_year.items())},
        "grounds": [{"year": y, "lat": la, "lon": lo, "sets": n, "catch_mt": round(c, 1)}
                    for (y, la, lo), (n, c) in sorted(grounds.items())],
        "efficiency": [{"vessel": v, "year": y, "sets": e["sets"], "positive_sets": e["positive"],
                        "catch_mt": round(e["catch"], 1)} for (v, y), e in sorted(eff.items())],
        "school_efficiency": [{"year": y, "school": g, "sets": e["sets"], "positive_sets": e["positive"],
                               "catch_mt": round(e["catch"], 1)}
                              for (y, g), e in sorted(school_eff.items())],
    }


PORT_NAMES = {"RABAUL": "라바울(파푸아뉴기니)", "FUNAFUTI": "푸나푸티(투발루)", "TARAWA": "타라와(키리바시)",
              "HONIARA": "호니아라(솔로몬제도)", "CHRISTMAS": "크리스마스섬(키리바시)", "POHNPEI": "폰페이(미크로네시아)",
              "KIRIBATI(미상)": "키리바시(항구 미기재)"}
MIN_TRANSFERS = 5
MIN_SETS = 100
MIN_SIZING_VOYAGES = 5
MIN_VESSEL_SETS = 40
MIN_SCHOOL_SETS = 50


def per_set(catch, sets):
    return round(catch / sets, 1)


def zero_pct(positive, sets):
    return round(100 * (1 - positive / sets), 1)


def dashboard_payload(data, sync_date):
    r, s, lg = data["results"], data["sizing"], data["logsheet"]
    return {
        "schemaVersion": "1.1.0",
        "snapshotStatus": "SYNCED",
        "syncDate": sync_date,
        "coverage": {"resultsVoyages": r["voyages"], "resultsTransfers": r["documents"],
                     "sizingVoyages": s["voyages"], "logsheets": lg["logsheets"]},
        "vessels": [{"vessel": v["vessel"], "transfers": v["transfers"], "reportedMt": round(v["reported"], 3),
                     "actualMt": round(v["actual"], 3), "variancePct": v["variance_pct"]}
                    for v in sorted(r["vessels"], key=lambda x: -x["variance_pct"]) if v["transfers"] >= MIN_TRANSFERS],
        "transferPorts": [{"port": p["port"], "nameKo": PORT_NAMES.get(p["port"], p["port"]),
                           "actualMt": round(p["actual_mt"], 1), "sharePct": p["share_pct"]} for p in r["transfer_ports"]],
        "leadDays": [{"year": int(y), "medianDays": v["median"], "transfers": v["n"]}
                     for y, v in r["transfer_to_unloading_days"].items()],
        "sizing": [{"year": int(y), "voyages": s["voyages_by_year"].get(y, 0),
                    "species": [{"species": sp, "largePct": c["large_pct"], "totalMt": round(c["total_mt"], 1)}
                                for sp, c in v.items() if c["large_pct"] is not None]}
                   for y, v in s["large_share_by_year"].items() if s["voyages_by_year"].get(y, 0) >= MIN_SIZING_VOYAGES],
        "schools": [{"year": int(y), "sets": v["sets"], "catchMt": v["catch_mt"],
                     "unassociatedPct": v["unassociated_pct"], "driftingFadPct": v["drifting_fad_pct"],
                     "otherPct": round(v["log_pct"] + v["anchored_fad_pct"] + v["other_pct"], 1)}
                    for y, v in lg["by_year"].items() if v["sets"] >= MIN_SETS],
        "grounds": [{"year": int(y), "cells": [[c["lat"], c["lon"], c["sets"], c["catch_mt"]]
                                               for c in lg["grounds"] if c["year"] == y]}
                    for y, v in lg["by_year"].items() if v["sets"] >= MIN_SETS],
        "efficiency": [{"vessel": e["vessel"], "year": e["year"], "sets": e["sets"],
                        "catchPerSet": per_set(e["catch_mt"], e["sets"]), "zeroSetPct": zero_pct(e["positive_sets"], e["sets"])}
                       for e in lg["efficiency"] if e["sets"] >= MIN_VESSEL_SETS],
        "schoolEfficiency": [{"year": e["year"], "school": e["school"], "sets": e["sets"],
                              "catchPerSet": per_set(e["catch_mt"], e["sets"]),
                              "zeroSetPct": zero_pct(e["positive_sets"], e["sets"])}
                             for e in lg["school_efficiency"]
                             if e["school"] in ("unassociated", "drifting_fad") and e["sets"] >= MIN_SCHOOL_SETS],
    }


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--export", type=Path, help="대시보드 정적 JSON 경로")
    ap.add_argument("--sync-date", default=date.today().isoformat())
    args = ap.parse_args()
    actual = final_actuals()
    data = {"results": results_section(actual), "sizing": sizing_section(actual), "logsheet": logsheet_section()}
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    if args.export:
        text = json.dumps(dashboard_payload(data, args.sync_date), ensure_ascii=False, indent=1)
        text = re.sub(r"\[\s+([-\d.]+(?:,\s+[-\d.]+)*)\s+\]",
                      lambda m: "[" + ", ".join(x.strip() for x in m.group(1).split(",")) + "]", text)
        args.export.write_text(text + "\n", encoding="utf-8")
        print(f"내보냄: {args.export}")
    r, s = data["results"], data["sizing"]
    print(f"[본선별 결과] 항차 {r['voyages']} · 문서 {r['documents']}")
    for v in r["vessels"]:
        if v["transfers"] >= 5:
            print(f"  {v['vessel']:18s} {v['transfers']:3d}회 보고 {v['reported']:9,.0f} 실측 {v['actual']:10,.1f} {v['variance_pct']:+.2f}%")
    print("  환적항:", ", ".join(f"{p['port']} {p['share_pct']}%" for p in r["transfer_ports"]))
    print("  환적→하역 일수:", {y: v["median"] for y, v in r["transfer_to_unloading_days"].items()})
    print("  염수 최고온도 중앙값(본선/항구 적재):", r["brine_warmest_c"])
    print(f"[사이즈] 합계 일치 항차 {s['voyages']} / SIZING 있는 폴더 {s['folders_with_sizing']}")
    for y, v in s["large_share_by_year"].items():
        print(f"  {y}: " + " · ".join(f"{sp} 대형 {c['large_pct']}% ({c['total_mt']:,.0f} MT)" for sp, c in v.items()))
    lg = data["logsheet"]
    print(f"[LOGSHEET] 일지 {lg['logsheets']}")
    for y, v in lg["by_year"].items():
        print(f"  {y}: 투망 {v['sets']} · {v['catch_mt']:,.0f} MT · 자유군 {v['unassociated_pct']}% · 표류FAD {v['drifting_fad_pct']}% · 유목 {v['log_pct']}% · 기타 {v['other_pct']}%")


if __name__ == "__main__":
    main()
