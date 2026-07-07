#!/usr/bin/env python3
"""
3개년(2024-2026) 위판장별 위탁판매 현황 데이터 수집기
해양수산부 공공데이터 API → JSON 집계 파일 생성

API 제약:
  - numOfRows 최대 100
  - baseDt 파라미터 (YYYYMMDD) 필수
  - SSL self-signed cert → 검증 우회 필요
"""

import json
import time
import ssl
import urllib.request
from collections import defaultdict
from pathlib import Path

SERVICE_KEY = "6438ce04ca4a3ec4bcc72f295ab386baa74e52cacce9f725803e18cd8c6d1030"
BASE_URL = "https://apis.data.go.kr/1192000/select0040List/getselect0040List"
OUTPUT_DIR = Path(__file__).parent.parent / "data"
PUBLIC_OUTPUT_DIR = Path(__file__).parent.parent / "public" / "data"
MAX_ROWS = 100  # API hard limit
TARGET_MONTHS_2026 = range(1, 8)
INCLUDED_PARTIAL_MONTH = "2026-07"

# SSL bypass for data.go.kr self-signed cert chain
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


def fetch_page(baseDt: str, pageNo: int) -> tuple[list, int]:
    """Fetch a single page of consignment data. Returns (items, totalCount)."""
    url = (
        f"{BASE_URL}?serviceKey={SERVICE_KEY}"
        f"&pageNo={pageNo}&numOfRows={MAX_ROWS}&type=json&baseDt={baseDt}"
    )
    
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=30, context=SSL_CTX) as resp:
        raw = resp.read().decode("utf-8")
    
    if len(raw) <= 10:
        return [], 0
    
    data = json.loads(raw)
    header = data.get("responseJson", {}).get("header", {})
    items = data.get("responseJson", {}).get("body", {}).get("item", [])
    total = header.get("totalCount", 0) or 0
    result_code = header.get("resultCode", "")
    
    if result_code != "00":
        return [], 0
    
    return items, total


def fetch_month(year: int, month: int) -> list:
    """Fetch ALL consignment data for a given month using pagination."""
    baseDt = f"{year}{month:02d}01"
    all_items = []
    
    # First page to get totalCount
    items, total = fetch_page(baseDt, 1)
    if not items:
        print(f"  ⚠️  {baseDt}: No data")
        return []
    
    all_items.extend(items)
    total_pages = (total + MAX_ROWS - 1) // MAX_ROWS
    
    print(f"  📄 {baseDt}: {total:>6,}건 ({total_pages} pages)")
    
    # Fetch remaining pages
    for page in range(2, total_pages + 1):
        try:
            items, _ = fetch_page(baseDt, page)
            all_items.extend(items)
            time.sleep(0.3)  # Rate limit
        except Exception as e:
            print(f"    ❌ page {page}: {e}")
            break
    
    print(f"    ✅ Fetched: {len(all_items):,} records")
    return all_items


def aggregate_species(all_items: list) -> dict:
    """Aggregate raw transactions into yearly and monthly species summaries."""
    yearly = defaultdict(lambda: defaultdict(lambda: {"amount": 0, "qty": 0}))
    monthly = defaultdict(lambda: defaultdict(lambda: {"amount": 0, "qty": 0}))
    
    for item in all_items:
        date_str = item.get("csmtDe", "")
        if len(date_str) < 6:
            continue
        year = date_str[:4]
        ym = f"{date_str[:4]}-{date_str[4:6]}"
        species = item.get("mprcStdCodeNm", "미분류")
        amount = int(item.get("csmtAmount", 0) or 0)
        qty = int(item.get("csmtWt", 0) or 0)
        
        yearly[year][species]["amount"] += amount
        yearly[year][species]["qty"] += qty
        monthly[ym][species]["amount"] += amount
        monthly[ym][species]["qty"] += qty
    
    return {
        "yearly": {y: dict(sp) for y, sp in sorted(yearly.items())},
        "monthly": {m: dict(sp) for m, sp in sorted(monthly.items())},
    }


