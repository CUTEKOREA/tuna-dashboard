#!/usr/bin/env python3
"""Stage 3: Investigate W1/W9 'Others' and 'Total' discrepancy - likely double-counting of World aggregate rows"""
import csv, os

DATA_DIR = 'data/명태/'

def parse_fao_csv(filepath):
    rows = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        year_cols = {}
        for i, h in enumerate(header):
            h = h.strip()
            if h.startswith('[') and h.endswith(']'):
                year = h[1:-1]
                year_cols[year] = i
        for row in reader:
            country = row[0].strip() if row else ''
            data = {'country': country, 'row': row}
            for year, idx in year_cols.items():
                try:
                    val = row[idx].strip().replace(',','')
                    if val and val not in ('...', ''):
                        data[year] = float(val)
                except (IndexError, ValueError):
                    pass
            rows.append(data)
    return rows

# Check if there's a 'World' row causing double-counting
rows = parse_fao_csv(os.path.join(DATA_DIR, '2. 명태 생산량(어획량) 1950-2024.csv'))

print("All countries in CSV with 2022 data > 0:")
for r in rows:
    v = r.get('2022', 0)
    if v > 0:
        print(f"  {r['country']}: {v:,.0f}t")

print("\n--- Countries with 'World' or aggregate ---")
for r in rows:
    if 'world' in r['country'].lower() or 'total' in r['country'].lower():
        print(f"  Found aggregate row: '{r['country']}' 2022={r.get('2022',0):,.0f}")

# Correct calculation excluding World/aggregate rows
total_no_world = sum(r.get('2022',0) for r in rows if 'world' not in r['country'].lower() and 'total' not in r['country'].lower())
russia_2022 = sum(r.get('2022',0) for r in rows if 'Russia' in r['country'])
usa_2022 = sum(r.get('2022',0) for r in rows if 'United States' in r['country'])
others_2022 = total_no_world - russia_2022 - usa_2022
pct = (russia_2022 + usa_2022) / total_no_world * 100

print(f"\n--- Corrected (excluding World/Total rows) ---")
print(f"  Russia={russia_2022:,.0f}, USA={usa_2022:,.0f}, Others={others_2022:,.0f}, Total={total_no_world:,.0f}")
print(f"  미·러 비율: {pct:.1f}%")

# W18 Korea analysis: check if Korea row includes fishing area subtotals
print("\n--- W18 Korea deeper ---")
for r in rows:
    if 'Korea' in r['country'] and 'Democratic' not in r['country']:
        area = r['row'][2].strip() if len(r['row']) > 2 else ''
        v22 = r.get('2022', 0)
        v24 = r.get('2024', 0)
        if v22 > 0 or v24 > 0:
            print(f"  {r['country']} | Area: {area} | 2022={v22:,.0f} | 2024={v24:,.0f}")

# Check surimi CSV for duplicate (World) rows
print("\n--- Surimi CSV World row check ---")
surimi = parse_fao_csv(os.path.join(DATA_DIR, '10. 수리미 가공 생산량 1976-2023.csv'))
for r in surimi:
    if 'world' in r['country'].lower() or 'total' in r['country'].lower():
        print(f"  Surimi aggregate: '{r['country']}' 2022={r.get('2022',0):,.0f}")

surimi_no_world = sum(r.get('2022',0) for r in surimi if 'world' not in r['country'].lower() and 'total' not in r['country'].lower())
print(f"  Surimi 2022 (excl World): {surimi_no_world:,.0f}")
print(f"  JSON W9 claims: 1,985,103")

