import os
import re
import glob

# Pattern to match gridTemplateColumns that use repeat(auto-fit, minmax(WIDTH, 1fr))
# where WIDTH is something like 300px, 400px, 560px, min(100%, 380px), etc.
# We want to replace these with repeat(2, 1fr) IF they represent main widgets.
# Typical widget containers have gap: '1.5rem' or '2rem' and often marginBottom: '2rem' or '3rem'
# A safer regex: find `gridTemplateColumns:\s*'repeat\((auto-fit|auto-fill|3),\s*minmax\([^,]+,\s*1fr\)\)'` 
# Actually, the user asked for 1열에 2개씩 (2 per row) as default.
# Let's replace:
# 1. 'repeat(3, 1fr)'
# 2. 'repeat(auto-fit, minmax(300px, 1fr))'
# 3. 'repeat(auto-fit, minmax(340px, 1fr))'
# 4. 'repeat(auto-fit, minmax(360px, 1fr))'
# 5. 'repeat(auto-fit, minmax(380px, 1fr))'
# 6. 'repeat(auto-fit, minmax(400px, 1fr))'
# 7. 'repeat(auto-fit, minmax(450px, 1fr))'
# 8. 'repeat(auto-fit, minmax(480px, 1fr))'
# 9. 'repeat(auto-fit, minmax(500px, 1fr))'
# 10. 'repeat(auto-fit, minmax(540px, 1fr))'
# 11. 'repeat(auto-fit, minmax(560px, 1fr))'
# 12. 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' ... up to 560px

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to match strings like 'repeat(auto-fit, minmax(300px, 1fr))' or 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))'
    # but ONLY if the px value is >= 280 to avoid breaking small icon grids
    
    def replacer(match):
        full_match = match.group(0)
        # Check if there is a number in the match (px value)
        nums = re.findall(r'\d+px', full_match)
        if nums:
            val = int(nums[0].replace('px', ''))
            if val >= 280:
                return "gridTemplateColumns: 'repeat(2, 1fr)'"
        # If it's repeat(3, 1fr)
        if 'repeat(3, 1fr)' in full_match:
            return "gridTemplateColumns: 'repeat(2, 1fr)'"
        
        return full_match

    # Matches gridTemplateColumns: '...'
    # where ... is repeat(auto-fit/fill, minmax(...)) or repeat(3, 1fr)
    new_content = re.sub(r"gridTemplateColumns:\s*'repeat\((?:auto-fit|auto-fill|3)(?:,\s*minmax\([^,]+,\s*1fr\))?\)'", replacer, content)
    
    # Also catch double quotes just in case
    new_content = re.sub(r'gridTemplateColumns:\s*"repeat\((?:auto-fit|auto-fill|3)(?:,\s*minmax\([^,]+,\s*1fr\))?\)"', replacer, new_content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))

