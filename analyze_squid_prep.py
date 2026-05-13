import pandas as pd
df = pd.read_csv("data/EU/raw_csv/2024_Trade_data_reported_by_EU_countries_CN8_details.csv", sep='~')

imports = df[(df['flow_type'].str.lower() == 'import') & 
                (df['main_commercial_species'].str.lower().str.contains('squid', na=False))]

agg = imports.groupby(['country', 'preservation']).agg({'volume(kg)': 'sum', 'value(eur)': 'sum'})
agg['avg_price'] = agg['value(eur)'] / agg['volume(kg)']
print(agg.reset_index().sort_values('avg_price', ascending=False).head(20))
