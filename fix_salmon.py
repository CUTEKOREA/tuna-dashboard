import os
import glob
import re

files_to_process = glob.glob('components/Salmon*.tsx')

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Fix Webkit text gradients with 'color: transparent'
    content = re.sub(
        r"background:\s*'linear-gradient\([^)]+\)',\s*WebkitBackgroundClip:\s*'text',\s*color:\s*'transparent'",
        "color: '#ffffff'",
        content
    )

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for f in files_to_process:
    process_file(f)
