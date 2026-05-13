import json
import glob
import re

files = glob.glob('public/data/*_widgets.json')
keywords = ["시뮬레이션", "전망", "시나리오", "효과", "추정", "예측", "가정", "목표치", "잠재력", "시사점", "민감도", "추이", "기대", "영향", "임계점", "가능성"]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Not all files might have widgets array, some might have different structure
    # Tuna widget JSON structure: data = [ {id:..}, ... ] or { widgets: [...] }
    
    if isinstance(data, list):
        widgets = data
    elif isinstance(data, dict) and "widgets" in data:
        widgets = data["widgets"]
    else:
        continue
        
    for w in widgets:
        text_to_search = w.get("title", "") + " " + w.get("subtitle", "") + " " + w.get("sit", "") + " " + w.get("strat", "")
        if any(kw in text_to_search for kw in keywords):
            w["reliability"] = 65
        else:
            w["reliability"] = 90
            
    with open(file, 'w', encoding='utf-8') as f:
        if isinstance(data, list):
            json.dump(widgets, f, ensure_ascii=False, indent=2)
        else:
            json.dump({"widgets": widgets}, f, ensure_ascii=False, indent=2)

print("Updated all JSON files.")
