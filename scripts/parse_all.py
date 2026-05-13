import re
import json

lines = []
with open("scripts/raw_all_vessels.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

all_vessels = []

for line in lines:
    line = line.strip()
    # Match lines that have a date-like string (e.g. 88-11-16 or 11-12-27) and a tonnage-like string (e.g. 423.00)
    # The format in the OCR is often: [Company] [Vessel Name] [Tonnage] [Something] [Date] [Ocean]
    # Example: 동원 203 397.00 49.91 88-04-16 심대양
    # Example: 사조콜롬비이 1,014.00 70.76 12- 04- 30 삼대앙
    
    # Try to find date
    date_match = re.search(r'(\d{2,4})[\s-]*(\d{2})[\s-]*(\d{2})', line)
    if not date_match:
        continue
        
    # Try to find tonnage (number with decimal or comma)
    tonnage_match = re.search(r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', line)
    if not tonnage_match:
        continue
        
    # Clean up line to extract name
    # Remove the date and tonnage and things that look like numbers
    name_part = line[:tonnage_match.start()].strip()
    
    # Remove common words like '참 치 연 승', '사조산업' if they are stuck
    name_part = re.sub(r'참\s*치\s*연\s*승|장\s*치\s*연\s*승|참\s*치\s*선\s*망|장\s*치\s*선\s*망|대\s*서\s*양\s*트\s*롤', '', name_part)
    name_part = name_part.strip()
    
    if len(name_part) < 2:
        continue
        
    tonnage = tonnage_match.group(1).replace(',', '')
    
    y, m, d = date_match.groups()
    if len(y) == 2:
        if int(y) > 30: y = "19" + y
        else: y = "20" + y
    launch_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"
    
    all_vessels.append({
        "name": name_part,
        "tonnage": tonnage,
        "launch_date": launch_date,
        "raw_line": line
    })

# Deduplicate by name and tonnage
unique_vessels = []
seen = set()
for v in all_vessels:
    key = f"{v['name']}_{v['tonnage']}"
    if key not in seen:
        seen.add(key)
        unique_vessels.append(v)

unique_vessels.sort(key=lambda x: x['name'])

with open("scripts/all_parsed.json", "w", encoding="utf-8") as f:
    json.dump(unique_vessels, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(unique_vessels)} unique vessels.")
