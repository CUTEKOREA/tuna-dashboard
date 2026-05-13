import pandas as pd
import glob

files = glob.glob('data/EU/raw_csv/*Daily-online retail prices.csv')
df_list = []
for f in files:
    try:
        df = pd.read_csv(f, sep=';', encoding='utf-8', low_memory=False)
        df.columns = df.columns.str.strip().str.lower()
        if 'product' in df.columns:
            df_s = df[df['product'].str.lower().str.contains('squid', na=False)]
            df_list.append(df_s)
    except Exception as e:
        print("Error reading", f, e)

if df_list:
    retail = pd.concat(df_list)
    # the column name could be 'price per kg (eur)'
    # replace comma with dot if string
    if retail['price per kg (eur)'].dtype == 'O':
        retail['price'] = pd.to_numeric(retail['price per kg (eur)'].str.replace(',', '.'), errors='coerce')
    else:
        retail['price'] = pd.to_numeric(retail['price per kg (eur)'], errors='coerce')
    
    # Analyze by Country
    c_price = retail.groupby('country').agg({'price':['mean','max','count']}).reset_index()
    c_price.columns = ['country','mean_price','max_price','count']
    print("\n=== Retail Price by Country (Squid Rings) ===")
    print(c_price.sort_values(by='mean_price', ascending=False))

    # Analyze by Product Original (Specific Brands/Items)
    top_products = retail.groupby('product original').agg({'price':['mean','count']}).reset_index()
    top_products.columns = ['product','mean_price','count']
    top_products = top_products[top_products['count'] > 5]
    print("\n=== Top Most Expensive Squid Products in EU ===")
    print(top_products.sort_values(by='mean_price', ascending=False).head(15))

