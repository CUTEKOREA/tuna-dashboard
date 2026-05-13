import re

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/app/globals.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace variables in the main :root block
replacements = {
    '--bg-color:\s*[^;]+;': '--bg-color: #121212;',
    '--panel-bg:\s*[^;]+;': '--panel-bg: #181818;',
    '--panel-border:\s*[^;]+;': '--panel-border: transparent;',
    '--text-main:\s*[^;]+;': '--text-main: #ffffff;',
    '--text-muted:\s*[^;]+;': '--text-muted: #b3b3b3;',
    '--table-th-bg:\s*[^;]+;': '--table-th-bg: #121212;',
    '--highlight-bg:\s*[^;]+;': '--highlight-bg: #1f1f1f;',
    '--hover-bg:\s*[^;]+;': '--hover-bg: #272727;',
    '--warning-bg:\s*[^;]+;': '--warning-bg: rgba(255, 164, 43, 0.08);',
    '--pastel-lemon:\s*[^;]+;': '--pastel-lemon: #1ed760;',
    '--pastel-nimbus:\s*[^;]+;': '--pastel-nimbus: #1f1f1f;',
    '--pastel-rose:\s*[^;]+;': '--pastel-rose: #f3727f;',
    '--pastel-ice:\s*[^;]+;': '--pastel-ice: #539df5;',
    '--pastel-peach:\s*[^;]+;': '--pastel-peach: #ffa42b;',
    '--pastel-aqua:\s*[^;]+;': '--pastel-aqua: #1db954;',
    '--pastel-orchid:\s*[^;]+;': '--pastel-orchid: #b3b3b3;',
    '--accent-primary:\s*[^;]+;': '--accent-primary: #1ed760;',
    '--accent-secondary:\s*[^;]+;': '--accent-secondary: #ffffff;',
    '--accent-warning:\s*[^;]+;': '--accent-warning: #ffa42b;',
    '--accent-danger:\s*[^;]+;': '--accent-danger: #f3727f;',
    '--accent-gold:\s*[^;]+;': '--accent-gold: #1ed760;',
    '--chart-grid:\s*[^;]+;': '--chart-grid: #252525;',
    '--chart-axis:\s*[^;]+;': '--chart-axis: #b3b3b3;',
    '--chart-tooltip-bg:\s*[^;]+;': '--chart-tooltip-bg: #181818;',
    '--chart-tooltip-border:\s*[^;]+;': '--chart-tooltip-border: #272727;',
    '--card-bg:\s*[^;]+;': '--card-bg: #181818;',
    '--card-border:\s*[^;]+;': '--card-border: transparent;',
    '--card-radius:\s*[^;]+;': '--card-radius: 8px;',
    '--card-shadow:\s*[^;]+;': '--card-shadow: rgba(0,0,0,0.3) 0px 8px 8px;',
    '--card-hover-shadow:\s*[^;]+;': '--card-hover-shadow: rgba(0,0,0,0.5) 0px 8px 24px;',
    '--card-hover-border:\s*[^;]+;': '--card-hover-border: transparent;',
    '--card-title-color:\s*[^;]+;': '--card-title-color: #ffffff;',
    '--card-subtitle-color:\s*[^;]+;': '--card-subtitle-color: #b3b3b3;',
    '--text-primary:\s*[^;]+;': '--text-primary: #ffffff;',
    '--text-secondary:\s*[^;]+;': '--text-secondary: #b3b3b3;',
    '--text-tertiary:\s*[^;]+;': '--text-tertiary: #b3b3b3;',
    '--text-dim:\s*[^;]+;': '--text-dim: #7c7c7c;',
    '--text-disabled:\s*[^;]+;': '--text-disabled: #4d4d4d;',
    '--color-success:\s*[^;]+;': '--color-success: #1ed760;',
    '--color-warning:\s*[^;]+;': '--color-warning: #ffa42b;',
    '--color-danger:\s*[^;]+;': '--color-danger: #f3727f;',
    '--color-info:\s*[^;]+;': '--color-info: #539df5;',
    '--color-purple:\s*[^;]+;': '--color-purple: #b3b3b3;',
    '--surface-0:\s*[^;]+;': '--surface-0: #121212;',
    '--surface-1:\s*[^;]+;': '--surface-1: #181818;',
    '--surface-2:\s*[^;]+;': '--surface-2: #1f1f1f;',
    '--surface-3:\s*[^;]+;': '--surface-3: #252525;',
}

# Only target the first :root block (dark theme) by splitting and replacing.
# But actually, re.sub without count replaces all. It's fine for the main :root. Light mode uses :root[data-theme='light']. Let's be careful.

parts = css.split(':root[data-theme=\'light\']')
root_part = parts[0]
for k, v in replacements.items():
    root_part = re.sub(k, v, root_part)

css = root_part + ':root[data-theme=\'light\']' + parts[1]

# Also change font families
css = re.sub(r"font-family: 'Inter', 'Plus Jakarta Sans', 'Sora', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;", "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;", css)

# Update hover colors for .ds-card
css = css.replace("background: var(--surface-1);", "background: var(--surface-1);\n  background-color: var(--surface-1);")
css = css.replace(".ds-card:hover {\n  border-color: var(--card-hover-border);\n  box-shadow: var(--card-hover-shadow);\n}", ".ds-card:hover {\n  background-color: var(--surface-2);\n  border-color: var(--card-hover-border);\n  box-shadow: var(--card-hover-shadow);\n}")
css = css.replace(".ds-card-insight:hover {\n  border-color: var(--card-hover-border);\n  box-shadow: var(--card-hover-shadow);\n}", ".ds-card-insight:hover {\n  background-color: var(--surface-3);\n  border-color: var(--card-hover-border);\n  box-shadow: var(--card-hover-shadow);\n}")


with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css)

