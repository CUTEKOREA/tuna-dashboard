import os
import re

files_to_process = [
    'components/PetFoodDashboard.tsx',
    'components/PetFoodDashboard.module.css',
    'components/UsedCarExport.tsx',
    'components/CashewIntelligence.tsx',
    'components/CashewIntelligence.module.css',
    'components/CassavaDashboard.tsx',
    'components/GarlicDashboard.tsx',
    'components/CarrotDashboard.tsx'
]

def process_file(filepath):
    if not os.path.exists(filepath):
        return

    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Replace legacy rgba(15, 23, 42, X) with rgba(0, 0, 0, 0.2)
    content = re.sub(r'rgba\(15,\s*23,\s*42,\s*[0-9.]+\)', 'rgba(0, 0, 0, 0.2)', content)

    # 2. Fix gradients in headers and inline styles (e.g. background: 'linear-gradient(...)')
    # Be careful not to replace tiny decorative bar gradients
    # we replace anything that looks like a header/UI gradient.
    # In TSX files:
    if filepath.endswith('.tsx'):
        # Usually it's in a style object, like background: 'linear-gradient(135deg, #10b981, #059669)'
        # Let's target gradients that have "transparent" or are clearly background glows.
        pass

    # In CSS files:
    if filepath.endswith('.css'):
        # Remove background: linear-gradient(135deg, #fce7f3, #f472b6); from titles
        content = re.sub(r"background:\s*linear-gradient\([^)]+\);", "", content)
        # Remove webkit gradient text
        content = re.sub(r"-webkit-background-clip: text;", "", content)
        content = re.sub(r"-webkit-text-fill-color: transparent;", "", content)
        content = re.sub(r"background-clip: text;", "", content)
        
        # Remove box-shadows that cause glowing
        content = re.sub(r"box-shadow:\s*[^;]*rgba\([^)]*\)[^;]*;", "", content)
        
        # Make sure .kpiCard has border: 1px solid rgba(255, 255, 255, 0.05);
        content = re.sub(r"border:\s*1px solid rgba\([0-9]+,\s*[0-9]+,\s*[0-9]+,\s*0\.0[0-9]\)", "border: 1px solid rgba(255, 255, 255, 0.05)", content)

    with open(filepath, 'w') as f:
        f.write(content)

for f in files_to_process:
    process_file(f)
print("Styles fixed across target components.")
