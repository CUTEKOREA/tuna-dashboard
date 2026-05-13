import json
import subprocess

result = subprocess.run(['npx', 'eslint', '-f', 'json', 'components/CocoaDashboard.tsx'], capture_output=True, text=True)
try:
    data = json.loads(result.stdout)
except:
    print(result.stdout)
    exit(1)

with open('components/CocoaDashboard.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for msg in data[0]['messages']:
    if msg['ruleId'] == 'react/no-unescaped-entities':
        line_idx = msg['line'] - 1
        col_idx = msg['column'] - 1
        
        # Replace the single quote at the exact index with &apos;
        line_chars = list(lines[line_idx])
        if line_chars[col_idx] == "'":
            line_chars[col_idx] = "&apos;"
        elif line_chars[col_idx] == '"':
            line_chars[col_idx] = "&quot;"
        
        lines[line_idx] = "".join(line_chars)

with open('components/CocoaDashboard.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
