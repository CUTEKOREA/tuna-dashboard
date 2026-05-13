import json
import re

# 1. Update cashew_data.json
with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/cashew_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def assign_rel(text):
    if not text:
        return 65
    estimates = ['역산', '시뮬레이션', '모델', '알고리즘', '추정', '예측', 'NotebookLM', '내부', '시뮬레이터', '엔진']
    for e in estimates:
        if e in text:
            return 65
    return 100

for w in data['widgets']:
    w['reliability'] = assign_rel(w.get('methodology', ''))

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/cashew_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated cashew_data.json")

# 2. Update CashewIntelligenceData.ts
ts_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/CashewIntelligenceData.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add reliability to type
content = content.replace("trend: 'up' | 'down' | 'neutral' | 'alert';", "trend: 'up' | 'down' | 'neutral' | 'alert';\n  reliability?: number;")

def repl_widget(match):
    full = match.group(0)
    if 'reliability:' in full:
        return full
    source_match = re.search(r"source:\s*'([^']+)'", full)
    rel = 100
    if source_match:
        rel = assign_rel(source_match.group(1))
    
    # insert before trend
    return full.replace("trend:", f"reliability: {rel}, trend:")

content = re.sub(r"\{\s*title:[^\}]+trend:\s*'[^']+'\s*\}", repl_widget, content)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated CashewIntelligenceData.ts")
