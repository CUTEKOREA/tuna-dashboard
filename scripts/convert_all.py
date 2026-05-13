import os
import glob
import logging
import pymupdf4llm

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    input_dir = "data/kimst_reports"
    output_dir = "data/kimst_reports_md"
    os.makedirs(output_dir, exist_ok=True)
    
    pdf_files = glob.glob(os.path.join(input_dir, "*.pdf"))
    pdf_files.extend(glob.glob(os.path.join(input_dir, "*.PDF")))
    
    # Filter files that are not converted yet
    to_convert = []
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        base_name = os.path.splitext(filename)[0]
        md_path = os.path.join(output_dir, f"{base_name}.md")
        if not os.path.exists(md_path):
            to_convert.append(pdf_path)
            
    logging.info(f"Found {len(to_convert)} files left to convert.")
    
    if not to_convert:
        logging.info("No files to process.")
        return
        
    for index, pdf_path in enumerate(to_convert, 1):
        filename = os.path.basename(pdf_path)
        base_name = os.path.splitext(filename)[0]
        md_path = os.path.join(output_dir, f"{base_name}.md")
        
        try:
            logging.info(f"[{index}/{len(to_convert)}] Converting {filename}...")
            md_text = pymupdf4llm.to_markdown(pdf_path)
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write(md_text)
            logging.info(f"Successfully converted {filename}")
        except Exception as e:
            logging.error(f"Failed to convert {filename}: {e}")

if __name__ == "__main__":
    main()
