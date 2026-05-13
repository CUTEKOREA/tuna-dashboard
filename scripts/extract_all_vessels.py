from pypdf import PdfReader
import re
import json

def extract_all():
    reader = PdfReader("data/선박정보/2025 원양산업 통계연보.pdf")
    vessels = []
    
    # We will search through pages 30 to 100 which typically contains the vessel registry.
    for i in range(20, 100):
        text = reader.pages[i].extract_text()
        if not text: continue
        
        lines = text.split('\n')
        for line in lines:
            # A typical vessel line might have numbers like tonnage, year, and a ship name.
            # Example: "원양선망 신라스프린터 DTTA 1171.00 2012-01-01 신라교역"
            # Or from OCR: "신진피셔리 오징어셰낚기 7 대양 490.00 49.00 74-07-15 태영양"
            
            # Simple heuristic: If it has a date format like XX-XX-XX or XXXX-XX-XX, or tonnage like XXX.XX
            # It's likely a ship.
            if re.search(r'\d{2,4}-\d{2}-\d{2}', line) or re.search(r'\d+\.\d{2}', line):
                # Try to clean it up
                vessels.append(line)
                
    with open("scripts/raw_all_vessels.txt", "w", encoding="utf-8") as f:
        for v in vessels:
            f.write(v + "\n")

extract_all()
