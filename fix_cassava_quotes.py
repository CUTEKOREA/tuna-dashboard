import re

file_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/CassavaDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace string literal with variable
content = content.replace("'CASSAVA_THEME.tertiary'", "CASSAVA_THEME.tertiary")
content = content.replace('"CASSAVA_THEME.tertiary"', "{CASSAVA_THEME.tertiary}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Quotes fixed.")
