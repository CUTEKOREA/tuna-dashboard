import os
import pandas as pd
import shutil
import glob

def process_ship_data():
    base_dir = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/선박정보'
    output_dir = os.path.join(base_dir, 'raw', 'notebooklm')
    
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Process TXT files
    txt_files = glob.glob(os.path.join(base_dir, '*.txt'))
    for txt_file in txt_files:
        filename = os.path.basename(txt_file)
        name_without_ext = os.path.splitext(filename)[0]
        md_filename = os.path.join(output_dir, f"{name_without_ext}.md")
        
        with open(txt_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        with open(md_filename, 'w', encoding='utf-8') as f:
            f.write(f"# {name_without_ext}\n\n")
            f.write(content)
        print(f"Created MD for TXT: {md_filename}")

    # 2. Process CSV files (summarize to avoid huge sizes)
    csv_files = glob.glob(os.path.join(base_dir, '*.csv')) + glob.glob(os.path.join(base_dir, '*.CSV'))
    
    for csv_file in csv_files:
        filename = os.path.basename(csv_file)
        name_without_ext = os.path.splitext(filename)[0]
        md_filename = os.path.join(output_dir, f"{name_without_ext}_데이터명세서.md")
        
        try:
            # Try cp949 first (common in Korean public data), then utf-8
            try:
                df = pd.read_csv(csv_file, encoding='cp949', low_memory=False)
            except:
                df = pd.read_csv(csv_file, encoding='utf-8', low_memory=False)
            
            file_size_kb = os.path.getsize(csv_file) / 1024
            rows, cols = df.shape
            columns_list = ", ".join(df.columns.astype(str).tolist())
            
            # Sample data (first 5 rows)
            sample_df = df.head(5)
            sample_md = sample_df.to_markdown(index=False)
            
            md_content = f"""# {name_without_ext} - 데이터 명세서

## 1. 파일 개요
* **파일명:** {filename}
* **파일 크기:** {file_size_kb:.2f} KB
* **데이터 크기:** 총 {rows:,}행, {cols}열

## 2. 컬럼 정보 (Schema)
* **컬럼 목록:** {columns_list}

## 3. 데이터 샘플 (Top 5 rows)
{sample_md}

---
*이 문서는 대용량 CSV 파일의 내용을 AI가 분석할 수 있도록 요약한 메타데이터 문서입니다. 전체 데이터는 로컬 환경의 원본 CSV 파일에 저장되어 있습니다.*
"""
            with open(md_filename, 'w', encoding='utf-8') as f:
                f.write(md_content)
            print(f"Created MD for CSV: {md_filename}")
            
        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    process_ship_data()
