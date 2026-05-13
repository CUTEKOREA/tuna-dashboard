import os
import shutil
import hashlib
from pathlib import Path

# 대상 디렉토리 (구글 드라이브 data 폴더)
BASE_DIR = "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/data"
STANDARD_DIRS = ['scripts', 'raw_data', 'processed_data', 'intelligence_reports']

# 품목 매핑 (키워드 -> 품목명)
PRODUCT_MAPPING = {
    'tuna': ['tuna', '참치'],
    'salmon': ['salmon', '연어'],
    'pollock': ['pollock', '명태'],
    'shrimp': ['shrimp', '새우'],
    'squid': ['squid', '오징어'],
    'mackerel': ['mackerel', '고등어'],
    'garlic': ['garlic', '마늘'],
    'cassava': ['cassava', '카사바', 'tapioca', '타피오카'],
    'cashew': ['cashew', '캐슈'],
    'cocoa': ['cocoa', '카카오'],
    'mangosteen': ['mangosteen', '망고스틴'],
    'petfood': ['petfood', '펫푸드'],
    'almonds': ['almonds', '아몬드'],
    'bananas': ['bananas', '바나나'],
    'beef': ['beef', '소고기', '우육'],
    'pork': ['pork', '돼지고기', '돈육'],
    'chicken': ['chicken', '닭고기', '계육'],
    'mango': ['mango', '망고']
}

def get_file_category(file_name):
    ext = file_name.split('.')[-1].lower() if '.' in file_name else ''
    if ext in ['py', 'sh', 'js', 'bat', 'txt']:
        # Note: requirements.txt is a script dependency, other txts might be raw_data or reports.
        return 'scripts' if ext != 'txt' else 'raw_data'
    elif ext in ['pdf', 'gdoc', 'gslides', 'docx', 'pptx', 'md', 'gform']:
        return 'intelligence_reports'
    elif ext in ['csv', 'xlsx', 'xls', 'zip']:
        return 'raw_data'
    elif ext in ['json']:
        return 'processed_data'
    else:
        return 'raw_data'

def get_product_from_name(name):
    import unicodedata
    name_lower = unicodedata.normalize('NFC', name).lower()
    for product, keywords in PRODUCT_MAPPING.items():
        if any(kw in name_lower for kw in keywords):
            return product
    return None

def compute_md5(file_path):
    hash_md5 = hashlib.md5()
    try:
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception:
        return None

def organize_directory(dry_run=True):
    print(f"Starting organization for: {BASE_DIR} (Dry Run: {dry_run})")
    base_path = Path(BASE_DIR)
    
    # 1. 분산된 파일들을 품목 폴더로 이동 (Consolidate Assets)
    for item in base_path.iterdir():
        if item.is_file():
            if item.name == '.DS_Store':
                continue
            
            product = get_product_from_name(item.name)
            if product:
                dest_dir = base_path / product
                if not dest_dir.exists() and not dry_run:
                    dest_dir.mkdir(parents=True)
                
                category = get_file_category(item.name)
                final_dest = dest_dir / category / item.name
                print(f"[Move to Product] {item.name} -> {product}/{category}/")
                if not dry_run:
                    (dest_dir / category).mkdir(parents=True, exist_ok=True)
                    shutil.move(str(item), str(final_dest))

    # 2. 각 품목 폴더 내의 구조 표준화 (Standardize Directory Architecture)
    for product_dir in base_path.iterdir():
        if product_dir.is_dir() and not product_dir.name.startswith('.') and product_dir.name not in ['__pycache__']:
            # Create standard dirs
            if not dry_run:
                for s_dir in STANDARD_DIRS:
                    (product_dir / s_dir).mkdir(parents=True, exist_ok=True)

            # Move files in product root to standard dirs
            for item in product_dir.iterdir():
                if item.is_file() and item.name != '.DS_Store':
                    category = get_file_category(item.name)
                    final_dest = product_dir / category / item.name
                    print(f"[Standardize] {product_dir.name}/{item.name} -> {category}/")
                    if not dry_run:
                        (product_dir / category).mkdir(parents=True, exist_ok=True)
                        shutil.move(str(item), str(final_dest))
                elif item.is_dir() and item.name not in STANDARD_DIRS and not item.name.startswith('.'):
                    # For non-standard directories inside product folder, we might want to move their contents or leave them.
                    # As a safe measure, let's look for files inside and move them.
                    for sub_item in item.rglob('*'):
                        if sub_item.is_file() and sub_item.name != '.DS_Store':
                            category = get_file_category(sub_item.name)
                            final_dest = product_dir / category / sub_item.name
                            print(f"[Consolidate Subdir] {sub_item.relative_to(base_path)} -> {product_dir.name}/{category}/")
                            if not dry_run:
                                (product_dir / category).mkdir(parents=True, exist_ok=True)
                                # Avoid overwriting
                                if final_dest.exists():
                                    final_dest = product_dir / category / f"dup_{sub_item.name}"
                                shutil.move(str(sub_item), str(final_dest))

    # 3. 빈 폴더 삭제 (Prune empty subfolders)
    if not dry_run:
        for root, dirs, files in os.walk(BASE_DIR, topdown=False):
            for d in dirs:
                dir_path = os.path.join(root, d)
                try:
                    if not os.listdir(dir_path):
                        os.rmdir(dir_path)
                        print(f"[Prune] Removed empty directory: {dir_path}")
                except Exception:
                    pass

    # 4. MD5 기반 중복 제거 (MD5 hash-based deduplication)
    # Only within each product folder to be safe
    for product_dir in base_path.iterdir():
        if product_dir.is_dir() and not product_dir.name.startswith('.'):
            seen_hashes = {}
            for file_path in product_dir.rglob('*'):
                if file_path.is_file() and file_path.name != '.DS_Store':
                    file_hash = compute_md5(file_path)
                    if file_hash:
                        if file_hash in seen_hashes:
                            print(f"[Deduplicate] Removing duplicate: {file_path.relative_to(base_path)} (Original: {seen_hashes[file_hash].relative_to(base_path)})")
                            if not dry_run:
                                os.remove(file_path)
                        else:
                            seen_hashes[file_hash] = file_path

if __name__ == '__main__':
    # Run organization
    organize_directory(dry_run=False)
