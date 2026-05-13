import pandas as pd

# === First Sale Price by Country (Yearly) ===
print("=== First Sale Price by Country (2019-2025) ===")
fs = pd.read_csv('data/EU/raw_csv/2019_2025_first_sale_yearly.csv', sep=';', on_bad_lines='skip', encoding='utf-8')
cols = [c.upper() for c in fs.columns]
fs.columns = cols

mac = fs[fs['ENGLISH_NAME'].astype(str).str.contains('mackerel', case=False, na=False)].copy()
mac['VOLUME(KG)'] = pd.to_numeric(mac['VOLUME(KG)'].astype(str).str.replace(',','.'), errors='coerce')
mac['VALUE(EUR)'] = pd.to_numeric(mac['VALUE(EUR)'].astype(str).str.replace(',','.'), errors='coerce')
mac['YEAR'] = pd.to_numeric(mac['YEAR'], errors='coerce')

agg = mac.groupby(['YEAR','COUNTRY'])[['VOLUME(KG)','VALUE(EUR)']].sum().reset_index()
agg['PRICE'] = agg['VALUE(EUR)'] / agg['VOLUME(KG)']

# Focus: price by country for recent years
for year in [2022, 2023, 2024, 2025]:
    yr = agg[agg['YEAR']==year].sort_values('VOLUME(KG)', ascending=False)
    print(f"\n  {year}:")
    for _,r in yr.head(8).iterrows():
        if r['VOLUME(KG)']>1000:
            print(f"    {r['COUNTRY']}: {r['VOLUME(KG)']/1000:,.0f}t at {r['PRICE']:.2f} EUR/kg")

# === Non-EU trade perspective ===
print("\n\n=== Non-EU Countries Reporting: Who Sends to EU? ===")
ndf = pd.read_csv('data/EU/raw_csv/2024_Trade_data_reported_by_non-EU_countries.csv', sep=';', on_bad_lines='skip', encoding='utf-8')
ncols = [c.upper() for c in ndf.columns]
ndf.columns = ncols
print("Cols:", ncols[:12])

nmac = ndf[ndf['MAIN_COMMERCIAL_SPECIES'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
nmac['VOLUME(KG)'] = pd.to_numeric(nmac['VOLUME(KG)'].astype(str).str.replace(',','.'), errors='coerce')
nmac['VALUE(EUR)'] = pd.to_numeric(nmac['VALUE(EUR)'].astype(str).str.replace(',','.'), errors='coerce')

exp_to_eu = nmac[nmac['FLOW_TYPE'].astype(str).str.contains('Export', case=False)]
agg_noneu = exp_to_eu.groupby('COUNTRY')[['VOLUME(KG)','VALUE(EUR)']].sum().reset_index()
agg_noneu = agg_noneu.sort_values('VOLUME(KG)', ascending=False)
print("\n  Non-EU Exporters to EU:")
for _,r in agg_noneu.head(10).iterrows():
    p = r['VALUE(EUR)']/r['VOLUME(KG)'] if r['VOLUME(KG)']>0 else 0
    print(f"    {r['COUNTRY']}: {r['VOLUME(KG)']/1000:,.0f}t, {r['VALUE(EUR)']/1000000:,.1f}M EUR (P={p:.2f})")

