import pandas as pd

file_path = 'data/EU/raw_csv/Yearly_Processing.csv'
df = pd.read_csv(file_path, sep='~', on_bad_lines='skip', encoding='utf-8')
cols = [c.upper() for c in df.columns]
df.columns = cols

mac_df = df[df['PRODCOM_DESC'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
mac_df['VALUE(EUR)'] = pd.to_numeric(mac_df['VALUE(EUR)'].astype(str).str.replace(',', '.'), errors='coerce')
mac_df['VOLUME(KG)'] = pd.to_numeric(mac_df['VOLUME(KG)'].astype(str).str.replace(',', '.'), errors='coerce')
mac_df['YEAR'] = pd.to_numeric(mac_df.get('YEAR', 2020), errors='coerce')

# Let's filter for 2022 (recent complete year)
mac_df_recent = mac_df[mac_df['YEAR'] == 2022]

# Aggregate by country
agg = mac_df_recent.groupby('COUNTRY')[['VALUE(EUR)', 'VOLUME(KG)']].sum().reset_index()
agg = agg.sort_values(by='VALUE(EUR)', ascending=False)

print("--- 2022 Top EU Processors of Mackerel ---")
for _, r in agg.head(5).iterrows():
    print(f"{r['COUNTRY']}: {r['VALUE(EUR)']/1000000:,.1f} M EUR, {r['VOLUME(KG)']/1000:,.0f} tons (Margin: {r['VALUE(EUR)']/r['VOLUME(KG)']:,.2f} EUR/kg)")

