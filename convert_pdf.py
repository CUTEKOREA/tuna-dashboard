import sys
import os

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Installing PyMuPDF...")
    os.system(f"{sys.executable} -m pip install PyMuPDF")
    import fitz

pdf_path = sys.argv[1]
md_path = sys.argv[2]

try:
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text() + "\n\n"
    
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Successfully converted {pdf_path} to {md_path}")
except Exception as e:
    print(f"Error: {e}")
