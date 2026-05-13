import pandas as pd
import json

file_path = 'data/EU/raw_csv/2024_Trade_data_reported_by_EU_countries.csv'
df = pd.read_csv(file_path, sep=';', on_bad_lines='skip', encoding='utf-8')
cols = [c.upper() for c in df.columns]
df.columns = cols

mac_df = df[df['MAIN_COMMERCIAL_SPECIES'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
mac_df['VOLUME(KG)'] = pd.to_numeric(mac_df['VOLUME(KG)'].astype(str).str.replace(',', '.'), errors='coerce')
mac_df['VALUE(EUR)'] = pd.to_numeric(mac_df['VALUE(EUR)'].astype(str).str.replace(',', '.'), errors='coerce')

# Check preservation state
agg = mac_df.groupby(['FLOW_TYPE', 'PRESERVATION'])[['VOLUME(KG)', 'VALUE(EUR)']].sum().reset_index()
agg['PRICE_PER_KG'] = agg['VALUE(EUR)'] / agg['VOLUME(KG)']

print("--- EU Mackerel Trade by Preservation State (2024) ---")
for _, r in agg.sort_values(by=['FLOW_TYPE', 'VOLUME(KG)'], ascending=[True, False]).iterrows():
    if r['VOLUME(KG)'] > 0:
        print(f"{r['FLOW_TYPE']} | {r['PRESERVATION']}: {r['VOLUME(KG)']/1000:,.0f} tons, {r['VALUE(EUR)']/1000000:,.1f} M EUR (Avg: {r['PRICE_PER_KG']:.2f} EUR/kg)")

