import json
import os

json_path = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/seasia_oem_vendors.json"

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

squid_companies = [
    {
        "name": "Kingfisher Holdings Ltd.",
        "country": "Thailand",
        "founded": "1972",
        "location": "Samut Prakan, Thailand",
        "employees": "~1,500 employees",
        "capacity": "2,000+ MT cold storage",
        "certifications": ["HACCP", "BRCGS", "MSC", "Halal"],
        "sourcing": "Domestic and imported raw materials",
        "markets": ["Japan", "USA", "Europe"],
        "species": ["Loligo squid", "Sepia cuttlefish"],
        "products": ["Frozen tubes, rings, tentacles, whole cleaned, cooked loins"]
    },
    {
        "name": "Thai Union Group PCL",
        "country": "Thailand",
        "founded": "1977",
        "location": "Samut Sakhon, Thailand",
        "employees": "44,000+ employees",
        "capacity": "10,000+ MT/year",
        "certifications": ["HACCP", "BRCGS", "MSC", "Halal"],
        "sourcing": "Domestic and imported raw materials",
        "markets": ["USA", "EU", "Japan"],
        "species": ["Loligo squid", "Todarodes squid"],
        "products": ["Frozen rings, frozen tubes, seasoned squid, shredded squid snacks"]
    },
    {
        "name": "Pataya Food Group",
        "country": "Thailand",
        "founded": "1979",
        "location": "Samut Sakhon, Thailand",
        "employees": "~3,000 employees",
        "capacity": "~5,000 MT/year",
        "certifications": ["HACCP", "BRCGS", "IFS", "Halal"],
        "sourcing": "Domestic and imported raw materials",
        "markets": ["Europe", "USA", "China"],
        "species": ["Loligo squid", "Sepia cuttlefish"],
        "products": ["Canned squid, seasoned squid, retort-pouch squid, frozen rings"]
    },
    {
        "name": "Tropical Canning (Thailand) Public Co., Ltd.",
        "country": "Thailand",
        "founded": "1979",
        "location": "Songkhla, Thailand",
        "employees": "~2,232 employees",
        "capacity": "~3,000 MT/year",
        "certifications": ["HACCP", "BRCGS", "ISO 22000", "Halal"],
        "sourcing": "Domestic and imported raw materials",
        "markets": ["Europe", "Asia", "USA", "Australia"],
        "species": ["Loligo squid", "Todarodes squid"],
        "products": ["Canned squid, ready-to-serve squid, seasoned squid, frozen rings"]
    },
    {
        "name": "Tin Thinh Co., Ltd.",
        "country": "Vietnam",
        "founded": "2002",
        "location": "Cam Lam, Khanh Hoa, Vietnam",
        "employees": "1,000+ employees",
        "capacity": "12,000+ MT/year frozen seafood",
        "certifications": ["HACCP", "BRC", "IFS", "EU DL385"],
        "sourcing": "Domestic coastal landings and imported raw materials",
        "markets": ["USA", "EU", "Japan", "Canada", "Australia"],
        "species": ["Loligo squid", "Sepia cuttlefish", "Todarodes squid"],
        "products": ["Frozen tubes, rings, tentacles, skewers, whole cleaned squid"]
    },
    {
        "name": "Thanh Dung Canning",
        "country": "Vietnam",
        "founded": "2019",
        "location": "Dong Hoa, Phu Yen Province, Vietnam",
        "employees": "~180 employees",
        "capacity": "~3,000 MT/year (estimated)",
        "certifications": ["HACCP", "NAFIQAD TS 980"],
        "sourcing": "Domestic raw materials from local catch",
        "markets": ["USA", "Saudi Arabia", "Canada"],
        "species": ["Loligo squid", "Sepia cuttlefish", "Todarodes squid"],
        "products": ["Frozen squid, dried squid, tentacles, whole cleaned squid"]
    },
    {
        "name": "Golden Ocean Seafood",
        "country": "Vietnam",
        "founded": "2019",
        "location": "Tuy Hoa City, Phú Yên Province, Vietnam",
        "employees": "~100 employees",
        "capacity": "~3,000 MT/year (estimated)",
        "certifications": ["HACCP"],
        "sourcing": "Domestic local raw materials",
        "markets": ["Japan", "USA", "Korea"],
        "species": ["Loligo squid", "Sepia cuttlefish"],
        "products": ["Frozen squid, dried squid, whole cleaned, tentacles"]
    },
    {
        "name": "Trang Thuy Seafood Co., Ltd.",
        "country": "Vietnam",
        "founded": "2001",
        "location": "Tuy Hoa City, Phu Yen Province, Vietnam",
        "employees": "~150 employees",
        "capacity": "~3,600 MT/year",
        "certifications": ["HACCP", "ISO", "BRC", "EU DL 626", "FDA"],
        "sourcing": "Domestic coastal landings and imported raw materials",
        "markets": ["USA", "Japan", "EU", "Korea", "Canada"],
        "species": ["Loligo squid", "Sepia cuttlefish"],
        "products": ["Frozen squid, dried squid, rings, tentacles, whole cleaned"]
    },
    {
        "name": "Binh Dinh Fishery JSC (BIDIFISCO)",
        "country": "Vietnam",
        "founded": "1999",
        "location": "Qui Nhon City, Binh Dinh Province, Vietnam",
        "employees": "~300 employees",
        "capacity": "~5,000 MT/year",
        "certifications": ["HACCP", "ISO 9001", "ISO 22000", "Friend of the Sea"],
        "sourcing": "Domestic offshore catch and imported raw materials",
        "markets": ["EU", "USA", "Japan", "Korea"],
        "species": ["Loligo squid", "Sepia cuttlefish", "Todarodes squid"],
        "products": ["Frozen squid, whole cleaned, portions, rings, tentacles"]
    }
]

