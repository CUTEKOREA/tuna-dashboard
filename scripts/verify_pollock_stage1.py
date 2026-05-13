#!/usr/bin/env python3
"""Stage 1: Raw Material widgets verification against CSV source data"""
import csv, os, json, io

DATA_DIR = 'data/명태/'

def parse_fao_csv(filepath):
    """Parse FAO FishStatJ CSV with year columns"""
    rows = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        # Find year columns
        year_cols = {}
        for i, h in enumerate(header):
            h = h.strip()
            if h.startswith('[') and h.endswith(']'):
                year = h[1:-1]
                year_cols[year] = i
        for row in reader:
            country = row[0].strip() if row else ''
            data = {'country': country}
            for year, idx in year_cols.items():
                try:
                    val = row[idx].strip().replace(',','')
                    if val and val not in ('0', '...', ''):
                        data[year] = float(val)
                except (IndexError, ValueError):
                    pass
            rows.append(data)
    return rows, year_cols

# === W1: Global catch verification ===
print("="*80)
print("W1: 명태 글로벌 생산 장기간 박스권 한계")
print("="*80)
rows, ycols = parse_fao_csv(os.path.join(DATA_DIR, '1. 명태 생산량(전체) 1950-2024.csv'))

# Sum by country for 2022
russia_2022 = sum(r.get('2022',0) for r in rows if 'Russia' in r['country'] or 'Russian' in r['country'])
usa_2022 = sum(r.get('2022',0) for r in rows if 'United States' in r['country'] or 'America' in r['country'])
total_2022 = sum(r.get('2022',0) for r in rows)
others_2022 = total_2022 - russia_2022 - usa_2022

print(f"  CSV Source (2022): Russia={russia_2022:,.0f}t, USA={usa_2022:,.0f}t, Others={others_2022:,.0f}t, Total={total_2022:,.0f}t")
print(f"  JSON Widget (2022): Russia=1,902,465t, USA=1,226,524t, Others=251,448t")

# W2: Hegemony pie
print(f"\n  W2 Pie: Russia share = {russia_2022/total_2022*100:.1f}%")
print(f"  JSON claims: 미·러 92.6% 독점")

# W3: US vs Russia diverging
print(f"\n  W3 Diverging: Russia 2022={russia_2022:,.0f}, USA 2022={usa_2022:,.0f}")

# === W4: Korea crisis ===
print("\n" + "="*80)
print("W4: 대한민국 수산 안보: 영해 내 명태 소멸")
print("="*80)
korea_catch_2022 = sum(r.get('2022',0) for r in rows if 'Korea' in r['country'] and 'Democratic' not in r['country'])
print(f"  CSV: Korea catch 2022 = {korea_catch_2022:,.0f}t")
print(f"  JSON Widget 2022: 국내 어획량 = 21,590.84t")

# === W18: 4-power ===
print("\n" + "="*80)
print("W18: 4강 체제의 붕괴")
print("="*80)
japan_2022 = sum(r.get('2022',0) for r in rows if 'Japan' in r['country'])
print(f"  CSV 2022: Russia={russia_2022:,.0f}, USA={usa_2022:,.0f}, Japan={japan_2022:,.0f}, Korea={korea_catch_2022:,.0f}")
print(f"  JSON 2022: Russia=1,902,465, USA=1,226,524, Japan=160,428, Korea=82,061")

# 2024 data check
russia_2024 = sum(r.get('2024',0) for r in rows if 'Russia' in r['country'] or 'Russian' in r['country'])
usa_2024 = sum(r.get('2024',0) for r in rows if 'United States' in r['country'])
japan_2024 = sum(r.get('2024',0) for r in rows if 'Japan' in r['country'])
korea_2024 = sum(r.get('2024',0) for r in rows if 'Korea' in r['country'] and 'Democratic' not in r['country'])
print(f"  CSV 2024: Russia={russia_2024:,.0f}, USA={usa_2024:,.0f}, Japan={japan_2024:,.0f}, Korea={korea_2024:,.0f}")
print(f"  JSON 2024: Russia=1,927,938, USA=1,425,044, Japan=123,600, Korea=87,779")

