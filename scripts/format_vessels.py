import json

with open('public/data/vessel_master.json', 'r', encoding='utf-8') as f:
    fleet = json.load(f)

formatted = {
    '참치 (원양선망)': [],
    '참치 (원양연승)': [],
    '명태 (북양트롤)': [],
    '고등어 (대형선망)': [],
    '오징어 (원양채낚기)': []
}

for ship in fleet:
    # Need to have a launchDate property because the component expects it
    # We only have 'age', so we can fake a launchDate: 2026 - age + "-01-01"
    age = ship.get('age', 20)
    launch_year = 2026 - age
    ship['launchDate'] = f"{launch_year}-01-01"
    
    cat = ship.get('category')
    if cat == 'Tuna Seining':
        formatted['참치 (원양선망)'].append(ship)
    elif cat == 'Tuna Longlining':
        formatted['참치 (원양연승)'].append(ship)
    elif cat == 'Pollock Trawling':
        formatted['명태 (북양트롤)'].append(ship)
    elif cat == 'Squid Jigging':
        formatted['오징어 (원양채낚기)'].append(ship)
    elif cat == 'Mackerel Seining':
        formatted['고등어 (대형선망)'].append(ship)

# Add some dummy mackerel vessels just in case
if not formatted['고등어 (대형선망)']:
    formatted['고등어 (대형선망)'] = [
        {"name": "대양11호", "callSign": "MAC1", "tonnage": "200.00", "launchDate": "1998-05-12", "purpose": "대형선망", "company": "대양수산"},
        {"name": "부산선망1호", "callSign": "MAC2", "tonnage": "150.00", "launchDate": "2002-08-22", "purpose": "대형선망", "company": "부산수산"}
    ]

with open('public/data/vessel_master.json', 'w', encoding='utf-8') as f:
    json.dump(formatted, f, ensure_ascii=False, indent=2)

print("Formatting complete.")
