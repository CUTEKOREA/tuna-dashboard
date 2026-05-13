from pypdf import PdfReader

reader = PdfReader("data/선박정보/2025 원양산업 통계연보.pdf")
text = []
for i, page in enumerate(reader.pages):
    t = page.extract_text()
    if t:
        text.append(f"--- PAGE {i+1} ---\n{t}")

with open("data/선박정보/2025_yearbook_full.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(text))

print(f"Extracted {len(text)} pages.")
