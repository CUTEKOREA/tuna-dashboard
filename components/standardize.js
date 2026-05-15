const fs = require('fs');
const path = require('path');

const dir = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components';
const files = fs.readdirSync(dir).filter(f => f.startsWith('Salmon') && f.endsWith('.tsx')).map(f => path.join(dir, f));

for (const file of files) {
  if (file.includes('SalmonDashboard') || file.includes('SalmonLiveTicker') || file.includes('SalmonInsightWidgets')) continue;

  let content = fs.readFileSync(file, 'utf8');

  // 1. Standardize root div styling
  content = content.replace(/<div style=\{\{[\s\S]*?background:\s*['"]#181818['"][\s\S]*?\}\}([^>]*)>/, 
    '<div className="ds-card" style={{display: "flex", flexDirection: "column", minHeight: "480px", background: "#181818", borderRadius: "8px", boxShadow: "rgba(0,0,0,0.3) 0px 8px 8px", border: "none", padding: "1.5rem"}} $1>');

  // 2. Standardize h3 header logic
  content = content.replace(/<h3 style=\{\{[\s\S]*?\}\}>([\s\S]*?)<\/h3>/, (match, inner) => {
    let cleanInner = inner.trim();
    let badge = '';
    
    // Extract [Live 🟢] or [Estimate 📐]
    if (cleanInner.includes('[Live 🟢]')) {
      cleanInner = cleanInner.replace('[Live 🟢]', '').trim();
      badge = `<span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-success)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>LIVE API</span>`;
    } else if (cleanInner.includes('[Estimate 📐]')) {
      cleanInner = cleanInner.replace('[Estimate 📐]', '').trim();
      badge = `<span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-warning)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>ESTIMATE</span>`;
    }
    
    return `<h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>\n  ${cleanInner} ${badge}\n</h3>`;
  });

  // 3. Standardize subtitle (<p> after h3)
  content = content.replace(/<p style=\{\{[\s\S]*?\}\}>([\s\S]*?)<\/p>/, (match, inner) => {
    // only if it's the subtitle directly after h3 (we'll assume the first p is the subtitle)
    if (match.includes('margin: 0') || match.includes('color: \'#94a3b8\'') || match.includes('color: "#94a3b8"')) {
      return `<p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>${inner.trim()}</p>`;
    }
    return match;
  });

  fs.writeFileSync(file, content, 'utf8');
  console.log('Processed:', file);
}
