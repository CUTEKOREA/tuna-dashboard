import os
import urllib.request
import json
import ssl
import random

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = f"https://api.odcloud.kr/api/15115888/v1/uddi:f1f70029-fcde-426c-a9fa-cfa0b7fe0b96?page=1&perPage=15000&serviceKey={os.environ['FISHERY_API_KEY']}"
try:
    req = urllib.request.Request(url)
    response = urllib.request.urlopen(req, context=ctx)
    res_data = json.loads(response.read())
    vessels = res_data.get('data', [])

    categories = {
        '참치 (원양선망)': ['신라', '동원산업', '사조산업', '사조씨푸드'],
        '참치 (원양연승)': ['동원수산', '오양수산', '사조오양'],
        '명태 (북양트롤)': ['한성', '사조대림', '대림수산'],
        '고등어 (대형선망)': ['금성', '대진수산', '동해산업', '창남수산'],
        '오징어 (원양채낚기)': ['동해상사', '남북수산', '진양수산', '승진']
    }

    import os
    whitelist_path = 'public/data/vessel_whitelist.json'
    
    # Load whitelist of verified real vessels to ensure they are always included
    if os.path.exists(whitelist_path):
        with open(whitelist_path, 'r', encoding='utf-8') as wf:
            vessel_details = json.load(wf)
        
        # Ensure all categories exist even if missing from whitelist
        default_cats = ['참치 (원양선망)', '참치 (원양연승)', '명태 (북양트롤)', '고등어 (대형선망)', '오징어 (원양채낚기)']
        for cat in default_cats:
            if cat not in vessel_details:
                vessel_details[cat] = []
    else:
        vessel_details = {
          '참치 (원양선망)': [],
          '참치 (원양연승)': [],
          '명태 (북양트롤)': [],
          '고등어 (대형선망)': [],
          '오징어 (원양채낚기)': []
        }

    # Append real data from API
    for ship in vessels:
        comp = ship.get('소유사상호') or ship.get('소유자명') or ''
        name = ship.get('선박 한글명') or ship.get('선박 영문명') or 'Unknown'
        call_sign = ship.get('호출부호') or ship.get('아이엠오(IMO)') or '-'
        
        assigned_cat = None
        for cat, keywords in categories.items():
            if any(k in comp for k in keywords):
                assigned_cat = cat
                break
        
        if assigned_cat:
            # API does not provide tonnage, launchDate, or specific purpose, so we leave them blank
            # DO NOT HALLUCINATE OR RANDOMIZE DATA
            if not any(v['name'] == name for v in vessel_details[assigned_cat]):
                vessel_details[assigned_cat].append({
                    'name': name,
                    'callSign': call_sign,
                    'tonnage': "",
                    'launchDate': "",
                    'purpose': assigned_cat.split(" ")[1].replace("(", "").replace(")", ""),
                    'company': comp
                })

    with open('public/data/vessel_master.json', 'w', encoding='utf-8') as f:
        json.dump(vessel_details, f, ensure_ascii=False, indent=2)
    print("Successfully mapped and saved to public/data/vessel_master.json (100% Real Data Only)")

except Exception as e:
    print("Error:", e)
