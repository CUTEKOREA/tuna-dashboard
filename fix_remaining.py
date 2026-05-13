import re
import glob
import os

# 1. Fix CocoaDashboard import
cocoa_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/CocoaDashboard.tsx'
with open(cocoa_path, 'r', encoding='utf-8') as f:
    content = f.read()
if 'import TakeawayBox' not in content:
    content = "import TakeawayBox from './TakeawayBox';\n" + content
    with open(cocoa_path, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Fix GarlicDashboard YAxis
garlic_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/GarlicDashboard.tsx'
with open(garlic_path, 'r', encoding='utf-8') as f:
    content = f.read()
# Replace <YAxis ... tickFormatter={...} {...yAxisProps} /> with <YAxis ... {...yAxisProps} tickFormatter={...} />
content = re.sub(
    r'(<YAxis[^>]*?)(tickFormatter=\{[^}]*\})\s*(\{\.\.\.yAxisProps\})',
    r'\1\3 \2',
    content
)
with open(garlic_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. Fix SafeResponsiveContainer height
files = glob.glob('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/FishStat*.tsx') + \
        glob.glob('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/Mackerel*.tsx')
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('<SafeResponsiveContainer>', '<SafeResponsiveContainer width="100%" height="100%">')
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

# 4. Fix app/ pages fill property on never
pages = ['/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/app/financial-risk/page.tsx', 
         '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/app/management/page.tsx']
for fpath in pages:
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        content = re.sub(r'map\(\(entry,\s*(index|idx)\)\s*=>', r'map((entry: any, \1: number) =>', content)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)

