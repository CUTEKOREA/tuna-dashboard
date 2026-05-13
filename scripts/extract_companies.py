from pypdf import PdfReader
import sys

def extract_vessels(filepath):
    reader = PdfReader(filepath)
    num_pages = len(reader.pages)
    
    companies = ["신라교역", "동원산업", "사조산업", "사조대림", "한성기업"]
    
    with open("scripts/extracted_vessels.txt", "w", encoding="utf-8") as f:
        for i in range(1, min(num_pages, 100)):  # Check first 100 pages for the vessel list
            text = reader.pages[i].extract_text()
            if not text: continue
            
            lines = text.split('\n')
            for idx, line in enumerate(lines):
                if any(c in line for c in companies):
                    # Write the matching line and the next 10 lines
                    f.write(f"\n--- Page {i+1} Match: {line} ---\n")
                    start = idx
                    end = min(len(lines), idx + 25)
                    for j in range(start, end):
                        if "계" in lines[j] and len(lines[j]) < 15:
                            f.write(lines[j] + "\n")
                            break # stop at "계" (total)
                        f.write(lines[j] + "\n")

extract_vessels("data/선박정보/2025 원양산업 통계연보.pdf")
print("Done extracting. Check scripts/extracted_vessels.txt")
