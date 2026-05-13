import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ReferenceLine, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';
import styles from './MackerelStrategy.module.css';

export const COLORS = ['#f97316', 'var(--color-danger)', 'var(--color-success)', 'var(--color-info)', '#8b5cf6', 'var(--color-warning)', '#06b6d4', '#ec4899', '#64748b', '#22d3ee'];
export const tooltipStyle: React.CSSProperties = { backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' };

export const WidgetCard = ({ title, icon: Icon, term, desc, source, situation, actionPlan, children }: any) => (
  <div className="ds-card-insight" style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0, overflow: 'hidden' }}>
      <Icon size={18} color="#cbd5e1" style={{ flexShrink: 0 }} />
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h3>
      {term && <div style={{ flexShrink: 0 }}><TermTooltip term={term} description={desc} /></div>}
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
