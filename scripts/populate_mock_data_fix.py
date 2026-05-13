import json
import random
import copy
from collections import defaultdict

file_path = 'data/consignment_3year.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Clear 2025 and 2026 from all structures
if "2025" in data["yearlyTop"]:
    del data["yearlyTop"]["2025"]
if "2026" in data["yearlyTop"]:
    del data["yearlyTop"]["2026"]

keys_to_del = [k for k in data["monthlyDetail"].keys() if k.startswith("2025") or k.startswith("2026")]
for k in keys_to_del:
    del data["monthlyDetail"][k]

data["items"] = [item for item in data["items"] if item["year"] == "2024"]

# Rebuild items for 2025 (1-12) and 2026 (1-5)
new_items = []
for item in data["items"]:
    if item["year"] == "2024":
        # 2025
        item_2025 = copy.deepcopy(item)
        item_2025["year"] = "2025"
        item_2025["month"] = "2025" + item["month"][4:]
        item_2025["saleAmount"] *= random.uniform(0.85, 1.15)
        item_2025["saleQty"] *= random.uniform(0.85, 1.15)
        item_2025["avgUnitPrice"] = round(item_2025["saleAmount"]/item_2025["saleQty"]) if item_2025["saleQty"]>0 else 0
        new_items.append(item_2025)
        
        # 2026 (only up to month 05)
        if int(item["month"][5:7]) <= 5:
            item_2026 = copy.deepcopy(item)
            item_2026["year"] = "2026"
            item_2026["month"] = "2026" + item["month"][4:]
            item_2026["saleAmount"] *= random.uniform(0.85, 1.15)
            item_2026["saleQty"] *= random.uniform(0.85, 1.15)
            item_2026["avgUnitPrice"] = round(item_2026["saleAmount"]/item_2026["saleQty"]) if item_2026["saleQty"]>0 else 0
            new_items.append(item_2026)

data["items"].extend(new_items)

# Rebuild monthlyDetail from items
for ym in set(i["month"] for i in new_items):
    ym_items = [i for i in new_items if i["month"] == ym]
    ranked = sorted(ym_items, key=lambda x: x["saleAmount"], reverse=True)
    for idx, r in enumerate(ranked):
        r["rank"] = idx + 1
    data["monthlyDetail"][ym] = ranked[:30]

# Rebuild yearlyTop from items
for y in ["2025", "2026"]:
    y_items = [i for i in new_items if i["year"] == y]
    
    # Aggregate by species
    species_agg = defaultdict(lambda: {"amount": 0, "qty": 0})
    for item in y_items:
        species_agg[item["seafoodName"]]["amount"] += item["saleAmount"]
        species_agg[item["seafoodName"]]["qty"] += item["saleQty"]
        
    ranked = sorted(species_agg.items(), key=lambda x: x[1]["amount"], reverse=True)
    data["yearlyTop"][y] = [
        {
            "rank": i + 1,
            "seafoodName": sp,
            "saleAmount": v["amount"],
            "saleQty": v["qty"],
            "avgUnitPrice": round(v["amount"] / v["qty"]) if v["qty"] > 0 else 0,
        }
        for i, (sp, v) in enumerate(ranked[:30])
    ]

# Update meta
data["_meta"]["years"] = sorted(list(data["yearlyTop"].keys()))
data["_meta"]["months"] = sorted(list(data["monthlyDetail"].keys()))
data["_meta"]["totalRecords"] = len(data["items"])

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Mock data regenerated successfully.")
