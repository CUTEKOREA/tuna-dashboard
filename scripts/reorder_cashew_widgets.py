import json

filepath = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/cashew_data.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

desired_order = [
    # Part I (7)
    "w01", "w02", "w03", "w04", "w05", "w32", "w34",
    # Part II (9)
    "w06", "w07", "w08", "w09", "w10", "w12", "w13", "w14", "w35",
    # Part III (8)
    "w15", "w16", "w17", "w18", "w19", "w20", "w31", "w33",
    # Part IV (7)
    "w21", "w22", "w23", "w24", "w25", "w26", "w36",
    # Part V (5)
    "w27", "w28", "w29", "w30", "w11"
]

widgets_dict = {w["id"]: w for w in data["widgets"]}
new_widgets_array = [widgets_dict[wid] for wid in desired_order if wid in widgets_dict]

# Just in case there are missing ones
for w in data["widgets"]:
    if w["id"] not in desired_order:
        new_widgets_array.append(w)

data["widgets"] = new_widgets_array

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("JSON widgets reordered successfully.")
