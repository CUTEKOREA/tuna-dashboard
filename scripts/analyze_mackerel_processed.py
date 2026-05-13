import pandas as pd
import json

df = pd.read_csv('data/고등어/9. 고등어 가공 생산량 1976-2023.csv')
# Look at Commodity (Name)
# There are things like:
# 'Chub mackerel prepared or preserved, not minced'
# 'Mackerels nei, frozen'
# 'Atlantic mackerel prepared or preserved, not minced'
# 'Atlantic mackerel, frozen'

df['year_cols'] = [c for c in df.columns if '[' in c and ']' in c]

results = []
years = [str(y) for y in range(2000, 2024)]

global_frozen = {y: 0.0 for y in years}
global_prepared = {y: 0.0 for y in years}

for idx, row in df.iterrows():
    comm = str(row['Commodity (Name)']).lower()
    
    is_frozen = 'frozen' in comm
    is_prepared = 'prepared' in comm or 'preserved' in comm
    
    for y in years:
        col = f'[{y}]'
        if col in df.columns:
            val = str(row[col]).replace(',', '').strip()
            if val.isdigit() or val.replace('.', '', 1).isdigit():
                val_float = float(val)
                if is_frozen:
                    global_frozen[y] += val_float
                elif is_prepared:
                    global_prepared[y] += val_float

for y in years:
    frozen = global_frozen[y]
    prep = global_prepared[y]
    total = frozen + prep
    if total > 0:
        results.append({
            "year": int(y),
            "frozen_ton": round(frozen, 2),
            "prepared_ton": round(prep, 2),
            "prepared_ratio": round(prep / total * 100, 2)
        })

print(json.dumps(results[:5], indent=2))
with open('data/mackerel_processed_shift.json', 'w') as f:
    json.dump(results, f, indent=2)

