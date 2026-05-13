#!/usr/bin/env python3
"""Final verification for all remaining widgets"""
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

# W18 Korea - should be Republic of Korea catch ONLY, not total including DPRK  
rows = parse_fao_csv(os.path.join(DATA_DIR, '1. 명태 생산량(전체) 1950-2024.csv'))
# Check all Korea-related rows
print("="*80)
print("W18 Korea Analysis - All Korea rows across years")
print("="*80)
for r in rows:
    if 'Korea' in r['country']:
        print(f"  {r['country']}:")
        for yr in ['2010','2015','2020','2022','2024']:
            v = r.get(yr,0)
            area = r['row'][2].strip() if len(r['row']) > 2 else ''
            if v > 0:
                print(f"    {yr}: {v:,.0f}t (Area: {area})")

# W8: Korea deficit - cross-check trade data
print("\n" + "="*80)
print("W8: Korea Trade Deficit")
print("="*80)

def parse_trade_csv(filepath):
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
            if len(row) < 4: continue
            reporter = row[0].strip()
            partner = row[1].strip()
            commodity = row[2].strip()
            flow = row[3].strip()
            data = {'reporter': reporter, 'partner': partner, 'commodity': commodity, 'flow': flow}
            for year, idx in year_cols.items():
                try:
                    val = row[idx].strip().replace(',','')
                    if val and val not in ('...', ''):
                        data[year] = float(val)
                except (IndexError, ValueError):
                    pass
            rows.append(data)
    return rows

trade_vol = parse_trade_csv(os.path.join(DATA_DIR, '5. 명태 무역량(수출입) 2019-2023.csv'))
trade_val = parse_trade_csv(os.path.join(DATA_DIR, '6. 명태 무역액(수출입) 2019-2023.csv'))

# Korea imports volume 2022
kr_import_vol = sum(r.get('2022',0) for r in trade_vol if r['reporter'] == 'Republic of Korea' and 'Import' in r['flow'])
kr_export_vol = sum(r.get('2022',0) for r in trade_vol if r['reporter'] == 'Republic of Korea' and 'Export' in r['flow'])
kr_import_val = sum(r.get('2022',0) for r in trade_val if r['reporter'] == 'Republic of Korea' and 'Import' in r['flow'])
kr_export_val = sum(r.get('2022',0) for r in trade_val if r['reporter'] == 'Republic of Korea' and 'Export' in r['flow'])
deficit = kr_import_val - kr_export_val

print(f"  Korea 2022 Import Vol: {kr_import_vol:,.0f}t, Value: {kr_import_val:,.0f} (USD 1000)")
print(f"  Korea 2022 Export Vol: {kr_export_vol:,.0f}t, Value: {kr_export_val:,.0f} (USD 1000)")
print(f"  Deficit: {deficit:,.0f} (USD 1000)")
print(f"  JSON W8 2022: 239,034 (USD 1,000)")

# W13: Korea import by partner 2023
print("\n" + "="*80)
print("W13: Korea Import by Partner (2023)")
print("="*80)
kr_import_by_partner = {}
for r in trade_vol:
    if r['reporter'] == 'Republic of Korea' and 'Import' in r['flow']:
        v = r.get('2023', 0)
        if v > 0:
            partner = r['partner']
            kr_import_by_partner[partner] = kr_import_by_partner.get(partner, 0) + v

for partner, vol in sorted(kr_import_by_partner.items(), key=lambda x: -x[1])[:10]:
    print(f"  {partner}: {vol:,.0f}t")
total_kr_import_2023 = sum(kr_import_by_partner.values())
print(f"  Total: {total_kr_import_2023:,.0f}t")

russia_pct = kr_import_by_partner.get('Russian Federation', 0) / total_kr_import_2023 * 100 if total_kr_import_2023 else 0
print(f"  Russia %: {russia_pct:.1f}%")
print(f"  JSON W13: 러시아 171,165t / 186,374t = 91.8%")

