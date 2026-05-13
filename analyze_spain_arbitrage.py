import pandas as pd
import glob

files = glob.glob('data/EU/raw_csv/*Trade_data_reported_by_EU_countries*.csv')
df_list = []
for f in files:
    try:
        df = pd.read_csv(f, sep='~', encoding='utf-8')
        df.columns = df.columns.str.strip().str.lower()
        if 'main_commercial_species' in df.columns:
            df_s = df[df['main_commercial_species'].str.lower().str.contains('squid', na=False)]
            # Filter for Spain as reporter
            df_spain = df_s[df_s['country'].str.lower() == 'spain']
            df_list.append(df_spain)
    except:
        pass

if df_list:
    trade = pd.concat(df_list)
    trade['volume(kg)'] = pd.to_numeric(trade['volume(kg)'], errors='coerce')
    trade['value(eur)'] = pd.to_numeric(trade['value(eur)'], errors='coerce')
    
    # Calculate Import Price vs Export Price for Spain
    flows = trade.groupby('flow_type').agg({'volume(kg)':'sum', 'value(eur)':'sum'}).reset_index()
    flows['unit_price'] = flows['value(eur)'] / flows['volume(kg)']
    print("=== Spain Overall Trade Arbitrage ===")
    print(flows)

    # Let's break down Import origins
    imports = trade[trade['flow_type'].str.lower() == 'import']
    import_origins = imports.groupby('partner_contry').agg({'volume(kg)':'sum', 'value(eur)':'sum'}).reset_index()
    import_origins['unit_price'] = import_origins['value(eur)'] / import_origins['volume(kg)']
    print("\n=== Spain: Where do they buy cheap? (Top 5 by Volume) ===")
    print(import_origins.sort_values(by='volume(kg)', ascending=False).head(5))

    # Let's break down Export destinations
    exports = trade[trade['flow_type'].str.lower() == 'export']
    export_dests = exports.groupby('partner_contry').agg({'volume(kg)':'sum', 'value(eur)':'sum'}).reset_index()
    export_dests['unit_price'] = export_dests['value(eur)'] / export_dests['volume(kg)']
    print("\n=== Spain: Where do they sell high? (Top 5 by Volume) ===")
    print(export_dests.sort_values(by='volume(kg)', ascending=False).head(5))

