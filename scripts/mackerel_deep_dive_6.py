import pandas as pd

# === Iceland's Bizarre Pricing ===
print("=== ICELAND ANOMALY: Cheapest First Sale in Atlantic ===")
fs = pd.read_csv('data/EU/raw_csv/2019_2025_first_sale_yearly.csv', sep=';', on_bad_lines='skip', encoding='utf-8')
cols = [c.upper() for c in fs.columns]
fs.columns = cols

mac = fs[fs['ENGLISH_NAME'].astype(str).str.contains('mackerel', case=False, na=False)].copy()
mac['VOLUME(KG)'] = pd.to_numeric(mac['VOLUME(KG)'].astype(str).str.replace(',','.'), errors='coerce')
mac['VALUE(EUR)'] = pd.to_numeric(mac['VALUE(EUR)'].astype(str).str.replace(',','.'), errors='coerce')
mac['YEAR'] = pd.to_numeric(mac['YEAR'], errors='coerce')

# Iceland vs Norway vs UK comparison per year
for cty in ['Iceland', 'Norway', 'United Kingdom', 'Spain', 'Portugal']:
    c_data = mac[mac['COUNTRY']==cty].groupby('YEAR')[['VOLUME(KG)','VALUE(EUR)']].sum().reset_index()
    c_data['PRICE'] = c_data['VALUE(EUR)'] / c_data['VOLUME(KG)']
    prices = {int(r['YEAR']): r['PRICE'] for _,r in c_data.iterrows()}
    p24 = prices.get(2024, 0)
    p25 = prices.get(2025, 0)
    print(f"  {cty}: 2024={p24:.2f}, 2025={p25:.2f}")

# === Multi-year Comext: EU total mackerel trade balance ===
print("\n=== EU Mackerel Trade Balance (Comext Multi-year) ===")
cx = pd.read_csv('data/EU/raw_csv/2019_2025_Yearly_comext_mcs.csv', sep=';', on_bad_lines='skip', encoding='utf-8')
cx.columns = [c.lower().strip() for c in cx.columns]
mac_cx = cx[cx['main_commercial_species'].astype(str).str.contains('mackerel', case=False, na=False)].copy()
mac_cx['vol'] = pd.to_numeric(mac_cx['volume(kg)'].astype(str).str.replace(',','.'), errors='coerce')
mac_cx['val'] = pd.to_numeric(mac_cx['value(eur)'].astype(str).str.replace(',','.'), errors='coerce')

# Extra-EU trade balance
extra = mac_cx[mac_cx['intra_extra_eu'].astype(str).str.contains('Extra', case=False)]
for y in range(2019, 2026):
    yr = extra[extra['year']==y]
    imp = yr[yr['flow_type'].astype(str).str.contains('Import', case=False)]
    exp = yr[yr['flow_type'].astype(str).str.contains('Export', case=False)]
    imp_v = imp['vol'].sum()
    imp_e = imp['val'].sum()
    exp_v = exp['vol'].sum()
    exp_e = exp['val'].sum()
    balance = exp_e - imp_e
    if imp_v > 0 and exp_v > 0:
        print(f"  {y}: Import {imp_v/1000:,.0f}t ({imp_e/imp_v:.2f}), Export {exp_v/1000:,.0f}t ({exp_e/exp_v:.2f}), Balance: {balance/1000000:+,.1f}M")

