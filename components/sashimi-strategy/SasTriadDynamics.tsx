'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

export default function SasTriadDynamics() {
  return (
    <WidgetCard
      id="W-SAS01"
      title="글로벌 트라이애드 동인 (미국/EU/일본)"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="사시미/스테이크 시장 동향"
      takeaway={{ situation: "미국은 캔 참치 외 프리미엄 성장 동력, EU는 지중해 축양 생산기지, 일본은 구조적 하락장.", actionPlan: "모니터링 유지", source: "Sashimi Market Report 2025" }}
      customBody={
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px', height: '100%', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>🇺🇸 미국</h3>
            <p style={{ margin: '0', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
              <strong>성장 엔진 (Growth Engine)</strong><br/><br/>
              수입 주도형(Import driven) 구조로 횟감/스테이크용 시장의 폭발적 성장세.
            </p>
          </div>
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>🇪🇺 유럽연합 (EU)</h3>
            <p style={{ margin: '0', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
              <strong>생산 기지 (Production Hub)</strong><br/><br/>
              지중해 연안을 중심으로 한 참다랑어 축양(Ranching) 산업의 글로벌 거점.
            </p>
          </div>
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>🇯🇵 일본</h3>
            <p style={{ margin: '0', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
              <strong>전통 벤치마크 (Legacy)</strong><br/><br/>
              소비량 감소 및 인구 노령화로 인한 구조적 하락장(Declining).
            </p>
          </div>
        </div>
      }
    />
  );
}