# Create a mapping of lowercase company names to their dict in the existing data
existing_companies = {}
for i, item in enumerate(data):
    if "name" in item:
        name_lower = item["name"].lower()
        existing_companies[name_lower] = i

for sc in squid_companies:
    # try to find match
    match_idx = -1
    for key, idx in existing_companies.items():
        if sc["name"].lower() in key or key in sc["name"].lower() or sc["name"].lower()[:10] == key[:10]:
            match_idx = idx
            break
            
    if match_idx != -1:
        # update existing company
        comp = data[match_idx]
        
        # Add to publicProfile products if it exists
        if "publicProfile" not in comp:
            comp["publicProfile"] = {}
        
        if "products" not in comp["publicProfile"] or not isinstance(comp["publicProfile"]["products"], list):
            comp["publicProfile"]["products"] = []
            
        squid_product_str = "Squid processing: " + ", ".join(sc["products"]) + " (Species: " + ", ".join(sc["species"]) + ")"
        
        # Check if already added to avoid duplication
        already_added = False
        for p in comp["publicProfile"]["products"]:
            if "squid" in str(p).lower():
                already_added = True
                break
                
        if not already_added:
            comp["publicProfile"]["products"].append(squid_product_str)
            
        # Update existing properties if needed
        # We assume the UI will read publicProfile.products
    else:
        # insert new company
        new_comp = {
            "id": sc["name"].lower().replace(" ", "-").replace(",", "").replace(".", ""),
            "country": sc["country"],
            "name": sc["name"],
            "region": "Unknown",
            "capacityMT": 0,
            "hasFDA": "FDA" in sc["certifications"],
            "hasEU": "EU" in str(sc["certifications"]),
            "msc": "MSC" in sc["certifications"],
            "specialty": "Squid processing",
            "takeaway": f"Major squid processor in {sc['country']}.",
            "tier": "Tier 2",
            "publicProfile": {
                "founded": sc["founded"],
                "headquarters": sc["location"],
                "employees": sc["employees"],
                "capacityNote": sc["capacity"],
                "products": ["Squid processing: " + ", ".join(sc["products"]) + " (Species: " + ", ".join(sc["species"]) + ")"],
                "certifications": [{"standard": c, "note": ""} for c in sc["certifications"]],
                "exportMarkets": sc["markets"]
            }
        }
        data.append(new_comp)

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated seasia_oem_vendors.json successfully.")
