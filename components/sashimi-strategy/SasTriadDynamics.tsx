'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import { TrendingUp, Anchor, TrendingDown } from 'lucide-react';

export default function SasTriadDynamics() {
  return (
    <WidgetCard
      id="W-SAS01"
      title="글로벌 트라이애드 (미국/EU/일본)"
      description="세계 3대 사시미 시장의 구조적 역할 및 성장/쇠퇴 역학"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="사시미/스테이크 시장 동향"
      takeaway={{ 
        situation: "미국은 수입 주도의 폭발적 성장, EU는 블루핀 축양 수출 허브, 일본은 인구구조 변화로 인한 구조적 수요 감소장으로 재편되었습니다.", 
        actionPlan: "쇠퇴하는 일본 대신, 프리미엄 단가가 형성된 미국 B2C 채널과 EU 축양 밸류체인 진입에 자원을 집중해야 합니다.", 
        source: "Sashimi Market Report 2025" 
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', justifyContent: 'space-between', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', height: '100%' }}>
            
            {/* US */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              background: 'linear-gradient(to bottom right, rgba(16,185,129,0.12), rgba(16,185,129,0.05))',
              padding: '16px', borderRadius: '12px',
              border: '1px solid rgba(16,185,129,0.2)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: '-16px', top: '-16px', opacity: 0.07 }}>
                <TrendingUp size={80} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(16,185,129,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#34d399',
                }}>
                  <TrendingUp size={16} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>미국 (US)</h3>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#34d399', marginBottom: '4px', letterSpacing: '0.05em' }}>성장 엔진 (Growth Engine)</div>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, marginTop: 'auto', margin: 0 }}>
                스시/포케 외식 체인 주도의 폭발적 성장. 비통조림 참치 수입 <strong>$908M</strong> 도달 (2024년 기준 2위).
              </p>
            </div>

            {/* EU */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              background: 'linear-gradient(to bottom right, rgba(99,102,241,0.12), rgba(99,102,241,0.05))',
              padding: '16px', borderRadius: '12px',
              border: '1px solid rgba(99,102,241,0.2)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: '-16px', top: '-16px', opacity: 0.07 }}>
                <Anchor size={80} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#818cf8',
                }}>
                  <Anchor size={16} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>유럽연합 (EU)</h3>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#818cf8', marginBottom: '4px', letterSpacing: '0.05em' }}>생산 기지 (Production Hub)</div>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, marginTop: 'auto', margin: 0 }}>
                지중해 참다랑어 축양 산업 글로벌 거점. 값싼 생체를 매입해 고부가가치 냉동품으로 가공 수출.
              </p>
            </div>

            {/* Japan */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              background: 'linear-gradient(to bottom right, rgba(239,68,68,0.12), rgba(239,68,68,0.05))',
              padding: '16px', borderRadius: '12px',
              border: '1px solid rgba(239,68,68,0.2)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: '-16px', top: '-16px', opacity: 0.07 }}>
                <TrendingDown size={80} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(239,68,68,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f87171',
                }}>
                  <TrendingDown size={16} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>일본 (Japan)</h3>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#f87171', marginBottom: '4px', letterSpacing: '0.05em' }}>구조적 하락 (Legacy)</div>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, marginTop: 'auto', margin: 0 }}>
                2000년 정점 대비 소비량 <strong>-51%</strong> 급감. 초고가 경매 상징성만 남은 성숙/축소 시장.
              </p>
            </div>

          </div>
        </div>
      }
    />
  );
}
