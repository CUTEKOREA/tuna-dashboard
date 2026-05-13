import re
import glob

badge_jsx = r"{w.title} {w.reliability && w.reliability <= 70 && (<span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'#292524', border:'1px solid #f59e0b', color:'#f59e0b', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px' }}>📐 Estimate</span>)}"

files = glob.glob('components/*Dashboard.tsx') + glob.glob('components/*Strategy.tsx') + glob.glob('components/*Widgets.tsx')

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace {w.title} if it's not preceded by title=
    new_content = re.sub(r'(?<!title=)\{w\.title\}', badge_jsx, content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Updated all TSX files.")
