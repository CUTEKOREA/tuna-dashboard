import json
import random
import copy

file_path = 'data/consignment_3year.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# 1. yearlyTop
if "2024" in data["yearlyTop"]:
    data["yearlyTop"]["2025"] = []
    data["yearlyTop"]["2026"] = []
    for item in data["yearlyTop"]["2024"]:
        item_2025 = copy.deepcopy(item)
        item_2025["saleAmount"] *= random.uniform(0.85, 1.15)
        item_2025["saleQty"] *= random.uniform(0.85, 1.15)
        data["yearlyTop"]["2025"].append(item_2025)
        
        item_2026 = copy.deepcopy(item)
        item_2026["saleAmount"] *= random.uniform(0.85, 1.15)
        item_2026["saleQty"] *= random.uniform(0.85, 1.15)
        data["yearlyTop"]["2026"].append(item_2026)

# 2. monthlyDetail
for ym, item_list in list(data["monthlyDetail"].items()):
    if ym.startswith("2024"):
        month_suffix = ym[4:]
        
        # 2025
        ym_2025 = "2025" + month_suffix
        data["monthlyDetail"][ym_2025] = []
        for item in item_list:
            item_new = copy.deepcopy(item)
            item_new["saleAmount"] *= random.uniform(0.85, 1.15)
            item_new["saleQty"] *= random.uniform(0.85, 1.15)
            data["monthlyDetail"][ym_2025].append(item_new)
            
        # 2026 (only up to month 05)
        if int(month_suffix) <= 5:
            ym_2026 = "2026" + month_suffix
            data["monthlyDetail"][ym_2026] = []
            for item in item_list:
                item_new = copy.deepcopy(item)
                item_new["saleAmount"] *= random.uniform(0.85, 1.15)
                item_new["saleQty"] *= random.uniform(0.85, 1.15)
                data["monthlyDetail"][ym_2026].append(item_new)

# 3. items
new_items = []
for item in data["items"]:
    if item["year"] == "2024":
        # 2025
        item_2025 = copy.deepcopy(item)
        item_2025["year"] = "2025"
        item_2025["month"] = "2025" + item["month"][4:]
        item_2025["saleAmount"] *= random.uniform(0.85, 1.15)
        item_2025["saleQty"] *= random.uniform(0.85, 1.15)
        new_items.append(item_2025)
        
        # 2026 (only up to month 05)
        if int(item["month"][5:7]) <= 5:
            item_2026 = copy.deepcopy(item)
            item_2026["year"] = "2026"
            item_2026["month"] = "2026" + item["month"][4:]
            item_2026["saleAmount"] *= random.uniform(0.85, 1.15)
            item_2026["saleQty"] *= random.uniform(0.85, 1.15)
            new_items.append(item_2026)

data["items"].extend(new_items)

# Update meta
data["_meta"]["years"] = sorted(list(data["yearlyTop"].keys()))
data["_meta"]["months"] = sorted(list(data["monthlyDetail"].keys()))
data["_meta"]["totalRecords"] = len(data["items"])

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Mock data populated successfully.")
