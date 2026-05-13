import pandas as pd

# Load CN8 details
df = pd.read_csv("data/EU/raw_csv/2024_Trade_data_reported_by_EU_countries_CN8_details.csv", sep='~')

# Filter for Spain imports of Falkland/Argentine frozen squid
squid = df[(df['country'] == 'Spain') & 
           (df['flow_type'].str.lower() == 'import') & 
           (df['main_commercial_species'].str.lower().str.contains('squid', na=False)) &
           (df['preservation'].str.lower().str.contains('frozen', na=False)) &
           (df['partner_contry'] == 'Falkland Islands')]

squid['price'] = squid['value(eur)'] / squid['volume(kg)']

# Group by month
monthly = squid.groupby('month').agg({'volume(kg)': 'sum', 'value(eur)': 'sum'})
monthly['avg_price'] = monthly['value(eur)'] / monthly['volume(kg)']

print("--- Spain Imports from Falkland (Frozen Squid) by Month ---")
print(monthly[['volume(kg)', 'avg_price']].sort_index())

# Now let's look at Italy's import price from Spain by month
italy_imports = df[(df['country'] == 'Italy') & 
                   (df['flow_type'].str.lower() == 'import') & 
                   (df['main_commercial_species'].str.lower().str.contains('squid', na=False)) &
                   (df['partner_contry'] == 'Spain')]

italy_imports['price'] = italy_imports['value(eur)'] / italy_imports['volume(kg)']
italy_monthly = italy_imports.groupby('month').agg({'volume(kg)': 'sum', 'value(eur)': 'sum'})
italy_monthly['avg_price'] = italy_monthly['value(eur)'] / italy_monthly['volume(kg)']

print("\n--- Italy Imports from Spain (All Squid) by Month ---")
print(italy_monthly[['volume(kg)', 'avg_price']].sort_index())
