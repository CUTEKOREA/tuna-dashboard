import json

with open('public/data/squid_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for w in data.get('widgets', []):
    if w['id'] == 'w25_squid_chitosan_biomaterial':
        w['chartType'] = 'bar'
        
        # Convert lines to bars
        if 'lines' in w:
            for line in w['lines']:
                w['bars'].append({
                    'dataKey': line['dataKey'],
                    'fill': line['stroke'], # Use the line's stroke color for the bar's fill
                    'name': line['name']
                })
            del w['lines']
            
with open('public/data/squid_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("w25 fixed to use bar chart")
