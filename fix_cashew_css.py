import glob
import re

css_files = glob.glob('components/Cashew*.module.css')

def process_css(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    content = re.sub(r"background:\s*rgba\(0,\s*0,\s*0,\s*0\.2\);", "background: #181818;", content)
    content = re.sub(r"background:\s*rgba\(0,\s*0,\s*0,\s*0\.25\);", "background: #252525;", content)
    content = re.sub(r"background:\s*rgba\(0,\s*0,\s*0,\s*0\.3\);", "background: #252525;", content)
    content = re.sub(r"border:\s*1px solid rgba\([^)]+\);", "border: none;", content)
    content = re.sub(r"box-shadow:\s*0 10px 40px rgba\([^)]+\),\s*0 0 80px rgba\([^)]+\);", "box-shadow: rgba(0,0,0,0.3) 0px 8px 8px;", content)
    content = re.sub(r"box-shadow:\s*0 8px 24px rgba\([^)]+\);", "box-shadow: rgba(0,0,0,0.3) 0px 8px 8px;", content)
    content = re.sub(r"box-shadow:\s*0 12px 32px rgba\([^)]+\);", "box-shadow: rgba(0,0,0,0.3) 0px 8px 8px;", content)
    content = re.sub(r"box-shadow:\s*0 4px 12px rgba\([^)]+\);", "box-shadow: rgba(0,0,0,0.3) 0px 8px 8px;", content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for f in css_files:
    process_css(f)
