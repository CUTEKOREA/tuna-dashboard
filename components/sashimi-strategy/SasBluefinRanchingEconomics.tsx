'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import { Fish, TrendingUp, PlaneTakeoff } from 'lucide-react';

export default function SasBluefinRanchingEconomics() {
  return (
    <WidgetCard
      id="W-SAS06"
      title="EU 참다랑어 축양 마진 구조 (Ranching Economics)"
      description="저가 활어 매입 → 축양(Fattening) → 고부가 수출의 차익 거래 모델"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="Eurostat 2023·EUMOFA BFT — 지중해 활어 €6.7/kg→축양→일본 수출 €13.3/kg 마진 2배 구조"
      takeaway={{ 
        situation: "EU(특히 스페인/크로아티아 등 지중해 연안)의 참다랑어 축양업은 통째로 생체를 저가(€6.7/kg)에 매입하여 6~8개월간 사육한 뒤, €13.3/kg의 초저온 고부가가치 상품으로 일본 등에 수출하는 확실한 마진 구조를 가집니다.", 
        actionPlan: "단순 원물 포획(Wild Catch)보다, EU 축양장과의 장기 수매(Off-take) 계약을 체결하거나 지분 투자를 통해 부가가치 창출 단계(Fattening)의 이익을 공유하는 구조를 만들어야 합니다.", 
        source: "Eurostat 2023 / EUMOFA BFT Report" 
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', justifyContent: 'center', gap: '24px', paddingTop: '24px', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative', padding: '0 16px' }}>
            {/* Background Line */}
            <div style={{
              position: 'absolute', top: '50%', left: '16px', right: '16px',
              height: '2px', background: 'rgba(255,255,255,0.08)', zIndex: 0, transform: 'translateY(-50%)',
            }} />
            
            {/* Step 1 */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'rgba(30,41,59,0.6)', padding: '16px', borderRadius: '12px',
              border: '1px solid rgba(140,170,255,0.12)',
              width: '31%', margin: '0 8px', zIndex: 10,
              transition: 'transform 0.2s',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
              }}>
                <Fish style={{ color: '#60a5fa' }} size={24} />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', textAlign: 'center', margin: 0 }}>1. 활어 조업 (Live)</h4>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: 'center', lineHeight: 1.3 }}>지중해 해상 포획<br/>(선망선)</p>
              <div style={{ marginTop: '12px', fontSize: '18px', fontWeight: 900, color: '#60a5fa', letterSpacing: '-0.025em' }}>€6.7 / kg</div>
            </div>

            {/* Step 2 */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'rgba(30,41,59,0.6)', padding: '16px', borderRadius: '12px',
              border: '1px solid rgba(140,170,255,0.12)',
              width: '31%', margin: '0 8px', zIndex: 10,
              transition: 'transform 0.2s',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
              }}>
                <TrendingUp style={{ color: '#818cf8' }} size={24} />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', textAlign: 'center', margin: 0 }}>2. 해상 축양 (Fattening)</h4>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: 'center', lineHeight: 1.3 }}>6~8개월 먹이 급여<br/>(지방 축적)</p>
              <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 700, color: '#818cf8' }}>가치 2배 증대</div>
            </div>

            {/* Step 3 */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'rgba(30,41,59,0.6)', padding: '16px', borderRadius: '12px',
              border: '1px solid rgba(140,170,255,0.12)',
              width: '31%', margin: '0 8px', zIndex: 10,
              transition: 'transform 0.2s',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(16,185,129,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
              }}>
                <PlaneTakeoff style={{ color: '#34d399' }} size={24} />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', textAlign: 'center', margin: 0 }}>3. 가공 및 수출 (-60°C)</h4>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: 'center', lineHeight: 1.3 }}>초저온 냉동 후<br/>주로 일본행</p>
              <div style={{ marginTop: '12px', fontSize: '18px', fontWeight: 900, color: '#34d399', letterSpacing: '-0.025em' }}>€13.3 / kg</div>
            </div>
          </div>
        </div>
      }
    />
  );
}
