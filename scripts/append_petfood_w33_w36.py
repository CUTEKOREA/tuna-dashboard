import json

file_path = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/petfood_dashboard.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Add new data arrays
data["d_w33"] = [
    { "criteria": "소비자 선호도(%)", "carrageenan": 15, "clean_label": 85 },
    { "criteria": "공급망 안정성(%)", "carrageenan": 40, "clean_label": 95 },
    { "criteria": "단가 멀티플(배)", "carrageenan": 1.0, "clean_label": 2.5 }
]

data["d_w34"] = [
    { "product": "일반 어분(Fishmeal)", "margin": 15, "waste": 80 },
    { "product": "단일원료(Single-ingredient) 건강 간식", "margin": 65, "waste": 0 }
]

data["d_w35"] = [
    { "year": "2020", "copi_usage": 10, "esg_premium": 5 },
    { "year": "2022", "copi_usage": 45, "esg_premium": 15 },
    { "year": "2024E", "copi_usage": 120, "esg_premium": 35 }
]

data["d_w36"] = [
    { "year": "2020", "tuna_can": 500, "petfood_demand": 50 },
    { "year": "2022", "tuna_can": 650, "petfood_demand": 180 },
    { "year": "2024E", "tuna_can": 850, "petfood_demand": 420 }
]

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Successfully appended w33-w36 data to petfood_dashboard.json")
