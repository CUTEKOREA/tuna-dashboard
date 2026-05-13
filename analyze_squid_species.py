import pandas as pd

df = pd.read_csv("data/EU/raw_csv/2024_Trade_data_reported_by_EU_countries_CN8_details.csv", sep='~')

# Filter for Extra-EU Imports
imports = df[(df['flow_type'].str.lower() == 'import') & 
             (df['main_commercial_species'].str.lower().str.contains('squid', na=False))]

# Aggregate by main_commercial_species
agg = imports.groupby('main_commercial_species').agg({'volume(kg)': 'sum', 'value(eur)': 'sum'})
agg['avg_price'] = agg['value(eur)'] / agg['volume(kg)']

print("--- EU Imports by Species ---")
print(agg.reset_index().sort_values('volume(kg)', ascending=False))
