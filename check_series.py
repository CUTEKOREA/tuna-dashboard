import json

with open("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/shrimp_real_data_v3.json", "r") as f:
    data = json.load(f)

for w in data.get("widgets", []):
    if w.get("id") in ["w17", "w19_hyperspectral", "w22_microalgae"]:
        print(f"ID: {w.get('id')}")
        print(f"Series: {w.get('series')}")
        print("-" * 40)
