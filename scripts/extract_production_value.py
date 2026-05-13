import pdfplumber
import json
import re

pdf_path = "data/선박정보/2025 원양산업 통계연보.pdf"
output_path = "public/data/deepsea_production_value.json"

target_pages = [88, 89, 120, 121, 219]
production_data = {}

def clean_text(text):
    if text is None: return ""
    return text.replace('\n', ' ').strip()

with pdfplumber.open(pdf_path) as pdf:
    for page_num in target_pages:
        page = pdf.pages[page_num - 1]
        text = page.extract_text()
        tables = page.extract_tables()
        
        production_data[f"page_{page_num}"] = {
            "text_snippet": text[:500] if text else "",
            "tables": tables
        }

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(production_data, f, ensure_ascii=False, indent=2)

print(f"Extraction complete! Saved to {output_path}")
