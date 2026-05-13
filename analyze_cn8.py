import pandas as pd
import glob

files = glob.glob('data/EU/raw_csv/*Trade_data_reported_by_EU_countries_CN8_details.csv')
df_list = []
for f in files:
    try:
        df = pd.read_csv(f, sep='~', encoding='utf-8', low_memory=False)
        df.columns = df.columns.str.strip().str.lower()
        if 'main_commercial_species' in df.columns:
            df_s = df[df['main_commercial_species'].str.lower().str.contains('squid', na=False)]
            df_spain = df_s[df_s['country'].str.lower() == 'spain']
            df_list.append(df_spain)
    except:
        pass

if df_list:
    trade = pd.concat(df_list)
    trade['volume(kg)'] = pd.to_numeric(trade['volume(kg)'], errors='coerce')
    trade['value(eur)'] = pd.to_numeric(trade['value(eur)'], errors='coerce')
    
    cn8_flow = trade.groupby(['flow_type', 'desc_cn8']).agg({'volume(kg)':'sum', 'value(eur)':'sum'}).reset_index()
    cn8_flow['unit_price'] = cn8_flow['value(eur)'] / cn8_flow['volume(kg)']
    
    prepared = cn8_flow[cn8_flow['desc_cn8'].str.lower().str.contains('prepared|preserved|ready', na=False)]
    print("\n=== Spain's Trade for Prepared/Preserved (Value-Added) Squid ===")
    print(prepared[['flow_type', 'desc_cn8', 'volume(kg)', 'unit_price']].sort_values(by=['flow_type', 'volume(kg)'], ascending=[True, False]))

