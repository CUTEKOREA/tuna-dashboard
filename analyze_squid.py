import pandas as pd
import glob

print("--- EU Imports of Squid from Third Countries ---")
files = glob.glob('data/EU/raw_csv/*EU Import from third countries*.csv')
df_list = []
for f in files:
    try:
        df = pd.read_csv(f, sep='~', encoding='utf-8')
        df_squid = df[df['goods'].str.lower().str.contains('squid', na=False)]
        df_list.append(df_squid)
    except Exception as e:
        print("Error reading", f, e)

if df_list:
    squid_imports = pd.concat(df_list)
    squid_imports['volume(Kg)'] = pd.to_numeric(squid_imports['volume(Kg)'], errors='coerce')
    squid_imports['value(EUR)'] = pd.to_numeric(squid_imports['value(EUR)'], errors='coerce')
    print("Squid Imports shape:", squid_imports.shape)
    summary = squid_imports.groupby('origin').agg({'volume(Kg)':'sum', 'value(EUR)':'sum'}).sort_values(by='volume(Kg)', ascending=False)
    print("\nTop Origins by Volume:")
    print(summary.head(10))
    print("\nTrend by Year:")
    print(squid_imports.groupby('year').agg({'volume(Kg)':'sum', 'value(EUR)':'sum'}))

print("\n--- Monthly Consumption of Squid ---")
df_mc = pd.read_csv('data/EU/raw_csv/Monthly_Consumption.csv', sep=';', encoding='utf-8')
squid_cons = df_mc[df_mc['CG'].str.lower().str.contains('squid', na=False)]
print("Categories:", squid_cons['CG'].unique())
if not squid_cons.empty:
    squid_cons['volume(Kg)'] = pd.to_numeric(squid_cons['volume(Kg)'], errors='coerce')
    print(squid_cons.groupby('year').agg({'volume(Kg)':'sum', 'value(EUR)':'sum'}))

