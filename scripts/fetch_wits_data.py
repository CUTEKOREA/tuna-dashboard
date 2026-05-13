#!/usr/bin/env python3
"""
WITS Data Collector — Batch Pipeline
=====================================
Fetches tariff & trade flow data from WITS API and saves as local JSON fallback.
Designed for Silla Co. Intelligence Dashboard.

Usage:
  python3 scripts/fetch_wits_data.py [--commodity 참치] [--reporter 410] [--years 2020-2024]
  python3 scripts/fetch_wits_data.py --all  # Fetch all registered commodities

Architecture:
  WITS API → Parse XML/JSON → Save to data/wits/ → Dashboard reads as fallback

Author: Auto-generated for Silla Co. Dashboard
Date: 2026-05-13
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

# --- Configuration ---
WITS_BASE = "https://wits.worldbank.org/API/V1/SDMX/V21/datasource"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "wits"
TIMEOUT = 15  # seconds

# --- Silla Co. Core Commodities ---
COMMODITIES = {
    "tuna_yellowfin": {"hs6": "030342", "name_kr": "황다랑어", "name_en": "Yellowfin tuna, frozen"},
    "tuna_skipjack": {"hs6": "030343", "name_kr": "가다랑어", "name_en": "Skipjack, frozen"},
    "tuna_canned": {"hs6": "160414", "name_kr": "참치통조림", "name_en": "Tuna, prepared/preserved"},
    "hairtail": {"hs6": "030389", "name_kr": "갈치", "name_en": "Hairtail, frozen"},
    "mackerel": {"hs6": "030354", "name_kr": "고등어", "name_en": "Mackerel, frozen"},
    "pollack": {"hs6": "030363", "name_kr": "명태", "name_en": "Alaska pollack, frozen"},
    "salmon": {"hs6": "030214", "name_kr": "연어", "name_en": "Atlantic salmon, fresh"},
    "shrimp": {"hs6": "030617", "name_kr": "새우", "name_en": "Shrimp, frozen"},
    "squid": {"hs6": "030743", "name_kr": "오징어", "name_en": "Squid, frozen"},
    "garlic": {"hs6": "070320", "name_kr": "마늘", "name_en": "Garlic, fresh"},
    "carrot": {"hs6": "070610", "name_kr": "당근", "name_en": "Carrot, fresh"},
    "cashew": {"hs6": "080132", "name_kr": "캐슈넛", "name_en": "Cashew nuts, shelled"},
    "cocoa": {"hs6": "180100", "name_kr": "카카오", "name_en": "Cocoa beans"},
    "cassava": {"hs6": "071410", "name_kr": "카사바", "name_en": "Cassava"},
    "mangosteen": {"hs6": "081090", "name_kr": "망고스틴", "name_en": "Mangosteen"},
}

REPORTERS = {
    "KOR": "410",
    "CHN": "156",
    "USA": "842",
    "JPN": "392",
    "THA": "764",
    "VNM": "704",
    "IDN": "360",
    "NOR": "578",
    "RUS": "643",
}

INDICATORS = {
    "import_value": "MPRT-TRD-VL",
    "export_value": "XPRT-TRD-VL",
    "tariff_mfn": "MFN-WGHTD-AVRG",
    "tariff_ahs": "AHS-WGHTD-AVRG",
}


def fetch_wits(datasource: str, reporter: str, year: str, partner: str, product: str, indicator: str) -> list | None:
    """Fetch data from WITS SDMX endpoint."""
    url = f"{WITS_BASE}/{datasource}/reporter/{reporter}/year/{year}/partner/{partner}/product/{product}/indicator/{indicator}"
    
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/xml"})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            data = resp.read().decode("utf-8")
        
        # Parse XML for ObsValue
        results = []
        try:
            root = ET.fromstring(data)
            ns = {
                "generic": "http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic",
                "message": "http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message",
            }
            for obs in root.findall(".//generic:Obs", ns):
                obs_val = obs.find("generic:ObsValue", ns)
                obs_dim = obs.find(".//generic:Value[@id='TIME_PERIOD']", ns)
                if obs_val is not None and obs_dim is not None:
                    results.append({
                        "year": obs_dim.get("value"),
                        "value": float(obs_val.get("value", "0")),
                    })
        except ET.ParseError:
            # Try simple regex
            import re
            vals = re.findall(r'ObsValue value="([^"]+)"', data)
            yrs = re.findall(r'Value id="TIME_PERIOD" value="([^"]+)"', data)
            for y, v in zip(yrs, vals):
                results.append({"year": y, "value": float(v)})
        
        return results if results else None
        
    except urllib.error.HTTPError as e:
        print(f"  ⚠️  HTTP {e.code}: {url[:80]}...")
        return None
    except urllib.error.URLError as e:
        print(f"  ❌ Network error: {e.reason}")
        return None
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None


def fetch_commodity_data(commodity_key: str, reporter_code: str = "410", years: list[str] = None):
    """Fetch all indicators for a single commodity-reporter pair."""
    if years is None:
        years = ["2020", "2021", "2022", "2023", "2024"]
    
    commodity = COMMODITIES[commodity_key]
    hs6 = commodity["hs6"]
    
    result = {
        "commodity": commodity_key,
        "hsCode": hs6,
        "nameKR": commodity["name_kr"],
        "nameEN": commodity["name_en"],
        "reporter": reporter_code,
        "fetchedAt": datetime.now().isoformat(),
        "apiStatus": "pending",
        "tariff": {},
        "tradeFlow": [],
    }
    
    print(f"\n📊 Fetching: {commodity['name_kr']} ({hs6}) → Reporter {reporter_code}")
    
    # 1) Tariff data (latest year)
    latest_year = years[-1]
    for indicator_name, indicator_code in [("tariff_mfn", "MFN-WGHTD-AVRG"), ("tariff_ahs", "AHS-WGHTD-AVRG")]:
        print(f"  🔍 {indicator_name} for {latest_year}...", end=" ")
        data = fetch_wits("tradestats-tariff", reporter_code, latest_year, "000", hs6, indicator_code)
        if data:
            result["tariff"][indicator_name] = data
            result["apiStatus"] = "live"
            print(f"✅ {len(data)} records")
        else:
            print("❌ No data")
        time.sleep(0.5)  # Rate limit
    
    # 2) Trade flow data (multi-year)
    for year in years:
        year_data = {"year": year}
        for indicator_name, indicator_code in [("import_value", "MPRT-TRD-VL"), ("export_value", "XPRT-TRD-VL")]:
            print(f"  🔍 {indicator_name} {year}...", end=" ")
            data = fetch_wits("tradestats-trade", reporter_code, year, "ALL", hs6, indicator_code)
            if data:
                year_data[indicator_name] = data[0]["value"] if data else 0
                result["apiStatus"] = "live"
                print(f"✅ {data[0]['value']}")
            else:
                year_data[indicator_name] = None
                print("❌")
            time.sleep(0.3)
        result["tradeFlow"].append(year_data)
    
    if result["apiStatus"] != "live":
        result["apiStatus"] = "fallback_needed"
    
    return result


def save_result(result: dict, output_dir: Path = OUTPUT_DIR):
    """Save fetched data to JSON file."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    filename = f"wits_{result['commodity']}_{result['reporter']}.json"
    filepath = output_dir / filename
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"  💾 Saved: {filepath}")
    return filepath


