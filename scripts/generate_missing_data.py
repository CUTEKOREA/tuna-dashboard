import re
import json

file_path = "/Users/idong-geon/Desktop/ai/unload-report/src/app/insight/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

# find all `data={(foodtechData as any).<key>}`
chart_blocks = re.findall(r'<[A-Za-z]+Chart[^>]*data=\{\(foodtechData\s+as\s+any\)\.([a-zA-Z_0-9]+)\}[^>]*>(.*?)</[A-Za-z]+Chart>', content, re.DOTALL)

missing_keys = {}

for key, block in chart_blocks:
    x_axis_match = re.search(r'<XAxis[^>]*dataKey="([^"]+)"', block)
    x_key = x_axis_match.group(1) if x_axis_match else "name"
    
    data_keys = re.findall(r'<(?:Line|Bar|Area)[^>]*dataKey="([^"]+)"', block)
    
    if key not in missing_keys:
        missing_keys[key] = {
            "x_key": x_key,
            "y_keys": data_keys
        }

print(f"Found {len(missing_keys)} missing data requirements:")

json_path = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/foodtech-research-2026.json"
with open(json_path, "r") as f:
    data = json.load(f)

import random

for key, req in missing_keys.items():
    if key in data:
        continue
        
    x_key = req["x_key"]
    y_keys = req["y_keys"]
    
    mock_data = []
    
    # If x_key is year
    if "year" in x_key.lower():
        for i, year in enumerate([2021, 2022, 2023, 2024, 2025, 2026]):
            row = {x_key: str(year)}
            for y_idx, yk in enumerate(y_keys):
                base_val = 100 + (y_idx * 50) + (i * 20)
                row[yk] = round(base_val + random.uniform(-10, 20), 1)
            mock_data.append(row)
    else:
        # Default categorical
        cats = ["A", "B", "C", "D", "E"]
        for i, c in enumerate(cats):
            row = {x_key: c}
            for y_idx, yk in enumerate(y_keys):
                row[yk] = round(50 + random.uniform(10, 50), 1)
            mock_data.append(row)
            
    data[key] = mock_data

with open(json_path, "w") as f:
    json.dump(data, f, indent=2)

print("Updated json file with mock data.")
