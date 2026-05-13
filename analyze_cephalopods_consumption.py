import pandas as pd

df = pd.read_csv('data/EU/raw_csv/Monthly_Consumption.csv', sep=';', encoding='utf-8')
df.columns = df.columns.str.strip().str.lower()
df_ceph = df[df['mcs'].str.lower() == 'cephalopods']

df_ceph['volume(kg)'] = pd.to_numeric(df_ceph['volume(kg)'], errors='coerce')
df_ceph['value(eur)'] = pd.to_numeric(df_ceph['value(eur)'], errors='coerce')

yearly = df_ceph.groupby('year').agg({'volume(kg)':'sum', 'value(eur)':'sum'}).reset_index()
yearly['retail_price_eur_kg'] = yearly['value(eur)'] / yearly['volume(kg)']

print("Cephalopods (Squid/Octopus/Cuttlefish) Retail Consumption & Price:")
print(yearly.sort_values(by='year'))
