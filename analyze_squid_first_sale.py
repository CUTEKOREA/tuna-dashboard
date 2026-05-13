import pandas as pd

df = pd.read_csv('data/EU/raw_csv/First_sale_weekly_by_ERS.csv', sep=';', encoding='utf-8', header=None, names=['year','week','country','location','category','ERS_species','ERS_code','species','size','presentation','preservation','volume','weight_unit','value'])

df_squid = df[df['ERS_species'].str.lower().str.contains('squid', na=False)]
df_squid['volume'] = pd.to_numeric(df_squid['volume'], errors='coerce')
df_squid['value'] = pd.to_numeric(df_squid['value'], errors='coerce')

# Drop NA
df_squid = df_squid.dropna(subset=['volume', 'value'])

# Calculate Unit Price
summary = df_squid.groupby(['species', 'preservation']).agg({'volume':'sum', 'value':'sum'})
summary['unit_price'] = summary['value'] / summary['volume']
print("First Sale Unit Price by Species and Preservation:")
print(summary.sort_values(by='unit_price', ascending=False)[['volume', 'unit_price']])

