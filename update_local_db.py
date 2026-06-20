import json

path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/unloading/local_db.json'
with open(path, 'r', encoding='utf-8') as f:
    db = json.load(f)

# Update vessel statuses
for v in db['unloading_vessels']:
    if v['vessel_id'] == 'sein-phoenix':
        v['status'] = '하역완료 (Completed)'
        v['date_range'] = '2026.05.23 ~ 2026.06.18'
    elif v['vessel_id'] == 'bao-lucky':
        # BAO LUCKY is still in progress
        v['status'] = '하역중 (In Progress)'

# Append 6/18 reports
db['unloading_reports'].append({
    "id": "new-report-sein-phoenix-6-18",
    "vessel_id": "sein-phoenix",
    "report_date": "6/18",
    "work_time": "08:20 ~ 17:40",
    "target_holds": "S/HAR(#1-C), S/JUP(#3-D)",
    "daily_amount": 449.55,
    "cumulative_amount": 7060.95,
    "quality_notes": "S/JUP(#3-D) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/HAR(#1-C) - 어창 개방 측정온도는 -19.0℃ ~ -20.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 6/18 하역 최종 종료.",
    "created_at": "2026-06-18T18:00:00.000000"
})

db['unloading_reports'].append({
    "id": "new-report-bao-lucky-6-18",
    "vessel_id": "bao-lucky",
    "report_date": "6/18",
    "work_time": "08:20 ~ 20:00",
    "target_holds": "N/STAR(#1-B), MOAMARI(#1-B), MOAKONA(#2-B)",
    "daily_amount": 324.15,
    "cumulative_amount": 3387.85,
    "quality_notes": "MOAKONA(#2-B) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. MOAMARI(#1-B) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. N/STAR(#1-B) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. 명일(6/19)은 약 430톤 하역 작업 예정입니다.",
    "created_at": "2026-06-18T18:00:00.000000"
})

# Update species actual_amount
for s in db['unloading_species']:
    if s['vessel_id'] == 'sein-phoenix':
        if s['species_id'] == 'SJ':
            s['actual_amount'] = 6677.150
        elif s['species_id'] == 'YF':
            s['actual_amount'] = 383.800
    elif s['vessel_id'] == 'bao-lucky':
        if s['species_id'] == 'SJ':
            s['actual_amount'] = 3048.850
        elif s['species_id'] == 'YF':
            s['actual_amount'] = 339.000

with open(path, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print("local_db.json updated successfully!")
