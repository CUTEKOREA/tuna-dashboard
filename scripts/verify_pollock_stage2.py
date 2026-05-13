#!/usr/bin/env python3
"""Stage 2-5 verification"""
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
            commodity = row[1].strip() if len(row) > 1 else ''
            data = {'country': country, 'commodity': commodity, 'row': row}
            for year, idx in year_cols.items():
                try:
                    val = row[idx].strip().replace(',','')
                    if val and val not in ('...', ''):
                        data[year] = float(val)
                except (IndexError, ValueError):
                    pass
            rows.append(data)
    return rows

# ═══ W1 Others 오류 원인 분석 ═══
print("="*80)
print("W1 DEEP DIVE: CSV '전체' 파일의 Others 검증")
print("="*80)
rows = parse_fao_csv(os.path.join(DATA_DIR, '1. 명태 생산량(전체) 1950-2024.csv'))

# Check if '전체' includes aquaculture
species = set()
sources = set()
for r in rows:
    if len(r['row']) > 3:
        sources.add(r['row'][3].strip())
    species.add(r.get('commodity',''))

print(f"  Production sources in file: {sources}")
print(f"  Species in file: {species}")

# Now use '어획량' (catch only) file
print("\n  Using '2. 명태 생산량(어획량)' instead:")
rows2 = parse_fao_csv(os.path.join(DATA_DIR, '2. 명태 생산량(어획량) 1950-2024.csv'))
russia_catch = sum(r.get('2022',0) for r in rows2 if 'Russia' in r['country'] or 'Russian' in r['country'])
usa_catch = sum(r.get('2022',0) for r in rows2 if 'United States' in r['country'])
total_catch = sum(r.get('2022',0) for r in rows2)
others_catch = total_catch - russia_catch - usa_catch
pct = (russia_catch + usa_catch) / total_catch * 100 if total_catch else 0
print(f"  Catch-only 2022: Russia={russia_catch:,.0f}, USA={usa_catch:,.0f}, Others={others_catch:,.0f}, Total={total_catch:,.0f}")
print(f"  미·러 독점 비율: {pct:.1f}%")
print(f"  JSON claims: 92.6% → 실제: {pct:.1f}%")

# ═══ W18 Korea 불일치 분석 ═══
print("\n" + "="*80)
print("W18: Korea 수치 불일치 원인 분석")
print("="*80)
# File 1 (전체 = capture + aquaculture)
korea_total = sum(r.get('2022',0) for r in rows if 'Korea' in r['country'] and 'Democratic' not in r['country'])
korea_catch_only = sum(r.get('2022',0) for r in rows2 if 'Korea' in r['country'] and 'Democratic' not in r['country'])
print(f"  전체(생산량) 2022 Korea = {korea_total:,.0f}t")
print(f"  어획량 2022 Korea = {korea_catch_only:,.0f}t")
print(f"  JSON Widget 2022 Korea = 82,061t")
print(f"  ⚠️ JSON이 어획량(21,591)도 아니고 전체(21,591)도 아닌 82,061 — 출처 불명!")

# ═══ Stage 2: Processing verification ═══
print("\n" + "="*80)
print("STAGE 2: Processing (가공) 위젯 검증")
print("="*80)

# W9: Surimi megatrend
surimi_rows = parse_fao_csv(os.path.join(DATA_DIR, '10. 수리미 가공 생산량 1976-2023.csv'))
surimi_2022 = sum(r.get('2022',0) for r in surimi_rows)
surimi_2020 = sum(r.get('2020',0) for r in surimi_rows)
print(f"  W9 Surimi 2022: CSV={surimi_2022:,.0f}t, JSON=1,985,103t")
print(f"  W9 Surimi 2020: CSV={surimi_2020:,.0f}t, JSON=1,931,906t")

# W10: Top3 surimi
china_surimi = sum(r.get('2022',0) for r in surimi_rows if 'China' in r['country'])
usa_surimi = sum(r.get('2022',0) for r in surimi_rows if 'United States' in r['country'])
france_surimi = sum(r.get('2022',0) for r in surimi_rows if 'France' in r['country'])
print(f"\n  W10 Top3 2022: China={china_surimi:,.0f}, USA={usa_surimi:,.0f}, France={france_surimi:,.0f}")
print(f"  JSON: China=1,540,348, USA=270,847, France=67,517")

# W5: China blackhole
print(f"\n  W5: China import/re-export (단면 비교 — 무역 데이터에서 교차 검증)")

# W12: proc vs surimi
proc_rows = parse_fao_csv(os.path.join(DATA_DIR, '9. 명태 가공 생산량 1976-2023.csv'))
proc_2020 = sum(r.get('2020',0) for r in proc_rows)
print(f"\n  W12: Proc 2020 total: CSV={proc_2020:,.0f}t, JSON=1,323,732t")

# ═══ Stage 3: Logistics verification ═══
print("\n" + "="*80)
print("STAGE 3: Logistics (물류) 위젯 검증")
print("="*80)

# W11: Surimi trade
surimi_trade = parse_fao_csv(os.path.join(DATA_DIR, '9. 수리미 수출입 1976-2023 .csv'))
trade_2022 = sum(r.get('2022',0) for r in surimi_trade)
trade_2020 = sum(r.get('2020',0) for r in surimi_trade)
print(f"  W11 Surimi trade 2022: CSV={trade_2022:,.0f}t, JSON=1,869,322t")
print(f"  W11 Surimi trade 2020: CSV={trade_2020:,.0f}t, JSON=1,691,395t")

# W17: Korea processing portfolio
print(f"\n  W17: Korea 가공 포트폴리오 — 9.가공생산량 CSV에서 검증")
korea_proc = [r for r in proc_rows if 'Korea' in r['country'] and 'Democratic' not in r['country']]
for r in korea_proc:
    val_2023 = r.get('2023', 0)
    if val_2023 > 0:
        print(f"    {r['commodity']}: {val_2023:,.0f}t")

