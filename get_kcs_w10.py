import requests
import json
import xml.etree.ElementTree as ET

url = "https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList"
API_KEY = "6438ce04ca4a3ec4bcc72f295ab386baa74e52cacce9f725803e18cd8c6d1030"

def fetch_data(year):
    params = {
        "serviceKey": API_KEY,
        "strtYymm": f"{year}01",
        "endYymm": f"{year}12",
        "hsSgn": "030617" # 새우(냉동)
    }
    resp = requests.get(url, params=params)
    try:
        root = ET.fromstring(resp.content)
    except:
        return 0, 0
    
    impWgt_total = 0
    expWgt_total = 0
    for item in root.findall('.//item'):
        impWgt = item.find('impWgt')
        expWgt = item.find('expWgt')
        # only sum the "총계" (total) or we can just sum up the country rows. wait, the api returns rows per country/hs code.
        # let's just sum all rows where year is NOT "총계" 
        # actually, the total is already provided in the rows where statKor == '총계' or similar. 
        # let's check what 'year' tag says, if it says '총계' we should take that or skip that?
        year_tag = item.find('year')
        if year_tag is not None and '총계' in year_tag.text:
            continue
        if impWgt is not None:
            impWgt_total += int(impWgt.text)
        if expWgt is not None:
            expWgt_total += int(expWgt.text)
    
    return impWgt_total / 1000, expWgt_total / 1000 # Convert to Tonnes

for y in range(2022, 2025):
    imp, exp = fetch_data(y)
    print(f"Year: {y}, Import (T): {imp}, Export (T): {exp}")
