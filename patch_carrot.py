import re

with open('components/CarrotDashboard.tsx', 'r') as f:
    content = f.read()

# Replace hardcoded card styles with ds-card class
# Pattern: style={{ background:'#181818', borderRadius:'8px', border:'none', padding:'1.5rem', boxShadow:'rgba(0,0,0,0.3) 0px 8px 8px', display:'flex', flexDirection:'column', minHeight:'480px' }}
# Or similar variations

pattern1 = r"style=\{\{\s*background:\s*'#181818',\s*borderRadius:\s*'8px',\s*border:\s*'none',\s*padding:\s*'1\.5rem',\s*boxShadow:\s*'rgba\(0,0,0,0\.3\) 0px 8px 8px',\s*display:\s*'flex',\s*flexDirection:\s*'column',\s*minHeight:\s*'480px'\s*\}\}"
content = re.sub(pattern1, "className=\"ds-card\" style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}", content)

pattern2 = r"style=\{\{\s*background:\s*'#181818',\s*borderRadius:\s*'8px',\s*border:\s*'none',\s*padding:\s*'1\.5rem',\s*boxShadow:\s*'rgba\(0,0,0,0\.3\) 0px 8px 8px',\s*display:\s*'flex',\s*flexDirection:\s*'column',\s*minHeight:\s*'520px'\s*\}\}"
content = re.sub(pattern2, "className=\"ds-card\" style={{ display:'flex', flexDirection:'column', minHeight:'520px' }}", content)

pattern3 = r"style=\{\{\s*background:\s*'#181818',\s*borderRadius:\s*'8px',\s*border:\s*'none',\s*padding:\s*'1\.5rem',\s*animation:\s*'fadeIn 0\.3s',\s*boxShadow:\s*'rgba\(0,0,0,0\.3\) 0px 8px 8px'\s*\}\}"
content = re.sub(pattern3, "className=\"ds-card\" style={{ animation:'fadeIn 0.3s' }}", content)

pattern4 = r"style=\{\{\s*marginBottom:\s*'2\.5rem',\s*marginTop:\s*'1\.5rem',\s*background:\s*'#181818',\s*border:\s*'none',\s*borderRadius:\s*'8px',\s*padding:\s*'1\.5rem',\s*boxShadow:\s*'rgba\(0,0,0,0\.3\) 0px 8px 8px'\s*\}\}"
content = re.sub(pattern4, "className=\"ds-card\" style={{ marginBottom:'2.5rem', marginTop: '1.5rem' }}", content)

pattern5 = r"style=\{\{\s*marginBottom:\s*'2rem',\s*background:\s*'#181818',\s*border:\s*'none',\s*borderRadius:\s*'8px',\s*padding:\s*'1\.2rem',\s*display:\s*'grid',\s*gridTemplateColumns:\s*'1fr 1fr',\s*gap:\s*'1\.5rem',\s*boxShadow:\s*'rgba\(0,0,0,0\.3\) 0px 8px 8px'\s*\}\}"
content = re.sub(pattern5, "className=\"ds-card\" style={{ marginBottom:'2rem', padding:'1.2rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}", content)

# Background for the page itself
page_pattern = r"style=\{\{\s*padding:\s*'0 1\.5rem 3rem',\s*color:\s*'#ffffff',\s*minHeight:\s*'100vh',\s*fontFamily:\s*\"'CircularSp', 'Inter', sans-serif\",\s*backgroundColor:\s*'#121212'\s*\}\}"
content = re.sub(page_pattern, "style={{ padding:'0 1.5rem 3rem', color:'var(--text-main)', minHeight:'100vh', fontFamily:\"'CircularSp', 'Inter', sans-serif\" }}", content)

with open('components/CarrotDashboard.tsx', 'w') as f:
    f.write(content)

print('Updated CarrotDashboard.tsx')
