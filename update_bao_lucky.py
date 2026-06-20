import json

path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/unloading/local_db.json'
with open(path, 'r', encoding='utf-8') as f:
    db = json.load(f)

# Add 6/20 report
db['unloading_reports'].append({
    "id": "new-report-baolucky-6-20",
    "vessel_id": "bao-lucky",
    "report_date": "6/20",
    "work_time": "08:10 ~ 17:40",
    "target_holds": "S/CHA(#3-B,#3-C), MOAMARI(#1-B,#1-C)",
    "daily_amount": 323.59,
    "cumulative_amount": 4122.49,
    "quality_notes": "MOAMARI(#1-B,#1-C) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. S/CHA(#3-B,#3-C) - 어창 개방 측정온도는 -20.0℃ ~ -22.0℃ 입니다. 명일(6/21)은 약 100톤 하역 작업 예정입니다.",
    "created_at": "2026-06-20T21:00:00.000000"
})

# Update species
for s in db['unloading_species']:
    if s['vessel_id'] == 'bao-lucky':
        if s['species_id'] == 'SJ':
            s['actual_amount'] = 3622.69
        elif s['species_id'] == 'YF':
            s['actual_amount'] = 499.80

with open(path, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print("Updated local_db.json for BAO LUCKY 6/20")
