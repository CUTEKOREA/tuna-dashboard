import requests
import json
import os
import time

def scan_thai_moc_hs_codes():
    base_url = "https://tradereport.moc.go.th/api/products"
    
    # User's requested items and keywords
    items = [
        {"name": "참치", "keyword": "tuna"},
        {"name": "오징어", "keyword": "squid"},
        {"name": "명태", "keyword": "pollock"},
        {"name": "고등어", "keyword": "mackerel"},
        {"name": "새우", "keyword": "shrimp"},
        {"name": "새우(Prawn)", "keyword": "prawn"},
        {"name": "연어", "keyword": "salmon"},
        {"name": "캐슈넛", "keyword": "cashew"},
        {"name": "카사바", "keyword": "cassava"},
        {"name": "타피오카(카사바)", "keyword": "tapioca"},
        {"name": "마늘", "keyword": "garlic"},
        {"name": "당근", "keyword": "carrot"},
        {"name": "코코아", "keyword": "cocoa"}
    ]
    
    catalog = {}
    
    print(f"🚀 Starting Thai MOC HS Code Scan for {len(items)} keywords...")
    
    for item in items:
        name = item["name"]
        keyword = item["keyword"]
        
        print(f"🔍 Scanning: {name} (Keyword: {keyword})...")
        
        try:
            params = {"keyword": keyword}
            response = requests.get(base_url, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"✅ Found {len(data)} items for {name}")
                    catalog[name] = {
                        "keyword": keyword,
                        "total_found": len(data),
                        "items": data
                    }
                else:
                    print(f"⚠️ Unexpected data format for {name}")
            else:
                print(f"❌ Failed to fetch data for {name}. Status: {response.status_code}")
                
        except Exception as e:
            print(f"💥 Error scanning {name}: {str(e)}")
        
        # Polite delay to avoid hitting rate limits
        time.sleep(1)
    
    # Save the results
    output_path = "data/thai_moc_hs_codes.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=4)
    
    print(f"🎉 Scan complete! Results saved to {output_path}")

if __name__ == "__main__":
    scan_thai_moc_hs_codes()
