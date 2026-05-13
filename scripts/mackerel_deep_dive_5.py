import pandas as pd

# === Non-EU perspective (columns have spaces) ===
print("=== Non-EU Countries Exporting Mackerel to EU ===")
ndf = pd.read_csv('data/EU/raw_csv/2024_Trade_data_reported_by_non-EU_countries.csv', sep=';', on_bad_lines='skip', encoding='utf-8')
cols = [c.strip() for c in ndf.columns]
ndf.columns = cols

nmac = ndf[ndf['MAIN COMMERCIAL SPECIES'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
nmac['VOLUME(KG)'] = pd.to_numeric(nmac['VOLUME(KG)'].astype(str).str.replace(',','.'), errors='coerce')
nmac['VALUE(EUR)'] = pd.to_numeric(nmac['VALUE(EUR)'].astype(str).str.replace(',','.'), errors='coerce')

exp = nmac[nmac['FLOW TYPE'].astype(str).str.contains('Export', case=False)]
agg = exp.groupby('REPORTING COUNTRY')[['VOLUME(KG)','VALUE(EUR)']].sum().reset_index()
agg = agg.sort_values('VOLUME(KG)', ascending=False)
for _,r in agg.head(12).iterrows():
    p = r['VALUE(EUR)']/r['VOLUME(KG)'] if r['VOLUME(KG)']>0 else 0
    print(f"  {r['REPORTING COUNTRY']}: {r['VOLUME(KG)']/1000:,.0f}t, {r['VALUE(EUR)']/1000000:,.1f}M EUR (P={p:.2f})")

# Where do Non-EU exports go?
print("\n=== Non-EU Export DESTINATIONS ===")
exp_dest = exp.groupby('PARTNER COUNTRY')[['VOLUME(KG)','VALUE(EUR)']].sum().reset_index()
exp_dest = exp_dest.sort_values('VOLUME(KG)', ascending=False)
for _,r in exp_dest.head(10).iterrows():
    p = r['VALUE(EUR)']/r['VOLUME(KG)'] if r['VOLUME(KG)']>0 else 0
    print(f"  -> {r['PARTNER COUNTRY']}: {r['VOLUME(KG)']/1000:,.0f}t at {p:.2f}")

# === Comext MCS (multi-year external trade) ===
print("\n\n=== Comext MCS: Multi-year EU External Trade ===")
head = pd.read_csv('data/EU/raw_csv/2019_2025_Yearly_comext_mcs.csv', sep=';', on_bad_lines='skip', encoding='utf-8', nrows=3)
print("Cols:", list(head.columns)[:12])

