import pandas as pd

print("=== Non-EU Countries Exporting Mackerel to EU ===")
ndf = pd.read_csv('data/EU/raw_csv/2024_Trade_data_reported_by_non-EU_countries.csv', sep=';', on_bad_lines='skip', encoding='utf-8')
# lowercase columns
ndf.columns = [c.lower().strip() for c in ndf.columns]

nmac = ndf[ndf['main commercial species'].astype(str).str.contains('mackerel', case=False, na=False)].copy()
nmac['vol'] = pd.to_numeric(nmac['volume(kg)'].astype(str).str.replace(',','.'), errors='coerce')
nmac['val'] = pd.to_numeric(nmac['value(eur)'].astype(str).str.replace(',','.'), errors='coerce')

exp = nmac[nmac['flow type'].astype(str).str.contains('export', case=False)]
agg = exp.groupby('reporting country')[['vol','val']].sum().reset_index()
agg = agg.sort_values('vol', ascending=False)
for _,r in agg.head(12).iterrows():
    p = r['val']/r['vol'] if r['vol']>0 else 0
    print(f"  {r['reporting country']}: {r['vol']/1000:,.0f}t, {r['val']/1000000:,.1f}M EUR (P={p:.2f})")

print("\n=== Non-EU -> EU Export by Preservation ===")
agg_pres = exp.groupby('preservation')[['vol','val']].sum().reset_index()
agg_pres = agg_pres.sort_values('vol', ascending=False)
for _,r in agg_pres.iterrows():
    p = r['val']/r['vol'] if r['vol']>0 else 0
    print(f"  {r['preservation']}: {r['vol']/1000:,.0f}t (P={p:.2f})")

# === Comext MCS headers ===
print("\n\n=== Comext MCS headers ===")
head = pd.read_csv('data/EU/raw_csv/2019_2025_Yearly_comext_mcs.csv', sep=';', on_bad_lines='skip', encoding='utf-8', nrows=2)
print("Cols:", list(head.columns))

