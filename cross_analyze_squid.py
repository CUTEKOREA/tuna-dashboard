import pandas as pd
import numpy as np

# 1. Load Consumption Volume
print("Loading Consumption...")
df_cons = pd.read_csv('data/EU/raw_csv/Monthly_Consumption.csv', sep=';', encoding='utf-8')
df_cons.columns = df_cons.columns.str.strip().str.lower()
df_cons_squid = df_cons[df_cons['mcs'].str.lower().str.contains('squid', na=False)]

if not df_cons_squid.empty:
    df_cons_squid['volume(kg)'] = pd.to_numeric(df_cons_squid['volume(kg)'], errors='coerce')
    df_cons_squid['value(eur)'] = pd.to_numeric(df_cons_squid['value(eur)'], errors='coerce')
    cons_yearly = df_cons_squid.groupby('year').agg({'volume(kg)':'sum', 'value(eur)':'sum'}).reset_index()
    cons_yearly['retail_price_eur_kg'] = cons_yearly['value(eur)'] / cons_yearly['volume(kg)']
    print("\nYearly Consumption & Retail Price:")
    print(cons_yearly[['year', 'volume(kg)', 'retail_price_eur_kg']])

# 2. Load Import Unit Prices (from Trade data) to see cost inflation over years
print("\nLoading Trade Data for Unit Price...")
import glob
trade_files = glob.glob('data/EU/raw_csv/*Trade_data*.csv')
df_trade_list = []
for f in trade_files:
    try:
        df_t = pd.read_csv(f, sep='~', encoding='utf-8')
        df_t.columns = df_t.columns.str.strip().str.lower()
        if 'main_commercial_species' in df_t.columns:
            df_t_squid = df_t[df_t['main_commercial_species'].str.lower().str.contains('squid', na=False)]
            df_trade_list.append(df_t_squid)
    except:
        pass

if df_trade_list:
    trade = pd.concat(df_trade_list)
    trade['volume(kg)'] = pd.to_numeric(trade['volume(kg)'], errors='coerce')
    trade['value(eur)'] = pd.to_numeric(trade['value(eur)'], errors='coerce')
    
    # Calculate average unit price per year for imports
    imports = trade[trade['flow_type'].str.lower() == 'import']
    yearly_price = imports.groupby('year').agg({'volume(kg)':'sum', 'value(eur)':'sum'}).reset_index()
    yearly_price['import_price_eur_kg'] = yearly_price['value(eur)'] / yearly_price['volume(kg)']
    print("\nYearly Import Price (EUR/kg):")
    print(yearly_price[['year', 'import_price_eur_kg']])

