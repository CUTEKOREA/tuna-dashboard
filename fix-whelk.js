const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components/WhelkDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace imports and wrappers
content = content.replace(/className=\{styles\.dashboardWrapper\}/g, "style={{ padding:'0 1.5rem 3rem', color:'#f8fafc', minHeight:'100vh', fontFamily:\"'Inter',sans-serif\" }}");

// Replace tabs
content = content.replace(/className=\{styles\.tabs\}/g, "style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}");
content = content.replace(/className=\{\`\$\{styles\.tabBtn\} \$\{activeTab === '[^']+' \? styles\.active : ''\}\`\}/g, (match) => {
    const tabMatch = match.match(/activeTab === '([^']+)'/);
    const tab = tabMatch ? tabMatch[1] : '';
    return `style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: activeTab === '${tab}' ? '#3b82f6' : '#181818', color: activeTab === '${tab}' ? '#fff' : '#94a3b8', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}`;
});

// Replace Grid
content = content.replace(/className=\{styles\.gridContainer\}/g, "style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', width: '100%' }}");

// Replace Widget
content = content.replace(/className=\{styles\.widget\}/g, "style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}");

// Replace WidgetTitle
content = content.replace(/className=\{styles\.widgetTitle\}/g, "style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}");

// Replace WidgetIcon
content = content.replace(/className=\{styles\.widgetIcon\}/g, "style={{ color: '#3b82f6', width: '20px', height: '20px' }}");

// Replace chartArea
content = content.replace(/className=\{styles\.chartArea\} style=\{\{ height: '300px' \}\}/g, "style={{ height: '300px', width: '100%', position: 'relative' }}");

// Fix TakeawayBox
content = content.replace(/<TakeawayBox\s*\n\s*title="([^"]+)"\s*\n\s*content="([^"]+)"\s*\/>/g, '<TakeawayBox\n                situation="$1"\n                actionPlan="$2"\n              />');

fs.writeFileSync(file, content);
console.log('Fixed WhelkDashboard');
