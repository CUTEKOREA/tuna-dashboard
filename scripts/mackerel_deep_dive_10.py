import pandas as pd

# === Monthly Consumption: Small Pelagics (includes mackerel) ===
print("=== EU Monthly Consumption: Small Pelagics ===")
df = pd.read_csv('data/EU/raw_csv/Monthly_Consumption.csv', sep=';', on_bad_lines='skip', encoding='utf-8')
df.columns = [c.lower().strip() for c in df.columns]

# Small pelagics includes mackerel
sp = df[df['cg'].astype(str).str.contains('Small pelagics|Mackerel', case=False, na=False)].copy()
sp['vol'] = pd.to_numeric(sp['volume(kg)'].astype(str).str.replace(',','.'), errors='coerce')
sp['val'] = pd.to_numeric(sp['value(eur)'].astype(str).str.replace(',','.'), errors='coerce')
sp['year'] = pd.to_numeric(sp['year'], errors='coerce')
sp['month'] = pd.to_numeric(sp['month'], errors='coerce')

# Monthly consumption pattern
agg_m = sp.groupby('month')[['vol','val']].sum().reset_index()
agg_m['price'] = agg_m['val'] / agg_m['vol']
print("\n  Monthly Consumption Volume (Small Pelagics):")
for _,r in agg_m.sort_values('month').iterrows():
    print(f"    Month {int(r['month']):02d}: {r['vol']/1000:,.0f}t, price: {r['price']:.2f}")

# By country
agg_c = sp.groupby('country')[['vol','val']].sum().reset_index()
agg_c['price'] = agg_c['val'] / agg_c['vol']
agg_c = agg_c.sort_values('vol', ascending=False)
print("\n  Top Consuming Countries:")
for _,r in agg_c.head(10).iterrows():
    print(f"    {r['country']}: {r['vol']/1000:,.0f}t at {r['price']:.2f}")

# === TDM Multi-year: trade dynamics ===
print("\n\n=== TDM Multi-year Trade (2021-2025) ===")
tdm = pd.read_csv('data/EU/raw_csv/2021_2025_Yearly_tdm.csv', sep=';', on_bad_lines='skip', encoding='utf-8', nrows=3)
print("Cols:", list(tdm.columns))

