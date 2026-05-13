import json

with open("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/shrimp_real_data_v3.json", "r") as f:
    data = json.load(f)

for w in data.get("widgets", []):
    print(f"ID: {w.get('id')}")
    print(f"Title: {w.get('title')}")
    print(f"Chart: {w.get('chartType')}")
    print(f"Sit/Situation: {w.get('sit') or w.get('situation')}")
    print(f"Strat/Takeaway: {w.get('strat') or w.get('takeaway')}")
    print(f"Logic/Methodology: {w.get('logic') or w.get('methodology')}")
    
    # Check data keys for units
    if "data" in w and len(w["data"]) > 0:
        keys = list(w["data"][0].keys())
        print(f"Data Keys: {keys}")
    print("-" * 40)
