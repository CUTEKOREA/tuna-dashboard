import json
import os

def main():
    base_dir = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data"
    
    with open(os.path.join(base_dir, "mackerel_macro.json"), "r") as f:
        mackerel_macro = json.load(f)
        
    with open(os.path.join(base_dir, "tuna_aqua_value.json"), "r") as f:
        tuna_aqua = json.load(f)
        
    with open(os.path.join(base_dir, "mackerel_fishmeal.json"), "r") as f:
        fishmeal = json.load(f)

    # Convert to dict by year
    mac_dict = {int(row["year"]): row for row in mackerel_macro}
    tuna_dict = {int(row["Year"]): row for row in tuna_aqua}
    fm_dict = {int(row["year"]): row for row in fishmeal}

    combined = []
    
    for year in range(1990, 2024):
        mac_price = mac_dict.get(year, {}).get("unit_price_usd", 0)
        tuna_vol = tuna_dict.get(year, {}).get("Aqua_Volume", 0)
        tuna_val = tuna_dict.get(year, {}).get("Aqua_Value", 0)
        
        fm = fm_dict.get(year, {})
        fm_prod = fm.get("chile", 0) + fm.get("peru", 0)
        
        combined.append({
            "year": year,
            "mackerel_price_usd": round(mac_price, 2),
            "tuna_aqua_vol_t": round(tuna_vol, 2),
            "tuna_aqua_val_usd": round(tuna_val, 2),
            "fishmeal_prod_kt": round(fm_prod, 2)
        })

    out_path = os.path.join(base_dir, "mackerel_tuna_feed_correlation.json")
    with open(out_path, "w") as f:
        json.dump(combined, f, indent=2, ensure_ascii=False)
        
    print(f"Generated {out_path}")

if __name__ == "__main__":
    main()
