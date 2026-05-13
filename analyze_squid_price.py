import pandas as pd
import glob

files = glob.glob('data/EU/raw_csv/*EU Import from third countries*.csv')
df_list = []
for f in files:
    try:
        df = pd.read_csv(f, sep='~', encoding='utf-8')
        df_squid = df[df['goods'].str.lower().str.contains('squid', na=False)]
        df_list.append(df_squid)
    except:
        pass

if df_list:
    squid_imports = pd.concat(df_list)
    squid_imports['volume(Kg)'] = pd.to_numeric(squid_imports['volume(Kg)'], errors='coerce')
    squid_imports['value(EUR)'] = pd.to_numeric(squid_imports['value(EUR)'], errors='coerce')
    
    summary = squid_imports.groupby('origin').agg({'volume(Kg)':'sum', 'value(EUR)':'sum'})
    summary = summary[summary['volume(Kg)'] > 10000000] # more than 10k tons
    summary['unit_price_EUR'] = summary['value(EUR)'] / summary['volume(Kg)']
    print("Unit Price by Origin (Top Suppliers):")
    print(summary.sort_values(by='unit_price_EUR', ascending=False)[['volume(Kg)', 'unit_price_EUR']])

