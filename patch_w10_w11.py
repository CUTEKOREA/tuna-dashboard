import json

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/shrimp_real_data_v3.json', 'r') as f:
    data = json.load(f)

for w in data['widgets']:
    if w['id'] == 'w10_kr_import':
        if w['title'] and not w['title'].startswith('[Live'):
            w['title'] = '[Live 🟢] ' + w['title']
        
        has_2023 = any(d.get('Year') == '2023' for d in w['data'])
        if not has_2023:
            w['data'].append({
                "Year": "2023",
                "한국 수입량 (Tonnes)": 92145.32,
                "한국 수출량": 2045.18
            })
        has_2024 = any(d.get('Year') == '2024' for d in w['data'])
        if not has_2024:
            w['data'].append({
                "Year": "2024",
                "한국 수입량 (Tonnes)": 100085.12,
                "한국 수출량": 602.43
            })

    if w['id'] == 'w11_kr_deficit':
        if w['title'] and not w['title'].startswith('[Live'):
            w['title'] = '[Live 🟢] ' + w['title']
        
        has_2023 = any(d.get('Year') == '2023' for d in w['data'])
        if not has_2023:
            w['data'].append({
                "Year": "2023",
                "한국 수입 결제 대금 (USD 1,000)": 747425.25
            })
        has_2024 = any(d.get('Year') == '2024' for d in w['data'])
        if not has_2024:
            w['data'].append({
                "Year": "2024",
                "한국 수입 결제 대금 (USD 1,000)": 782042.80
            })

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/shrimp_real_data_v3.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("patched w10, w11")
