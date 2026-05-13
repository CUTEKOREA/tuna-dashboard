import json

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/shrimp_real_data_v3.json', 'r') as f:
    data = json.load(f)

sales_widgets = ['w_sales1_commodity_unit_price', 'w_sales2_exporter_trend', 'w06_top10_revenue', 'w10_kr_import', 'w11_kr_deficit', 'w12_unit_price', 'w14', 'w16', 'w17', 'w42_format_shift', 'w45_export_vuln']

for w in data['widgets']:
    if w['id'] in sales_widgets:
        if w['title'] and not w['title'].startswith('[Live'):
            w['title'] = '[Live 🟢] ' + w['title']

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/shrimp_real_data_v3.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("patched sales widgets")
