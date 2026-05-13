import os
import glob

def analyze_directory():
    directory = 'data/명태/'
    files = glob.glob(os.path.join(directory, '*.md')) + glob.glob(os.path.join(directory, '*.csv'))
    
    keywords = {
        '1. 원물 (Raw Material)': ['npfmc', '쿼터', '어획량', 'mgo', '선박유', '유가', '원가', '베링', '오호츠크'],
        '2. 가공 (Processing)': ['가공', '수리미', 'surimi', '필레', '수율', '가동률', '다롄', '베트남'],
        '3. 물류 (Logistics)': ['물류', '운임', '리퍼', 'reefer', '냉동창고', '재고'],
        '4. 판매 (Sales)': ['b2b', '프랜차이즈', '단가', '대체재', '틸라피아', '대구', '소비'],
        '5. ESG & Future': ['esg', '기후', '수온', 'sst', 'msc', '인증', '프리미엄']
    }
    
    results = {k: 0 for k in keywords}
    matched_files = {k: [] for k in keywords}
    
    total_files = len(files)
    
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().lower()
                for category, words in keywords.items():
                    if any(word in content for word in words):
                        results[category] += 1
                        matched_files[category].append(os.path.basename(file_path))
        except Exception as e:
            continue
            
    print(f"Total files scanned: {total_files}\n")
    for category in keywords:
        coverage = (results[category] / total_files) * 100
        print(f"[{category}]")
        print(f" - Matched Files: {results[category]} ({coverage:.1f}%)")
        print(f" - Sample Files: {matched_files[category][:3]}")
        print()

if __name__ == "__main__":
    analyze_directory()
