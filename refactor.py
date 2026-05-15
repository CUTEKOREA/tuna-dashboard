import re

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/PetFoodDashboard.tsx', 'r') as f:
    text = f.read()

# Define theme colors to replace the current header colors
theme_replacements = {
    'linear-gradient(180deg,#10b981,#10b98199)': 'linear-gradient(180deg, #f472b6, #f472b699)', # Part I
    'linear-gradient(180deg,#3b82f6,#3b82f699)': 'linear-gradient(180deg, #f59e0b, #f59e0b99)', # Part II
    'linear-gradient(180deg,#f59e0b,#f59e0b99)': 'linear-gradient(180deg, #10b981, #10b98199)', # Part III
    'linear-gradient(180deg,#8b5cf6,#8b5cf699)': 'linear-gradient(180deg, #3b82f6, #3b82f699)', # Part IV
    'linear-gradient(180deg,#14b8a6,#14b8a699)': 'linear-gradient(180deg, #8b5cf6, #8b5cf699)', # Part V
}

for old, new in theme_replacements.items():
    text = text.replace(old, new)

# Define xFmt
xfmt_code = """
  const xFmt = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const cleaned = tick.replace(/\s*\(.*?\)\s*/g, '').trim();
    return cleaned.length > 6 ? cleaned.substring(0, 6) + '..' : cleaned;
  };
"""
# Insert xFmt before return (
text = text.replace('return (\n    <div className={styles.container}>', xfmt_code + '\n  return (\n    <div className={styles.container}>')

# Replace <XAxis ... /> with tickFormatter
def replace_xaxis(m):
    inner = m.group(1)
    if 'tickFormatter' not in inner:
        if inner.endswith('/'):
            return f'<XAxis {inner[:-1]} tickFormatter={{xFmt}} />'
        else:
            return f'<XAxis {inner} tickFormatter={{xFmt}}>'
    else:
        # Replace existing tickFormatter
        inner = re.sub(r'tickFormatter=\{[^}]+\}', 'tickFormatter={xFmt}', inner)
        if inner.endswith('/'):
            return f'<XAxis {inner[:-1]} />'
        else:
            return f'<XAxis {inner}>'

text = re.sub(r'<XAxis\s+([^>]+)>', replace_xaxis, text)

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/PetFoodDashboard.tsx', 'w') as f:
    f.write(text)

print("Applied theme colors, xFmt to all XAxis.")
