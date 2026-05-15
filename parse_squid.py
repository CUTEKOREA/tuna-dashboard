import json
import re

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/squid_real_data_v4.json', 'r') as f:
    data = json.load(f)

for w in data.get('widgets', []):
    # Fix title
    title = w.get('title', '')
    if ' - ' in title:
        title = title.replace(' - ', ' — ')
    if ': ' in title:
        title = title.replace(': ', ' — ')
    w['title'] = title
    
    # Add units if missing based on data
    if 'unit' not in w:
        w['unit'] = "Ton" if "톤" in title else "USD" if "USD" in title or "$" in title else "%" if "율" in title or "비중" in title else "Value"
        
    # Make takeaways an HTML list if it isn't already
    tak = w.get('takeaway') or w.get('strat') or w.get('tak') or ''
    if tak and not tak.startswith('<ul'):
        sentences = [s.strip() for s in re.split(r'(?<=[.?!])\s+', tak) if s.strip()]
        new_tak = "<ul style=\"margin:0; padding-left:1.2rem; display:flex; flexDirection:column; gap:6px;\">"
        for s in sentences:
            if ":" in s or "강조:" in s:
                parts = s.split(":", 1)
                new_tak += f"<li><strong>{parts[0]}:</strong> {parts[1]}</li>"
            else:
                new_tak += f"<li>{s}</li>"
        new_tak += "</ul>"
        if 'takeaway' in w: w['takeaway'] = new_tak
        if 'strat' in w: w['strat'] = new_tak
        if 'tak' in w: w['tak'] = new_tak
        
    # Ensure source exists
    if 'source' not in w:
        w['source'] = "Silla Co. Intelligence Analytics"

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/squid_real_data_v4.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("done")
