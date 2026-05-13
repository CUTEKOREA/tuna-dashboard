import re

with open('app/globals.css', 'r') as f:
    css = f.read()

# 1. Update Core Palette and Semantic Backgrounds
css = re.sub(
    r'/\* Core Palette \(Dark Mode Default\) — Deep Ocean Luxe \*/.*?--glass-blur: blur\(12px\);',
    '''/* Core Palette (Dark Mode Default) — Institutional Precision */
  --bg-color: #020617; 
  --panel-bg: #0F172A;
  --panel-border: #1E293B;
  --text-main: #F8FAFC;
  --text-muted: #94A3B8;
  
  /* Semantic Backgrounds (Opaque/Solid) */
  --table-th-bg: #0F172A;
  --highlight-bg: #1E293B; 
  --hover-bg: #1E293B;
  --warning-bg: rgba(245, 158, 11, 0.10);

  /* Precise Chart Palette — Flat */
  --pastel-lemon: #FBBF24;
  --pastel-nimbus: #334155;
  --pastel-rose: #F472B6;
  --pastel-ice: #38BDF8;
  --pastel-peach: #FB923C;
  --pastel-aqua: #34D399;
  --pastel-orchid: #A78BFA;

  /* Accents — Strictly Semantic */
  --accent-primary: #3B82F6;
  --accent-secondary: #10B981;
  --accent-warning: #F59E0B;
  --accent-danger: #EF4444;
  --accent-gold: #F59E0B;
  
  /* Chart UI Colors */
  --chart-grid: #1E293B;
  --chart-axis: #64748B;
  --chart-tooltip-bg: #0F172A;
  --chart-tooltip-border: #334155;

  --glass-blur: none;''',
    css,
    flags=re.DOTALL
)

# 2. Update Card Design Tokens
css = re.sub(
    r'/\* Card Design Tokens \*/.*?--chart-bar-radius: 6px;',
    '''/* Card Design Tokens - Flat & Precise */
  --card-bg: #0F172A;
  --card-border: #1E293B;
  --card-radius: 8px;
  --card-padding: 1.5rem;
  --card-shadow: none;
  --card-hover-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --card-hover-border: #334155;
  --card-gradient-overlay: none;

  /* Typography Tokens */
  --card-title-size: 1rem;
  --card-title-color: #F8FAFC;
  --card-subtitle-size: 0.875rem;
  --card-subtitle-color: #94A3B8;

  /* Chart Unified Tokens */
  --chart-height: 350px;
  --chart-bar-radius: 2px;''',
    css,
    flags=re.DOTALL
)

# 3. Update Semantic Colors
css = re.sub(
    r'/\* ===== SEMANTIC COLORS \(통일\) — Jewel Palette \*/.*?--color-purple:   #A78BFA;',
    '''/* ===== SEMANTIC COLORS — Data Driven ===== */
  --color-success:  #10B981;
  --color-warning:  #F59E0B;
  --color-danger:   #EF4444;
  --color-info:     #3B82F6;
  --color-purple:   #A78BFA;''',
    css,
    flags=re.DOTALL
)

# 4. Update Border Radius & Surfaces
css = re.sub(
    r'/\* ===== BORDER RADIUS ===== \*/.*?--surface-3:  rgba\(30, 41, 59, 0\.85\);        /\* 최상위 \(드롭다운, 툴팁\) \*/',
    '''/* ===== BORDER RADIUS (Crisp & Sharp) ===== */
  --radius-sm:  2px;
  --radius-md:  4px;
  --radius-lg:  8px;

  /* ===== SURFACE ELEVATION (Solid Depth) ===== */
  --surface-0:  #020617;            /* 최하단 바닥 */
  --surface-1:  #0F172A;            /* 카드/패널 */
  --surface-2:  #1E293B;            /* 떠있는 요소 (모달, 인사이트 카드) */
  --surface-3:  #334155;            /* 최상위 (드롭다운, 툴팁) */''',
    css,
    flags=re.DOTALL
)

# 5. Remove Backdrop Blur from Cards
css = css.replace('backdrop-filter: var(--glass-blur);', '/* backdrop-filter removed */')
css = css.replace('-webkit-backdrop-filter: var(--glass-blur);', '/* backdrop-filter removed */')

# 6. Update Body Background
css = re.sub(
    r'body \{\n  background: radial-gradient.*?background-size: 200% 200%;\n  animation: ocean-abyss 50s ease-in-out infinite;\n  position: relative;',
    '''body {
  background: var(--bg-color);''',
    css,
    flags=re.DOTALL
)

# 7. Remove bioluminescent chart styles
css = re.sub(
    r'/\* -------------------------------------\n \* Bioluminescent Chart Styles \n \* ------------------------------------- \*/\n:root \.recharts-line-curve, \n:root \.recharts-area-area,\n:root \.recharts-pie-sector path \{\n  filter: drop-shadow\(0 0 6px rgba\(56, 189, 248, 0\.35\)\);\n\}',
    '''/* -------------------------------------
 * Chart Styles (Flat)
 * ------------------------------------- */
:root .recharts-line-curve, 
:root .recharts-area-area,
:root .recharts-pie-sector path {
  filter: none;
}''',
    css
)

css = re.sub(
    r'background: rgba\(8, 16, 32, 0\.92\) !important;\n  backdrop-filter: blur\(16px\) !important;\n  -webkit-backdrop-filter: blur\(16px\) !important;',
    '''background: #1E293B !important;
  /* backdrop-filter removed */''',
    css
)

# Write back
with open('app/globals.css', 'w') as f:
    f.write(css)

print("CSS updated successfully.")
