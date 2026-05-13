#!/usr/bin/env python3
import json

with open('public/data/pollock_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Define which widgets are estimates/synthetic (<= 70%)
estimate_widgets = {
    'w19_tariff_engineering': 70, # Qualitative basis
    'w21_b_season_hedge': 70,     # Qualitative basis
    'w22_precision_release': 70,  # Qualitative basis
    'w23_upcycling_esg': 70,      # Qualitative basis
    'w24_opex_spread': 60,        # Synthetic
    'w25_processing_bottleneck': 60, # Synthetic
    'w26_inventory_freight': 60,  # Synthetic
    'w27_substitute_spread': 60,  # Synthetic
    'w28_esg_premium': 60         # Synthetic
}

count = 0
for w in data['widgets']:
    if w['id'] in estimate_widgets:
        w['reliability'] = estimate_widgets[w['id']]
        count += 1
        print(f"Updated {w['id']} reliability to {w['reliability']}")

with open('public/data/pollock_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Updated {count} widgets.")
