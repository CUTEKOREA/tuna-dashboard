import pandas as pd
import glob
import json

file_path = 'data/EU/raw_csv/2024_Trade_data_reported_by_EU_countries.csv'
df = pd.read_csv(file_path, sep=';', on_bad_lines='skip', encoding='utf-8')
cols = [c.upper() for c in df.columns]
df.columns = cols

mac_df = df[df['MAIN_COMMERCIAL_SPECIES'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
mac_df['VOLUME(KG)'] = pd.to_numeric(mac_df['VOLUME(KG)'].astype(str).str.replace(',', '.'), errors='coerce')
mac_df['VALUE(EUR)'] = pd.to_numeric(mac_df['VALUE(EUR)'].astype(str).str.replace(',', '.'), errors='coerce')

# Import (Flow_type = Import)
imports = mac_df[mac_df['FLOW_TYPE'].astype(str).str.contains('Import', case=False)]
agg_imp = imports.groupby('COUNTRY')[['VALUE(EUR)', 'VOLUME(KG)']].sum().reset_index()
agg_imp = agg_imp.sort_values(by='VOLUME(KG)', ascending=False)

print("--- Top EU Importers of Mackerel in 2024 ---")
for _, r in agg_imp.head(5).iterrows():
    print(f"{r['COUNTRY']}: {r['VOLUME(KG)']/1000:,.0f} tons, {r['VALUE(EUR)']/1000000:,.1f} M EUR")

# Exports (Flow_type = Export)
exports = mac_df[mac_df['FLOW_TYPE'].astype(str).str.contains('Export', case=False)]
agg_exp = exports.groupby('COUNTRY')[['VALUE(EUR)', 'VOLUME(KG)']].sum().reset_index()
agg_exp = agg_exp.sort_values(by='VOLUME(KG)', ascending=False)

print("\n--- Top EU Exporters of Mackerel in 2024 ---")
for _, r in agg_exp.head(5).iterrows():
    print(f"{r['COUNTRY']}: {r['VOLUME(KG)']/1000:,.0f} tons, {r['VALUE(EUR)']/1000000:,.1f} M EUR")

