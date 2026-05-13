import os
import fitz # PyMuPDF
import glob

def extract_pdf_to_md(pdf_path):
    print(f"Processing: {pdf_path}")
    md_path = pdf_path + ".md"
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n\n"
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"Saved to {md_path}")
        # Optionally remove the PDF if we want to fully "convert" it, 
        # but preserving it is safer unless asked to delete.
        # User said "md 화 해주고", which implies conversion. I will just create the MD.
    except Exception as e:
        print(f"Error processing {pdf_path}: {e}")

if __name__ == "__main__":
    base_dir = "data/당근/extras"
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.lower().endswith(".pdf"):
                extract_pdf_to_md(os.path.join(root, file))
