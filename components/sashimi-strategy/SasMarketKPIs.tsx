'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

export default function SasMarketKPIs() {
  return (
    <WidgetCard
      id="W-SAS02"
      title="주요 시장 핵심 KPI"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="사시미/스테이크 시장 동향"
      takeaway={{ situation: "미국 시장의 폭발적 성장이 일본의 감소를 상쇄.", actionPlan: "모니터링 유지", source: "Sashimi Market Report 2025" }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px', padding: '16px', height: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '14px', color: '#1e3a8a', fontWeight: 'bold' }}>미국 (US) 비통조림 수입액</div>
            <div style={{ fontSize: '20px', color: '#1d4ed8', fontWeight: '900' }}>$908M</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
            <div style={{ fontSize: '14px', color: '#14532d', fontWeight: 'bold' }}>EU 참다랑어 축양 (Bluefin Ranching)</div>
            <div style={{ fontSize: '20px', color: '#15803d', fontWeight: '900', textAlign: 'right' }}>~26,000t<br/><span style={{ fontSize: '14px', opacity: 0.8 }}>€340M</span></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '14px', color: '#7f1d1d', fontWeight: 'bold' }}>일본 (Japan) 소비량 (2000년 대비)</div>
            <div style={{ fontSize: '20px', color: '#b91c1c', fontWeight: '900', textAlign: 'right' }}>359kt<br/><span style={{ fontSize: '14px', opacity: 0.8 }}>▼ -51%</span></div>
          </div>
        </div>
      }
    />
  );
}
