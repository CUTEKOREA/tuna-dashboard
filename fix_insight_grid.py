import re

file_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/GarlicDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# For every INSIGHT block, we replace the minHeight:'480px' with minHeight:'480px', gridColumn: '1 / -1'
# It looks like:
# {/* INSIGHT 1 */}
# <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>

pattern = r'({\/\* INSIGHT \d \*\/}\s*<div className=\{styles\.glassCard\} style={{ display:\'flex\', flexDirection:\'column\', minHeight:\'480px\')(\s*}})'
replacement = r"\1, gridColumn: '1 / -1'\2"

new_content = re.sub(pattern, replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("INSIGHT columns updated.")
