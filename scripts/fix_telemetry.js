const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../components/GarlicDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

const telemetryCode = `
const TelemetryBadge = ({ status, syncDate }: { status: 'live' | 'synced' | 'static' | undefined; syncDate?: string }) => {
  if (!status) return null;
  const config = {
    live: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#10b981', label: 'LIVE API' },
    synced: { bg: 'rgba(56, 189, 248, 0.15)', border: '#c026d3', text: '#c026d3', label: 'SYNCED' },
    static: { bg: 'rgba(148, 163, 184, 0.15)', border: '#64748b', text: '#94a3b8', label: 'STATIC' }
  }[status];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ 
        background: config.bg, border: \`1px solid \${config.border}\`, color: config.text, 
        padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.5px' 
      }}>
        {config.label}
      </span>
      {syncDate && <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{syncDate}</span>}
    </div>
  );
};
`;

content = content.replace("import TelemetryBadge from './TelemetryBadge';\n", "");
content = content.replace("const KPI_THEMES =", telemetryCode + "\nconst KPI_THEMES =");
content = content.replace(/<TelemetryBadge lastSync="2026.05.17 08:30:00" \/>/g, '<TelemetryBadge status="live" syncDate="2026.05.17" />');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed TelemetryBadge.');
