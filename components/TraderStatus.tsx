"use client";

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TermTooltip from './TermTooltip';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const data2026 = [
  { month: 'Jan', FCF: 26344, ITOCHU: 6907, 'TRI MARINE': 3770, 'Direct deal': 18929, Maldives: 0 },
  { month: 'Feb', FCF: 14155, ITOCHU: 0, 'TRI MARINE': 9486, 'Direct deal': 19840, Maldives: 0 },
  { month: 'Mar', FCF: 11700, ITOCHU: 4915, 'TRI MARINE': 2113, 'Direct deal': 11925, Maldives: 0 },
  { month: 'Apr', FCF: 14206, ITOCHU: 9963, 'TRI MARINE': 13933, 'Direct deal': 22181, Maldives: 0 },
  { month: 'May', FCF: 28372, ITOCHU: 3371, 'TRI MARINE': 9413, 'Direct deal': 3485, Maldives: 0 },
];

const COLORS = {
  FCF: 'var(--color-info)',
  ITOCHU: '#8b5cf6',
  'TRI MARINE': '#ec4899',
  'Direct deal': 'var(--color-success)',
  Maldives: '#f59e0b'
};

export default function TraderStatus() {
  return (
    <div style={{
      background: 'var(--panel-bg)',
      border: '1px solid var(--panel-border)',
      borderRadius: '8px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            <TermTooltip term="Current Status by TRADER (2026)" description="월별 트레이더별 반입 물량(MT) 추이" />
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            2026년 월별 트레이더 실적 (Metric Tons)
          </p>
        </div>
      </div>
      
      <div style={{ flex: 1, minHeight: 300 }}>
        <SafeResponsiveContainer width="100%" height={300}>
          <BarChart data={data2026} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" axisLine={false} tickLine={false} />
            <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} tickFormatter={(val) => `${(val/1000)}k`} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{ backgroundColor: '#0F172A', border: '1px solid var(--panel-border)', borderRadius: '8px', color: 'var(--text-main)' }}
              itemStyle={{ fontSize: '13px' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="FCF" stackId="a" fill="url(#a11y-stripe-h)" color={COLORS['FCF']} radius={[0, 0, 4, 4]} />
            <Bar dataKey="ITOCHU" stackId="a" fill="url(#a11y-diag)" color={COLORS['ITOCHU']} />
            <Bar dataKey="TRI MARINE" stackId="a" fill="url(#a11y-dots)" color={COLORS['TRI MARINE']} />
            <Bar dataKey="Direct deal" stackId="a" fill="url(#a11y-stripe-v)" color={COLORS['Direct deal']} />
            <Bar dataKey="Maldives" stackId="a" fill="url(#a11y-cross)" color={COLORS['Maldives']} radius={[4, 4, 0, 0]} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>

      <div data-mobile-stack style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>FCF</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: COLORS['FCF'] }}>94,777 <span style={{ fontSize: '10px' }}>MT</span></div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ITOCHU</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: COLORS['ITOCHU'] }}>25,156 <span style={{ fontSize: '10px' }}>MT</span></div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TRI MARINE</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: COLORS['TRI MARINE'] }}>38,715 <span style={{ fontSize: '10px' }}>MT</span></div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Direct deal</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: COLORS['Direct deal'] }}>76,360 <span style={{ fontSize: '10px' }}>MT</span></div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TOTAL</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>235,008 <span style={{ fontSize: '10px' }}>MT</span></div>
        </div>
      </div>
    </div>
  );
}
