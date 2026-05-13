import os
import glob
import pymupdf4llm
from multiprocessing import Pool, cpu_count
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(processName)s - %(levelname)s - %(message)s')

def convert_single_pdf(pdf_path):
    output_dir = "/Users/idong-geon/ledog memory/이동건 기억/Sources/KIMST_Reports"
    filename = os.path.basename(pdf_path)
    base_name = os.path.splitext(filename)[0]
    md_path = os.path.join(output_dir, f"{base_name}.md")
    
    if os.path.exists(md_path):
        return True, filename
        
    try:
        md_text = pymupdf4llm.to_markdown(pdf_path)
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md_text)
        return True, filename
    except Exception as e:
        return False, f"{filename} - {str(e)}"

def main():
    input_dir = "data/kimst_reports"
    output_dir = "/Users/idong-geon/ledog memory/이동건 기억/Sources/KIMST_Reports"
    os.makedirs(output_dir, exist_ok=True)
    
    pdf_files = glob.glob(f"{input_dir}/*.pdf")
    logging.info(f"Found {len(pdf_files)} PDF files to convert. Storing directly in Obsidian vault: {output_dir}")
    
    # Also save a copy locally in data/kimst_reports_md/
    local_out = "data/kimst_reports_md"
    os.makedirs(local_out, exist_ok=True)
    
    success_count = 0
    error_count = 0
    
    with Pool(processes=max(1, cpu_count() - 1)) as pool:
        results = pool.imap_unordered(convert_single_pdf, pdf_files)
        for i, (success, msg) in enumerate(results, 1):
            if success:
                success_count += 1
                if i % 50 == 0:
                    logging.info(f"Progress: {i}/{len(pdf_files)} converted.")
            else:
                error_count += 1
                logging.error(f"Error: {msg}")
                
    logging.info(f"Conversion complete. Success: {success_count}, Errors: {error_count}")

if __name__ == "__main__":
    main()
