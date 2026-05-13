import os
import re
import glob

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace legacy rgba(15, 23, 42, X) with rgba(0, 0, 0, 0.2)
    content = re.sub(r'rgba\(15,\s*23,\s*42,\s*[0-9.]+\)', 'rgba(0, 0, 0, 0.2)', content)

    # Replace inline background linear-gradients
    # e.g. background: 'linear-gradient(135deg, #10b981, #059669)'
    # with background: 'rgba(255, 255, 255, 0.05)' for header icons
    content = re.sub(
        r"background:\s*'linear-gradient\([^)]+\)'",
        "background: 'rgba(255, 255, 255, 0.05)'",
        content
    )

    # In CSS files, replace background: linear-gradient with background: rgba(255,255,255,0.05) if it's a takeaway or card
    if filepath.endswith('.css'):
        content = re.sub(r"background:\s*linear-gradient\([^)]+\);", "", content)

        # Remove webkit gradient text
        content = re.sub(r"-webkit-background-clip: text;", "", content)
        content = re.sub(r"-webkit-text-fill-color: transparent;", "", content)
        content = re.sub(r"background-clip: text;", "", content)

    # Remove pink/blue glowing box-shadows on hover (border-color to rgba(255,255,255,0.1))
    content = re.sub(
        r"boxShadow:\s*'0 0 20px rgba\([^)]+\)'",
        "boxShadow: 'none'",
        content
    )
    content = re.sub(
        r"box-shadow:\s*0 0 20px rgba\([^)]+\)[^;]*;",
        "",
        content
    )

    with open(filepath, 'w') as f:
        f.write(content)

# Find all TSX and CSS files
files = glob.glob('components/**/*.tsx', recursive=True) + glob.glob('components/**/*.module.css', recursive=True)
for f in files:
    process_file(f)
print("Styles fixed across all components.")
