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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Dna size={20} color="#f59e0b" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>{data.title}</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>{data.subtitle}</p>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          Reliability: {data.reliability}%
        </div>
      </div>

      {/* Chart & Takeaway (Middle) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {data.chartData && (
          <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.15)', padding: '1.2rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#f8fafc' }}>KCS HS코드 수입단가 추이</h4>
            <div style={{ height: '220px', width: '100%' }}>
              <SafeResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={yFmt} domain={['auto', 'auto']} />
                  <RechartsTooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #f59e0b', borderRadius: '8px', color: '#f8fafc' }} formatter={yFmt} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                  {data.chartData.lines.map((l: any, i: number) => {
                    // D-04 Monolithic Override
                    const color = i === 0 ? '#f59e0b' : '#ea580c';
                    return <Line key={i} type="monotone" dataKey={l.key} name={l.name} stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
                  })}
                </LineChart>
              </SafeResponsiveContainer>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <TakeawayBox situation={data.sit} actionPlan={data.strat} source={data.source} />
        </div>
      </div>

      {/* Parts Grid (Bottom) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {data.parts.map((part: any, i: number) => {
          const IconComponent = IconMap[part.icon] || Dna;
          return (
            <div key={i} style={{ 
              background: 'rgba(245, 158, 11, 0.05)', 
              border: '1px solid rgba(245, 158, 11, 0.2)', 
              borderRadius: '12px', 
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconComponent size={18} color="#f59e0b" />
                  {part.name}
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  타깃: {part.market}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.82rem', flex: 1 }}>
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.8rem', borderRadius: '8px', borderLeft: '2px solid rgba(245, 158, 11, 0.6)' }}>
                  <div style={{ color: '#fcd34d', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12}/> 브라질 한계</div>
                  <div style={{ color: '#cbd5e1', lineHeight: 1.5 }}>{part.brazil}</div>
                </div>
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.8rem', borderRadius: '8px', borderLeft: '2px solid rgba(234, 88, 12, 0.6)' }}>
                  <div style={{ color: '#fdba74', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={12}/> 태국 우위</div>
                  <div style={{ color: '#cbd5e1', lineHeight: 1.5 }}>{part.thailand}</div>
                </div>
              </div>

              <div style={{ 
                background: 'rgba(245, 158, 11, 0.1)', 
                padding: '0.8rem 1rem', 
                borderRadius: '8px', 
                fontSize: '0.82rem', 
                color: '#f8fafc',
                lineHeight: 1.5,
                border: '1px dashed rgba(245, 158, 11, 0.3)'
              }}>
                <strong style={{ color: '#fbbf24' }}>💡 전략적 인사이트:</strong> {part.insight}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
