import os
import glob
import pymupdf4llm
from pathlib import Path
import time
import json
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def convert_pdfs_to_md():
    input_dir = "data/kimst_reports"
    output_dir = "data/kimst_reports_md"
    
    os.makedirs(output_dir, exist_ok=True)
    
    pdf_files = glob.glob(f"{input_dir}/*.pdf")
    logging.info(f"Found {len(pdf_files)} PDF files to convert.")
    
    converted_count = 0
    error_count = 0
    
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        base_name = os.path.splitext(filename)[0]
        md_path = os.path.join(output_dir, f"{base_name}.md")
        
        if os.path.exists(md_path):
            logging.info(f"Skipping {filename}, already converted.")
            continue
            
        logging.info(f"Converting {filename}...")
        try:
            # Use pymupdf4llm to convert PDF to Markdown
            md_text = pymupdf4llm.to_markdown(pdf_path)
            
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write(md_text)
                
            converted_count += 1
            logging.info(f"Successfully converted {filename}")
        except Exception as e:
            logging.error(f"Error converting {filename}: {e}")
            error_count += 1
            
    logging.info(f"Conversion complete. Converted: {converted_count}, Errors: {error_count}")

if __name__ == "__main__":
    convert_pdfs_to_md()
