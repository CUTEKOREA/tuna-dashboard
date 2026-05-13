import os
import glob
import pymupdf4llm
from pathlib import Path
import logging
import argparse
import shutil

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def convert_pdfs_to_md(chunk_size=100, chunk_index=0):
    input_dir = "data/kimst_reports"
    output_dir = "data/kimst_reports_md"
    obsidian_out = "/Users/idong-geon/ledog memory/이동건 기억/Sources/KIMST_Reports"
    
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(obsidian_out, exist_ok=True)
    
    # Use Path.glob with case-insensitivity or just multiple patterns
    pdf_files = []
    pdf_files.extend(glob.glob(f"{input_dir}/*.pdf"))
    pdf_files.extend(glob.glob(f"{input_dir}/*.PDF"))
    pdf_files = sorted(list(set(pdf_files)))
    
    total_files = len(pdf_files)
    logging.info(f"Total PDF files found: {total_files}")
    
    start_idx = chunk_index * chunk_size
    end_idx = min(start_idx + chunk_size, total_files)
    
    if start_idx >= total_files:
        logging.info(f"Chunk index {chunk_index} is out of bounds. All files processed.")
        return
        
    chunk_files = pdf_files[start_idx:end_idx]
    logging.info(f"Processing chunk {chunk_index}: files {start_idx + 1} to {end_idx} (Total {len(chunk_files)} files in this chunk)")
    
    converted_count = 0
    error_count = 0
    skipped_count = 0
    
    for pdf_path in chunk_files:
        filename = os.path.basename(pdf_path)
        base_name = os.path.splitext(filename)[0]
        md_path = os.path.join(output_dir, f"{base_name}.md")
        obsidian_path = os.path.join(obsidian_out, f"{base_name}.md")
        
        if os.path.exists(md_path) and os.path.exists(obsidian_path):
            logging.info(f"Skipping {filename}, already converted in both locations.")
            skipped_count += 1
            continue
            
        logging.info(f"Converting {filename}...")
        try:
            # Use pymupdf4llm to convert PDF to Markdown
            md_text = pymupdf4llm.to_markdown(pdf_path)
            
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write(md_text)
                
            with open(obsidian_path, 'w', encoding='utf-8') as f:
                f.write(md_text)
                
            converted_count += 1
            logging.info(f"Successfully converted {filename}")
        except Exception as e:
            logging.error(f"Error converting {filename}: {e}")
            error_count += 1
            
    logging.info(f"Chunk {chunk_index} complete. Converted: {converted_count}, Skipped: {skipped_count}, Errors: {error_count}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert KIMST PDF reports to Markdown in chunks.")
    parser.add_argument('--chunk-size', type=int, default=100, help='Number of files to process per chunk')
    parser.add_argument('--chunk-index', type=int, default=0, help='Index of the chunk to process (0-based)')
    
    args = parser.parse_args()
    convert_pdfs_to_md(chunk_size=args.chunk_size, chunk_index=args.chunk_index)
