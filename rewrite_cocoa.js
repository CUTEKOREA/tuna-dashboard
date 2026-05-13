const fs = require('fs');

let content = fs.readFileSync('components/CocoaDashboard.tsx', 'utf8');

// 1. Grid and Axes
content = content.replace(/<CartesianGrid strokeDasharray="3 3" stroke="#2B3139" vertical={false} \/>/g, '<CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />');
content = content.replace(/const xAxisTextProps = \{ stroke: "#64748b", tick: \{ fontSize: 9 \} \};/g, 'const xAxisTextProps = { stroke: "#B3B3B3", tick: { fontSize: 9 } };');
content = content.replace(/const yAxisProps = \{ stroke: "#64748b", tick: \{ fontSize: 9 \} \};/g, 'const yAxisProps = { stroke: "#B3B3B3", tick: { fontSize: 9 } };');
content = content.replace(/stroke="#848E9C"/g, 'stroke="#B3B3B3"');
content = content.replace(/color:'var\(--text-primary\)'/g, "color:'#FFFFFF'");
content = content.replace(/color:'var\(--text-tertiary\)'/g, "color:'#B3B3B3'");
content = content.replace(/color: '#94a3b8'/g, "color: '#B3B3B3'");

// 2. Sections
content = content.replace(/color: "#FCD535"/g, 'color: "#1ed760"');
content = content.replace(/background:`linear-gradient\(180deg,\$\{SECTIONS\[(\d+)\]\.color\},\$\{SECTIONS\[(\d+)\]\.color\}99\)`/g, 'background: SECTIONS[$1].color');
content = content.replace(/borderRadius:'2px'/g, "borderRadius: '4px'");


// 3. Widget Card structural replacements
const widgetRegex = /<div className=\{styles\.glassCard\} style=\{\{ display:'flex', flexDirection:'column', minHeight:'480px' \}\}>[\s\S]*?<div style=\{\{ marginBottom:'1\.2rem', borderBottom:'1px solid var\(--panel-border\)', paddingBottom:'0\.8rem' \}\}>[\s\S]*?<h3 style=\{\{ display:'flex', alignItems:'center', gap:'0\.6rem', fontSize:'0\.95rem', fontWeight:600, color:'var\(--text-primary\)', margin:'0 0 0\.4rem' \}\}>([\s\S]*?)<\/h3>/g;

content = content.replace(widgetRegex, (match, headerContent) => {
    // Modify headerContent to extract the span with source and convert it to badges
    let newHeaderContent = headerContent;
    const sourceRegex = /<span style=\{\{ fontSize:'0\.75rem', color:'var\(--text-tertiary\)', fontWeight:400 \}\}>\((.*?)\s*\|\s*출처:\s*(.*?)\)<\/span>/;
    const matchSource = headerContent.match(sourceRegex);
    
    if (matchSource) {
        const unit = matchSource[1];
        const source = matchSource[2];
        newHeaderContent = headerContent.replace(sourceRegex, 
            `<span style={{ background: '#282828', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', color: '#B3B3B3', fontWeight: 600, marginLeft: 'auto' }}>${unit}</span>` +
            `\n              <span style={{ background: 'rgba(30,215,96,0.1)', color: '#1ed760', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, marginLeft: '8px' }}>${source}</span>`
        );
    }

    return `<div style={{ background: '#181818', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 0.4rem' }}>${newHeaderContent}</h3>`;
});

// Also remove `className={styles.glassCard}` globally if any left over
content = content.replace(/className=\{styles\.glassCard\}/g, '');

fs.writeFileSync('components/CocoaDashboard.tsx', content);
console.log('Script completed');
