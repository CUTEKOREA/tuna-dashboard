import pandas as pd

df = pd.read_csv('data/EU/raw_csv/Yearly_Processing.csv', sep='~', encoding='utf-8')
df_squid = df[df['prodcom_desc'].str.lower().str.contains('squid', na=False)]
df_squid['volume(kg)'] = pd.to_numeric(df_squid['volume(kg)'], errors='coerce')
df_squid['value(EUR)'] = pd.to_numeric(df_squid['value(EUR)'], errors='coerce')

summary = df_squid.groupby('country').agg({'volume(kg)':'sum', 'value(EUR)':'sum'}).sort_values(by='volume(kg)', ascending=False)
summary['unit_price'] = summary['value(EUR)'] / summary['volume(kg)']

print("Top EU Squid Processors:")
print(summary)

print("\nProcessed Squid Output over Years:")
print(df_squid.groupby('year').agg({'volume(kg)':'sum', 'value(EUR)':'sum'}))
