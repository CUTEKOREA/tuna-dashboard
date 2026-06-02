#!/usr/bin/env python3
"""Compute authoritative US Census non-canned tuna import figures for SasMarketKPIs.
Reads public/data/us_census_timeseries.json (Census prefetch), aggregates by year,
fresh/frozen/fillet, species(HS), and 2024 partner. Outputs widget-ready JSON."""
import json
from collections import defaultdict

d = json.load(open("public/data/us_census_timeseries.json"))

# country aggregate groupings to exclude (keep only real countries)
NON = {s.upper() for s in [
 'TOTAL FOR ALL COUNTRIES','APEC','ASIA','ASEAN','OECD','LAFTA','NAFTA','USMCA','USMCA (NAFTA)',
 'OPEC','EUROPEAN UNION','EURO AREA','CACM','CAFTA','CAFTA-DR','PACIFIC RIM','PACIFIC RIM COUNTRIES',
 'SUB-SAHARAN AFRICA','TWENTY LATIN AMERICAN REPUBLICS','SOUTH AMERICA','NORTH AMERICA','CENTRAL AMERICA',
 'SOUTH/CENTRAL AMERICA','EUROPE','AFRICA','OCEANIA','MIDDLE EAST','ANDEAN','CARICOM','MERCOSUR',
 'NORTHERN AMERICA','WESTERN HEMISPHERE','AUSTRALIA AND OCEANIA','ADVANCED TECHNOLOGY PRODUCTS','NATO',
 'EUROPEAN UNION (EU)']}

FRESH  = ['030232','030234','030235']      # 0302 신선/냉장
FROZEN = ['030342','030343','030344','030345']  # 0303 냉동 (whole)
FILLET = ['030487']                          # 0304 냉동 필렛(로인)
ALL = FRESH + FROZEN + FILLET

# species (HS → 어종)
SPECIES = {
 '참치 필렛(로인)': ['030487'],
 '황다랑어': ['030232','030342'],
 '참다랑어(대서양)': ['030235','030345'],
 '눈다랑어': ['030234','030344'],
 '가다랑어': ['030343'],
}

KO = {'INDONESIA':'🇮🇩 인도네시아','VIET NAM':'🇻🇳 베트남','VIETNAM':'🇻🇳 베트남','MEXICO':'🇲🇽 멕시코',
 'SPAIN':'🇪🇸 스페인','THAILAND':'🇹🇭 태국','PANAMA':'🇵🇦 파나마','CHINA':'🇨🇳 중국','ECUADOR':'🇪🇨 에콰도르',
 'PHILIPPINES':'🇵🇭 필리핀','TAIWAN':'🇹🇼 대만','FIJI':'🇫🇯 피지','SRI LANKA':'🇱🇰 스리랑카',
 'TRINIDAD AND TOBAGO':'🇹🇹 트리니다드','KOREA, SOUTH':'🇰🇷 한국','MALTA':'🇲🇹 몰타','PORTUGAL':'🇵🇹 포르투갈'}

def annual(code, yr):
    return sum(r.get('value',0) for r in d.get(code,[])
               if r['time'].startswith(yr) and r['country'].upper() not in NON)

def group_annual(codes, yr):
    return sum(annual(c, yr) for c in codes)

# coverage (latest month available across tuna codes)
months = sorted(set(r['time'] for c in ALL for r in d.get(c,[])))
print(f"coverage: {months[0]} ~ {months[-1]}")

YEARS = ['2021','2022','2023','2024','2025']
import_data = []
for yr in YEARS:
    fr = group_annual(FRESH, yr); fz = group_annual(FROZEN, yr); fl = group_annual(FILLET, yr)
    tot = fr+fz+fl
    import_data.append({'year':yr,'fresh':round(fr/1e6),'frozen':round((fz+fl)/1e6),'total':round(tot/1e6)})
    print(f"  {yr}: 신선 ${fr/1e6:.0f}M · 냉동+필렛 ${(fz+fl)/1e6:.0f}M · 총 ${tot/1e6:.0f}M")

# 2024 top partners (country-only, across ALL tuna codes)
part = defaultdict(float); ptot=0
for c in ALL:
    for r in d.get(c,[]):
        if r['time'].startswith('2024') and r['country'].upper() not in NON:
            part[r['country']] += r.get('value',0); ptot += r.get('value',0)
top = sorted(part.items(), key=lambda x:-x[1])[:5]
print(f"\n2024 총(국가합산): ${ptot/1e6:.0f}M")
print("Top5 공급국:")
partners=[]
COLORS=['#10b981','#38bdf8','#f59e0b','#a78bfa','#ef4444']
for i,(k,v) in enumerate(top):
    nm = KO.get(k.upper(), k.title())
    pct = round(v/ptot*100,1)
    partners.append({'name':nm,'value':round(v/1e6),'pct':pct,'color':COLORS[i]})
    print(f"  {nm}: ${v/1e6:.0f}M ({pct}%)")

# 2024 species
print("\n2024 어종별:")
species=[]
SCOL=['#38bdf8','#10b981','#ef4444','#a78bfa','#64748b']
sp_tot = sum(group_annual(codes,'2024') for codes in SPECIES.values())
for i,(nm,codes) in enumerate(SPECIES.items()):
    v=group_annual(codes,'2024'); pct=round(v/sp_tot*100,1)
    species.append({'name':nm,'value':round(v/1e6),'pct':pct,'color':SCOL[i]})
    print(f"  {nm}: ${v/1e6:.0f}M ({pct}%)")

out={'coverage':{'start':months[0],'end':months[-1]},
     'importData':import_data,'partners':partners,'species':species,
     'total2024':round(ptot/1e6)}
json.dump(out, open('public/data/sashimi_census_summary.json','w'), ensure_ascii=False, indent=2)
print("\n✅ public/data/sashimi_census_summary.json 저장")
