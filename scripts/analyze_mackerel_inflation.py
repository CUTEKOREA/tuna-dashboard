import pandas as pd
import glob

ret_files = sorted(glob.glob('data/EU/raw_csv/*Daily-online retail prices.csv'))
data = []
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
                    data.append({
                        'year': int(r.get('YEAR', 2020)),
                        'country': r['COUNTRY'],
                        'price': price
                    })
    except Exception as e:
        pass

df = pd.DataFrame(data)
agg = df.groupby('year')['price'].mean().reset_index()
print("--- EU Mackerel Average Retail Price (EUR/kg) ---")
for _, r in agg.iterrows():
    print(f"{int(r['year'])}: {r['price']:.2f} EUR/kg")

# Also by top countries
print("\n--- By Top Countries ---")
agg_cty = df[df['country'].isin(['France', 'Spain', 'Germany', 'Italy'])].groupby(['year', 'country'])['price'].mean().reset_index()
for cty in ['France', 'Spain', 'Germany', 'Italy']:
    print(cty)
    cty_data = agg_cty[agg_cty['country'] == cty]
    for _, r in cty_data.iterrows():
        print(f"  {int(r['year'])}: {r['price']:.2f}")

