import json

file_path = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/shrimp_real_data_v3.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

for widget in data.get("widgets", []):
    if widget["id"] in ["w19_hyperspectral", "w20_fcr_80", "w21_peeling_esg", "w22_microalgae"]:
        for series_item in widget.get("series", []):
            if "key" in series_item:
                series_item["dataKey"] = series_item.pop("key")

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Widgets fixed.")
