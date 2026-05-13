import os
import re

files_to_process = [
    'components/CashewIntelligence.tsx',
    'components/CassavaDashboard.tsx',
    'components/GarlicDashboard.tsx',
    'components/CarrotDashboard.tsx',
    'components/UsedCarExport.tsx'
]

def process_file(filepath):
    if not os.path.exists(filepath):
        return

    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Replace box shadows with heavy glow
    content = re.sub(r"boxShadow:\s*`0 0 16px \$\{t\.glow\}`", "boxShadow: 'none'", content)
    content = re.sub(r"boxShadow:\s*`0 0 30px \$\{t\.glow\}`", "boxShadow: 'none'", content)
    
    # 2. Replace background gradients on title icons with flat flat background
    content = re.sub(r"background:\s*'linear-gradient\([^)]+\)'(.*?borderRadius:\s*'8px')", r"background: 'rgba(255, 255, 255, 0.05)'\1", content)
    
    # 3. Webkit background text gradients (make text white)
    content = re.sub(r"background:\s*'linear-gradient\([^)]+\)',\s*WebkitBackgroundClip:\s*'text',\s*WebkitTextFillColor:\s*'transparent'", "color: '#f8fafc'", content)

    # 4. Remove arbitrary glows that use box-shadow
    content = re.sub(r"boxShadow:\s*'0 0 20px rgba\([^)]+\)'", "boxShadow: 'none'", content)
    content = re.sub(r"boxShadow:\s*'0 8px 32px rgba\([^)]+\)'", "boxShadow: 'none'", content)
    
    # 5. Fix t.border hover styles to be standard glassmorphism
    # In Cassava/Garlic/Carrot, they use `border: 1px solid ${t.border}`. We'll change it to `border: '1px solid rgba(255, 255, 255, 0.05)'`
    content = re.sub(r"border:\s*`1px solid \$\{t\.border\}`", "border: '1px solid rgba(255, 255, 255, 0.05)'", content)

    with open(filepath, 'w') as f:
        f.write(content)

for f in files_to_process:
    process_file(f)
print("Styles fixed across TSX components.")
