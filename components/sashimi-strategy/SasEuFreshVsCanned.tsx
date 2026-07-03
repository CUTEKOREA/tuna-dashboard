'use client';

import React from 'react';
import { ShoppingBasket, Store } from 'lucide-react';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';
import WidgetCard from '../WidgetCard';

/* ── Data: EU 신선 vs 통조림 참치 가계소비 (프랑스·스페인 2024 패널) ────────────
   출처: FranceAgriMer Conso 2024 / MAPA Panel Consumo 2024 / EUMOFA EFM2025
   신선은 통조림 대비 물량 1/28이지만 단가는 2배 — 얇지만 고마진 프리미엄 층      */

const FRESH = '#10b981';
const CANNED = '#64748b';

// 프랑스 가계소비 신선 vs 통조림 단가(€/kg)
const priceData = [
  { name: '신선 참치', price: 21.8, vol: '2,181t', color: FRESH },
  { name: '통조림 참치', price: 10.8, vol: '61,659t', color: CANNED },
];

const tooltipStyle = {
  backgroundColor: 'rgba(20, 28, 52, 0.95)', border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8, color: '#e2e8f0', fontSize: '0.78rem', padding: '8px 12px',
};

const PriceTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>프랑스 {label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ color: '#94a3b8' }}>가계 평균 단가</span>
        <span style={{ fontWeight: 700, color: d.color }}>{d.price} €/kg</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 2 }}>
        <span style={{ color: '#94a3b8' }}>가계 소비량 (2024)</span>
        <span style={{ fontWeight: 600 }}>{d.vol}</span>
      </div>
    </div>
  );
};

export default function SasEuFreshVsCanned() {
  return (
    <WidgetCard
      id="W-SAS31"
      title="EU 신선 vs 통조림 소비 & 채널"
      description="프랑스·스페인 2024 가계소비 패널 기준"
      icon={ShoppingBasket}
      iconColor="#10b981"
      pillar="S4"
      cardDesc="FranceAgriMer·MAPA 2024 패널 — 신선/통조림 참치 단가·물량 대비 및 유통채널 프리미엄"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      takeaway={{
        situation: '프랑스 가계의 신선 참치 소비는 2,181톤(21.8€/kg)으로 통조림(61,659톤·10.8€/kg) 물량의 28분의 1이지만 단가는 2배입니다. 스페인도 1인당 신선 0.38kg vs 통조림 1.95kg로 신선은 얇은 층이며, EU 전체 참치 1인 소비 2.68kg(수산물 1위)·자급률 35%로 구조적 수입 의존 시장입니다.',
        actionPlan: '신선/사시미급은 물량은 작아도 단가 2배의 고마진 층이며, 생선전문점 채널이 대형마트 대비 20% 이상 비쌉니다. 한국 프리미엄 냉동 사시미는 대형마트(물량 75.8%)가 아닌 생선전문점·외식 채널을 겨냥해야 단가 프리미엄을 실현할 수 있습니다.',
        source: 'FranceAgriMer Conso 2024, MAPA Panel de Consumo 2024, EUMOFA EFM2025',
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {/* 단가 비교 바 */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>프랑스 가계 단가 — 신선 vs 통조림 (€/kg)</div>
            <div style={{ height: '120px', width: '100%' }}>
              <SafeResponsiveContainer width="100%" height="100%">
                <BarChart data={priceData} layout="vertical" margin={{ top: 0, right: 56, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                  <XAxis type="number" domain={[0, 26]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: unknown) => `${v}€`} />
                  <YAxis type="category" dataKey="name" width={76} tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<PriceTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
                  <Bar dataKey="price" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={26}>
                    {priceData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
                    <LabelList dataKey="price" position="right" formatter={(v: unknown) => `${v} €/kg`} style={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </SafeResponsiveContainer>
            </div>
          </div>

          {/* KPI: 스페인 1인당 + EU 자급률 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>스페인 1인 신선</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: FRESH }}>0.38kg</div>
              <div style={{ fontSize: '0.54rem', color: '#64748b' }}>통조림은 1.95kg</div>
            </div>
            <div style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>EU 1인 참치소비</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8' }}>2.68kg</div>
              <div style={{ fontSize: '0.54rem', color: '#64748b' }}>수산물 소비 1위</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>EU 자급률</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ef4444' }}>35%</div>
              <div style={{ fontSize: '0.54rem', color: '#64748b' }}>수입 의존 구조</div>
            </div>
          </div>

          {/* 채널 프리미엄 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '10px' }}>
            <Store size={16} color={FRESH} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
              프랑스 신선참치 채널: 대형마트 <b>75.8%</b> · 생선전문점 8.8% — 전문점 단가 <b style={{ color: FRESH }}>24.6€ vs 마트 20.5€ (+20%)</b>
            </span>
          </div>
        </div>
      }
    />
  );
}
