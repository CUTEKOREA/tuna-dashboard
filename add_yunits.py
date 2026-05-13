import json

file_path = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/shrimp_real_data_v3.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Define units based on widget ID or title content
def determine_unit(w):
    title = w.get("title", "")
    id = w.get("id", "")
    keys = []
    if "data" in w and len(w["data"]) > 0:
        keys = list(w["data"][0].keys())
        
    if "단가" in title or "대금" in title or "적자" in title or "매출" in title or "Price" in title:
        if "USD 1,000" in title or any("USD 1,000" in k for k in keys):
            return "" # "천$"
        elif "kr_deficit" in id:
            return ""
        elif "unit_price" in id or "peeling_esg" in id:
            return "$"
        return "$"
    elif "비율" in title or "혁명" in title or "%" in title or "비파괴" in title:
        return "%"
    elif "톤" in title or "생산" in title or "수출" in title or "수입" in title or "블랙홀" in title or "패권" in title:
        return "t"
    elif "fcr" in id:
        return "" # FCR doesn't have a unit
    return ""

for w in data['widgets']:
    unit = determine_unit(w)
    
    # Specific overrides
    if w['id'] == 'w01_paradigm_shift': w['yUnit'] = 't'
    elif w['id'] == 'w02_aqua_value': w['yUnit'] = '천$'
    elif w['id'] == 'w03_processing': w['yUnit'] = 't'
    elif w['id'] == 'w04_top10_aqua': w['yUnit'] = 't'
    elif w['id'] == 'w05_top10_catch': w['yUnit'] = 't'
    elif w['id'] == 'w06_top10_revenue': w['yUnit'] = '천$'
    elif w['id'] == 'w07_trade_scaleup': w['yUnit'] = '천$'
    elif w['id'] == 'w08_top_exporter': w['yUnit'] = 't'
    elif w['id'] == 'w09_top_importer': w['yUnit'] = 't'
    elif w['id'] == 'w10_kr_import': w['yUnit'] = 't'
    elif w['id'] == 'w11_kr_deficit': w['yUnit'] = '천$'
    elif w['id'] == 'w12_unit_price': w['yUnit'] = '$'
    elif w['id'] == 'w13': w['yUnit'] = 't'
    elif w['id'] == 'w14': w['yUnit'] = 't'
    elif w['id'] == 'w15': w['yUnit'] = 't'
    elif w['id'] == 'w16': w['yUnit'] = '$'
    elif w['id'] == 'w17': w['yUnit'] = 't'
    elif w['id'] == 'w18': w['yUnit'] = 't'
    elif w['id'] == 'w19_hyperspectral': w['yUnit'] = '%'
    elif w['id'] == 'w20_fcr_80': w['yUnit'] = ''
    elif w['id'] == 'w21_peeling_esg': w['yUnit'] = '%'
    elif w['id'] == 'w22_microalgae': w['yUnit'] = '%'

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("yUnits added to widgets.")