def build_dashboard_data(agg: dict) -> dict:
    """Build structured data for the dashboard."""
    
    # 1. Yearly Top Species (Top 30)
    yearly_top = {}
    for year, species_map in agg["yearly"].items():
        ranked = sorted(species_map.items(), key=lambda x: x[1]["amount"], reverse=True)
        yearly_top[year] = [
            {
                "rank": i + 1,
                "seafoodName": sp,
                "saleAmount": data["amount"],
                "saleQty": data["qty"],
                "avgUnitPrice": round(data["amount"] / data["qty"]) if data["qty"] > 0 else 0,
            }
            for i, (sp, data) in enumerate(ranked[:30])
        ]
    
    # 2. Monthly detail (top 20 per month)
    monthly_detail = {}
    for ym, species_map in agg["monthly"].items():
        ranked = sorted(species_map.items(), key=lambda x: x[1]["amount"], reverse=True)
        monthly_detail[ym] = [
            {
                "rank": i + 1,
                "seafoodName": sp,
                "saleAmount": data["amount"],
                "saleQty": data["qty"],
                "avgUnitPrice": round(data["amount"] / data["qty"]) if data["qty"] > 0 else 0,
            }
            for i, (sp, data) in enumerate(ranked[:20])
        ]
    
    # 3. Flat items for chart rendering
    flat_items = []
    for ym, species_map in agg["monthly"].items():
        for sp, data in species_map.items():
            flat_items.append({
                "month": ym,
                "year": ym[:4],
                "seafoodName": sp,
                "saleAmount": data["amount"],
                "saleQty": data["qty"],
            })
    flat_items.sort(key=lambda x: x["saleAmount"], reverse=True)
    
    return {
        "yearlyTop": yearly_top,
        "monthlyDetail": monthly_detail,
        "items": flat_items,
        "_meta": {
            "years": sorted(agg["yearly"].keys()),
            "months": sorted(agg["monthly"].keys()),
            "totalSpecies": len(set(item["seafoodName"] for item in flat_items)),
            "totalRecords": len(flat_items),
            "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S+09:00"),
            "samplingBasis": "해양수산부 위판장별 위탁판매 API baseDt=YYYYMM01 월별 스냅샷",
            "includedPartialMonth": INCLUDED_PARTIAL_MONTH,
            "coverageNote": "2026년 7월은 조회 가능한 2026-07-01 기준 부분 데이터까지 반영",
        },
    }


def main():
    all_items = []
    
    for year in [2024, 2025, 2026]:
        if year == 2026:
            months = TARGET_MONTHS_2026
        else:
            months = range(1, 13)
        
        print(f"\n{'='*55}")
        print(f"📊 Fetching {year} consignment data...")
        print(f"{'='*55}")
        
        for month in months:
            items = fetch_month(year, month)
            all_items.extend(items)
            time.sleep(0.5)
    
    print(f"\n{'='*55}")
    print(f"📈 Total raw records collected: {len(all_items):,}")
    
    # Aggregate
    agg = aggregate_species(all_items)
    dashboard_data = build_dashboard_data(agg)
    
    # Print summary
    print(f"\n📊 Year-by-Year Summary:")
    for year, species_list in dashboard_data["yearlyTop"].items():
        total_amount = sum(s["saleAmount"] for s in species_list)
        total_qty = sum(s["saleQty"] for s in species_list)
        print(f"\n  📅 {year}: {len(species_list)} species | {total_amount/1e8:,.0f}억원 | {total_qty/1000:,.0f}t")
        for s in species_list[:5]:
            print(f"    {s['rank']:>2}. {s['seafoodName']:<12s} | {s['saleAmount']/1e8:>10,.1f}억원 | {s['saleQty']/1000:>8,.1f}t | ₩{s['avgUnitPrice']:>8,}/kg")
    
    # Save both local analysis data and the deployment-included public copy.
    for output_dir in [OUTPUT_DIR, PUBLIC_OUTPUT_DIR]:
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / "consignment_3year.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(dashboard_data, f, ensure_ascii=False, indent=2)
        print(f"\n✅ Saved to: {output_path}")
        print(f"   File size: {output_path.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
