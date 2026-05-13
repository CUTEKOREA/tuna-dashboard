import re
import glob

files = glob.glob('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/*.tsx')

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Fix entry, index => entry: any, index: number
    content = re.sub(r'map\(\(entry,\s*(idx|index)\)\s*=>', r'map((entry: any, \1: number) =>', content)
    
    # Fix _, i => _: any, i: number
    content = re.sub(r'map\(\(_,\s*i\)\s*=>', r'map((_: any, i: number) =>', content)

    # Fix formatter={(value: number, name: string) => {
    # To formatter={(value: any, name: any) => {
    content = re.sub(r'formatter=\{\(value: number, name: string\) =>', r'formatter={(value: any, name: any) =>', content)

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed types: {file_path}")

