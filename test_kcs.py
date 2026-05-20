import requests
import xml.etree.ElementTree as ET

url = "https://openapi.customs.go.kr/openapi/service/newNitemtradeInfo/getNitemtradeList"
params = {
    "serviceKey": "6438ce04ca4a3ec4bcc72f295ab386baa74e52cacce9f725803e18cd8c6d1030",
    "searchBgnDe": "202301",
    "searchEndDe": "202312",
    "searchItemCd": "030743"
}

resp = requests.get(url, params=params)
print("Status Code:", resp.status_code)
print(resp.text[:500])
