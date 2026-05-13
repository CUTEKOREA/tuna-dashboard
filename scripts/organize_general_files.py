import os
import shutil
import hashlib
import unicodedata
from pathlib import Path

BASE_DIR = "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/data"
GENERAL_DIR = os.path.join(BASE_DIR, "공통(General)")

TOPIC_MAPPING = {
    '출장_여정': ['여정', 'ticket', 'receipt', '항공권', '여행', '호텔', '여권', 'flight', 'folio', '후아힌'],
    '선박_물류': ['하역', '선박', 'sein', '하역결과', '하역량'],
    '전략_기획': ['계획', '전략', '마스터플랜', '신사업', '컨설팅', 'm&a', '가치사슬', '밸류체인', '아이디어', '클러스터', '경영'],
    '재무_회계': ['대출', '재무', '예상', '회계', 'abl'],
    '수산물_일반': ['수산물', '어업', '광어', '꽁치', '블루푸드테크'],
    '교육_가이드': ['학습', '실습', '가이드', '활용법', '프롬프트', '공부', '스파르타클럽'],
    '임시문서': ['제목 없는', '이름 없는', 'untitled'],
    '음원_영상': ['mp3', 'wav', 'mp4'],
    '기타_참고자료': [] # Fallback
}

def compute_md5(file_path):
    hash_md5 = hashlib.md5()
    try:
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception:
        return None

def get_topic_from_name(name):
    name_lower = unicodedata.normalize('NFC', name).lower()
    for topic, keywords in TOPIC_MAPPING.items():
        if any(kw in name_lower for kw in keywords):
            return topic
    return '기타_참고자료'

def organize_general_files():
    base_path = Path(BASE_DIR)
    gen_path = Path(GENERAL_DIR)
    
    if not gen_path.exists():
        gen_path.mkdir(parents=True)

    # 1. Deduplicate files in root
    seen_hashes = {}
    files_to_process = []
    
    for item in base_path.iterdir():
        if item.is_file() and item.name != '.DS_Store':
            files_to_process.append(item)
            
    print(f"Found {len(files_to_process)} files in root.")
    
    for file_path in files_to_process:
        try:
            file_size = file_path.stat().st_size
            if file_size in seen_hashes:
                print(f"[Deduplicate] Removing duplicate: {file_path.name} (Original: {seen_hashes[file_size].name})")
                os.remove(file_path)
            else:
                seen_hashes[file_size] = file_path
        except Exception:
            pass

    # 2. Reclassify remaining root files into topics
    for item in base_path.iterdir():
        if item.is_file() and item.name != '.DS_Store':
            topic = get_topic_from_name(item.name)
            topic_dir = gen_path / topic
            topic_dir.mkdir(parents=True, exist_ok=True)
            
            dest_path = topic_dir / item.name
            
            # Handle naming collision if moving
            counter = 1
            original_dest = dest_path
            while dest_path.exists():
                stem = original_dest.stem
                suffix = original_dest.suffix
                dest_path = topic_dir / f"{stem}_{counter}{suffix}"
                counter += 1
                
            print(f"[Reclassify] {item.name} -> 공통(General)/{topic}/")
            shutil.move(str(item), str(dest_path))

    # 3. Move unrecognized folders into 공통(General)
    # Exclude standard product folders + General itself
    KNOWN_PRODUCT_DIRS = [
        'tuna', 'salmon', 'pollock', 'shrimp', 'squid', 'mackerel', 'garlic', 'cassava',
        'cashew', 'cocoa', 'mangosteen', 'petfood', 'almonds', 'bananas', 'beef', 'pork',
        'chicken', 'mango', 'canola_oil', 'carrot', 'cherries', 'coconut', 'coffee',
        'corn', 'curry', 'dates', 'eggs', 'grapefruit', 'kiwis', 'korean_melon', 'krei',
        'mandarin', 'natural_rubber', 'olive', 'onions', 'palm_oil', 'pepper', 'perilla',
        'persimmon', 'pineapple', 'plum', 'potato', 'raspberry', 'rice', 'sesame', 'soybean',
        'sugar', 'sunflower_oil', 'sweet_potato', 'tapioca', 'taro', 'vanilla', 'walnuts',
        'wheat', 'yams'
    ]
    
    for item in base_path.iterdir():
        if item.is_dir() and item.name not in KNOWN_PRODUCT_DIRS and item.name != '공통(General)' and not item.name.startswith('.'):
            # Move entire folder into General
            dest_dir = gen_path / item.name
            print(f"[Move Directory] {item.name} -> 공통(General)/")
            shutil.move(str(item), str(dest_dir))

if __name__ == '__main__':
    organize_general_files()
