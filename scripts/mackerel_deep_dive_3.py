import pandas as pd

# === ANALYSIS 3: Landings Collapse vs Price Surge (Stagflation) ===
print("=== Mackerel Stagflation: Volume Collapse vs Price Surge ===")
df = pd.read_csv('data/EU/raw_csv/Yearly_Landings.csv', sep='~', on_bad_lines='skip', encoding='utf-8')
cols = [c.upper() for c in df.columns]
df.columns = cols

mac = df[df['MAIN_COMMERCIAL_SPECIES'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
mac['VOLUME(KG)'] = pd.to_numeric(mac['VOLUME(KG)'].astype(str).str.replace(',','.'), errors='coerce')
mac['VALUE(EUR)'] = pd.to_numeric(mac['VALUE(EUR)'].astype(str).str.replace(',','.'), errors='coerce')
mac['YEAR'] = pd.to_numeric(mac['YEAR'], errors='coerce')

# Cross-reference with retail prices
retail_data = {2021: 2.04, 2022: 2.22, 2023: 2.49}
landing_agg = mac.groupby('YEAR')[['VOLUME(KG)']].sum().reset_index()
for _,r in landing_agg.sort_values('YEAR').iterrows():
    y = int(r['YEAR'])
    ret = retail_data.get(y, 'N/A')
    print(f"  {y}: Landings={r['VOLUME(KG)']/1000:,.0f}t, Retail={ret}")

# Decline rate
v2010 = landing_agg[landing_agg['YEAR']==2010]['VOLUME(KG)'].values[0]
v2023 = landing_agg[landing_agg['YEAR']==2023]['VOLUME(KG)'].values[0]
print(f"\n  COLLAPSE: 2010 ({v2010/1000:,.0f}t) -> 2023 ({v2023/1000:,.0f}t) = {(v2023-v2010)/v2010*100:.1f}%")
print(f"  RETAIL SURGE: 2021 (2.04) -> 2023 (2.49) = +22.1%")

# === Country-level first sale price disparities ===
print("\n=== ANALYSIS 4: First Sale Country Price Disparities ===")
fs = pd.read_csv('data/EU/raw_csv/2019_2025_first_sale_yearly.csv', sep=';', on_bad_lines='skip', encoding='utf-8')
cols2 = [c.upper() for c in fs.columns]
fs.columns = cols2
print("Cols:", cols2[:10])

