#!/usr/bin/env python3
"""agri_data → tuna-dashboard 위젯 JSON 변환기 (공유 추출 라이브러리).

agri_data/_pipeline/registry/commodities.json 의 category·hs6 를 재활용해 각 품목의
processed_data/{comtrade,customs_kr,kamis,fred} CSV를 읽고, 위젯이 쓰는 지표를 추출한다.

원칙(정직성): 모든 수치는 agri_data 행에서 도출. 추정/하드코딩 없음.
출처 라벨은 호출부가 widget JSON의 telemetry/source/syncDate에 기록.
"""
from __future__ import annotations
import csv
import json
import os
from collections import defaultdict
from pathlib import Path

AGRI = Path(os.environ.get("AGRI_DATA")
            or "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/agri_data")
_REG = None

# dashboard 이름 → agri_data 이름 (명칭 차이)
NAME_MAP = {"galchi": "hairtail"}


def registry() -> dict:
    global _REG
    if _REG is None:
        p = AGRI / "_pipeline" / "registry" / "commodities.json"
        _REG = json.loads(p.read_text(encoding="utf-8")).get("commodities", {})
    return _REG


def agri_name(name: str) -> str:
    return NAME_MAP.get(name, name)


def commodity_dir(name: str) -> Path:
    a = agri_name(name)
    cat = registry().get(a, {}).get("category", "")
    return AGRI / cat / a


def hs6(name: str) -> list[str]:
    return [str(x) for x in registry().get(agri_name(name), {}).get("hs6", [])]


def _fnum(x) -> float:
    try:
        return float(str(x).replace(",", "") or 0)
    except (ValueError, TypeError):
        return 0.0


