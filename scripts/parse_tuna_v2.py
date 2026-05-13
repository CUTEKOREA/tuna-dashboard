import pandas as pd
import json
import os
import unicodedata

# Load GeoJSON municipality names
with open('public/data/municipalities.json', 'r') as f:
    valid_municipalities = set(json.load(f))

# Find the CSV file
csv_files = [os.path.join('data', f) for f in os.listdir('data') if f.endswith('.csv') and '식품' in unicodedata.normalize('NFC', f)]
file_path = csv_files[0]

try:
    df = pd.read_csv(file_path, encoding='cp949', low_memory=False)
except Exception as e:
    df = pd.read_csv(file_path, encoding='utf-8', low_memory=False)

df['사업장명'] = df['사업장명'].fillna('')
df['지번주소'] = df['지번주소'].fillna('')
df['도로명주소'] = df['도로명주소'].fillna('')

keywords = r'참치|튜나|다랑어|마구로|다랑원|\btuna\b|\bmaguro\b|\bbluefin\b'
df_tuna = df[df['사업장명'].str.contains(keywords, case=False, na=False, regex=True)]
df_tuna_open = df_tuna[df_tuna['상세영업상태명'] == '영업'].copy()

# Sido mapping
sido_map = {
    '강원특별자치도': '강원도',
    '전북특별자치도': '전라북도'
}

metro_cities = {'서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시'}

def extract_regions(row):
    addr = str(row['지번주소']).strip()
    if not addr:
        addr = str(row['도로명주소']).strip()
    if not addr:
        return '알수없음', '알수없음'
        
    tokens = addr.split()
    if len(tokens) < 2:
        return tokens[0] if len(tokens) > 0 else '알수없음', '알수없음'
        
    raw_sido = tokens[0]
    sido = sido_map.get(raw_sido, raw_sido)
    
    # Extract Sigungu
    if sido in metro_cities:
        if sido == '세종특별자치시':
            sigungu = '세종시' # Actually, check what Sejong uses
        else:
            sigungu = tokens[1]
    else:
        # Province
        t1 = tokens[1]
        t2 = tokens[2] if len(tokens) > 2 else ''
        if t1.endswith('시') and t2.endswith('구'):
            sigungu = t1 + t2
        else:
            sigungu = t1
            
    # Normalize some edge cases if needed (we'll check missing ones later)
    return sido, sigungu

regions = df_tuna_open.apply(extract_regions, axis=1, result_type='expand')
df_tuna_open['시도'] = regions[0]
df_tuna_open['시군구'] = regions[1]

# Check unmapped sigungus
unmapped = set()
for sgg in df_tuna_open['시군구'].unique():
    if sgg != '알수없음' and sgg not in valid_municipalities:
        unmapped.add(sgg)

print("Unmapped sigungus:", unmapped)

# Build the new json structure
# regional_counts: { sido: count }
# municipality_counts: { sido: { sigungu: count } }
# details: { sido: { sigungu: [ { name, address, category, size } ] } }

regional_counts = {}
municipality_counts = {}
details = {}

cols = ['시도', '시군구', '사업장명', '지번주소', '도로명주소', '업태구분명', '소재지면적', '시설총규모']
df_details = df_tuna_open[cols].copy()
df_details.fillna('', inplace=True)

for (sido, sigungu), group in df_details.groupby(['시도', '시군구']):
    if sido == '알수없음': continue
    
    if sido not in regional_counts:
        regional_counts[sido] = 0
        municipality_counts[sido] = {}
        details[sido] = {}
        
    if sigungu not in municipality_counts[sido]:
        municipality_counts[sido][sigungu] = 0
        details[sido][sigungu] = []
        
    count = len(group)
    regional_counts[sido] += count
    municipality_counts[sido][sigungu] += count
    
    for _, row in group.iterrows():
        size = row['소재지면적'] if row['소재지면적'] != '' else row['시설총규모']
        addr = row['지번주소'] if row['지번주소'] else row['도로명주소']
        
        # handle size conversion safely
        try:
            size_float = float(size)
        except ValueError:
            size_float = 0.0
            
        details[sido][sigungu].append({
            'name': row['사업장명'],
            'address': addr,
            'category': row['업태구분명'],
            'size': str(size),
            '_size_num': size_float
        })

# Sort all restaurants by size descending and remove the temporary _size_num
for sido in details:
    for sigungu in details[sido]:
        sorted_list = sorted(details[sido][sigungu], key=lambda x: x['_size_num'], reverse=True)
        for item in sorted_list:
            del item['_size_num']
        details[sido][sigungu] = sorted_list

export_data = {
    'counts': regional_counts,
    'municipality_counts': municipality_counts,
    'details': details
}

out_path = 'public/data/tuna_regional_dashboard.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(export_data, f, ensure_ascii=False, indent=2)

print(f"Extracted {sum(regional_counts.values())} restaurants across {len(regional_counts)} regions.")
