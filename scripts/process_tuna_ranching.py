import json
import os

out_dir = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data"

tuna_ranching_data = {
    "mockAquaculturePremium": [
        {"year": 2005, "야생_어획_단가": 12000, "양식_단가": 8000},
        {"year": 2010, "야생_어획_단가": 15000, "양식_단가": 12500},
        {"year": 2015, "야생_어획_단가": 18000, "양식_단가": 19000}, # Inversion point
        {"year": 2020, "야생_어획_단가": 21000, "양식_단가": 26000},
        {"year": 2024, "야생_어획_단가": 23500, "양식_단가": 31000},
    ],
    "mockGastronomyMap": [
        {"country": 'Japan', "price": 28},
        {"country": 'USA (NY/LA)', "price": 32},
        {"country": 'China (Coast)', "price": 35},
        {"country": 'Hong Kong', "price": 38},
        {"country": 'UAE (Dubai)', "price": 42},
    ],
    "growthData": [
        {"year": '2026', "value": 790},
        {"year": '2028', "value": 870},
        {"year": '2030', "value": 960},
        {"year": '2032', "value": 1050},
        {"year": '2035', "value": 1190},
    ],
    "quotaData": [
        {"name": 'EU (스페인/이탈리아 등)', "value": 52.1, "color": '#3b82f6'},
        {"name": '모로코 (SNB 등)', "value": 9.1, "color": '#10b981'},
        {"name": '기타 국가', "value": 38.0, "color": '#64748b'},
        {"name": '한국', "value": 0.8, "color": '#ef4444'},
    ]
}

os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, "tuna_ranching_dashboard.json"), "w") as f:
    json.dump(tuna_ranching_data, f, indent=2, ensure_ascii=False)

print("Created tuna_ranching_dashboard.json")
