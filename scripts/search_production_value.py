from pypdf import PdfReader

reader = PdfReader("data/선박정보/2025 원양산업 통계연보.pdf")
pages_with_value = []
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    if text and ("생산금액" in text or "원양어업" in text):
        if "생산금액" in text:
            pages_with_value.append(i + 1)

print(f"Pages with '생산금액': {pages_with_value[:10]}")
