import React from 'react';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';

export const COLORS = ['#f97316', 'var(--color-danger)', 'var(--color-success)', 'var(--color-info)', '#8b5cf6', 'var(--color-warning)', '#06b6d4', '#ec4899', '#64748b', '#22d3ee'];
export const tooltipStyle: React.CSSProperties = { backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' };

export const WidgetCard = ({ title, icon: Icon, term, desc, source, situation, actionPlan, telemetry, children }: any) => (
  <div className="ds-card-insight" style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0, overflow: 'hidden' }}>
      <Icon size={18} color="#cbd5e1" style={{ flexShrink: 0 }} />
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h3>
      {term && <div style={{ flexShrink: 0 }}><TermTooltip term={term} description={desc} /></div>}
      {telemetry?.status && (
        <span style={{ flexShrink: 0, marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '2px 6px' }} title={telemetry.syncDate ? `동기화: ${telemetry.syncDate}` : undefined}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: telemetry.status === 'LIVE' ? 'var(--color-success)' : '#64748b' }} />
          {telemetry.status}{telemetry.syncDate ? ` · ${telemetry.syncDate}` : ''}
        </span>
      )}
    </div>
    <div style={{ flex: 1, minHeight: '280px', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'transparent', padding: '16px' }}>
        {children}
      </div>
    </div>
    <div style={{ flexShrink: 0, marginTop: '12px' }}>
      <TakeawayBox source={source} situation={situation} actionPlan={actionPlan} />
    </div>
  </div>
);
