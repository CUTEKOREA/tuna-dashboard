import json

path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/unloading/local_db.json'
with open(path, 'r', encoding='utf-8') as f:
    db = json.load(f)

# Add 6/19 report
report_6_19 = {
    "id": "new-report-baolucky-6-19",
    "vessel_id": "bao-lucky",
    "report_date": "6/19",
    "work_time": "08:20 ~ 20:40",
    "target_holds": "S/CHA(#3-B), MOAMARI(#1-B)",
    "daily_amount": 411.05,
    "cumulative_amount": 3798.90,
    "quality_notes": "MOAMARI(#1-B) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. S/CHA(#3-B) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. 명일(6/20)은 약 330톤 하역 작업 예정입니다.",
    "created_at": "2026-06-19T21:00:00.000000"
}

# Insert before 6/20 report or just append and sort
db['unloading_reports'].append(report_6_19)

# Sort by report_date (assuming formats like "6/18", "6/19", "6/20")
def sort_key(report):
    parts = report['report_date'].split('/')
    if len(parts) == 2:
        return (int(parts[0]), int(parts[1]))
    return (99, 99)

db['unloading_reports'].sort(key=sort_key)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print("Inserted 6/19 report for BAO LUCKY into local_db.json")
