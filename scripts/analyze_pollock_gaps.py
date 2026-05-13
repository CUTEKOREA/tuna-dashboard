import os
import glob
import re

def check_keyword_context(directory):
    files = glob.glob(os.path.join(directory, '*.md')) + glob.glob(os.path.join(directory, '*.csv'))
    
    # Specific gaps identified previously
    gap_targets = {
        '1. 원물 (Raw Material) - MGO, 선박유, 조업원가': ['mgo', '선박유', '조업원가', '조업 원가'],
        '2. 가공 (Processing) - 다롄/베트남 수율, 가동률': ['다롄', '대련', '베트남 가공', '공장 가동률', '가공 마진'],
        '3. 물류 (Logistics) - 리퍼운임, 냉동창고 재고율': ['리퍼', 'reefer', '운임 지수', '냉동창고 재고', '보관 단가'],
        '4. 판매 (Sales) - B2B 장기계약, 대체재 스프레드': ['b2b', '장기 계약', '장기계약', '대구 가격', '틸라피아', '대체재', '가격 역전'],
        '5. ESG & Future - 수온 변화, MSC 프리미엄': ['sst', '표층 수온', 'msc', '친환경 인증', 'esg 프리미엄']
    }
    
    results = {k: 0 for k in gap_targets}
    matched_lines = {k: [] for k in gap_targets}
    
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                for i, line in enumerate(lines):
                    line_lower = line.lower()
                    for category, words in gap_targets.items():
                        for word in words:
                            if word in line_lower:
                                results[category] += 1
                                if len(matched_lines[category]) < 5:
                                    matched_lines[category].append(f"[{os.path.basename(file_path)}] {line.strip()[:100]}...")
                                break # once matched category, go next
        except Exception:
            pass

    for category in gap_targets:
        print(f"[{category}]")
        print(f" - Found mentions: {results[category]}")
        for line in matched_lines[category]:
            print(f"   > {line}")
        print()

if __name__ == "__main__":
    check_keyword_context('data/명태/')
