'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { Tag } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const ecolabelData = [
  { label: 'MSC', awareness: 54, trust: 75, purchase: 44 },
  { label: 'Dolphin-Safe', awareness: 68, trust: 65, purchase: 38 },
  { label: 'ASC', awareness: 22, trust: 60, purchase: 15 },
  { label: 'Friend of Sea', awareness: 12, trust: 45, purchase: 8 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#0a0f1f',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        color: '#e2e8f0',
        fontSize: '0.875rem',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>{label}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontWeight: 600 }}>
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span>{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function MscEcolabelCompetition() {
  const body = (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
      {/* Chart */}
      <div style={{ height: '320px', width: '100%' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={ecolabelData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.78rem' }} iconType="circle" />
            <Bar dataKey="awareness" name="인지도" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false} />
            <Bar dataKey="trust" name="신뢰도" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false} />
            <Bar dataKey="purchase" name="구매 전환" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>

      {/* KPI Callout */}
      <div style={{
        marginTop: '1rem',
        background: 'rgba(167,139,250,0.1)',
        border: '1px solid rgba(167,139,250,0.2)',
        borderRadius: '0.75rem',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <div style={{
          fontSize: '1.875rem',
          fontWeight: 900,
          color: '#a78bfa',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}>
          +81.3%
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '2px' }}>
            MSC + Dolphin-Safe 이중라벨 프리미엄
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            헤도닉 가격 모델 기준, 단독 MSC(+44.6%) 대비 약 2배의 프리미엄 시너지 효과
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC12"
      title="에코라벨 경쟁 포지션 비교"
      description="글로벌 4대 수산물 인증 라벨의 인지도 및 구매전환율 분석"
      icon={Tag}
      iconColor="#38bdf8"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="글로벌 마케팅 지표"
      takeaway={{
        situation: "Dolphin-Safe가 단순 인지도(68%) 1위이나 구매 전환(38%)에서는 MSC(44%)에 뒤집니다. MSC는 '인지도 대비 구매 전환율'이 81.5%로 매우 높아 마니아층의 충성도가 압도적입니다.",
        actionPlan: "글로벌 B2C 시장에서는 MSC 단독 라벨링보다 Dolphin-Safe와의 이중 라벨 전략이 프리미엄 극대화에 유효합니다. 수출용 캔 참치 제품에 두 라벨의 동시 표기를 표준화하여 +81% 가격 프리미엄을 확보하세요.",
        source: "MSC UK Consumer Insights 2024",
      }}
      customBody={body}
    />
  );
}
