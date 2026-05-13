const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components/WhelkDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the Tabs div
content = content.replace(/\{\/\* TABS \*\/\}[\s\S]*?\{\/\* CONTENT GRID \*\/\}/, '{/* CONTENT GRID */}');

// 2. Replace activeTab blocks with Section Headers
// Supply
content = content.replace(/\{activeTab === 'supply' && \(\s*<>/, 
`<div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Globe size={20} color="#3b82f6" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>1. 글로벌 수급 (Supply)</h2>
  </div>
  <>`);

// Trade
content = content.replace(/\{activeTab === 'trade' && \(\s*<>/, 
`<div style={{ gridColumn: '1 / -1', marginTop: '2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Navigation size={20} color="#3b82f6" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>2. 무역 구조 (Trade)</h2>
  </div>
  <>`);

// Value
content = content.replace(/\{activeTab === 'value' && \(\s*<>/, 
`<div style={{ gridColumn: '1 / -1', marginTop: '2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Factory size={20} color="#3b82f6" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>3. 밸류체인 & 전략 (Strategy)</h2>
  </div>
  <>`);

// Market
content = content.replace(/\{activeTab === 'market' && \(\s*<>/, 
`<div style={{ gridColumn: '1 / -1', marginTop: '2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Activity size={20} color="#3b82f6" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>4. 시장 & 브랜드 (Market)</h2>
  </div>
  <>`);

// Remove closing `)}`
content = content.replace(/<\/>\s*\)\}/g, '</>');

// Also remove the activeTab state
content = content.replace(/const \[activeTab, setActiveTab\] = useState\('[^']+'\);\n/, '');

fs.writeFileSync(file, content);
console.log('Removed tabs from WhelkDashboard');
