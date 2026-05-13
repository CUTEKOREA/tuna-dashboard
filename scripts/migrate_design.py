#!/usr/bin/env python3
"""
Design Migration Script: Glassmorphism → IB Terminal (design.md)
Batch-migrates CSS module files and TSX inline styles.
"""
import os
import re
import glob

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMPONENTS = os.path.join(BASE, "components")

# ====== CSS MODULE MIGRATION ======

def migrate_css_file(filepath):
    """Migrate a single CSS module file to IB terminal design."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Remove backdrop-filter lines
    content = re.sub(r'\s*backdrop-filter:[^;]+;', '', content)
    content = re.sub(r'\s*-webkit-backdrop-filter:[^;]+;', '', content)
    
    # 2. Replace oversized border-radius (12px-30px) with 8px
    def fix_radius(m):
        val = int(m.group(1))
        if val >= 12:
            return f'border-radius: 8px'
        return m.group(0)
    content = re.sub(r'border-radius:\s*(\d+)px', fix_radius, content)
    
    # 3. Replace rgba backgrounds with solid equivalents
    # Common dark panel backgrounds
    content = content.replace('rgba(6, 12, 24, 0.75)', '#0F172A')
    content = content.replace('rgba(6, 14, 28, 0.75)', '#0F172A')
    content = content.replace('rgba(6, 14, 28, 0.8)', '#0F172A')
    content = content.replace('rgba(8, 16, 32, 0.7)', '#0F172A')
    content = content.replace('rgba(8, 16, 32, 0.8)', '#0F172A')
    content = content.replace('rgba(2, 6, 23, 0.95)', '#020617')
    content = content.replace('rgba(2, 6, 23, 0.9)', '#020617')
    content = content.replace('rgba(2, 6, 23, 0.85)', '#020617')
    content = content.replace('rgba(2, 14, 28, 0.85)', '#020617')
    content = content.replace('rgba(15, 23, 42, 0.95)', '#0F172A')
    content = content.replace('rgba(15, 23, 42, 0.9)', '#0F172A')
    content = content.replace('rgba(15, 23, 42, 0.8)', '#0F172A')
    content = content.replace('rgba(15, 23, 42, 0.85)', '#0F172A')
    content = content.replace('rgba(30, 41, 59, 0.95)', '#1E293B')
    content = content.replace('rgba(30, 41, 59, 0.9)', '#1E293B')
    content = content.replace('rgba(30, 41, 59, 0.8)', '#1E293B')
    content = content.replace('rgba(30, 41, 59, 0.85)', '#1E293B')
    content = content.replace('rgba(30, 41, 59, 0.5)', '#1E293B')
    content = content.replace('rgba(30, 41, 59, 0.6)', '#1E293B')
    
    # 4. Remove heavy decorative box-shadows (keep simple ones)
    # Remove inset glow shadows
    content = re.sub(r'inset\s+0\s+0\s+\d+px\s+rgba\([^)]+\)', 'none', content)
    
    # 5. Remove text-shadow glow effects
    content = re.sub(r'text-shadow:\s*0\s+0\s+\d+px\s+rgba\([^)]+\)\s*;', '', content)
    
    # 6. Remove decorative ::before/::after with gradient lines  
    # (This is risky to auto-do, so we'll only remove known patterns)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


# ====== TSX INLINE STYLE MIGRATION ======

def migrate_tsx_file(filepath):
    """Migrate TSX inline styles from glassmorphism to IB terminal."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Remove backdropFilter inline styles
    content = re.sub(r",?\s*backdropFilter:\s*'[^']*'", '', content)
    content = re.sub(r",?\s*WebkitBackdropFilter:\s*'[^']*'", '', content)
    content = re.sub(r',?\s*backdropFilter:\s*"[^"]*"', '', content)
    content = re.sub(r',?\s*WebkitBackdropFilter:\s*"[^"]*"', '', content)
    
    # 2. Fix oversized borderRadius in inline styles
    def fix_tsx_radius(m):
        val = m.group(1)
        try:
            num = int(val)
            if num >= 12:
                return f"borderRadius: 8"
        except ValueError:
            pass
        return m.group(0)
    content = re.sub(r'borderRadius:\s*(\d+)', fix_tsx_radius, content)
    
    def fix_tsx_radius_str(m):
        val = m.group(1)
        try:
            num = int(val)
            if num >= 12:
                return f"borderRadius: '8px'"
        except ValueError:
            pass
        return m.group(0)
    content = re.sub(r"borderRadius:\s*'(\d+)px'", fix_tsx_radius_str, content)
    content = re.sub(r'borderRadius:\s*"(\d+)px"', fix_tsx_radius_str, content)
    
    # 3. Replace common rgba backgrounds in inline styles
    content = content.replace("'rgba(6, 12, 24, 0.75)'", "'#0F172A'")
    content = content.replace("'rgba(6, 14, 28, 0.75)'", "'#0F172A'")
    content = content.replace("'rgba(6, 14, 28, 0.8)'", "'#0F172A'")
    content = content.replace("'rgba(8, 16, 32, 0.7)'", "'#0F172A'")
    content = content.replace("'rgba(8, 16, 32, 0.8)'", "'#0F172A'")
    content = content.replace("'rgba(2, 6, 23, 0.95)'", "'#020617'")
    content = content.replace("'rgba(2, 6, 23, 0.9)'", "'#020617'")
    content = content.replace("'rgba(15, 23, 42, 0.95)'", "'#0F172A'")
    content = content.replace("'rgba(15, 23, 42, 0.9)'", "'#0F172A'")
    content = content.replace("'rgba(30, 41, 59, 0.95)'", "'#1E293B'")
    content = content.replace("'rgba(30, 41, 59, 0.9)'", "'#1E293B'")
    content = content.replace("'rgba(30, 41, 59, 0.8)'", "'#1E293B'")
    content = content.replace("'rgba(30, 41, 59, 0.5)'", "'#1E293B'")

    # Double-quoted versions
    content = content.replace('"rgba(6, 12, 24, 0.75)"', '"#0F172A"')
    content = content.replace('"rgba(6, 14, 28, 0.75)"', '"#0F172A"')
    content = content.replace('"rgba(8, 16, 32, 0.7)"', '"#0F172A"')
    content = content.replace('"rgba(15, 23, 42, 0.95)"', '"#0F172A"')
    content = content.replace('"rgba(15, 23, 42, 0.9)"', '"#0F172A"')
    content = content.replace('"rgba(30, 41, 59, 0.95)"', '"#1E293B"')
    content = content.replace('"rgba(30, 41, 59, 0.9)"', '"#1E293B"')
    
    # 4. Remove textShadow glow
    content = re.sub(r",?\s*textShadow:\s*'0\s+0\s+\d+px\s+rgba\([^)]+\)'", '', content)
    content = re.sub(r',?\s*textShadow:\s*"0\s+0\s+\d+px\s+rgba\([^)]+\)"', '', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    print("=" * 60)
    print("Design Migration: Glassmorphism → IB Terminal")
    print("=" * 60)
    
    # Phase 3: CSS Modules
    css_files = glob.glob(os.path.join(COMPONENTS, "*.module.css"))
    css_changed = 0
    for f in sorted(css_files):
        if migrate_css_file(f):
            css_changed += 1
            print(f"  ✅ CSS: {os.path.basename(f)}")
    print(f"\n📦 CSS Modules: {css_changed}/{len(css_files)} files migrated")
    
    # Phase 4: TSX Inline Styles
    tsx_files = glob.glob(os.path.join(COMPONENTS, "*.tsx"))
    tsx_changed = 0
    for f in sorted(tsx_files):
        if migrate_tsx_file(f):
            tsx_changed += 1
            print(f"  ✅ TSX: {os.path.basename(f)}")
    print(f"\n📦 TSX Components: {tsx_changed}/{len(tsx_files)} files migrated")
    
    print(f"\n{'=' * 60}")
    print(f"✅ Total: {css_changed + tsx_changed} files updated")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