def load(name: str, source: str) -> list[dict]:
    """Load a commodity's processed CSV rows for a source (comtrade/customs_kr/kamis/fred)."""
    d = commodity_dir(name) / "processed_data" / source
    if not d.exists():
        return []
    files = sorted(d.glob(f"{agri_name(name)}_{source}_*.csv")) or sorted(d.glob("*.csv"))
    if not files:
        return []
    with open(files[0], encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


# ---------- Comtrade (global trade) ----------
def comtrade_years(name: str) -> list[int]:
    yrs = {int(r["refYear"]) for r in load(name, "comtrade") if str(r.get("refYear", "")).isdigit()}
    return sorted(yrs)


def comtrade_agg(name: str, flow: str = "Import", partner: str = "World",
                 year: int | None = None, hs_codes: list[str] | None = None) -> dict:
    """Aggregate primaryValue + netWgt by reporter (summing across cmdCodes).

    CRITICAL: Comtrade returns rows broken down by mode-of-transport (motCode).
    motCode='0' is the TOTAL (all modes); motCode 1000/2100/3200 are air/sea/land
    sub-rows. We must count ONLY motCode='0', else the breakdown double/triple-counts
    (observed: Spain squid $6.4B vs real ~$1.6B). partner2/customsCode default rows
    only. If a (reporter,cmd,year) lacks a motCode='0' row, fall back to its sub-rows.
    """
    rows = load(name, "comtrade")
    has_mot0 = set()
    for r in rows:
        if str(r.get("motCode", "")) == "0":
            has_mot0.add((r.get("reporterISO"), r.get("cmdCode"), str(r.get("refYear"))))

    agg: dict = defaultdict(lambda: {"value": 0.0, "weight": 0.0, "desc": ""})
    for r in rows:
        if not r.get("flowDesc", "").startswith(flow):
            continue
        if partner and r.get("partnerDesc") != partner:
            continue
        if year is not None and str(r.get("refYear")) != str(year):
            continue
        if hs_codes and r.get("cmdCode") not in hs_codes:
            continue
        if not _is_total_row(r, has_mot0):
            continue
        k = r.get("reporterISO") or r.get("reporterDesc") or "?"
        agg[k]["value"] += _fnum(r.get("primaryValue"))
        agg[k]["weight"] += _fnum(r.get("netWgt"))
        agg[k]["desc"] = r.get("reporterDesc", "")
    return agg


def _is_total_row(r: dict, has_mot0: set) -> bool:
    """Count a Comtrade row only if it is the TOTAL on every breakdown dimension.

    Comtrade returns sub-rows broken down by mode-of-transport (motCode), second
    partner (partner2), and customs procedure (customsCode). Summing them double/
    triple-counts. The grand-total row has motCode='0', partner2 'World'/'0',
    customsCode 'C00'. We keep only those. (motCode has a fallback: if no '0' total
    exists for a (reporter,cmd,year) slice we accept its sub-rows.)
    """
    cus = str(r.get("customsCode", ""))
    if cus not in ("C00", "TOTAL", ""):
        return False
    p2c = str(r.get("partner2Code", ""))
    p2d = str(r.get("partner2Desc", ""))
    if p2c not in ("0", "") and p2d not in ("World", ""):
        return False
    mot = str(r.get("motCode", ""))
    key3 = (r.get("reporterISO"), r.get("cmdCode"), str(r.get("refYear")))
    if key3 in has_mot0 and mot != "0":
        return False
    return True


def top_reporters(name: str, flow: str = "Import", n: int = 10,
                  year: int | None = None, hs_codes: list[str] | None = None) -> list[dict]:
    if year is None:
        ys = comtrade_years(name)
        year = ys[-1] if ys else None
    agg = comtrade_agg(name, flow, "World", year, hs_codes)
    items = sorted(agg.items(), key=lambda kv: -kv[1]["value"])
    total = sum(v["value"] for v in agg.values()) or 1.0
    out = []
    for iso, v in items[:n]:
        out.append({
            "iso": iso, "country": v["desc"],
            "value_usd": round(v["value"]),
            "weight_kg": round(v["weight"]),
            "unit_price_usd_kg": round(v["value"] / v["weight"], 2) if v["weight"] else None,
            "share_pct": round(100 * v["value"] / total, 1),
            "year": year,
        })
    return out


def reporter_value(name: str, reporter_iso: str, flow: str = "Import",
                   year: int | None = None, hs_codes: list[str] | None = None) -> dict:
    if year is None:
        ys = comtrade_years(name)
        year = ys[-1] if ys else None
    agg = comtrade_agg(name, flow, "World", year, hs_codes)
    v = agg.get(reporter_iso, {"value": 0.0, "weight": 0.0, "desc": reporter_iso})
    total = sum(x["value"] for x in agg.values()) or 1.0
    return {"iso": reporter_iso, "value_usd": round(v["value"]), "weight_kg": round(v["weight"]),
            "share_pct": round(100 * v["value"] / total, 1), "year": year}


# ---------- 관세청 customs_kr (Korea trade) ----------
def customs_korea_by_country(name: str, flow: str = "imp") -> list[dict]:
    """Korea import(imp)/export(exp) by partner country, summed over months & HS."""
    rows = load(name, "customs_kr")
    agg: dict = defaultdict(lambda: {"dlr": 0.0, "wgt": 0.0, "name": ""})
    dlr_f = "impDlr" if flow == "imp" else "expDlr"
    wgt_f = "impWgt" if flow == "imp" else "expWgt"
    for r in rows:
        cc = r.get("statCd", "")
        if not cc or cc == "-":  # skip TOTAL row
            continue
        agg[cc]["dlr"] += _fnum(r.get(dlr_f))
        agg[cc]["wgt"] += _fnum(r.get(wgt_f))
        agg[cc]["name"] = r.get("statCdCntnKor1") or r.get("statKor", "")
    total = sum(v["dlr"] for v in agg.values()) or 1.0
    out = [{"code": cc, "country": v["name"], "value_usd": round(v["dlr"]),
            "weight_kg": round(v["wgt"]), "share_pct": round(100 * v["dlr"] / total, 1)}
           for cc, v in agg.items()]
    out.sort(key=lambda x: -x["value_usd"])
    return out


def customs_months(name: str) -> list[str]:
    return sorted({r.get("period", "") for r in load(name, "customs_kr") if r.get("period")})


# ---------- KAMIS (domestic price) ----------
def kamis_series(name: str, cls: str | None = None) -> list[dict]:
    rows = load(name, "kamis")
    out = []
    for r in rows:
        if cls and r.get("productclscode") != cls:
            continue
        out.append({"date": r.get("period"), "price": _fnum(r.get("price")),
                    "cls": r.get("productclscode"), "kind": r.get("kindname", "")})
    out.sort(key=lambda x: x["date"] or "")
    return out


# ---------- Comtrade MIRROR (non-reporter trade) ----------
def mirror_country(name: str, partner_iso: str, flow: str = "Export",
                   year: int | None = None) -> dict | None:
    """Derive a non-reporting country's trade from partners' mirror reports.

    country EXPORT ≈ Σ (all reporters' Import with partner=country)
    country IMPORT ≈ Σ (all reporters' Export with partner=country)
    Uses motCode='0' dedup. partner_iso is the ISO3 (e.g. 'CHN','THA','RUS','VNM').
    Returns {value_usd, weight_kg, year, n_reporters} or None if no mirror data.
    """
    rows = load(name, "comtrade_mirror")
    if not rows:
        return None
    target_flow = "Import" if flow == "Export" else "Export"
    if year is None:
        ys = {int(r["refYear"]) for r in rows if str(r.get("refYear", "")).isdigit()}
        year = max(ys) if ys else None
    has0 = set()
    for r in rows:
        if str(r.get("motCode", "")) == "0":
            has0.add((r.get("reporterISO"), r.get("cmdCode"),
                      r.get("partnerISO"), str(r.get("refYear"))))
    val = wt = 0.0
    reps: set = set()
    for r in rows:
        if (r.get("partnerISO") or "") != partner_iso:
            continue
        if not r.get("flowDesc", "").startswith(target_flow):
            continue
        if str(r.get("refYear")) != str(year):
            continue
        key = (r.get("reporterISO"), r.get("cmdCode"), r.get("partnerISO"), str(r.get("refYear")))
        if key in has0 and str(r.get("motCode", "")) != "0":
            continue
        val += _fnum(r.get("primaryValue"))
        wt += _fnum(r.get("netWgt"))
        reps.add(r.get("reporterISO"))
    return {"value_usd": round(val), "weight_kg": round(wt),
            "year": year, "n_reporters": len(reps)}


def mirror_partners_available(name: str) -> list[str]:
    """Distinct partner ISO3 present in the mirror CSV (which non-reporters we captured)."""
    rows = load(name, "comtrade_mirror")
    return sorted({r.get("partnerISO") for r in rows if r.get("partnerISO")})


# ---------- CLI: quick inspection ----------
if __name__ == "__main__":
    import sys
    name = sys.argv[1] if len(sys.argv) > 1 else "squid"
    print(f"# {name}  agri_dir={commodity_dir(name)}")
    print(f"comtrade years: {comtrade_years(name)}  hs6={hs6(name)}")
    print("Top5 importers:", json.dumps(top_reporters(name, 'Import', 5), ensure_ascii=False))
    print("Top5 exporters:", json.dumps(top_reporters(name, 'Export', 5), ensure_ascii=False))
    print("customs months:", customs_months(name))
    print("Korea import top5:", json.dumps(customs_korea_by_country(name, 'imp')[:5], ensure_ascii=False))
