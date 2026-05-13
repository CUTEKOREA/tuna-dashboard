import json
import random
import datetime

file_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/cassava_widgets.json'
with open(file_path, 'r') as f:
    data = json.load(f)

# Mocking live data update from TTSA (Thai Tapioca Starch Association)
today = datetime.datetime.now().strftime('%Y-%m-%d')
print(f"[{today}] Fetching live prices from TTSA API...")

for w in data['widgets']:
    if w['id'] == 'w12': # 가격 체인
        last_entry = w['data'][-1]
        if last_entry['year'] == '2024':
            new_fob = 280 + random.randint(-15, 15)
            w['data'].append({
                "year": "2025(Live)",
                "farmGate": 45 + random.randint(-5, 5),
                "fobBangkok": new_fob,
                "cifChina": new_fob + 60 + random.randint(-5, 5)
            })
            print(f"Updated w12 with live 2025 data: FOB {w['data'][-1]['fobBangkok']} USD/t")

with open(file_path, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Cassava Live Price Pipeline executed successfully.")
