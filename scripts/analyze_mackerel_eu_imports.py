import pandas as pd
import glob
import json

import_files = sorted(glob.glob('data/EU/raw_csv/*_EU Import from third countries.csv'))

results = {}
yearly_origin = {}

for f in import_files:
    try:
        df = pd.read_csv(f, sep='~', on_bad_lines='skip', encoding='utf-8')
        cols = [c.upper() for c in df.columns]
        df.columns = cols
        
        if 'GOODS' in cols and 'ORIGIN' in cols and 'VOLUME(KG)' in cols:
            mac_df = df[df['GOODS'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
            mac_df['VOLUME(KG)'] = pd.to_numeric(mac_df['VOLUME(KG)'].astype(str).str.replace(',', '.'), errors='coerce')
            mac_df['VALUE(EUR)'] = pd.to_numeric(mac_df['VALUE(EUR)'].astype(str).str.replace(',', '.'), errors='coerce')
            
            for _, r in mac_df.dropna(subset=['VOLUME(KG)']).iterrows():
                origin = r['ORIGIN']
                vol = r['VOLUME(KG)']
                val = r.get('VALUE(EUR)', 0)
                year = r.get('YEAR', '2024')
                
                if origin not in results:
                    results[origin] = {'volume': 0, 'value': 0}
                results[origin]['volume'] += vol
                if pd.notna(val):
                    results[origin]['value'] += val
                    
                # Track yearly
                if origin not in yearly_origin:
                    yearly_origin[origin] = {}
                if year not in yearly_origin[origin]:
                    yearly_origin[origin][year] = 0
                yearly_origin[origin][year] += vol
    except Exception as e:
        pass

# Sort partners by volume
sorted_partners = sorted(results.items(), key=lambda x: x[1]['volume'], reverse=True)

print("Top 10 Non-EU Mackerel Suppliers to Europe:")
for p, data in sorted_partners[:10]:
    print(f"{p}: {data['volume']/1000:,.0f} tons, {data['value']/1000000:,.1f} M EUR")

# We can find out if there's a surprise origin. E.g., China, Morocco, Mauritania, Faroe Islands, UK, Norway, Russia.
