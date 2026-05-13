from pypdf import PdfReader
import sys

def search_pdf(filepath):
    reader = PdfReader(filepath)
    num_pages = len(reader.pages)
    
    with open("scripts/squid_mackerel.txt", "w", encoding="utf-8") as f:
        # Tables for vessels are usually around pages 45-80
        for i in range(40, 80):
            text = reader.pages[i].extract_text()
            if not text: continue
            
            lines = text.split('\n')
            for line in lines:
                if "채낚기" in line or "선망" in line or "오징어" in line or "고등어" in line:
                    f.write(line + "\n")

search_pdf("data/선박정보/2025 원양산업 통계연보.pdf")
