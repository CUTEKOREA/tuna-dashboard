from pypdf import PdfReader
import sys

def search_pdf(filepath, keyword, max_pages=1000):
    reader = PdfReader(filepath)
    num_pages = len(reader.pages)
    print(f"Total pages: {num_pages}")
    
    matches = []
    for i in range(min(num_pages, max_pages)):
        text = reader.pages[i].extract_text()
        if text and keyword in text:
            matches.append((i+1, text))
            
    return matches

matches = search_pdf("data/선박정보/2025 원양산업 통계연보.pdf", "신라교역", 200)
for page, text in matches[:2]:  # Show first 2 matches
    print(f"\n--- Page {page} ---")
    lines = text.split('\n')
    for idx, line in enumerate(lines):
        if "신라교역" in line:
            # print context around the match
            start = max(0, idx - 5)
            end = min(len(lines), idx + 6)
            print("\n".join(lines[start:end]))
            print("-" * 20)

