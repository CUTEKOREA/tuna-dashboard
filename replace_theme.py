import os

file_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/GarlicDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'var(--color-success)': '#eab308',
    '#38bdf8': '#d97706',
    '#8b5cf6': '#84cc16',
    '#ec4899': '#facc15',
    'var(--color-info)': '#ca8a04',
    'var(--color-warning)': '#65a30d'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Theme replaced.")
