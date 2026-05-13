import requests
import xml.etree.ElementTree as ET
import os

api_key = os.environ.get('KCS_API_KEY', '6438ce04ca4a3ec4bcc72f295ab386baa74e52cacce9f725803e18cd8c6d1030')
url = f"https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList?serviceKey={api_key}&strtYymm=202401&endYymm=202612&hsSgn=030617"
print("Fetching:", url)
res = requests.get(url)
print("Status:", res.status_code)
try:
    root = ET.fromstring(res.content)
    for item in root.findall('.//item'):
        yymm = item.findtext('statKor')
        impUsdAmt = item.findtext('impUsdAmt')
        print(f"{yymm}: {impUsdAmt}")
except Exception as e:
    print(e)
    print(res.text[:500])
