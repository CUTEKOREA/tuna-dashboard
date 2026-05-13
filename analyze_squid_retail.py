import pandas as pd
import glob

files = glob.glob('data/EU/raw_csv/*Daily-online retail prices*.csv')
df_list = []
for f in files:
    try:
        df = pd.read_csv(f, sep=';', encoding='utf-8')
        df_squid = df[df['PRODUCT'].str.lower().str.contains('squid', na=False)]
        df_list.append(df_squid)
    except:
        pass

if df_list:
    squid_retail = pd.concat(df_list)
    squid_retail['PRICE PER KG (EUR)'] = pd.to_numeric(squid_retail['PRICE PER KG (EUR)'].astype(str).str.replace(',', '.'), errors='coerce')
    print("Squid Retail Shape:", squid_retail.shape)
    
    if not squid_retail.empty:
        yearly_price = squid_retail.groupby('YEAR')['PRICE PER KG (EUR)'].mean()
        print("\nAverage Retail Price by Year (EUR/kg):")
        print(yearly_price)
        
        print("\nRetail Price by Category (Fresh/Frozen/Processed):")
        print(squid_retail.groupby('CATEGORY')['PRICE PER KG (EUR)'].mean())

        print("\nAverage Retail Price by Country (latest year):")
        latest_year = squid_retail['YEAR'].max()
        print(squid_retail[squid_retail['YEAR'] == latest_year].groupby('COUNTRY')['PRICE PER KG (EUR)'].mean().sort_values(ascending=False))

