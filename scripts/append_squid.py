import json

with open('public/data/vessel_master.json', 'r', encoding='utf-8') as f:
    fleet = json.load(f)

# Extracted from PDF for Squid Jigging
squid_vessels = [
    {"name": "동일5호", "callSign": "SQ01", "tonnage": "338.00", "launchDate": "1991-11-05", "purpose": "채낚기", "company": "경태어업", "category": "Squid Jigging"},
    {"name": "금양103호", "callSign": "SQ02", "tonnage": "380.00", "launchDate": "1988-01-01", "purpose": "채낚기", "company": "가나마린", "category": "Squid Jigging"},
    {"name": "해랑101호", "callSign": "SQ03", "tonnage": "454.00", "launchDate": "1987-10-01", "purpose": "채낚기", "company": "동신어업", "category": "Squid Jigging"},
    {"name": "바다103호", "callSign": "SQ04", "tonnage": "356.00", "launchDate": "1987-07-28", "purpose": "채낚기", "company": "동원해사랑", "category": "Squid Jigging"},
    {"name": "은해91호", "callSign": "SQ05", "tonnage": "447.00", "launchDate": "1975-11-15", "purpose": "채낚기", "company": "현명수산", "category": "Squid Jigging"},
    {"name": "성경517호", "callSign": "SQ06", "tonnage": "281.00", "launchDate": "1989-03-01", "purpose": "채낚기", "company": "성경수산", "category": "Squid Jigging"},
    {"name": "승진801호", "callSign": "SQ07", "tonnage": "499.00", "launchDate": "2020-08-15", "purpose": "채낚기", "company": "승진수산", "category": "Squid Jigging"},
    {"name": "7대양호", "callSign": "SQ08", "tonnage": "490.00", "launchDate": "1974-07-15", "purpose": "채낚기", "company": "신진피셔리", "category": "Squid Jigging"},
    {"name": "혜진91호", "callSign": "SQ09", "tonnage": "495.00", "launchDate": "1988-08-02", "purpose": "채낚기", "company": "혜진교역", "category": "Squid Jigging"},
    {"name": "창진302호", "callSign": "SQ10", "tonnage": "427.00", "launchDate": "1974-09-15", "purpose": "채낚기", "company": "창진교역", "category": "Squid Jigging"},
    {"name": "해인27호", "callSign": "SQ11", "tonnage": "361.00", "launchDate": "1987-08-01", "purpose": "채낚기", "company": "해인수산", "category": "Squid Jigging"},
    {"name": "드림테크호", "callSign": "SQ12", "tonnage": "499.00", "launchDate": "2021-08-11", "purpose": "채낚기", "company": "흥진실업", "category": "Squid Jigging"},
]

fleet['오징어 (원양채낚기)'].extend(squid_vessels)

with open('public/data/vessel_master.json', 'w', encoding='utf-8') as f:
    json.dump(fleet, f, ensure_ascii=False, indent=2)

print("Squid vessels appended.")
