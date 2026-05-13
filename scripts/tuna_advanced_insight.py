import pandas as pd
import glob
import os
import warnings
warnings.filterwarnings('ignore')

def load_tuna_trade_data():
    files = glob.glob('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/EU/raw_csv/20*_Trade_data_reported_by_EU_countries.csv')
    df_list = []
    for f in files:
        df = pd.read_csv(f, sep=';', low_memory=False)
        # Filter for Tuna
        df = df[df['commodity_group'].str.contains('Tuna', na=False, case=False)]
        df_list.append(df)
    
    if df_list:
        combined = pd.concat(df_list, ignore_index=True)
        # Clean value and volume
        combined['value(EUR)'] = pd.to_numeric(combined['value(EUR)'], errors='coerce')
        combined['volume(kg)'] = pd.to_numeric(combined['volume(kg)'], errors='coerce')
        return combined
    return pd.DataFrame()

def load_tuna_retail_data():
    files = glob.glob('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/EU/raw_csv/20*_Daily-online retail prices.csv')
    df_list = []
    for f in files:
        df = pd.read_csv(f, sep=';', low_memory=False)
        df = df[df['PRODUCT'].str.contains('tuna|thunfisch|tonno|atun|thon', na=False, case=False)]
        df_list.append(df)
    
    if df_list:
        combined = pd.concat(df_list, ignore_index=True)
        combined['PRICE PER UNIT (EUR)'] = combined['PRICE PER UNIT (EUR)'].astype(str).str.replace(',', '.')
        combined['PRICE PER UNIT (EUR)'] = pd.to_numeric(combined['PRICE PER UNIT (EUR)'], errors='coerce')
        
        # Parse size/weight range
        def parse_weight(x):
            try:
                x = str(x).lower().replace(' ', '')
                if 'x' in x:
                    parts = x.split('g')[0].split('x')
                    return (float(parts[0]) * float(parts[1])) / 1000.0
                elif '-' in x:
                    parts = x.split('g')[0].split('-')
                    return ((float(parts[0]) + float(parts[1])) / 2) / 1000.0
                elif 'g' in x:
                    return float(x.split('g')[0]) / 1000.0
                elif 'kg' in x:
                    return float(x.split('kg')[0])
            except:
                pass
            return 0.2 # fallback 200g
            
        combined['weight_kg'] = combined['SIZE/WEIGHT RANGE'].apply(parse_weight)
        combined['PRICE PER KG (EUR)'] = combined['PRICE PER UNIT (EUR)'] / combined['weight_kg']
        
        return combined
    return pd.DataFrame()

if __name__ == "__main__":
    print("Loading EU Trade Data...")
    trade_df = load_tuna_trade_data()
    print("Loading EU Retail Data...")
    retail_df = load_tuna_retail_data()
    
    print("\n--- TUNA TRADE DATA INSIGHTS ---")
    if not trade_df.empty:
        # Calculate unit price
        trade_df['unit_price'] = trade_df['value(EUR)'] / trade_df['volume(kg)']
        trade_df = trade_df[(trade_df['unit_price'] > 0) & (trade_df['unit_price'] < 100)]
        
        print("1. Trade Price Trends by Preservation (Top 5)")
        preservation_trends = trade_df.groupby(['year', 'preservation'])['unit_price'].mean().unstack()
        print(preservation_trends.tail(3))
        
        print("\n2. Major Exporters to EU (Extra EU) - Margin Analysis")
        extra_eu = trade_df[trade_df['intra_extra_EU'] == 'Extra EU']
        extra_eu_imports = extra_eu[extra_eu['flow_type'] == 'Import']
        
        top_exporters = extra_eu_imports.groupby('partner_contry').agg(
            volume=('volume(kg)', 'sum'),
            avg_price=('unit_price', 'mean')
        ).sort_values('volume', ascending=False).head(10)
        print(top_exporters)
        
    print("\n--- TUNA RETAIL DATA INSIGHTS ---")
    if not retail_df.empty:
        print("1. Retail Price Trend by Country")
        retail_trends = retail_df.groupby(['YEAR', 'COUNTRY'])['PRICE PER KG (EUR)'].mean().unstack()
        print(retail_trends.tail(3))

        print("\n2. Retail Price by Product Presentation (Fresh vs Preserved/Canned)")
        cat_trends = retail_df.groupby(['YEAR', 'CATEGORY'])['PRICE PER KG (EUR)'].mean().unstack()
        print(cat_trends.tail(3))

