import pandas as pd
import json
import math
import glob
import os

files = {
    '동물미용업': '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/펫푸드/동물_동물미용업.csv',
    '동물병원': '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/펫푸드/동물_동물병원.csv',
    '동물약국': '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/펫푸드/동물_동물약국.csv'
}

data_out = {
    "counts": {},
    "municipality_counts": {},
    "details": {}
}

for category, filepath in files.items():
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    df = pd.read_csv(filepath, encoding='cp949', low_memory=False)
    
    # Filter active
    df = df[df['영업상태명'].astype(str).str.contains('영업/정상', na=False)]
    
    for _, row in df.iterrows():
        address = str(row.get('지번주소', ''))
        if address == 'nan' or not address.strip():
            address = str(row.get('도로명주소', ''))
        if address == 'nan' or not address.strip():
            continue
            
        parts = address.split()
        if len(parts) < 2:
            continue
            
        province = parts[0]
        municipality = parts[1]
        
        # fix some province names
        if province == '서울': province = '서울특별시'
        elif province == '부산': province = '부산광역시'
        elif province == '대구': province = '대구광역시'
        elif province == '인천': province = '인천광역시'
        elif province == '광주': province = '광주광역시'
        elif province == '대전': province = '대전광역시'
        elif province == '울산': province = '울산광역시'
        elif province == '세종': province = '세종특별자치시'
        elif province == '경기': province = '경기도'
        elif province == '강원': province = '강원도' # or 강원특별자치도
        elif province == '강원특별자치도': province = '강원도'
        elif province == '충북': province = '충청북도'
        elif province == '충남': province = '충청남도'
        elif province == '전북': province = '전라북도'
        elif province == '전북특별자치도': province = '전라북도'
        elif province == '전남': province = '전라남도'
        elif province == '경북': province = '경상북도'
        elif province == '경남': province = '경상남도'
        elif province == '제주': province = '제주특별자치도'
        elif province == '제주도': province = '제주특별자치도'
        
        name = str(row.get('사업장명', 'Unknown'))
        size_val = row.get('소재지면적', 0)
        size = str(size_val) if not pd.isna(size_val) else ""
        
        if province not in data_out["counts"]:
            data_out["counts"][province] = 0
            data_out["municipality_counts"][province] = {}
            data_out["details"][province] = {}
            
        if municipality not in data_out["municipality_counts"][province]:
            data_out["municipality_counts"][province][municipality] = 0
            data_out["details"][province][municipality] = []
            
        data_out["counts"][province] += 1
        data_out["municipality_counts"][province][municipality] += 1
        
        data_out["details"][province][municipality].append({
            "name": name,
            "category": category,
            "address": address,
            "size": size
        })

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/petfood_regional_dashboard.json', 'w', encoding='utf-8') as f:
    json.dump(data_out, f, ensure_ascii=False)

print("Successfully generated petfood_regional_dashboard.json")
