import pandas as pd
import glob
import os

path = 'data/EU/raw_csv/'
trade_files = glob.glob(path + '*Trade_data_reported_by_EU_countries.csv')

trade_dfs = []
for f in trade_files:
    try:
        df = pd.read_csv(f, sep=';', on_bad_lines='skip')
        mac_df = df[df['main_commercial_species'].astype(str).str.contains('Mackerel', case=False, na=False)]
        trade_dfs.append(mac_df)
    except Exception as e:
        print("Error reading", f, e)

if trade_dfs:
    trade_df = pd.concat(trade_dfs)
    trade_df['value(EUR)'] = pd.to_numeric(trade_df['value(EUR)'], errors='coerce')
    trade_df['volume(kg)'] = pd.to_numeric(trade_df['volume(kg)'], errors='coerce')
    
    summary = trade_df.groupby(['year', 'flow_type'])[['value(EUR)', 'volume(kg)']].sum()
    summary['price_per_kg'] = summary['value(EUR)'] / summary['volume(kg)']
    print("=== Mackerel Trade Volume and Price (EU) ===")
    print(summary)
    
    # Extra EU vs Intra EU export price gap over years
    extra_export = trade_df[(trade_df['flow_type']=='Export') & (trade_df['intra_extra_EU']=='Extra EU')]
    ex_summary = extra_export.groupby('year')[['value(EUR)', 'volume(kg)']].sum()
    ex_summary['Extra_EU_Export_Price'] = ex_summary['value(EUR)'] / ex_summary['volume(kg)']
    print("\n=== Extra EU Export Prices ===")
    print(ex_summary)

