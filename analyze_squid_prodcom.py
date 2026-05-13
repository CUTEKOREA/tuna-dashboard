import pandas as pd

df = pd.read_csv('data/EU/raw_csv/Yearly_Processing.csv', sep='~', encoding='utf-8')
df_squid = df[df['prodcom_desc'].str.lower().str.contains('squid', na=False)]

# Group by exact product description
prod_grouped = df_squid.groupby('prodcom_desc').agg({
    'volume(kg)': lambda x: pd.to_numeric(x, errors='coerce').sum(),
    'value(EUR)': lambda x: pd.to_numeric(x, errors='coerce').sum()
}).reset_index()

prod_grouped['unit_price'] = prod_grouped['value(EUR)'] / prod_grouped['volume(kg)']
print(prod_grouped.sort_values(by='unit_price', ascending=False))
