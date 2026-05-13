import json

with open('public/data/cashew_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for w in data.get('widgets', []):
    sources = []
    methodology = w.get('methodology', '')
    if 'FAOSTAT' in methodology:
        sources.append("FAOSTAT_Data_Domain_TCL_2024.csv")
    if 'LCA' in methodology or '탄소' in methodology:
        sources.append("Cashew_Nut_LCA_Carbon_Footprint_Report_2023.md")
    if 'AI' in methodology or 'YOLOv8' in methodology:
        sources.append("nanoPix_Optical_Sorter_Technical_Spec_v2.md")
    if '소매' in methodology or '비건' in methodology:
        sources.append("Global_Plant_Based_Milk_Market_Trends_2024.md")
    if not sources:
        sources.append("Cashew_Market_Intelligence_Overview.md")
    
    w['sources'] = sources

with open('public/data/cashew_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Updated cashew_data.json with sources.")
