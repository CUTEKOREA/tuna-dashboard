import React, { useEffect, useState } from 'react';
import { 
  Dna, Scissors, PackageSearch, Activity, TrendingUp, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import styles from './MackerelStrategy.module.css';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';

import TakeawayBox from './TakeawayBox';

export default function ChickenPartsWidget() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/chicken/parts')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => console.error(e));
  }, []);

  if (!data) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading Parts Intelligence...</div>;

  const IconMap: Record<string, React.FC<any>> = {
    "Scissors": Scissors,
    "PackageSearch": PackageSearch,
    "Activity": Activity,
    "TrendingUp": TrendingUp
  };

  const yFmt = (v: any) => `$${Number(v).toLocaleString()}`;

  return (
    <div className={styles.glassCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ padding: '8px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
            <Dna size={20} color="#eab308" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>{data.title}</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>{data.subtitle}</p>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          Reliability: {data.reliability}%
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.parts.map((part: any, i: number) => {
            const IconComponent = IconMap[part.icon] || Dna;
            return (
            <div key={i} style={{ 
              background: 'rgba(30, 41, 59, 0.5)', 
              border: '1px solid rgba(255, 255, 255, 0.05)', 
              borderRadius: '12px', 
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconComponent size={18} color="#eab308" />
                  {part.name}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-info)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                  타깃: {part.market}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.82rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.8rem', borderRadius: '8px', borderLeft: '2px solid #ef4444' }}>
                  <div style={{ color: 'var(--color-danger)', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12}/> 브라질 한계</div>
                  <div style={{ color: '#cbd5e1', lineHeight: 1.5 }}>{part.brazil}</div>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.8rem', borderRadius: '8px', borderLeft: '2px solid #10b981' }}>
                  <div style={{ color: 'var(--color-success)', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={12}/> 태국 우위</div>
                  <div style={{ color: '#cbd5e1', lineHeight: 1.5 }}>{part.thailand}</div>
                </div>
              </div>

              <div style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                padding: '0.8rem 1rem', 
                borderRadius: '8px', 
                fontSize: '0.82rem', 
                color: '#94a3b8',
                lineHeight: 1.5,
                border: '1px dashed rgba(255,255,255,0.1)'
              }}>
                <strong style={{ color: '#eab308' }}>💡 전략적 인사이트:</strong> {part.insight}
              </div>
            </div>
            );
          })}
        </div>
        
        {/* Chart rendering side */}
        {data.chartData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '1.2rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc' }}>KCS HS코드 수입단가 추이</h4>
            <div style={{ height: '300px', width: '100%' }}>
              <SafeResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={yFmt} domain={['auto', 'auto']} />
                  <RechartsTooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#f8fafc' }} formatter={yFmt} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {data.chartData.lines.map((l: any, i: number) => (
                    <Line key={i} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  ))}
                </LineChart>
              </SafeResponsiveContainer>
            </div>
            
            <div style={{ marginTop: 'auto' }}>
              <TakeawayBox situation={data.sit} actionPlan={data.strat} source={data.source} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
