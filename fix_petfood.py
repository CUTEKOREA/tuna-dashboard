import os
import glob
import re

ts_files = glob.glob('components/PetFood*.tsx')
css_files = glob.glob('components/PetFood*.module.css')

def process_ts(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # 1. Main Backgrounds: background: 'rgba(0, 0, 0, 0.2)' -> background: '#181818'
    content = re.sub(r"background:\s*'rgba\(0,\s*0,\s*0,\s*0\.2\)'", "background: '#181818'", content)
    
    # 2. Main Borders: border: '1px solid rgba(..., 0.3)' -> border: 'none'
    content = re.sub(r"border:\s*'1px solid rgba\([^)]+\)'", "border: 'none'", content)
    
    # 3. Main Box Shadows
    content = re.sub(r"boxShadow:\s*'0 4px 20px rgba\([^)]+\)'", "boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'", content)
    
    # 4. Header glow
    content = re.sub(r"boxShadow:\s*'0 0 20px rgba\([^)]+\)'", "boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'", content)

    # 5. Background replacements for education and other panels
    content = re.sub(r"background:\s*'rgba\(255,\s*255,\s*255,\s*0\.03\)'", "background: '#252525'", content)
    content = re.sub(r"background:\s*'rgba\(255,\s*255,\s*255,\s*0\.08\)'", "background: '#252525'", content)

    # Hover interactions
    content = re.sub(r"e\.currentTarget\.style\.borderColor = 'rgba\([^)]+\)'", "e.currentTarget.style.background = '#252525'", content)
    content = re.sub(r"e\.currentTarget\.style\.borderColor = 'rgba\([^)]+\)'", "e.currentTarget.style.background = '#181818'", content)

    # Text gradient
    content = re.sub(r"background:\s*'linear-gradient\([^)]+\)',\s*WebkitBackgroundClip:\s*'text',\s*color:\s*'transparent'", "color: '#ffffff'", content)
    content = re.sub(r"background:\s*'linear-gradient\([^)]+\)',\s*WebkitBackgroundClip:\s*'text',\s*WebkitTextFillColor:\s*'transparent'", "color: '#ffffff'", content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

def process_css(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    content = re.sub(r"background:\s*rgba\(0,\s*0,\s*0,\s*0\.2\);", "background: #181818;", content)
    content = re.sub(r"background:\s*rgba\(0,\s*0,\s*0,\s*0\.25\);", "background: #252525;", content)
    content = re.sub(r"border:\s*1px solid rgba\([^)]+\);", "border: none;", content)
    content = re.sub(r"box-shadow:\s*0 10px 40px rgba\([^)]+\),\s*0 0 80px rgba\([^)]+\);", "box-shadow: rgba(0,0,0,0.3) 0px 8px 8px;", content)
    content = re.sub(r"box-shadow:\s*0 8px 24px rgba\([^)]+\);", "box-shadow: rgba(0,0,0,0.3) 0px 8px 8px;", content)
    content = re.sub(r"box-shadow:\s*0 12px 32px rgba\([^)]+\);", "box-shadow: rgba(0,0,0,0.3) 0px 8px 8px;", content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for f in ts_files:
    process_ts(f)

for f in css_files:
    process_css(f)
