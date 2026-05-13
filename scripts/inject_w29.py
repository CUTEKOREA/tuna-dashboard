import json
import os

def main():
    base_dir = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard"
    json_path = os.path.join(base_dir, "public/data/mackerel_real_data_v11.json")
    
    with open(json_path, "r") as f:
        data = json.load(f)
        
    with open(os.path.join(base_dir, "data/mackerel_tuna_feed_correlation.json"), "r") as f:
        chart_data = json.load(f)
        
    # Filter from year 2000 to 2023 for better visualization
    filtered_data = [row for row in chart_data if 2000 <= row["year"] <= 2023]
    
    new_widget = {
        "id": "w29",
        "title": "고등어 사료 단가 vs 참다랑어 양식 성장 상관관계",
        "type": "ComposedChart",
        "data": filtered_data,
        "config": {
            "xAxisKey": "year",
            "series": [
                {
                    "type": "bar",
                    "dataKey": "tuna_aqua_vol_t",
                    "name": "참다랑어 양식량 (톤)",
                    "color": "#3b82f6",
                    "yAxisId": "left"
                },
                {
                    "type": "line",
                    "dataKey": "mackerel_price_usd",
                    "name": "고등어 글로벌 단가 (USD/t)",
                    "color": "#ef4444",
                    "yAxisId": "right"
                }
            ],
            "yAxes": [
                {
                    "id": "left",
                    "orientation": "left"
                },
                {
                    "id": "right",
                    "orientation": "right"
                }
            ]
        },
        "insight": {
            "situation": "고등어는 육식성 최고급 어종인 참다랑어(Bluefin Tuna) 양식의 필수 사료(원물 및 어분)로 대량 소비됩니다. 지난 20년간 참다랑어 양식업이 폭발적으로 성장하며 사료용 고등어 수요 역시 구조적으로 급증했습니다.",
            "takeaway": "참다랑어 양식 시장의 팽창이 사료용 고등어에 대한 지속적인 초과 수요를 창출하여, 고등어 글로벌 단가(USD)의 장기 우상향을 견인하는 강력한 가격 지지선(Price Floor) 역할을 하고 있습니다."
        }
    }
    
    # Check if w29 already exists
    exists = False
    for i, w in enumerate(data.get("widgets", [])):
        if w["id"] == "w29":
            data["widgets"][i] = new_widget
            exists = True
            break
            
    if not exists:
        data["widgets"].append(new_widget)
        
    with open(json_path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully injected w29 into {json_path}")

if __name__ == "__main__":
    main()
