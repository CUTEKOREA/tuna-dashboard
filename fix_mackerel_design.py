import re

# Fix MackerelStrategy.module.css
with open('components/MackerelStrategy.module.css', 'r') as f:
    css = f.read()

css = re.sub(r'background:\s*var\(--card-bg\);', 'background: var(--surface-1);', css)
css = re.sub(r'border:\s*1px solid var\(--card-border\);', 'border: 1px solid var(--panel-border);', css)
css = re.sub(r'border-radius:\s*var\(--card-radius\);', 'border-radius: var(--radius-md);', css)
css = re.sub(r'padding:\s*var\(--card-padding\);', 'padding: var(--space-4);', css)
css = re.sub(r'box-shadow:\s*var\(--card-shadow\);', 'box-shadow: none;', css)
css = re.sub(r'box-shadow:\s*var\(--card-hover-shadow\);', 'box-shadow: none;', css)
css = re.sub(r'border-color:\s*var\(--card-hover-border\);', 'border-color: var(--text-secondary);', css)

# Remove ::before gradient overlay
css = re.sub(r'\.glassCard::before \{[\s\S]*?\}', '', css)

with open('components/MackerelStrategy.module.css', 'w') as f:
    f.write(css)

# Fix MackerelDashboard.tsx inline styles
with open('components/MackerelDashboard.tsx', 'r') as f:
    ts = f.read()

# Fix KPI theme glowing
ts = ts.replace("border: `1px solid ${theme.border}`", "border: `1px solid var(--panel-border)`")
ts = ts.replace("background: 'rgba(15, 23, 42, 0.7)'", "background: 'var(--surface-1)'")
ts = ts.replace("boxShadow: `0 0 16px ${theme.glow}`", "boxShadow: 'none'")
ts = ts.replace("boxShadow: `0 0 30px ${theme.glow}`", "boxShadow: 'none'")
ts = ts.replace("e.currentTarget.style.boxShadow = `0 0 30px ${theme.glow}`;", "e.currentTarget.style.borderColor = theme.text;")
ts = ts.replace("e.currentTarget.style.boxShadow = `0 0 16px ${theme.glow}`;", "e.currentTarget.style.borderColor = 'var(--panel-border)';")

# Fix Education section
ts = ts.replace("background: 'rgba(30, 58, 138, 0.2)'", "background: 'var(--surface-1)'")
ts = ts.replace("background: 'rgba(30, 58, 138, 0.3)'", "background: 'var(--surface-2)'")
ts = ts.replace("border: '1px solid rgba(56, 189, 248, 0.3)'", "border: '1px solid var(--panel-border)'")
ts = ts.replace("background: 'rgba(15, 23, 42, 0.6)'", "background: 'var(--surface-0)'")
ts = ts.replace("border: '1px solid rgba(255,255,255,0.05)'", "border: '1px solid var(--panel-border)'")
ts = ts.replace("background: 'rgba(0,0,0,0.3)'", "background: 'var(--surface-1)'")

# Fix notebooklm section
ts = ts.replace("background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(14, 165, 233, 0.02))'", "background: 'var(--surface-1)'")
ts = ts.replace("border: '1px solid rgba(14, 165, 233, 0.3)'", "border: '1px solid var(--panel-border)'")

with open('components/MackerelDashboard.tsx', 'w') as f:
    f.write(ts)

