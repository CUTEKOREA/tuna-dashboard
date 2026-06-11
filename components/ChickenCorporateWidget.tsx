'use client';
import React, { useEffect, useState } from 'react';
import { Factory, Snowflake, Award } from 'lucide-react';
import WidgetCard from './WidgetCard';

export default function ChickenCorporateWidget() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/chicken/corporates')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => console.error(e));
  }, []);

  if (!data) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>코퍼레이트 헤게모니 로딩 중...</div>;

  const brazilData = data.data.filter((d: any) => d.company.includes('브라질'));
  const thaiData = data.data.filter((d: any) => d.company.includes('태국'));

  const body = (
    <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
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
  );

  return (
    <WidgetCard
      title={data.title}
      icon={Award}
      iconColor="#ec4899"
      pillar="S2"
      cardDesc={data.subtitle}
      telemetry={{ status: data?.isLive === true ? 'LIVE' : 'STATIC', syncDate: '2026-05-21' }}
      customBody={body}
      takeaway={{ situation: data.sit, actionPlan: data.strat, source: data.source }}
    />
  );
}
