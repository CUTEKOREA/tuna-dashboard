import pandas as pd
import json

file_path = 'data/EU/raw_csv/First_sale_weekly_by_ERS.csv'
df = pd.read_csv(file_path, sep=';', on_bad_lines='skip', encoding='utf-8')
cols = [c.upper() for c in df.columns]
df.columns = cols

mac_df = df[df['ENGLISH_NAME'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
mac_df['VOLUME(KG)'] = pd.to_numeric(mac_df['VOLUME(KG)'].astype(str).str.replace(',', '.'), errors='coerce')
mac_df['VALUE(EUR)'] = pd.to_numeric(mac_df['VALUE(EUR)'].astype(str).str.replace(',', '.'), errors='coerce')
mac_df['WEEK_OF_YEAR'] = pd.to_numeric(mac_df['WEEK_OF_YEAR'], errors='coerce')

mac_df = mac_df.dropna(subset=['WEEK_OF_YEAR', 'VOLUME(KG)', 'VALUE(EUR)'])

agg = mac_df.groupby('WEEK_OF_YEAR')[['VOLUME(KG)', 'VALUE(EUR)']].sum().reset_index()
agg['PRICE_PER_KG'] = agg['VALUE(EUR)'] / agg['VOLUME(KG)']
agg = agg.sort_values(by='WEEK_OF_YEAR')

print("--- Mackerel Weekly First Sale Seasonality ---")
data = []
for _, r in agg.iterrows():
    if r['VOLUME(KG)'] > 0:
        print(f"Week {int(r['WEEK_OF_YEAR']):02d}: {r['VOLUME(KG)']/1000:,.0f} tons, Avg Price: {r['PRICE_PER_KG']:.2f} EUR/kg")

