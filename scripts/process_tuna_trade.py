import pandas as pd
import json

vol_file = 'data/참치/5. 참치 무역량(수출입) 2019-2023.csv'
val_file = 'data/참치/6. 참치 무역액(수출입) 2019-2023.csv.csv'

df_vol = pd.read_csv(vol_file)
df_val = pd.read_csv(val_file)

def get_years(df):
    return [c for c in df.columns if c.startswith('[') and c.endswith(']')]

def clean_numeric(df, years):
    for y in years:
        df[y] = pd.to_numeric(df[y].astype(str).str.replace(',', ''), errors='coerce').fillna(0)
    return df

# Filter Bluefin only
def filter_bluefin(df):
    return df[df['Commodity (Name)'].str.lower().str.contains('bluefin', na=False)].copy()

vol_years = get_years(df_vol)
val_years = get_years(df_val)

bf_vol = clean_numeric(filter_bluefin(df_vol), vol_years)
bf_val = clean_numeric(filter_bluefin(df_val), val_years)

# Country Translation Map
COUNTRY_MAP = {
    'Japan': '일본',
    'Malta': '몰타',
    'Spain': '스페인',
    'United States of America': '미국',
    'Portugal': '포르투갈',
    'Republic of Korea': '한국',
    'Nigeria': '나이지리아',
    'China': '중국',
    'Türkiye': '튀르키예',
    'Netherlands (Kingdom of the)': '네덜란드',
    'Australia': '호주',
    'Mexico': '멕시코',
    'Croatia': '크로아티아',
    'Tunisia': '튀니지',
    'Libya': '리비아',
    'France': '프랑스',
    'Algeria': '알제리',
    'Italy': '이탈리아',
    'Canada': '캐나다',
    'Taiwan Province of China': '대만'
}

def translate_country(name):
    return COUNTRY_MAP.get(name, name)

# Apply translation
bf_vol['Reporting country (Name)'] = bf_vol['Reporting country (Name)'].apply(translate_country)
bf_vol['Partner country (Name)'] = bf_vol['Partner country (Name)'].apply(translate_country)
bf_val['Reporting country (Name)'] = bf_val['Reporting country (Name)'].apply(translate_country)
bf_val['Partner country (Name)'] = bf_val['Partner country (Name)'].apply(translate_country)

# === 양식(Farmed) 프록시 필터 ===
# 양식 참다랑어 최대 생산국 Top 10 (생산량 파일 기준) 
FARMED_ORIGINS = ['일본', '몰타', '스페인', '호주', '멕시코', '튀르키예', '크로아티아', '튀니지', '포르투갈', '알바니아']

# =====================================================================
# 1. Import Black Hole Top 10 (Farmed Originated)
# =====================================================================
bf_imp = bf_vol[
    (bf_vol['Trade flow (Name)'] == 'Imports') & 
    (bf_vol['Partner country (Name)'].isin(FARMED_ORIGINS))
].copy()
bf_imp['Total'] = bf_imp[vol_years].sum(axis=1)
top_importers = bf_imp.groupby('Reporting country (Name)')['Total'].sum().nlargest(10).reset_index()
top_importers.columns = ['Country', 'Volume']
top_importers['Volume'] = top_importers['Volume'].round(0)
# Sort ascending for horizontal bar chart
top_importers = top_importers.sort_values('Volume', ascending=True)

with open('data/tuna_import_blackhole.json', 'w', encoding='utf-8') as f:
    json.dump(top_importers.to_dict(orient='records'), f, ensure_ascii=False, indent=2)
print("1. Import Black Hole saved:", len(top_importers), "countries")

# =====================================================================
# 2. Export Destination Share (Top 5 exporters -> partner breakdown)
# =====================================================================
bf_exp = bf_vol[
    (bf_vol['Trade flow (Name)'] == 'Exports') & 
    (bf_vol['Reporting country (Name)'].isin(FARMED_ORIGINS))
].copy()
bf_exp['Total'] = bf_exp[vol_years].sum(axis=1)

