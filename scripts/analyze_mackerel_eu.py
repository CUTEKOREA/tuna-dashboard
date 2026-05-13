import pandas as pd
import glob
import json

# 1. First Sale
first_files = sorted(glob.glob('data/EU/raw_csv/*_first_sale_by_ERS_code.csv'))
fs_data = []
for f in first_files:
    try:
        df = pd.read_csv(f, sep=';', on_bad_lines='skip', encoding='utf-8')
        cols = [c.upper() for c in df.columns]
        df.columns = cols
        
        if 'ENGLISH_NAME' in cols and 'VALUE(EUR)' in cols and 'VOLUME(KG)' in cols:
            mac_df = df[df['ENGLISH_NAME'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
            mac_df['VALUE(EUR)'] = pd.to_numeric(mac_df['VALUE(EUR)'].astype(str).str.replace(',', '.'), errors='coerce')
            mac_df['VOLUME(KG)'] = pd.to_numeric(mac_df['VOLUME(KG)'].astype(str).str.replace(',', '.'), errors='coerce')
            
            mac_df['price'] = mac_df['VALUE(EUR)'] / mac_df['VOLUME(KG)']
            
            for _, r in mac_df.dropna(subset=['price']).iterrows():
                if r['price'] > 0:
                    fs_data.append({
                        'year': int(r.get('YEAR', 2020)),
                        'country': r['COUNTRY'],
                        'price': r['price']
                    })
    except Exception as e:
        pass

# 2. Retail Prices
ret_files = sorted(glob.glob('data/EU/raw_csv/*Daily-online retail prices.csv'))
ret_data = []
for f in ret_files:
    try:
        df = pd.read_csv(f, sep=';', on_bad_lines='skip', encoding='utf-8')
        cols = [c.upper() for c in df.columns]
        df.columns = cols
        
        if 'PRODUCT' in cols:
            mac_df = df[df['PRODUCT'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
            for _, r in mac_df.iterrows():
                val_kg = str(r.get('PRICE PER KG (EUR)', '')).replace(',', '.').strip()
                val_unit = str(r.get('PRICE PER UNIT (EUR)', '')).replace(',', '.').strip()
                
                price = pd.to_numeric(val_kg, errors='coerce')
                if pd.isna(price):
                    price = pd.to_numeric(val_unit, errors='coerce')
                
                if pd.notna(price) and price > 0:
                    ret_data.append({
                        'year': int(r.get('YEAR', 2020)),
                        'country': r['COUNTRY'],
                        'price': price
                    })
    except Exception as e:
        pass

df_fs = pd.DataFrame(fs_data)
df_ret = pd.DataFrame(ret_data)

print(f"First sale points: {len(df_fs)}")
print(f"Retail points: {len(df_ret)}")

if len(df_fs) > 0 and len(df_ret) > 0:
    fs_agg = df_fs.groupby(['year', 'country'])['price'].mean().reset_index()
    ret_agg = df_ret.groupby(['year', 'country'])['price'].mean().reset_index()

    merged = pd.merge(fs_agg, ret_agg, on=['year', 'country'], suffixes=('_fs', '_ret'))
    merged['multiplier'] = merged['price_ret'] / merged['price_fs']
    
    res = merged[merged['multiplier'] > 1.0].sort_values(by=['multiplier'], ascending=False)
    
    out = res.to_dict('records')
    print(json.dumps(out[:20], indent=2))
    
    with open('data/mackerel_eu_multiplier.json', 'w') as f:
        json.dump(out, f, indent=2)