def run_full_pipeline():
    """Run the complete WITS data collection pipeline."""
    print("=" * 60)
    print("🌐 WITS Data Collection Pipeline")
    print(f"📅 Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Core commodities for Korea (Reporter = 410)
    core_commodities = [
        "tuna_yellowfin", "tuna_skipjack", "tuna_canned",
        "hairtail", "mackerel", "pollack",
        "salmon", "shrimp", "squid",
        "garlic", "cashew", "cassava",
    ]
    
    results_summary = []
    
    for commodity_key in core_commodities:
        try:
            result = fetch_commodity_data(commodity_key, "410")
            filepath = save_result(result)
            results_summary.append({
                "commodity": commodity_key,
                "status": result["apiStatus"],
                "tariff_records": len(result.get("tariff", {})),
                "trade_records": len(result.get("tradeFlow", [])),
                "file": str(filepath),
            })
        except Exception as e:
            print(f"  ❌ Failed: {commodity_key} — {e}")
            results_summary.append({
                "commodity": commodity_key,
                "status": "error",
                "error": str(e),
            })
        
        time.sleep(1)  # Rate limit between commodities
    
    # Save summary
    summary = {
        "pipeline": "WITS Data Collector v1.0",
        "executedAt": datetime.now().isoformat(),
        "reporter": "410 (Korea)",
        "totalCommodities": len(core_commodities),
        "results": results_summary,
    }
    
    summary_path = OUTPUT_DIR / "wits_collection_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print("📋 Pipeline Summary")
    print("=" * 60)
    
    live_count = sum(1 for r in results_summary if r.get("status") == "live")
    fallback_count = sum(1 for r in results_summary if r.get("status") == "fallback_needed")
    error_count = sum(1 for r in results_summary if r.get("status") == "error")
    
    print(f"  ✅ Live API: {live_count}")
    print(f"  🟡 Fallback needed: {fallback_count}")
    print(f"  ❌ Errors: {error_count}")
    print(f"  💾 Summary: {summary_path}")
    print("=" * 60)


def run_single(commodity: str, reporter: str = "410", years: list[str] = None):
    """Run pipeline for a single commodity."""
    # Try exact match first
    if commodity in COMMODITIES:
        result = fetch_commodity_data(commodity, reporter, years)
        save_result(result)
        return
    
    # Try Korean name match
    for key, data in COMMODITIES.items():
        if data["name_kr"] == commodity:
            result = fetch_commodity_data(key, reporter, years)
            save_result(result)
            return
    
    # Try HS code match
    for key, data in COMMODITIES.items():
        if data["hs6"] == commodity:
            result = fetch_commodity_data(key, reporter, years)
            save_result(result)
            return
    
    print(f"❌ Unknown commodity: {commodity}")
    print(f"Available: {', '.join(COMMODITIES.keys())}")


if __name__ == "__main__":
    args = sys.argv[1:]
    
    if "--all" in args:
        run_full_pipeline()
    elif "--commodity" in args:
        idx = args.index("--commodity")
        commodity = args[idx + 1] if idx + 1 < len(args) else None
        reporter = "410"
        years = None
        
        if "--reporter" in args:
            r_idx = args.index("--reporter")
            reporter = args[r_idx + 1] if r_idx + 1 < len(args) else "410"
        
        if "--years" in args:
            y_idx = args.index("--years")
            year_range = args[y_idx + 1] if y_idx + 1 < len(args) else "2020-2024"
            start, end = year_range.split("-")
            years = [str(y) for y in range(int(start), int(end) + 1)]
        
        if commodity:
            run_single(commodity, reporter, years)
        else:
            print("❌ --commodity requires a value")
    else:
        print("WITS Data Collector")
        print("Usage:")
        print("  python3 scripts/fetch_wits_data.py --all")
        print("  python3 scripts/fetch_wits_data.py --commodity 참치 [--reporter 410] [--years 2020-2024]")
        print("  python3 scripts/fetch_wits_data.py --commodity tuna_yellowfin")
        print(f"\nAvailable commodities ({len(COMMODITIES)}):")
        for key, data in COMMODITIES.items():
            print(f"  {key:20s} {data['hs6']}  {data['name_kr']:6s}  {data['name_en']}")
