import pandas as pd
import glob

files = sorted(glob.glob('data/EU/raw_csv/first_sale_by_ERS_code_*.csv'))
data = []

for f in files:
    try:
        df = pd.read_csv(f, sep='~', on_bad_lines='skip', encoding='utf-8')
        cols = [c.upper() for c in df.columns]
        df.columns = cols
        
        if 'COMMODITY' in cols and 'MONTH' in cols and 'VOLUME(KG)' in cols:
            mac_df = df[df['COMMODITY'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
            mac_df['VOLUME(KG)'] = pd.to_numeric(mac_df['VOLUME(KG)'].astype(str).str.replace(',', '.'), errors='coerce')
            mac_df['VALUE(EUR)'] = pd.to_numeric(mac_df['VALUE(EUR)'].astype(str).str.replace(',', '.'), errors='coerce')
            mac_df['MONTH'] = pd.to_numeric(mac_df['MONTH'], errors='coerce')
            
            for _, r in mac_df.dropna(subset=['MONTH', 'VOLUME(KG)', 'VALUE(EUR)']).iterrows():
                if r['VOLUME(KG)'] > 0:
                    data.append({
                        'month': int(r['MONTH']),
                        'volume': r['VOLUME(KG)'],
                        'value': r['VALUE(EUR)']
                    })
    except Exception as e:
        pass

df = pd.DataFrame(data)
if not df.empty:
    agg = df.groupby('month')[['volume', 'value']].sum().reset_index()
    agg['price'] = agg['value'] / agg['volume']
    
    print("--- Monthly Mackerel First Sale Seasonality ---")
    for _, r in agg.sort_values(by='month').iterrows():
        print(f"Month {int(r['month']):02d}: {r['volume']/1000:,.0f} tons, Avg Price: {r['price']:.2f} EUR/kg")
else:
    print("No data found")
