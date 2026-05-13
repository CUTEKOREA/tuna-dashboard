import pandas as pd

# === CN8 Detail: Product-Level Trade (248MB) ===
print("=== CN8 Detail Product Codes for Mackerel ===")
# Only read first few rows to get structure
head = pd.read_csv('data/EU/raw_csv/2024_Trade_data_reported_by_EU_countries_CN8_details.csv', sep=';', on_bad_lines='skip', encoding='utf-8', nrows=3)
print("Cols:", list(head.columns)[:15])
print()

# Read full but filter quickly
print("Loading CN8 detail data (2024)...")
chunks = pd.read_csv('data/EU/raw_csv/2024_Trade_data_reported_by_EU_countries_CN8_details.csv', 
                      sep=';', on_bad_lines='skip', encoding='utf-8', chunksize=500000)

results = []
for chunk in chunks:
    chunk.columns = [c.lower().strip() for c in chunk.columns]
    mac = chunk[chunk['cn8_description'].astype(str).str.contains('mackerel', case=False, na=False)]
    if len(mac) > 0:
        results.append(mac)

if results:
    df = pd.concat(results)
    df['vol'] = pd.to_numeric(df['volume(kg)'].astype(str).str.replace(',','.'), errors='coerce')
    df['val'] = pd.to_numeric(df['value(eur)'].astype(str).str.replace(',','.'), errors='coerce')
    
    # By CN8 product description
    agg = df.groupby('cn8_description')[['vol','val']].sum().reset_index()
    agg['price'] = agg['val'] / agg['vol']
    agg = agg[agg['vol']>10000].sort_values('price', ascending=False)
    
    print("\n  Mackerel Product Types by Unit Value (EUR/kg):")
    for _,r in agg.iterrows():
        print(f"    {r['cn8_description'][:70]}: {r['vol']/1000:,.0f}t at {r['price']:.2f}")
else:
    print("No mackerel found in CN8 data")

