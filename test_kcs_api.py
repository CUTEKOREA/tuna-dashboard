import requests
import json
import urllib.parse

import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(".env.local")

service_key = os.getenv("KCS_API_KEY")
url = "https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList"

params = {
    "serviceKey": service_key,
    "strtYymm": "202403",
    "endYymm": "202403",
    "hsSgn": "030617",
}

# The requests library URL encodes the service key, but data.go.kr keys are usually already URL encoded.
# So we manually construct the query string to prevent double encoding.
query_string = urllib.parse.urlencode(params, safe="%")
full_url = f"{url}?{query_string}"

try:
    response = requests.get(full_url, timeout=10)
    print(response.status_code)
    print(response.text[:500])
except Exception as e:
    print("Error:", e)
