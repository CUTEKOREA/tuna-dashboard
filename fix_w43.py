import json

with open("public/data/shrimp_real_data_v3.json", "r") as f:
    data = json.load(f)

for w in data.get("widgets", []):
    if w["id"] == "w43_feed_inflation":
        w["methodology"] = "World Bank 원자재 가격 지수(대두/어분) 및 EUMOFA 양식 생산 원가 모니터링 데이터 교차 연산 [📡 LIVE API 연동: World Bank API]"
        w["title"] = "[Live 🟢] 양식 사료 인플레이션 타격 (Feed Cost Inflation)"

with open("public/data/shrimp_real_data_v3.json", "w") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
