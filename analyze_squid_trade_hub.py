import pandas as pd
import glob

files = glob.glob('data/EU/raw_csv/*Trade_data_reported_by_EU_countries_CN8_details.csv')
df_list = []
for f in files:
    try:
        df = pd.read_csv(f, sep='~', encoding='utf-8')
        df_squid = df[df['main_commercial_species'].str.lower().str.contains('squid', na=False)]
        df_list.append(df_squid)
    except:
        pass

if df_list:
    trade = pd.concat(df_list)
    trade['volume(kg)'] = pd.to_numeric(trade['volume(kg)'], errors='coerce')
    
    # Filter by flow_type (Import vs Export)
    imports = trade[trade['flow_type'].str.lower() == 'import'].groupby('country').agg({'volume(kg)':'sum'}).sort_values(by='volume(kg)', ascending=False)
    exports = trade[trade['flow_type'].str.lower() == 'export'].groupby('country').agg({'volume(kg)':'sum'}).sort_values(by='volume(kg)', ascending=False)
    
    print("Top EU Importers of Squid:")
    print(imports.head(5))
    print("\nTop EU Exporters of Squid (Re-export / Intra-EU):")
    print(exports.head(5))
