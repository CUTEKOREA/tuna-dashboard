import pandas as pd
import glob

files = glob.glob('data/EU/raw_csv/*Daily-online retail prices.csv')
df_list = []
for f in files:
    try:
        df = pd.read_csv(f, sep=';', encoding='utf-8')
        df.columns = df.columns.str.strip().str.lower()
        if 'mcs' in df.columns:
            df_s = df[df['mcs'].str.lower() == 'cephalopods']
            df_list.append(df_s)
    except:
        pass

if df_list:
    retail = pd.concat(df_list)
    retail['price'] = pd.to_numeric(retail['price'], errors='coerce')
    
    # 1. Price by Country
    if 'country' in retail.columns:
        c_price = retail.groupby('country').agg({'price':['mean','max','count']}).reset_index()
        c_price.columns = ['country','mean_price','max_price','count']
        print("\n=== Retail Price by Country (Cephalopods) ===")
        print(c_price.sort_values(by='mean_price', ascending=False))
        
    # 2. Price by Presentation/Preservation
    if 'presentation' in retail.columns:
        p_price = retail.groupby('presentation').agg({'price':['mean','count']}).reset_index()
        p_price.columns = ['presentation','mean_price','count']
        print("\n=== Retail Price by Presentation (Cephalopods) ===")
        print(p_price.sort_values(by='mean_price', ascending=False))

    if 'preservation' in retail.columns:
        pr_price = retail.groupby('preservation').agg({'price':['mean','count']}).reset_index()
        pr_price.columns = ['preservation','mean_price','count']
        print("\n=== Retail Price by Preservation (Cephalopods) ===")
        print(pr_price.sort_values(by='mean_price', ascending=False))
