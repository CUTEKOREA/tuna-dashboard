import re

with open('components/CocoaDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Remove the style block
content = re.sub(r'<style>\{`\n\s*\.binance-theme.*?`\}</style>', '', content, flags=re.DOTALL)

# 2. Update the main wrapper
content = content.replace(
    '<div className="binance-theme" style={{ padding:\'0 1.5rem 3rem\', color:\'#EAECEF\', minHeight:\'100vh\', fontFamily:"\'Inter\',sans-serif", backgroundColor:\'#0B0E11\' }}>',
    '<div style={{ padding:\'0 1.5rem 3rem\', color:\'var(--text-primary)\', minHeight:\'100vh\', fontFamily:"\'Inter\',sans-serif", backgroundColor:\'var(--bg-color)\' }}>'
)

# 3. Update the 9-Network wrapper style
content = content.replace(
    "background: 'linear-gradient(145deg, #1E2329 0%, rgba(30,27,75,0.6) 100%)',",
    "background: 'var(--panel-bg)',"
)
content = content.replace(
    "border: '1px solid rgba(139,92,246,0.3)',",
    "border: '1px solid var(--panel-border)',"
)

# 4. Update the SITUATION / TAKEAWAY boxes to match design.md
# We want to find pattern like:
# <div style={{ background:'#181A20', borderLeft:`3px solid #FCD535`, borderRadius:'4px', padding:'12px' }}>
# ...
# </div>
# And replace with var(--surface-0), var(--radius-sm), var(--space-3) var(--space-4) etc.

def replace_takeaway(match):
    return """<div style={{ background:'var(--surface-0)', borderLeft:`1px solid #FCD535`, borderRadius:'var(--radius-sm)', padding:'var(--space-3) var(--space-4)' }}>
              <div style={{ paddingBottom:'10px', borderBottom:'1px solid var(--panel-border)', marginBottom:'10px' }}>
                <h4 style={{ color:'#FCD535', fontSize:'var(--font-sm)', fontWeight:'var(--weight-bold)', margin:'0 0 4px', textTransform:'uppercase' }}>📊 현황 분석 (SITUATION)</h4>"""

content = re.sub(
    r"<div style={{ background:'#181A20', borderLeft:`3px solid #FCD535`, borderRadius:'4px', padding:'12px' }}>\n\s*<div style={{ paddingBottom:'8px', borderBottom:'1px solid #2B3139', marginBottom:'8px' }}>\n\s*<h4 style={{ color:'#848E9C', fontSize:'0.75rem', fontWeight:600, margin:'0 0 4px', textTransform:'uppercase' }}>현황 분석 \(SITUATION\)</h4>",
    replace_takeaway,
    content
)

content = re.sub(
    r"<p style={{ color:'#EAECEF', fontSize:'0.85rem', lineHeight:1.5, margin:0 }}>(.*?)</p>",
    r"<p style={{ color:'var(--text-secondary)', fontSize:'var(--font-base)', lineHeight:1.6, margin:0 }}>\1</p>",
    content
)

def replace_takeaway_header(match):
    return """<h4 style={{ color:'#FCD535', fontSize:'var(--font-sm)', fontWeight:'var(--weight-bold)', margin:'0 0 4px', textTransform:'uppercase' }}>⚡ 전략적 시사점 (EXECUTIVE TAKEAWAY)</h4>"""

content = re.sub(
    r"<h4 style={{ color:'#FCD535', fontSize:'0.75rem', fontWeight:600, margin:'0 0 4px', textTransform:'uppercase' }}>전략적 시사점 \(EXECUTIVE TAKEAWAY\)</h4>",
    replace_takeaway_header,
    content
)

# 5. Fix card border bottom
content = content.replace(
    "borderBottom:'1px solid #2B3139'",
    "borderBottom:'1px solid var(--panel-border)'"
)
content = content.replace(
    "color:'#EAECEF'",
    "color:'var(--text-primary)'"
)
content = content.replace(
    "color:'#848E9C'",
    "color:'var(--text-tertiary)'"
)

with open('components/CocoaDashboard.tsx', 'w') as f:
    f.write(content)
