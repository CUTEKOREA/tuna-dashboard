import pandas as pd
import json

file_path = 'data/EU/raw_csv/Monthly_Consumption.csv'

try:
    df = pd.read_csv(file_path, sep=';', on_bad_lines='skip', encoding='utf-8')
    cols = [c.upper() for c in df.columns]
    df.columns = cols
    
    if 'MCS' in cols and 'COUNTRY' in cols and 'VALUE(EUR)' in cols:
        mac_df = df[df['MCS'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
        mac_df['VALUE(EUR)'] = pd.to_numeric(mac_df['VALUE(EUR)'].astype(str).str.replace(',', '.'), errors='coerce')
        mac_df['VOLUME(KG)'] = pd.to_numeric(mac_df['VOLUME(KG)'].astype(str).str.replace(',', '.'), errors='coerce')
        
        # Aggregate by country
        agg = mac_df.groupby('COUNTRY')[['VALUE(EUR)', 'VOLUME(KG)']].sum().reset_index()
        agg['PRICE_PER_KG'] = agg['VALUE(EUR)'] / agg['VOLUME(KG)']
        agg = agg.sort_values(by='VALUE(EUR)', ascending=False)
        
        for _, r in agg.head(10).iterrows():
            print(f"{r['COUNTRY']}: {r['VALUE(EUR)']/1000000:,.1f} M EUR, {r['VOLUME(KG)']/1000:,.0f} tons (Price: {r['PRICE_PER_KG']:,.2f} EUR/kg)")

except Exception as e:
    print("Error:", e)

