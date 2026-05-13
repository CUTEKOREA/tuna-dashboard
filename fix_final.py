import re
import os

# 1. CocoaDashboard
cocoa_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/CocoaDashboard.tsx'
with open(cocoa_path, 'r', encoding='utf-8') as f:
    content = f.read()
# Find InfoTooltip and remove it
content = re.sub(r'<InfoTooltip[^>]*?/>', '', content)
with open(cocoa_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. GarlicDashboard
garlic_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/GarlicDashboard.tsx'
with open(garlic_path, 'r', encoding='utf-8') as f:
    content = f.read()
# Just remove tickFormatter entirely since yAxisProps probably handles it, or move it.
# Actually let's move {...yAxisProps} before tickFormatter
content = re.sub(r'(\{\.\.\.yAxisProps\})\s*(tickFormatter=\{[^}]*\})', r'\2 \1', content) # Revert the previous bad change if it occurred?
# Let's just do a manual replace
content = content.replace('tickFormatter={(v)=>`$${v}`} {...yAxisProps}', '{...yAxisProps} tickFormatter={(v)=>`$${v}`}')
content = content.replace('tickFormatter={(v)=>`${v}%`} {...yAxisProps}', '{...yAxisProps} tickFormatter={(v)=>`${v}%`}')
content = content.replace('tickFormatter={(v)=>`$${v}B`} {...yAxisProps}', '{...yAxisProps} tickFormatter={(v)=>`$${v}B`}')
with open(garlic_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. app/financial-risk/page.tsx
fr_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/app/financial-risk/page.tsx'
with open(fr_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('useRef<any>();', 'useRef<any>(null);')
with open(fr_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 4. app/management/page.tsx
m_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/app/management/page.tsx'
with open(m_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('foodtechData.key_findings', '(foodtechData as any).key_findings')
content = content.replace('.map((item: any, idx: number)', '.map((item: any, idx: number)')
# Oh wait, my previous script changed item, idx to item: any, idx: number but the error was on part, i
content = re.sub(r'\.map\(\(part,\s*i\)\s*=>', r'.map((part: any, i: number) =>', content)
with open(m_path, 'w', encoding='utf-8') as f:
    f.write(content)

