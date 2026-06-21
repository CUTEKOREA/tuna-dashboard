import json
import uuid

path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/unloading/local_db.json'
with open(path, 'r', encoding='utf-8') as f:
    db = json.load(f)

# Add 6/21 report to unloading_reports
new_report = {
    "id": str(uuid.uuid4()),
    "date": "2026-06-21",
    "vessel_id": "bao-lucky",
    "vessel_name": "M/V BAO LUCKY",
    "unloaded_mt": 94.900,
    "work_time": "08:20 - 13:30",
    "target_holds": ["S/CHA"],
    "remarks": "어창 S/CHA(#3-C) 개방 측정온도 -20.0℃ ~ -22.0℃. 내일(6/22) 약 100톤 하역 예정"
}

db['unloading_reports'].append(new_report)
db['unloading_reports'].sort(key=lambda x: x.get('date', '1970-01-01'), reverse=True)

# Update species_breakdown for BAO LUCKY
if 'species_breakdown' in db:
    for sp in db['species_breakdown']:
        if sp.get('vessel_id') == 'bao-lucky':
            if sp.get('species_id') == 'SJ':
                sp['actual_amount'] = 3701.39
            elif sp.get('species_id') == 'YF':
                sp['actual_amount'] = 516.00

with open(path, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("Updated local_db.json successfully")
