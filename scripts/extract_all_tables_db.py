import pdfplumber
import json
import time

pdf_path = "data/선박정보/2025 원양산업 통계연보.pdf"
output_path = "public/data/2025_yearbook_all_tables.json"

all_data = {}

print("Starting full PDF table extraction...")
start_time = time.time()

with pdfplumber.open(pdf_path) as pdf:
    total_pages = len(pdf.pages)
    for i, page in enumerate(pdf.pages):
        page_num = i + 1
        tables = page.extract_tables()
        
        # Only save pages that actually have tables to keep the JSON size manageable
        if tables:
            all_data[f"page_{page_num}"] = {
                "tables": tables
            }
            
        if page_num % 50 == 0:
            print(f"Processed {page_num}/{total_pages} pages...")

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

end_time = time.time()
print(f"Extraction complete in {end_time - start_time:.2f} seconds!")
print(f"Total pages with tables: {len(all_data)}")
print(f"Saved to {output_path}")
