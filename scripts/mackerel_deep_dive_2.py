import pandas as pd

# === ANALYSIS 2: Netherlands Middleman Analysis ===
print("=== NETHERLANDS: Europe's Mackerel Middleman ===")

# 2024 Trade Data
df = pd.read_csv('data/EU/raw_csv/2024_Trade_data_reported_by_EU_countries.csv', sep=';', on_bad_lines='skip', encoding='utf-8')
cols = [c.upper() for c in df.columns]
df.columns = cols

mac = df[df['MAIN_COMMERCIAL_SPECIES'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
mac['VOLUME(KG)'] = pd.to_numeric(mac['VOLUME(KG)'].astype(str).str.replace(',','.'), errors='coerce')
mac['VALUE(EUR)'] = pd.to_numeric(mac['VALUE(EUR)'].astype(str).str.replace(',','.'), errors='coerce')

# Netherlands specifically
nl = mac[mac['COUNTRY']=='Netherlands']
nl_imp = nl[nl['FLOW_TYPE'].astype(str).str.contains('Import', case=False)]
nl_exp = nl[nl['FLOW_TYPE'].astype(str).str.contains('Export', case=False)]

imp_vol = nl_imp['VOLUME(KG)'].sum()
imp_val = nl_imp['VALUE(EUR)'].sum()
exp_vol = nl_exp['VOLUME(KG)'].sum()
exp_val = nl_exp['VALUE(EUR)'].sum()

print(f"  NL Import: {imp_vol/1000:,.0f} t, {imp_val/1000000:,.1f}M EUR (Avg: {imp_val/imp_vol:.2f})")
print(f"  NL Export: {exp_vol/1000:,.0f} t, {exp_val/1000000:,.1f}M EUR (Avg: {exp_val/exp_vol:.2f})")
print(f"  NL Margin:  Buy at {imp_val/imp_vol:.2f}, Sell at {exp_val/exp_vol:.2f} = +{(exp_val/exp_vol - imp_val/imp_vol):.2f} EUR/kg spread")
print(f"  NL Net Profit Estimate: {(exp_val - imp_val)/1000000:,.1f}M EUR")

# Where does NL export to?
print("\n  NL Export Destinations:")
nl_exp_dest = nl_exp.groupby('PARTNER_CONTRY')[['VOLUME(KG)','VALUE(EUR)']].sum().reset_index()
nl_exp_dest = nl_exp_dest.sort_values('VOLUME(KG)', ascending=False)
for _,r in nl_exp_dest.head(8).iterrows():
    p = r['VALUE(EUR)']/r['VOLUME(KG)'] if r['VOLUME(KG)']>0 else 0
    print(f"    {r['PARTNER_CONTRY']}: {r['VOLUME(KG)']/1000:,.0f} t at {p:.2f}")

# Where does NL import from?
print("\n  NL Import Sources:")
nl_imp_src = nl_imp.groupby('PARTNER_CONTRY')[['VOLUME(KG)','VALUE(EUR)']].sum().reset_index()
nl_imp_src = nl_imp_src.sort_values('VOLUME(KG)', ascending=False)
for _,r in nl_imp_src.head(8).iterrows():
    p = r['VALUE(EUR)']/r['VOLUME(KG)'] if r['VOLUME(KG)']>0 else 0
    print(f"    {r['PARTNER_CONTRY']}: {r['VOLUME(KG)']/1000:,.0f} t at {p:.2f}")

