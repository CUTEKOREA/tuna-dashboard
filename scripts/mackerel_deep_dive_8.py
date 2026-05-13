import pandas as pd

# === UK First Sale by Port ===
print("=== UK: Port-Level Mackerel First Sale ===")
df = pd.read_csv('data/EU/raw_csv/GB_first_sale_by_ERS_code.csv', sep=';', on_bad_lines='skip', encoding='utf-8')
df.columns = [c.lower().strip() for c in df.columns]

mac = df[df['english_name'].astype(str).str.contains('mackerel', case=False, na=False)].copy()
mac['vol'] = pd.to_numeric(mac['volume(kg)'].astype(str).str.replace(',','.'), errors='coerce')
mac['val'] = pd.to_numeric(mac['value(eur)'].astype(str).str.replace(',','.'), errors='coerce')
mac['year'] = pd.to_numeric(mac['year'], errors='coerce')

# Top volume ports
agg_port = mac.groupby('location')[['vol','val']].sum().reset_index()
agg_port['price'] = agg_port['val'] / agg_port['vol']
agg_port = agg_port[agg_port['vol'] > 50000].sort_values('vol', ascending=False)
print("\n  UK Top Mackerel Ports:")
for _,r in agg_port.head(10).iterrows():
    print(f"    {r['location']}: {r['vol']/1000:,.0f}t at {r['price']:.2f}")

# UK yearly trend
print("\n  UK First Sale Yearly:")
agg_yr = mac.groupby('year')[['vol','val']].sum().reset_index()
agg_yr['price'] = agg_yr['val'] / agg_yr['vol']
for _,r in agg_yr.sort_values('year').iterrows():
    print(f"    {int(r['year'])}: {r['vol']/1000:,.0f}t at {r['price']:.2f}")

# === Iceland vs Norway First Sale (ARBITRAGE OPPORTUNITY) ===
print("\n\n=== ICELAND vs NORWAY: Price Gap ===")
fs = pd.read_csv('data/EU/raw_csv/2019_2025_first_sale_yearly.csv', sep=';', on_bad_lines='skip', encoding='utf-8')
fs.columns = [c.lower().strip() for c in fs.columns]
mac_fs = fs[fs['english_name'].astype(str).str.contains('mackerel', case=False, na=False)].copy()
mac_fs['vol'] = pd.to_numeric(mac_fs['volume(kg)'].astype(str).str.replace(',','.'), errors='coerce')
mac_fs['val'] = pd.to_numeric(mac_fs['value(eur)'].astype(str).str.replace(',','.'), errors='coerce')
mac_fs['year'] = pd.to_numeric(mac_fs['year'], errors='coerce')

for cty in ['Iceland', 'Norway', 'Faroe Islands']:
    c = mac_fs[mac_fs['country']==cty].groupby('year')[['vol','val']].sum().reset_index()
    c['price'] = c['val'] / c['vol']
    print(f"\n  {cty}:")
    for _,r in c.sort_values('year').iterrows():
        if r['year'] >= 2021:
            print(f"    {int(r['year'])}: {r['vol']/1000:,.0f}t at {r['price']:.2f}")

