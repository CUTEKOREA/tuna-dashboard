import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    req = urllib.request.Request("https://infuser.odcloud.kr/api/oas/docs?namespace=15115888/v1")
    response = urllib.request.urlopen(req, context=ctx)
    data = json.loads(response.read())
    paths = list(data['paths'].keys())
    print("Found paths:", paths)
    
    if paths:
        api_path = paths[0]
        # Request all records, or a large number (e.g. 5000)
        full_url = f"https://api.odcloud.kr{api_path}?page=1&perPage=5000&serviceKey=6438ce04ca4a3ec4bcc72f295ab386baa74e52cacce9f725803e18cd8c6d1030"
        print("Fetching data from:", full_url)
        req2 = urllib.request.Request(full_url)
        res2 = urllib.request.urlopen(req2, context=ctx)
        vessel_data = json.loads(res2.read())
        print(f"Total vessels fetched: {len(vessel_data.get('data', []))}, Total count: {vessel_data.get('totalCount', 'Unknown')}")
        
        with open('data/vessel_master.json', 'w', encoding='utf-8') as f:
            json.dump(vessel_data, f, ensure_ascii=False, indent=2)
        print("Saved to data/vessel_master.json")
except Exception as e:
    print("Error:", e)
