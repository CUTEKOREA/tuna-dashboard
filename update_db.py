import json

path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/unloading/local_db.json'
with open(path, 'r', encoding='utf-8') as f:
    db = json.load(f)

for v in db['unloading_vessels']:
    if v['vessel_id'] == 'shin-fuji':
        v['status'] = '하역중 (In Progress)'
        v['date_range'] = '2026.06.20 ~ 진행중'

db['unloading_reports'].append({
    "id": "new-report-shinfuji-6-20",
    "vessel_id": "shin-fuji",
    "report_date": "6/20",
    "work_time": "08:20 ~ 11:00",
    "target_holds": "N/STAR(#1-A)",
    "daily_amount": 63.39,
    "cumulative_amount": 63.39,
    "quality_notes": "N/STAR(#1-A) - 어창 개방 측정온도는 -19.0℃ ~ -20.0℃ 입니다. 명일(6/21)은 공휴일로 하역 작업이 없으며, 재명일(6/22)은 약 140톤 하역 작업 예정입니다.",
    "created_at": "2026-06-20T20:00:00.000000"
})

for s in db['unloading_species']:
    if s['vessel_id'] == 'shin-fuji':
        if s['species_id'] == 'SJ':
            s['actual_amount'] = 53.89
        elif s['species_id'] == 'YF':
            s['actual_amount'] = 9.50

with open(path, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)
print("Updated local_db.json")
