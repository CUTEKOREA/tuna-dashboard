import re

with open('components/CocoaDashboard.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(len(lines)):
    line = lines[i]
    if "eslint-disable" in line: continue
    
    # Simple regex: find text between > and <
    def replacer(match):
        # The content inside > ... <
        content = match.group(1)
        # We only want to replace ' with &apos; if it's text.
        # It's usually safe to replace ' with &apos; inside >...< 
        return ">" + content.replace("'", "&apos;") + "<"

    new_line = re.sub(r'>([^<]+)<', replacer, line)
    
    if line != new_line:
        lines[i] = new_line

with open('components/CocoaDashboard.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
