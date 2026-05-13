import pandas as pd

# Load CN8 details
df = pd.read_csv("data/EU/raw_csv/2024_Trade_data_reported_by_EU_countries_CN8_details.csv", sep='~')

# Filter for Spain
spain = df[df['country'] == 'Spain']

# Get import price by preservation
imports = spain[(spain['flow_type'].str.lower() == 'import') & 
                (spain['main_commercial_species'].str.lower().str.contains('squid', na=False))]

print("--- Spain Imports by Preservation ---")
import_agg = imports.groupby('preservation').agg({'volume(kg)': 'sum', 'value(eur)': 'sum'})
import_agg['avg_price'] = import_agg['value(eur)'] / import_agg['volume(kg)']
print(import_agg[['volume(kg)', 'avg_price']].sort_values('volume(kg)', ascending=False))

# Get export price by preservation
exports = spain[(spain['flow_type'].str.lower() == 'export') & 
                (spain['main_commercial_species'].str.lower().str.contains('squid', na=False))]

print("\n--- Spain Exports by Preservation ---")
export_agg = exports.groupby('preservation').agg({'volume(kg)': 'sum', 'value(eur)': 'sum'})
export_agg['avg_price'] = export_agg['value(eur)'] / export_agg['volume(kg)']
print(export_agg[['volume(kg)', 'avg_price']].sort_values('volume(kg)', ascending=False))

