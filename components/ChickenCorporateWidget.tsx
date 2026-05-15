import React, { useEffect, useState } from 'react';
import { Factory, Snowflake, TrendingUp, ShieldAlert, Award, ChevronRight } from 'lucide-react';
import styles from './MackerelStrategy.module.css';
import TakeawayBox from './TakeawayBox';

export default function ChickenCorporateWidget() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/chicken/corporates')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => console.error(e));
  }, []);

  if (!data) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading Corporate Hegemony...</div>;

  const brazilData = data.data.filter((d: any) => d.company.includes('브라질'));
  const thaiData = data.data.filter((d: any) => d.company.includes('태국'));

  return (
    <div className={styles.glassCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '500px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ padding: '8px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <Award size={20} color="#ec4899" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>{data.title}</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>{data.subtitle}</p>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          Reliability: {data.reliability}% (NotebookLM Verified)
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        
        {/* Brazil Section */}
        <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-danger)' }} />
          <h4 style={{ margin: '0 0 1rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Snowflake size={18} color="var(--color-danger)" />
            브라질 (Brazil) 빅3: 원물 중심 모델
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {brazilData.map((co: any, i: number) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: '#e2e8f0' }}>
                  <span>{co.company}</span>
                  <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>냉동육 {co.frozenFocus}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${co.frozenFocus}%`, background: 'var(--color-danger)', height: '100%' }} />
                  <div style={{ width: `${co.processedFocus}%`, background: 'var(--color-info)', height: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thailand Section */}
        <div style={{ background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: 'var(--color-info)' }} />
          <h4 style={{ margin: '0 0 1rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
            태국 (Thailand) 3대장: 프리미엄 가공 모델
            <Factory size={18} color="var(--color-info)" />
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {thaiData.map((co: any, i: number) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: '#e2e8f0' }}>
                  <span style={{ color: 'var(--color-info)', fontWeight: 600 }}>가공육 {co.processedFocus}%</span>
                  <span>{co.company}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${co.frozenFocus}%`, background: 'var(--color-danger)', height: '100%' }} />
                  <div style={{ width: `${co.processedFocus}%`, background: 'var(--color-info)', height: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      <div style={{ marginTop: '0.5rem' }}>
        <TakeawayBox situation={data.sit} actionPlan={data.strat} source={data.source} />
      </div>
    </div>
  );
}
