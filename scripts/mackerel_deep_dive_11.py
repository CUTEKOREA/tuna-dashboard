import pandas as pd

# === TDM: China's stealth supply chain to EU ===
print("=== China's Mackerel Supply Chain to EU (2021-2025) ===")
chunks = pd.read_csv('data/EU/raw_csv/2021_2025_Yearly_tdm.csv', sep=';', on_bad_lines='skip', 
                      encoding='utf-8', chunksize=500000)

results = []
for chunk in chunks:
    chunk.columns = [c.lower().strip() for c in chunk.columns]
    mac = chunk[chunk['main commercial species'].astype(str).str.contains('mackerel', case=False, na=False)]
    if len(mac) > 0:
        results.append(mac)

df = pd.concat(results)
df['vol'] = pd.to_numeric(df['volume(kg)'].astype(str).str.replace(',','.'), errors='coerce')
df['val'] = pd.to_numeric(df['value(eur)'].astype(str).str.replace(',','.'), errors='coerce')
df['year'] = pd.to_numeric(df['year'], errors='coerce')

# China exports to EU by year
china_exp = df[(df['reporting country'].astype(str).str.contains('China', case=False)) & 
               (df['flow type'].astype(str).str.contains('Export', case=False))]

agg_cn_yr = china_exp.groupby('year')[['vol','val']].sum().reset_index()
agg_cn_yr['price'] = agg_cn_yr['val'] / agg_cn_yr['vol']
print("\n  China Export Volume & Price Trend:")
for _,r in agg_cn_yr.sort_values('year').iterrows():
    print(f"    {int(r['year'])}: {r['vol']/1000:,.0f}t at {r['price']:.2f}")

# Where does China's mackerel go?
china_dest = china_exp.groupby('partner country')[['vol','val']].sum().reset_index()
china_dest['price'] = china_dest['val'] / china_dest['vol']
china_dest = china_dest.sort_values('vol', ascending=False)
print("\n  China Top Mackerel Destinations:")
for _,r in china_dest.head(10).iterrows():
    print(f"    {r['partner country']}: {r['vol']/1000:,.0f}t at {r['price']:.2f}")

# By preservation
china_pres = china_exp.groupby('preservation')[['vol','val']].sum().reset_index()
china_pres['price'] = china_pres['val'] / china_pres['vol']
china_pres = china_pres.sort_values('vol', ascending=False)
print("\n  China Export by Preservation:")
for _,r in china_pres.iterrows():
    print(f"    {r['preservation']}: {r['vol']/1000:,.0f}t at {r['price']:.2f}")

