'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';
import WidgetCard from '../WidgetCard';

/* ── Data: 2024 EU 참치 수입 세분 — 단가(€/kg)가 실제 용도를 해독한다 ──────────
   출처: Eurostat Comext 2024 (eu_tuna_freshfrozen_agg.csv)
   신선 황다랑어/눈다랑어만 '진짜 소매 사시미'. 신선 참다랑어 6.71€/kg는 낮아서
   소매 컷이 아니라 축양 이송용 통마리. 냉동필렛은 대부분 캔용 가공 로인.        */

const CAT = {
  sashimi: { color: '#10b981', label: '진짜 소매 사시미' },
  loin:    { color: '#64748b', label: '가공·캔용 로인' },
  ranch:   { color: '#f59e0b', label: '축양 이송 원어' },
};

const segData = [
  { name: '신선 황다랑어', price: 12.6, val: 60,  cat: 'sashimi' },
  { name: '신선 눈다랑어', price: 9.99, val: 7.7, cat: 'sashimi' },
  { name: '냉동필렛로인', price: 8.70, val: 402, cat: 'loin' },
  { name: '신선 참다랑어', price: 6.71, val: 48,  cat: 'ranch' },
  { name: '신선 날개다랑어', price: 5.12, val: 61, cat: 'loin' },
  { name: '냉동 황다랑어', price: 2.95, val: 182, cat: 'loin' },
];

const tooltipStyle = {
  backgroundColor: 'rgba(20, 28, 52, 0.95)', border: '1px solid rgba(var(--w-slate-400-rgb), 0.15)',
  borderRadius: 8, color: 'var(--w-slate-200)', fontSize: '0.78rem', padding: '8px 12px',
};

const SegTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const c = (CAT as any)[d.cat];
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ color: 'var(--w-slate-400)' }}>수입 단가</span>
        <span style={{ fontWeight: 700, color: c.color }}>{d.price} €/kg</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 2 }}>
        <span style={{ color: 'var(--w-slate-400)' }}>수입액 (2024)</span>
        <span style={{ fontWeight: 600 }}>{d.val}M €</span>
      </div>
      <div style={{ marginTop: 4, fontSize: '0.64rem', color: c.color }}>● {c.label}</div>
    </div>
  );
};

export default function SasEuImportSegmentation() {
  return (
    <WidgetCard
      id="W-SAS32"
      title="EU 수입 세분 — 단가가 용도를 말한다"
      description="2024년 EU 참치 수입, 품목별 단가(€/kg)"
      icon={Layers}
      iconColor="#10b981"
      pillar="S4"
      cardDesc="Eurostat Comext 2024 — 신선/냉동·어종별 수입 단가로 진짜 사시미 vs 가공로인 vs 축양원어 식별"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      takeaway={{
        situation: '2024년 EU 참치 수입은 단가로 용도가 갈립니다. 신선 황다랑어(12.6€/kg)·눈다랑어(9.99€/kg)만 진짜 소매 사시미이고, 신선 참다랑어는 6.71€/kg로 낮아 소매 컷이 아니라 축양 이송용 통마리입니다. 금액 최대인 냉동필렛(402M€)·냉동 황다랑어(182M€)는 대부분 캔·가공 로인입니다.',
        actionPlan: '한국이 겨냥할 진짜 소매 사시미 풀은 신선 황다랑어·눈다랑어(합산 약 68M€)로 좁고 단가가 높습니다. 사시미/스테이크 수출 KPI를 평가할 때 냉동필렛·냉동 황다랑어 같은 가공 로인 물량을 제외해야 시장을 과대평가하지 않습니다. 최대 수입국 스페인·이탈리아의 신선 채널을 우선 공략하세요.',
        source: 'Eurostat Comext 2024 (eu_tuna_freshfrozen_agg.csv); 사시미/스테이크 최대 수입국 스페인 208M€·이탈리아 84M€',
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ height: '236px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={segData} layout="vertical" margin={{ top: 4, right: 52, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--w-slate-400-rgb), 0.08)" horizontal={false} />
                <XAxis type="number" domain={[0, 14]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: unknown) => `${v}€`} />
                <YAxis type="category" dataKey="name" width={86} tick={{ fill: 'var(--w-slate-300)', fontSize: 10.5 }} axisLine={false} tickLine={false} />
                <Tooltip content={<SegTooltip />} cursor={{ fill: 'rgba(var(--w-slate-400-rgb), 0.06)' }} />
                <Bar dataKey="price" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={17}>
                  {segData.map((d, i) => <Cell key={i} fill={(CAT as any)[d.cat].color} fillOpacity={0.85} />)}
                  <LabelList dataKey="price" position="right" formatter={(v: unknown) => `${v}€/kg`} style={{ fill: 'var(--w-slate-400)', fontSize: 10, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          {/* 범례 */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', padding: '0 2px' }}>
            {Object.values(CAT).map((c) => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '3px', background: c.color, display: 'inline-block' }} />
                <span style={{ fontSize: '0.66rem', color: 'var(--w-slate-400)' }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
