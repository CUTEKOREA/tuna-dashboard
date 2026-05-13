import re

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/app/globals.css', 'r', encoding='utf-8') as f:
    css = f.read()

# We only want to replace inside the main `:root { ... }` block which is the first one.
# Find the first :root { ... }
match = re.search(r':root\s*\{([^{}]*)\}', css)
if match:
    root_content = match.group(1)
    
    replacements = {
        r'--bg-color:\s*[^;]+;': '--bg-color: #121212;',
        r'--panel-bg:\s*[^;]+;': '--panel-bg: #181818;',
        r'--panel-border:\s*[^;]+;': '--panel-border: transparent;',
        r'--text-main:\s*[^;]+;': '--text-main: #ffffff;',
        r'--text-muted:\s*[^;]+;': '--text-muted: #b3b3b3;',
        r'--table-th-bg:\s*[^;]+;': '--table-th-bg: #121212;',
        r'--highlight-bg:\s*[^;]+;': '--highlight-bg: #1f1f1f;',
        r'--hover-bg:\s*[^;]+;': '--hover-bg: #272727;',
        r'--warning-bg:\s*[^;]+;': '--warning-bg: rgba(255, 164, 43, 0.08);',
        r'--pastel-lemon:\s*[^;]+;': '--pastel-lemon: #1ed760;',
        r'--pastel-nimbus:\s*[^;]+;': '--pastel-nimbus: #1f1f1f;',
        r'--pastel-rose:\s*[^;]+;': '--pastel-rose: #f3727f;',
        r'--pastel-ice:\s*[^;]+;': '--pastel-ice: #539df5;',
        r'--pastel-peach:\s*[^;]+;': '--pastel-peach: #ffa42b;',
        r'--pastel-aqua:\s*[^;]+;': '--pastel-aqua: #1db954;',
        r'--pastel-orchid:\s*[^;]+;': '--pastel-orchid: #b3b3b3;',
        r'--accent-primary:\s*[^;]+;': '--accent-primary: #1ed760;',
        r'--accent-secondary:\s*[^;]+;': '--accent-secondary: #ffffff;',
        r'--accent-warning:\s*[^;]+;': '--accent-warning: #ffa42b;',
        r'--accent-danger:\s*[^;]+;': '--accent-danger: #f3727f;',
        r'--accent-gold:\s*[^;]+;': '--accent-gold: #1ed760;',
        r'--chart-grid:\s*[^;]+;': '--chart-grid: #252525;',
        r'--chart-axis:\s*[^;]+;': '--chart-axis: #b3b3b3;',
        r'--chart-tooltip-bg:\s*[^;]+;': '--chart-tooltip-bg: #181818;',
        r'--chart-tooltip-border:\s*[^;]+;': '--chart-tooltip-border: #272727;',
        r'--card-bg:\s*[^;]+;': '--card-bg: #181818;',
        r'--card-border:\s*[^;]+;': '--card-border: transparent;',
        r'--card-radius:\s*[^;]+;': '--card-radius: 8px;',
        r'--card-shadow:\s*[^;]+;': '--card-shadow: rgba(0,0,0,0.3) 0px 8px 8px;',
        r'--card-hover-shadow:\s*[^;]+;': '--card-hover-shadow: rgba(0,0,0,0.5) 0px 8px 24px;',
        r'--card-hover-border:\s*[^;]+;': '--card-hover-border: transparent;',
        r'--card-title-color:\s*[^;]+;': '--card-title-color: #ffffff;',
        r'--card-subtitle-color:\s*[^;]+;': '--card-subtitle-color: #b3b3b3;',
        r'--text-primary:\s*[^;]+;': '--text-primary: #ffffff;',
        r'--text-secondary:\s*[^;]+;': '--text-secondary: #b3b3b3;',
        r'--text-tertiary:\s*[^;]+;': '--text-tertiary: #b3b3b3;',
        r'--text-dim:\s*[^;]+;': '--text-dim: #7c7c7c;',
        r'--text-disabled:\s*[^;]+;': '--text-disabled: #4d4d4d;',
        r'--color-success:\s*[^;]+;': '--color-success: #1ed760;',
        r'--color-warning:\s*[^;]+;': '--color-warning: #ffa42b;',
        r'--color-danger:\s*[^;]+;': '--color-danger: #f3727f;',
        r'--color-info:\s*[^;]+;': '--color-info: #539df5;',
        r'--color-purple:\s*[^;]+;': '--color-purple: #b3b3b3;',
        r'--surface-0:\s*[^;]+;': '--surface-0: #121212;',
        r'--surface-1:\s*[^;]+;': '--surface-1: #181818;',
        r'--surface-2:\s*[^;]+;': '--surface-2: #1f1f1f;',
        r'--surface-3:\s*[^;]+;': '--surface-3: #252525;',
    }

    new_root_content = root_content
    for k, v in replacements.items():
        new_root_content = re.sub(k, v, new_root_content)
    
    css = css[:match.start(1)] + new_root_content + css[match.end(1):]

# Modify the body font
css = re.sub(r"font-family: 'Inter', 'Plus Jakarta Sans', 'Sora', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;", "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;", css)

# Modify ds-card hover background color
css = css.replace("background: var(--surface-1);", "background: var(--surface-1);\n  background-color: var(--surface-1);")
css = css.replace(".ds-card:hover {\n  border-color: var(--card-hover-border);\n  box-shadow: var(--card-hover-shadow);\n}", ".ds-card:hover {\n  background-color: var(--surface-2);\n  border-color: var(--card-hover-border);\n  box-shadow: var(--card-hover-shadow);\n}")
css = css.replace(".ds-card-insight:hover {\n  border-color: var(--card-hover-border);\n  box-shadow: var(--card-hover-shadow);\n}", ".ds-card-insight:hover {\n  background-color: var(--surface-3);\n  border-color: var(--card-hover-border);\n  box-shadow: var(--card-hover-shadow);\n}")

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css)

