import pandas as pd

# === ANALYSIS: Spain port-level first sale (180MB file) ===
print("=== SPAIN: Port-Level Mackerel First Sale ===")
df = pd.read_csv('data/EU/raw_csv/ES_first_sale_by_ERS_code.csv', sep=';', on_bad_lines='skip', encoding='utf-8')
df.columns = [c.lower().strip() for c in df.columns]

mac = df[df['english_name'].astype(str).str.contains('mackerel', case=False, na=False)].copy()
mac['vol'] = pd.to_numeric(mac['volume(kg)'].astype(str).str.replace(',','.'), errors='coerce')
mac['val'] = pd.to_numeric(mac['value(eur)'].astype(str).str.replace(',','.'), errors='coerce')
mac['year'] = pd.to_numeric(mac['year'], errors='coerce')

# By port (location)
agg_port = mac.groupby('location')[['vol','val']].sum().reset_index()
agg_port['price'] = agg_port['val'] / agg_port['vol']
agg_port = agg_port[agg_port['vol'] > 100000].sort_values('price', ascending=False)
print("\n  Top Premium Ports (Price DESC):")
for _,r in agg_port.head(8).iterrows():
    print(f"    {r['location']}: {r['vol']/1000:,.0f}t at {r['price']:.2f} EUR/kg")
print("\n  Cheapest Ports (Price ASC):")
for _,r in agg_port.tail(8).iterrows():
    print(f"    {r['location']}: {r['vol']/1000:,.0f}t at {r['price']:.2f} EUR/kg")

# Spain yearly price trend
print("\n  Spain First Sale Yearly Trend:")
agg_yr = mac.groupby('year')[['vol','val']].sum().reset_index()
agg_yr['price'] = agg_yr['val'] / agg_yr['vol']
for _,r in agg_yr.sort_values('year').iterrows():
    print(f"    {int(r['year'])}: {r['vol']/1000:,.0f}t at {r['price']:.2f}")

