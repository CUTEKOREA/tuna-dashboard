import os
import requests
import json
from datetime import datetime

API_KEY = os.environ.get("USCENSUS_API_KEY", "57ed5d9332b5b042e538a9dd3abc83c00a5a66eb")
BASE_URL = "https://api.census.gov/data/timeseries/intltrade/imports/hs"

# HS Codes to fetch
# 160414: Prepared/Preserved Tuna (canned)
# 030343: Frozen Skipjack
# 030475: Frozen Pollock Fillets
HS_CODES = ["160414", "030343", "030475"]
TIME_RANGE = "from 2021-01 to 2024-04"

def fetch_census_data(hs_code):
    # Fetch 6-digit data (overall value and country breakdown)
    url = f"{BASE_URL}?get=GEN_VAL_MO,CTY_CODE,CTY_NAME&I_COMMODITY={hs_code}&time={TIME_RANGE}&key={API_KEY}"
    print(f"Fetching {hs_code}...")
    try:
        resp = requests.get(url, timeout=20)
        if resp.status_code == 200:
            return resp.json()
        else:
            print(f"Error fetching {hs_code}: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Exception fetching {hs_code}: {e}")
    return []

def fetch_census_data_10digit(hs_code):
    # Fetch 10-digit data to aggregate quantity (for unit value)
    url = f"{BASE_URL}?get=GEN_VAL_MO,GEN_QY1_MO,UNIT_QY1,CTY_CODE,CTY_NAME&I_COMMODITY={hs_code}*&time={TIME_RANGE}&key={API_KEY}"
    print(f"Fetching 10-digit for {hs_code}...")
    try:
        resp = requests.get(url, timeout=20)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        print(f"Exception fetching {hs_code}*: {e}")
    return []

def parse_data(raw_data):
    if not raw_data or len(raw_data) < 2:
        return []
    
    headers = raw_data[0]
    parsed = []
    for row in raw_data[1:]:
        item = dict(zip(headers, row))
        parsed.append(item)
    return parsed

def process_timeseries():
    results = {}
    for hs in HS_CODES:
        print(f"Processing HS: {hs}")
        
        # 1) Get 6-digit level (Value only)
        raw_6 = fetch_census_data(hs)
        data_6 = parse_data(raw_6)
        
        # 2) Get 10-digit level (for Quantity/Unit Value)
        raw_10 = fetch_census_data_10digit(hs)
        data_10 = parse_data(raw_10)
        
        # Aggregate 10-digit into 6-digit by time and country
        agg = {}
        # First populate with 6-digit value data
        for row in data_6:
            t = row['time']
            cty = row['CTY_NAME']
            val = float(row['GEN_VAL_MO']) if row.get('GEN_VAL_MO') else 0
            
            key = f"{t}_{cty}"
            agg[key] = {
                "time": t,
                "country": cty,
                "value": val,
                "quantity_kg": 0
            }
            
        # Add quantities from 10-digit
        for row in data_10:
            if row.get('UNIT_QY1') == 'KG':
                t = row['time']
                cty = row['CTY_NAME']
                qy = float(row['GEN_QY1_MO']) if row.get('GEN_QY1_MO') else 0
                key = f"{t}_{cty}"
                if key in agg:
                    agg[key]["quantity_kg"] += qy
                
        # Calculate unit value and sort by time
        final_list = []
        for v in agg.values():
            uv = v['value'] / v['quantity_kg'] if v['quantity_kg'] > 0 else 0
            v['unit_value_usd_per_kg'] = uv
            final_list.append(v)
            
        final_list.sort(key=lambda x: x['time'])
        results[hs] = final_list
        
    # Save to public/data
    out_dir = os.path.join(os.getcwd(), "public", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "us_census_timeseries.json")
    with open(out_file, "w") as f:
        json.dump(results, f, indent=2)
    print(f"Saved data to {out_file}")

if __name__ == "__main__":
    process_timeseries()
