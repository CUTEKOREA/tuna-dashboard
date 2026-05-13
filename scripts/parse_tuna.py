import pandas as pd
import json
import os
import glob
import unicodedata

# Find the CSV file
csv_files = [os.path.join('data', f) for f in os.listdir('data') if f.endswith('.csv') and '식품' in unicodedata.normalize('NFC', f)]
if not csv_files:
    print("CSV file not found in data directory.")
    exit(1)

file_path = csv_files[0]
print(f"Reading from {file_path}...")

try:
    df = pd.read_csv(file_path, encoding='cp949', low_memory=False)
except Exception as e:
    print(f"Failed to read with cp949, trying utf-8: {e}")
    df = pd.read_csv(file_path, encoding='utf-8', low_memory=False)

df['사업장명'] = df['사업장명'].fillna('')
df['지번주소'] = df['지번주소'].fillna('')
df['도로명주소'] = df['도로명주소'].fillna('')

keywords = '참치|튜나|다랑어|마구로|다랑원'
df_tuna = df[df['사업장명'].str.contains(keywords, case=False, na=False)]
df_tuna_open = df_tuna[df_tuna['상세영업상태명'] == '영업'].copy()

# Extract region from address
def get_region(row):
    addr = str(row['지번주소']).strip()
    if not addr:
        addr = str(row['도로명주소']).strip()
    if addr:
        return addr.split()[0]
    return '알수없음'

df_tuna_open['시도'] = df_tuna_open.apply(get_region, axis=1)
df_tuna_open['시도'] = df_tuna_open['시도'].replace({
    '강원특별자치도': '강원도',
    '전북특별자치도': '전라북도'
})

# Group and extract details
cols = ['시도', '사업장명', '지번주소', '도로명주소', '업태구분명', '소재지면적', '시설총규모']
df_details = df_tuna_open[cols].copy()
df_details.fillna('', inplace=True)

region_details = {}
for name, group in df_details.groupby('시도'):
    if name == '알수없음': continue
    
    if name not in region_details:
        region_details[name] = []
        
    restaurants = region_details[name]
    for _, row in group.iterrows():
        size = row['소재지면적'] if row['소재지면적'] != '' else row['시설총규모']
        addr = row['지번주소'] if row['지번주소'] else row['도로명주소']
        restaurants.append({
            'name': row['사업장명'],
            'address': addr,
            'category': row['업태구분명'],
            'size': str(size)
        })
    region_details[name] = restaurants

# counts
counts = df_tuna_open[df_tuna_open['시도'] != '알수없음']['시도'].value_counts().to_dict()

export_data = {
    'counts': counts,
    'details': region_details
}

out_path = 'public/data/tuna_regional_dashboard.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(export_data, f, ensure_ascii=False, indent=2)

print(f"Extracted {sum(counts.values())} restaurants across {len(counts)} regions.")
print(f"Data saved to {out_path}")
