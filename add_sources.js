const fs = require('fs');
const file = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/WhelkDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const sources = [
  "FAOSTAT (2022)",
  "DFO Canada (2023)",
  "KOSIS / 통계청 (2022)",
  "KCS 관세청 (2024)",
  "KCS 관세청 (2024)",
  "Seafish UK / KCS",
  "KCS 관세청 (2024)",
  "aT FIS 식품산업통계",
  "aT FIS 식품산업통계",
  "KCS / 한국은행",
  "UK IFCA / MMO",
  "UK IFCA / MMO" // 12th widget
];

let i = 0;
content = content.replace(/<h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>\s*<([a-zA-Z0-9]+) style={{ color: '#3b82f6', width: '20px', height: '20px' }} \/> (.*?)\s*<\/h3>/g, (match, icon, title) => {
  const source = sources[i] || "자체 분석";
  i++;
  // remove trailing parens like (FAO 2022) or (KCS 2024 기준) from title if present
  let cleanTitle = title.replace(/\s*\(.*?\)$/, '');
  return `<h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <${icon} style={{ color: '#3b82f6', width: '20px', height: '20px' }} /> ${cleanTitle}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '-0.2px' }}>출처: ${source}</span>
              </h3>`;
});

fs.writeFileSync(file, content);
console.log(`Updated ${i} widgets with sources.`);
