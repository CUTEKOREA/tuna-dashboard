'use client';

import React from 'react';
import { TrendingUp, Globe, Plane, Target, ShieldAlert } from 'lucide-react';

export default function TunaRanchingEducation() {

  return (
    <>
      {/* 🚀 Top Executive Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: '양식 프리미엄', value: '+31.9%', sub: 'vs 야생 어획 단가', color: '#f472b6', icon: <TrendingUp size={16}/> },
          { label: '최고가 타겟 시장', value: '$48.00 / kg', sub: 'UAE 두바이 수입단가', color: '#ec4899', icon: <Globe size={16}/> },
          { label: 'CEPA 관세 절감', value: '5% → 0%', sub: '일본 대비 가격 우위', color: 'var(--color-info)', icon: <Plane size={16}/> },
          { label: '글로벌 쿼터 장벽', value: '단 0.8%', sub: '한국 할당량 (368톤)', color: '#eab308', icon: <Target size={16}/> },
          { label: '프리미엄 진입 장벽', value: '95점', sub: '할랄/초저온 충족 시', color: '#14b8a6', icon: <ShieldAlert size={16}/> },
        ].map((k, i) => (
          <div key={i} style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.25rem', borderRadius: '8px', border: `1px solid ${k.color}33`, borderTop: `3px solid ${k.color}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>{k.icon} {k.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: k.color }}>{k.sub}</div>
          </div>
        ))}
      </div>

    </>
  );
}
