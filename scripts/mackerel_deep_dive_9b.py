import pandas as pd

# CN8 uses ~ separator
print("Loading CN8 detail (2024)...")
chunks = pd.read_csv('data/EU/raw_csv/2024_Trade_data_reported_by_EU_countries_CN8_details.csv', 
                      sep='~', on_bad_lines='skip', encoding='utf-8', chunksize=500000)

results = []
for chunk in chunks:
    chunk.columns = [c.lower().strip() for c in chunk.columns]
    mac = chunk[chunk['desc_cn8'].astype(str).str.contains('mackerel', case=False, na=False)]
    if len(mac) > 0:
        results.append(mac)

if results:
    df = pd.concat(results)
    df['vol'] = pd.to_numeric(df['volume(kg)'].astype(str).str.replace(',','.'), errors='coerce')
    df['val'] = pd.to_numeric(df['value(eur)'].astype(str).str.replace(',','.'), errors='coerce')
    
    agg = df.groupby('desc_cn8')[['vol','val']].sum().reset_index()
    agg['price'] = agg['val'] / agg['vol']
    agg = agg[agg['vol']>5000].sort_values('price', ascending=False)
    
    print("\n  Mackerel Product Codes by Unit Value (EUR/kg):")
    for _,r in agg.iterrows():
        desc = r['desc_cn8'][:80] if isinstance(r['desc_cn8'], str) else str(r['desc_cn8'])[:80]
        print(f"    {desc}: {r['vol']/1000:,.0f}t at {r['price']:.2f}")
else:
    print("No mackerel found")

