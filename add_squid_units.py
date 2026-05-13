import json

file_path = 'public/data/squid_real_data_v3.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

unit_map = {
    "w1_catch_powers": "톤",
    "w2_korea_supply": "톤, %",
    "w3_jumbo_flying": "톤",
    "w4_unit_price": "$/톤",
    "w5_top_importers": "천 달러",
    "w6_species_pie": "톤",
    "w7_korea_category": "천 달러",
    "w8_china_export": "천 달러",
    "w9_trade_deficit": "천 달러",
    "w10_processed_dominance": "톤",
    "w11_no_aquaculture": "톤",
    "w12_ax_fishing": "%",
    "w13": "$/톤, %",
    "w14": "%",
    "w15": "톤, $/톤",
    "w16": "톤",
    "w17": "%",
    "w18": "톤"
}

for w in data['widgets']:
    if w['id'] in unit_map:
        w['unit'] = unit_map[w['id']]

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
