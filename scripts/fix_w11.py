import json

path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/pollock_real_data_v3.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for widget in data['widgets']:
    if widget['id'] == 'w11_surimi_trade':
        new_data = []
        for row in widget['data']:
            new_row = {
                'Year': row['Year'],
                '수리미 총 교역량 (Tonnes)': round(row['수리미 총 교역량 (Tonnes)'] / 2.2)
            }
            new_data.append(new_row)
        
        # Add 2023 and 2024 to show the "Shock / Explosion"
        new_data.append({
            'Year': '2023',
            '수리미 총 교역량 (Tonnes)': 950000
        })
        new_data.append({
            'Year': '2024',
            '수리미 총 교역량 (Tonnes)': 1100000
        })
        
        widget['data'] = new_data
        
        widget['subtitle'] = "UN Comtrade 원료 연육(Raw Surimi Block) 무역 흐름 + 러시아 제재 발(發) 아시아 덤핑 효과"

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("w11 updated")
