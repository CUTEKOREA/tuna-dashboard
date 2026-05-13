const fs = require('fs');
const file = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/CarrotDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace glassCard
content = content.replace(/className=\{styles\.glassCard\} style=\{\{ /g, "style={{ background:'#181818', borderRadius:'8px', border:'none', padding:'1.5rem', boxShadow:'rgba(0,0,0,0.3) 0px 8px 8px', ");

// 2. Replace Section headers
content = content.replace(/background:`linear-gradient\(180deg,.*?\)`/g, "background:'#1ed760'");
content = content.replace(/color:'#f8fafc'\s*\}\}>\{SECTIONS\[(\d)\]\.title\}/g, "color:'#ffffff' }}>{SECTIONS[$1].title}");
content = content.replace(/color:'#64748b'\s*\}\}>\{SECTIONS\[(\d)\]\.desc\}/g, "color:'#b3b3b3' }}>{SECTIONS[$1].desc}");

// 3. Update generic title colors to white
content = content.replace(/color:'(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})'(,\s*margin:'0 0 0\.4rem'\s*\})/g, "color:'#ffffff'$2");

// 4. Update the "LIVE API" badges inside widget titles
content = content.replace(/background:'rgba\(\d+,\d+,\d+,0\.15\)', color:'(#[0-9a-fA-F]{6})', padding:'2px 6px', borderRadius:'4px', border:'1px solid rgba\(\d+,\d+,\d+,0\.3\)'/g, "background:'#1f1f1f', color:'$1', padding:'2px 8px', borderRadius:'500px', border:'none'");

// 5. Takeaway Box inside CarrotDashboard needs Spotify style? Wait, TakeawayBox is a separate component imported. Let's leave TakeawayBox for now as it might be shared.

fs.writeFileSync(file, content, 'utf8');
console.log("Replacements done.");
