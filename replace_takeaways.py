import re
import glob

files = glob.glob('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/*.tsx')

# Regex that tries to capture the parent div that wraps both Situation and Takeaway
# We will look for <h4 ...현황 분석...</h4> and its following <p> tag(s)
# and then <h4 ...실행 전략...</h4> and its <p> tag

pattern = re.compile(
    r'<div[^>]*?background[^>]*?>\s*'
    r'<div[^>]*?>\s*'
    r'<h4[^>]*?>.*?현황 분석.*?</h4>\s*'
    r'<p[^>]*?>([\s\S]*?)</p>\s*'
    r'(?:<p[^>]*?>([\s\S]*?)</p>\s*)?'
    r'</div>\s*'
    r'<div[^>]*?>\s*'
    r'<h4[^>]*?>.*?(?:전략적 시사점|실행 전략|Executive Takeaway).*?</h4>\s*'
    r'<p[^>]*?>([\s\S]*?)</p>\s*'
    r'</div>\s*'
    r'</div>',
    re.DOTALL | re.IGNORECASE
)

# PollockDashboard.tsx has a different one:
pollock_pattern1 = re.compile(
    r'<div style={{ background: \'rgba\(0,0,0,0\.25\)\', padding: \'1\.2rem\', borderRadius: \'6px\', borderLeft: `3px solid \$\{accentColor\}` }}>\s*'
    r'<h4[^>]*?>.*?Background \(현황 분석\).*?</h4>\s*'
    r'<p[^>]*?>(\{background\})</p>\s*'
    r'</div>\s*'
    r'<div style={{ background: \'rgba\(0,0,0,0\.25\)\', padding: \'1\.2rem\', borderRadius: \'6px\', borderLeft: `3px solid #f59e0b` }}>\s*'
    r'<h4[^>]*?>.*?Executive Takeaway \(실행 전략\).*?</h4>\s*'
    r'<p[^>]*?>(\{takeaway\})</p>\s*'
    r'</div>',
    re.DOTALL
)

pollock_pattern2 = re.compile(
    r'<div style={{[^}]*?borderTop:[^}]*?}}>\s*'
    r'\{situation && \(\s*'
    r'<div[^>]*?>\s*'
    r'<h4[^>]*?>.*?현황 분석.*?</h4>\s*'
    r'<p[^>]*?>(\{situation\})</p>\s*'
    r'<p[^>]*?>([\s\S]*?)</p>\s*'
    r'</div>\s*'
    r'\)\}\s*'
    r'\{takeaway && \(\s*'
    r'<div[^>]*?>\s*'
    r'<h4[^>]*?>.*?실행 전략.*?</h4>\s*'
    r'<p[^>]*?>(\{takeaway\})</p>\s*'
    r'</div>\s*'
    r'\)\}\s*'
    r'</div>',
    re.DOTALL
)

import_re = re.compile(r'import\s+TakeawayBox\s+from\s+[\'"](?:\./)?TakeawayBox[\'"];?\n')

def get_source_from_p2(p2):
    if not p2: return ""
    p2 = p2.strip()
    if p2.startswith("* 출처:"): return p2.replace("* 출처:", "").strip()
    if p2.startswith("* 출처/근거:"): return p2.replace("* 출처/근거:", "").strip()
    return p2

for file_path in files:
    if file_path.endswith('TakeawayBox.tsx'): continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Apply standard pattern
    def repl_std(m):
        sit = m.group(1).strip()
        p2 = m.group(2)
        tak = m.group(3).strip()
        source = get_source_from_p2(p2)
        source_prop = f'\n          source="{source}"' if source else ''
        return f'<TakeawayBox\n          situation="{sit}"\n          actionPlan="{tak}"{source_prop}\n        />'
        
    content = pattern.sub(repl_std, content)

    # Apply pollock patterns
    def repl_pol1(m):
        # Because we replace the two inner divs, they were wrapped in a grid div.
        # We should just return the TakeawayBox
        return f'<TakeawayBox situation={m.group(1)} actionPlan={m.group(2)} />'
    
    content = pollock_pattern1.sub(repl_pol1, content)
    
    def repl_pol2(m):
        source = get_source_from_p2(m.group(2))
        source_prop = f' source="{source}"' if source else ''
        return f'<TakeawayBox situation={m.group(1)} actionPlan={m.group(3)}{source_prop} />'
        
    content = pollock_pattern2.sub(repl_pol2, content)

    if content != original:
        if not import_re.search(content):
            # Insert import at top
            last_import = content.rfind('import ')
            if last_import != -1:
                end_of_line = content.find('\n', last_import)
                content = content[:end_of_line+1] + "import TakeawayBox from './TakeawayBox';\n" + content[end_of_line+1:]
            else:
                content = "import TakeawayBox from './TakeawayBox';\n" + content
                
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Refactored: {file_path}")

