import pandas as pd
import glob
import json

import_files = sorted(glob.glob('data/EU/raw_csv/*_EU Import from third countries.csv'))

results = {}

for f in import_files:
    try:
        df = pd.read_csv(f, sep='~', on_bad_lines='skip', encoding='utf-8')
        cols = [c.upper() for c in df.columns]
        df.columns = cols
        
        if 'GOODS' in cols and 'ORIGIN' in cols and 'VOLUME(KG)' in cols:
            mac_df = df[df['GOODS'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
            mac_df['VOLUME(KG)'] = pd.to_numeric(mac_df['VOLUME(KG)'].astype(str).str.replace(',', '.'), errors='coerce')
            mac_df['VALUE(EUR)'] = pd.to_numeric(mac_df['VALUE(EUR)'].astype(str).str.replace(',', '.'), errors='coerce')
            
            for _, r in mac_df.dropna(subset=['VOLUME(KG)', 'VALUE(EUR)']).iterrows():
                origin = r['ORIGIN']
                vol = r['VOLUME(KG)']
                val = r['VALUE(EUR)']
                year = r.get('YEAR', '2024')
                
                if origin not in results:
                    results[origin] = {}
                if year not in results[origin]:
                    results[origin][year] = {'vol': 0, 'val': 0}
                    
                results[origin][year]['vol'] += vol
                results[origin][year]['val'] += val
    except Exception as e:
        pass

targets = ['Cape Verde', 'Morocco', 'United Kingdom', 'Korea, Republic of', 'China']

data = []
for y in [2021, 2022, 2023, 2024, 2025, 2026]:
    row = {'year': str(y)}
    for t in targets:
        if t in results and y in results[t]:
            vol = results[t][y]['vol']
            val = results[t][y]['val']
            price = val / vol if vol > 0 else 0
            row[f"{t.replace(' ', '_').replace(',','')}_Price"] = round(price, 2)
    data.append(row)

print(json.dumps(data, indent=2))
