import os
import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = f"https://api.odcloud.kr/api/15115888/v1/uddi:f1f70029-fcde-426c-a9fa-cfa0b7fe0b96?page=1&perPage=15000&serviceKey={os.environ['FISHERY_API_KEY']}"
try:
    req = urllib.request.Request(url)
    response = urllib.request.urlopen(req, context=ctx)
    res_data = json.loads(response.read())
    vessels = res_data.get('data', [])

    matches = []
    for ship in vessels:
        comp = ship.get('소유사상호') or ship.get('소유자명') or ''
        name = ship.get('선박 한글명') or ship.get('선박 영문명') or ''
        if any(k in comp for k in ['신라', '동원', '사조', '한성', '대림']):
            matches.append((name, comp))
            
    print(f"Found {len(matches)} matches.")
    for m in set(matches):
        print(f"Ship: {m[0]}, Company: {m[1]}")

except Exception as e:
    print("Error:", e)
