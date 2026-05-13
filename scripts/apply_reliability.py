import json, os, glob

data_dir = "public/data/"
json_files = glob.glob(os.path.join(data_dir, "*.json"))

high_rel_keywords = ["FAO", "FAOSTAT", "World Bank", "KAMIS", "KREI", "OEC", "ICES", "NPFC", "UN Comtrade", "KITA", "관세청", "통계청", "해양수산부"]
low_rel_keywords = ["NotebookLM", "MD 보고서", "논문", "Estimate", "추정", "시뮬레이션", "Proxy", "가정", "heuristic", "연구", "Research", "ETI", "Seafood Watch", "GSSI", "Bakkafrost"]

updated_count = 0

for file in json_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        continue
        
    modified = False
    
    # Handle the "widgets" array if it exists
    if isinstance(data, dict) and "widgets" in data and isinstance(data["widgets"], list):
        for w in data["widgets"]:
            # Even if reliability already exists, let's re-evaluate or ensure it's there
            # We want to identify if it's an estimate
            text_to_search = str(w.get("source", "")) + " " + str(w.get("subtitle", "")) + " " + str(w.get("logic", ""))
            
            # Default to 100 if we have hard data sources
            reliability = 100
            
            # If we find any low-rel keyword, it's an estimate (<= 70)
            for kw in low_rel_keywords:
                if kw.lower() in text_to_search.lower():
                    reliability = 60
                    break
            
            # Special case: If there is no source at all, maybe we flag it as 60?
            # Let's keep existing logic: if "Estimate" etc is found or "MD"
            if not w.get("source") and "Estimate" in str(w.get("title", "")):
                reliability = 60
                
            # If no high reliable keyword is found, and we didn't flag it as low, 
            # we might want to flag as 60 if it's purely heuristic.
            
            w["reliability"] = reliability
            modified = True
            
    if modified:
        with open(file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        updated_count += 1

print(f"Updated {updated_count} files with reliability scores.")
