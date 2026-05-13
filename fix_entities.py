import re

with open('components/CocoaDashboard.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # Only replace if it contains Korean/text elements like <p>, <h4>, <h3>, <span>, <div>, or just text
    # Let's target the exact text strings found.
    # To be safe, any "'" character that is between > and <
    # A robust way is to replace ' with &apos; in text nodes. 
    # We will split the line by '>' and '<'.
    # e.g., `<p>Hello 'world'</p>`
    # parts: ['', 'p', 'Hello \'world\'', '/p', '']
    
    parts = re.split(r'(<[^>]+>)', line)
    for j in range(len(parts)):
        # odd indices are tags: <...>, even indices are text nodes
        if j % 2 == 0 and "'" in parts[j]:
            parts[j] = parts[j].replace("'", "&apos;")
            
    new_line = "".join(parts)
    if line != new_line:
        lines[i] = new_line

with open('components/CocoaDashboard.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