top5_exporters = bf_exp.groupby('Reporting country (Name)')['Total'].sum().nlargest(5).index.tolist()
df_routes = bf_exp[bf_exp['Reporting country (Name)'].isin(top5_exporters)].copy()

# For each exporter, get top 3 partner countries + Others
export_share_data = []
for exporter in top5_exporters:
    exporter_df = df_routes[df_routes['Reporting country (Name)'] == exporter]
    partner_totals = exporter_df.groupby('Partner country (Name)')['Total'].sum().nlargest(3)
    others = exporter_df.groupby('Partner country (Name)')['Total'].sum().sum() - partner_totals.sum()
    
    row = {'Exporter': exporter}
    for partner, vol in partner_totals.items():
        row[partner] = round(vol, 0)
    if others > 0:
        row['기타 (Others)'] = round(others, 0)
    export_share_data.append(row)

with open('data/tuna_export_share.json', 'w', encoding='utf-8') as f:
    json.dump(export_share_data, f, ensure_ascii=False, indent=2)
print("2. Export Destination Share saved:", len(export_share_data), "exporters")

# =====================================================================
# 3. Korea Import Position (yearly volume + value for farmed)
# =====================================================================
korea_vol = bf_vol[
    (bf_vol['Reporting country (Name)'] == '한국') & 
    (bf_vol['Trade flow (Name)'] == 'Imports') &
    (bf_vol['Partner country (Name)'].isin(FARMED_ORIGINS))
]
korea_val = bf_val[
    (bf_val['Reporting country (Name)'] == '한국') & 
    (bf_val['Trade flow (Name)'] == 'Imports') &
    (bf_val['Partner country (Name)'].isin(FARMED_ORIGINS))
]

korea_data = []
for y in vol_years:
    year_num = int(y.replace('[', '').replace(']', ''))
    vol_sum = korea_vol[y].sum()
    # Find matching year in value data
    val_y = y if y in val_years else None
    val_sum = korea_val[val_y].sum() if val_y else 0
    korea_data.append({
        'Year': year_num,
        'Volume': round(vol_sum, 1),
        'Value': round(val_sum, 1)
    })

with open('data/tuna_korea_position.json', 'w', encoding='utf-8') as f:
    json.dump(korea_data, f, ensure_ascii=False, indent=2)
print("3. Korea Position saved:", korea_data)

# =====================================================================
# 4. Korea Farmed Import Origins (Yearly Stacked by Partner)
# =====================================================================
korea_origins_data = []

korea_vol = korea_vol.copy()
korea_vol['Total'] = korea_vol[vol_years].sum(axis=1)

# Top origins for Korea
korea_top_partners = korea_vol.groupby('Partner country (Name)')['Total'].sum().nlargest(4).index.tolist()

for y in vol_years:
    year_num = int(y.replace('[', '').replace(']', ''))
    row = {'Year': year_num}
    
    year_korea_vol = korea_vol[['Partner country (Name)', y]].copy()
    
    # Fill in Top 4 partners explicitly
    for p in korea_top_partners:
        p_val = year_korea_vol[year_korea_vol['Partner country (Name)'] == p][y].sum()
        row[p] = round(p_val, 1) if pd.notnull(p_val) else 0.0
        
    # Aggregate others
    others_val = year_korea_vol[~year_korea_vol['Partner country (Name)'].isin(korea_top_partners)][y].sum()
    if others_val > 0:
        row['기타 (Others)'] = round(others_val, 1)
        
    korea_origins_data.append(row)

with open('data/tuna_korea_import_origins.json', 'w', encoding='utf-8') as f:
    json.dump(korea_origins_data, f, ensure_ascii=False, indent=2)
print("4. Korea Import Origins saved:", len(korea_origins_data), "years")

print("\nAll trade flow JSONs generated!")
